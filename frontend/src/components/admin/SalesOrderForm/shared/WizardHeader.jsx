import React from "react";
import { ChevronRight } from "lucide-react";
import { WIZARD_STEPS } from "../constants";
import { useFormUI } from "../hooks";

export default function WizardHeader() {
  const { currentStep } = useFormUI();

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-6 rounded-lg mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Sales Order Wizard</h2>
        <p className="text-sm text-slate-400 mt-1">
          Step {currentStep} of {WIZARD_STEPS.length}
        </p>
      </div>
      
      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {WIZARD_STEPS.map((step, idx) => (
          <React.Fragment key={step.number}>
            <div
              className={`min-w-max px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStep === step.number
                  ? "bg-blue-600 text-white"
                  : currentStep > step.number
                  ? "bg-green-600 text-white"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              {step.number}. {step.name}
            </div>
            {idx < WIZARD_STEPS.length - 1 && (
              <ChevronRight className="text-slate-600 flex-shrink-0" size={16} />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="mt-4 bg-slate-700 h-1 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${(currentStep / WIZARD_STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
