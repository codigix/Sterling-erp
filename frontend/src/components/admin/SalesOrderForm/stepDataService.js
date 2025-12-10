import axios from "../../../utils/api";

export const saveAllStepData = async (salesOrderId, formData) => {
  console.log('Saving all step data for order:', salesOrderId);
  const results = { success: [], failed: [] };

  try {
    if (formData.poNumber || formData.clientName) {
      try {
        await axios.post(`/api/sales/steps/${salesOrderId}/client-po`, {
          poNumber: formData.poNumber,
          poDate: formData.poDate || new Date().toISOString().split('T')[0],
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          projectName: formData.projectName,
          projectCode: formData.projectCode,
          clientAddress: formData.clientAddress,
          termsConditions: formData.termsConditions,
          projectRequirements: formData.projectRequirements
        });
        results.success.push('Step 1: Client PO');
      } catch (err) {
        console.warn('Failed to save Client PO:', err.message);
        results.failed.push('Client PO');
      }
    }

    if (formData.productList?.length > 0 || formData.qualityRequirements) {
      try {
        await axios.post(`/api/sales/steps/${salesOrderId}/sales-order`, {
          productList: formData.productList,
          qualityRequirements: formData.qualityRequirements,
          complianceInfo: formData.complianceInfo,
          paymentTerms: formData.paymentTerms,
          internalNotes: formData.internalNotes
        });
        results.success.push('Step 2: Sales Order');
      } catch (err) {
        console.warn('Failed to save Sales Order:', err.message);
        results.failed.push('Sales Order');
      }
    }

    if (formData.designEngineering || formData.estimatedCost) {
      try {
        await axios.post(`/api/sales/steps/${salesOrderId}/design-engineering`, {
          designApproach: formData.designApproach,
          estimatedCost: formData.estimatedCost,
          timelineWeeks: formData.timelineWeeks,
          designNotes: formData.designNotes,
          documentList: formData.documentList
        });
        results.success.push('Step 3: Design Engineering');
      } catch (err) {
        console.warn('Failed to save Design Engineering:', err.message);
        results.failed.push('Design Engineering');
      }
    }

    if (formData.materialProcurement?.materials?.length > 0 || formData.procurementStrategy) {
      try {
        await axios.post(`/api/sales/steps/${salesOrderId}/material-requirements`, {
          materials: formData.materialProcurement?.materials || [],
          procurementStrategy: formData.procurementStrategy,
          supplierList: formData.supplierList,
          leadTimeWeeks: formData.leadTimeWeeks,
          totalMaterialCost: formData.totalMaterialCost,
          stockStatus: formData.stockStatus
        });
        results.success.push('Step 4: Material Requirements');
      } catch (err) {
        console.warn('Failed to save Material Requirements:', err.message);
        results.failed.push('Material Requirements');
      }
    }

    if (formData.productionPlan?.phases?.length > 0 || formData.productionStrategy) {
      try {
        await axios.post(`/api/sales/steps/${salesOrderId}/production-plan`, {
          phases: formData.productionPlan?.phases || [],
          productionStrategy: formData.productionStrategy,
          estimatedDays: formData.estimatedDays,
          resourceAllocation: formData.resourceAllocation,
          productionNotes: formData.productionNotes
        });
        results.success.push('Step 5: Production Plan');
      } catch (err) {
        console.warn('Failed to save Production Plan:', err.message);
        results.failed.push('Production Plan');
      }
    }

    if (formData.qualityCheck || formData.complianceDetails) {
      try {
        await axios.post(`/api/sales/steps/${salesOrderId}/quality-check`, {
          testingStrategy: formData.testingStrategy,
          complianceStandards: formData.complianceStandards,
          warrantyPeriod: formData.warrantyPeriod,
          supportDetails: formData.supportDetails,
          complianceDetails: formData.complianceDetails
        });
        results.success.push('Step 6: Quality Check');
      } catch (err) {
        console.warn('Failed to save Quality Check:', err.message);
        results.failed.push('Quality Check');
      }
    }

    if (formData.shipment) {
      try {
        await axios.post(`/api/sales/steps/${salesOrderId}/shipment`, {
          deliveryTerms: formData.shipment?.deliveryTerms,
          shipmentProcess: formData.shipment?.shipmentProcess,
          shippingDetails: formData.shipment?.shippingDetails
        });
        results.success.push('Step 7: Shipment');
      } catch (err) {
        console.warn('Failed to save Shipment:', err.message);
        results.failed.push('Shipment');
      }
    }

    if (formData.delivery) {
      try {
        await axios.post(`/api/sales/steps/${salesOrderId}/delivery`, {
          finalDelivery: formData.delivery?.finalDelivery,
          installationStatus: formData.delivery?.installationStatus,
          warrantyInfo: formData.delivery?.warrantyInfo,
          projectCompletion: formData.delivery?.projectCompletion,
          internalInfo: formData.delivery?.internalInfo
        });
        results.success.push('Step 8: Delivery');
      } catch (err) {
        console.warn('Failed to save Delivery:', err.message);
        results.failed.push('Delivery');
      }
    }

    console.log('Step data save results:', results);
    return results;
  } catch (err) {
    console.error('Unexpected error saving step data:', err);
    throw err;
  }
};
