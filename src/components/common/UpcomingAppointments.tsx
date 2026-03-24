import { SquareArrowOutUpRight } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function UpcomingAppointments({ total, percentage, data }: any) {
    const router = useRouter()

    const onClickHandler = () => {
        router.push('/appointments')
    }
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-800 shadow-md">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold mb-4">Upcoming Appointments (Next 5 Days)</h3>
      <button className="text-sm text-green-400 hover:underline" onClick={onClickHandler}>
        <SquareArrowOutUpRight className="w-4 h-4 text-gray-500" />
        </button>
        </div>
      <p className="text-3xl font-bold text-white">{total}</p>
      <p className="text-gray-400 text-sm">
        Next 5 Days{" "}
        <span className="text-green-400 font-semibold">+{percentage}%</span>
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <XAxis dataKey="day" stroke="#9ca3af" />
          <Tooltip />
          <Bar dataKey="value" fill="#60a5fa" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-gray-400 text-sm text-center md:mt-10">Bar Graph distribution of Appointments coming in the next 5 days</p>
    </div>
  );
}
