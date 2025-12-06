import React, { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { X, Save } from "lucide-react";

const MaterialDetailModal = ({ isOpen, materialType, onClose, onSubmit, currentDetails }) => {
  const [details, setDetails] = useState(currentDetails || {});

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(details);
    setDetails({});
  };

  const renderForm = () => {
    switch (materialType) {
      case "steelSection":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Steel Section Details</h3>
            <Input
              label="Size / Dimension"
              value={details.steelSize || ""}
              onChange={(e) => handleChange("steelSize", e.target.value)}
              placeholder="e.g., 100x100, 150x75"
            />
            <Input
              label="Length (mm)"
              type="number"
              value={details.steelLength || ""}
              onChange={(e) => handleChange("steelLength", e.target.value)}
              placeholder="e.g., 6000"
            />
            <Input
              label="Tolerance"
              value={details.steelTolerance || ""}
              onChange={(e) => handleChange("steelTolerance", e.target.value)}
              placeholder="e.g., ±10mm"
            />
          </div>
        );
      case "plateType":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Plate Details</h3>
            <Input
              label="Thickness (mm)"
              type="number"
              value={details.plateThickness || ""}
              onChange={(e) => handleChange("plateThickness", e.target.value)}
              placeholder="e.g., 10"
            />
            <Input
              label="Length (mm)"
              type="number"
              value={details.plateLength || ""}
              onChange={(e) => handleChange("plateLength", e.target.value)}
              placeholder="e.g., 2500"
            />
            <Input
              label="Width (mm)"
              type="number"
              value={details.plateWidth || ""}
              onChange={(e) => handleChange("plateWidth", e.target.value)}
              placeholder="e.g., 1250"
            />
            <Input
              label="Surface Finish"
              value={details.plateSurfaceFinish || ""}
              onChange={(e) => handleChange("plateSurfaceFinish", e.target.value)}
              placeholder="e.g., Hot Rolled, Cold Rolled, Polished"
            />
          </div>
        );
      case "materialGrade":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Material Grade Details</h3>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1 text-left">
                Certification Required
              </label>
              <select
                value={details.gradeCertificationRequired || ""}
                onChange={(e) => handleChange("gradeCertificationRequired", e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100"
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <Input
              label="Testing Standards"
              value={details.gradeTestingStandards || ""}
              onChange={(e) => handleChange("gradeTestingStandards", e.target.value)}
              placeholder="e.g., ASTM, IS, EN"
            />
            <Input
              label="Special Requirements"
              value={details.gradeSpecialRequirements || ""}
              onChange={(e) => handleChange("gradeSpecialRequirements", e.target.value)}
              placeholder="e.g., Stress relieved, Heat treated"
            />
          </div>
        );
      case "fastenerType":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Fastener Specifications</h3>
            <Input
              label="Size (mm)"
              type="number"
              value={details.fastenerSize || ""}
              onChange={(e) => handleChange("fastenerSize", e.target.value)}
              placeholder="e.g., 20, 24"
            />
            <Input
              label="Quantity per Unit"
              type="number"
              value={details.fastenerQuantityPerUnit || ""}
              onChange={(e) => handleChange("fastenerQuantityPerUnit", e.target.value)}
              placeholder="e.g., 100, 500"
            />
            <Input
              label="Plating / Coating"
              value={details.fastenerPlating || ""}
              onChange={(e) => handleChange("fastenerPlating", e.target.value)}
              placeholder="e.g., Zinc plated, Galvanized, Stainless"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg border border-slate-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between bg-slate-800 p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">Fill Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {renderForm()}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Submit Details
            </Button>
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailModal;
