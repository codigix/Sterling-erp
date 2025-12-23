import React from "react";
import { ChevronRight } from "lucide-react";
import { WIZARD_STEPS } from "../constants";
import { useFormUI } from "../hooks";

export default function WizardHeader({ mode = 'create' }) {
  const { currentStep } = useFormUI();

  const getTitleForMode = () => {
    switch (mode) {
      case 'view':
        return 'View Sales Order';
      case 'edit':
        return 'Edit Sales Order';
      case 'assign':
        return 'Assign Sales Order';
      default:
        return 'Root Card Wizard';
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-slate-200 p-4 rounded-lg mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">{getTitleForMode()}</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Step {currentStep} of {WIZARD_STEPS.length}
        </p>
      </div>
      
      <div className="flex items-center text-xs gap-0.5 overflow-x-auto pb-1.5 scrollbar-hide">
        {WIZARD_STEPS.map((step, idx) => (
          <React.Fragment key={step.number}>
            <div
              className={`min-w-max px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                currentStep === step.number
                  ? "bg-purple-600 text-white"
                  : currentStep > step.number
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              <div className="flex items-center text-xs gap-1">
                <span>{step.number}</span>
                <span className="hidden sm:inline">{step.name}</span>
              </div>
            </div>
            {idx < WIZARD_STEPS.length - 1 && (
              <ChevronRight className="text-slate-300 flex-shrink-0" size={12} />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="mt-3 bg-slate-200 h-0.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-500 to-purple-600 h-full transition-all duration-300"
          style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
