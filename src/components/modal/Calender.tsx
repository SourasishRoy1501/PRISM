import { isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react'

type CalenderProps = {
    handleDateClick: (day: number | React.SetStateAction<null>) => void;
    selectedDate: number | null;
    setCurrentDate: (e: any) => void;
    currentDate: any;
    appointment: any;
    isLoading: boolean;
}

const Calender: React.FC<CalenderProps> = ({handleDateClick, selectedDate, currentDate, setCurrentDate, appointment, isLoading}) => {
    const [hoveredDay, setHoveredDay] = useState(null);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDateColor = (day: any) => {
        const responseAppointment = appointment?.response
        if (!day) return '';
        const dayData = responseAppointment?.[day];
        if (!dayData) return 'bg-gray-900 text-gray-300';
        if (dayData.status === 'available') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
        if (dayData.status === 'busy') return 'bg-red-500/20 text-red-300 border border-red-500/30';
        if (dayData.status === 'moderate') return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
    };
    
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDay; i++) {
          days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
          days.push(i);
        }
        return days;
      };

    const days = getDaysInMonth(currentDate);
    const today = new Date();
    const isToday = (day: number | null) => {
        return day === today.getDate() && 
            currentDate.getMonth() === today.getMonth() && 
            currentDate.getFullYear() === today.getFullYear();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    return (
        <div>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-110"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                </button>
                <h3 className="text-xl font-semibold text-white">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-110"
                >
                    <ChevronRight className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                </button>
                </div>

                {/* Calendar Grid */}
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-gray-500 text-xs font-semibold py-2">
                        {day}
                    </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {days.map((day, index) => (
                    <div key={index} className="relative group">
                    <button
                        key={index}
                        onClick={() => handleDateClick(day)}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        disabled={!day}
                        className={`
                        aspect-square rounded-lg text-sm font-medium transition-all duration-200 w-full
                        ${!day ? 'invisible' : ''}
                        ${isToday(day) ? 'ring-2 ring-emerald-500' : ''}
                        ${selectedDate === day 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-105' 
                            : getDateColor(day)
                          }
                        ${selectedDate === day 
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-105' 
                            : 'text-gray-300 hover:bg-gray-700 hover:scale-105'
                        }
                        `}
                    >
                        {!isLoading && day}
                    </button>

                    {/* Hover Tooltip */}
                    {hoveredDay === day && day && appointment?.response?.[day]?.count >= 0 && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-950 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap border border-gray-700 z-50">
                        {appointment?.response?.[day].count} {appointment?.response?.[day].count === 1 ? 'appointment' : 'appointments'}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-950"></div>
                      </div>
                    )}

                    </div>
                    ))}
                </div>
                </div>
        </div>
    )
}

export default Calender