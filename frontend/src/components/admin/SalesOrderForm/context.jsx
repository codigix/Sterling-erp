import { createContext, useReducer, useCallback } from "react";

export const SalesOrderContext = createContext();

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
      specifications: "",
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
      itemName: "CCIS – Container Canister Integration Stand",
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
        designStatus: "Pending",
      },
      productSpecification: {
        productName: "CCIS – Container Canister Integration Stand",
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
  selectedProductionPhases: {},
  productionPhaseDetails: {},
  productionPhaseTracking: {},
  poDocuments: [],
  stepAssignees: { 6: "", 7: "", 8: "" },
  stepNotes: { 6: "", 7: "", 8: "" },
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
          [materialType]: state.materialDetailsTable[materialType].filter((_, i) => i !== index),
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
    case ACTION_TYPES.RESET:
      return initialState;
    default:
      return state;
  }
}

export function SalesOrderProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = {
    setStep: useCallback((step) => {
      dispatch({ type: ACTION_TYPES.SET_STEP, payload: step });
    }, []),
    updateField: useCallback((field, value) => {
      dispatch({ type: ACTION_TYPES.UPDATE_FIELD, field, value });
    }, []),
    setNestedField: useCallback((section, field, value) => {
      dispatch({ type: ACTION_TYPES.SET_NESTED_FIELD, section, field, value });
    }, []),
    updateDeepNestedField: useCallback((section, subsection, field, value) => {
      dispatch({ type: ACTION_TYPES.UPDATE_DEEP_NESTED_FIELD, section, subsection, field, value });
    }, []),
    setLoading: useCallback((loading) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: loading });
    }, []),
    setError: useCallback((error) => {
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error });
    }, []),
    setSuccess: useCallback((msg) => {
      dispatch({ type: ACTION_TYPES.SET_SUCCESS, payload: msg });
    }, []),
    setOrderId: useCallback((id) => {
      dispatch({ type: ACTION_TYPES.SET_ORDER_ID, payload: id });
    }, []),
    setOrderSubmitted: useCallback((submitted) => {
      dispatch({ type: ACTION_TYPES.SET_ORDER_SUBMITTED, payload: submitted });
    }, []),
    updateMaterialDetail: useCallback((materialType, index, details) => {
      dispatch({ type: ACTION_TYPES.UPDATE_MATERIAL_DETAIL, materialType, index, details });
    }, []),
    deleteMaterialDetail: useCallback((materialType, index) => {
      dispatch({ type: ACTION_TYPES.DELETE_MATERIAL_DETAIL, materialType, index });
    }, []),
    toggleMaterialType: useCallback((materialType) => {
      dispatch({ type: ACTION_TYPES.TOGGLE_MATERIAL_TYPE, materialType });
    }, []),
    setConfigData: useCallback((projectCategories, materialUnits, materialSources, priorityLevels) => {
      dispatch({
        type: ACTION_TYPES.SET_CONFIG_DATA,
        projectCategories,
        materialUnits,
        materialSources,
        priorityLevels,
      });
    }, []),
    setEmployees: useCallback((employees) => {
      dispatch({ type: ACTION_TYPES.SET_EMPLOYEES, payload: employees });
    }, []),
    setPoDocuments: useCallback((documents) => {
      dispatch({ type: ACTION_TYPES.SET_PO_DOCUMENTS, payload: documents });
    }, []),
    setStepAssignee: useCallback((step, value) => {
      dispatch({ type: ACTION_TYPES.SET_STEP_ASSIGNEE, step, value });
    }, []),
    setStepNote: useCallback((step, value) => {
      dispatch({ type: ACTION_TYPES.SET_STEP_NOTE, step, value });
    }, []),
    reset: useCallback(() => {
      dispatch({ type: ACTION_TYPES.RESET });
    }, []),
  };

  return (
    <SalesOrderContext.Provider value={{ state, ...actions }}>
      {children}
    </SalesOrderContext.Provider>
  );
}
