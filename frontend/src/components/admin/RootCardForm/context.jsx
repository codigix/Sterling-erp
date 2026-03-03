import { useReducer, useMemo, useEffect } from "react";
import { RootCardContext } from "./RootCardContext";

const initialState = {
  currentStep: 1,
  createdOrderId: null,
  orderSubmitted: false,
  loading: false,
  error: null,
  successMessage: null,
  employees: [],
  projectCategories: [],
  materialUnits: [],
  materialSources: [],
  priorityLevels: [],
  formData: {
    poNumber: "",
    poDate: new Date().toISOString().split("T")[0],
    clientName: "",
    clientAddress: "",
    projectName: "",
    projectCategory: "",
    deliveryTimeline: "",
    paymentTerms: "",
    specialInstructions: "",
    customerContact: "",
    clientEmail: "",
    clientPhone: "",
    billingAddress: "",
    shippingAddress: "",
    projectStartDate: new Date().toISOString().split("T")[0],
    estimatedEndDate: "",
    projectPriority: "medium",
    internalProjectOwner: "",
    totalAmount: "",
    projectCode: "",
    materials: [],
    projectEmployees: [],
    projectRequirements: {
      application: "",
      numberOfUnits: "",
      dimensions: "",
      loadCapacity: "",
      specifications: {},
      materialGrade: "",
      finishCoatings: "",
      accessories: "",
      installationRequirement: "",
      testingStandards: "",
      documentationRequirement: "",
      warrantTerms: "",
      penaltyClauses: "",
      confidentialityClauses: "",
      acceptanceCriteria: "",
    },
    clientPO: {
      poNumber: "",
      poDate: new Date().toISOString().split("T")[0],
      poValue: "",
    },
    productDetails: {
      itemName: "",
      itemDescription: "",
      componentsList: "",
      certification: "",
    },
    pricingDetails: {
      quantity: "",
      unitPrice: "",
      totalPrice: "",
      discount: "",
      taxesApplicable: "18% GST",
    },
    deliveryTerms: {
      deliverySchedule: "",
      packagingInfo: "",
      dispatchMode: "",
      installationRequired: "",
      siteCommissioning: "",
    },
    qualityCompliance: {
      qualityStandards: "",
      weldingStandards: "",
      surfaceFinish: "",
      mechanicalLoadTesting: "",
      electricalCompliance: "",
      documentsRequired: "",
    },
    warrantySupport: {
      warrantyPeriod: "",
      serviceSupport: "",
    },
    internalInfo: {
      projectManager: "",
      productionSupervisor: "",
      purchaseResponsiblePerson: "",
      estimatedCosting: "",
      estimatedProfit: "",
      jobCardNo: "",
    },
    productionPlan: {
      rootCardNo: "",
      revisionNo: "1",
      stages: [],
      productionStartDate: "",
      estimatedCompletionDate: "",
      materialProcurementStatus: "",
      vendorAllocation: "",
      materialInfo: {
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
        mtcFile: "",
        materialImage: "",
      },
    },
    designEngineering: {
      generalDesignInfo: {
        designId: "",
        revisionNo: "",
        designEngineerName: "",
        designStartDate: "",
        designCompletionDate: "",
        designStatus: "draft",
      },
      productSpecification: {
        productName: "",
        systemLength: "",
        systemWidth: "",
        systemHeight: "",
        loadCapacity: "6000",
        operatingEnvironment: "",
        materialGrade: "",
        surfaceFinish: "",
      },
      baseFrameRails: {
        baseFrameLength: "",
        sectionType: "",
        railType: "",
        railAlignmentTolerance: "",
        railMountingMethod: "",
      },
      rollerSaddleAssembly: {
        noOfSaddleUnits: "",
        saddleLoadCapacity: "",
        rollerType: "",
        rollerDiameter: "",
        rollerBearingType: "",
      },
      rotationalCradle: {
        cradleDiameter: "",
        rotationAngle: "",
        mechanism: "",
        lockingSystemType: "",
      },
      winchPullingSystem: {
        winchCapacity: "",
        motorPower: "",
        gearboxType: "",
        cableLength: "",
        cableDiameter: "",
      },
      electricalControl: {
        controlPanelType: "",
        powerRequirement: "",
        limitSwitchCount: "",
        sensorTypes: "",
        emergencyStopRequirement: "",
        controlLogic: "",
      },
      safetyRequirements: {
        guardRequirements: "",
        interlocksRequired: "",
        antiTiltSystemDesign: "",
        maxOperatingSpeed: "",
        loadTestSafetyFactor: "",
      },
      standardsCompliance: {
        weldingStandard: "",
        paintingStandard: "",
        dimensionalToleranceStandards: "",
        qcInspectionStageRequired: "",
        drodComplianceRequirements: "",
      },
      attachments: {
        drawings: [],
        documents: [],
        model3D: "",
        fabricationDrawings: "",
        assemblyDrawings: "",
        bomSheet: "",
        calculationSheet: "",
      },
      commentsNotes: {
        internalDesignNotes: "",
        riskAssessment: "",
        designConstraints: "",
        specialInstructions: "",
      },
    },
    materialProcurement: {
      materialProcurement: "",
      vendorAllocation: "",
      incomingInspection: "",
    },
    qualityCheck: {
      finalInspection: "",
      documentation: "",
    },
    shipment: {
      marking: "",
      dismantling: "",
      packing: "",
      dispatch: "",
    },
    delivery: {
      actualDeliveryDate: "",
      deliveredTo: "",
      receivedBy: "",
      podNumber: "",
      deliveryStatus: "pending",
      installationCompleted: "",
      siteCommissioningCompleted: "",
      warrantyTermsAcceptance: "",
      completionRemarks: "",
      projectManager: "",
      productionSupervisor: "",
    },
    deliveryAssignedTo: "",
    designEngineeringAssignedTo: "",
    materialRequirementsAssignedTo: "",
    productionPlanAssignedTo: "",
    qualityCheckAssignedTo: "",
    shipmentAssignedTo: "",
    availablePhases: [],
  },
  enabledMaterials: {
    steelSection: false,
    plateType: false,
    materialGrade: false,
    fastenerType: false,
    machinedParts: false,
    rollerMovementComponents: false,
    liftingPullingMechanisms: false,
    electricalAutomation: false,
    safetyMaterials: false,
    surfacePrepPainting: false,
    fabricationConsumables: false,
    hardwareMisc: false,
    documentationMaterials: false,
  },
  materialDetailsTable: {
    steelSection: [],
    plateType: [],
    materialGrade: [],
    fastenerType: [],
    machinedParts: [],
    rollerMovementComponents: [],
    liftingPullingMechanisms: [],
    electricalAutomation: [],
    safetyMaterials: [],
    surfacePrepPainting: [],
    fabricationConsumables: [],
    hardwareMisc: [],
    documentationMaterials: [],
  },
  productionPhaseDetails: {},
  productionPhaseTracking: {},
  poDocuments: [],
  stepAssignees: { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "" },
  stepNotes: { 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "" },
};

const ACTION_TYPES = {
  SET_STEP: "SET_STEP",
  UPDATE_FIELD: "UPDATE_FIELD",
  SET_NESTED_FIELD: "SET_NESTED_FIELD",
  UPDATE_DEEP_NESTED_FIELD: "UPDATE_DEEP_NESTED_FIELD",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_SUCCESS: "SET_SUCCESS",
  SET_ORDER_ID: "SET_ORDER_ID",
  SET_ORDER_SUBMITTED: "SET_ORDER_SUBMITTED",
  ADD_MATERIAL: "ADD_MATERIAL",
  UPDATE_MATERIAL_DETAIL: "UPDATE_MATERIAL_DETAIL",
  DELETE_MATERIAL_DETAIL: "DELETE_MATERIAL_DETAIL",
  TOGGLE_MATERIAL_TYPE: "TOGGLE_MATERIAL_TYPE",
  SET_CONFIG_DATA: "SET_CONFIG_DATA",
  SET_EMPLOYEES: "SET_EMPLOYEES",
  SET_PO_DOCUMENTS: "SET_PO_DOCUMENTS",
  SET_STEP_ASSIGNEE: "SET_STEP_ASSIGNEE",
  SET_STEP_NOTE: "SET_STEP_NOTE",
  SET_MATERIAL_DETAILS_TABLE: "SET_MATERIAL_DETAILS_TABLE",
  SET_PRODUCTION_PHASE_DETAILS: "SET_PRODUCTION_PHASE_DETAILS",
  SET_FORM_DATA: "SET_FORM_DATA",
  SET_DRAFT_DATA: "SET_DRAFT_DATA",
  RESET: "RESET",
};

function reducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_STEP:
      return { ...state, currentStep: action.payload };
    case ACTION_TYPES.UPDATE_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value,
        },
      };
    case ACTION_TYPES.SET_NESTED_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.section]: {
            ...state.formData[action.section],
            [action.field]: action.value,
          },
        },
      };
    case ACTION_TYPES.UPDATE_DEEP_NESTED_FIELD: {
      const { section, subsection, field, value } = action;
      return {
        ...state,
        formData: {
          ...state.formData,
          [section]: {
            ...state.formData[section],
            [subsection]: {
              ...state.formData[section][subsection],
              [field]: value,
            },
          },
        },
      };
    }
    case ACTION_TYPES.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTION_TYPES.SET_SUCCESS:
      return { ...state, successMessage: action.payload };
    case ACTION_TYPES.SET_ORDER_ID:
      return { ...state, createdOrderId: action.payload };
    case ACTION_TYPES.SET_ORDER_SUBMITTED:
      return { ...state, orderSubmitted: action.payload };
    case ACTION_TYPES.ADD_MATERIAL:
      return {
        ...state,
        formData: {
          ...state.formData,
          materials: [...state.formData.materials, action.payload],
        },
      };
    case ACTION_TYPES.UPDATE_MATERIAL_DETAIL: {
      const { materialType, index, details } = action;
      return {
        ...state,
        materialDetailsTable: {
          ...state.materialDetailsTable,
          [materialType]: [
            ...state.materialDetailsTable[materialType].slice(0, index),
            details,
            ...state.materialDetailsTable[materialType].slice(index + 1),
          ],
        },
      };
    }
    case ACTION_TYPES.DELETE_MATERIAL_DETAIL: {
      const { materialType, index } = action;
      return {
        ...state,
        materialDetailsTable: {
          ...state.materialDetailsTable,
          [materialType]: state.materialDetailsTable[materialType].filter(
            (_, i) => i !== index,
          ),
        },
      };
    }
    case ACTION_TYPES.TOGGLE_MATERIAL_TYPE: {
      const { materialType } = action;
      return {
        ...state,
        enabledMaterials: {
          ...state.enabledMaterials,
          [materialType]: !state.enabledMaterials[materialType],
        },
      };
    }
    case ACTION_TYPES.SET_CONFIG_DATA:
      return {
        ...state,
        projectCategories: action.projectCategories || [],
        materialUnits: action.materialUnits || [],
        materialSources: action.materialSources || [],
        priorityLevels: action.priorityLevels || [],
      };
    case ACTION_TYPES.SET_EMPLOYEES:
      return { ...state, employees: action.payload };
    case ACTION_TYPES.SET_PO_DOCUMENTS:
      return { ...state, poDocuments: action.payload };
    case ACTION_TYPES.SET_STEP_ASSIGNEE:
      return {
        ...state,
        stepAssignees: {
          ...state.stepAssignees,
          [action.step]: action.value,
        },
      };
    case ACTION_TYPES.SET_STEP_NOTE:
      return {
        ...state,
        stepNotes: {
          ...state.stepNotes,
          [action.step]: action.value,
        },
      };
    case ACTION_TYPES.SET_MATERIAL_DETAILS_TABLE:
      return { ...state, materialDetailsTable: action.payload };
    case ACTION_TYPES.SET_PRODUCTION_PHASE_DETAILS:
      return { ...state, productionPhaseDetails: action.payload };
    case ACTION_TYPES.SET_FORM_DATA:
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload,
        },
      };
    case ACTION_TYPES.SET_DRAFT_DATA:
      return {
        ...state,
        createdOrderId: action.payload.id,
        currentStep: action.payload.currentStep || 1,
        formData: {
          ...state.formData,
          ...action.payload.formData,
        },
        materialDetailsTable:
          action.payload.materialDetailsTable || state.materialDetailsTable,
        productionPhaseDetails:
          action.payload.productionPhaseDetails || state.productionPhaseDetails,
        poDocuments: action.payload.poDocuments || state.poDocuments,
      };
    case ACTION_TYPES.RESET:
      return initialState;
    default:
      return state;
  }
}

export function RootCardProvider({
  children,
  mode = "create",
  initialData = null,
  assigneeData = null,
}) {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    createdOrderId: initialData?.id || initialData?._id || null,
  });

  // Keep createdOrderId in sync with initialData if it arrives later
  useEffect(() => {
    if (initialData?.id || initialData?._id) {
      dispatch({
        type: ACTION_TYPES.SET_ORDER_ID,
        payload: initialData.id || initialData._id,
      });
    }
  }, [initialData]);

  const actions = useMemo(
    () => ({
      setStep: (step) => {
        dispatch({ type: ACTION_TYPES.SET_STEP, payload: step });
      },
      updateField: (field, value) => {
        dispatch({ type: ACTION_TYPES.UPDATE_FIELD, field, value });
      },
      setNestedField: (section, field, value) => {
        dispatch({
          type: ACTION_TYPES.SET_NESTED_FIELD,
          section,
          field,
          value,
        });
      },
      updateDeepNestedField: (section, subsection, field, value) => {
        dispatch({
          type: ACTION_TYPES.UPDATE_DEEP_NESTED_FIELD,
          section,
          subsection,
          field,
          value,
        });
      },
      setLoading: (loading) => {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading });
      },
      setError: (error) => {
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error });
      },
      setSuccess: (msg) => {
        dispatch({ type: ACTION_TYPES.SET_SUCCESS, payload: msg });
      },
      setOrderId: (id) => {
        dispatch({ type: ACTION_TYPES.SET_ORDER_ID, payload: id });
      },
      setOrderSubmitted: (submitted) => {
        dispatch({
          type: ACTION_TYPES.SET_ORDER_SUBMITTED,
          payload: submitted,
        });
      },
      updateMaterialDetail: (materialType, index, details) => {
        dispatch({
          type: ACTION_TYPES.UPDATE_MATERIAL_DETAIL,
          materialType,
          index,
          details,
        });
      },
      deleteMaterialDetail: (materialType, index) => {
        dispatch({
          type: ACTION_TYPES.DELETE_MATERIAL_DETAIL,
          materialType,
          index,
        });
      },
      toggleMaterialType: (materialType) => {
        dispatch({ type: ACTION_TYPES.TOGGLE_MATERIAL_TYPE, materialType });
      },
      setConfigData: (
        projectCategories,
        materialUnits,
        materialSources,
        priorityLevels,
      ) => {
        dispatch({
          type: ACTION_TYPES.SET_CONFIG_DATA,
          projectCategories,
          materialUnits,
          materialSources,
          priorityLevels,
        });
      },
      setEmployees: (employees) => {
        dispatch({ type: ACTION_TYPES.SET_EMPLOYEES, payload: employees });
      },
      setPoDocuments: (documents) => {
        dispatch({ type: ACTION_TYPES.SET_PO_DOCUMENTS, payload: documents });
      },
      setStepAssignee: (step, value) => {
        dispatch({ type: ACTION_TYPES.SET_STEP_ASSIGNEE, step, value });
      },
      setStepNote: (step, value) => {
        dispatch({ type: ACTION_TYPES.SET_STEP_NOTE, step, value });
      },
      setMaterialDetailsTable: (table) => {
        dispatch({
          type: ACTION_TYPES.SET_MATERIAL_DETAILS_TABLE,
          payload: table,
        });
      },
      setProductionPhaseDetails: (details) => {
        dispatch({
          type: ACTION_TYPES.SET_PRODUCTION_PHASE_DETAILS,
          payload: details,
        });
      },
      setFormData: (formData) => {
        dispatch({ type: ACTION_TYPES.SET_FORM_DATA, payload: formData });
      },
      setDraftData: (draftData) => {
        dispatch({ type: ACTION_TYPES.SET_DRAFT_DATA, payload: draftData });
      },
      reset: () => {
        dispatch({ type: ACTION_TYPES.RESET });
      },
    }),
    [],
  );

  const value = useMemo(
    () => ({
      state,
      ...actions,
      mode,
      initialData,
      assigneeData,
    }),
    [state, actions, mode, initialData, assigneeData],
  );

  return (
    <RootCardContext.Provider value={value}>
      {children}
    </RootCardContext.Provider>
  );
}
