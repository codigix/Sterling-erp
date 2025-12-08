import React, { useState } from "react";
import { Zap, X } from "lucide-react";
import Input from "../../../ui/Input";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import { useFormData, useSalesOrderContext } from "../hooks";

const PRODUCTION_PHASES = {
  "Material Prep": [
    { value: "marking", label: "Marking" },
    { value: "cutting_laser", label: "Cutting (laser/plasma/bandsaw)" },
  ],
  Fabrication: [
    { value: "edge_prep", label: "Edge prep" },
    { value: "mig_welding", label: "MIG/SMAW/TIG welding" },
    { value: "fit_up", label: "Fit-up" },
    { value: "structure_fabrication", label: "Structure fabrication" },
    { value: "heat_treatment", label: "Heat treatment (optional)" },
  ],
  Machining: [
    { value: "drilling", label: "Drilling" },
    { value: "turning", label: "Turning" },
    { value: "milling", label: "Milling" },
    { value: "boring", label: "Boring" },
  ],
  "Surface Prep": [
    { value: "grinding", label: "Grinding" },
    { value: "shot_blasting", label: "Shot blasting" },
    { value: "painting", label: "Painting" },
  ],
  Assembly: [
    { value: "mechanical_assembly", label: "Mechanical assembly" },
    { value: "shaft_bearing_assembly", label: "Shaft/bearing assembly" },
    { value: "alignment", label: "Alignment" },
  ],
  Electrical: [
    { value: "panel_wiring", label: "Panel wiring" },
    { value: "motor_wiring", label: "Motor wiring" },
    { value: "sensor_installation", label: "Sensor installation" },
  ],
};

const PRODUCTION_PHASE_FORMS = {
  marking: [
    {
      name: "componentName",
      label: "Component Name",
      type: "text",
      placeholder: "e.g., Shaft Assembly, Plate Frame",
    },
    {
      name: "drawingNo",
      label: "Drawing No. & Revision",
      type: "text",
      placeholder: "e.g., DRG-001-R2",
    },
    {
      name: "markingMethod",
      label: "Marking Method",
      type: "select",
      options: ["Hand", "Auto marking"],
    },
    {
      name: "dimensionsMarked",
      label: "Dimensions Marked",
      type: "text",
      placeholder: "e.g., 50mm, 100mm, Ø25mm",
    },
    {
      name: "toolsUsed",
      label: "Tools Used",
      type: "text",
      placeholder: "e.g., Marker, Scribe, Punch, Layout Fluid",
    },
    {
      name: "markingDoneBy",
      label: "Marking Done By",
      type: "text",
      placeholder: "e.g., John Doe",
    },
    { name: "markingDate", label: "Marking Date", type: "date" },
    {
      name: "remarks",
      label: "Remarks",
      type: "textarea",
      placeholder:
        "e.g., Follow drawing DRG-001 exactly, Use waterproof marker",
    },
    {
      name: "qcInspectionResult",
      label: "QC Inspection Result",
      type: "select",
      options: ["Pass", "Fail", "Pending"],
    },
    { name: "markingPhoto", label: "Upload Marking Photo", type: "file" },
  ],
  cutting_laser: [
    {
      name: "quantity",
      label: "Quantity",
      type: "number",
      placeholder: "e.g., 10, 50",
    },
    {
      name: "estimatedHours",
      label: "Estimated Hours",
      type: "number",
      placeholder: "e.g., 4, 8",
    },
    {
      name: "responsiblePerson",
      label: "Responsible Person / Team",
      type: "text",
      placeholder: "e.g., Laser Operator",
    },
    {
      name: "equipmentRequired",
      label: "Equipment Required",
      type: "text",
      placeholder: "e.g., Laser Cutter, Plasma Cutter",
    },
    {
      name: "materialSpecs",
      label: "Material Specifications",
      type: "text",
      placeholder: "e.g., Material Type, Thickness",
    },
    {
      name: "specialInstructions",
      label: "Special Instructions / Notes",
      type: "textarea",
      placeholder: "e.g., Kerf compensation: 0.2mm",
    },
    {
      name: "estimatedCost",
      label: "Estimated Cost ($)",
      type: "number",
      placeholder: "e.g., 200",
    },
    {
      name: "qualityStandards",
      label: "Quality Standards",
      type: "text",
      placeholder: "e.g., Sharp edges, no burrs",
    },
  ],
  edge_prep: [
    {
      name: "componentName",
      label: "Component Name",
      type: "text",
      placeholder: "e.g., Base Plate, Side Beam",
    },
    {
      name: "bevelAngle",
      label: "Bevel Angle",
      type: "text",
      placeholder: "e.g., 45°, 30°",
    },
    {
      name: "bevelType",
      label: "Bevel Type",
      type: "select",
      options: ["Single", "Double"],
    },
    {
      name: "lengthPrepared",
      label: "Length Prepared",
      type: "text",
      placeholder: "e.g., 1000mm, 500mm",
    },
    {
      name: "grinderId",
      label: "Grinder ID",
      type: "text",
      placeholder: "e.g., GRD-001, GRIND-02",
    },
    {
      name: "operatorName",
      label: "Operator Name",
      type: "text",
      placeholder: "e.g., John Doe",
    },
    { name: "prepDate", label: "Date", type: "date" },
    {
      name: "qcResult",
      label: "QC Result",
      type: "select",
      options: ["Pass", "Fail", "Pending"],
    },
    { name: "edgePrepImage", label: "Upload Image", type: "file" },
  ],
  mig_welding: [
    {
      name: "weldJointNo",
      label: "Weld Joint No.",
      type: "text",
      placeholder: "e.g., WJ-001, Joint-A1",
    },
    {
      name: "weldingProcess",
      label: "Welding Process",
      type: "select",
      options: ["MIG", "SMAW", "TIG"],
    },
    {
      name: "electrodeWireType",
      label: "Electrode / Wire Type",
      type: "text",
      placeholder: "e.g., ER70S-2, AWS E6010",
    },
    {
      name: "currentVoltage",
      label: "Current & Voltage",
      type: "text",
      placeholder: "e.g., 200A, 28V",
    },
    {
      name: "wpsNo",
      label: "WPS No. (Welding Procedure Spec)",
      type: "text",
      placeholder: "e.g., WPS-2024-001",
    },
    {
      name: "welderId",
      label: "Welder ID",
      type: "text",
      placeholder: "e.g., W-001, Welder-123",
    },
    {
      name: "noOfPasses",
      label: "No. of Passes",
      type: "number",
      placeholder: "e.g., 3, 5",
    },
    {
      name: "weldLengthCompleted",
      label: "Weld Length Completed",
      type: "text",
      placeholder: "e.g., 500mm, 1000mm",
    },
    {
      name: "preheatTemp",
      label: "Preheat Temp (if used)",
      type: "text",
      placeholder: "e.g., 150°C, 200°C",
    },
    {
      name: "postweldObservation",
      label: "Post-weld Observation",
      type: "textarea",
      placeholder: "e.g., Good bead appearance, No visible cracks",
    },
    {
      name: "ndtRequired",
      label: "NDT Required",
      type: "select",
      options: ["Yes", "No"],
    },
    {
      name: "qcStatus",
      label: "QC Status (Visual/NDT)",
      type: "select",
      options: ["Pass", "Fail", "Pending"],
    },
    { name: "weldPhoto", label: "Upload Weld Photo", type: "file" },
  ],
  fit_up: [
    {
      name: "assemblyName",
      label: "Assembly Name",
      type: "text",
      placeholder: "e.g., Main Frame Assembly, Base Plate Assembly",
    },
    {
      name: "fitUpDrawingNo",
      label: "Fit-Up Drawing No.",
      type: "text",
      placeholder: "e.g., DRG-FU-001, FITUP-A2",
    },
    {
      name: "rootGapRequired",
      label: "Root Gap Required (mm)",
      type: "text",
      placeholder: "e.g., 2-3mm, 1.5-2.5mm",
    },
    {
      name: "misalignmentAllowed",
      label: "Misalignment Allowed (mm)",
      type: "text",
      placeholder: "e.g., ±1.0mm, ±0.5mm",
    },
    {
      name: "tackWeldCount",
      label: "Tack Weld Count",
      type: "number",
      placeholder: "e.g., 4, 6, 8",
    },
  ],
};

export default function Step5_ProductionPlan() {
  const { formData, updateField, setNestedField } = useFormData();
  const { state } = useSalesOrderContext();

  const [selectedPhases, setSelectedPhases] = useState({});
  const [phaseDetails, setPhaseDetails] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPhaseKey, setSelectedPhaseKey] = useState(null);
  const [phaseProcessType, setPhaseProcessType] = useState({});
  const [productionPhaseTracking, setProductionPhaseTracking] = useState({});
  const [activeTab, setActiveTab] = useState("timeline");
  const [materialInfo, setMaterialInfo] = useState({
    materialType: "",
    grade: "",
    thickness: "",
    heatNo: "",
    supplierName: "",
    receivedQuantity: "",
    requiredQuantity: "",
    storageLocation: "",
    preparedBy: "",
    preparationDate: "",
    qcStatus: "",
    mtcFileName: "",
    materialImageName: "",
  });

  const handlePhaseToggle = (phase) => {
    setSelectedPhases((prev) => {
      const newPhases = { ...prev };
      if (newPhases[phase]) {
        delete newPhases[phase];
        const detailsToDelete = {};
        Object.keys(phaseDetails).forEach((key) => {
          if (!key.startsWith(phase)) {
            detailsToDelete[key] = phaseDetails[key];
          }
        });
        setPhaseDetails(detailsToDelete);
      } else {
        newPhases[phase] = true;
      }
      return newPhases;
    });
  };

  const handlePhaseDetailChange = (phaseKey, field, value) => {
    setPhaseDetails((prev) => ({
      ...prev,
      [phaseKey]: {
        ...prev[phaseKey],
        [field]: value,
      },
    }));
  };

  const getPhaseKeyFromPhaseValue = (phaseValue) => {
    for (const [phase, subTasks] of Object.entries(PRODUCTION_PHASES)) {
      for (const subTask of subTasks) {
        if (subTask.value === phaseValue) {
          return phaseValue;
        }
      }
    }
    return phaseValue;
  };

  const savePhaseDetailsAndCreateTracking = () => {
    if (!selectedPhaseKey || !phaseDetails[selectedPhaseKey]) return;

    const detail = phaseDetails[selectedPhaseKey];
    const stepNumber = Object.keys(productionPhaseTracking).length + 1;

    const phaseLabel = detail.subTask.label;
    const [phaseName] = Object.entries(PRODUCTION_PHASES).find(
      ([_, subTasks]) =>
        subTasks.some((st) => st.value === detail.subTask.value)
    ) || [""];

    setProductionPhaseTracking((prev) => ({
      ...prev,
      [selectedPhaseKey]: {
        stepNumber,
        phase: phaseName,
        subTask: phaseLabel,
        assignee:
          detail.responsiblePerson ||
          detail.welderId ||
          detail.operatorName ||
          "",
        status: "Not Started",
        startTime: null,
        finishTime: null,
      },
    }));

    setPhaseProcessType((prev) => ({
      ...prev,
      [selectedPhaseKey]: formData.processType || "in_house",
    }));

    setModalOpen(false);
    setSelectedPhaseKey(null);
  };

  const updateProductionPhaseStatus = (key, updates) => {
    setProductionPhaseTracking((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updates,
      },
    }));
  };

  const startProductionPhase = (key) => {
    updateProductionPhaseStatus(key, {
      status: "In Progress",
      startTime: new Date().toISOString(),
    });
  };

  const finishProductionPhase = (key) => {
    updateProductionPhaseStatus(key, {
      status: "Completed",
      finishTime: new Date().toISOString(),
    });
  };

  const addPhaseDetail = (phase, subTask) => {
    const phaseKey = `${phase}-${
      Object.keys(phaseDetails).filter((k) => k.startsWith(phase)).length + 1
    }`;
    setPhaseDetails((prev) => ({
      ...prev,
      [phaseKey]: {
        subTask,
        quantity: "",
        estimatedHours: "",
        responsiblePerson: "",
        notes: "",
      },
    }));
  };

  const removePhaseDetail = (phaseKey) => {
    setPhaseDetails((prev) => {
      const newDetails = { ...prev };
      delete newDetails[phaseKey];
      return newDetails;
    });
  };

  const handleMaterialInfoChange = (field, value) => {
    setMaterialInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMaterialFileChange = (e, fileType) => {
    const fileName = e.target.files?.[0]?.name || "";
    if (fileType === "mtc") {
      setMaterialInfo((prev) => ({
        ...prev,
        mtcFileName: fileName,
      }));
    } else if (fileType === "materialImage") {
      setMaterialInfo((prev) => ({
        ...prev,
        materialImageName: fileName,
      }));
    }
  };

  const tabs = [
    { id: "timeline", label: "Timeline & Procurement" },
    { id: "material", label: "Material Information" },
    { id: "phases", label: "Production Phases" },
  ];

  return (
    <div className="space-y-6">
      <FormSection
        title="Production Plan"
        subtitle="Manufacturing timeline, material procurement, and production phases"
        icon={Zap}
      >
        <div className="space-y-6">
          {/* Tabs Navigation */}
          <div className="flex gap-0 border-b border-slate-200 overflow-x-auto">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-2 cursor-pointer px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none border-b-2 ${
                  activeTab === tab.id
                    ? "text-blue-500 border-b-blue font-bold"
                    : "text-white border-b-transparent bg-transparent"
                }`}
              >
                {tab.label}
              </div>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {/* Timeline & Procurement Tab */}
            {activeTab === "timeline" && (
              <div className="space-y-6">
                {/* Manufacturing Timeline */}
                <div>
                  <h5 className="text-sm font-semibold text-slate-300 mb-3">
                    Manufacturing Timeline
                  </h5>
                  <FormRow cols={2}>
                    <Input
                      label="Production Start Date"
                      type="date"
                      value={formData.productionStartDate || ""}
                      onChange={(e) =>
                        updateField("productionStartDate", e.target.value)
                      }
                    />
                    <Input
                      label="Estimated Completion Date"
                      type="date"
                      value={formData.estimatedCompletionDate || ""}
                      onChange={(e) =>
                        updateField("estimatedCompletionDate", e.target.value)
                      }
                    />
                  </FormRow>
                </div>

                {/* Material Procurement Status */}
                <div className="pt-4">
                  <h5 className="text-sm font-semibold text-slate-300 mb-3">
                    Material Procurement Status
                  </h5>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Procurement Status
                    </label>
                    <select
                      value={formData.procurementStatus || ""}
                      onChange={(e) =>
                        updateField("procurementStatus", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Status</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Pending Approval">Pending Approval</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Material Information Tab */}
            {activeTab === "material" && (
              <div className="space-y-6">
                <div>
                  <h5 className="text-sm font-semibold text-slate-300 mb-3">
                    Material Information
                  </h5>
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
                    <FormRow cols={2}>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Material Type
                        </label>
                        <select
                          value={materialInfo.materialType}
                          onChange={(e) =>
                            handleMaterialInfoChange(
                              "materialType",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Type</option>
                          <option value="Plate">Plate</option>
                          <option value="Beam">Beam</option>
                          <option value="Channel">Channel</option>
                          <option value="Pipe">Pipe</option>
                          <option value="Bar">Bar</option>
                        </select>
                      </div>
                      <Input
                        label="Grade"
                        value={materialInfo.grade}
                        onChange={(e) =>
                          handleMaterialInfoChange("grade", e.target.value)
                        }
                        placeholder="e.g., E250, EN8"
                      />
                    </FormRow>

                    <FormRow cols={2}>
                      <Input
                        label="Thickness / Size"
                        value={materialInfo.thickness}
                        onChange={(e) =>
                          handleMaterialInfoChange("thickness", e.target.value)
                        }
                        placeholder="e.g., 10mm, 50x50"
                      />
                      <Input
                        label="Heat No."
                        value={materialInfo.heatNo}
                        onChange={(e) =>
                          handleMaterialInfoChange("heatNo", e.target.value)
                        }
                        placeholder="e.g., HT-2024-001"
                      />
                    </FormRow>

                    <FormRow cols={2}>
                      <Input
                        label="Supplier Name"
                        value={materialInfo.supplierName}
                        onChange={(e) =>
                          handleMaterialInfoChange(
                            "supplierName",
                            e.target.value
                          )
                        }
                        placeholder="e.g., XYZ Steel Ltd"
                      />
                      <Input
                        label="Heat No."
                        value={materialInfo.heatNo}
                        onChange={(e) =>
                          handleMaterialInfoChange("heatNo", e.target.value)
                        }
                        placeholder="e.g., HT-2024-001"
                      />
                    </FormRow>

                    <FormRow cols={2}>
                      <Input
                        label="Received Quantity"
                        type="number"
                        value={materialInfo.receivedQuantity}
                        onChange={(e) =>
                          handleMaterialInfoChange(
                            "receivedQuantity",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 100"
                      />
                      <Input
                        label="Required Quantity"
                        type="number"
                        value={materialInfo.requiredQuantity}
                        onChange={(e) =>
                          handleMaterialInfoChange(
                            "requiredQuantity",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 100"
                      />
                    </FormRow>

                    <FormRow cols={2}>
                      <Input
                        label="Storage Location"
                        value={materialInfo.storageLocation}
                        onChange={(e) =>
                          handleMaterialInfoChange(
                            "storageLocation",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Rack A-10"
                      />
                      <Input
                        label="Prepared By"
                        value={materialInfo.preparedBy}
                        onChange={(e) =>
                          handleMaterialInfoChange("preparedBy", e.target.value)
                        }
                        placeholder="e.g., John Doe"
                      />
                    </FormRow>

                    <FormRow cols={2}>
                      <Input
                        label="Preparation Date"
                        type="date"
                        value={materialInfo.preparationDate}
                        onChange={(e) =>
                          handleMaterialInfoChange(
                            "preparationDate",
                            e.target.value
                          )
                        }
                      />
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          QC Status
                        </label>
                        <select
                          value={materialInfo.qcStatus}
                          onChange={(e) =>
                            handleMaterialInfoChange("qcStatus", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Status</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </FormRow>

                    <FormRow cols={2}>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Upload MTC
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.png"
                            onChange={(e) => handleMaterialFileChange(e, "mtc")}
                            className="hidden"
                            id="mtc-upload"
                          />
                          <label
                            htmlFor="mtc-upload"
                            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 cursor-pointer hover:bg-slate-600 text-center text-sm"
                          >
                            {materialInfo.mtcFileName || "Choose File"}
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Upload Material Image
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={(e) =>
                              handleMaterialFileChange(e, "materialImage")
                            }
                            className="hidden"
                            id="material-image-upload"
                          />
                          <label
                            htmlFor="material-image-upload"
                            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 cursor-pointer hover:bg-slate-600 text-center text-sm"
                          >
                            {materialInfo.materialImageName || "Choose File"}
                          </label>
                        </div>
                      </div>
                    </FormRow>
                  </div>
                </div>
              </div>
            )}

            {/* Production Phases Tab */}
            {activeTab === "phases" && (
              <div>
                <h5 className="text-sm font-semibold text-slate-300 mb-3">
                  Production Phases
                </h5>

                <div className="info-banner mb-4 bg-blue-900/20 border border-blue-700/50 p-3 rounded-lg">
                  <p className="text-sm text-blue-200">
                    Select the production phases required for this project. Only
                    checked phases will show selection options.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {Object.keys(PRODUCTION_PHASES).map((phase) => (
                    <label
                      key={phase}
                      className="flex items-center gap-2 p-3 border border-slate-600 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-800 hover:border-blue-500 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={phase in selectedPhases}
                        onChange={() => handlePhaseToggle(phase)}
                        className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium text-slate-200">
                        {phase}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="space-y-6">
                  {Object.keys(PRODUCTION_PHASES).map(
                    (phase) =>
                      selectedPhases[phase] !== undefined && (
                        <div
                          key={phase}
                          className="border border-slate-600 rounded-lg overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-blue-900/30 to-slate-800 px-4 py-3 border-b border-slate-600">
                            <h6 className="text-sm font-semibold text-slate-100">
                              {phase}
                            </h6>
                          </div>
                          <div className="p-4 bg-slate-900/50 space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2">
                                Select Sub-task
                              </label>
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const subTask = PRODUCTION_PHASES[
                                      phase
                                    ].find((t) => t.value === e.target.value);
                                    if (subTask) {
                                      addPhaseDetail(phase, subTask);
                                      setSelectedPhaseKey(
                                        `${phase}-${
                                          Object.keys(phaseDetails).filter(
                                            (k) => k.startsWith(phase)
                                          ).length + 1
                                        }`
                                      );
                                      setModalOpen(true);
                                    }
                                  }
                                }}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">
                                  -- Select a sub-task --
                                </option>
                                {PRODUCTION_PHASES[phase].map((subTask) => (
                                  <option
                                    key={subTask.value}
                                    value={subTask.value}
                                  >
                                    {subTask.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )
                  )}
                </div>

                {Object.keys(productionPhaseTracking).length > 0 && (
                  <div className="border-t border-slate-700 pt-6">
                    <h5 className="text-sm font-semibold text-slate-300 mb-4">
                      Production Phases Tracking
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm bg-slate-800 rounded-lg border border-slate-700">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-700">
                            <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                              Step #
                            </th>
                            <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                              Phase / SubTask
                            </th>
                            <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                              Process Type
                            </th>
                            <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                              Assignee / Vendor
                            </th>
                            <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                              Contact / Details
                            </th>
                            <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                              Start Time
                            </th>
                            <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                              Finish Time
                            </th>
                            <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-slate-300 font-semibold">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(productionPhaseTracking).map(
                            ([key, tracking]) => {
                              const isOutsource =
                                phaseProcessType[key] === "outsource";
                              return (
                                <tr
                                  key={key}
                                  className={`border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                                    isOutsource ? "bg-orange-950/20" : ""
                                  }`}
                                >
                                  <td className="px-4 py-3 text-slate-200">
                                    {tracking.stepNumber}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div>
                                      <p className="text-slate-200 font-medium">
                                        {tracking.phase}
                                      </p>
                                      <p className="text-xs text-slate-400">
                                        {tracking.subTask}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <select
                                        value={
                                          phaseProcessType[key] || "in_house"
                                        }
                                        onChange={(e) =>
                                          setPhaseProcessType((prev) => ({
                                            ...prev,
                                            [key]: e.target.value,
                                          }))
                                        }
                                        className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                        <option value="in_house">
                                          In-House
                                        </option>
                                        <option value="outsource">
                                          Outsource
                                        </option>
                                      </select>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <input
                                      type="text"
                                      value={tracking.assignee}
                                      onChange={(e) =>
                                        updateProductionPhaseStatus(key, {
                                          assignee: e.target.value,
                                        })
                                      }
                                      placeholder={
                                        isOutsource
                                          ? "Vendor name"
                                          : "Assignee name"
                                      }
                                      className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-xs text-slate-300">
                                    {phaseDetails[key]?.responsiblePerson ||
                                      phaseDetails[key]?.vendorContact ||
                                      "—"}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-slate-300">
                                    {tracking.startTime
                                      ? new Date(
                                          tracking.startTime
                                        ).toLocaleString()
                                      : "—"}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-slate-300">
                                    {tracking.finishTime
                                      ? new Date(
                                          tracking.finishTime
                                        ).toLocaleString()
                                      : "—"}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${
                                        tracking.status === "Completed"
                                          ? "bg-green-900/50 text-green-300"
                                          : tracking.status === "In Progress"
                                          ? "bg-blue-900/50 text-blue-300"
                                          : "bg-yellow-900/50 text-yellow-300"
                                      }`}
                                    >
                                      {tracking.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex gap-1 flex-wrap">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedPhaseKey(key);
                                          setModalOpen(true);
                                        }}
                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded transition-colors"
                                      >
                                        Edit
                                      </button>
                                      {tracking.status === "Not Started" && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            startProductionPhase(key)
                                          }
                                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                                        >
                                          Start
                                        </button>
                                      )}
                                      {tracking.status === "In Progress" && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            finishProductionPhase(key)
                                          }
                                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors"
                                        >
                                          Finish
                                        </button>
                                      )}
                                      {tracking.status === "In Progress" && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateProductionPhaseStatus(key, {
                                              status: "On Hold",
                                            })
                                          }
                                          className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded transition-colors"
                                        >
                                          Hold
                                        </button>
                                      )}
                                      {(tracking.status === "On Hold" ||
                                        tracking.status === "Not Started") && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateProductionPhaseStatus(key, {
                                              status: "Cancelled",
                                            })
                                          }
                                          className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {modalOpen &&
                  selectedPhaseKey &&
                  phaseDetails[selectedPhaseKey] && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-slate-900 rounded-lg border border-slate-600 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-900/30 to-slate-800 px-6 py-4 border-b border-slate-600 flex items-center justify-between">
                          <h5 className="text-lg font-semibold text-slate-100">
                            Details -{" "}
                            {phaseDetails[selectedPhaseKey]?.subTask?.label}
                          </h5>
                          <button
                            type="button"
                            onClick={() => {
                              setModalOpen(false);
                              setSelectedPhaseKey(null);
                            }}
                            className="text-slate-400 hover:text-slate-200"
                          >
                            <X size={24} />
                          </button>
                        </div>

                        <div className="p-6 space-y-4">
                          {PRODUCTION_PHASE_FORMS[
                            phaseDetails[selectedPhaseKey]?.subTask?.value
                          ] ? (
                            <>
                              {PRODUCTION_PHASE_FORMS[
                                phaseDetails[selectedPhaseKey]?.subTask?.value
                              ].map((field, idx) => {
                                const value =
                                  phaseDetails[selectedPhaseKey]?.[
                                    field.name
                                  ] || "";

                                if (field.type === "select") {
                                  return (
                                    <div key={idx}>
                                      <label className="block text-sm font-medium text-slate-300 mb-2">
                                        {field.label}
                                      </label>
                                      <select
                                        value={value}
                                        onChange={(e) =>
                                          handlePhaseDetailChange(
                                            selectedPhaseKey,
                                            field.name,
                                            e.target.value
                                          )
                                        }
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                        <option value="">
                                          Select {field.label}
                                        </option>
                                        {field.options?.map((opt) => (
                                          <option key={opt} value={opt}>
                                            {opt}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  );
                                }

                                if (field.type === "textarea") {
                                  return (
                                    <div key={idx}>
                                      <label className="block text-sm font-medium text-slate-300 mb-2">
                                        {field.label}
                                      </label>
                                      <textarea
                                        value={value}
                                        onChange={(e) =>
                                          handlePhaseDetailChange(
                                            selectedPhaseKey,
                                            field.name,
                                            e.target.value
                                          )
                                        }
                                        rows="3"
                                        placeholder={field.placeholder}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                  );
                                }

                                if (field.type === "file") {
                                  return (
                                    <div key={idx}>
                                      <label className="block text-sm font-medium text-slate-300 mb-2">
                                        {field.label}
                                      </label>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="file"
                                          onChange={(e) => {
                                            const fileName =
                                              e.target.files?.[0]?.name || "";
                                            handlePhaseDetailChange(
                                              selectedPhaseKey,
                                              field.name,
                                              fileName
                                            );
                                          }}
                                          className="hidden"
                                          id={`file-${field.name}`}
                                        />
                                        <label
                                          htmlFor={`file-${field.name}`}
                                          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 cursor-pointer hover:bg-slate-600 text-center text-sm"
                                        >
                                          {value || "Choose File"}
                                        </label>
                                      </div>
                                    </div>
                                  );
                                }

                                return (
                                  <Input
                                    key={idx}
                                    label={field.label}
                                    type={field.type}
                                    value={value}
                                    onChange={(e) =>
                                      handlePhaseDetailChange(
                                        selectedPhaseKey,
                                        field.name,
                                        e.target.value
                                      )
                                    }
                                    placeholder={field.placeholder}
                                  />
                                );
                              })}
                            </>
                          ) : null}

                          <div className="flex gap-2 pt-4 border-t border-slate-700">
                            <button
                              type="button"
                              onClick={() => {
                                removePhaseDetail(selectedPhaseKey);
                                setModalOpen(false);
                                setSelectedPhaseKey(null);
                              }}
                              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={savePhaseDetailsAndCreateTracking}
                              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                              Save Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </FormSection>
    </div>
  );
}
