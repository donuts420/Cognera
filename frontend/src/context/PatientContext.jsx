import React, { createContext, useContext, useState } from 'react';

const PatientContext = createContext(null);

export function PatientProvider({ children }) {
  const [activePatient, setActivePatient] = useState(null);
  const [patientMode, setPatientMode] = useState(false);

  const enterPatientMode = (patient) => {
    setActivePatient(patient);
    setPatientMode(true);
  };

  const exitPatientMode = () => {
    setPatientMode(false);
    setActivePatient(null);
  };

  return (
    <PatientContext.Provider value={{ activePatient, setActivePatient, patientMode, enterPatientMode, exitPatientMode }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatient must be used within PatientProvider');
  return ctx;
}
