import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Save,
  ChevronLeft,
  ChevronDown,
  Edit2,
  Check,
  X,
  Copy,
} from "lucide-react";
import axios from "../../../utils/api";
import Swal from "sweetalert2";
import SearchableSelect from "../../../components/ui/SearchableSelect";

const initialBOMState = {
  productInfo: {
    productName: "",
    itemCode: "",
    customer: "",
    bomNumber: "",
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
    lossPercent: 0,
  },
  components: [],
  materials: [],
  operations: [],
  scrapLoss: [],
};

const UOMOptions = ["Kg", "pcs", "m", "l", "set", "Box"];
const ItemGroupOptions = ["Raw Material", "Bought-Out", "Sub Assemblies", "Finished Goods", "Consumable"];
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

const AccordionSection = memo(({ title, section, children, itemCount = 0, expandedSections, toggleSection }) => (
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
    </div>
    {expandedSections[section] && (
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        {children}
      </div>
    )}
  </div>
));

const CreateBOMPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const taskId = searchParams.get("taskId");
  const [saving, setSaving] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [requirementMaterials, setRequirementMaterials] = useState([]);
  const [rootCards, setRootCards] = useState([]);
  const [existingBoms, setExistingBoms] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [editMode] = useState(!!searchParams.get("bomId"));
  const [bomId] = useState(searchParams.get("bomId"));
  const [workstations, setWorkstations] = useState([]);
  const [rootCardStages, setRootCardStages] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    product: true,
    components: true,
    materials: true,
    operations: true,
    scrap: true,
    costs: true,
  });
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [editingComponentId, setEditingComponentId] = useState(null);
  const [editingOperationId, setEditingOperationId] = useState(null);
  const [editingScrapId, setEditingScrapId] = useState(null);

  // Entry form states for "Quick Add"
  const [newComponent, setNewComponent] = useState({ componentCode: "", quantity: 1, uom: "Kg", rate: 0, lossPercent: 0, notes: "" });
  const [newMaterial, setNewMaterial] = useState({ itemCode: "", itemName: "", quantity: 1, uom: "Kg", itemGroup: "", rate: 0, warehouse: "", operation: "" });
  const [newOperation, setNewOperation] = useState({ operationName: "", workstation: "", cycleTime: 0, setupTime: 0, hourlyRate: 0, cost: 0, type: "in-house", targetWarehouse: "" });
  const [newScrap, setNewScrap] = useState({ itemCode: "", name: "", inputQty: 0, lossPercent: 0, rate: 0 });

  const [bomData, setBomData] = useState({
    ...initialBOMState,
    productInfo: {
      ...initialBOMState.productInfo,
      rootCardId: searchParams.get("rootCardId") || null,
      projectId: searchParams.get("projectId") || null,
    }
  });

  useEffect(() => {
    if (!editMode && existingBoms.length >= 0 && !bomData.productInfo.bomNumber) {
      const year = new Date().getFullYear();
      const nextNumber = (existingBoms.length + 1).toString().padStart(3, '0');
      const generatedNumber = `BOM-${year}-${nextNumber}`;
      
      setBomData(prev => ({
        ...prev,
        productInfo: {
          ...prev.productInfo,
          bomNumber: generatedNumber
        }
      }));
    }
  }, [existingBoms, editMode, bomData.productInfo.bomNumber]);

  const updateTableRow = useCallback((section, id, field, value) => {
    setBomData(prev => ({
      ...prev,
      [section]: prev[section].map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    }));
  }, []);

  const updateOperationCost = (row) => {
    const cycleTime = parseFloat(row.cycleTime) || 0;
    const setupTime = parseFloat(row.setupTime) || 0;
    const hourlyRate = parseFloat(row.hourlyRate) || 0;
    const totalTimeMin = cycleTime + setupTime;
    return parseFloat(((totalTimeMin / 60) * hourlyRate).toFixed(4));
  };

  const updateOperationRow = useCallback((id, field, value) => {
    setBomData(prev => ({
      ...prev,
      operations: prev.operations.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };
          if (["cycleTime", "setupTime", "hourlyRate"].includes(field)) {
            updatedRow.cost = updateOperationCost(updatedRow);
          }
          return updatedRow;
        }
        return row;
      }),
    }));
  }, []);

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const removeTableRow = useCallback((section, id) => {
    setBomData(prev => ({
      ...prev,
      [section]: prev[section].filter((row) => row.id !== id),
    }));
  }, []);

  const handleAddItem = useCallback((section) => {
    let newItem = null;
    let resetState = null;

    if (section === "components") {
      if (!newComponent.componentCode) return;
      newItem = { ...newComponent, id: Date.now() };
      resetState = () => setNewComponent({ componentCode: "", quantity: 1, uom: "Kg", rate: 0, lossPercent: 0, notes: "" });
    } else if (section === "materials") {
      if (!newMaterial.itemName) return;
      newItem = { ...newMaterial, id: Date.now() };
      resetState = () => setNewMaterial({ itemCode: "", itemName: "", quantity: 1, uom: "Kg", itemGroup: "", rate: 0, warehouse: "", operation: "" });
    } else if (section === "operations") {
      if (!newOperation.operationName) return;
      newItem = { ...newOperation, id: Date.now() };
      resetState = () => setNewOperation({ operationName: "", workstation: "", cycleTime: 0, setupTime: 0, hourlyRate: 0, cost: 0, type: "in-house", targetWarehouse: "" });
    } else if (section === "scrapLoss") {
      if (!newScrap.itemCode) return;
      newItem = { ...newScrap, id: Date.now() };
      resetState = () => setNewScrap({ itemCode: "", name: "", inputQty: 0, lossPercent: 0, rate: 0 });
    }

    if (newItem) {
      setBomData(prev => ({
        ...prev,
        [section]: [...prev[section], newItem],
      }));
      resetState();
    }
  }, [newComponent, newMaterial, newOperation, newScrap]);

  const loadRootCardContext = useCallback(async (rootCardId) => {
    try {
      const [rcRes, planRes, reqRes, facilitiesRes, materialsRes] = await Promise.all([
        axios.get(`/root-cards/${rootCardId}`),
        axios.get(`/root-cards/steps/${rootCardId}/production-plan`).catch(() => ({ data: { success: false } })),
        axios.get(`/root-cards/requirements/${rootCardId}`).catch(() => ({ data: { success: false } })),
        axios.get("/inventory/facilities").catch(() => ({ data: { facilities: [] } })),
        axios.get("/inventory/materials").catch(() => ({ data: { materials: [] } }))
      ]);

      const rootCard = rcRes.data.rootCard || rcRes.data;
      if (!rootCard) throw new Error("Root card not found");

      // Set global materials and workstations
      setMaterials(materialsRes.data.materials || []);
      setWorkstations(facilitiesRes.data.facilities || []);

      // Warehouses
      const fetchedMaterials = materialsRes.data.materials || [];
      const uniqueWarehouses = [...new Set(fetchedMaterials.map(m => m.location).filter(loc => loc && loc.trim() !== ""))];
      setWarehouses(uniqueWarehouses.length > 0 ? uniqueWarehouses : ["Main Warehouse", "Secondary Warehouse"]);

      // Stages
      let combinedStages = [];
      if (rootCard.stages && Array.isArray(rootCard.stages)) combinedStages = [...rootCard.stages];
      
      if (planRes.data?.success && planRes.data?.data) {
        const phases = planRes.data.data.selectedPhases || planRes.data.data.phaseDetails || planRes.data.data.phases || {};
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

        planStages.forEach(ps => {
          if (!combinedStages.some(cs => cs.stage_name === ps.stage_name)) combinedStages.push(ps);
        });
      }
      setRootCardStages(combinedStages);

      // Requirements
      let potentialMaterials = [];
      if (reqRes.data?.success && reqRes.data?.data) {
        potentialMaterials = (reqRes.data.data.materials || []).map(req => ({ ...req, id: req.id || `req-${Date.now()}-${Math.random()}` }));
      }

      // Design Engineering Specs
      const designEngineering = rootCard.steps?.step2_design || rootCard.designEngineering;
      if (designEngineering) {
        const specs = designEngineering.specifications || {};
        const categoriesMap = { steelSections: 'Steel Section', fasteners: 'Fastener', components: 'Component', electrical: 'Electrical', consumables: 'Consumable' };

        Object.entries(categoriesMap).forEach(([field, category]) => {
          const items = specs[field];
          if (Array.isArray(items)) {
            items.forEach(itemName => {
              if (itemName && typeof itemName === 'string' && itemName.trim()) {
                const trimmedName = itemName.trim();
                if (!potentialMaterials.some(m => (m.itemName || m.name) === trimmedName)) {
                  // Try to find if this item exists in global materials to get its real code
                  const existingMaterial = (materialsRes.data.materials || []).find(m => m.itemName === trimmedName);
                  
                  potentialMaterials.push({ 
                    id: `des-spec-${Date.now()}-${Math.random()}`, 
                    itemName: trimmedName, 
                    itemCode: existingMaterial?.itemCode || `DES-${trimmedName.substring(0, 3).toUpperCase()}`, 
                    category: category, 
                    uom: category === 'Fastener' || category === 'Component' ? 'pcs' : 'Kg', 
                    rate: existingMaterial?.sellingRate || existingMaterial?.unit_cost || 0 
                  });
                }
              }
            });
          }
        });

        if (designEngineering.bomData && Array.isArray(designEngineering.bomData)) {
          designEngineering.bomData.forEach(item => {
            const name = item.itemName || item.name;
            if (name && !potentialMaterials.some(m => (m.itemName || m.name) === name)) {
              potentialMaterials.push({ 
                ...item, 
                itemName: name,
                itemCode: item.itemCode || item.item_code || `DE-${name.substring(0, 3).toUpperCase()}`,
                id: item.id || `des-bom-${Date.now()}-${Math.random()}` 
              });
            }
          });
        }
      }
      setRequirementMaterials(potentialMaterials);
      
      return { rootCard, designEngineering, potentialMaterials, combinedStages };
    } catch (error) {
      console.error("Error loading root card context:", error);
      throw error;
    }
  }, []);

  const fetchBOMData = useCallback(async (id) => {
    try {
      setLoadingMaterials(true);
      const response = await axios.get(`/engineering/bom/comprehensive/${id}`);
      const bom = response.data;
      
      if (bom.rootCardId) {
        await loadRootCardContext(bom.rootCardId);
      }

      setBomData({
        productInfo: {
          productName: bom.productName,
          itemCode: bom.itemCode,
          customer: bom.customer || "",
          bomNumber: bom.bomNumber,
          itemGroup: bom.itemGroup,
          quantity: bom.quantity,
          uom: bom.uom,
          revision: bom.revision,
          description: bom.description,
          isActive: bom.isActive,
          isDefault: bom.isDefault,
          status: bom.status,
          rootCardId: bom.rootCardId,
          projectId: bom.projectId,
          lossPercent: bom.lossPercent || 0,
        },
        components: (bom.components || []).map(c => ({ ...c, id: c.id || Date.now() + Math.random() })),
        materials: (bom.materials || []).map(m => ({ ...m, id: m.id || Date.now() + Math.random() })),
        operations: (bom.operations || []).map(o => ({ ...o, id: o.id || Date.now() + Math.random() })),
        scrapLoss: (bom.scrapLoss || []).map(s => ({ ...s, id: s.id || Date.now() + Math.random() })),
      });
    } catch (error) {
      console.error("Error fetching BOM details:", error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch BOM details' });
    } finally {
      setLoadingMaterials(false);
    }
  }, [loadRootCardContext]);

  const handleRootCardSelect = useCallback(async (rootCardId) => {
    if (!rootCardId) return;

    try {
      setLoadingMaterials(true);
      
      setRequirementMaterials([]);
      setRootCardStages([]);
      
      const { rootCard, designEngineering } = await loadRootCardContext(rootCardId);

      if (!designEngineering) {
        Swal.fire({
          icon: 'warning',
          title: 'Design Missing',
          text: 'BOM cannot be created because Design Engineering details are missing for this root card.'
        });
        setLoadingMaterials(false);
        return;
      }

      // Auto-fill product info
      let details = null;
      if (rootCard.steps?.step1_clientPO?.productDetails) {
        details = rootCard.steps.step1_clientPO.productDetails;
      } else if (rootCard.product_details) {
        try {
          details = typeof rootCard.product_details === 'string' ? JSON.parse(rootCard.product_details) : rootCard.product_details;
        } catch (error) {
          console.error("Error parsing product_details:", error);
        }
      }

      let newProductInfo = { 
        ...initialBOMState.productInfo,
        productName: "",
        customer: rootCard.steps?.step1_clientPO?.clientName || rootCard.customer || "",
        rootCardId: rootCard.id,
        projectId: rootCard.project_id || null,
        description: rootCard.notes || ""
      };

      if (details) {
        newProductInfo.itemCode = details.itemCode || newProductInfo.itemCode;
        newProductInfo.uom = details.unit || newProductInfo.uom;
        newProductInfo.quantity = details.quantity || newProductInfo.quantity;
        newProductInfo.description = details.specification || newProductInfo.description;
      } else if (rootCard.items?.[0]) {
        const firstItem = rootCard.items[0];
        newProductInfo.itemCode = firstItem.itemCode || newProductInfo.itemCode;
        newProductInfo.uom = firstItem.uom || firstItem.unit || newProductInfo.uom;
        newProductInfo.quantity = firstItem.quantity || newProductInfo.quantity;
      }

      // Map materials and operations from design engineering
      const materials = (designEngineering.bomData || []).map(item => ({
        id: item.id || `rc-mat-${Date.now()}-${Math.random()}`,
        itemCode: item.itemCode || item.item_code || `RC-${(item.itemName || item.name || "").substring(0, 3).toUpperCase()}`,
        itemName: item.itemName || item.name || "",
        quantity: parseFloat(item.quantity) || 1,
        uom: item.uom || item.unit || "Kg",
        itemGroup: item.category || item.item_group || "Raw Material",
        rate: parseFloat(item.sellingRate || item.selling_rate || item.rate || item.unitCost || item.unit_cost || 0),
        warehouse: item.location || item.warehouse || "",
        operation: ""
      }));

      const operations = (designEngineering.operations || []).map(op => ({
        id: op.id || `rc-op-${Date.now()}-${Math.random()}`,
        operationName: op.operationName || op.name || "",
        workstation: op.workstation || "",
        cycleTime: parseFloat(op.cycleTime || op.cycle_time || 0),
        setupTime: parseFloat(op.setupTime || op.setup_time || 0),
        hourlyRate: parseFloat(op.hourlyRate || op.hourly_rate || op.rate || 0),
        cost: parseFloat(op.cost || 0),
        type: op.type || "in-house",
        targetWarehouse: op.targetWarehouse || op.target_warehouse || ""
      }));

      setBomData({
        ...initialBOMState,
        productInfo: newProductInfo,
        materials: materials,
        components: [],
        operations: operations,
        scrapLoss: []
      });
    } catch (error) {
      console.error("Error fetching root card details:", error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch root card details' });
    } finally {
      setLoadingMaterials(false);
    }
  }, [loadRootCardContext]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingMaterials(true);
        const [rootCardsRes, bomsRes] = await Promise.all([
          axios.get("/root-cards"),
          axios.get("/engineering/bom/comprehensive")
        ]);
        
        setRootCards(rootCardsRes.data.rootCards || []);
        setExistingBoms(bomsRes.data.boms || []);

        const urlBomId = searchParams.get("bomId");
        if (urlBomId) {
          await fetchBOMData(urlBomId);
        } else {
          // Handle initial rootCardId from URL
          const urlRootCardId = searchParams.get("rootCardId");
          if (urlRootCardId) {
            handleRootCardSelect(urlRootCardId);
          } else {
            setLoadingMaterials(false);
          }
        }
      } catch (error) {
        console.error("Error fetching root cards:", error);
        setRootCards([]);
        setLoadingMaterials(false);
      }
    };

    fetchData();
  }, [searchParams, handleRootCardSelect, fetchBOMData]);

  const allAvailableMaterials = useMemo(() => {
    // Get items from existing BOMs (especially sub-assemblies)
    const subAssemblies = (existingBoms || [])
      .filter(bom => bom.id !== parseInt(bomId)) // Don't include self
      .map(bom => ({
        itemName: bom.productName,
        itemCode: bom.itemCode,
        category: bom.itemGroup || "Sub-assembly",
        unit: bom.uom || "pcs",
        unit_cost: parseFloat(bom.totalCost) || 0,
        sellingRate: parseFloat(bom.totalCost) || 0,
        valuationRate: parseFloat(bom.totalCost) || 0,
        lossPercent: parseFloat(bom.lossPercent) || 0,
        location: "",
        isSubAssembly: true,
        bomId: bom.id
      }));

    // Default: return all materials + sub-assemblies
    const allMaterials = materials.filter(m => m.itemName).map(m => ({
      itemName: m.itemName,
      itemCode: m.itemCode,
      category: m.itemGroupName || m.category,
      unit: m.unit,
      unit_cost: m.sellingRate || m.selling_rate || m.unitCost || m.unit_cost || m.valuationRate || m.valuation_rate || 0,
      sellingRate: m.sellingRate || m.selling_rate || 0,
      valuationRate: m.valuationRate || m.valuation_rate || 0,
      lossPercent: parseFloat(m.lossPercent || m.loss_percent) || 0,
      location: m.location || m.warehouse || "",
      specification: m.specification
    }));

    const combined = [...subAssemblies];
    
    // If root card is selected, add project items first (they take precedence)
    if (bomData.productInfo.rootCardId) {
      const projectItems = requirementMaterials.map(req => ({
        itemName: req.itemName || req.name,
        itemCode: req.itemCode || `REQ-${(req.itemName || req.name || "").substring(0, 3).toUpperCase()}`,
        category: req.itemGroupName || req.itemGroup || req.category,
        unit: req.uom || req.unit,
        unit_cost: req.sellingRate || req.selling_rate || req.rate || req.unitCost || req.unit_cost || req.valuationRate || req.valuation_rate || 0,
        sellingRate: req.sellingRate || req.selling_rate || 0,
        valuationRate: req.valuationRate || req.valuation_rate || 0,
        lossPercent: parseFloat(req.lossPercent || req.loss_percent) || 0,
        location: req.location || req.warehouse || "",
        isRequirement: true
      })).filter(m => m.itemName);

      projectItems.forEach(item => {
        if (!combined.some(m => m.itemCode === item.itemCode)) {
          combined.push(item);
        }
      });
    }

    // Always include general materials as fallback
    allMaterials.forEach(item => {
      if (!combined.some(m => m.itemCode === item.itemCode)) {
        combined.push(item);
      }
    });
    
    return combined;
  }, [materials, requirementMaterials, bomData.productInfo.rootCardId, existingBoms, bomId]);

  const productNameOptions = useMemo(() => allAvailableMaterials.map((m) => ({
    label: m.itemName,
    value: m.itemName,
  })), [allAvailableMaterials]);

  const itemCodeOptions = useMemo(() => allAvailableMaterials.map((m) => ({
    label: m.itemCode,
    value: m.itemCode,
  })), [allAvailableMaterials]);

  const subAssemblyOptions = useMemo(() => {
    if (!bomData.productInfo.rootCardId) return [];

    return (existingBoms || [])
      .filter(bom => 
        String(bom.rootCardId) === String(bomData.productInfo.rootCardId) && 
        bom.id !== parseInt(bomId) &&
        (bom.itemGroup === "Sub Assemblies" || bom.itemGroup === "Sub-assembly" || bom.itemGroup === "Finished Goods" || bom.itemGroup === "Finished Good")
      )
      .map(bom => ({
        label: `${bom.itemCode} - ${bom.productName}`,
        value: bom.itemCode
      }));
  }, [existingBoms, bomData.productInfo.rootCardId, bomId]);

  const itemGroupSelectOptions = useMemo(() => ItemGroupOptions.map((group) => ({
    label: group,
    value: group,
  })), []);

  const workstationOptions = useMemo(() => {
    if (!bomData.productInfo.rootCardId) return [];

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
  }, [workstations, rootCardStages, bomData.productInfo.rootCardId]);

  const warehouseOptions = useMemo(() => warehouses.map((w) => ({
    label: w,
    value: w,
  })), [warehouses]);

  const operationTypeOptions = useMemo(() => [
    { label: "In-house", value: "in-house" },
    { label: "Outsource", value: "outsource" }
  ], []);

  const operationSelectOptions = useMemo(() => {
    // Start with stages from the production plan (Root Card / Project)
    const options = rootCardStages.map(stage => ({
      label: stage.stage_name,
      value: stage.stage_name
    })).filter(opt => opt.label);

    // If root card is selected, we ONLY show project stages + standard options 
    // to prevent seeing stages from previous root cards in the state
    if (bomData.productInfo.rootCardId) {
      OperationOptions.forEach(op => {
        if (!options.some(opt => opt.label === op)) {
          options.push({ label: op, value: op });
        }
      });
      return options;
    }

    // Default: return nothing or standard options (disabled anyway)
    return [];
  }, [rootCardStages, bomData.productInfo.rootCardId]);

  const UOMSelectOptions = useMemo(() => UOMOptions.map((uom) => ({
    label: uom,
    value: uom,
  })), []);

  const rootCardOptions = useMemo(() => rootCards.map((rc) => ({
    label: `${rc.po_number || rc.code || 'N/A'} - ${rc.project_name || rc.customer || rc.title || 'N/A'}`,
    value: rc.id,
  })), [rootCards]);

  const handleProductSelect = useCallback((value, type) => {
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
  }, [allAvailableMaterials]);

  const handleComponentSelect = useCallback((id, value) => {
    const selectedMaterial = allAvailableMaterials.find(m => m.itemCode === value);
    if (selectedMaterial) {
      setBomData(prev => ({
        ...prev,
        components: prev.components.map(c => 
          c.id === id ? {
            ...c,
            componentCode: selectedMaterial.itemCode,
            uom: selectedMaterial.unit || c.uom,
            rate: (c.rate === 0) ? (selectedMaterial.sellingRate || selectedMaterial.unit_cost || c.rate) : c.rate,
            notes: (selectedMaterial.specification || selectedMaterial.description) || c.notes
          } : c
        )
      }));
    } else {
      updateTableRow("components", id, "componentCode", value);
    }
  }, [allAvailableMaterials, updateTableRow]);

  const handleMaterialSelect = useCallback((id, value) => {
    // Try to find by name first, then by code as fallback
    const selectedMaterial = allAvailableMaterials.find(m => m.itemName === value) || 
                             allAvailableMaterials.find(m => m.itemCode === value);
                             
    if (selectedMaterial) {
      setBomData(prev => ({
        ...prev,
        materials: prev.materials.map(m => 
          m.id === id ? {
            ...m,
            itemName: selectedMaterial.itemName,
            itemCode: selectedMaterial.itemCode || m.itemCode,
            itemGroup: selectedMaterial.category || m.itemGroup,
            uom: selectedMaterial.unit || m.uom,
            rate: (m.rate === 0) ? (selectedMaterial.sellingRate || selectedMaterial.unit_cost || m.rate) : m.rate,
            warehouse: selectedMaterial.location || m.warehouse,
            operation: m.operation
          } : m
        )
      }));
    } else {
      updateTableRow("materials", id, "itemName", value);
    }
  }, [allAvailableMaterials, updateTableRow]);

  const costs = useMemo(() => {
    let materialCost = 0;
    let componentCost = 0;
    let operationCost = 0;
    let scrapLossCost = 0;

    bomData.materials.forEach((m) => {
      materialCost += (parseFloat(m.quantity) || 0) * (parseFloat(m.rate) || 0);
    });

    bomData.components.forEach((c) => {
      componentCost += (parseFloat(c.quantity) || 0) * (parseFloat(c.rate) || 0);
    });

    bomData.operations.forEach((o) => {
      operationCost += parseFloat(o.cost) || 0;
    });

    bomData.scrapLoss.forEach((s) => {
      scrapLossCost += ((parseFloat(s.inputQty) || 0) * (parseFloat(s.rate) || 0) * (parseFloat(s.lossPercent) || 0)) / 100;
    });

    const materialCostAfterScrap = (materialCost + componentCost) - scrapLossCost;
    const totalBOMCost = materialCostAfterScrap + operationCost;

    // Calculate overall loss percentage
    const totalMaterialAndComponentCost = materialCost + componentCost;
    const overallLossPercent = totalMaterialAndComponentCost > 0 
      ? (scrapLossCost / totalMaterialAndComponentCost) * 100 
      : 0;

    return {
      materialCost,
      componentCost,
      operationCost,
      scrapLossCost,
      materialCostAfterScrap,
      totalBOMCost,
      overallLossPercent,
    };
  }, [bomData.materials, bomData.components, bomData.operations, bomData.scrapLoss]);

  const handleSave = useCallback(async (isNewRevision = false) => {
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

      const payload = {
        productInfo: isNewRevision 
          ? { ...bomData.productInfo, revision: (parseInt(bomData.productInfo.revision) || 1) + 1, lossPercent: costs.overallLossPercent }
          : { ...bomData.productInfo, lossPercent: costs.overallLossPercent },
        components: bomData.components.filter((c) => c.componentCode),
        materials: bomData.materials.filter((m) => m.itemName),
        operations: bomData.operations.filter((o) => o.operationName),
        scrapLoss: bomData.scrapLoss.filter((s) => s.itemCode),
      };

      let response;
      if (editMode && bomId && !isNewRevision) {
        response = await axios.put(`/engineering/bom/comprehensive/${bomId}`, payload);
      } else {
        response = await axios.post("/engineering/bom/comprehensive", payload);
      }

      if (response.data.redirect && !isNewRevision) {
        const result = await Swal.fire({
          icon: "info",
          title: "BOM Already Exists",
          text: "A BOM with this item code and revision already exists. Would you like to view/edit it?",
          showCancelButton: true,
          confirmButtonText: "Yes, Load It",
          cancelButtonText: "No, Continue",
          confirmButtonColor: "#3b82f6",
        });

        if (result.isConfirmed) {
          fetchBOMData(response.data.bomId);
          return;
        }
      }

      if (taskId) {
        try {
          await axios.patch(`/department/portal/tasks/${taskId}`, {
            status: "completed",
          });
          console.log(`Task ${taskId} marked as completed`);
        } catch (taskErr) {
          console.error("Error marking task as completed:", taskErr);
        }
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
  }, [bomData, editMode, bomId, navigate, fetchBOMData]);



  const isRootCardSelected = !!bomData.productInfo.rootCardId;

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
          <AccordionSection 
            title="Product Information" 
            section="product"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          >
            <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="max-w-md">
                <SearchableSelect
                  label="Fetch from Root Card"
                  name="rootCardSelect"
                  id="rootCardSelect"
                  options={rootCardOptions}
                  value={bomData.productInfo.rootCardId}
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
                  name="productName"
                  id="productName"
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
                  name="itemCode"
                  id="itemCode"
                  options={itemCodeOptions}
                  value={bomData.productInfo.itemCode}
                  onChange={(value) => handleProductSelect(value, 'code')}
                  placeholder="Select or type item code"
                  disabled={loadingMaterials}
                  allowCustom={true}
                />
              </div>
              <div>
                <label htmlFor="customer" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Customer
                </label>
                <input
                  type="text"
                  id="customer"
                  name="customer"
                  value={bomData.productInfo.customer || ""}
                  onChange={(e) =>
                    setBomData({
                      ...bomData,
                      productInfo: { ...bomData.productInfo, customer: e.target.value },
                    })
                  }
                  placeholder="Customer Name"
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>
              <div>
                <label htmlFor="bomNumber" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  BOM Number
                </label>
                <input
                  type="text"
                  id="bomNumber"
                  name="bomNumber"
                  value={bomData.productInfo.bomNumber || ""}
                  onChange={(e) =>
                    setBomData({
                      ...bomData,
                      productInfo: { ...bomData.productInfo, bomNumber: e.target.value },
                    })
                  }
                  placeholder="BOM-2024-001"
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>
              <div>
                <SearchableSelect
                  label="Item Group"
                  name="itemGroup"
                  id="itemGroup"
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
                <label htmlFor="quantity" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Quantity
                </label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    aria-label="Quantity"
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
                      name="uom"
                      id="uom"
                      aria-label="Unit of Measure"
                      options={UOMSelectOptions}
                      value={bomData.productInfo.uom}
                      onChange={(value) =>
                        setBomData({
                          ...bomData,
                          productInfo: { ...bomData.productInfo, uom: value },
                        })
                      }
                      placeholder="Select UOM"
                      allowCustom={true}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="revision" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Revision
                </label>
                <input
                  type="number"
                  id="revision"
                  name="revision"
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
                <label htmlFor="description" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
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
                  name="status"
                  id="status"
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
                    name="isDefault"
                    id="isDefault"
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
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          >
            {!isRootCardSelected ? (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">Please select a Root Card in Product Information to add components.</p>
              </div>
            ) : (
              <>
                {/* Quick Add Form */}
                <div className="mb-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-400 font-semibold text-xs">
                <Plus size={14} /> Add Component
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                <div className="md:col-span-3">
                  <SearchableSelect
                    label="Component/ Sub assemblies *"
                    options={subAssemblyOptions}
                    value={newComponent.componentCode}
                    onChange={(val) => {
                      const selectedMaterial = allAvailableMaterials.find(m => m.itemCode === val);
                      setNewComponent(prev => ({
                        ...prev,
                        componentCode: val,
                        uom: selectedMaterial?.unit || prev.uom,
                        rate: selectedMaterial?.sellingRate || selectedMaterial?.unit_cost || prev.rate,
                        lossPercent: selectedMaterial?.lossPercent || 0,
                        notes: (selectedMaterial?.specification || selectedMaterial?.description) || prev.notes
                      }));
                    }}
                    placeholder="Search sub-assembly.."
                    allowCustom={true}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Qty *</label>
                  <input
                    type="number"
                    value={newComponent.quantity}
                    onChange={(e) => setNewComponent(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                    className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-1">
                  <SearchableSelect
                    label="UOM"
                    options={UOMSelectOptions}
                    value={newComponent.uom}
                    onChange={(val) => setNewComponent(prev => ({ ...prev, uom: val }))}
                    allowCustom={true}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Rate (₹)</label>
                  <input
                    type="number"
                    value={newComponent.rate}
                    onChange={(e) => setNewComponent(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Loss % (Scrap)</label>
                  <input
                    type="number"
                    value={newComponent.lossPercent}
                    onChange={(e) => setNewComponent(prev => ({ ...prev, lossPercent: parseFloat(e.target.value) }))}
                    className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Notes</label>
                  <input
                    type="text"
                    value={newComponent.notes}
                    onChange={(e) => setNewComponent(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes"
                    className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-1">
                  <button 
                    onClick={() => handleAddItem("components")}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1 transition shadow-sm"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700">
                    <th className="px-2 py-1 text-left font-semibold w-10">#</th>
                    <th className="px-2 py-1 text-left font-semibold">Code</th>
                    <th className="px-2 py-1 text-center font-semibold w-auto">Qty</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">UOM</th>
                    <th className="px-2 py-1 text-right font-semibold w-auto">Rate</th>
                    <th className="px-2 py-1 text-right font-semibold w-auto">Amount</th>
                    <th className="px-2 py-1 text-right font-semibold w-auto">Loss%</th>
                    <th className="px-2 py-1 text-left font-semibold">Notes</th>
                    <th className="px-2 py-1 text-center font-semibold w-auto">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bomData.components.map((row, index) => {
                    const isEditing = editingComponentId === row.id;
                    const amount = (parseFloat(row.quantity) || 0) * (parseFloat(row.rate) || 0);

                    return (
                      <tr key={row.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-2 py-1 text-slate-500">{index + 1}</td>
                        <td className="px-2 py-1 font-medium text-slate-700 dark:text-slate-300">
                          {isEditing ? (
                            <SearchableSelect
                              name={`comp-code-${row.id}`}
                              id={`comp-code-${row.id}`}
                              aria-label="Component Code"
                              options={subAssemblyOptions}
                              value={row.componentCode}
                              onChange={(value) => handleComponentSelect(row.id, value)}
                              placeholder="Select sub-assembly"
                              allowCustom={true}
                            />
                          ) : (
                            row.componentCode
                          )}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              name={`comp-qty-${row.id}`}
                              id={`comp-qty-${row.id}`}
                              aria-label="Component Quantity"
                              value={row.quantity}
                              onChange={(e) => updateTableRow("components", row.id, "quantity", parseFloat(e.target.value))}
                              className="w-20 p-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-center"
                            />
                          ) : (
                            row.quantity
                          )}
                        </td>
                        <td className="px-2 py-1">
                          {isEditing ? (
                            <SearchableSelect
                              name={`comp-uom-${row.id}`}
                              id={`comp-uom-${row.id}`}
                              aria-label="Component UOM"
                              options={UOMSelectOptions}
                              value={row.uom}
                              onChange={(value) => updateTableRow("components", row.id, "uom", value)}
                              placeholder="Select UOM"
                              allowCustom={true}
                            />
                          ) : (
                            row.uom
                          )}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              name={`comp-rate-${row.id}`}
                              id={`comp-rate-${row.id}`}
                              aria-label="Component Rate"
                              value={row.rate}
                              onChange={(e) => updateTableRow("components", row.id, "rate", parseFloat(e.target.value))}
                              className="w-24 p-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-right"
                            />
                          ) : (
                            <span>₹{(parseFloat(row.rate) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          )}
                        </td>
                        <td className="px-2 py-1 text-right font-semibold text-slate-900 dark:text-white">
                          ₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              name={`comp-loss-${row.id}`}
                              id={`comp-loss-${row.id}`}
                              aria-label="Component Loss Percentage"
                              value={row.lossPercent}
                              onChange={(e) => updateTableRow("components", row.id, "lossPercent", parseFloat(e.target.value))}
                              className="w-16 p-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-right"
                            />
                          ) : (
                            <span>{row.lossPercent}%</span>
                          )}
                        </td>
                        <td className="px-2 py-1">
                          {isEditing ? (
                            <input
                              type="text"
                              name={`comp-notes-${row.id}`}
                              id={`comp-notes-${row.id}`}
                              aria-label="Component Notes"
                              value={row.notes}
                              onChange={(e) => updateTableRow("components", row.id, "notes", e.target.value)}
                              className="w-full p-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                            />
                          ) : (
                            <span className="text-slate-500">{row.notes || "-"}</span>
                          )}
                        </td>
                        <td className="px-2 py-1">
                          <div className="flex items-center justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => setEditingComponentId(null)}
                                  className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                  title="Save"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingComponentId(null)}
                                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingComponentId(row.id)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                  title="Edit Row"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => removeTableRow("components", row.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title="Delete Row"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {bomData.components.length === 0 && (
              <p className="text-center text-slate-500 text-xs py-2">No components added</p>
            )}
              </>
            )}
          </AccordionSection>

          {/* Materials Section */}
          <AccordionSection 
            title="Materials" 
            section="materials" 
            itemCount={bomData.materials.length}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          >
            {!isRootCardSelected ? (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">Please select a Root Card in Product Information to add materials.</p>
              </div>
            ) : (
              <>
                {/* Quick Add Form */}
                <div className="mb-4 p-3 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                  <div className="flex items-center gap-2 mb-3 text-green-700 dark:text-green-400 font-semibold text-xs">
                    <Plus size={14} /> Add Raw Material
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                    <div className="md:col-span-2">
                      <SearchableSelect
                        label="Item Name *"
                        options={productNameOptions}
                        value={newMaterial.itemName}
                        onChange={(val) => {
                          const selectedMaterial = allAvailableMaterials.find(m => m.itemName === val) || 
                                                   allAvailableMaterials.find(m => m.itemCode === val);
                          setNewMaterial(prev => ({
                            ...prev,
                            itemName: val,
                            itemCode: selectedMaterial?.itemCode || prev.itemCode,
                            uom: selectedMaterial?.unit || prev.uom,
                            itemGroup: selectedMaterial?.category || prev.itemGroup,
                            rate: selectedMaterial?.sellingRate || selectedMaterial?.unit_cost || prev.rate,
                            warehouse: selectedMaterial?.location || prev.warehouse
                          }));
                        }}
                        placeholder="Search by name.."
                        allowCustom={true}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Qty *</label>
                      <input
                        type="number"
                        value={newMaterial.quantity}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                        className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <SearchableSelect
                        label="UOM"
                        options={UOMSelectOptions}
                        value={newMaterial.uom}
                        onChange={(val) => setNewMaterial(prev => ({ ...prev, uom: val }))}
                        allowCustom={true}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <SearchableSelect
                        label="Item Group"
                        options={itemGroupSelectOptions}
                        value={newMaterial.itemGroup}
                        onChange={(val) => setNewMaterial(prev => ({ ...prev, itemGroup: val }))}
                        placeholder="Select"
                        allowCustom={true}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Rate (₹)</label>
                      <input
                        type="number"
                        value={newMaterial.rate}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                        className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <SearchableSelect
                        label="Warehouse"
                        options={warehouseOptions}
                        value={newMaterial.warehouse}
                        onChange={(val) => setNewMaterial(prev => ({ ...prev, warehouse: val }))}
                        placeholder="Select"
                        allowCustom={true}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <SearchableSelect
                        label="Operation"
                        options={operationSelectOptions}
                        value={newMaterial.operation}
                        onChange={(val) => setNewMaterial(prev => ({ ...prev, operation: val }))}
                        placeholder="Select"
                        allowCustom={true}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <button 
                        onClick={() => handleAddItem("materials")}
                        className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1 transition shadow-sm"
                      >
                        <Plus size={16} /> Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-700">
                        <th className="px-2 py-1 text-left font-semibold w-10">#</th>
                        <th className="px-2 py-1 text-left font-semibold">Item Code</th>
                        <th className="px-2 py-1 text-left font-semibold">Item Name</th>
                        <th className="px-2 py-1 text-center font-semibold w-auto">Qty</th>
                        <th className="px-2 py-1 text-left font-semibold w-auto">UOM</th>
                        <th className="px-2 py-1 text-right font-semibold w-auto">Rate</th>
                        <th className="px-2 py-1 text-right font-semibold w-auto">Amount</th>
                        <th className="px-2 py-1 text-left font-semibold w-auto">Warehouse</th>
                        <th className="px-2 py-1 text-left font-semibold w-auto">Operation</th>
                        <th className="px-2 py-1 text-center font-semibold w-auto">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bomData.materials.map((row, index) => {
                        const isEditing = editingMaterialId === row.id;
                        const amount = (parseFloat(row.quantity) || 0) * (parseFloat(row.rate) || 0);
                        
                        return (
                          <tr key={row.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-2 py-1 text-slate-500">{index + 1}</td>
                            <td className="px-2 py-1 font-medium text-slate-700 dark:text-slate-300">
                              {row.itemCode || "-"}
                            </td>
                            <td className="px-2 py-1">
                              {isEditing ? (
                                <SearchableSelect
                                  name={`mat-name-${row.id}`}
                                  id={`mat-name-${row.id}`}
                                  aria-label="Material Item Name"
                                  options={productNameOptions}
                                  value={row.itemName}
                                  onChange={(value) => handleMaterialSelect(row.id, value)}
                                  placeholder="Select item"
                                  allowCustom={true}
                                />
                              ) : (
                                <span className="text-slate-900 dark:text-white font-medium">{row.itemName}</span>
                              )}
                            </td>
                            <td className="px-2 py-1 text-center">
                              {isEditing ? (
                                <input
                                  type="number"
                                  name={`mat-qty-${row.id}`}
                                  id={`mat-qty-${row.id}`}
                                  aria-label="Material Quantity"
                                  value={row.quantity}
                                  onChange={(e) => updateTableRow("materials", row.id, "quantity", parseFloat(e.target.value))}
                                  className="w-20 p-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-center"
                                />
                              ) : (
                                <span>{row.quantity}</span>
                              )}
                            </td>
                            <td className="px-2 py-1">
                              {isEditing ? (
                                <SearchableSelect
                                  name={`mat-uom-${row.id}`}
                                  id={`mat-uom-${row.id}`}
                                  aria-label="Material UOM"
                                  options={UOMSelectOptions}
                                  value={row.uom}
                                  onChange={(value) => updateTableRow("materials", row.id, "uom", value)}
                                  placeholder="Select UOM"
                                  allowCustom={true}
                                />
                              ) : (
                                <span>{row.uom}</span>
                              )}
                            </td>
                            <td className="px-2 py-1 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  name={`mat-rate-${row.id}`}
                                  id={`mat-rate-${row.id}`}
                                  aria-label="Material Rate"
                                  value={row.rate}
                                  onChange={(e) => updateTableRow("materials", row.id, "rate", parseFloat(e.target.value))}
                                  className="w-24 p-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-right"
                                />
                              ) : (
                                <span>₹{(parseFloat(row.rate) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              )}
                            </td>
                            <td className="px-2 py-1 text-right font-semibold text-slate-900 dark:text-white">
                              ₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-2 py-1">
                              {isEditing ? (
                                <SearchableSelect
                                  name={`mat-wh-${row.id}`}
                                  id={`mat-wh-${row.id}`}
                                  aria-label="Material Warehouse"
                                  options={warehouseOptions}
                                  value={row.warehouse}
                                  onChange={(value) => updateTableRow("materials", row.id, "warehouse", value)}
                                  placeholder="Select warehouse"
                                  allowCustom={true}
                                />
                              ) : (
                                <span className="text-slate-500">{row.warehouse || "-"}</span>
                              )}
                            </td>
                            <td className="px-2 py-1">
                              {isEditing ? (
                                <SearchableSelect
                                  name={`mat-op-${row.id}`}
                                  id={`mat-op-${row.id}`}
                                  aria-label="Material Operation"
                                  options={operationSelectOptions}
                                  value={row.operation}
                                  onChange={(value) => updateTableRow("materials", row.id, "operation", value)}
                                  placeholder="Select operation"
                                  allowCustom={true}
                                />
                              ) : (
                                <span className="text-slate-500">{row.operation || "-"}</span>
                              )}
                            </td>
                            <td className="px-2 py-1">
                              <div className="flex items-center justify-center gap-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => setEditingMaterialId(null)}
                                      className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                      title="Save"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      onClick={() => setEditingMaterialId(null)}
                                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                      title="Cancel"
                                    >
                                      <X size={14} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setEditingMaterialId(row.id)}
                                      className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                      title="Edit Row"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => removeTableRow("materials", row.id)}
                                      className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                      title="Delete Row"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
            {bomData.materials.length === 0 && (
              <p className="text-center text-slate-500 text-xs py-2">No materials added</p>
            )}
              </>
            )}
          </AccordionSection>

          {/* Operations Section */}
          <AccordionSection 
            title="Operations" 
            section="operations" 
            itemCount={bomData.operations.length}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          >
            {!isRootCardSelected ? (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">Please select a Root Card in Product Information to add operations.</p>
              </div>
            ) : (
              <>
                {/* Quick Add Form */}
                <div className="mb-4 p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/30">
              <div className="flex items-center gap-2 mb-3 text-purple-700 dark:text-purple-400 font-semibold text-xs">
                <Plus size={14} /> Add Operation
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                <div className="md:col-span-2">
                  <SearchableSelect
                    label="Operation *"
                    options={operationSelectOptions}
                    value={newOperation.operationName}
                    onChange={(val) => setNewOperation(prev => ({ ...prev, operationName: val }))}
                    placeholder="Select"
                    allowCustom={true}
                  />
                </div>
                <div className="md:col-span-2">
                  <SearchableSelect
                    label="Workstation"
                    options={workstationOptions}
                    value={newOperation.workstation}
                    onChange={(val) => setNewOperation(prev => ({ ...prev, workstation: val }))}
                    placeholder="Select"
                    allowCustom={true}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Cycle Time</label>
                  <input
                    type="number"
                    value={newOperation.cycleTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setNewOperation(prev => {
                        const updated = { ...prev, cycleTime: val };
                        updated.cost = updateOperationCost(updated);
                        return updated;
                      });
                    }}
                    className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Setup Time</label>
                  <input
                    type="number"
                    value={newOperation.setupTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setNewOperation(prev => {
                        const updated = { ...prev, setupTime: val };
                        updated.cost = updateOperationCost(updated);
                        return updated;
                      });
                    }}
                    className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Rate</label>
                  <input
                    type="number"
                    value={newOperation.hourlyRate}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setNewOperation(prev => {
                        const updated = { ...prev, hourlyRate: val };
                        updated.cost = updateOperationCost(updated);
                        return updated;
                      });
                    }}
                    className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Cost</label>
                  <input
                    type="number"
                    value={newOperation.cost}
                    onChange={(e) => setNewOperation(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                    className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div className="md:col-span-1">
                  <SearchableSelect
                    label="Type"
                    options={operationTypeOptions}
                    value={newOperation.type}
                    onChange={(val) => setNewOperation(prev => ({ ...prev, type: val }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <SearchableSelect
                    label="Target Wh"
                    options={warehouseOptions}
                    value={newOperation.targetWarehouse}
                    onChange={(val) => setNewOperation(prev => ({ ...prev, targetWarehouse: val }))}
                    placeholder="Select"
                    allowCustom={true}
                  />
                </div>
                <div className="md:col-span-1">
                  <button 
                    onClick={() => handleAddItem("operations")}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1 transition shadow-sm"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700">
                    <th className="px-2 py-1 text-left font-semibold w-10">#</th>
                    <th className="px-2 py-1 text-left font-semibold">Operation</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Workstation</th>
                    <th className="px-2 py-1 text-center font-semibold w-auto">Cycle Time</th>
                    <th className="px-2 py-1 text-center font-semibold w-auto">Setup Time</th>
                    <th className="px-2 py-1 text-right font-semibold w-auto">Rate</th>
                    <th className="px-2 py-1 text-right font-semibold w-auto">Cost</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Type</th>
                    <th className="px-2 py-1 text-left font-semibold w-auto">Target Wh</th>
                    <th className="px-2 py-1 text-center font-semibold w-auto">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bomData.operations.map((row, index) => {
                    const isEditing = editingOperationId === row.id;
                    
                    return (
                      <tr key={row.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-2 py-1 text-slate-500">{index + 1}</td>
                        <td className="px-2 py-1 font-medium text-slate-700 dark:text-slate-300">
                          {isEditing ? (
                            <SearchableSelect
                              name={`op-name-${row.id}`}
                              id={`op-name-${row.id}`}
                              aria-label="Operation Name"
                              options={operationSelectOptions}
                              value={row.operationName}
                              onChange={(value) => updateTableRow("operations", row.id, "operationName", value)}
                              placeholder="Select operation"
                              allowCustom={true}
                            />
                          ) : (
                            row.operationName
                          )}
                        </td>
                        <td className="px-2 py-1">
                          {isEditing ? (
                            <SearchableSelect
                              name={`op-work-${row.id}`}
                              id={`op-work-${row.id}`}
                              aria-label="Workstation"
                              options={workstationOptions}
                              value={row.workstation}
                              onChange={(value) => updateTableRow("operations", row.id, "workstation", value)}
                              placeholder="Select workstation"
                              allowCustom={true}
                            />
                          ) : (
                            <span className="text-slate-500">{row.workstation || "-"}</span>
                          )}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              name={`op-cycle-${row.id}`}
                              id={`op-cycle-${row.id}`}
                              aria-label="Cycle Time"
                              value={row.cycleTime}
                              onChange={(e) => updateOperationRow(row.id, "cycleTime", parseFloat(e.target.value))}
                              className="w-16 p-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-center"
                            />
                          ) : (
                            row.cycleTime
                          )}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              name={`op-setup-${row.id}`}
                              id={`op-setup-${row.id}`}
                              aria-label="Setup Time"
                              value={row.setupTime}
                              onChange={(e) => updateOperationRow(row.id, "setupTime", parseFloat(e.target.value))}
                              className="w-16 p-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-center"
                            />
                          ) : (
                            row.setupTime
                          )}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              name={`op-rate-${row.id}`}
                              id={`op-rate-${row.id}`}
                              aria-label="Hourly Rate"
                              value={row.hourlyRate}
                              onChange={(e) => updateOperationRow(row.id, "hourlyRate", parseFloat(e.target.value))}
                              className="w-20 p-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-right"
                            />
                          ) : (
                            <span>₹{(parseFloat(row.hourlyRate) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          )}
                        </td>
                        <td className="px-2 py-1 text-right font-semibold text-slate-900 dark:text-white">
                          {isEditing ? (
                            <input
                              type="number"
                              name={`op-cost-${row.id}`}
                              id={`op-cost-${row.id}`}
                              aria-label="Operation Cost"
                              value={row.cost}
                              onChange={(e) => updateOperationRow(row.id, "cost", parseFloat(e.target.value))}
                              className="w-24 p-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-right"
                            />
                          ) : (
                            <span>₹{(parseFloat(row.cost) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          )}
                        </td>
                        <td className="px-2 py-1">
                          {isEditing ? (
                            <SearchableSelect
                              name={`op-type-${row.id}`}
                              id={`op-type-${row.id}`}
                              aria-label="Operation Type"
                              options={operationTypeOptions}
                              value={row.type}
                              onChange={(value) => updateTableRow("operations", row.id, "type", value)}
                              placeholder="Select type"
                            />
                          ) : (
                            <span className="capitalize text-slate-500">{row.type?.replace("-", " ") || "-"}</span>
                          )}
                        </td>
                        <td className="px-2 py-1">
                          {isEditing ? (
                            <SearchableSelect
                              name={`op-twh-${row.id}`}
                              id={`op-twh-${row.id}`}
                              aria-label="Target Warehouse"
                              options={warehouseOptions}
                              value={row.targetWarehouse}
                              onChange={(value) => updateTableRow("operations", row.id, "targetWarehouse", value)}
                              placeholder="Select warehouse"
                              allowCustom={true}
                            />
                          ) : (
                            <span className="text-slate-500">{row.targetWarehouse || "-"}</span>
                          )}
                        </td>
                        <td className="px-2 py-1">
                          <div className="flex items-center justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => setEditingOperationId(null)}
                                  className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                  title="Save"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingOperationId(null)}
                                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingOperationId(row.id)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                  title="Edit Row"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => removeTableRow("operations", row.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title="Delete Row"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {bomData.operations.length === 0 && (
              <p className="text-center text-slate-500 text-xs py-2">No operations added</p>
            )}
              </>
            )}
          </AccordionSection>

          {/* Scrap & Loss Section */}
          <AccordionSection 
            title="Scrap & Loss" 
            section="scrap" 
            itemCount={bomData.scrapLoss.length}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          >
            {!isRootCardSelected ? (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">Please select a Root Card in Product Information to add scrap items.</p>
              </div>
            ) : (
              <>
                {/* Quick Add Form */}
                <div className="mb-4 p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/30">
              <div className="flex items-center gap-2 mb-3 text-orange-700 dark:text-orange-400 font-semibold text-xs">
                <Plus size={14} /> Add Scrap Item
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                <div className="md:col-span-2">
                  <SearchableSelect
                    label="Code"
                    options={itemCodeOptions}
                    value={newScrap.itemCode}
                    onChange={(val) => {
                      const selectedMaterial = allAvailableMaterials.find(m => m.itemCode === val);
                      setNewScrap(prev => ({
                        ...prev,
                        itemCode: val,
                        name: selectedMaterial?.itemName || prev.name,
                        rate: selectedMaterial?.unit_cost || prev.rate
                      }));
                    }}
                    placeholder="Select code"
                    allowCustom={true}
                  />
                </div>
                <div className="md:col-span-3">
                  <SearchableSelect
                    label="Name"
                    options={productNameOptions}
                    value={newScrap.name}
                    onChange={(val) => {
                      const selectedMaterial = allAvailableMaterials.find(m => m.itemName === val);
                      setNewScrap(prev => ({
                        ...prev,
                        name: val,
                        itemCode: selectedMaterial?.itemCode || prev.itemCode,
                        rate: selectedMaterial?.unit_cost || prev.rate
                      }));
                    }}
                    placeholder="Select name"
                    allowCustom={true}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Input Qty</label>
                  <input
                    type="number"
                    value={newScrap.inputQty}
                    onChange={(e) => setNewScrap(prev => ({ ...prev, inputQty: parseFloat(e.target.value) }))}
                    className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Loss %</label>
                  <input
                    type="number"
                    value={newScrap.lossPercent}
                    onChange={(e) => setNewScrap(prev => ({ ...prev, lossPercent: parseFloat(e.target.value) }))}
                    className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Rate</label>
                  <input
                    type="number"
                    value={newScrap.rate}
                    onChange={(e) => setNewScrap(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div className="md:col-span-1">
                  <button 
                    onClick={() => handleAddItem("scrapLoss")}
                    className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1 transition shadow-sm"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700">
                    <th className="px-2 py-1 text-left font-semibold w-10">#</th>
                    <th className="px-2 py-1 text-left font-semibold">Code</th>
                    <th className="px-2 py-1 text-left font-semibold">Name</th>
                    <th className="px-2 py-1 text-center font-semibold w-auto">Input Qty</th>
                    <th className="px-2 py-1 text-center font-semibold w-auto">Loss %</th>
                    <th className="px-2 py-1 text-right font-semibold w-auto">Rate</th>
                    <th className="px-2 py-1 text-right font-semibold w-auto">Amount</th>
                    <th className="px-2 py-1 text-center font-semibold w-auto">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bomData.scrapLoss.map((row, index) => {
                    const isEditing = editingScrapId === row.id;
                    const amount = ((parseFloat(row.inputQty) || 0) * (parseFloat(row.rate) || 0) * (parseFloat(row.lossPercent) || 0)) / 100;

                    return (
                      <tr key={row.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-2 py-1 text-slate-500">{index + 1}</td>
                        <td className="px-2 py-1 font-medium text-slate-700 dark:text-slate-300">
                          {isEditing ? (
                            <SearchableSelect
                              name={`scrap-code-${row.id}`}
                              id={`scrap-code-${row.id}`}
                              aria-label="Scrap Item Code"
                              options={itemCodeOptions}
                              value={row.itemCode}
                              onChange={(value) => {
                                const selectedMaterial = allAvailableMaterials.find(m => m.itemCode === value);
                                setBomData(prev => ({
                                  ...prev,
                                  scrapLoss: prev.scrapLoss.map(s => 
                                    s.id === row.id ? {
                                      ...s,
                                      itemCode: value,
                                      name: selectedMaterial?.itemName || s.name,
                                      rate: selectedMaterial?.unit_cost || s.rate
                                    } : s
                                  )
                                }));
                              }}
                              placeholder="Select code"
                              allowCustom={true}
                            />
                          ) : (
                            row.itemCode || "-"
                          )}
                        </td>
                        <td className="px-2 py-1">
                          {isEditing ? (
                            <SearchableSelect
                              name={`scrap-name-${row.id}`}
                              id={`scrap-name-${row.id}`}
                              aria-label="Scrap Item Name"
                              options={productNameOptions}
                              value={row.name}
                              onChange={(value) => {
                                const selectedMaterial = allAvailableMaterials.find(m => m.itemName === value);
                                setBomData(prev => ({
                                  ...prev,
                                  scrapLoss: prev.scrapLoss.map(s => 
                                    s.id === row.id ? {
                                      ...s,
                                      name: value,
                                      itemCode: selectedMaterial?.itemCode || s.itemCode,
                                      rate: selectedMaterial?.unit_cost || s.rate
                                    } : s
                                  )
                                }));
                              }}
                              placeholder="Select name"
                              allowCustom={true}
                            />
                          ) : (
                            <span className="text-slate-900 dark:text-white font-medium">{row.name}</span>
                          )}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              name={`scrap-qty-${row.id}`}
                              id={`scrap-qty-${row.id}`}
                              aria-label="Scrap Input Quantity"
                              value={row.inputQty}
                              onChange={(e) => updateTableRow("scrapLoss", row.id, "inputQty", parseFloat(e.target.value))}
                              className="w-20 p-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-center"
                            />
                          ) : (
                            row.inputQty
                          )}
                        </td>
                        <td className="px-2 py-1 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              name={`scrap-loss-${row.id}`}
                              id={`scrap-loss-${row.id}`}
                              aria-label="Scrap Loss Percentage"
                              value={row.lossPercent}
                              onChange={(e) => updateTableRow("scrapLoss", row.id, "lossPercent", parseFloat(e.target.value))}
                              className="w-20 p-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-center"
                            />
                          ) : (
                            row.lossPercent + "%"
                          )}
                        </td>
                        <td className="px-2 py-1 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              name={`scrap-rate-${row.id}`}
                              id={`scrap-rate-${row.id}`}
                              aria-label="Scrap Rate"
                              value={row.rate}
                              onChange={(e) => updateTableRow("scrapLoss", row.id, "rate", parseFloat(e.target.value))}
                              className="w-24 p-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs text-right"
                            />
                          ) : (
                            <span>₹{(parseFloat(row.rate) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          )}
                        </td>
                        <td className="px-2 py-1 text-right font-semibold text-slate-900 dark:text-white">
                          ₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-2 py-1">
                          <div className="flex items-center justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => setEditingScrapId(null)}
                                  className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                  title="Save"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  onClick={() => setEditingScrapId(null)}
                                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingScrapId(row.id)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                  title="Edit Row"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => removeTableRow("scrapLoss", row.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  title="Delete Row"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {bomData.scrapLoss.length === 0 && (
              <p className="text-center text-slate-500 text-xs py-2">No scrap items added</p>
            )}
              </>
            )}
          </AccordionSection>

          {/* Costs Section */}
          <AccordionSection 
            title="Cost Summary" 
            section="costs"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          >
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
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold disabled:opacity-50 text-sm"
          >
            <Save size={16} />
            {saving ? "Saving..." : editMode ? "Update BOM" : "Create BOM"}
          </button>
          {editMode && (
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold disabled:opacity-50 text-sm"
              title="Save as a new revision (Revision number will increment)"
            >
              <Copy size={16} />
              {saving ? "Saving..." : "Save as New Revision"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBOMPage;
