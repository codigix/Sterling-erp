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
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-all duration-200">
    <div className={`px-5 py-4 flex items-center justify-between cursor-pointer select-none transition-colors ${expandedSections[section] ? "bg-slate-50/80 dark:bg-slate-800/50" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"}`}
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg transition-colors ${expandedSections[section] ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
          <ChevronDown
            size={20}
            className={`transition-transform duration-300 ${expandedSections[section] ? "" : "-rotate-90"}`}
          />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
        {itemCount > 0 && (
          <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {itemCount} Items
          </span>
        )}
      </div>
    </div>
    {expandedSections[section] && (
      <div className="p-5 md:p-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
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
  const [vendors, setVendors] = useState([]);
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
  const [newOperation, setNewOperation] = useState({ 
    operationName: "", 
    workstation: "", 
    cycleTime: 0, 
    setupTime: 0, 
    hourlyRate: 0, 
    cost: 0, 
    type: "in-house", 
    targetWarehouse: "",
    vendorName: "",
    vendorRatePerUnit: 0,
    subcontractWarehouse: ""
  });
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
    if (row.type === 'outsource') {
      return parseFloat(row.vendorRatePerUnit) || 0;
    }
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
      resetState = () => setNewOperation({ 
        operationName: "", 
        workstation: "", 
        cycleTime: 0, 
        setupTime: 0, 
        hourlyRate: 0, 
        cost: 0, 
        type: "in-house", 
        targetWarehouse: "",
        vendorName: "",
        vendorRatePerUnit: 0,
        subcontractWarehouse: ""
      });
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
      const [rcRes, planRes, reqRes, facilitiesRes, materialsRes, vendorsRes] = await Promise.all([
        axios.get(`/root-cards/${rootCardId}`),
        axios.get(`/root-cards/steps/${rootCardId}/production-plan`).catch(() => ({ data: { success: false } })),
        axios.get(`/root-cards/requirements/${rootCardId}`).catch(() => ({ data: { success: false } })),
        axios.get("/inventory/facilities").catch(() => ({ data: { facilities: [] } })),
        axios.get("/inventory/materials").catch(() => ({ data: { materials: [] } })),
        axios.get("/inventory/vendors").catch(() => ({ data: [] }))
      ]);

      const rootCard = rcRes.data.rootCard || rcRes.data;
      if (!rootCard) throw new Error("Root card not found");

      // Set global materials, workstations and vendors
      setMaterials(materialsRes.data.materials || []);
      setWorkstations(facilitiesRes.data.facilities || []);
      setVendors(Array.isArray(vendorsRes.data) ? vendorsRes.data : []);

      // --- DATA EXTRACTION ---
      // Try to get phases from step 4 data if it exists in the root card
      const step4 = rootCard.steps?.step4_production || rootCard.steps?.production_plan;
      const step4Phases = step4?.selectedPhases || step4?.selected_phases || step4?.data?.selectedPhases || step4?.data?.selected_phases || {};
      
      const planData = planRes?.data?.data || planRes?.data || {};
      const planPhases = planData.selectedPhases || planData.selected_phases || planData.phaseDetails || planData.phases || {};
      const availablePhases = planData.availablePhases || planData.available_phases || step4?.availablePhases || step4?.available_phases || [];

      // --- STAGES / OPERATIONS CONSOLIDATION ---
      // Collect all phase/stage information from all possible sources
      const phaseMap = new Map();

      const mergePhaseData = (name, data) => {
        if (!name || name === "null" || name === "undefined") return;
        const key = name.toLowerCase().trim();
        const existing = phaseMap.get(key) || {};
        
        // Extract rate from any possible field name
        const rawRate = (typeof data === 'object' && data !== null) 
          ? (data.hourly_rate ?? data.hourlyRate ?? data.rate ?? 0)
          : 0;
        
        const rate = parseFloat(rawRate) || existing.hourly_rate || 0;
        
        const type = (typeof data === 'object' && data !== null)
          ? (data.stage_type ?? data.stageType ?? data.type ?? existing.stage_type ?? 'in-house')
          : (existing.stage_type || 'in-house');
          
        const worker = (typeof data === 'object' && data !== null)
          ? (data.assigned_worker ?? data.assignedWorker ?? data.assignee ?? existing.assigned_worker ?? "")
          : (existing.assigned_worker || "");

        phaseMap.set(key, {
          stage_name: (typeof data === 'object' && data !== null) 
            ? (data.phase || data.stageName || data.name || data.phase_name || data.stage_name || name)
            : (existing.stage_name || name),
          stage_type: type,
          hourly_rate: rate,
          assigned_worker: worker
        });
      };

      // Source 1: rootCard.stages (Legacy/Main sync)
      if (Array.isArray(rootCard.stages)) {
        rootCard.stages.forEach(s => mergePhaseData(s.stage_name || s.name || s.phase, s));
      }

      // Source 2: Step 4 phases from rootCard object (Draft/Wizard Context)
      if (step4Phases) {
        Object.entries(step4Phases).forEach(([name, data]) => mergePhaseData(name, data));
      }

      // Source 3: Dedicated Production Plan API (Step 4 saved data)
      if (planPhases) {
        Object.entries(planPhases).forEach(([name, data]) => mergePhaseData(name, data));
      }

      // Source 4: Available Phases (Project-specific master list - CRITICAL for rates)
      if (Array.isArray(availablePhases)) {
        availablePhases.forEach(ap => mergePhaseData(ap.name, ap));
      }

      const combinedStages = Array.from(phaseMap.values());
      setRootCardStages(combinedStages);

      // --- REQUIREMENTS ---
      let potentialMaterials = [];
      if (reqRes.data?.success && reqRes.data?.data) {
        potentialMaterials = (reqRes.data.data.materials || []).map(req => ({ ...req, id: req.id || `req-${Date.now()}-${Math.random()}` }));
      }

      // DESIGN ENGINEERING DATA REMOVED AS PER USER REQUEST
      // Only using Material Requirements (Step 3) for strict isolation
      const designEngineering = rootCard.steps?.step2_design || rootCard.designEngineering;
      
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
        rate: parseFloat(item.valuationRate || item.valuation_rate || item.sellingRate || item.selling_rate || item.rate || item.unitCost || item.unit_cost || 0),
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
        const [rootCardsRes, bomsRes, warehousesRes] = await Promise.all([
          axios.get("/root-cards", {
            params: { assignedOnly: true }
          }),
          axios.get("/engineering/bom/comprehensive"),
          axios.get("/inventory/warehouses")
        ]);
        
        setRootCards(rootCardsRes.data.rootCards || []);
        setExistingBoms(bomsRes.data.boms || []);
        setWarehouses(warehousesRes.data || []);

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
      unit_cost: m.valuationRate || m.valuation_rate || m.unitCost || m.unit_cost || 0,
      sellingRate: m.sellingRate || m.selling_rate || 0,
      valuationRate: m.valuationRate || m.valuation_rate || 0,
      lossPercent: parseFloat(m.lossPercent || m.loss_percent) || 0,
      location: m.location || m.warehouse || "",
      specification: m.specification
    }));

    const combined = [];
    
    // If root card is selected, we ONLY show project items and their specific sub-assemblies
    if (bomData.productInfo.rootCardId) {
      // 1. Add sub-assemblies specifically for this root card
      const projectSubAssemblies = subAssemblies.filter(sa => 
        (existingBoms.find(b => b.id === sa.bomId)?.rootCardId?.toString() === bomData.productInfo.rootCardId.toString())
      );
      
      projectSubAssemblies.forEach(sa => combined.push(sa));

      // 2. Add project items from Material Requirements step
      const projectItems = requirementMaterials.map(req => ({
        itemName: req.itemName || req.name,
        itemCode: req.itemCode || `REQ-${(req.itemName || req.name || "").substring(0, 3).toUpperCase()}`,
        category: req.itemGroupName || req.itemGroup || req.category,
        unit: req.uom || req.unit,
        unit_cost: req.valuationRate || req.valuation_rate || req.rate || req.unitCost || req.unit_cost || 0,
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
      
      // 3. Add Consumable materials from general inventory
      const consumableItems = allMaterials.filter(m => 
        m.category === "Consumable" || m.category === "Consumables"
      );
      
      consumableItems.forEach(item => {
        if (!combined.some(m => m.itemCode === item.itemCode)) {
          combined.push(item);
        }
      });
      
      return combined;
    }

    // If NO root card is selected (e.g., creating a generic BOM), 
    // fall back to all materials and all sub-assemblies
    combined.push(...subAssemblies);
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

    // 1. Get sub-assemblies for this root card
    const projectSubAssemblies = (existingBoms || [])
      .filter(bom => 
        String(bom.rootCardId) === String(bomData.productInfo.rootCardId) && 
        bom.id !== parseInt(bomId)
      )
      .map(bom => ({
        label: bom.productName,
        value: bom.itemCode
      }));

    // 2. Get Consumable materials from available materials
    const consumableMaterials = allAvailableMaterials
      .filter(m => m.category === "Consumable" || m.category === "Consumables")
      .map(m => ({
        label: m.itemName,
        value: m.itemCode
      }));

    // Combine and remove duplicates based on itemCode
    const combined = [...projectSubAssemblies];
    consumableMaterials.forEach(item => {
      if (!combined.some(c => c.value === item.value)) {
        combined.push(item);
      }
    });

    return combined;
  }, [existingBoms, bomData.productInfo.rootCardId, bomId, allAvailableMaterials]);

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

  const vendorOptions = useMemo(() => vendors.map((v) => ({
    label: v.name,
    value: v.name,
  })), [vendors]);

  const warehouseOptions = useMemo(() => {
    if (!warehouses || warehouses.length === 0) return [];
    return warehouses.map((w) => ({
      label: w.name || w,
      value: w.name || w,
    }));
  }, [warehouses]);

  const operationTypeOptions = useMemo(() => [
    { label: "In-house", value: "in-house" },
    { label: "Outsource", value: "outsource" }
  ], []);

  const operationSelectOptions = useMemo(() => {
    // Start with stages from the production plan (Root Card / Project)
    // These are the phases selected in Step 4 of the wizard
    const options = rootCardStages.map(stage => ({
      label: stage.stage_name,
      value: stage.stage_name
    })).filter(opt => opt.label);

    // If root card is selected, we return ONLY project stages
    if (bomData.productInfo.rootCardId && options.length > 0) {
      return options;
    }

    // Default: return standard options
    return OperationOptions.map(op => ({ label: op, value: op }));
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
            rate: (c.rate === 0) ? (selectedMaterial.valuationRate || selectedMaterial.unit_cost || c.rate) : c.rate,
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
            rate: (m.rate === 0) ? (selectedMaterial.valuationRate || selectedMaterial.unit_cost || m.rate) : m.rate,
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/design-engineer/dashboard")}
              className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-all"
            >
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {editMode ? "Edit BOM" : "Create BOM"}
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Bill of Materials Management</p>
            </div>
          </div>
        </div>

        {/* Accordions Container */}
        <div className="space-y-4">
          {/* Product Information Section */}
          <AccordionSection 
            title="Product Information" 
            section="product"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          >
            <div className="mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="max-w-xl">
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
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                  Selecting a root card will automatically populate product information and link this BOM to its project.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
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
              <div className="space-y-1">
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
              <div className="space-y-1">
                <label htmlFor="customer" className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">
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
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none shadow-sm placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="bomNumber" className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">
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
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none shadow-sm placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-1">
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
              <div className="space-y-1">
                <label htmlFor="quantity" className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">
                  Quantity & UOM
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      aria-label="Quantity"
                      value={bomData.productInfo.quantity}
                      onChange={(e) =>
                        setBomData({
                          ...bomData,
                          productInfo: { ...bomData.productInfo, quantity: e.target.value === "" ? "" : parseFloat(e.target.value) },
                        })
                      }
                      onBlur={(e) => {
                        if (e.target.value === "") {
                          setBomData(prev => ({
                            ...prev,
                            productInfo: { ...prev.productInfo, quantity: 0 }
                          }));
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none shadow-sm"
                    />
                  </div>
                  <div className="w-[160px]">
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
                      placeholder="UOM"
                      allowCustom={true}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="revision" className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">
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
                      productInfo: { ...bomData.productInfo, revision: e.target.value === "" ? "" : parseInt(e.target.value) },
                    })
                  }
                  onBlur={(e) => {
                    if (e.target.value === "") {
                      setBomData(prev => ({
                        ...prev,
                        productInfo: { ...prev.productInfo, revision: 1 }
                      }));
                    }
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none shadow-sm"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3 space-y-1">
                <label htmlFor="description" className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">
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
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none shadow-sm placeholder:text-slate-400"
                  rows="3"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-8 p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="w-48">
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
              <div className="flex items-center gap-2 pt-5">
                <label className="relative inline-flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    name="isDefault"
                    id="isDefault"
                    className="sr-only peer"
                    checked={bomData.productInfo.isDefault}
                    onChange={(e) =>
                      setBomData({
                        ...bomData,
                        productInfo: { ...bomData.productInfo, isDefault: e.target.checked },
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Set as Default BOM</span>
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
              <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  <Plus size={24} className="text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Root Card Selected</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Please select a Root Card in Product Information to start adding components.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quick Add Form */}
                <div className="p-5 bg-blue-50/30 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20">
                  <div className="flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-400 font-bold text-[11px] uppercase tracking-wider">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                      <Plus size={12} />
                    </div>
                    Add Component / Sub-assembly
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-3">
                      <SearchableSelect
                        label="Component Name *"
                        options={subAssemblyOptions}
                        value={newComponent.componentCode}
                        onChange={(val) => {
                          const selectedMaterial = allAvailableMaterials.find(m => m.itemCode === val);
                          setNewComponent(prev => ({
                            ...prev,
                            componentCode: val,
                            uom: selectedMaterial?.unit || prev.uom,
                            rate: selectedMaterial?.valuationRate || selectedMaterial?.unit_cost || prev.rate,
                            lossPercent: selectedMaterial?.lossPercent || 0,
                            notes: (selectedMaterial?.specification || selectedMaterial?.description) || prev.notes
                          }));
                        }}
                        placeholder="Search components.."
                        allowCustom={true}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">Qty *</label>
                      <input
                        type="number"
                        value={newComponent.quantity}
                        onChange={(e) => setNewComponent(prev => ({ ...prev, quantity: e.target.value === "" ? "" : parseFloat(e.target.value) }))}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            setNewComponent(prev => ({ ...prev, quantity: 0 }));
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <SearchableSelect
                        label="UOM"
                        options={UOMSelectOptions}
                        value={newComponent.uom}
                        onChange={(val) => setNewComponent(prev => ({ ...prev, uom: val }))}
                        allowCustom={true}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">Rate (₹)</label>
                      <input
                        type="number"
                        value={newComponent.rate}
                        onChange={(e) => setNewComponent(prev => ({ ...prev, rate: e.target.value === "" ? "" : parseFloat(e.target.value) }))}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            setNewComponent(prev => ({ ...prev, rate: 0 }));
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">Loss %</label>
                      <input
                        type="number"
                        value={newComponent.lossPercent}
                        onChange={(e) => setNewComponent(prev => ({ ...prev, lossPercent: e.target.value === "" ? "" : parseFloat(e.target.value) }))}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            setNewComponent(prev => ({ ...prev, lossPercent: 0 }));
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">Notes</label>
                      <input
                        type="text"
                        value={newComponent.notes}
                        onChange={(e) => setNewComponent(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional details"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <button 
                        onClick={() => handleAddItem("components")}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/50">
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-10">#</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Component Code</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-center">Qty</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">UOM</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right">Rate</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right">Amount</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right">Loss%</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Notes</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {bomData.components.map((row, index) => {
                        const isEditing = editingComponentId === row.id;
                        const amount = (parseFloat(row.quantity) || 0) * (parseFloat(row.rate) || 0);

                        return (
                          <tr key={row.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-slate-400 font-medium">{index + 1}</td>
                            <td className="px-4 py-3">
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
                                <span className="font-bold text-slate-700 dark:text-slate-200">{row.componentCode}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isEditing ? (
                                <input
                                  type="number"
                                  name={`comp-qty-${row.id}`}
                                  id={`comp-qty-${row.id}`}
                                  aria-label="Component Quantity"
                                  value={row.quantity}
                                  onChange={(e) => updateTableRow("components", row.id, "quantity", e.target.value === "" ? "" : parseFloat(e.target.value))}
                                  onBlur={(e) => {
                                    if (e.target.value === "") {
                                      updateTableRow("components", row.id, "quantity", 0);
                                    }
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  className="w-20 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs text-center focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                              ) : (
                                <span className="font-semibold text-slate-600 dark:text-slate-400">{row.quantity}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
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
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400">{row.uom}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  name={`comp-rate-${row.id}`}
                                  id={`comp-rate-${row.id}`}
                                  aria-label="Component Rate"
                                  value={row.rate}
                                  onChange={(e) => updateTableRow("components", row.id, "rate", e.target.value === "" ? "" : parseFloat(e.target.value))}
                                  onBlur={(e) => {
                                    if (e.target.value === "") {
                                      updateTableRow("components", row.id, "rate", 0);
                                    }
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  className="w-24 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs text-right focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                              ) : (
                                <span className="font-medium text-slate-600 dark:text-slate-400">₹{(parseFloat(row.rate) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-bold text-slate-900 dark:text-white">₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  name={`comp-loss-${row.id}`}
                                  id={`comp-loss-${row.id}`}
                                  aria-label="Component Loss Percentage"
                                  value={row.lossPercent}
                                  onChange={(e) => updateTableRow("components", row.id, "lossPercent", e.target.value === "" ? "" : parseFloat(e.target.value))}
                                  onBlur={(e) => {
                                    if (e.target.value === "") {
                                      updateTableRow("components", row.id, "lossPercent", 0);
                                    }
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  className="w-16 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs text-right focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                              ) : (
                                <span className="text-red-500 font-medium">{row.lossPercent}%</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <input
                                  type="text"
                                  name={`comp-notes-${row.id}`}
                                  id={`comp-notes-${row.id}`}
                                  aria-label="Component Notes"
                                  value={row.notes}
                                  onChange={(e) => updateTableRow("components", row.id, "notes", e.target.value)}
                                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                              ) : (
                                <span className="text-slate-500 dark:text-slate-400 truncate max-w-[150px] block" title={row.notes}>{row.notes || "-"}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => setEditingComponentId(null)}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                      title="Save"
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button
                                      onClick={() => setEditingComponentId(null)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                      title="Cancel"
                                    >
                                      <X size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setEditingComponentId(row.id)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                      title="Edit Row"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => removeTableRow("components", row.id)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                      title="Delete Row"
                                    >
                                      <Trash2 size={16} />
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
                  <div className="text-center py-6 text-slate-400 text-xs font-medium italic">
                    No components added yet. Use the form above to add your first component.
                  </div>
                )}
              </div>
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
              <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  <Plus size={24} className="text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Root Card Selected</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Please select a Root Card in Product Information to start adding materials.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quick Add Form */}
                <div className="p-5 bg-emerald-50/30 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20">
                  <div className="flex items-center gap-2 mb-4 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <Plus size={12} />
                    </div>
                    Add Raw Material
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
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
                            rate: selectedMaterial?.valuationRate || selectedMaterial?.unit_cost || prev.rate,
                            warehouse: selectedMaterial?.location || prev.warehouse
                          }));
                        }}
                        placeholder="Search items.."
                        allowCustom={true}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">Qty *</label>
                      <input
                        type="number"
                        value={newMaterial.quantity}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, quantity: e.target.value === "" ? "" : parseFloat(e.target.value) }))}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            setNewMaterial(prev => ({ ...prev, quantity: 0 }));
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
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
                      <label className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">Rate (₹)</label>
                      <input
                        type="number"
                        value={newMaterial.rate}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, rate: e.target.value === "" ? "" : parseFloat(e.target.value) }))}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            setNewMaterial(prev => ({ ...prev, rate: 0 }));
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
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
                    <div className="md:col-span-1">
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
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/50">
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-10">#</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Item Details</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-center">Qty</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">UOM</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right">Rate</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right">Amount</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Warehouse</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Operation</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {bomData.materials.map((row, index) => {
                        const isEditing = editingMaterialId === row.id;
                        const amount = (parseFloat(row.quantity) || 0) * (parseFloat(row.rate) || 0);
                        
                        return (
                          <tr key={row.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-slate-400 font-medium">{index + 1}</td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <div className="space-y-1">
                                  <SearchableSelect
                                    name={`mat-name-${row.id}`}
                                    id={`mat-name-${row.id}`}
                                    aria-label="Item Name"
                                    options={productNameOptions}
                                    value={row.itemName}
                                    onChange={(value) => handleMaterialSelect(row.id, value)}
                                    placeholder="Select item"
                                    allowCustom={true}
                                  />
                                </div>
                              ) : (
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-700 dark:text-slate-200">{row.itemName}</span>
                                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tight">{row.itemCode || "NO-CODE"} • {row.itemGroup}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isEditing ? (
                                <input
                                  type="number"
                                  name={`mat-qty-${row.id}`}
                                  id={`mat-qty-${row.id}`}
                                  aria-label="Material Quantity"
                                  value={row.quantity}
                                  onChange={(e) => updateTableRow("materials", row.id, "quantity", e.target.value === "" ? "" : parseFloat(e.target.value))}
                                  onBlur={(e) => {
                                    if (e.target.value === "") {
                                      updateTableRow("materials", row.id, "quantity", 0);
                                    }
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  className="w-20 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs text-center focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                />
                              ) : (
                                <span className="font-semibold text-slate-600 dark:text-slate-400">{row.quantity}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <SearchableSelect
                                  name={`mat-uom-${row.id}`}
                                  id={`mat-uom-${row.id}`}
                                  aria-label="Material UOM"
                                  options={UOMSelectOptions}
                                  value={row.uom}
                                  onChange={(value) => updateTableRow("materials", row.id, "uom", value)}
                                  placeholder="UOM"
                                  allowCustom={true}
                                />
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400">{row.uom}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  name={`mat-rate-${row.id}`}
                                  id={`mat-rate-${row.id}`}
                                  aria-label="Material Rate"
                                  value={row.rate}
                                  onChange={(e) => updateTableRow("materials", row.id, "rate", e.target.value === "" ? "" : parseFloat(e.target.value))}
                                  onBlur={(e) => {
                                    if (e.target.value === "") {
                                      updateTableRow("materials", row.id, "rate", 0);
                                    }
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  className="w-24 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs text-right focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                />
                              ) : (
                                <span className="font-medium text-slate-600 dark:text-slate-400">₹{(parseFloat(row.rate) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-bold text-slate-900 dark:text-white">₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <SearchableSelect
                                  name={`mat-wh-${row.id}`}
                                  id={`mat-wh-${row.id}`}
                                  aria-label="Warehouse"
                                  options={warehouseOptions}
                                  value={row.warehouse}
                                  onChange={(value) => updateTableRow("materials", row.id, "warehouse", value)}
                                  placeholder="Warehouse"
                                  allowCustom={true}
                                />
                              ) : (
                                <span className="text-slate-600 dark:text-slate-400 font-medium">{row.warehouse || "-"}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <SearchableSelect
                                  name={`mat-op-${row.id}`}
                                  id={`mat-op-${row.id}`}
                                  aria-label="Operation"
                                  options={operationSelectOptions}
                                  value={row.operation}
                                  onChange={(value) => updateTableRow("materials", row.id, "operation", value)}
                                  placeholder="Operation"
                                  allowCustom={true}
                                />
                              ) : (
                                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-[10px] uppercase tracking-wider">{row.operation || "-"}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => setEditingMaterialId(null)}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                      title="Save"
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button
                                      onClick={() => setEditingMaterialId(null)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                      title="Cancel"
                                    >
                                      <X size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setEditingMaterialId(row.id)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                      title="Edit Row"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => removeTableRow("materials", row.id)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                      title="Delete Row"
                                    >
                                      <Trash2 size={16} />
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
                  <div className="text-center py-6 text-slate-400 text-xs font-medium italic">
                    No materials added yet. Use the form above to add your first material.
                  </div>
                )}
              </div>
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
              <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  <Plus size={24} className="text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Root Card Selected</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Please select a Root Card in Product Information to start adding operations.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quick Add Form */}
                <div className="p-5 bg-purple-50/30 dark:bg-purple-900/10 rounded-2xl border border-purple-100/50 dark:border-purple-900/20">
                  <div className="flex items-center gap-2 mb-4 text-purple-700 dark:text-purple-400 font-bold text-[10px] uppercase tracking-wider">
                    <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                      <Plus size={12} />
                    </div>
                    Add Manufacturing Operation
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5 items-end">
                    {/* Row 1: Primary identifiers */}
                    <div className="md:col-span-3">
                      <SearchableSelect
                        label="Operation *"
                        options={operationSelectOptions}
                        value={newOperation.operationName}
                        onChange={(val) => {
                          const selectedStage = rootCardStages.find(s => s.stage_name?.toLowerCase().trim() === val?.toLowerCase().trim());
                          setNewOperation(prev => {
                            const updated = { 
                              ...prev, 
                              operationName: val,
                              hourlyRate: selectedStage ? (parseFloat(selectedStage.hourly_rate || selectedStage.hourlyRate) || 0) : prev.hourlyRate,
                              type: selectedStage?.stage_type || prev.type
                            };
                            updated.cost = updateOperationCost(updated);
                            return updated;
                          });
                        }}
                        placeholder="Search operator"
                        allowCustom={true}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <SearchableSelect
                        label="Execution Mode"
                        options={operationTypeOptions}
                        value={newOperation.type}
                        onChange={(val) => setNewOperation(prev => {
                          const updated = { ...prev, type: val };
                          updated.cost = updateOperationCost(updated);
                          return updated;
                        })}
                      />
                    </div>

                    {newOperation.type === "in-house" ? (
                      <>
                        <div className="md:col-span-3">
                          <SearchableSelect
                            label="Workstation"
                            options={workstationOptions}
                            value={newOperation.workstation}
                            onChange={(val) => setNewOperation(prev => ({ ...prev, workstation: val }))}
                            placeholder="Select"
                            allowCustom={true}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <SearchableSelect
                            label="Target Warehouse"
                            options={warehouseOptions}
                            value={newOperation.targetWarehouse}
                            onChange={(val) => setNewOperation(prev => ({ ...prev, targetWarehouse: val }))}
                            placeholder="Select"
                            allowCustom={true}
                          />
                        </div>

                        {/* Row 2: Quantities and Costs */}
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1 whitespace-nowrap">Cycle Time (min)</label>
                          <input
                            type="number"
                            value={newOperation.cycleTime}
                            onChange={(e) => {
                              const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                              setNewOperation(prev => {
                                const updated = { ...prev, cycleTime: val };
                                updated.cost = updateOperationCost(updated);
                                return updated;
                              });
                            }}
                            onBlur={(e) => {
                              if (e.target.value === "") {
                                setNewOperation(prev => ({ ...prev, cycleTime: 0 }));
                              }
                            }}
                            onFocus={(e) => e.target.select()}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none shadow-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1 whitespace-nowrap">Setup Time (min)</label>
                          <input
                            type="number"
                            value={newOperation.setupTime}
                            onChange={(e) => {
                              const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                              setNewOperation(prev => {
                                const updated = { ...prev, setupTime: val };
                                updated.cost = updateOperationCost(updated);
                                return updated;
                              });
                            }}
                            onBlur={(e) => {
                              if (e.target.value === "") {
                                setNewOperation(prev => ({ ...prev, setupTime: 0 }));
                              }
                            }}
                            onFocus={(e) => e.target.select()}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none shadow-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">Hourly Rate (₹)</label>
                          <input
                            type="number"
                            value={newOperation.hourlyRate}
                            onChange={(e) => {
                              const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                              setNewOperation(prev => {
                                const updated = { ...prev, hourlyRate: val };
                                updated.cost = updateOperationCost(updated);
                                return updated;
                              });
                            }}
                            onBlur={(e) => {
                              if (e.target.value === "") {
                                setNewOperation(prev => ({ ...prev, hourlyRate: 0 }));
                              }
                            }}
                            onFocus={(e) => e.target.select()}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none shadow-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">Cost (₹)</label>
                          <input
                            type="number"
                            value={newOperation.cost}
                            readOnly
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-xs outline-none cursor-not-allowed"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <button 
                            onClick={() => handleAddItem("operations")}
                            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md active:scale-[0.98]"
                          >
                            <Plus size={18} /> Add
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="md:col-span-3">
                          <SearchableSelect
                            label="Vendor Name"
                            options={vendorOptions}
                            value={newOperation.vendorName}
                            onChange={(val) => setNewOperation(prev => ({ ...prev, vendorName: val }))}
                            placeholder="Select Vendor"
                            allowCustom={true}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <SearchableSelect
                            label="Subcontract Warehouse"
                            options={warehouseOptions}
                            value={newOperation.subcontractWarehouse}
                            onChange={(val) => setNewOperation(prev => ({ ...prev, subcontractWarehouse: val }))}
                            placeholder="Select"
                            allowCustom={true}
                          />
                        </div>

                        {/* Row 2: Rates and Costs */}
                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1 whitespace-nowrap">Vendor Rate / Unit (₹)</label>
                          <input
                            type="number"
                            value={newOperation.vendorRatePerUnit}
                            onChange={(e) => {
                              const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                              setNewOperation(prev => {
                                const updated = { ...prev, vendorRatePerUnit: val };
                                updated.cost = updateOperationCost(updated);
                                return updated;
                              });
                            }}
                            onBlur={(e) => {
                              if (e.target.value === "") {
                                setNewOperation(prev => ({ ...prev, vendorRatePerUnit: 0 }));
                              }
                            }}
                            onFocus={(e) => e.target.select()}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none shadow-sm"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">Cost (₹)</label>
                          <input
                            type="number"
                            value={newOperation.cost}
                            readOnly
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-xs outline-none cursor-not-allowed"
                          />
                        </div>
                        <div className="md:col-span-6">
                          <button 
                            onClick={() => handleAddItem("operations")}
                            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md active:scale-[0.98]"
                          >
                            <Plus size={18} /> Add
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                  <table className="w-full text-[10px] text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/50">
                        <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-10">#</th>
                        <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Operation</th>
                        <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Mode</th>
                        <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Workstation/Vendor</th>
                        <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-center">Cycle (min)</th>
                        <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-center">Setup (min)</th>
                        <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right">Rate (₹)</th>
                        <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right">Cost (₹)</th>
                        <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Warehouse</th>
                        <th className="px-4 py-2.5 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-center">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {bomData.operations.map((row, index) => {
                        const isEditing = editingOperationId === row.id;
                        const isInHouse = row.type === "in-house";
                        
                        return (
                          <tr key={row.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-slate-400 font-medium">{index + 1}</td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <SearchableSelect
                                  name={`op-name-${row.id}`}
                                  id={`op-name-${row.id}`}
                                  aria-label="Operation Name"
                                  options={operationSelectOptions}
                                  value={row.operationName}
                                  onChange={(value) => {
                                    const selectedStage = rootCardStages.find(s => s.stage_name?.toLowerCase().trim() === value?.toLowerCase().trim());
                                    setBomData(prev => ({
                                      ...prev,
                                      operations: prev.operations.map(op => {
                                        if (op.id === row.id) {
                                          const updated = { 
                                            ...op, 
                                            operationName: value,
                                            hourlyRate: selectedStage ? (parseFloat(selectedStage.hourly_rate || selectedStage.hourlyRate) || 0) : op.hourlyRate,
                                            type: selectedStage?.stage_type || op.type
                                          };
                                          updated.cost = updateOperationCost(updated);
                                          return updated;
                                        }
                                        return op;
                                      })
                                    }));
                                  }}
                                  placeholder="Select operation"
                                  allowCustom={true}
                                />
                              ) : (
                                <span className="font-bold text-slate-700 dark:text-slate-200">{row.operationName}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <SearchableSelect
                                  name={`op-type-${row.id}`}
                                  id={`op-type-${row.id}`}
                                  aria-label="Execution Mode"
                                  options={operationTypeOptions}
                                  value={row.type}
                                  onChange={(value) => {
                                    updateTableRow("operations", row.id, "type", value);
                                    // Trigger cost update for type change
                                    const updatedRow = { ...row, type: value };
                                    updateTableRow("operations", row.id, "cost", updateOperationCost(updatedRow));
                                  }}
                                />
                              ) : (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${isInHouse ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"}`}>
                                  {row.type?.replace("-", " ")}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                isInHouse ? (
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
                                  <SearchableSelect
                                    name={`op-vendor-${row.id}`}
                                    id={`op-vendor-${row.id}`}
                                    aria-label="Vendor"
                                    options={vendorOptions}
                                    value={row.vendorName}
                                    onChange={(value) => updateTableRow("operations", row.id, "vendorName", value)}
                                    placeholder="Select vendor"
                                    allowCustom={true}
                                  />
                                )
                              ) : (
                                <span className="text-slate-600 dark:text-slate-400 font-medium">
                                  {isInHouse ? (row.workstation || "-") : (row.vendorName || "-")}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isInHouse ? (
                                isEditing ? (
                                  <input
                                    type="number"
                                    name={`op-cycle-${row.id}`}
                                    id={`op-cycle-${row.id}`}
                                    aria-label="Cycle Time"
                                    value={row.cycleTime}
                                    onChange={(e) => updateOperationRow(row.id, "cycleTime", e.target.value === "" ? "" : parseFloat(e.target.value))}
                                    onBlur={(e) => {
                                      if (e.target.value === "") {
                                        updateOperationRow(row.id, "cycleTime", 0);
                                      }
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    className="w-16 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs text-center focus:ring-2 focus:ring-purple-500/20 outline-none"
                                  />
                                ) : (
                                  <span className="text-slate-600 dark:text-slate-400">{row.cycleTime}</span>
                                )
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isInHouse ? (
                                isEditing ? (
                                  <input
                                    type="number"
                                    name={`op-setup-${row.id}`}
                                    id={`op-setup-${row.id}`}
                                    aria-label="Setup Time"
                                    value={row.setupTime}
                                    onChange={(e) => updateOperationRow(row.id, "setupTime", e.target.value === "" ? "" : parseFloat(e.target.value))}
                                    onBlur={(e) => {
                                      if (e.target.value === "") {
                                        updateOperationRow(row.id, "setupTime", 0);
                                      }
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    className="w-16 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs text-center focus:ring-2 focus:ring-purple-500/20 outline-none"
                                  />
                                ) : (
                                  <span className="text-slate-600 dark:text-slate-400">{row.setupTime}</span>
                                )
                              ) : (
                                <span className="text-slate-300 dark:text-slate-600">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isEditing ? (
                                isInHouse ? (
                                  <input
                                    type="number"
                                    name={`op-rate-${row.id}`}
                                    id={`op-rate-${row.id}`}
                                    aria-label="Hourly Rate"
                                    value={row.hourlyRate}
                                    onChange={(e) => updateOperationRow(row.id, "hourlyRate", e.target.value === "" ? "" : parseFloat(e.target.value))}
                                    onBlur={(e) => {
                                      if (e.target.value === "") {
                                        updateOperationRow(row.id, "hourlyRate", 0);
                                      }
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    className="w-20 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs text-right focus:ring-2 focus:ring-purple-500/20 outline-none"
                                  />
                                ) : (
                                  <input
                                    type="number"
                                    name={`op-vendor-rate-${row.id}`}
                                    id={`op-vendor-rate-${row.id}`}
                                    aria-label="Vendor Rate"
                                    value={row.vendorRatePerUnit}
                                    onChange={(e) => {
                                      const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                                      updateTableRow("operations", row.id, "vendorRatePerUnit", val);
                                      // Trigger cost update
                                      const updatedRow = { ...row, vendorRatePerUnit: val };
                                      updateTableRow("operations", row.id, "cost", updateOperationCost(updatedRow));
                                    }}
                                    onBlur={(e) => {
                                      if (e.target.value === "") {
                                        updateTableRow("operations", row.id, "vendorRatePerUnit", 0);
                                      }
                                    }}
                                    onFocus={(e) => e.target.select()}
                                    className="w-20 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs text-right focus:ring-2 focus:ring-purple-500/20 outline-none"
                                  />
                                )
                              ) : (
                                <span className="font-medium text-slate-600 dark:text-slate-400">
                                  ₹{(parseFloat(isInHouse ? row.hourlyRate : row.vendorRatePerUnit) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  name={`op-cost-${row.id}`}
                                  id={`op-cost-${row.id}`}
                                  aria-label="Operation Cost"
                                  value={row.cost}
                                  onChange={(e) => updateTableRow("operations", row.id, "cost", parseFloat(e.target.value) || 0)}
                                  className="w-24 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs text-right focus:ring-2 focus:ring-purple-500/20 outline-none"
                                />
                              ) : (
                                <span className="font-bold text-slate-900 dark:text-white">₹{(parseFloat(row.cost) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <SearchableSelect
                                  name={`op-wh-${row.id}`}
                                  id={`op-wh-${row.id}`}
                                  aria-label="Warehouse"
                                  options={warehouseOptions}
                                  value={isInHouse ? row.targetWarehouse : row.subcontractWarehouse}
                                  onChange={(value) => updateTableRow("operations", row.id, isInHouse ? "targetWarehouse" : "subcontractWarehouse", value)}
                                  placeholder="Select WH"
                                  allowCustom={true}
                                />
                              ) : (
                                <span className="text-slate-600 dark:text-slate-400 font-medium">
                                  {(isInHouse ? row.targetWarehouse : row.subcontractWarehouse) || "-"}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => setEditingOperationId(null)}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                      title="Save"
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button
                                      onClick={() => setEditingOperationId(null)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                      title="Cancel"
                                    >
                                      <X size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setEditingOperationId(row.id)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                      title="Edit Row"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => removeTableRow("operations", row.id)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                      title="Delete Row"
                                    >
                                      <Trash2 size={16} />
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
                  <div className="text-center py-6 text-slate-400 text-xs font-medium italic">
                    No operations added yet. Use the form above to add your first operation.
                  </div>
                )}
              </div>
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
              <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  <Plus size={24} className="text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Root Card Selected</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Please select a Root Card in Product Information to start adding scrap items.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Quick Add Form */}
                <div className="p-5 bg-orange-50/30 dark:bg-orange-900/10 rounded-2xl border border-orange-100/50 dark:border-orange-900/20">
                  <div className="flex items-center gap-2 mb-4 text-orange-700 dark:text-orange-400 font-bold text-[11px] uppercase tracking-wider">
                    <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                      <Plus size={12} />
                    </div>
                    Add Scrap Item
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
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
                        placeholder="Select"
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
                        placeholder="Select"
                        allowCustom={true}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">Input Qty</label>
                      <input
                        type="number"
                        value={newScrap.inputQty}
                        onChange={(e) => setNewScrap(prev => ({ ...prev, inputQty: e.target.value === "" ? "" : parseFloat(e.target.value) }))}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            setNewScrap(prev => ({ ...prev, inputQty: 0 }));
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">Loss %</label>
                      <input
                        type="number"
                        value={newScrap.lossPercent}
                        onChange={(e) => setNewScrap(prev => ({ ...prev, lossPercent: e.target.value === "" ? "" : parseFloat(e.target.value) }))}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            setNewScrap(prev => ({ ...prev, lossPercent: 0 }));
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-1.5 ml-1">Rate (₹)</label>
                      <input
                        type="number"
                        value={newScrap.rate}
                        onChange={(e) => setNewScrap(prev => ({ ...prev, rate: e.target.value === "" ? "" : parseFloat(e.target.value) }))}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            setNewScrap(prev => ({ ...prev, rate: 0 }));
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <button 
                        onClick={() => handleAddItem("scrapLoss")}
                        className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-slate-800/50">
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-10">#</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Item Details</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-center">Input Qty</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-center">Loss %</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right">Rate</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right">Amount</th>
                        <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {bomData.scrapLoss.map((row, index) => {
                        const isEditing = editingScrapId === row.id;
                        const amount = ((parseFloat(row.inputQty) || 0) * (parseFloat(row.rate) || 0) * (parseFloat(row.lossPercent) || 0)) / 100;

                        return (
                          <tr key={row.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-3 text-slate-400 font-medium">{index + 1}</td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <div className="space-y-2 min-w-[150px]">
                                  <SearchableSelect
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
                                    allowCustom={true}
                                  />
                                  <SearchableSelect
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
                                    allowCustom={true}
                                  />
                                </div>
                              ) : (
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-700 dark:text-slate-200">{row.name}</span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{row.itemCode || "-"}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={row.inputQty}
                                  onChange={(e) => updateTableRow("scrapLoss", row.id, "inputQty", e.target.value === "" ? "" : parseFloat(e.target.value))}
                                  onBlur={(e) => {
                                    if (e.target.value === "") {
                                      updateTableRow("scrapLoss", row.id, "inputQty", 0);
                                    }
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  className="w-16 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs text-center focus:ring-2 focus:ring-orange-500/20 outline-none"
                                />
                              ) : (
                                <span className="font-medium text-slate-600 dark:text-slate-400">{row.inputQty}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={row.lossPercent}
                                  onChange={(e) => updateTableRow("scrapLoss", row.id, "lossPercent", e.target.value === "" ? "" : parseFloat(e.target.value))}
                                  onBlur={(e) => {
                                    if (e.target.value === "") {
                                      updateTableRow("scrapLoss", row.id, "lossPercent", 0);
                                    }
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  className="w-16 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs text-center focus:ring-2 focus:ring-orange-500/20 outline-none"
                                />
                              ) : (
                                <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 rounded text-[10px] font-bold text-orange-600 dark:text-orange-400">{row.lossPercent}%</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={row.rate}
                                  onChange={(e) => updateTableRow("scrapLoss", row.id, "rate", e.target.value === "" ? "" : parseFloat(e.target.value))}
                                  onBlur={(e) => {
                                    if (e.target.value === "") {
                                      updateTableRow("scrapLoss", row.id, "rate", 0);
                                    }
                                  }}
                                  onFocus={(e) => e.target.select()}
                                  className="w-20 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs text-right focus:ring-2 focus:ring-orange-500/20 outline-none"
                                />
                              ) : (
                                <span className="font-medium text-slate-600 dark:text-slate-400">₹{(parseFloat(row.rate) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                              ₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => setEditingScrapId(null)}
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                      title="Save"
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button
                                      onClick={() => setEditingScrapId(null)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                      title="Cancel"
                                    >
                                      <X size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setEditingScrapId(row.id)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                      title="Edit Row"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => removeTableRow("scrapLoss", row.id)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                      title="Delete Row"
                                    >
                                      <Trash2 size={16} />
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
                  <div className="text-center py-6 text-slate-400 text-xs font-medium italic">
                    No scrap items added yet.
                  </div>
                )}
              </div>
            )}
          </AccordionSection>

          {/* Cost Summary Section */}
          <AccordionSection 
            title="Cost Summary" 
            section="costs"
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          >
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Material</p>
                <p className="text-xl font-black text-blue-900 dark:text-blue-100">₹{costs.materialCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-cyan-50/50 dark:bg-cyan-900/10 p-4 rounded-2xl border border-cyan-100 dark:border-cyan-900/30">
                <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1">Component</p>
                <p className="text-xl font-black text-cyan-900 dark:text-cyan-100">₹{costs.componentCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">Labour</p>
                <p className="text-xl font-black text-purple-900 dark:text-purple-100">₹{costs.operationCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-rose-50/50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Scrap Loss</p>
                <p className="text-xl font-black text-rose-900 dark:text-rose-100">-₹{costs.scrapLossCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-500/20">
                <p className="text-[10px] font-bold text-emerald-50 uppercase tracking-widest mb-1">Total Cost</p>
                <p className="text-xl font-black text-white">₹{costs.totalBOMCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Material Cost After Scrap:</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">₹{costs.materialCostAfterScrap.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">Cost Per Unit:</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{(costs.totalBOMCost / (bomData.productInfo.quantity || 1)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/design-engineer/bom/view")}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editMode ? "Update BOM" : "Create BOM"}
                    </>
                  )}
                </button>
                {editMode && (
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Copy size={18} />
                    Save as New Revision
                  </button>
                )}
              </div>
            </div>
          </AccordionSection>
        </div>
      </div>
    </div>
  );
};

export default CreateBOMPage;
