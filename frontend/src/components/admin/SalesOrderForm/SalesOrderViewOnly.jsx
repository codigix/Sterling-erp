import React, { useState } from 'react';
import { Download, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Card, { CardContent } from '../../ui/Card';
import './SalesOrderView.css';

export default function SalesOrderViewOnly({ formData, initialData, onBack }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;

      doc.setFontSize(16);
      doc.text('Sales Order Details', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(10);
      doc.setTextColor(100);

      const addSection = (title, data) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(title, margin, yPosition);
        yPosition += 8;

        doc.setLineWidth(0.5);
        doc.setDrawColor(200);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        Object.entries(data).forEach(([key, value]) => {
          if (!value) return;

          if (yPosition > pageHeight - 15) {
            doc.addPage();
            yPosition = 20;
          }

          const label = key.replace(/([A-Z])/g, ' $1').trim();
          const displayValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);

          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text(`${label}:`, margin, yPosition);

          doc.setTextColor(0);
          const splitText = doc.splitTextToSize(displayValue, contentWidth - 50);
          doc.text(splitText, margin + 50, yPosition);

          yPosition += Math.max(5, splitText.length * 4) + 3;
        });

        yPosition += 5;
      };

      if (initialData?.po_number || formData?.poNumber) {
        addSection('Step 1: Client PO Details', {
          'PO Number': initialData?.po_number || formData?.poNumber,
          'Client Name': initialData?.customer || formData?.clientName,
          'Client Email': formData?.clientEmail,
          'Client Phone': formData?.clientPhone,
          'Client Address': formData?.clientAddress,
          'Project Name': initialData?.project_name || formData?.projectName,
          'Project Code': formData?.projectCode,
          'PO Date': formData?.poDate,
          'PO Value': formData?.poValue,
          'Currency': formData?.currency,
          'Terms & Conditions': formData?.termsConditions,
        });
      }

      if (initialData?.order_date || formData?.orderDate) {
        addSection('Step 2: Sales Order Details', {
          'Order Date': initialData?.order_date || formData?.orderDate,
          'Total Amount': initialData?.total || formData?.totalAmount,
          'Priority': initialData?.priority || formData?.projectPriority,
          'Estimated End Date': initialData?.due_date || formData?.estimatedEndDate,
          'Description': formData?.orderDescription,
        });
      }

      if (formData?.designEngineering) {
        const designData = formData.designEngineering;
        addSection('Step 3: Design Engineering', {
          'Design ID': designData.generalDesignInfo?.designId,
          'Product Name': designData.productSpecification?.productName,
          'Design Status': designData.generalDesignInfo?.designStatus,
          'Design Engineer Name': designData.generalDesignInfo?.designEngineerName,
          'Length (mm)': designData.productSpecification?.systemLength,
          'Width (mm)': designData.productSpecification?.systemWidth,
          'Height (mm)': designData.productSpecification?.systemHeight,
          'Load Capacity (kg)': designData.productSpecification?.loadCapacity,
          'Operating Environment': designData.productSpecification?.operatingEnvironment,
          'Material Grade': designData.productSpecification?.materialGrade,
          'Surface Finish': designData.productSpecification?.surfaceFinish,
          'Steel Sections': designData.materialsRequired?.steelSections?.join(', ') || 'None',
          'Plates': designData.materialsRequired?.plates?.join(', ') || 'None',
          'Fasteners': designData.materialsRequired?.fasteners?.join(', ') || 'None',
          'Components': designData.materialsRequired?.components?.join(', ') || 'None',
          'Electrical': designData.materialsRequired?.electrical?.join(', ') || 'None',
          'Consumables': designData.materialsRequired?.consumables?.join(', ') || 'None',
          'Design Specifications Summary': designData.commentsNotes?.designSpecifications,
          'Manufacturing Instructions': designData.commentsNotes?.manufacturingInstructions,
          'Quality & Safety Requirements': designData.commentsNotes?.qualitySafety,
          'Additional Notes': designData.commentsNotes?.additionalNotes,
        });
      }

      if (formData?.materialProcurement) {
        const matData = formData.materialProcurement;
        const materialsDetails = Array.isArray(matData.materials) ? matData.materials.map((mat, idx) => `${idx + 1}. ${mat.name || mat.type || 'Material'} - Qty: ${mat.quantity || 'N/A'}`).join('; ') : 'None';
        addSection('Step 4: Material Requirements', {
          'Total Material Cost': matData.totalMaterialCost,
          'Procurement Status': matData.procurementStatus,
          'Materials Count': Array.isArray(matData.materials) ? matData.materials.length : 0,
          'Materials Details': materialsDetails,
          'Notes': matData.notes,
        });
      }

      if (formData?.productionPlan) {
        const prodData = formData.productionPlan;
        addSection('Step 5: Production Plan', {
          'Selected Phases': prodData.selectedPhases ? Object.keys(prodData.selectedPhases).join(', ') : 'N/A',
          'Production Notes': prodData.productionNotes,
          'Estimated Completion': prodData.estimatedCompletionDate,
        });
      }

      if (formData?.qualityCheck) {
        const qcData = formData.qualityCheck;
        const inspectionsDetails = Array.isArray(qcData.inspections) ? qcData.inspections.map((insp, idx) => `${idx + 1}. ${insp.type || 'Inspection'} - ${insp.result || 'N/A'}`).join('; ') : 'None';
        addSection('Step 6: Quality Check', {
          'Inspection Type': qcData.inspectionType,
          'QC Status': qcData.qcStatus,
          'Inspections Count': Array.isArray(qcData.inspections) ? qcData.inspections.length : 0,
          'Inspections Details': inspectionsDetails,
          'Remarks': qcData.remarks,
        });
      }

      if (formData?.shipment) {
        const shipData = formData.shipment;
        addSection('Step 7: Shipment', {
          'Shipment Method': shipData.shipmentMethod,
          'Carrier': shipData.carrierName,
          'Tracking Number': shipData.trackingNumber,
          'Shipment Status': shipData.shipmentStatus,
          'Estimated Delivery': shipData.estimatedDeliveryDate,
          'Shipping Address': shipData.shippingAddress,
          'Shipping Date': shipData.shippingDate,
          'Packaging Details': shipData.packagingDetails,
          'Insurance': shipData.insurance,
          'Special Handling Instructions': shipData.specialHandling,
        });
      }

      if (formData?.delivery) {
        const delData = formData.delivery;
        addSection('Step 8: Delivery & Assignment', {
          'Actual Delivery Date': delData.actualDeliveryDate,
          'Delivered To': delData.deliveredTo,
          'Installation Completed': delData.installationCompleted,
          'Site Commissioning Completed': delData.siteCommunissioningCompleted,
          'Warranty Terms Acceptance': delData.warrantyTermsAcceptance,
          'Completion Remarks': delData.completionRemarks,
          'Project Manager': delData.projectManager,
          'Production Supervisor': delData.productionSupervisor,
          'Delivery Status': delData.deliveryStatus,
          'Received By': delData.receivedBy,
          'POD Number': delData.podNumber,
          'Assigned To': delData.assignedTo,
          'Customer Contact': delData.customerContact,
        });
      }

      const fileName = `Sales_Order_${initialData?.po_number || initialData?.id || 'report'}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const DetailField = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="detail-field">
        <span className="detail-label">{label}</span>
        <span className="detail-value">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
      </div>
    );
  };

  const DetailSection = ({ title, children }) => (
    <Card className="detail-section">
      <div className="section-title">{title}</div>
      <CardContent>
        <div className="detail-fields">
          {children}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="sales-order-view">
      <div className="view-header">
        <div className="view-title-section">
          <button className="back-button" onClick={onBack} title="Back">
            <ArrowLeft size={20} />
          </button>
          <h2 className="view-title">Sales Order Details</h2>
        </div>
        <button
          className="download-button"
          onClick={generatePDF}
          disabled={isGenerating}
          title="Download as PDF"
        >
          <Download size={20} />
          <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
        </button>
      </div>

      <div className="view-content">
        {(initialData?.po_number || formData?.poNumber) && (
          <DetailSection title="Step 1: Client PO Details">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">PO Information</h4>
              <DetailField label="PO Number" value={initialData?.po_number || formData?.poNumber} />
              <DetailField label="PO Date" value={formData?.poDate} />
              <DetailField label="PO Value" value={formData?.poValue} />
              <DetailField label="Currency" value={formData?.currency} />
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">Client Details</h4>
              <DetailField label="Client Name" value={initialData?.customer || formData?.clientName} />
              <DetailField label="Client Email" value={formData?.clientEmail} />
              <DetailField label="Client Phone" value={formData?.clientPhone} />
              <DetailField label="Client Address" value={formData?.clientAddress} />
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">Project Details</h4>
              <DetailField label="Project Name" value={initialData?.project_name || formData?.projectName} />
              <DetailField label="Project Code" value={formData?.projectCode} />
              <DetailField label="Billing Address" value={formData?.billingAddress} />
              <DetailField label="Shipping Address" value={formData?.shippingAddress} />
              {formData?.projectRequirements && Object.keys(formData.projectRequirements).length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-slate-400 font-medium">Project Requirements:</p>
                  <div className="text-sm text-slate-300 ml-2">
                    {Object.entries(formData.projectRequirements).map(([key, value]) => 
                      value ? <p key={key}><strong>{key}:</strong> {String(value)}</p> : null
                    )}
                  </div>
                </div>
              )}
              <DetailField label="Notes" value={formData?.notes} />
            </div>
          </DetailSection>
        )}

        {(initialData?.order_date || formData?.orderDate) && (
          <DetailSection title="Step 2: Sales Order Details">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">Order Information</h4>
              <DetailField label="Order Date" value={initialData?.order_date || formData?.orderDate} />
              <DetailField label="Total Amount" value={initialData?.total || formData?.totalAmount} />
              <DetailField label="Priority" value={initialData?.priority || formData?.projectPriority} />
              <DetailField label="Estimated End Date" value={initialData?.due_date || formData?.estimatedEndDate} />
              <DetailField label="Project Code" value={formData?.projectCode} />
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">Sales & Contact Details</h4>
              <DetailField label="Client Email" value={formData?.clientEmail} />
              <DetailField label="Client Phone" value={formData?.clientPhone} />
              <DetailField label="Billing Address" value={formData?.billingAddress} />
              <DetailField label="Shipping Address" value={formData?.shippingAddress} />
            </div>

            {formData?.productDetails && Object.keys(formData.productDetails).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Product/Item Details</h4>
                <DetailField label="Item Name" value={formData.productDetails?.itemName} />
                <DetailField label="Item Description" value={formData.productDetails?.itemDescription} />
                <DetailField label="Components Included" value={formData.productDetails?.componentsList} />
              </div>
            )}

            {formData?.qualityCompliance && Object.keys(formData.qualityCompliance).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Quality Compliance</h4>
                <DetailField label="Quality Standards" value={formData.qualityCompliance?.qualityStandards} />
                <DetailField label="Welding Standards" value={formData.qualityCompliance?.weldingStandards} />
                <DetailField label="Surface Finish" value={formData.qualityCompliance?.surfaceFinish} />
                <DetailField label="Mechanical Load Testing" value={formData.qualityCompliance?.mechanicalLoadTesting} />
                <DetailField label="Electrical Compliance" value={formData.qualityCompliance?.electricalCompliance} />
                <DetailField label="Documents Required" value={formData.qualityCompliance?.documentsRequired} />
              </div>
            )}

            {formData?.warrantySupport && Object.keys(formData.warrantySupport).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Warranty & Support</h4>
                <DetailField label="Warranty Period" value={formData.warrantySupport?.warrantyPeriod} />
                <DetailField label="Warranty Coverage" value={formData.warrantySupport?.warrantyCoverage} />
                <DetailField label="Service Support" value={formData.warrantySupport?.serviceSupport} />
              </div>
            )}

            {formData?.paymentTerms && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Payment Terms</h4>
                <DetailField label="Payment Terms" value={formData?.paymentTerms} />
              </div>
            )}

            {formData?.specialInstructions && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Special Instructions</h4>
                <DetailField label="Special Instructions" value={formData?.specialInstructions} />
              </div>
            )}

            {formData?.internalInfo && Object.keys(formData.internalInfo).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Internal Information</h4>
                <DetailField label="Internal Project Owner" value={formData.internalInfo?.internalProjectOwner} />
                <DetailField label="Internal Notes" value={formData.internalInfo?.internalNotes} />
              </div>
            )}
          </DetailSection>
        )}

        {formData?.designEngineering && (
          <DetailSection title="Step 3: Design Engineering">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">Design Overview</h4>
              <DetailField label="Design ID" value={formData.designEngineering.generalDesignInfo?.designId} />
              <DetailField label="Product Name" value={formData.designEngineering.productSpecification?.productName} />
              <DetailField label="Design Status" value={formData.designEngineering.generalDesignInfo?.designStatus} />
              <DetailField label="Design Engineer Name" value={formData.designEngineering.generalDesignInfo?.designEngineerName} />
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">Product Dimensions & Specifications</h4>
              <DetailField label="Length (mm)" value={formData.designEngineering.productSpecification?.systemLength} />
              <DetailField label="Width (mm)" value={formData.designEngineering.productSpecification?.systemWidth} />
              <DetailField label="Height (mm)" value={formData.designEngineering.productSpecification?.systemHeight} />
              <DetailField label="Load Capacity (kg)" value={formData.designEngineering.productSpecification?.loadCapacity} />
              <DetailField label="Operating Environment" value={formData.designEngineering.productSpecification?.operatingEnvironment} />
              <DetailField label="Material Grade" value={formData.designEngineering.productSpecification?.materialGrade} />
              <DetailField label="Surface Finish" value={formData.designEngineering.productSpecification?.surfaceFinish} />
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">Materials Required for Production</h4>
              <DetailField label="Steel Sections" value={formData.designEngineering.materialsRequired?.steelSections?.length > 0 ? formData.designEngineering.materialsRequired.steelSections.join(', ') : 'None selected'} />
              <DetailField label="Plates" value={formData.designEngineering.materialsRequired?.plates?.length > 0 ? formData.designEngineering.materialsRequired.plates.join(', ') : 'None selected'} />
              <DetailField label="Fasteners & Hardware" value={formData.designEngineering.materialsRequired?.fasteners?.length > 0 ? formData.designEngineering.materialsRequired.fasteners.join(', ') : 'None selected'} />
              <DetailField label="Mechanical Components" value={formData.designEngineering.materialsRequired?.components?.length > 0 ? formData.designEngineering.materialsRequired.components.join(', ') : 'None selected'} />
              <DetailField label="Electrical & Automation" value={formData.designEngineering.materialsRequired?.electrical?.length > 0 ? formData.designEngineering.materialsRequired.electrical.join(', ') : 'None selected'} />
              <DetailField label="Consumables & Paint" value={formData.designEngineering.materialsRequired?.consumables?.length > 0 ? formData.designEngineering.materialsRequired.consumables.join(', ') : 'None selected'} />
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">Design Specifications & Documentation</h4>
              {formData.designEngineering.attachments?.drawings?.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-slate-400 font-medium">Design Drawings:</p>
                  <ul className="list-disc list-inside text-slate-300 text-sm">
                    {formData.designEngineering.attachments.drawings.map((file, idx) => (
                      <li key={idx}>{typeof file === 'string' ? file : file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              {formData.designEngineering.attachments?.documents?.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-slate-400 font-medium">Supporting Documents:</p>
                  <ul className="list-disc list-inside text-slate-300 text-sm">
                    {formData.designEngineering.attachments.documents.map((file, idx) => (
                      <li key={idx}>{typeof file === 'string' ? file : file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">Design Notes & Special Requirements</h4>
              <DetailField label="Design Specifications Summary" value={formData.designEngineering.commentsNotes?.designSpecifications} />
              <DetailField label="Manufacturing Instructions" value={formData.designEngineering.commentsNotes?.manufacturingInstructions} />
              <DetailField label="Quality & Safety Requirements" value={formData.designEngineering.commentsNotes?.qualitySafety} />
              <DetailField label="Additional Notes" value={formData.designEngineering.commentsNotes?.additionalNotes} />
            </div>
          </DetailSection>
        )}

        {formData?.materialProcurement && (
          <DetailSection title="Step 4: Material Requirements">
            <DetailField label="Procurement Status" value={formData.materialProcurement.procurementStatus || 'Not specified'} />
            <DetailField label="Total Material Cost" value={formData.materialProcurement.totalMaterialCost || '0'} />
            <DetailField label="Materials Count" value={Array.isArray(formData.materialProcurement.materials) ? formData.materialProcurement.materials.length : 0} />
            <DetailField label="Notes" value={formData.materialProcurement.notes || 'No notes'} />
            
            {Array.isArray(formData.materialProcurement.materials) && formData.materialProcurement.materials.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Materials List</h4>
                <div className="bg-slate-800 rounded p-3 text-sm text-slate-300">
                  {formData.materialProcurement.materials.map((material, idx) => (
                    <div key={idx} className="mb-2 pb-2 border-b border-slate-700 last:border-0">
                      <p><strong>{material.name || material.type || 'Material ' + (idx + 1)}</strong></p>
                      {material.quantity && <p>Quantity: {material.quantity} {material.unit || ''}</p>}
                      {material.cost && <p>Cost: {material.cost}</p>}
                      {material.source && <p>Source: {material.source}</p>}
                      {material.status && <p>Status: {material.status}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DetailSection>
        )}

        {formData?.productionPlan && (
          <DetailSection title="Step 5: Production Plan">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">Production Timeline</h4>
              <DetailField label="Production Start Date" value={formData.productionPlan.timeline?.startDate} />
              <DetailField label="Production End Date" value={formData.productionPlan.timeline?.endDate} />
              <DetailField label="Estimated Completion Date" value={formData.productionPlan.estimatedCompletionDate} />
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">Production Notes</h4>
              <DetailField label="Notes" value={formData.productionPlan.productionNotes} />
            </div>
            
            {formData.productionPlan.selectedPhases && Object.keys(formData.productionPlan.selectedPhases).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Production Phases</h4>
                <div className="space-y-2">
                  {Object.entries(formData.productionPlan.selectedPhases).map(([phase, selected]) => (
                    selected && <p key={phase} className="text-slate-300 text-sm">✓ {phase}</p>
                  ))}
                </div>
              </div>
            )}
          </DetailSection>
        )}

        {formData?.qualityCheck && (
          <DetailSection title="Step 6: Quality Check">
            {formData.qualityCheck?.qualityCompliance && Object.keys(formData.qualityCheck.qualityCompliance).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Quality Standards</h4>
                <DetailField label="Quality Standards" value={formData.qualityCheck.qualityCompliance?.qualityStandards} />
                <DetailField label="Welding Standards" value={formData.qualityCheck.qualityCompliance?.weldingStandards} />
                <DetailField label="Surface Finish" value={formData.qualityCheck.qualityCompliance?.surfaceFinish} />
                <DetailField label="Mechanical Load Testing" value={formData.qualityCheck.qualityCompliance?.mechanicalLoadTesting} />
                <DetailField label="Electrical Compliance" value={formData.qualityCheck.qualityCompliance?.electricalCompliance} />
                <DetailField label="Documents Required" value={formData.qualityCheck.qualityCompliance?.documentsRequired} />
              </div>
            )}

            {formData.qualityCheck?.warrantySupport && Object.keys(formData.qualityCheck.warrantySupport).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Warranty & Support</h4>
                <DetailField label="Warranty Period" value={formData.qualityCheck.warrantySupport?.warrantyPeriod} />
                <DetailField label="Service Support" value={formData.qualityCheck.warrantySupport?.serviceSupport} />
              </div>
            )}

            {formData.qualityCheck?.internalProjectOwner && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Internal Assignment</h4>
                <DetailField label="Internal Project Owner" value={formData.qualityCheck?.internalProjectOwner} />
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">QC Status & Inspections</h4>
              <DetailField label="Inspection Type" value={formData.qualityCheck.inspectionType} />
              <DetailField label="QC Status" value={formData.qualityCheck.qcStatus} />
              <DetailField label="Remarks" value={formData.qualityCheck.remarks} />
              <DetailField label="Inspection Count" value={Array.isArray(formData.qualityCheck.inspections) ? formData.qualityCheck.inspections.length : 0} />
            </div>
            
            {Array.isArray(formData.qualityCheck.inspections) && formData.qualityCheck.inspections.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Inspection Details</h4>
                <div className="bg-slate-800 rounded p-3 text-sm text-slate-300">
                  {formData.qualityCheck.inspections.map((inspection, idx) => (
                    <div key={idx} className="mb-2 pb-2 border-b border-slate-700 last:border-0">
                      <p><strong>{inspection.type || 'Inspection ' + (idx + 1)}</strong></p>
                      {inspection.result && <p>Result: {inspection.result}</p>}
                      {inspection.notes && <p>Notes: {inspection.notes}</p>}
                      {inspection.status && <p>Status: {inspection.status}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DetailSection>
        )}

        {formData?.shipment && (
          <DetailSection title="Step 7: Shipment & Logistics">
            {formData.deliveryTerms && Object.keys(formData.deliveryTerms).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Delivery Schedule & Setup</h4>
                <DetailField label="Delivery Schedule" value={formData.deliveryTerms?.deliverySchedule} />
                <DetailField label="Packaging Information" value={formData.deliveryTerms?.packagingInfo} />
                <DetailField label="Dispatch Mode" value={formData.deliveryTerms?.dispatchMode} />
                <DetailField label="Installation Required" value={formData.deliveryTerms?.installationRequired} />
                <DetailField label="Site Commissioning" value={formData.deliveryTerms?.siteCommissioning} />
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">Shipment Details</h4>
              <DetailField label="Marking" value={formData.shipment?.marking} />
              <DetailField label="Dismantling" value={formData.shipment?.dismantling} />
              <DetailField label="Packing" value={formData.shipment?.packing} />
              <DetailField label="Dispatch" value={formData.shipment?.dispatch} />
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">Shipping Information</h4>
              <DetailField label="Shipment Method" value={formData.shipment.shipmentMethod} />
              <DetailField label="Carrier" value={formData.shipment.carrierName} />
              <DetailField label="Tracking Number" value={formData.shipment.trackingNumber} />
              <DetailField label="Shipment Status" value={formData.shipment.shipmentStatus} />
              <DetailField label="Estimated Delivery" value={formData.shipment.estimatedDeliveryDate} />
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-2">Packaging & Handling</h4>
              <DetailField label="Shipping Address" value={formData.shipment.shippingAddress} />
              <DetailField label="Shipping Date" value={formData.shipment.shippingDate} />
              <DetailField label="Packaging Details" value={formData.shipment.packagingDetails} />
              <DetailField label="Insurance" value={formData.shipment.insurance} />
              <DetailField label="Special Handling Instructions" value={formData.shipment.specialHandling} />
            </div>
          </DetailSection>
        )}

        {formData?.delivery && (
          <DetailSection title="Step 8: Delivery & Assignment">
            <DetailField label="Actual Delivery Date" value={formData.delivery.actualDeliveryDate} />
            <DetailField label="Delivered To" value={formData.delivery.deliveredTo} />
            <DetailField label="Installation Completed" value={formData.delivery.installationCompleted} />
            <DetailField label="Site Commissioning Completed" value={formData.delivery.siteCommunissioningCompleted} />
            <DetailField label="Warranty Terms Acceptance" value={formData.delivery.warrantyTermsAcceptance} />
            <DetailField label="Completion Remarks" value={formData.delivery.completionRemarks} />
            <DetailField label="Project Manager" value={formData.delivery.projectManager} />
            <DetailField label="Production Supervisor" value={formData.delivery.productionSupervisor} />
            <DetailField label="Delivery Status" value={formData.delivery.deliveryStatus} />
            <DetailField label="Received By" value={formData.delivery.receivedBy} />
            <DetailField label="POD Number" value={formData.delivery.podNumber} />
            <DetailField label="Assigned To" value={formData.delivery.assignedTo} />
            <DetailField label="Customer Contact" value={formData.delivery.customerContact} />
          </DetailSection>
        )}

        {!formData?.poNumber && !initialData?.po_number && (
          <Card className="empty-state">
            <CardContent>
              <p>No data filled in this sales order yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
