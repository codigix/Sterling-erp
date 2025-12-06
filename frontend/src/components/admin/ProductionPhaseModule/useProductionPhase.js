import { useState, useCallback } from "react";

export function useProductionPhase() {
  const [productionPhaseDetails, setProductionPhaseDetails] = useState([]);
  const [productionPhaseTracking, setProductionPhaseTracking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const saveProductionPhaseDetail = useCallback(async (phaseData) => {
    setLoading(true);
    setError(null);
    try {
      setProductionPhaseDetails((prev) => [...prev, phaseData]);
      setSuccessMessage("Production phase saved successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to save production phase");
    } finally {
      setLoading(false);
    }
  }, []);

  const startPhase = useCallback(async (phaseId) => {
    setLoading(true);
    setError(null);
    try {
      setProductionPhaseTracking((prev) =>
        prev.map((phase) =>
          phase.id === phaseId ? { ...phase, status: "In Progress", startedAt: new Date() } : phase
        )
      );
      setSuccessMessage("Production phase started");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to start production phase");
    } finally {
      setLoading(false);
    }
  }, []);

  const finishPhase = useCallback(async (phaseId) => {
    setLoading(true);
    setError(null);
    try {
      setProductionPhaseTracking((prev) =>
        prev.map((phase) =>
          phase.id === phaseId ? { ...phase, status: "Completed", completedAt: new Date() } : phase
        )
      );
      setSuccessMessage("Production phase completed");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to finish production phase");
    } finally {
      setLoading(false);
    }
  }, []);

  const createOutwardChallan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSuccessMessage("Outward challan created successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to create outward challan");
    } finally {
      setLoading(false);
    }
  }, []);

  const createInwardChallan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSuccessMessage("Inward challan created successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to create inward challan");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    productionPhaseDetails,
    productionPhaseTracking,
    loading,
    error,
    successMessage,
    saveProductionPhaseDetail,
    startPhase,
    finishPhase,
    createOutwardChallan,
    createInwardChallan,
  };
}
