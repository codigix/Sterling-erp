import React, { useState } from 'react';
import { Download, ArrowLeft, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
      doc.text('Root Card Details', margin, yPosition);
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
        addSection('Step 2: Root Card Details', {
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
    if (!value && value !== 0) return null;
    return (
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
        <p className="text-sm text-slate-700">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
      </div>
    );
  };

  const SectionHeader = ({ number, title }) => (
    <div className="flex items-center gap-3 mb-2 border-b border-slate-200 pb-2">
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
        {number}
      </span>
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
  );

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto p-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Back"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Root Card Details
</h1>
                <p className="text-sm text-slate-600">
                  {initialData?.po_number || formData?.poNumber || 'New Sales Order'}
                </p>
              </div>
            </div>
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors"
              title="Download as PDF"
            >
              <Download size={18} />
              {isGenerating ? 'Generating...' : 'PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto  p-2 space-y-2">
        {!formData?.poNumber && !initialData?.po_number && (
          <div className="text-center py-12">
            <p className="text-slate-600">No data filled in this sales order yet.</p>
          </div>
        )}

        {/* Step 1: PO Details */}
        {(initialData?.po_number || formData?.poNumber) && (
          <section>
            <SectionHeader number="1" title="PO Details" />
            <div className="space-y-6">
              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">PO Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="PO Number" value={initialData?.po_number || formData?.poNumber} />
                  <DetailField label="PO Date" value={formData?.poDate} />
                  <DetailField label="PO Value" value={formData?.poValue} />
                  <DetailField label="Currency" value={formData?.currency} />
                </div>
              </div>

              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">Client Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Client Name" value={initialData?.customer || formData?.clientName} />
                  <DetailField label="Client Email" value={formData?.clientEmail} />
                  <DetailField label="Client Phone" value={formData?.clientPhone} />
                  <DetailField label="Client Address" value={formData?.clientAddress} />
                </div>
              </div>

              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">Project Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Project Name" value={initialData?.project_name || formData?.projectName} />
                  <DetailField label="Project Code" value={formData?.projectCode} />
                  <DetailField label="Billing Address" value={formData?.billingAddress} />
                  <DetailField label="Shipping Address" value={formData?.shippingAddress} />
                </div>
                {formData?.projectRequirements && Object.keys(formData.projectRequirements).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Project Requirements</h4>
                    <div className="space-y-2">
                      {Object.entries(formData.projectRequirements).map(([key, value]) =>
                        value ? (
                          <p key={key} className="text-sm text-slate-600">
                            <span className="text-slate-700 font-medium">{key}:</span> {String(value)}
                          </p>
                        ) : null
                      )}
                    </div>
                  </div>
                )}
                <DetailField label="Notes" value={formData?.notes} />
              </div>
            </div>
          </section>
        )}

        {/* Step 2: Sales Order */}
        {(initialData?.order_date || formData?.orderDate) && (
          <section>
            <SectionHeader number="2" title="Sales Order" />
            <div className="space-y-6">
              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">Order Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Order Date" value={initialData?.order_date || formData?.orderDate} />
                  <DetailField label="Total Amount" value={initialData?.total || formData?.totalAmount} />
                  <DetailField label="Priority" value={initialData?.priority || formData?.projectPriority} />
                  <DetailField label="Estimated End Date" value={initialData?.due_date || formData?.estimatedEndDate} />
                </div>
              </div>

              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">Order Description</h3>
                <p className="text-slate-700 whitespace-pre-wrap">{formData?.orderDescription}</p>
              </div>

              {formData?.warrantySupport && Object.keys(formData.warrantySupport).length > 0 && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <h3 className="text-md font-semibold text-slate-900 mb-2">Warranty & Support</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailField label="Warranty Period" value={formData.warrantySupport?.warrantyPeriod} />
                    <DetailField label="Warranty Coverage" value={formData.warrantySupport?.warrantyCoverage} />
                    <DetailField label="Service Support" value={formData.warrantySupport?.serviceSupport} />
                  </div>
                </div>
              )}

              {formData?.paymentTerms && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <DetailField label="Payment Terms" value={formData?.paymentTerms} />
                </div>
              )}

              {formData?.specialInstructions && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <DetailField label="Special Instructions" value={formData?.specialInstructions} />
                </div>
              )}

              {formData?.internalInfo && Object.keys(formData.internalInfo).length > 0 && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <h3 className="text-md font-semibold text-slate-900 mb-2">Internal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailField label="Internal Project Owner" value={formData.internalInfo?.internalProjectOwner} />
                    <DetailField label="Internal Notes" value={formData.internalInfo?.internalNotes} />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Step 3: Design */}
        {formData?.designEngineering && (
          <section>
            <SectionHeader number="3" title="Design Engineering" />
            <div className="space-y-6">
              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">Design Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Design ID" value={formData.designEngineering.generalDesignInfo?.designId} />
                  <DetailField label="Product Name" value={formData.designEngineering.productSpecification?.productName} />
                  <DetailField label="Design Status" value={formData.designEngineering.generalDesignInfo?.designStatus} />
                  <DetailField label="Design Engineer Name" value={formData.designEngineering.generalDesignInfo?.designEngineerName} />
                </div>
              </div>

              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">Product Dimensions & Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Length (mm)" value={formData.designEngineering.productSpecification?.systemLength} />
                  <DetailField label="Width (mm)" value={formData.designEngineering.productSpecification?.systemWidth} />
                  <DetailField label="Height (mm)" value={formData.designEngineering.productSpecification?.systemHeight} />
                  <DetailField label="Load Capacity (kg)" value={formData.designEngineering.productSpecification?.loadCapacity} />
                  <DetailField label="Operating Environment" value={formData.designEngineering.productSpecification?.operatingEnvironment} />
                  <DetailField label="Material Grade" value={formData.designEngineering.productSpecification?.materialGrade} />
                  <DetailField label="Surface Finish" value={formData.designEngineering.productSpecification?.surfaceFinish} />
                </div>
              </div>

              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">Materials Required for Production</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Steel Sections" value={formData.designEngineering.materialsRequired?.steelSections?.length > 0 ? formData.designEngineering.materialsRequired.steelSections.join(', ') : 'None selected'} />
                  <DetailField label="Plates" value={formData.designEngineering.materialsRequired?.plates?.length > 0 ? formData.designEngineering.materialsRequired.plates.join(', ') : 'None selected'} />
                  <DetailField label="Fasteners & Hardware" value={formData.designEngineering.materialsRequired?.fasteners?.length > 0 ? formData.designEngineering.materialsRequired.fasteners.join(', ') : 'None selected'} />
                  <DetailField label="Mechanical Components" value={formData.designEngineering.materialsRequired?.components?.length > 0 ? formData.designEngineering.materialsRequired.components.join(', ') : 'None selected'} />
                  <DetailField label="Electrical & Automation" value={formData.designEngineering.materialsRequired?.electrical?.length > 0 ? formData.designEngineering.materialsRequired.electrical.join(', ') : 'None selected'} />
                  <DetailField label="Consumables & Paint" value={formData.designEngineering.materialsRequired?.consumables?.length > 0 ? formData.designEngineering.materialsRequired.consumables.join(', ') : 'None selected'} />
                </div>
              </div>

              {formData.designEngineering.attachments?.drawings?.length > 0 && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <h3 className="text-md font-semibold text-slate-900 mb-2">Design Drawings</h3>
                  <ul className="space-y-2">
                    {formData.designEngineering.attachments.drawings.map((file, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        {typeof file === 'string' ? file : file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {formData.designEngineering.attachments?.documents?.length > 0 && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <h3 className="text-md font-semibold text-slate-900 mb-2">Supporting Documents</h3>
                  <ul className="space-y-2">
                    {formData.designEngineering.attachments.documents.map((file, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        {typeof file === 'string' ? file : file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">Design Notes & Special Requirements</h3>
                <div className="space-y-4">
                  <DetailField label="Design Specifications Summary" value={formData.designEngineering.commentsNotes?.designSpecifications} />
                  <DetailField label="Manufacturing Instructions" value={formData.designEngineering.commentsNotes?.manufacturingInstructions} />
                  <DetailField label="Quality & Safety Requirements" value={formData.designEngineering.commentsNotes?.qualitySafety} />
                  <DetailField label="Additional Notes" value={formData.designEngineering.commentsNotes?.additionalNotes} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 4: Materials */}
        {formData?.materialProcurement && (
          <section>
            <SectionHeader number="4" title="Material Requirements" />
            <div className="space-y-6">
              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">Procurement Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Procurement Status" value={formData.materialProcurement.procurementStatus || 'Not specified'} />
                  <DetailField label="Total Material Cost" value={formData.materialProcurement.totalMaterialCost || '0'} />
                  <DetailField label="Materials Count" value={Array.isArray(formData.materialProcurement.materials) ? formData.materialProcurement.materials.length : 0} />
                </div>
              </div>

              {formData.materialProcurement.notes && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <DetailField label="Notes" value={formData.materialProcurement.notes} />
                </div>
              )}

              {Array.isArray(formData.materialProcurement.materials) && formData.materialProcurement.materials.length > 0 && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <h3 className="text-md font-semibold text-slate-900 mb-2">Materials List</h3>
                  <div className="flex flex-wrap gap-4">
                    {formData.materialProcurement.materials.map((material, idx) => (
                      <div key={idx} className="bg-slate-50 rounded p-4 border border-slate-200 w-fit">
                        <p className="text-sm text-slate-900 font-medium mb-2 w-fit">{material.name || material.type || 'Material ' + (idx + 1)}</p>
                        <div className="flex flex-wrap gap-3 text-xs">
                          {material.quantity && <p className="text-slate-600"><span className="text-slate-700">Qty:</span> {material.quantity} {material.unit || ''}</p>}
                          {material.cost && <p className="text-slate-600"><span className="text-slate-700">Cost:</span> {material.cost}</p>}
                          {material.source && <p className="text-slate-600"><span className="text-slate-700">Source:</span> {material.source}</p>}
                          {material.status && <p className="text-slate-600"><span className="text-slate-700">Status:</span> {material.status}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Step 5: Production */}
        {formData?.productionPlan && (
          <section>
            <SectionHeader number="5" title="Production Plan" />
            <div className="space-y-6">
              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">Production Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Production Start Date" value={formData.productionPlan.timeline?.startDate} />
                  <DetailField label="Production End Date" value={formData.productionPlan.timeline?.endDate} />
                  <DetailField label="Estimated Completion Date" value={formData.productionPlan.estimatedCompletionDate} />
                </div>
              </div>

              {formData.productionPlan.productionNotes && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <h3 className="text-md font-semibold text-slate-900 mb-2">Production Notes</h3>
                  <p className="text-slate-700 text-sm">{formData.productionPlan.productionNotes}</p>
                </div>
              )}

              {formData.productionPlan.selectedPhases && Object.keys(formData.productionPlan.selectedPhases).length > 0 && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <h3 className="text-md font-semibold text-slate-900 mb-2">Production Phases</h3>
                  <div className="space-y-2">
                    {Object.entries(formData.productionPlan.selectedPhases).map(([phase, selected]) =>
                      selected ? (
                        <div key={phase} className="flex items-center gap-2 text-slate-700 text-sm">
                          <CheckCircle2 size={16} className="text-green-500" />
                          {phase}
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Step 6: Quality Check */}
        {formData?.qualityCheck && (
          <section>
            <SectionHeader number="6" title="Quality Check" />
            <div className="space-y-6">
              {formData.qualityCheck?.qualityCompliance && Object.keys(formData.qualityCheck.qualityCompliance).length > 0 && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <h3 className="text-md font-semibold text-slate-900 mb-2">Quality Standards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailField label="Quality Standards" value={formData.qualityCheck.qualityCompliance?.qualityStandards} />
                    <DetailField label="Welding Standards" value={formData.qualityCheck.qualityCompliance?.weldingStandards} />
                    <DetailField label="Surface Finish" value={formData.qualityCheck.qualityCompliance?.surfaceFinish} />
                    <DetailField label="Mechanical Load Testing" value={formData.qualityCheck.qualityCompliance?.mechanicalLoadTesting} />
                    <DetailField label="Electrical Compliance" value={formData.qualityCheck.qualityCompliance?.electricalCompliance} />
                    <DetailField label="Documents Required" value={formData.qualityCheck.qualityCompliance?.documentsRequired} />
                  </div>
                </div>
              )}

              {formData.qualityCheck?.warrantySupport && Object.keys(formData.qualityCheck.warrantySupport).length > 0 && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <h3 className="text-md font-semibold text-slate-900 mb-2">Warranty & Support</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailField label="Warranty Period" value={formData.qualityCheck.warrantySupport?.warrantyPeriod} />
                    <DetailField label="Service Support" value={formData.qualityCheck.warrantySupport?.serviceSupport} />
                  </div>
                </div>
              )}

              {formData.qualityCheck?.internalProjectOwner && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <DetailField label="Internal Project Owner" value={formData.qualityCheck?.internalProjectOwner} />
                </div>
              )}

              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">QC Status & Inspections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <DetailField label="Inspection Type" value={formData.qualityCheck.inspectionType} />
                  <DetailField label="QC Status" value={formData.qualityCheck.qcStatus} />
                  <DetailField label="Remarks" value={formData.qualityCheck.remarks} />
                  <DetailField label="Inspection Count" value={Array.isArray(formData.qualityCheck.inspections) ? formData.qualityCheck.inspections.length : 0} />
                </div>

                {Array.isArray(formData.qualityCheck.inspections) && formData.qualityCheck.inspections.length > 0 && (
                  <div className="border-t border-slate-200 pt-6">
                    <h4 className="text-sm font-semibold text-slate-700 mb-4">Inspection Details</h4>
                    <div className="space-y-3">
                      {formData.qualityCheck.inspections.map((inspection, idx) => (
                        <div key={idx} className="bg-slate-50 rounded p-4 border border-slate-200">
                          <p className="font-medium text-slate-900 mb-2">{inspection.type || 'Inspection ' + (idx + 1)}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            {inspection.date && <p className="text-slate-600"><span className="text-slate-700">Date:</span> {inspection.date}</p>}
                            {inspection.inspector && <p className="text-slate-600"><span className="text-slate-700">Inspector:</span> {inspection.inspector}</p>}
                            {inspection.result && <p className="text-slate-600"><span className="text-slate-700">Result:</span> {inspection.result}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Step 7: Shipment */}
        {formData?.shipment && (
          <section>
            <SectionHeader number="7" title="Shipment" />
            <div className="space-y-6">
              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">Shipment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Shipment Method" value={formData.shipment.shipmentMethod} />
                  <DetailField label="Carrier Name" value={formData.shipment.carrierName} />
                  <DetailField label="Tracking Number" value={formData.shipment.trackingNumber} />
                  <DetailField label="Shipment Status" value={formData.shipment.shipmentStatus} />
                  <DetailField label="Estimated Delivery Date" value={formData.shipment.estimatedDeliveryDate} />
                  <DetailField label="Shipping Address" value={formData.shipment.shippingAddress} />
                  <DetailField label="Shipping Date" value={formData.shipment.shippingDate} />
                </div>
              </div>

              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">Packaging & Handling</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Packaging Details" value={formData.shipment.packagingDetails} />
                  <DetailField label="Insurance" value={formData.shipment.insurance} />
                  <DetailField label="Special Handling Instructions" value={formData.shipment.specialHandling} />
                </div>
              </div>

              {formData.shipment.attachments?.length > 0 && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <h3 className="text-md font-semibold text-slate-900 mb-2">Shipment Documents</h3>
                  <ul className="space-y-2">
                    {formData.shipment.attachments.map((file, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        {typeof file === 'string' ? file : file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Step 8: Delivery */}
        {formData?.delivery && (
          <section>
            <SectionHeader number="8" title="Delivery & Assignment" />
            <div className="space-y-6">
              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">Delivery Confirmation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Actual Delivery Date" value={formData.delivery.actualDeliveryDate} />
                  <DetailField label="Delivered To" value={formData.delivery.deliveredTo} />
                  <DetailField label="Received By" value={formData.delivery.receivedBy} />
                  <DetailField label="POD Number" value={formData.delivery.podNumber} />
                  <DetailField label="Delivery Status" value={formData.delivery.deliveryStatus} />
                </div>
              </div>

              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">Installation & Commissioning</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Installation Completed" value={formData.delivery.installationCompleted} />
                  <DetailField label="Site Commissioning Completed" value={formData.delivery.siteCommunissioningCompleted} />
                  <DetailField label="Warranty Terms Acceptance" value={formData.delivery.warrantyTermsAcceptance} />
                </div>
              </div>

              <div className="bg-white border-b border-slate-200  p-2 mb-0">
                <h3 className="text-md font-semibold text-slate-900 mb-2">Project Assignment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField label="Project Manager" value={formData.delivery.projectManager} />
                  <DetailField label="Production Supervisor" value={formData.delivery.productionSupervisor} />
                  <DetailField label="Assigned To" value={formData.delivery.assignedTo} />
                  <DetailField label="Customer Contact" value={formData.delivery.customerContact} />
                </div>
              </div>

              {formData.delivery.completionRemarks && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <h3 className="text-md font-semibold text-slate-900 mb-2">Completion Remarks</h3>
                  <p className="text-slate-700 text-sm">{formData.delivery.completionRemarks}</p>
                </div>
              )}

              {formData.delivery.attachments?.length > 0 && (
                <div className="bg-white border-b border-slate-200  p-2 mb-0">
                  <h3 className="text-md font-semibold text-slate-900 mb-2">Delivery Documents</h3>
                  <ul className="space-y-2">
                    {formData.delivery.attachments.map((file, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        {typeof file === 'string' ? file : file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
