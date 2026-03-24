import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Calender from './Calender';


type CalendarModalProps = {
    handleCloseCalenderModal: () => void;
    handleShowCrfForm: () => void;
    selectedDate: any;
    setSelectedDate: (e: any) => void;
    setCurrentDate: (e: any) => void;
    currentDate: any;
    appointments: any;
    isLoading: boolean;
  };

const CalendarModal: React.FC<CalendarModalProps> = ({handleCloseCalenderModal, handleShowCrfForm, selectedDate, setSelectedDate, currentDate, setCurrentDate, appointments, isLoading}) => {

//   const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
  ];

  const handleDateClick = (day: number | React.SetStateAction<null>) => {
    if (day) {
      setSelectedDate(day);
    }
  };

  const handleTimeClick = (time: string | React.SetStateAction<null>) => {
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      handleShowCrfForm();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => handleCloseCalenderModal()}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-800 overflow-hidden transform transition-all duration-300 scale-100 animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Select Appointment Date</h2>
            <p className="text-gray-400 text-sm mt-1">Select a date</p>
          </div>
          <button
            onClick={() => handleCloseCalenderModal()}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Calendar Section */}
          <div className="space-y-4">
            <Calender handleDateClick={handleDateClick} selectedDate={selectedDate} currentDate={currentDate} setCurrentDate={setCurrentDate} appointment={appointments} isLoading={isLoading}/>
          </div>
          {/* Commented out for now as we don't need time slots */}
          {/* Time Slots Section */}
          {/* <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Available Time Slots</h3>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 max-h-96 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeClick(time)}
                    disabled={!selectedDate}
                    className={`
                      py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200
                      ${!selectedDate ? 'opacity-50 cursor-not-allowed bg-gray-900 text-gray-500' : ''}
                      ${selectedTime === time 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' 
                        : selectedDate 
                          ? 'bg-gray-900 text-gray-300 hover:bg-gray-700 hover:scale-105 hover:shadow-md' 
                          : ''
                      }
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div> */}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-t border-gray-800 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {selectedDate ? (
              <span className="text-emerald-400 font-medium">
                Selected: {monthNames[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
              </span>
            ) : (
              <span>Please select a date and time</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleCloseCalenderModal()}
              className="px-6 py-2.5 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 border border-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedDate}
              className={`
                px-6 py-2.5 rounded-lg font-medium transition-all duration-200
                ${selectedDate
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Confirm Appointment
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default CalendarModal;