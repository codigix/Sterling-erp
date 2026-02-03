import React, { useMemo } from "react";
import { Truck } from "lucide-react";
import Input from "../../../ui/Input";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import AssigneeField from "../shared/AssigneeField";
import { useFormData, useRootCardContext } from "../hooks";

export default function Step6_Shipment({ readOnly = false }) {
  const { formData, setNestedField, updateField } = useFormData();
  const { state } = useRootCardContext();

  const content = useMemo(() => (
    <div className="space-y-3">
      <AssigneeField
        stepType="shipment"
        formData={state.formData}
        updateField={updateField}
        employees={state.employees}
        readOnly={readOnly}
      />
      <FormSection
        title="Shipment & Logistics"
        subtitle="Configure shipment details and delivery logistics"
        icon={Truck}
      >
        <div className="space-y-3">
          {/* Delivery Schedule */}
          <div>
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Delivery Schedule</h5>
            <Input
              label="Delivery Schedule"
              value={formData.deliveryTerms?.deliverySchedule || ""}
              onChange={(e) =>
                setNestedField("deliveryTerms", "deliverySchedule", e.target.value)
              }
              placeholder="e.g., 12-16 weeks from PO"
              disabled={readOnly}
            />
          </div>

          {/* Packaging & Dispatch */}
          <div>
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Packaging & Dispatch</h5>
            <FormRow cols={2}>
              <Input
                label="Packaging Information"
                value={formData.deliveryTerms?.packagingInfo || ""}
                onChange={(e) =>
                  setNestedField("deliveryTerms", "packagingInfo", e.target.value)
                }
                placeholder="e.g., Wooden box, anti-rust oil"
                disabled={readOnly}
              />
              <Input
                label="Dispatch Mode"
                value={formData.deliveryTerms?.dispatchMode || ""}
                onChange={(e) =>
                  setNestedField("deliveryTerms", "dispatchMode", e.target.value)
                }
                placeholder="e.g., Road transport"
                disabled={readOnly}
              />
            </FormRow>
          </div>

          {/* Installation & Commissioning */}
          <div>
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Installation</h5>
            <FormRow cols={2}>
              <Input
                label="Installation Required"
                value={formData.deliveryTerms?.installationRequired || ""}
                onChange={(e) =>
                  setNestedField("deliveryTerms", "installationRequired", e.target.value)
                }
                placeholder="e.g., Yes, on-site installation"
                disabled={readOnly}
              />
              <Input
                label="Site Commissioning"
                value={formData.deliveryTerms?.siteCommissioning || ""}
                onChange={(e) =>
                  setNestedField("deliveryTerms", "siteCommissioning", e.target.value)
                }
                placeholder="e.g., Yes, commissioning required"
                disabled={readOnly}
              />
            </FormRow>
          </div>

          {/* Shipment Details from old file Step 7 */}
          <div>
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Shipment Process</h5>
            <FormRow cols={2}>
              <Input
                label="Marking"
                value={formData.shipment?.marking || ""}
                onChange={(e) =>
                  setNestedField("shipment", "marking", e.target.value)
                }
                placeholder="e.g., Marked and labeled"
                disabled={readOnly}
              />
              <Input
                label="Dismantling (if needed)"
                value={formData.shipment?.dismantling || ""}
                onChange={(e) =>
                  setNestedField("shipment", "dismantling", e.target.value)
                }
                placeholder="e.g., Not required"
                disabled={readOnly}
              />
            </FormRow>
            <FormRow cols={2}>
              <Input
                label="Packing"
                value={formData.shipment?.packing || ""}
                onChange={(e) =>
                  setNestedField("shipment", "packing", e.target.value)
                }
                placeholder="e.g., Industrial packing applied"
                disabled={readOnly}
              />
              <Input
                label="Dispatch"
                value={formData.shipment?.dispatch || ""}
                onChange={(e) =>
                  setNestedField("shipment", "dispatch", e.target.value)
                }
                placeholder="e.g., Ready for dispatch"
                disabled={readOnly}
              />
            </FormRow>
          </div>

          {/* Shipping Logistics */}
          <div className="border-t border-slate-200 pt-3">
            <h5 className="text-sm font-semibold text-slate-900 mb-2 text-left">Shipping Details</h5>
            <FormRow cols={2}>
              <Input
                label="Shipment Method"
                value={formData.shipment?.shipmentMethod || ""}
                onChange={(e) => setNestedField("shipment", "shipmentMethod", e.target.value)}
                placeholder="e.g., Lorry, Courier, Air"
                disabled={readOnly}
              />
              <Input
                label="Carrier Name"
                value={formData.shipment?.carrierName || ""}
                onChange={(e) => setNestedField("shipment", "carrierName", e.target.value)}
                placeholder="e.g., BlueDart, TCI"
                disabled={readOnly}
              />
            </FormRow>
            <FormRow cols={2}>
              <Input
                label="Tracking Number"
                value={formData.shipment?.trackingNumber || ""}
                onChange={(e) => setNestedField("shipment", "trackingNumber", e.target.value)}
                placeholder="Enter tracking ID"
                disabled={readOnly}
              />
              <Input
                label="Estimated Delivery Date"
                type="date"
                value={formData.shipment?.estimatedDeliveryDate || ""}
                onChange={(e) => setNestedField("shipment", "estimatedDeliveryDate", e.target.value)}
                disabled={readOnly}
              />
            </FormRow>
            <FormRow cols={2}>
              <Input
                label="Shipment Cost (₹)"
                type="number"
                value={formData.shipment?.shipmentCost || ""}
                onChange={(e) => setNestedField("shipment", "shipmentCost", e.target.value)}
                placeholder="0.00"
                disabled={readOnly}
              />
              <div className="hidden md:block"></div>
            </FormRow>
            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-900 text-left mb-2">Shipping Address</label>
              <textarea
                value={formData.shipment?.shippingAddress || ""}
                onChange={(e) => setNestedField("shipment", "shippingAddress", e.target.value)}
                disabled={readOnly}
                rows="3"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter destination address"
              />
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-900 text-left mb-2">Shipping Notes</label>
              <textarea
                value={formData.shipment?.notes || ""}
                onChange={(e) => setNestedField("shipment", "notes", e.target.value)}
                disabled={readOnly}
                rows="2"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special notes for shipment"
              />
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  ), [formData.deliveryTerms, formData.shipment, state.employees, state.formData, readOnly, setNestedField, updateField]);

  return content;
}
