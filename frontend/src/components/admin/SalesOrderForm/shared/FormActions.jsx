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
      <div className="flex gap-2 justify-between mt-8 pt-4 border-t border-slate-200">
        <Button
          onClick={onPrev}
          disabled={currentStep === 1}
          variant="secondary"
          className="flex items-center text-xs gap-1 text-xs"
        >
          <ChevronLeft size={14} />
          Previous
        </Button>

        <span className="text-xs text-slate-500 self-center">
          Step {currentStep} of {WIZARD_STEPS.length}
        </span>

        {actualIsLastStep ? (
          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex items-center text-xs gap-1 text-xs"
          >
            <X size={14} />
            Close
          </Button>
        ) : (
          <Button
            onClick={onNext}
            className="flex items-center text-xs gap-1 text-xs"
          >
            Next
            <ChevronRight size={14} />
          </Button>
        )}
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div className="flex gap-2 justify-between mt-8 pt-4 border-t border-slate-200">
        <div className="flex gap-2">
          <Button
            onClick={onPrev}
            disabled={currentStep === 1 || loading}
            variant="secondary"
            className="flex items-center text-xs gap-1 text-xs"
          >
            <ChevronLeft size={14} />
            Previous
          </Button>

          <Button
            onClick={onCancel}
            variant="secondary"
            className="flex items-center text-xs gap-1 text-xs"
          >
            <X size={14} />
            Cancel
          </Button>
        </div>

        <span className="text-xs text-slate-500 self-center">
          Step {currentStep} of {WIZARD_STEPS.length}
        </span>

        <div className="flex gap-2">
          {actualIsLastStep ? (
            <Button
              onClick={onSubmit}
              disabled={!canSubmit || loading}
              className="flex items-center text-xs gap-1 text-xs bg-emerald-600 hover:bg-emerald-700"
            >
              <Save size={14} />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={loading}
              className="flex items-center text-xs gap-1 text-xs"
            >
              Next
              <ChevronRight size={14} />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'assign') {
    return (
      <div className="flex gap-2 justify-between mt-8 pt-4 border-t border-slate-200">
        <Button
          onClick={onCancel}
          variant="secondary"
          className="flex items-center text-xs gap-1 text-xs"
        >
          <X size={14} />
          Cancel
        </Button>

        <span className="text-xs text-slate-500 self-center">
          Assigning Sales Order
        </span>

        <Button
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          className="flex items-center text-xs gap-1 text-xs bg-amber-600 hover:bg-amber-700"
        >
          <Save size={14} />
          {loading ? "Assigning..." : "Assign"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 justify-between mt-8 pt-4 border-t border-slate-200">
      <Button
        onClick={onPrev}
        disabled={currentStep === 1 || loading}
        variant="secondary"
        className="flex items-center text-xs gap-1 text-xs"
      >
        <ChevronLeft size={14} />
        Previous
      </Button>

      <span className="text-xs text-slate-500 self-center">
        Step {currentStep} of {WIZARD_STEPS.length}
      </span>

      {actualIsLastStep ? (
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          className="flex items-center text-xs gap-1 text-xs bg-purple-600 hover:bg-purple-700"
        >
          <Save size={14} />
          {loading ? "Submitting..." : "Submit Order"}
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={loading}
          className="flex items-center text-xs gap-1 text-xs"
        >
          Next
          <ChevronRight size={14} />
        </Button>
      )}
    </div>
  );
}
