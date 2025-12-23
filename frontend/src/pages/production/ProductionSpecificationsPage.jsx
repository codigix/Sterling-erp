import React, { useState } from 'react';
import { FileText, Plus, X, Save } from 'lucide-react';
import Card, { CardContent, CardTitle, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

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
      placeholder: "e.g., Follow drawing DRG-001 exactly, Use waterproof marker",
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

const ProductionSpecificationsPage = () => {
  const [productionStages, setProductionStages] = useState([
    {
      id: 1,
      stepNumber: 1,
      phase: "Material Prep",
      subTask: "Marking",
      assignee: "John Doe",
      status: "Completed",
      startTime: "2025-01-10 08:00",
      finishTime: "2025-01-10 09:30",
    },
  ]);
  const [selectedPhaseKey, setSelectedPhaseKey] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [phaseDetails, setPhaseDetails] = useState({});
  const [selectedPhaseType, setSelectedPhaseType] = useState(null);

  const handleEditStage = (stage) => {
    setSelectedPhaseKey(stage.id);
    setSelectedPhaseType("mig_welding");
    setModalOpen(true);
  };

  const handleAddStage = () => {
    setSelectedPhaseKey(null);
    setPhaseDetails({});
    setSelectedPhaseType("marking");
    setModalOpen(true);
  };

  const handlePhaseDetailChange = (field, value) => {
    setPhaseDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveStage = () => {
    if (selectedPhaseKey) {
      setProductionStages(
        productionStages.map((s) =>
          s.id === selectedPhaseKey ? { ...s, ...phaseDetails } : s
        )
      );
    } else {
      const newStage = {
        id: Math.max(...productionStages.map((s) => s.id), 0) + 1,
        stepNumber: productionStages.length + 1,
        ...phaseDetails,
      };
      setProductionStages([...productionStages, newStage]);
    }
    setModalOpen(false);
    setPhaseDetails({});
  };

  const handleDeleteStage = (id) => {
    if (window.confirm("Are you sure you want to delete this production stage?")) {
      setProductionStages(productionStages.filter((s) => s.id !== id));
    }
  };

  const handleStartStage = (id) => {
    setProductionStages(
      productionStages.map((s) =>
        s.id === id
          ? { ...s, status: "In Progress", startTime: new Date().toLocaleString() }
          : s
      )
    );
  };

  const handleFinishStage = (id) => {
    setProductionStages(
      productionStages.map((s) =>
        s.id === id
          ? { ...s, status: "Completed", finishTime: new Date().toLocaleString() }
          : s
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <FileText className="text-blue-600" size={36} />
              Production Specifications
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs ">
              Manage production phases, sub-tasks, requirements, and detailed specifications
            </p>
          </div>
          <Button onClick={handleAddStage} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-2" />
            Add Production Stage
          </Button>
        </div>

        {/* Production Stages Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Production Stages & Timeline
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="p-2 text-left text-slate-900 dark:text-white font-semibold">
                    Step #
                  </th>
                  <th className="p-2 text-left text-slate-900 dark:text-white font-semibold">
                    Phase / SubTask
                  </th>
                  <th className="p-2 text-left text-slate-900 dark:text-white font-semibold">
                    Assignee
                  </th>
                  <th className="p-2 text-left text-slate-900 dark:text-white font-semibold">
                    Start Time
                  </th>
                  <th className="p-2 text-left text-slate-900 dark:text-white font-semibold">
                    Finish Time
                  </th>
                  <th className="p-2 text-left text-slate-900 dark:text-white font-semibold">
                    Status
                  </th>
                  <th className="p-2 text-left text-slate-900 dark:text-white font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {productionStages.map((stage) => (
                  <tr key={stage.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="p-2 text-slate-900 dark:text-white">{stage.stepNumber}</td>
                    <td className="p-2">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{stage.phase}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{stage.subTask}</p>
                      </div>
                    </td>
                    <td className="p-2 text-slate-900 dark:text-white">{stage.assignee}</td>
                    <td className="p-2 text-slate-900 dark:text-white text-xs">{stage.startTime || "—"}</td>
                    <td className="p-2 text-slate-900 dark:text-white text-xs">{stage.finishTime || "—"}</td>
                    <td className="p-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          stage.status === "Completed"
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : stage.status === "In Progress"
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                            : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                        }`}
                      >
                        {stage.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleEditStage(stage)}
                          className="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                        >
                          Edit
                        </button>
                        {stage.status === "Completed" && (
                          <span className="text-xs text-slate-500">Completed</span>
                        )}
                        {stage.status !== "Completed" && stage.status !== "In Progress" && (
                          <button
                            onClick={() => handleStartStage(stage.id)}
                            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          >
                            Start
                          </button>
                        )}
                        {stage.status === "In Progress" && (
                          <button
                            onClick={() => handleFinishStage(stage.id)}
                            className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                          >
                            Finish
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteStage(stage.id)}
                          className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-1 border-b border-blue-400 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {selectedPhaseKey ? "Edit Production Stage" : "Add Production Stage"}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white hover:bg-blue-700 p-2 rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Phase Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 text-left dark:text-white mb-2">
                      Production Phase
                    </label>
                    <select
                      value={phaseDetails.phase || ""}
                      onChange={(e) => handlePhaseDetailChange("phase", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Phase</option>
                      {Object.keys(PRODUCTION_PHASES).map((phase) => (
                        <option key={phase} value={phase}>
                          {phase}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 text-left dark:text-white mb-2">
                      Sub-Task
                    </label>
                    <select
                      value={phaseDetails.subTask || ""}
                      onChange={(e) => {
                        handlePhaseDetailChange("subTask", e.target.value);
                        const phaseObj = Object.entries(PRODUCTION_PHASES).find(
                          ([, tasks]) =>
                            tasks.some((t) => t.label === e.target.value)
                        );
                        if (phaseObj) {
                          const task = phaseObj[1].find((t) => t.label === e.target.value);
                          setSelectedPhaseType(task?.value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Sub-Task</option>
                      {phaseDetails.phase &&
                        PRODUCTION_PHASES[phaseDetails.phase]?.map((task) => (
                          <option key={task.value} value={task.label}>
                            {task.label}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Form Fields */}
                {selectedPhaseType &&
                  PRODUCTION_PHASE_FORMS[selectedPhaseType] &&
                  PRODUCTION_PHASE_FORMS[selectedPhaseType].map((field, idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-slate-900 text-left dark:text-white mb-2">
                        {field.label}
                      </label>
                      {field.type === "text" || field.type === "number" || field.type === "date" ? (
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={phaseDetails[field.name] || ""}
                          onChange={(e) => handlePhaseDetailChange(field.name, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : field.type === "select" ? (
                        <select
                          value={phaseDetails[field.name] || ""}
                          onChange={(e) => handlePhaseDetailChange(field.name, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea
                          placeholder={field.placeholder}
                          value={phaseDetails[field.name] || ""}
                          onChange={(e) => handlePhaseDetailChange(field.name, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="4"
                        />
                      ) : field.type === "file" ? (
                        <input
                          type="file"
                          onChange={(e) => handlePhaseDetailChange(field.name, e.target.files?.[0])}
                          className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 dark:file:bg-slate-600 file:text-slate-900 dark:file:text-white hover:file:bg-slate-200 dark:hover:file:bg-slate-500"
                        />
                      ) : null}
                    </div>
                  ))}

                {/* Assignee */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 text-left dark:text-white mb-2">
                    Assignee / Operator
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., John Doe"
                    value={phaseDetails.assignee || ""}
                    onChange={(e) => handlePhaseDetailChange("assignee", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-700 p-1 border-t border-slate-200 dark:border-slate-600 flex gap-3 justify-end">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Stage
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionSpecificationsPage;
