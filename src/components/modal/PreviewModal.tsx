import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import MaleInfertilityCRF from "../crf/male_infertility";
import MaleSexualDysfunctionCRF from "../crf/male_sexual_dysfunction";

const PreviewModal = ({setIsPreviewModal, data, user}: {setIsPreviewModal: (e: any) => void, data: any, user: any}) => {
  
  const [currentPatient, setCurrentPatient] = useState(0);
  const [crfData, setCrfData] = useState(data?.[0]);
  console.log(data)
  const handleNextPatient = () => {
    if (currentPatient < data.length - 1) {
      setCurrentPatient(currentPatient + 1);
      setCrfData(data?.[currentPatient+1])
      console.log(data?.[currentPatient+1])
    }
  };

  const handlePrevPatient = () => {
    if (currentPatient > 0) {
      setCurrentPatient(currentPatient - 1);
      setCrfData(data?.[currentPatient-1])
      console.log(data?.[currentPatient-1])
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsPreviewModal(false)} />

      {/* Modal */}
      <div className="relative bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl border border-slate-800 overflow-hidden animate-fadeIn">
        {/* Header */}
        

      {data?.[currentPatient]?.crfType ? (<MaleInfertilityCRF user={user} isFirstTime={true} selectedDate={data?.[currentPatient]?.scheduledDate} crfData={crfData} isPreview={true}/>) : (<MaleSexualDysfunctionCRF user={user} isFirstTime={true} selectedDate={data?.[currentPatient]?.scheduledDate} crfData={crfData} isPreview={true}/>)}
        

        {/* Footer with Patient Navigation */}
        <div className="bg-slate-800/50 border-t border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <button
              onClick={handlePrevPatient}
              disabled={currentPatient === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                currentPatient === 0
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600 hover:text-white'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous Patient
            </button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">
                Patient <span className="text-white font-semibold text-base">{currentPatient + 1}</span> of <span className="text-white font-semibold text-base">{data.length}</span>
              </span>
              <div className="flex gap-1.5">
                {data?.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentPatient
                        ? 'w-8 bg-teal-500'
                        : index < currentPatient
                        ? 'w-2 bg-teal-600/50'
                        : 'w-2 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleNextPatient}
              disabled={currentPatient === data.length - 1}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                currentPatient === data.length - 1
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg'
              }`}
            >
              Next Patient
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
    </div>
  );
};

export default PreviewModal;
