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

const CreateBOMPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [workstations, setWorkstations] = useState([]);
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
      salesOrderId: searchParams.get("salesOrderId") || null,
    },
    components: [],
    materials: [],
    operations: [],
    scrapLoss: [],
  });

  const [costs, setCosts] = useState({
    materialCost: 0,
    operationCost: 0,
    scrapLossCost: 0,
    materialCostAfterScrap: 0,
    totalBOMCost: 0,
  });

  const UOMOptions = ["Kg", "pcs", "m", "l", "set", "Box"];
  const ItemGroupOptions = ["Raw Material", "Component", "Sub-assembly", "Finished Good"];
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
        const [materialsRes, facilitiesRes] = await Promise.all([
          axios.get("/inventory/materials"),
          axios.get("/inventory/facilities")
        ]);
        
        setMaterials(materialsRes.data.materials || []);
        const facilitiesList = facilitiesRes.data.facilities || [];
        setWorkstations(facilitiesList);
        
        // Extract unique warehouses from materials or use default
        const uniqueWarehouses = [...new Set(materialsRes.data.materials?.map(m => m.warehouse).filter(Boolean) || [])];
        setWarehouses(uniqueWarehouses.length > 0 ? uniqueWarehouses : ["Main Warehouse", "Secondary Warehouse"]);
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

  const productNameOptions = materials.map((m) => ({
    label: m.itemName,
    value: m.itemName,
  }));

  const itemCodeOptions = materials.map((m) => ({
    label: m.itemCode,
    value: m.itemCode,
  }));

  const itemGroupSelectOptions = ItemGroupOptions.map((group) => ({
    label: group,
    value: group,
  }));

  const workstationOptions = workstations.map((w) => ({
    label: w.name,
    value: w.name,
  }));

  const warehouseOptions = warehouses.map((w) => ({
    label: w,
    value: w,
  }));

  const operationTypeOptions = [
    { label: "In-house", value: "in-house" },
    { label: "Outsource", value: "outsource" }
  ];

  const operationSelectOptions = OperationOptions.map((op) => ({
    label: op,
    value: op,
  }));

  const UOMSelectOptions = UOMOptions.map((uom) => ({
    label: uom,
    value: uom,
  }));

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
    let operationCost = 0;
    let scrapLossCost = 0;

    bomData.materials.forEach((m) => {
      materialCost += (m.quantity || 0) * (m.rate || 0);
    });

    bomData.operations.forEach((o) => {
      operationCost += o.cost || 0;
    });

    bomData.scrapLoss.forEach((s) => {
      scrapLossCost += ((s.inputQty || 0) * (s.rate || 0) * (s.lossPercent || 0)) / 100;
    });

    const materialCostAfterScrap = materialCost - scrapLossCost;
    const totalBOMCost = materialCostAfterScrap + operationCost;

    setCosts({
      materialCost,
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

      await axios.post("/engineering/bom/comprehensive", payload);

      Swal.fire({
        icon: "success",
        title: "BOM Created Successfully",
        text: "Your BOM has been saved!",
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
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
      >
        <div className="flex items-center gap-2">
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
        </div>
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
      </button>
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create BOM</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">Bill of Materials</p>
          </div>
        </div>

        {/* Accordions Container */}
        <div className=" p-3">
          {/* Product Information Section */}
          <AccordionSection title="Product Information" section="product">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <div>
                <SearchableSelect
                  label="Product Name *"
                  options={productNameOptions}
                  value={bomData.productInfo.productName}
                  onChange={(value) =>
                    setBomData({
                      ...bomData,
                      productInfo: { ...bomData.productInfo, productName: value },
                    })
                  }
                  placeholder="Select or type product name"
                  disabled={loadingMaterials}
                />
              </div>
              <div>
                <SearchableSelect
                  label="Item Code"
                  options={itemCodeOptions}
                  value={bomData.productInfo.itemCode}
                  onChange={(value) =>
                    setBomData({
                      ...bomData,
                      productInfo: { ...bomData.productInfo, itemCode: value },
                    })
                  }
                  placeholder="Select or type item code"
                  disabled={loadingMaterials}
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
            <div className="mt-2 flex gap-3">
              <label className="flex items-center gap-1 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={bomData.productInfo.isActive}
                  onChange={(e) =>
                    setBomData({
                      ...bomData,
                      productInfo: { ...bomData.productInfo, isActive: e.target.checked },
                    })
                  }
                />
                <span className="text-slate-700 dark:text-slate-300">Active</span>
              </label>
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
                <span className="text-slate-700 dark:text-slate-300">Default</span>
              </label>
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
                          onChange={(value) => updateTableRow("components", row.id, "componentCode", value)}
                          placeholder="Select code"
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
                          onChange={(value) => updateTableRow("materials", row.id, "itemName", value)}
                          placeholder="Select item"
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
                        />
                      </td>
                      <td className="px-2 py-1">
                        <SearchableSelect
                          options={workstationOptions}
                          value={row.workstation}
                          onChange={(value) => updateTableRow("operations", row.id, "workstation", value)}
                          placeholder="Select workstation"
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded border border-blue-200 dark:border-blue-700">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Material</p>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">₹{costs.materialCost.toFixed(2)}</p>
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
            {saving ? "Saving..." : "Create BOM"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBOMPage;
