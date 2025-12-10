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
          'Design Status': designData.designStatus,
          'BOM Data': designData.bomData,
          'Drawings': designData.drawings3D,
          'Specifications': designData.specifications,
          'Design Notes': designData.designNotes,
        });
      }

      if (formData?.materialProcurement) {
        const matData = formData.materialProcurement;
        addSection('Step 4: Material Requirements', {
          'Total Material Cost': matData.totalMaterialCost,
          'Procurement Status': matData.procurementStatus,
          'Materials Count': Array.isArray(matData.materials) ? matData.materials.length : 0,
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
        addSection('Step 6: Quality Check', {
          'Inspection Type': qcData.inspectionType,
          'QC Status': qcData.qcStatus,
          'Inspections Count': Array.isArray(qcData.inspections) ? qcData.inspections.length : 0,
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
        });
      }

      if (formData?.delivery) {
        const delData = formData.delivery;
        addSection('Step 8: Delivery', {
          'Delivery Date': delData.deliveryDate,
          'Received By': delData.receivedBy,
          'Delivery Status': delData.deliveryStatus,
          'Delivered Quantity': delData.deliveredQuantity,
          'POD Number': delData.podNumber,
          'Delivery Notes': delData.deliveryNotes,
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
            <DetailField label="PO Number" value={initialData?.po_number || formData?.poNumber} />
            <DetailField label="Client Name" value={initialData?.customer || formData?.clientName} />
            <DetailField label="Client Email" value={formData?.clientEmail} />
            <DetailField label="Client Phone" value={formData?.clientPhone} />
            <DetailField label="Client Address" value={formData?.clientAddress} />
            <DetailField label="Project Name" value={initialData?.project_name || formData?.projectName} />
            <DetailField label="Project Code" value={formData?.projectCode} />
            <DetailField label="PO Date" value={formData?.poDate} />
            <DetailField label="PO Value" value={formData?.poValue} />
            <DetailField label="Currency" value={formData?.currency} />
          </DetailSection>
        )}

        {(initialData?.order_date || formData?.orderDate) && (
          <DetailSection title="Step 2: Sales Order Details">
            <DetailField label="Order Date" value={initialData?.order_date || formData?.orderDate} />
            <DetailField label="Total Amount" value={initialData?.total || formData?.totalAmount} />
            <DetailField label="Priority" value={initialData?.priority || formData?.projectPriority} />
            <DetailField label="Estimated End Date" value={initialData?.due_date || formData?.estimatedEndDate} />
          </DetailSection>
        )}

        {formData?.designEngineering && (
          <DetailSection title="Step 3: Design Engineering">
            <DetailField label="Design Status" value={formData.designEngineering.designStatus} />
            <DetailField label="Design Notes" value={formData.designEngineering.designNotes} />
          </DetailSection>
        )}

        {formData?.materialProcurement && (
          <DetailSection title="Step 4: Material Requirements">
            <DetailField label="Procurement Status" value={formData.materialProcurement.procurementStatus} />
            <DetailField label="Total Material Cost" value={formData.materialProcurement.totalMaterialCost} />
            <DetailField label="Materials Count" value={Array.isArray(formData.materialProcurement.materials) ? formData.materialProcurement.materials.length : 0} />
          </DetailSection>
        )}

        {formData?.productionPlan && (
          <DetailSection title="Step 5: Production Plan">
            <DetailField label="Production Notes" value={formData.productionPlan.productionNotes} />
            <DetailField label="Estimated Completion" value={formData.productionPlan.estimatedCompletionDate} />
          </DetailSection>
        )}

        {formData?.qualityCheck && (
          <DetailSection title="Step 6: Quality Check">
            <DetailField label="Inspection Type" value={formData.qualityCheck.inspectionType} />
            <DetailField label="QC Status" value={formData.qualityCheck.qcStatus} />
            <DetailField label="Remarks" value={formData.qualityCheck.remarks} />
          </DetailSection>
        )}

        {formData?.shipment && (
          <DetailSection title="Step 7: Shipment">
            <DetailField label="Shipment Method" value={formData.shipment.shipmentMethod} />
            <DetailField label="Carrier" value={formData.shipment.carrierName} />
            <DetailField label="Tracking Number" value={formData.shipment.trackingNumber} />
            <DetailField label="Shipment Status" value={formData.shipment.shipmentStatus} />
            <DetailField label="Estimated Delivery" value={formData.shipment.estimatedDeliveryDate} />
          </DetailSection>
        )}

        {formData?.delivery && (
          <DetailSection title="Step 8: Delivery">
            <DetailField label="Delivery Date" value={formData.delivery.deliveryDate} />
            <DetailField label="Received By" value={formData.delivery.receivedBy} />
            <DetailField label="Delivery Status" value={formData.delivery.deliveryStatus} />
            <DetailField label="POD Number" value={formData.delivery.podNumber} />
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
