import React from "react";
import { Zap } from "lucide-react";
import FormSection from "../shared/FormSection";
import { ProductionPhaseSection, useProductionPhase } from "../../ProductionPhaseModule";

export default function Step5_ProductionPlan() {
  const phaseManagement = useProductionPhase();

  return (
    <FormSection
      title="Production Plan"
      subtitle="Manage production phases and track progress"
      icon={Zap}
    >
      <ProductionPhaseSection
        productionPhaseDetails={phaseManagement.productionPhaseDetails}
        error={phaseManagement.error}
        successMessage={phaseManagement.successMessage}
      />
    </FormSection>
  );
}
