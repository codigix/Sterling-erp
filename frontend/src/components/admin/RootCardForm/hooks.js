import { useContext } from "react";
import { RootCardContext } from "./RootCardContext";

export function useRootCardContext() {
  const context = useContext(RootCardContext);
  if (!context) {
    throw new Error("useRootCardContext must be within RootCardProvider");
  }
  return context;
}

export function useFormData() {
  const { state, updateField, setNestedField } = useRootCardContext();
  return {
    formData: state.formData,
    updateField,
    setNestedField,
  };
}

export function useFormUI() {
  const { state, setStep, setLoading, setError, setSuccess } = useRootCardContext();
  return {
    currentStep: state.currentStep,
    loading: state.loading,
    error: state.error,
    successMessage: state.successMessage,
    setStep,
    setLoading,
    setError,
    setSuccess,
  };
}

export function useFormOrder() {
  const { state, setOrderId, setOrderSubmitted } = useRootCardContext();
  return {
    createdOrderId: state.createdOrderId,
    orderSubmitted: state.orderSubmitted,
    setOrderId,
    setOrderSubmitted,
  };
}
