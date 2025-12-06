import React, { useEffect } from "react";
import axios from "../../../utils/api";
import { SalesOrderProvider } from "./context";
import { useFormUI } from "./hooks";
import { useSalesOrderContext } from "./hooks";
import { validateStep1, validateStep2, validateStep3, validateStep4, validateStep5, validateStep6, validateStep7, validateStep8 } from "./utils";
import WizardHeader from "./shared/WizardHeader";
import FormActions from "./shared/FormActions";
import Step1_ClientPO from "./steps/Step1_ClientPO";
import Step2_SalesOrder from "./steps/Step2_SalesOrder";
import Step3_DesignEngineering from "./steps/Step3_DesignEngineering";
import Step4_MaterialRequirement from "./steps/Step4_MaterialRequirement";
import Step5_ProductionPlan from "./steps/Step5_ProductionPlan";
import Step6_QualityCheck from "./steps/Step6_QualityCheck";
import Step7_Shipment from "./steps/Step7_Shipment";
import Step8_Delivery from "./steps/Step8_Delivery";
import Card, { CardContent } from "../../ui/Card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import "./SalesOrderForm.css";

export default function SalesOrderForm() {
  return (
    <SalesOrderProvider>
      <SalesOrderFormContent />
    </SalesOrderProvider>
  );
}

function SalesOrderFormContent() {
  const { state, setStep, setLoading, setError, setSuccess, setOrderId, setConfigData, setEmployees } = useSalesOrderContext();
  const { currentStep, loading, error, successMessage } = useFormUI();
  const { formData } = state;

  useEffect(() => {
    const fetchConfigData = async () => {
      try {
        const response = await axios.get("/api/sales/config/all");
        const { projectCategories, materialUnits, materialSources, priorityLevels } = response.data;
        setConfigData(projectCategories, materialUnits, materialSources, priorityLevels);
      } catch (err) {
        console.error("Failed to fetch config data:", err);
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await axios.get("/api/employees");
        setEmployees(response.data || []);
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      }
    };

    fetchConfigData();
    fetchEmployees();
  }, [setConfigData, setEmployees]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_ClientPO />;
      case 2:
        return <Step2_SalesOrder />;
      case 3:
        return <Step3_DesignEngineering />;
      case 4:
        return <Step4_MaterialRequirement />;
      case 5:
        return <Step5_ProductionPlan />;
      case 6:
        return <Step6_QualityCheck />;
      case 7:
        return <Step7_Shipment />;
      case 8:
        return <Step8_Delivery />;
      default:
        return null;
    }
  };

  const validateCurrentStep = () => {
    const validators = {
      1: validateStep1,
      2: validateStep2,
      3: validateStep3,
      4: validateStep4,
      5: validateStep5,
      6: validateStep6,
      7: validateStep7,
      8: validateStep8,
    };
    const validator = validators[currentStep];
    return validator ? validator(formData) : [];
  };

  const handleNext = async () => {
    const errors = validateCurrentStep();
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    if (currentStep === 1) {
      await createSalesOrder();
    } else {
      setStep(currentStep + 1);
      setError(null);
    }
  };

  const handlePrev = () => {
    setStep(currentStep - 1);
    setError(null);
  };

  const createSalesOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("/api/sales/drafts", {
        formData,
        currentStep: currentStep,
      });

      const draftId = response.data.id || response.data._id;
      setOrderId(draftId);
      setSuccess("Draft created successfully!");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create draft");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.put(`/api/sales/drafts/${state.createdOrderId}`, {
        formData,
        currentStep: currentStep,
      });
      setSuccess("Sales Order submitted successfully!");
      setTimeout(() => {
        window.location.href = "/admin/salesorders";
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit order");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <WizardHeader />

        {error && (
          <Card className="mb-6 border-red-600 bg-red-950/20">
            <CardContent className="flex gap-3 pt-6">
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-red-400 font-medium">Error</p>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {successMessage && (
          <Card className="mb-6 border-green-600 bg-green-950/20">
            <CardContent className="flex gap-3 pt-6">
              <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-green-400 font-medium">Success</p>
                <p className="text-green-400 text-sm">{successMessage}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardContent className="pt-6">{renderStep()}</CardContent>
        </Card>

        <FormActions
          onNext={handleNext}
          onPrev={handlePrev}
          onSubmit={handleSubmit}
          canSubmit={!loading}
        />
      </div>
    </div>
  );
}
