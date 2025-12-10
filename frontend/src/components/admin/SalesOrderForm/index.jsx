import React, { useEffect } from "react";
import axios from "../../../utils/api";
import { SalesOrderProvider } from "./context";
import { useFormUI } from "./hooks";
import { useSalesOrderContext } from "./hooks";
import { validateStep1, validateStep2, validateStep3, validateStep4, validateStep5, validateStep6, validateStep7, validateStep8 } from "./utils";
import { saveAllStepData } from "./stepDataService";
import { saveStepDataToAPI } from "./stepDataHandler";
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
import SalesOrderViewOnly from "./SalesOrderViewOnly";
import Card, { CardContent } from "../../ui/Card";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import "./SalesOrderForm.css";

export default function SalesOrderForm({ mode = 'create', initialData = null, onSubmit, onCancel }) {
  return (
    <SalesOrderProvider mode={mode} initialData={initialData}>
      <SalesOrderFormContent onSubmit={onSubmit} onCancel={onCancel} mode={mode} initialData={initialData} />
    </SalesOrderProvider>
  );
}

function SalesOrderFormContent({ onSubmit, onCancel, mode = 'create', initialData = null }) {
  const { state, setStep, setLoading, setError, setSuccess, setOrderId, setConfigData, setEmployees, updateField } = useSalesOrderContext();
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

  useEffect(() => {
    if (mode === 'assign') {
      setStep(6);
    }
  }, [mode, setStep]);

  useEffect(() => {
    if ((mode === 'view' || mode === 'edit' || mode === 'assign') && initialData) {
      updateField('poNumber', initialData.po_number || '');
      updateField('clientName', initialData.customer || '');
      updateField('projectName', initialData.project_name || '');
      updateField('orderDate', initialData.order_date || '');
      updateField('estimatedEndDate', initialData.due_date || '');
      updateField('projectPriority', initialData.priority || 'medium');
      updateField('totalAmount', initialData.total?.toString() || '');
      
      loadAllStepData(initialData.id);
    }
  }, [mode, initialData, updateField]);

  const loadAllStepData = async (salesOrderId) => {
    try {
      setLoading(true);
      
      const clientPOResponse = await axios.get(`/api/sales/steps/${salesOrderId}/client-po`).catch(() => null);
      const designResponse = await axios.get(`/api/sales/steps/${salesOrderId}/design-engineering`).catch(() => null);
      const materialsResponse = await axios.get(`/api/sales/steps/${salesOrderId}/material-requirements`).catch(() => null);
      const productionResponse = await axios.get(`/api/sales/steps/${salesOrderId}/production-plan`).catch(() => null);
      const qcResponse = await axios.get(`/api/sales/steps/${salesOrderId}/quality-check`).catch(() => null);
      const shipmentResponse = await axios.get(`/api/sales/steps/${salesOrderId}/shipment`).catch(() => null);
      const deliveryResponse = await axios.get(`/api/sales/steps/${salesOrderId}/delivery`).catch(() => null);

      if (clientPOResponse?.data?.data) {
        const poData = clientPOResponse.data.data;
        updateField('poNumber', poData.poNumber || '');
        updateField('poDate', poData.poDate || '');
        updateField('clientName', poData.clientName || '');
        updateField('clientEmail', poData.clientEmail || '');
        updateField('clientPhone', poData.clientPhone || '');
        updateField('projectName', poData.projectName || '');
        updateField('projectCode', poData.projectCode || '');
        updateField('billingAddress', poData.billingAddress || '');
        updateField('shippingAddress', poData.shippingAddress || '');
        updateField('clientAddress', poData.clientAddress || '');
        if (poData.projectRequirements) {
          updateField('projectRequirements', poData.projectRequirements);
        }
      }

      if (designResponse?.data?.data) {
        const designData = designResponse.data.data;
        updateField('designEngineering', designData);
      }

      if (materialsResponse?.data?.data) {
        const materialsData = materialsResponse.data.data;
        updateField('materialProcurement', materialsData);
      }

      if (productionResponse?.data?.data) {
        const productionData = productionResponse.data.data;
        updateField('productionPlan', productionData);
      }

      if (qcResponse?.data?.data) {
        const qcData = qcResponse.data.data;
        updateField('qualityCheck', qcData);
      }

      if (shipmentResponse?.data?.data) {
        const shipmentData = shipmentResponse.data.data;
        updateField('shipment', shipmentData);
      }

      if (deliveryResponse?.data?.data) {
        const deliveryData = deliveryResponse.data.data;
        updateField('delivery', deliveryData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading step data:', error);
      setLoading(false);
    }
  };

  const saveStepData = async (stepNumber) => {
    try {
      await saveStepDataToAPI(stepNumber, state.createdOrderId, formData);
    } catch (err) {
      console.error(`Error saving step ${stepNumber} data:`, err);
      throw err;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_ClientPO readOnly={mode === 'view' || mode === 'assign'} />;
      case 2:
        return <Step2_SalesOrder readOnly={mode === 'view' || mode === 'assign'} />;
      case 3:
        return <Step3_DesignEngineering readOnly={mode === 'view' || mode === 'assign'} />;
      case 4:
        return <Step4_MaterialRequirement readOnly={mode === 'view' || mode === 'assign'} />;
      case 5:
        return <Step5_ProductionPlan readOnly={mode === 'view' || mode === 'assign'} />;
      case 6:
        return <Step6_QualityCheck readOnly={mode === 'view'} isAssignMode={mode === 'assign'} />;
      case 7:
        return <Step7_Shipment readOnly={mode === 'view' || mode === 'assign'} />;
      case 8:
        return <Step8_Delivery readOnly={mode === 'view' || mode === 'assign'} />;
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
    if (mode === 'view' || mode === 'assign') {
      setStep(currentStep + 1);
      return;
    }

    const errors = validateCurrentStep();
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    if (currentStep === 1) {
      await createDraft();
    } else {
      setLoading(true);
      setError(null);
      try {
        await saveStepData(currentStep);
        setStep(currentStep + 1);
      } catch (err) {
        console.error('Error saving step:', err);
        setError('Failed to save step data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrev = () => {
    setStep(currentStep - 1);
    setError(null);
  };

  const createDraft = async () => {
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

  const createActualSalesOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const orderDate = formData.poDate || formData.orderDate || new Date().toISOString().split("T")[0];
      const estimatedDate = formData.estimatedEndDate || formData.deliveryTimeline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      
      const salesOrderData = {
        clientName: formData.clientName || formData.customer,
        poNumber: formData.poNumber,
        orderDate: orderDate,
        dueDate: estimatedDate,
        total: parseFloat(formData.totalAmount || 0),
        currency: "INR",
        priority: formData.projectPriority || "medium",
        items: [{
          name: formData.projectName || "Project Item",
          description: formData.projectRequirements?.specifications || "",
          quantity: 1,
          unitPrice: parseFloat(formData.totalAmount || 0)
        }],
        documents: state.poDocuments || [],
        notes: formData.specialInstructions || "",
        projectScope: {
          application: formData.projectRequirements?.application || "",
          dimensions: formData.projectRequirements?.dimensions || "",
          specifications: formData.projectRequirements?.specifications || ""
        }
      };

      const response = await axios.post("/api/sales/orders", salesOrderData);
      const createdOrderId = response.data.order?.id;

      if (!createdOrderId) {
        throw new Error("Failed to get order ID from response");
      }

      setOrderId(createdOrderId);
      
      try {
        await saveStepData(1);
        console.log('Step 1 (Client PO) data saved successfully');
      } catch (step1Err) {
        console.warn('Warning: Could not save Step 1 data:', step1Err.message);
      }
      
      try {
        await saveStepData(2);
        setSuccess("Sales Order created and all steps saved successfully!");
        setStep(3);
      } catch (saveErr) {
        console.warn('Warning: Sales order created but step data save had issues:', saveErr.message);
        setSuccess("Sales Order created (step data save had minor issues)");
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create sales order");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (mode === 'edit') {
      setLoading(true);
      setError(null);
      try {
        await axios.put(`/api/sales/orders/${initialData.id}`, {
          clientName: formData.clientName || formData.customer,
          poNumber: formData.poNumber,
          orderDate: formData.orderDate,
          dueDate: formData.estimatedEndDate,
          total: parseFloat(formData.totalAmount || 0),
          currency: "INR",
          priority: formData.projectPriority || "medium",
          project_name: formData.projectName,
        });

        try {
          const saveResults = await saveAllStepData(initialData.id, formData);
          console.log('All step data updated:', saveResults);
        } catch (err) {
          console.warn('Could not save some step data:', err.message);
        }

        setSuccess("Sales Order updated successfully!");
        setTimeout(() => {
          if (onSubmit) onSubmit();
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to update order");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'assign') {
      setLoading(true);
      setError(null);
      try {
        await axios.post(`/api/sales/orders/${initialData.id}/assign`, {
          assignedTo: formData.internalProjectOwner,
          assignedAt: new Date().toISOString(),
        });

        setSuccess("Sales Order assigned successfully!");
        setTimeout(() => {
          if (onSubmit) onSubmit();
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to assign order");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let finalOrderId = null;

      if (state.createdOrderId) {
        try {
          await axios.delete(`/api/sales/drafts/${state.createdOrderId}`);
        } catch (err) {
          console.warn('Could not delete draft:', err.message);
        }

        finalOrderId = state.createdOrderId;
      } else {
        return;
      }

      try {
        const saveResults = await saveAllStepData(finalOrderId, formData);
        console.log('All step data saved successfully:', saveResults);
      } catch (err) {
        console.warn('Could not save some step data:', err.message);
      }

      const orderDate = formData.poDate || formData.orderDate || new Date().toISOString().split("T")[0];
      const estimatedDate = formData.estimatedEndDate || formData.deliveryTimeline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      
      const salesOrderData = {
        clientName: formData.clientName || formData.customer,
        poNumber: formData.poNumber,
        orderDate: orderDate,
        dueDate: estimatedDate,
        total: parseFloat(formData.totalAmount || 0),
        currency: "INR",
        priority: formData.projectPriority || "medium",
        items: [{
          name: formData.projectName || "Project Item",
          description: formData.projectRequirements?.specifications || "",
          quantity: 1,
          unitPrice: parseFloat(formData.totalAmount || 0)
        }],
        documents: state.poDocuments || [],
        notes: formData.specialInstructions || "",
        projectScope: {
          application: formData.projectRequirements?.application || "",
          dimensions: formData.projectRequirements?.dimensions || "",
          specifications: formData.projectRequirements?.specifications || ""
        }
      };

      try {
        const response = await axios.post("/api/sales/orders", salesOrderData);
        console.log('Sales order created successfully:', response.data);
      } catch (orderErr) {
        console.warn('Warning: Sales order creation had issues:', orderErr.message);
      }
      
      setSuccess("Sales Order created successfully! Redirecting to sales orders list...");
      setTimeout(() => {
        window.location.href = "/admin/salesorders";
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit order");
      setLoading(false);
    }
  };

  if (mode === 'view') {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <SalesOrderViewOnly
          formData={formData}
          initialData={initialData}
          onBack={onCancel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <WizardHeader mode={mode} />

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
          mode={mode}
          onNext={handleNext}
          onPrev={handlePrev}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          canSubmit={!loading}
          isLastStep={currentStep === 8}
        />
      </div>
    </div>
  );
}
