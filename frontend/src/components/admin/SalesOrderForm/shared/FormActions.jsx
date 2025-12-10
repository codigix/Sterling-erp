import React from "react";
import { ChevronLeft, ChevronRight, Save, X } from "lucide-react";
import Button from "../../../ui/Button";
import { useFormUI } from "../hooks";
import { WIZARD_STEPS } from "../constants";

export default function FormActions({ mode = 'create', onNext, onPrev, onSubmit, onCancel, canSubmit = true, isLastStep = false }) {
  const { currentStep, loading } = useFormUI();
  const actualIsLastStep = isLastStep || currentStep === WIZARD_STEPS.length;

  if (mode === 'view') {
    return (
      <div className="flex gap-3 justify-between mt-10 pt-6 border-t border-slate-700">
        <Button
          onClick={onPrev}
          disabled={currentStep === 1}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Previous
        </Button>

        <span className="text-sm text-slate-400 self-center">
          Step {currentStep} of {WIZARD_STEPS.length}
        </span>

        {actualIsLastStep ? (
          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <X size={16} />
            Close
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        )}
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div className="flex gap-3 justify-between mt-10 pt-6 border-t border-slate-700">
        <Button
          onClick={onCancel}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <X size={16} />
          Cancel
        </Button>

        <span className="text-sm text-slate-400 self-center">
          Editing Sales Order
        </span>

        <Button
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Save size={16} />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    );
  }

  if (mode === 'assign') {
    return (
      <div className="flex gap-3 justify-between mt-10 pt-6 border-t border-slate-700">
        <Button
          onClick={onCancel}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <X size={16} />
          Cancel
        </Button>

        <span className="text-sm text-slate-400 self-center">
          Assigning Sales Order
        </span>

        <Button
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
        >
          <Save size={16} />
          {loading ? "Assigning..." : "Assign"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-between mt-10 pt-6 border-t border-slate-700">
      <Button
        onClick={onPrev}
        disabled={currentStep === 1 || loading}
        variant="secondary"
        className="flex items-center gap-2"
      >
        <ChevronLeft size={16} />
        Previous
      </Button>

      <span className="text-sm text-slate-400 self-center">
        Step {currentStep} of {WIZARD_STEPS.length}
      </span>

      {actualIsLastStep ? (
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Save size={16} />
          {loading ? "Submitting..." : "Submit Order"}
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={loading}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight size={16} />
        </Button>
      )}
    </div>
  );
}
