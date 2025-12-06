import { useContext } from "react";
import { SalesOrderContext } from "./context";

export function useSalesOrderContext() {
  const context = useContext(SalesOrderContext);
  if (!context) {
    throw new Error("useSalesOrderContext must be within SalesOrderProvider");
  }
  return context;
}

export function useFormData() {
  const { state, updateField, setNestedField } = useSalesOrderContext();
  return {
    formData: state.formData,
    updateField,
    setNestedField,
  };
}

export function useFormUI() {
  const { state, setStep, setLoading, setError, setSuccess } = useSalesOrderContext();
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
  const { state, setOrderId, setOrderSubmitted } = useSalesOrderContext();
  return {
    createdOrderId: state.createdOrderId,
    orderSubmitted: state.orderSubmitted,
    setOrderId,
    setOrderSubmitted,
  };
}
