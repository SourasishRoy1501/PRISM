import React, { createContext, useContext, useState, ReactNode } from 'react';

type Patient = {
  condition: string | undefined,
  crf_data: any,
  patient_id: string
};

type PatientContextType = {
    patientDetails: Patient | null;
    setPatientDetails: (patient: Patient | null) => void;
};

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider = ({ children }: { children: ReactNode }) => {
  const [patientDetails, setPatientDetails] = useState<Patient | null>(null);

  return (
    <PatientContext.Provider value={{ patientDetails, setPatientDetails }}>
      {children}
    </PatientContext.Provider>
  );
};

// custom hook for easy access
export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used inside PatientProvider');
  }
  return context;
};
