// src/context/RegistrationContext.tsx
import React, { createContext, useState, useContext } from "react";

type RegistrationContextType = {
  formData: any;
  updateFormData: (data: any) => void;
  resetFormData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
};

const initialFormData = {
  // Personal Info
  name: "",
  email: "",
  password: "",
  phoneNumber: "",
  role: "delivery",

  // Delivery Info
  deliveryInfo: {
    vehicleType: "",
    vehicleNumber: "",
    licenseNumber: "",
    availabilityStatus: "offline",
    currentLocation: {
      type: "Point",
      coordinates: [0, 0],
    },
  },

  // Documents
  documents: {
    profilePicture: null,
    driverLicense: null,
    vehicleRegistration: null,
    insurance: null,
  },
};

const RegistrationContext = createContext<RegistrationContextType>({
  formData: initialFormData,
  updateFormData: () => {},
  resetFormData: () => {},
  currentStep: 1,
  setCurrentStep: () => {},
  nextStep: () => {},
  prevStep: () => {},
});

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (data: any) => {
    setFormData((prevData) => ({
      ...prevData,
      ...data,
    }));
  };

  const resetFormData = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  return (
    <RegistrationContext.Provider
      value={{
        formData,
        updateFormData,
        resetFormData,
        currentStep,
        setCurrentStep,
        nextStep,
        prevStep,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => useContext(RegistrationContext);
