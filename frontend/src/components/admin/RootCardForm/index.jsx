import React, { useEffect } from "react";
import axios from "../../../utils/api";
import { sendAssignmentNotifications, sendOrderCreatedNotification } from "../../../utils/notificationService";
import { RootCardProvider } from "./context";
import { useFormUI } from "./hooks";
import { useRootCardContext } from "./hooks";
import { updateDraftWithStepData, saveAllStepsToRootCard, saveStepDataToAPI } from "./stepDataHandler";
import WizardHeader from "./shared/WizardHeader";
import FormActions from "./shared/FormActions";
import Step1_ClientPO from "./steps/Step1_ClientPO";
import Step2_DesignEngineering from "./steps/Step2_DesignEngineering";
import Step3_MaterialRequirement from "./steps/Step3_MaterialRequirement";
import Step4_ProductionPlan from "./steps/Step4_ProductionPlan";
import Step5_QualityCheck from "./steps/Step5_QualityCheck";
import Step6_Shipment from "./steps/Step6_Shipment";
import Step7_Delivery from "./steps/Step7_Delivery";
import RootCardViewOnly from "./RootCardViewOnly";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import "./RootCardForm.css";

export default function RootCardForm({ mode = 'create', initialData = null, onSubmit, onCancel }) {
  return (
    <RootCardProvider mode={mode} initialData={initialData}>
      <RootCardFormContent onSubmit={onSubmit} onCancel={onCancel} mode={mode} initialData={initialData} />
    </RootCardProvider>
  );
}

function RootCardFormContent({ onSubmit, onCancel, mode = 'create', initialData = null }) {
  const { state, setStep, setLoading, setError, setSuccess, setOrderId, setConfigData, setEmployees, updateField, setPoDocuments, setMaterialDetailsTable, setProductionPhaseDetails, setDraftData } = useRootCardContext();
  const { currentStep, loading, error, successMessage } = useFormUI();
  const { formData } = state;

  const loadAllStepData = React.useCallback(async (rootCardId) => {
    try {
      setLoading(true);
      
      const clientPOResponse = await axios.get(`/root-cards/steps/${rootCardId}/client-po`).catch(() => null);
      const designResponse = await axios.get(`/root-cards/steps/${rootCardId}/design-engineering`).catch(() => null);
      const materialsResponse = await axios.get(`/root-cards/steps/${rootCardId}/material-requirements`).catch(() => null);
      const productionResponse = await axios.get(`/root-cards/steps/${rootCardId}/production-plan`).catch(() => null);
      const qcResponse = await axios.get(`/root-cards/steps/${rootCardId}/quality-check`).catch(() => null);
      const shipmentResponse = await axios.get(`/root-cards/steps/${rootCardId}/shipment`).catch(() => null);
      const deliveryResponse = await axios.get(`/root-cards/steps/${rootCardId}/delivery`).catch(() => null);
      const allStepsResponse = await axios.get(`/root-cards/steps/${rootCardId}/steps`).catch(() => null);

      const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return '';
          return d.toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      // Set assignees from all steps
      if (allStepsResponse?.data?.data?.steps) {
        const steps = allStepsResponse.data.data.steps;
        const stepKeyMapping = {
          'design_engineering': 'designEngineering',
          'material_requirement': 'materialRequirements',
          'production_plan': 'productionPlan',
          'quality_check': 'qualityCheck',
          'shipment': 'shipment',
          'delivery': 'delivery'
        };
        steps.forEach(step => {
          if (step.assignedTo) {
            const camelKey = stepKeyMapping[step.stepKey] || step.stepKey;
            const assigneeKey = `${camelKey}AssignedTo`;
            updateField(assigneeKey, step.assignedTo);
          }
        });
      }

      if (clientPOResponse?.data?.data) {
        const poData = clientPOResponse.data.data;
        updateField('poNumber', poData.poNumber || '');
        updateField('poDate', formatDateForInput(poData.poDate));
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
        
        if (poData.attachments) {
          setPoDocuments(poData.attachments);
        }

        // Merged from Step 2 fields that might be in productDetails
        if (poData.productDetails) {
          updateField('productDetails', poData.productDetails);
          if (poData.productDetails.estimatedEndDate) {
            updateField('estimatedEndDate', formatDateForInput(poData.productDetails.estimatedEndDate));
          }
        }
      }

      if (designResponse?.data?.data) {
        const designData = designResponse.data.data;
        updateField('designEngineering', designData);
      }

      if (materialsResponse?.data?.data) {
        const materialsData = materialsResponse.data.data;
        updateField('materialProcurement', materialsData);
        updateField('procurementStatus', materialsData.procurementStatus || 'pending');
        // Ensure materials array is also available at the root for Step 3
        if (materialsData.materials) {
          updateField('materials', materialsData.materials);
        }
        if (materialsData.materialDetailsTable) {
          setMaterialDetailsTable(materialsData.materialDetailsTable);
        }
      }

      if (productionResponse?.data?.data) {
        const productionData = productionResponse.data.data;
        updateField('productionPlan', productionData);
        updateField('productionStartDate', formatDateForInput(productionData.productionStartDate));
        updateField('estimatedCompletionDate', formatDateForInput(productionData.estimatedCompletionDate));
        updateField('selectedPhases', productionData.selectedPhases || {});
        if (productionData.phaseDetails) {
          setProductionPhaseDetails(productionData.phaseDetails);
        }
      }

      if (qcResponse?.data?.data) {
        const qcData = qcResponse.data.data;
        
        // Format dates in inspections
        if (qcData.inspections && Array.isArray(qcData.inspections)) {
          qcData.inspections = qcData.inspections.map(insp => ({
            ...insp,
            date: formatDateForInput(insp.date)
          }));
        }
        
        updateField('qualityCheck', qcData);
        
        // Load quality and economics fields from Step 5
        if (qcData.qualityCompliance) updateField('qualityCompliance', qcData.qualityCompliance);
        if (qcData.warrantySupport) updateField('warrantySupport', qcData.warrantySupport);
        if (qcData.paymentTerms) updateField('paymentTerms', qcData.paymentTerms);
        if (qcData.projectPriority) updateField('projectPriority', qcData.projectPriority);
        if (qcData.totalAmount) updateField('totalAmount', qcData.totalAmount);
        if (qcData.internalInfo) updateField('internalInfo', qcData.internalInfo);
        if (qcData.specialInstructions) updateField('specialInstructions', qcData.specialInstructions);
        if (qcData.status) updateField('status', qcData.status);
        if (qcData.internalProjectOwner) updateField('internalProjectOwner', qcData.internalProjectOwner);
      }

      if (shipmentResponse?.data?.data) {
        const shipmentData = shipmentResponse.data.data;
        updateField('shipment', shipmentData.shipment || {});
        if (shipmentData.deliveryTerms) updateField('deliveryTerms', shipmentData.deliveryTerms);
      }

      if (deliveryResponse?.data?.data) {
        const deliveryData = deliveryResponse.data.data;
        // Format date for delivery
        if (deliveryData.actualDeliveryDate) {
          deliveryData.actualDeliveryDate = formatDateForInput(deliveryData.actualDeliveryDate);
        }
        updateField('delivery', deliveryData);
        updateField('deliveryAssignedTo', deliveryData.assignedTo || '');
        updateField('customerContact', deliveryData.customerContact || '');
        if (deliveryData.deliveryTerms) updateField('deliveryTerms', deliveryData.deliveryTerms);
        if (deliveryData.warrantySupport) updateField('warrantySupport', deliveryData.warrantySupport);
        if (deliveryData.projectRequirements) updateField('projectRequirements', deliveryData.projectRequirements);
        if (deliveryData.internalInfo) updateField('internalInfo', deliveryData.internalInfo);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading step data:', error);
      setLoading(false);
    }
  }, [setLoading, updateField, setPoDocuments, setMaterialDetailsTable, setProductionPhaseDetails]);

  const loadDraft = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/root-cards/drafts/latest');
      if (response.data?.draft) {
        const draft = response.data.draft;
        
        setDraftData({
          id: draft.id,
          currentStep: draft.current_step,
          formData: draft.formData,
          materialDetailsTable: draft.formData?.materialDetailsTable,
          productionPhaseDetails: draft.formData?.productionPhaseDetails,
          poDocuments: draft.poDocuments
        });
        
        setSuccess(`Resumed draft from ${new Date(draft.updated_at).toLocaleString()}`);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading draft:', err);
      setLoading(false);
    }
  }, [setLoading, setDraftData, setSuccess]);

  useEffect(() => {
    const fetchConfigData = async () => {
      try {
        const response = await axios.get("/root-cards/config/all");
        const { projectCategories, materialUnits, materialSources, priorityLevels } = response.data;
        setConfigData(projectCategories, materialUnits, materialSources, priorityLevels);
      } catch (err) {
        console.error("Failed to fetch config data:", err);
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await axios.get("/employees");
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
    } else if (mode === 'create') {
      loadDraft();
    }
  }, [mode, initialData, updateField, loadAllStepData, loadDraft]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_ClientPO readOnly={mode === 'view' || mode === 'assign'} />;
      case 2:
        return <Step2_DesignEngineering readOnly={mode === 'view' || mode === 'assign'} />;
      case 3:
        return <Step3_MaterialRequirement readOnly={mode === 'view' || mode === 'assign'} />;
      case 4:
        return <Step4_ProductionPlan readOnly={mode === 'view' || mode === 'assign'} />;
      case 5:
        return <Step5_QualityCheck readOnly={mode === 'view'} isAssignMode={mode === 'assign'} />;
      case 6:
        return <Step6_Shipment readOnly={mode === 'view' || mode === 'assign'} />;
      case 7:
        return <Step7_Delivery readOnly={mode === 'view' || mode === 'assign'} />;
      default:
        return null;
    }
  };

  const handleNext = async () => {
    if (mode === 'view' || mode === 'assign') {
      setStep(currentStep + 1);
      return;
    }

    if (mode === 'edit') {
      setLoading(true);
      try {
        const mergedFormData = {
          ...formData,
          materialDetailsTable: state.materialDetailsTable,
          productionPhaseDetails: state.productionPhaseDetails
        };
        await saveStepDataToAPI(currentStep, initialData.id, mergedFormData, state.poDocuments);
        setStep(currentStep + 1);
      } catch (err) {
        console.error('Error saving step:', err);
        setError(err.message || `Failed to save step ${currentStep}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    /* Removing validation as requested to allow jumping between steps
    const errors = validateCurrentStep();
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }
    */

    setLoading(true);
    setError(null);
    
    try {
      const draftId = state.createdOrderId || initialData?.id || initialData?._id;
      
      if (!draftId && mode === 'create') {
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
        const mergedFormData = {
          ...formData,
          materialDetailsTable: state.materialDetailsTable,
          productionPhaseDetails: state.productionPhaseDetails
        };
        await saveStepDataToAPI(currentStep, initialData.id, mergedFormData, state.poDocuments);
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
      const mergedFormData = {
        ...formData,
        materialDetailsTable: state.materialDetailsTable,
        productionPhaseDetails: state.productionPhaseDetails
      };
      
      const response = await axios.post("/root-cards/drafts", {
        formData: mergedFormData,
        currentStep: currentStep,
        poDocuments: state.poDocuments || []
      });

      const draftId = response.data.id || response.data._id;
      setOrderId(draftId);
      setSuccess(`Step ${currentStep} saved successfully!`);
      setStep(currentStep + 1);
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create draft");
    }
  };

  const updateDraft = async () => {
    try {
      const draftId = state.createdOrderId || initialData?.id || initialData?._id;
      
      if (!draftId) {
        console.error('Draft ID not found. State:', state, 'InitialData:', initialData);
        throw new Error(`Draft ID not found. Current Step: ${currentStep}`);
      }

      const mergedFormData = {
        ...formData,
        materialDetailsTable: state.materialDetailsTable,
        productionPhaseDetails: state.productionPhaseDetails
      };

      await updateDraftWithStepData(draftId, mergedFormData, currentStep, state.poDocuments || []);
      setSuccess(`Step ${currentStep} saved successfully!`);
    } catch (err) {
      console.error('updateDraft error:', err);
      throw new Error(err.message || `Failed to save step ${currentStep}`);
    }
  };

  const handleSubmit = async () => {
    if (mode === 'edit') {
      setLoading(true);
      setError(null);
      try {
        const mergedFormData = {
          ...formData,
          materialDetailsTable: state.materialDetailsTable,
          productionPhaseDetails: state.productionPhaseDetails
        };
        await saveStepDataToAPI(currentStep, initialData.id, mergedFormData, state.poDocuments);
        
        await axios.put(`/root-cards/${initialData.id}`, {
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

        setSuccess("Root Card updated successfully!");
        setTimeout(() => {
          if (onSubmit) onSubmit();
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to update root card");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'assign') {
      setLoading(true);
      setError(null);
      try {
        await axios.post(`/root-cards/${initialData.id}/assign`, {
          assignedTo: formData.internalProjectOwner,
          assignedAt: new Date().toISOString(),
        });

        setSuccess("Root Card assigned successfully!");
        setTimeout(() => {
          if (onSubmit) onSubmit();
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to assign root card");
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
      
      const rootCardData = {
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
          name: formData.productDetails?.itemName || formData.projectName || "Project Item",
          description: formData.productDetails?.itemDescription || formData.projectRequirements?.specifications || "",
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

      const response = await axios.post("/root-cards", rootCardData);
      const createdOrderId = response.data.rootCard?.id;

      if (!createdOrderId) {
        throw new Error('Failed to create root card - no ID returned');
      }

      console.log('Root Card created with ID:', createdOrderId);

      try {
        const mergedFormData = {
          ...formData,
          materialDetailsTable: state.materialDetailsTable,
          productionPhaseDetails: state.productionPhaseDetails
        };
        const summary = await saveAllStepsToRootCard(createdOrderId, mergedFormData);
        console.log('All step data saved successfully:', summary);
      } catch (err) {
        console.warn('Could not save some step data:', err.message);
      }

      try {
        const ordersData = { ...rootCardData, id: createdOrderId };
        const notifications = await sendAssignmentNotifications(ordersData, formData);
        await sendOrderCreatedNotification(ordersData, formData);
        console.log('Notifications sent successfully:', notifications.length, 'notifications');
      } catch (err) {
        console.warn('Could not send notifications:', err.message);
      }

      try {
        if (state.createdOrderId) {
          await axios.delete(`/root-cards/drafts/${state.createdOrderId}`);
          console.log('Draft deleted successfully');
        }
      } catch (err) {
        console.warn('Could not delete draft:', err.message);
      }

      setSuccess("Root Card created and all steps saved successfully!");
      setTimeout(() => {
        if (onSubmit) onSubmit();
      }, 2000);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || err.message || "Failed to create root card");
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'view') {
    return (
      <RootCardViewOnly 
        formData={formData} 
        initialData={initialData} 
        onBack={onCancel} 
        employees={state.employees}
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
