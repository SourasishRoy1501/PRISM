import React, { useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Clock, User, Phone, Plus, Search, Check, Calendar, IdCard, CalendarCheck, EyeIcon, Trash2, ArrowLeft } from 'lucide-react';
import Calender from '@/components/modal/Calender';
import { useAuth } from '@/hooks/AuthContext';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/common/Navbar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/router';
import AddPatient from '../patients/add';
import AddPatientModal from '@/components/modal/AddPatient';

type PatientRow = {
    patient_id: string
    doctor_id: string
    condition_type: 'male_infertility' | 'male_sexual_dysfunction'
    first_visit_date: string
    last_visit_date: string | null
    full_name: string
    age?: number
}

const CONDITION_BADGE: Record<string, string> = {
    male_infertility: 'bg-indigo-900/40 text-indigo-300 border border-indigo-700',
    male_sexual_dysfunction: 'bg-purple-900/40 text-purple-300 border border-purple-700',
}

const AppointmentsPage = () => {
    const router = useRouter()
    const { user } = useAuth()
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [allRows, setAllRows] = useState<PatientRow[]>([])
    const [loading, setLoading] = useState(false)
    const [openAddPatient, setOpenAddPatient] = useState(false)
    
    // Reschedule state
    const [isRescheduling, setIsRescheduling] = useState(false);
    const [rescheduleAppointment, setRescheduleAppointment] = useState<any>(null);
    const [newRescheduleDate, setNewRescheduleDate] = useState(null);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const fetchPatients = async () => {
        if (!user) return
        setLoading(true)
        try {
          const params = new URLSearchParams()
          params.set('doctor_id', user.id)
          params.set('page', '1')
          params.set('page_size', '1000')
    
          const res = await fetch(`${apiBase}/api/patients?${params.toString()}`)
          const json = await res.json()
          if (!res.ok) throw new Error(json?.error || 'Failed to load')
          const items: PatientRow[] = (json.items || []).map((it: any) => {
            const fullName = it.full_name || it.crf_data_json?.demographics?.fullName || ''
            let age: number | undefined = it.age
            return {
              patient_id: it.patient_id,
              doctor_id: it.doctor_id,
              condition_type: it.condition_type,
              first_visit_date: it.first_visit_date,
              last_visit_date: it.last_visit_date,
              full_name: fullName,
              age,
            }
          })
          setAllRows(items)
        } catch (e: any) {
            console.log('Error in fetching patients ', e?.message)
        } finally {
          setLoading(false)
        }
    }

    useEffect(() => {
        if (user?.id) {
            fetchPatients()
        }
    }, [user?.id])

    const [debouncedQ, setDebouncedQ] = useState('')
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQ(searchQuery?.trim()?.toLowerCase()), 300)
        return () => clearTimeout(t)
    }, [searchQuery])

    const filteredPatients = useMemo(() => {
        if(debouncedQ) {
            return allRows.filter(patient =>
                patient?.full_name?.toLowerCase().includes(searchQuery?.toLowerCase())
            )
        }
    }, [debouncedQ, allRows, searchQuery])

    const { data: appointments, isLoading, refetch } = useQuery({
        queryKey: ["appointments", user?.id, currentDate.getFullYear(), currentDate.getMonth()],
        queryFn: async () => {
          const res = await fetch(`${apiBase}/api/doctor/appointments?year=${currentDate.getFullYear()}&month=${currentDate.getMonth()+1}&doctor_id=${user?.id}`);
          if (!res.ok) throw new Error('Failed to fetch appointments');
          return res.json();
        },
        enabled: !!user?.id && !!currentDate,
        staleTime: 1000 * 60 * 5,
    });

    const handleDateClick = (day: number | React.SetStateAction<null>) => {
        if (day) {
            if (isRescheduling) {
                setNewRescheduleDate(day);
            } else {
                setSelectedDate(day);
            }
        }
    };

    const handleAddAppointment = async (form=null) => {
        if (selectedPatient || form) {
            const payload = {
                addPatient: form === null ? false : true,
                user_id: user?.id,
                condition_type: form?.condition_type,
                fullName: form?.fullName,
                selectedDate: currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + selectedDate,
                age: form?.age,
                patient_id: selectedPatient?.patient_id
            }

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/doctor/scheduleAppointment`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({...payload})
                })
                const json = await res.json()
                if (!res.ok) throw new Error(json?.error || 'Failed to save')
                setShowSuccess(true)
                refetch()
            } catch (err: any) {
                console.error(err)
            }

            setShowModal(false);
            setShowSuccess(true);
            setSearchQuery('');
            setSelectedPatient(null);
            setSelectedTime('');
            setOpenAddPatient(false);
          
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };
    
    const openModal = () => {
        if (!selectedDate) {
            alert('Please select a date first');
            return;
        }
        setShowModal(true);
    };

    const handleAddPatient = () => {
        setShowModal(false)
        setOpenAddPatient(true)
    }

    const handleDeleteAppointment = async (followupId: string) => {
        try {
            const res = await fetch(`${apiBase}/api/doctor/deleteAppointment`, {
                method: 'DELETE',
                headers: { 'Content-type': 'application/json'},
                body: JSON.stringify({followupId})
            })
            if (res.ok) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
                refetch();
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
        }
    }

    const handleStartReschedule = (appointment: any) => {
        setIsRescheduling(true);
        setRescheduleAppointment(appointment);
        setNewRescheduleDate(null);
    }

    const handleCancelReschedule = () => {
        setIsRescheduling(false);
        setRescheduleAppointment(null);
        setNewRescheduleDate(null);
    }

    const handleConfirmReschedule = async () => {
        if (!newRescheduleDate || !rescheduleAppointment) return;

        const newScheduledDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(newRescheduleDate).padStart(2, '0')}`;

        try {
            const res = await fetch(`${apiBase}/api/doctor/rescheduleAppointment`, {
                method: 'PATCH',
                headers: { 'Content-type': 'application/json'},
                body: JSON.stringify({
                    followupId: rescheduleAppointment.followupId,
                    newScheduledDate: newScheduledDate
                })
            });

            if (res.ok) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
                handleCancelReschedule();
                refetch();
            }
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            handleCancelReschedule();
        }
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-900">
                <Navbar />
                <div className="max-w-7xl mx-auto mb-6">
                    {/* Success Message */}
                    {showSuccess && (
                        <div className="fixed top-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slideIn z-50 border border-emerald-400">
                            <div className="bg-white rounded-full p-1">
                                <Check className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="font-semibold">
                                    {isRescheduling ? 'Appointment Rescheduled!' : 'Appointment Scheduled!'}
                                </p>
                                <p className="text-sm text-emerald-100">Patient has been notified</p>
                            </div>
                        </div>
                    )}

                    {/* Reschedule Banner */}
                    {isRescheduling && (
                        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white px-6 py-4 shadow-2xl z-40 border-b-4 border-orange-600">
                            <div className="max-w-7xl mx-auto flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-6 h-6" />
                                    <div>
                                        <p className="font-semibold text-lg">Rescheduling Appointment</p>
                                        <p className="text-sm text-orange-100">
                                            Patient: {rescheduleAppointment?.full_name} - Select a new date on the calendar
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCancelReschedule}
                                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className={`max-w-7xl mx-auto mb-6 transition-all duration-300 ${isRescheduling ? 'mt-32' : 'mt-6'}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="lg:text-3xl font-bold text-white">Appointments</h1>
                                <p className="text-gray-400 mt-1">
                                    {isRescheduling 
                                        ? 'Choose a new date to reschedule the appointment' 
                                        : 'Manage your patient appointments'
                                    }
                                </p>
                            </div>
                            {!isRescheduling && (
                                <button
                                    onClick={openModal}
                                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-emerald-500/30"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Appointment
                                </button>
                            )}
                            {isRescheduling && newRescheduleDate && (
                                <button
                                    onClick={handleConfirmReschedule}
                                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                                >
                                    <Check className="w-5 h-5" />
                                    Confirm Reschedule
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 grid lg:grid-cols-2 gap-3 mb-2">
                        {/* Calendar Section */}
                        <div className={`space-y-4 transition-all duration-300 ${isRescheduling ? 'ring-4 ring-orange-500 rounded-xl' : ''}`}>
                            <Calender 
                                handleDateClick={handleDateClick} 
                                selectedDate={isRescheduling ? newRescheduleDate : selectedDate} 
                                currentDate={currentDate} 
                                setCurrentDate={setCurrentDate} 
                                appointment={appointments} 
                                isLoading={isLoading}
                            />
                        </div>

                        <div className="space-y-4">
                            {/* Appointments List */}
                            <div className="bg-gray-900 rounded-xl border border-gray-800 flex flex-col max-h-[calc(100vh-12rem)] min-h-[calc(100vh-12rem)]">
                                {/* Header - Fixed */}
                                <div className="p-6 border-b border-gray-800">
                                    <h3 className="text-xl font-semibold text-white">
                                        {selectedDate
                                            ? `${monthNames[currentDate.getMonth()]} ${selectedDate}, ${currentDate.getFullYear()}`
                                            : 'Select a date'
                                        }
                                    </h3>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                    <div className="space-y-3">
                                        {selectedDate && appointments?.response?.[selectedDate]?.count > 0 ? (
                                            appointments?.response?.[selectedDate]?.patientDetails?.map((apt?: any) => (
                                                <div 
                                                    key={apt?.[0]?.patient_id} 
                                                    className={`bg-gray-800 rounded-lg p-4 border transition-all duration-200 ${
                                                        isRescheduling && rescheduleAppointment?.followupId === apt?.[0]?.followupId
                                                            ? 'border-orange-500 ring-2 ring-orange-500/50 bg-orange-500/10'
                                                            : 'border-gray-700 hover:border-gray-600'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between mb-0">
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-emerald-500" />
                                                            <h4 className="font-semibold text-white text-sm">{apt?.[0]?.full_name}</h4>
                                                        </div>
                                                        {!isRescheduling && (
                                                            <div className='flex items-center gap-2'>
                                                                <a 
                                                                    title="Open CRF" 
                                                                    href={`/patient?patient_id=${apt?.[0]?.patient_id}`} 
                                                                    className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-green-300 hover:border-green-500 transition-colors"
                                                                >
                                                                    <EyeIcon className="w-4 h-4" />
                                                                </a>
                                                                <button 
                                                                    title="Reschedule appointment" 
                                                                    onClick={() => handleStartReschedule(apt?.[0])}
                                                                    className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-orange-300 hover:border-orange-500 transition-colors"
                                                                >
                                                                    <Calendar className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    title="Delete appointment" 
                                                                    onClick={() => handleDeleteAppointment(apt?.[0]?.followupId)}
                                                                    className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-red-300 hover:border-red-500 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                                        <span className={`text-xs px-2 py-1 rounded ${CONDITION_BADGE[apt?.[0]?.condition_type]}`}>
                                                            {apt?.[0]?.condition_type}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                                        <IdCard className="w-4 h-4 text-gray-500" />
                                                        <span>{apt?.[0]?.patient_id}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                                        <CalendarCheck className="w-4 h-4 text-gray-500" />
                                                        <span>{apt?.[0]?.first_visit_date}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : selectedDate ? (
                                            <div className="text-center py-12">
                                                <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                                                <p className="text-gray-500 text-sm">No appointments on this date</p>
                                                <p className="text-gray-600 text-xs mt-2">Click "Add Appointment" to schedule</p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                                                <p className="text-gray-500 text-sm">Select a date to view appointments</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Add Appointment Modal */}
                    {showModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-40">
                            <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-800 animate-fadeIn">
                                <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Add Appointment</h2>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {monthNames[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
                                    >
                                        <X className="w-5 h-5 text-gray-400 hover:text-white" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Search Patient</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search by name or phone..."
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {searchQuery && (
                                        <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                                            {filteredPatients?.length > 0 ? (
                                                filteredPatients?.map((patient: any) => (
                                                    <button
                                                        key={patient.id}
                                                        onClick={() => {
                                                            setSelectedPatient(patient);
                                                            setSearchQuery(patient?.full_name);
                                                        }}
                                                        className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                                                            selectedPatient?.id === patient.id
                                                                ? 'bg-emerald-500/20 border-emerald-500/50'
                                                                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                                        }`}
                                                    >
                                                        <p className="text-white font-medium text-sm">{patient?.full_name}</p>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="text-center py-4">
                                                    <p className="text-gray-500 text-sm mb-3">No patient found</p>
                                                </div>
                                            )}
                                            <button 
                                                className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-2 mx-auto transition-colors" 
                                                onClick={handleAddPatient}
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add New Patient
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-t border-gray-800 flex gap-3">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-6 py-2.5 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 border border-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleAddAppointment()}
                                        disabled={!selectedPatient}
                                        className={`flex-1 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                                            selectedPatient
                                                ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105'
                                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        Schedule
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {openAddPatient && (
                        <AddPatientModal 
                            openAddPatient={openAddPatient} 
                            setOpenAddPatient={setOpenAddPatient} 
                            setShowModal={setShowModal} 
                            handleAddAppointment={handleAddAppointment}
                        />
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AppointmentsPage;