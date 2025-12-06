import React from "react";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import Button from "../../../ui/Button";
import { useFormUI } from "../hooks";
import { WIZARD_STEPS } from "../constants";

export default function FormActions({ onNext, onPrev, onSubmit, canSubmit = true }) {
  const { currentStep, loading } = useFormUI();
  const isLastStep = currentStep === WIZARD_STEPS.length;

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

      {isLastStep ? (
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
