import React, { useEffect, useMemo, useState } from 'react';
import ConditionDistribution from "@/components/common/ConditionDistribution";
import Navbar from "@/components/common/Navbar";
import PatientStats from "@/components/common/PatientStats";
import RecentActivities from "@/components/common/RecentActivities";
import UpcomingAppointments from "@/components/common/UpcomingAppointments";
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/hooks/AuthContext';
import { useQuery } from '@tanstack/react-query';

export default function Dashboard() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const { user } = useAuth()

    useEffect(() => {
        try {
            fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/auth/profile`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: user.id, name: user?.user_metadata?.name, email: user?.email })
            })
          } catch {}
    }, [user])

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // months are 0-based
    const dd = String(today.getDate()).padStart(2, '0');
    const formatted = `${yyyy}-${mm}-${dd}`;

    const { data: apiData, isLoading } = useQuery({
        queryKey: [user?.id, formatted],
        queryFn: async () => {
          const res = await fetch(`${apiBase}/api/doctor/getRecentAppointments?doctor_id=${user?.id}&firstDay=${formatted}`);
          if (!res.ok) throw new Error('Failed to fetch appointments');
          return res.json();
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5,
    });

    const generateNextFiveDays = () => {
        const daysArray = [];
        const today = new Date();
        console.log(apiData)
        for (let i = 0; i < 5; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          const dayString = date.toISOString().split("T")[0]
          daysArray.push({
            day: dayString, // format yyyy-mm-dd
            value: apiData?.countData?.[dayString] || 0,
          });
        }
      
        return daysArray;
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-900 text-gray-100">
            <Navbar />

            <main className="container-page py-8 space-y-8">
                {/* Stats row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <PatientStats total={apiData?.totalCount} label="Total Patients" />
                <PatientStats total={apiData?.infertilityCount} label="Infertility Patients" />
                <PatientStats total={apiData?.dysfunctionCount} label="Dysfunction Patients" />
                <PatientStats total={apiData?.appointmentCount} label="Scheduled Apointments" />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ConditionDistribution
                    total={apiData?.totalCount}
                    data={[
                    { label: "Male Infertility", value: apiData?.infertilityCount*100/apiData?.totalCount, color: "#1d4ed8" },
                    { label: "Male Sexual Dysfunction", value: apiData?.dysfunctionCount*100/apiData?.totalCount, color: "#06b6d4" },
                    ]}
                />
                <UpcomingAppointments
                    total={apiData?.nextDaysCount}
                    percentage={2}
                    data={generateNextFiveDays()}
                />
                </div>

                {/* Recent Activities */}
                <RecentActivities
                patients={apiData?.recentAppointmentsData}
                />
            </main>
            </div>
        </ProtectedRoute>
    );
}
