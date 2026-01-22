import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Save,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import axios from "../../../utils/api";
import Swal from "sweetalert2";
import SearchableSelect from "../../../components/ui/SearchableSelect";

const initialBOMState = {
  productInfo: {
    productName: "",
    itemCode: "",
    itemGroup: "",
    quantity: 1,
    uom: "Kg",
    revision: 1,
    description: "",
    isActive: true,
    isDefault: false,
    status: "draft",
    rootCardId: null,
    projectId: null,
  },
  components: [],
  materials: [],
  operations: [],
  scrapLoss: [],
};

const CreateBOMPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [requirementMaterials, setRequirementMaterials] = useState([]);
  const [rootCards, setRootCards] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [bomId, setBomId] = useState(null);
  const [workstations, setWorkstations] = useState([]);
  const [rootCardStages, setRootCardStages] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [operations, setOperations] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    product: true,
    components: true,
    materials: true,
    operations: true,
    scrap: true,
    costs: true,
  });

  const [bomData, setBomData] = useState({
    ...initialBOMState,
    productInfo: {
      ...initialBOMState.productInfo,
      rootCardId: searchParams.get("rootCardId") || null,
      projectId: searchParams.get("projectId") || null,
    }
  });

  const [costs, setCosts] = useState({
    materialCost: 0,
    componentCost: 0,
    operationCost: 0,
    scrapLossCost: 0,
    materialCostAfterScrap: 0,
    totalBOMCost: 0,
  });

  const UOMOptions = ["Kg", "pcs", "m", "l", "set", "Box"];
  const ItemGroupOptions = ["Raw Material", "Component", "Sub-assembly", "Finished Good"];
  const StatusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Active", value: "active" },
    { label: "Approved", value: "approved" }
  ];
  const OperationOptions = [
    "Cutting",
    "Welding",
    "Bending",
    "Grinding",
    "Drilling",
    "Turning",
    "Milling",
    "Assembly",
    "Painting",
    "Heat Treatment",
    "Plating",
    "Stamping",
    "Casting",
    "Forging",
    "Testing",
    "Packaging"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingMaterials(true);
        const [facilitiesRes, rootCardsRes] = await Promise.all([
          axios.get("/inventory/facilities"),
          axios.get("/production/root-cards")
        ]);
        
        setMaterials([]);
        setRootCards(rootCardsRes.data.rootCards || []);
        const facilitiesList = facilitiesRes.data.facilities || [];
        setWorkstations(facilitiesList);
        
        // Use default warehouses since we're not fetching from inventory
        setWarehouses(["Main Warehouse", "Secondary Warehouse"]);

        // Handle initial rootCardId from URL
        const urlRootCardId = searchParams.get("rootCardId");
        if (urlRootCardId) {
          handleRootCardSelect(urlRootCardId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setMaterials([]);
        setWorkstations([]);
        setWarehouses(["Main Warehouse", "Secondary Warehouse"]);
      } finally {
        setLoadingMaterials(false);
      }
    };

    fetchData();
  }, []);

  const allAvailableMaterials = React.useMemo(() => {
    const combined = [...materials];
    
    requirementMaterials.forEach(req => {
      const name = req.itemName || req.name;
      if (!name) return; // Skip if no name found

      const exists = combined.some(m => 
        (m.itemName && m.itemName === name) || 
        (req.itemCode && m.itemCode === req.itemCode)
      );

      if (!exists) {
        combined.push({
          itemName: name,
          itemCode: req.itemCode || `REQ-${name.substring(0, 3).toUpperCase()}`,
          category: req.itemGroup || req.category,
          unit: req.uom || req.unit,
          unit_cost: req.rate || req.unitCost || 0,
          isRequirement: true
        });
      }
    });
    
    return combined.filter(m => m.itemName); // Ensure all have names
  }, [materials, requirementMaterials]);

  const productNameOptions = allAvailableMaterials.map((m) => ({
    label: m.itemName,
    value: m.itemName,
  }));

  const itemCodeOptions = allAvailableMaterials.map((m) => ({
    label: m.itemCode,
    value: m.itemCode,
  }));

  const itemGroupSelectOptions = ItemGroupOptions.map((group) => ({
    label: group,
    value: group,
  }));

  const workstationOptions = React.useMemo(() => {
    const options = workstations.map((w) => ({
      label: w.name,
      value: w.name,
    }));

    // Add assigned workers from root card stages if not already in workstations
    rootCardStages.forEach(stage => {
      if (stage.assigned_worker && !workstations.some(w => w.name === stage.assigned_worker)) {
        options.push({
          label: stage.assigned_worker,
          value: stage.assigned_worker
        });
      }
    });

    return options;
  }, [workstations, rootCardStages]);

  const warehouseOptions = warehouses.map((w) => ({
    label: w,
    value: w,
  }));

  const operationTypeOptions = [
    { label: "In-house", value: "in-house" },
    { label: "Outsource", value: "outsource" }
  ];

  const operationSelectOptions = React.useMemo(() => {
    // Start with stages from the production plan (Root Card / Project)
    const options = rootCardStages.map(stage => ({
      label: stage.stage_name,
      value: stage.stage_name
    })).filter(opt => opt.label);

    // Add standard operations, but only if they're not already in the plan
    OperationOptions.forEach(op => {
      if (!options.some(opt => opt.label === op)) {
        options.push({
          label: op,
          value: op
        });
      }
    });

    return options;
  }, [rootCardStages]);

  const UOMSelectOptions = UOMOptions.map((uom) => ({
    label: uom,
    value: uom,
  }));

  const rootCardOptions = rootCards.map((rc) => ({
    label: `${rc.code} - ${rc.title}`,
    value: rc.id,
  }));

  const handleRootCardSelect = async (rootCardId) => {
    try {
      // Clear previous requirement materials and data
      setRequirementMaterials([]);
      setRootCardStages([]);
      setBomData(prev => ({
        ...initialBOMState,
        productInfo: {
          ...initialBOMState.productInfo,
          projectId: prev.productInfo.projectId,
          rootCardId: rootCardId
        }
      }));

      const response = await axios.get(`/production/root-cards/${rootCardId}`);
      const rootCard = response.data;
      
      if (rootCard) {
        // 1. Check if Design Engineering step is completed (Point 17 & 19)
        if (!rootCard.designEngineering) {
          Swal.fire({
            icon: 'warning',
            title: 'Design Missing',
            text: 'BOM cannot be created because Design Engineering details are missing for this root card.'
          });
          return;
        }

        // Set stages for dropdown options
        if (rootCard.stages) {
          setRootCardStages(rootCard.stages);
        }

        // 2. Check if a BOM already exists for this root card (Point 20)
        try {
          const bomResponse = await axios.get(`/engineering/bom/root-card/${rootCardId}`);
          if (bomResponse.data && bomResponse.data.id) {
            const result = await Swal.fire({
              title: 'BOM Already Exists',
              text: 'An existing BOM was found for this root card. Would you like to load and edit it?',
              icon: 'info',
              showCancelButton: true,
              confirmButtonText: 'Yes, load it',
              cancelButtonText: 'No, stay here'
            });

            if (result.isConfirmed) {
              const existingBOM = bomResponse.data;
              setBomData({
                productInfo: {
                  productName: existingBOM.product_name,
                  itemCode: existingBOM.item_code,
                  itemGroup: existingBOM.item_group,
                  quantity: existingBOM.quantity,
                  uom: existingBOM.uom,
                  revision: existingBOM.revision,
                  description: existingBOM.description,
                  isActive: existingBOM.is_active === 1,
                  isDefault: existingBOM.is_default === 1,
                  status: existingBOM.status || 'draft',
                  projectId: existingBOM.project_id,
                  rootCardId: existingBOM.root_card_id,
                },
                components: existingBOM.components || [],
                materials: existingBOM.materials || [],
                operations: existingBOM.operations || [],
                scrapLoss: existingBOM.scrapLoss || [],
              });
              setEditMode(true);
              setBomId(existingBOM.id);

              // Fetch requirements for the dropdown even when editing
              if (existingBOM.sales_order_id) {
                try {
                  const reqRes = await axios.get(`/root-cards/requirements/${existingBOM.sales_order_id}`);
                  if (reqRes.data?.success && reqRes.data?.data?.materials) {
                    setRequirementMaterials(reqRes.data.data.materials);
                  }
                } catch (e) {
                  console.error("Error fetching requirements in edit mode:", e);
                }
              }
              return;
            }
          }
        } catch (bomErr) {
          // If 404, it means no BOM exists, which is fine
          if (bomErr.response?.status !== 404) {
            console.error("Error checking for existing BOM:", bomErr);
          }
        }

        let productInfo = { ...bomData.productInfo };
        
        // Auto-fill from root card details
        productInfo.productName = rootCard.title || "";
        productInfo.rootCardId = rootCard.sales_order_id || productInfo.rootCardId;
        productInfo.projectId = rootCard.project_id || productInfo.projectId;
        productInfo.rootCardId = rootCard.id;
        productInfo.description = rootCard.notes || "";
        
        // Try to get more details from product_details if available
        let details = null;
        if (rootCard.product_details) {
          try {
            details = typeof rootCard.product_details === 'string' 
              ? JSON.parse(rootCard.product_details) 
              : rootCard.product_details;
          } catch (e) {
            console.error("Error parsing product details:", e);
          }
        }

        if (details) {
          productInfo.productName = details.itemName || productInfo.productName;
          productInfo.itemCode = details.itemCode || productInfo.itemCode;
          productInfo.uom = details.unit || productInfo.uom;
          productInfo.quantity = details.quantity || productInfo.quantity;
          productInfo.description = details.specification || productInfo.description;
          productInfo.itemGroup = details.category || productInfo.itemGroup;
        } else if (rootCard.sales_order_items && Array.isArray(rootCard.sales_order_items) && rootCard.sales_order_items.length > 0) {
          // Fallback to the first item in root card items
          const firstItem = rootCard.sales_order_items[0];
          productInfo.productName = firstItem.description || firstItem.itemName || productInfo.productName;
          productInfo.itemCode = firstItem.itemCode || productInfo.itemCode;
          productInfo.uom = firstItem.uom || firstItem.unit || productInfo.uom;
          productInfo.quantity = firstItem.quantity || productInfo.quantity;
        } else if (rootCard.product_name) {
          // Fallback to the formatted product_name from backend
          productInfo.productName = rootCard.product_name;
        }

        let materialsList = [];
        let operationsList = [];
        let combinedStages = [];

        // 1. Get stages from Root Card manufacturing_stages (if already defined)
        if (rootCard.stages && Array.isArray(rootCard.stages)) {
          combinedStages = [...rootCard.stages];
        }

        // 2. Fetch Production Plan from Root Card (selected during project creation)
        if (productInfo.rootCardId) {
          try {
            const planResponse = await axios.get(`/root-cards/steps/${productInfo.rootCardId}/production-plan`);
            if (planResponse.data?.success && planResponse.data?.data) {
              const planData = planResponse.data.data;
              const phases = planData.selectedPhases || planData.phaseDetails || planData.phases || {};
              
              // Convert object-based phases to array if necessary
              const planStages = Array.isArray(phases) 
                ? phases.map(p => ({
                    stage_name: p.phase || p.stageName || p.name || p.stage_name,
                    stage_type: p.type || p.stage_type || 'in-house',
                    assigned_worker: p.assignee || p.assigned_worker || ""
                  }))
                : Object.entries(phases).map(([key, phase]) => ({
                    stage_name: phase.phase || phase.stageName || phase.name || key,
                    stage_type: phase.type || phase.stage_type || 'in-house',
                    assigned_worker: phase.assignee || phase.assigned_worker || ""
                  }));

              // Merge with root card stages, avoiding duplicates by stage_name
              planStages.forEach(ps => {
                if (!combinedStages.some(cs => cs.stage_name === ps.stage_name)) {
                  combinedStages.push(ps);
                }
              });
            }
          } catch (planErr) {
            console.error("Error fetching project production plan:", planErr);
          }
        }

        setRootCardStages(combinedStages);

        // Map operations from combined stages
        operationsList = combinedStages.map(stage => ({
          id: Date.now() + Math.random(),
          operationName: stage.stage_name || "",
          workstation: stage.assigned_worker || "",
          cycleTime: 0,
          setupTime: 0,
          hourlyRate: 0,
          cost: 0,
          type: stage.stage_type === 'outsource' ? 'outsource' : 'in-house',
          targetWarehouse: ""
        }));

        // Fetch Material Requirements for the root card
        if (productInfo.rootCardId) {
          try {
            const reqResponse = await axios.get(`/root-cards/requirements/${productInfo.rootCardId}`);
            if (reqResponse.data && reqResponse.data.success && reqResponse.data.data) {
              const requirements = reqResponse.data.data.materials || [];
              setRequirementMaterials(requirements);
              materialsList = requirements.map(req => ({
                id: Date.now() + Math.random(),
                itemName: req.itemName || req.name || "",
                quantity: parseFloat(req.requiredQuantity || req.quantity || 1),
                uom: req.uom || req.unit || "Kg",
                itemGroup: req.category || "",
                rate: parseFloat(req.unitCost || req.rate || 0),
                warehouse: req.warehouse || "",
                operation: ""
              }));
            }
          } catch (reqErr) {
            console.error("Error fetching material requirements:", reqErr);
          }
        }

        setBomData(prev => ({
          ...prev,
          productInfo,
          materials: materialsList,
          operations: operationsList
        }));
      }
    } catch (error) {
      console.error("Error fetching root card details:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch root card details'
      });
    }
  };

  const handleProductSelect = (value, type) => {
    const selectedMaterial = allAvailableMaterials.find(m => 
      type === 'name' ? m.itemName === value : m.itemCode === value
    );

    if (selectedMaterial) {
      setBomData(prev => ({
        ...prev,
        productInfo: {
          ...prev.productInfo,
          productName: selectedMaterial.itemName,
          itemCode: selectedMaterial.itemCode,
          itemGroup: selectedMaterial.category || prev.productInfo.itemGroup,
          uom: selectedMaterial.unit || prev.productInfo.uom,
          description: selectedMaterial.specification || prev.productInfo.description
        }
      }));
    } else {
      setBomData(prev => ({
        ...prev,
        productInfo: {
          ...prev.productInfo,
          [type === 'name' ? 'productName' : 'itemCode']: value
        }
      }));
    }
  };

  const handleComponentSelect = (id, value) => {
    const selectedMaterial = allAvailableMaterials.find(m => m.itemCode === value);
    if (selectedMaterial) {
      setBomData(prev => ({
        ...prev,
        components: prev.components.map(c => 
          c.id === id ? {
            ...c,
            componentCode: selectedMaterial.itemCode,
            uom: selectedMaterial.unit || c.uom,
            rate: selectedMaterial.unit_cost || c.rate,
            notes: (selectedMaterial.specification || selectedMaterial.description) || c.notes
          } : c
        )
      }));
    } else {
      updateTableRow("components", id, "componentCode", value);
    }
  };

  const handleMaterialSelect = (id, value) => {
    const selectedMaterial = allAvailableMaterials.find(m => m.itemName === value);
    if (selectedMaterial) {
      setBomData(prev => ({
        ...prev,
        materials: prev.materials.map(m => 
          m.id === id ? {
            ...m,
            itemName: selectedMaterial.itemName,
            itemGroup: selectedMaterial.category || m.itemGroup,
            uom: selectedMaterial.unit || m.uom,
            rate: selectedMaterial.unit_cost || m.rate,
            warehouse: selectedMaterial.location || m.warehouse
          } : m
        )
      }));
    } else {
      updateTableRow("materials", id, "itemName", value);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addTableRow = (section) => {
    const newRow =
      section === "components"
        ? { id: Date.now(), componentCode: "", quantity: 1, uom: "Kg", rate: 0, lossPercent: 0, notes: "" }
        : section === "materials"
        ? { id: Date.now(), itemName: "", quantity: 1, uom: "Kg", itemGroup: "", rate: 0, warehouse: "", operation: "" }
        : section === "operations"
        ? { id: Date.now(), operationName: "", workstation: "", cycleTime: 0, setupTime: 0, hourlyRate: 0, cost: 0, type: "in-house", targetWarehouse: "" }
        : { id: Date.now(), itemCode: "", name: "", inputQty: 0, lossPercent: 0, rate: 0 };

    setBomData({
      ...bomData,
      [section]: [...bomData[section], newRow],
    });
  };

  const removeTableRow = (section, id) => {
    setBomData({
      ...bomData,
      [section]: bomData[section].filter((row) => row.id !== id),
    });
  };

  const updateTableRow = (section, id, field, value) => {
    setBomData({
      ...bomData,
      [section]: bomData[section].map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    });
  };

  const calculateCosts = () => {
    let materialCost = 0;
    let componentCost = 0;
    let operationCost = 0;
    let scrapLossCost = 0;

    bomData.materials.forEach((m) => {
      materialCost += (m.quantity || 0) * (m.rate || 0);
    });

    bomData.components.forEach((c) => {
      componentCost += (c.quantity || 0) * (c.rate || 0);
    });

    bomData.operations.forEach((o) => {
      operationCost += o.cost || 0;
    });

    bomData.scrapLoss.forEach((s) => {
      scrapLossCost += ((s.inputQty || 0) * (s.rate || 0) * (s.lossPercent || 0)) / 100;
    });

    const materialCostAfterScrap = (materialCost + componentCost) - scrapLossCost;
    const totalBOMCost = materialCostAfterScrap + operationCost;

    setCosts({
      materialCost,
      componentCost,
      operationCost,
      scrapLossCost,
      materialCostAfterScrap,
      totalBOMCost,
    });
  };

  const handleSave = async () => {
    if (!bomData.productInfo.productName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Required Field",
        text: "Product name is required",
      });
      return;
    }

    try {
      setSaving(true);
      calculateCosts();

      const payload = {
        productInfo: bomData.productInfo,
        components: bomData.components.filter((c) => c.componentCode),
        materials: bomData.materials.filter((m) => m.itemName),
        operations: bomData.operations.filter((o) => o.operationName),
        scrapLoss: bomData.scrapLoss.filter((s) => s.itemCode),
      };

      if (editMode && bomId) {
        await axios.put(`/engineering/bom/comprehensive/${bomId}`, payload);
      } else {
        await axios.post("/engineering/bom/comprehensive", payload);
      }

      Swal.fire({
        icon: "success",
        title: `BOM ${editMode ? "Updated" : "Created"} Successfully`,
        text: `Your BOM has been ${editMode ? "updated" : "saved"}!`,
        timer: 2000,
      });

      setTimeout(() => {
        navigate("/design-engineer/bom/view");
      }, 2000);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.message || "Failed to save BOM",
      });
    } finally {
      setSaving(false);
    }
  };

  const AccordionSection = ({ title, section, children, itemCount = 0, addButton = null }) => (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg mb-2">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-700/50">
        <button
          onClick={() => toggleSection(section)}
          className="flex-1 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition py-2"
        >
          <ChevronDown
            size={16}
            className={`transition-transform ${expandedSections[section] ? "" : "-rotate-90"}`}
          />
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          {itemCount > 0 && (
            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
              {itemCount}
            </span>
          )}
        </button>
        {addButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              addButton.onClick();
            }}
            className={`flex items-center gap-1 px-2 py-1 ${addButton.className} text-white rounded text-xs hover:opacity-90 transition`}
          >
            <Plus size={14} /> {addButton.label}
          </button>
        )}
      </div>
      {expandedSections[section] && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-3">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/design-engineer/dashboard")}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {editMode ? "Edit BOM" : "Create BOM"}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">Bill of Materials</p>
          </div>
        </div>

        {/* Accordions Container */}
        <div className=" p-3">
          {/* Product Information Section */}
          <AccordionSection title="Product Information" section="product">
            <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="max-w-md">
                <SearchableSelect
                  label="Fetch from Root Card"
                  options={rootCardOptions}
                  onChange={handleRootCardSelect}
                  placeholder="Select a root card to auto-fill details"
                  disabled={loadingMaterials}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Selecting a root card will automatically populate product information and link this BOM to its project.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <div>
                <SearchableSelect
                  label="Product Name *"
                  options={productNameOptions}
                  value={bomData.productInfo.productName}
                  onChange={(value) => handleProductSelect(value, 'name')}
                  placeholder="Select or type product name"
                  disabled={loadingMaterials}
                  allowCustom={true}
                />
              </div>
              <div>
                <SearchableSelect
                  label="Item Code"
                  options={itemCodeOptions}
                  value={bomData.productInfo.itemCode}
                  onChange={(value) => handleProductSelect(value, 'code')}
                  placeholder="Select or type item code"
                  disabled={loadingMaterials}
                  allowCustom={true}
                />
              </div>
              <div>
                <SearchableSelect
                  label="Item Group"
                  options={itemGroupSelectOptions}
                  value={bomData.productInfo.itemGroup}
                  onChange={(value) =>
                    setBomData({
                      ...bomData,
                      productInfo: { ...bomData.productInfo, itemGroup: value },
                    })
                  }
                  placeholder="Select or type item group"
                  allowCustom={true}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Qty / UOM
                </label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    value={bomData.productInfo.quantity}
                    onChange={(e) =>
                      setBomData({
                        ...bomData,
                        productInfo: { ...bomData.productInfo, quantity: parseFloat(e.target.value) },
                      })
                    }
                    className="w-1/2 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                  <div className="w-1/2">
                    <SearchableSelect
                      options={UOMSelectOptions}
                      value={bomData.productInfo.uom}
                      onChange={(value) =>
                        setBomData({
                          ...bomData,
                          productInfo: { ...bomData.productInfo, uom: value },
                        })
                      }
                      placeholder="Select UOM"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Revision
                </label>
                <input
                  type="number"
                  value={bomData.productInfo.revision}
                  onChange={(e) =>
                    setBomData({
                      ...bomData,
                      productInfo: { ...bomData.productInfo, revision: parseInt(e.target.value) },
                    })
                  }
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={bomData.productInfo.description}
                  onChange={(e) =>
                    setBomData({
                      ...bomData,
                      productInfo: { ...bomData.productInfo, description: e.target.value },
                    })
                  }
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  rows="2"
                />
              </div>
            </div>
            <div className="mt-2 flex gap-6 items-end">
              <div className="w-40">
                <SearchableSelect
                  label="Status"
                  options={StatusOptions}
                  value={bomData.productInfo.status}
                  onChange={(value) =>
                    setBomData({
                      ...bomData,
                      productInfo: { ...bomData.productInfo, status: value },
                    })
                  }
                />
              </div>
              <div className="flex gap-3 mb-2">
                <label className="flex items-center gap-1 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={bomData.productInfo.isDefault}
                    onChange={(e) =>
                      setBomData({
                        ...bomData,
                        productInfo: { ...bomData.productInfo, isDefault: e.target.checked },
                      })
                    }
                  />
                  <span className="text-slate-700 dark:text-slate-300">Set as Default</span>
                </label>
              </div>
            </div>
          </AccordionSection>

          {/* Components Section */}
          <AccordionSection 
            title="Components" 
            section="components" 
            itemCount={bomData.components.length}
            addButton={{ label: "Add", onClick: () => addTableRow("components"), className: "bg-blue-600 hover:bg-blue-700" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700">
                    <th className="px-2 py-1 text-left font-semibold">Code</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Qty</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">UOM</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Rate</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Loss%</th>
                    <th className="px-2 py-1 text-left font-semibold">Notes</th>
                    <th className="px-2 py-1 text-center font-semibold w-auto"></th>
                  </tr>
                </thead>
                <tbody>
                  {bomData.components.map((row) => (
                    <tr key={row.id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-2 py-1">
                        <SearchableSelect
                          options={itemCodeOptions}
                          value={row.componentCode}
                          onChange={(value) => handleComponentSelect(row.id, value)}
                          placeholder="Select code"
                          allowCustom={true}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={row.quantity}
                          onChange={(e) => updateTableRow("components", row.id, "quantity", parseFloat(e.target.value))}
                          className="w-auto p-2  border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-left"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <SearchableSelect
                          options={UOMSelectOptions}
                          value={row.uom}
                          onChange={(value) => updateTableRow("components", row.id, "uom", value)}
                          placeholder="Select UOM"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={row.rate}
                          onChange={(e) => updateTableRow("components", row.id, "rate", parseFloat(e.target.value))}
                          className="w-fit p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-right"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={row.lossPercent}
                          onChange={(e) => updateTableRow("components", row.id, "lossPercent", parseFloat(e.target.value))}
                          className="w-fit p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-right"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="text"
                          value={row.notes}
                          onChange={(e) => updateTableRow("components", row.id, "notes", e.target.value)}
                          className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <button
                          onClick={() => removeTableRow("components", row.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {bomData.components.length === 0 && (
              <p className="text-center text-slate-500 text-xs py-2">No components added</p>
            )}
          </AccordionSection>

          {/* Materials Section */}
          <AccordionSection 
            title="Materials" 
            section="materials" 
            itemCount={bomData.materials.length}
            addButton={{ label: "Add", onClick: () => addTableRow("materials"), className: "bg-green-600 hover:bg-green-700" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700">
                    <th className="px-2 py-1 text-left font-semibold">Item Name</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Qty</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">UOM</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Group</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Rate</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Warehouse</th>
                    <th className="px-2 py-1 text-center font-semibold w-auto"></th>
                  </tr>
                </thead>
                <tbody>
                  {bomData.materials.map((row) => (
                    <tr key={row.id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-2 py-1">
                        <SearchableSelect
                          options={productNameOptions}
                          value={row.itemName}
                          onChange={(value) => handleMaterialSelect(row.id, value)}
                          placeholder="Select item"
                          allowCustom={true}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={row.quantity}
                          onChange={(e) => updateTableRow("materials", row.id, "quantity", parseFloat(e.target.value))}
                          className="w-auto p-2  border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-left"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <SearchableSelect
                          options={UOMSelectOptions}
                          value={row.uom}
                          onChange={(value) => updateTableRow("materials", row.id, "uom", value)}
                          placeholder="Select UOM"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <SearchableSelect
                          options={itemGroupSelectOptions}
                          value={row.itemGroup}
                          onChange={(value) => updateTableRow("materials", row.id, "itemGroup", value)}
                          placeholder="Select group"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={row.rate}
                          onChange={(e) => updateTableRow("materials", row.id, "rate", parseFloat(e.target.value))}
                          className="w-fit p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-right"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <SearchableSelect
                          options={warehouseOptions}
                          value={row.warehouse}
                          onChange={(value) => updateTableRow("materials", row.id, "warehouse", value)}
                          placeholder="Select warehouse"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <button
                          onClick={() => removeTableRow("materials", row.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {bomData.materials.length === 0 && (
              <p className="text-center text-slate-500 text-xs py-2">No materials added</p>
            )}
          </AccordionSection>

          {/* Operations Section */}
          <AccordionSection 
            title="Operations" 
            section="operations" 
            itemCount={bomData.operations.length}
            addButton={{ label: "Add", onClick: () => addTableRow("operations"), className: "bg-purple-600 hover:bg-purple-700" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700">
                    <th className="px-2 py-1 text-left font-semibold">Operation</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Workstation</th>
                    <th className="px-2 py-1 text-center font-semibold w-auto">Cycle Time</th>
                    <th className="px-2 py-1 text-center font-semibold w-auto">Setup Time</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Rate</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Cost</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Type</th>
                    <th className="px-2 py-1 text-center font-semibold w-auto"></th>
                  </tr>
                </thead>
                <tbody>
                  {bomData.operations.map((row) => (
                    <tr key={row.id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-2 py-1">
                        <SearchableSelect
                          options={operationSelectOptions}
                          value={row.operationName}
                          onChange={(value) => updateTableRow("operations", row.id, "operationName", value)}
                          placeholder="Select operation"
                          allowCustom={true}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <SearchableSelect
                          options={workstationOptions}
                          value={row.workstation}
                          onChange={(value) => updateTableRow("operations", row.id, "workstation", value)}
                          placeholder="Select workstation"
                          allowCustom={true}
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={row.cycleTime}
                          onChange={(e) => updateTableRow("operations", row.id, "cycleTime", parseFloat(e.target.value))}
                          className="w-auto p-2  border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-left"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={row.setupTime}
                          onChange={(e) => updateTableRow("operations", row.id, "setupTime", parseFloat(e.target.value))}
                          className="w-auto p-2  border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-left"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={row.hourlyRate}
                          onChange={(e) => updateTableRow("operations", row.id, "hourlyRate", parseFloat(e.target.value))}
                          className="w-fit p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-right"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={row.cost}
                          onChange={(e) => updateTableRow("operations", row.id, "cost", parseFloat(e.target.value))}
                          className="w-fit p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-right"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <SearchableSelect
                          options={operationTypeOptions}
                          value={row.type}
                          onChange={(value) => updateTableRow("operations", row.id, "type", value)}
                          placeholder="Select type"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <button
                          onClick={() => removeTableRow("operations", row.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {bomData.operations.length === 0 && (
              <p className="text-center text-slate-500 text-xs py-2">No operations added</p>
            )}
          </AccordionSection>

          {/* Scrap & Loss Section */}
          <AccordionSection 
            title="Scrap & Loss" 
            section="scrap" 
            itemCount={bomData.scrapLoss.length}
            addButton={{ label: "Add", onClick: () => addTableRow("scrapLoss"), className: "bg-orange-600 hover:bg-orange-700" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700">
                    <th className="px-2 py-1 text-left font-semibold">Code</th>
                    <th className="px-2 py-1 text-left font-semibold">Name</th>
                    <th className="px-2 py-1 text-center font-semibold w-auto">Input Qty</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Loss %</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Rate</th>
                    <th className="px-2 py-1 text-center font-semibold w-auto"></th>
                  </tr>
                </thead>
                <tbody>
                  {bomData.scrapLoss.map((row) => (
                    <tr key={row.id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="px-2 py-1">
                        <SearchableSelect
                          options={itemCodeOptions}
                          value={row.itemCode}
                          onChange={(value) => updateTableRow("scrapLoss", row.id, "itemCode", value)}
                          placeholder="Select code"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <SearchableSelect
                          options={productNameOptions}
                          value={row.name}
                          onChange={(value) => updateTableRow("scrapLoss", row.id, "name", value)}
                          placeholder="Select name"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={row.inputQty}
                          onChange={(e) => updateTableRow("scrapLoss", row.id, "inputQty", parseFloat(e.target.value))}
                          className="w-auto p-2  border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-left"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={row.lossPercent}
                          onChange={(e) => updateTableRow("scrapLoss", row.id, "lossPercent", parseFloat(e.target.value))}
                          className="w-fit p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-right"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={row.rate}
                          onChange={(e) => updateTableRow("scrapLoss", row.id, "rate", parseFloat(e.target.value))}
                          className="w-fit p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-right"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <button
                          onClick={() => removeTableRow("scrapLoss", row.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {bomData.scrapLoss.length === 0 && (
              <p className="text-center text-slate-500 text-xs py-2">No scrap items added</p>
            )}
          </AccordionSection>

          {/* Costs Section */}
          <AccordionSection title="Cost Summary" section="costs">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded border border-blue-200 dark:border-blue-700">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Material</p>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">₹{costs.materialCost.toFixed(2)}</p>
              </div>
              <div className="bg-cyan-50 dark:bg-cyan-900/30 p-2 rounded border border-cyan-200 dark:border-cyan-700">
                <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Component</p>
                <p className="text-sm font-bold text-cyan-900 dark:text-cyan-100">₹{costs.componentCost.toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded border border-purple-200 dark:border-purple-700">
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Labour</p>
                <p className="text-sm font-bold text-purple-900 dark:text-purple-100">₹{costs.operationCost.toFixed(2)}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/30 p-2 rounded border border-red-200 dark:border-red-700">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Scrap Loss</p>
                <p className="text-sm font-bold text-red-900 dark:text-red-100">-₹{costs.scrapLossCost.toFixed(2)}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded border border-green-200 dark:border-green-700">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Total</p>
                <p className="text-sm font-bold text-green-900 dark:text-green-100">₹{costs.totalBOMCost.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-xs space-y-1 bg-slate-50 dark:bg-slate-700/30 p-2 rounded">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Material Cost After Scrap:</span>
                <span className="font-medium">₹{costs.materialCostAfterScrap.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-1 font-semibold">
                <span>Cost Per Unit:</span>
                <span className="text-green-600 dark:text-green-400">₹{(costs.totalBOMCost / (bomData.productInfo.quantity || 1)).toFixed(2)}</span>
              </div>
            </div>
          </AccordionSection>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end mt-4">
          <button
            onClick={() => navigate("/design-engineer/bom/view")}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold disabled:opacity-50 text-sm"
          >
            <Save size={16} />
            {saving ? "Saving..." : editMode ? "Update BOM" : "Create BOM"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBOMPage;
