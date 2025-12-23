import React, { useEffect } from "react";
import axios from "../../../utils/api";
import { sendAssignmentNotifications, sendOrderCreatedNotification } from "../../../utils/notificationService";
import { SalesOrderProvider } from "./context";
import { useFormUI } from "./hooks";
import { useSalesOrderContext } from "./hooks";
import { validateStep1, validateStep2, validateStep3, validateStep4, validateStep5, validateStep6, validateStep7, validateStep8 } from "./utils";
import { updateDraftWithStepData, saveAllStepsToSalesOrder } from "./stepDataHandler";
import WizardHeader from "./shared/WizardHeader";
import FormActions from "./shared/FormActions";
import Step1_ClientPO from "./steps/Step1_ClientPO";
import Step2_SalesOrder from "./steps/Step2_SalesOrder";
import Step3_DesignEngineering from "./steps/Step3_DesignEngineering";
import Step4_MaterialRequirement from "./steps/Step4_MaterialRequirement_Simplified";
import Step5_ProductionPlan from "./steps/Step5_ProductionPlan";
import Step6_QualityCheck from "./steps/Step6_QualityCheck";
import Step7_Shipment from "./steps/Step7_Shipment";
import Step8_Delivery from "./steps/Step8_Delivery";
import SalesOrderViewOnly from "./SalesOrderViewOnly";
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
      updateField('status', initialData.status || 'pending');
      updateField('totalAmount', initialData.total?.toString() || '');
      
      loadAllStepData(initialData.id);
    }
  }, [mode, initialData, updateField]);

  const loadAllStepData = async (salesOrderId) => {
    try {
      setLoading(true);
      
      const clientPOResponse = await axios.get(`/api/sales/steps/${salesOrderId}/client-po`).catch(() => null);
      const salesOrderResponse = await axios.get(`/api/sales/steps/${salesOrderId}/sales-order`).catch(() => null);
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
        updateField('projectRequirements', poData.projectRequirements || {});
        updateField('notes', poData.notes || null);
      }

      if (salesOrderResponse?.data?.data) {
        const soData = salesOrderResponse.data.data;
        updateField('estimatedEndDate', soData.estimatedEndDate || '');
        updateField('clientEmail', soData.clientEmail || '');
        updateField('clientPhone', soData.clientPhone || '');
        updateField('billingAddress', soData.billingAddress || '');
        updateField('shippingAddress', soData.shippingAddress || '');
        updateField('productDetails', soData.productDetails || {});
        updateField('qualityCompliance', soData.qualityCompliance || {});
        updateField('warrantySupport', soData.warrantySupport || {});
        updateField('paymentTerms', soData.paymentTerms || null);
        updateField('projectPriority', soData.projectPriority || null);
        updateField('totalAmount', soData.totalAmount || null);
        updateField('projectCode', soData.projectCode || null);
        updateField('internalInfo', soData.internalInfo || {});
        updateField('specialInstructions', soData.specialInstructions || null);
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
        updateField('deliveryAssignedTo', deliveryData.assignedTo || '');
        updateField('customerContact', deliveryData.customerContact || '');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading step data:', error);
      setLoading(false);
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

    if (mode === 'edit') {
      setLoading(true);
      try {
        await updateDraftWithStepData(initialData.id, formData, currentStep, state.poDocuments || []);
        setStep(currentStep + 1);
      } catch (err) {
        console.error('Error saving step:', err);
        setError(err.message || `Failed to save step ${currentStep}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    const errors = validateCurrentStep();
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      if (currentStep === 1) {
        await createDraft();
      } else {
        await updateDraft();
        setStep(currentStep + 1);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = async () => {
    if (mode === 'edit') {
      setLoading(true);
      try {
        await updateDraftWithStepData(initialData.id, formData, currentStep, state.poDocuments || []);
        setStep(currentStep - 1);
      } catch (err) {
        console.error('Error saving step:', err);
        setError(err.message || `Failed to save step ${currentStep}`);
      } finally {
        setLoading(false);
      }
    } else {
      setStep(currentStep - 1);
    }
    setError(null);
  };

  const createDraft = async () => {
    try {
      const response = await axios.post("/api/sales/drafts", {
        formData,
        currentStep: 1,
      });

      const draftId = response.data.id || response.data._id;
      setOrderId(draftId);
      setSuccess("Step 1 saved successfully!");
      setStep(2);
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create draft");
    }
  };

  const updateDraft = async () => {
    try {
      if (!state.createdOrderId) {
        throw new Error('Draft ID not found');
      }

      await updateDraftWithStepData(state.createdOrderId, formData, currentStep, state.poDocuments || []);
      setSuccess(`Step ${currentStep} saved successfully!`);
    } catch (err) {
      throw new Error(err.message || `Failed to save step ${currentStep}`);
    }
  };

  const handleSubmit = async () => {
    if (mode === 'edit') {
      setLoading(true);
      setError(null);
      try {
        await updateDraftWithStepData(initialData.id, formData, currentStep, state.poDocuments || []);
        
        await axios.put(`/api/sales/orders/${initialData.id}`, {
          clientName: formData.clientName || formData.customer,
          poNumber: formData.poNumber,
          projectName: formData.projectName || "",
          orderDate: formData.orderDate?.split('T')[0] || formData.orderDate,
          dueDate: formData.estimatedEndDate?.split('T')[0] || formData.estimatedEndDate,
          total: parseFloat(formData.totalAmount || 0),
          currency: "INR",
          priority: formData.projectPriority || "medium",
          status: formData.status || "pending",
        });

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
      const orderDate = formData.poDate || formData.orderDate || new Date().toISOString().split("T")[0];
      const estimatedDate = formData.estimatedEndDate || formData.deliveryTimeline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      
      const salesOrderData = {
        clientName: formData.clientName || formData.customer,
        poNumber: formData.poNumber,
        projectName: formData.projectName || "",
        orderDate: orderDate,
        dueDate: estimatedDate,
        total: parseFloat(formData.totalAmount || 0),
        currency: "INR",
        priority: formData.projectPriority || "medium",
        status: formData.status || "pending",
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
        throw new Error('Failed to create sales order - no ID returned');
      }

      console.log('Sales Order created with ID:', createdOrderId);

      try {
        const mergedFormData = {
          ...formData,
          materialDetailsTable: state.materialDetailsTable,
          selectedProductionPhases: state.selectedProductionPhases,
          productionPhaseDetails: state.productionPhaseDetails
        };
        const summary = await saveAllStepsToSalesOrder(createdOrderId, mergedFormData);
        console.log('All step data saved successfully:', summary);
      } catch (err) {
        console.warn('Could not save some step data:', err.message);
      }

      try {
        const ordersData = { ...salesOrderData, id: createdOrderId };
        const notifications = await sendAssignmentNotifications(ordersData, formData);
        await sendOrderCreatedNotification(ordersData, formData);
        console.log('Notifications sent successfully:', notifications.length, 'notifications');
      } catch (err) {
        console.warn('Could not send notifications:', err.message);
      }

      try {
        if (state.createdOrderId) {
          await axios.delete(`/api/sales/drafts/${state.createdOrderId}`);
          console.log('Draft deleted successfully');
        }
      } catch (err) {
        console.warn('Could not delete draft:', err.message);
      }

      setSuccess("Sales Order created and all steps saved successfully!");
      setTimeout(() => {
        if (onSubmit) onSubmit();
      }, 2000);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || err.message || "Failed to create sales order");
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'view') {
    return (
      <SalesOrderViewOnly 
        formData={formData} 
        initialData={initialData} 
        onBack={onCancel} 
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50">
      <div className="max-w-5xl mx-auto">
        {(error || successMessage) && (
          <div className={`mb-4 p-3 rounded-lg flex items-center text-xs gap-2 text-sm animate-in ${
            error 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {error ? <AlertCircle size={18} className="flex-shrink-0" /> : <CheckCircle2 size={18} className="flex-shrink-0" />}
            <span className="font-medium">{error || successMessage}</span>
          </div>
        )}

        <WizardHeader currentStep={currentStep} mode={mode} />
        
        <div className="mt-6">
          {renderStep()}
        </div>

        <FormActions
          currentStep={currentStep}
          onNext={handleNext}
          onPrev={handlePrev}
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={onCancel}
          mode={mode}
        />
      </div>
    </div>
  );
}
