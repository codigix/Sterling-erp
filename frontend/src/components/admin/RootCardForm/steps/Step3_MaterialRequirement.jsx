import React, { useState, useEffect } from "react";
import { Package, Plus, Trash2, Edit2, Search, Tag, X } from "lucide-react";
import Input from "../../../ui/Input";
import FormSection from "../shared/FormSection";
import FormRow from "../shared/FormRow";
import AssigneeField from "../shared/AssigneeField";
import Button from "../../../ui/Button";
import Modal from "../../../ui/Modal";
import Select from "../../../ui/Select";
import SearchableSelect from "../../../ui/SearchableSelect";
import { useFormData, useRootCardContext } from "../hooks";
import axios from "../../../../utils/api";

export default function Step3_MaterialRequirement() {
  const { formData, updateField } = useFormData();
  const { state } = useRootCardContext();
  const [materials, setMaterials] = useState(formData.materials || []);
  
  useEffect(() => {
    if (formData.materials) {
      setMaterials(formData.materials);
    }
  }, [formData.materials]);
  
  // Inventory Data
  const [itemGroups, setItemGroups] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Forms
  const [newItem, setNewItem] = useState({
    itemCode: "",
    itemName: "",
    itemGroupId: "",
    category: "Raw Material",
    unit: "Nos",
    valuationRate: 0,
    sellingRate: 0,
    noOfCavity: 1,
    weightPerUnit: 0,
    weightUom: "kg",
    drawingNo: "",
    revision: "",
    materialGrade: "",
    eanBarcode: "",
    gstPercent: 0,
  });

  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
  });

  const [editingGroup, setEditingGroup] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingRequirementId, setEditingRequirementId] = useState(null);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const [groupsRes, itemsRes] = await Promise.all([
        axios.get("/inventory/item-groups"),
        axios.get("/inventory/materials")
      ]);
      setItemGroups(groupsRes.data);
      setInventoryItems(itemsRes.data.materials || []);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await axios.put(`/inventory/item-groups/${editingGroup.id}`, newGroup);
        setEditingGroup(null);
      } else {
        await axios.post("/inventory/item-groups", newGroup);
      }
      setNewGroup({ name: "", description: "" });
      fetchInventoryData();
    } catch (error) {
      alert(error.response?.data?.message || "Error processing item group");
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      await axios.delete(`/inventory/item-groups/${id}`);
      fetchInventoryData();
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting group");
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setNewGroup({ name: group.name, description: group.description || "" });
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      let finalGroupId = newItem.itemGroupId;
      
      // Check if it's a new group (string name instead of ID)
      // If itemGroupId is truthy and not found in existing groups, it's a custom name
      if (newItem.itemGroupId && !itemGroups.find(g => String(g.id) === String(newItem.itemGroupId))) {
        try {
          const groupRes = await axios.post("/inventory/item-groups", { name: newItem.itemGroupId });
          finalGroupId = groupRes.data.id;
        } catch (groupError) {
          console.error("Error creating new group:", groupError);
          // If group already exists (maybe fetched failed earlier), we might get a 400. 
          // For now, let's assume it's new.
        }
      }

      const itemData = { ...newItem, itemGroupId: finalGroupId };

      if (editingItem) {
        await axios.put(`/inventory/materials/${editingItem.id}`, itemData);
        
        // Update item in project materials if it was triggered from the table edit
        const updatedMaterials = materials.map(m => {
          if (m.materialId === editingItem.id || (editingRequirementId && m.id === editingRequirementId)) {
            return { 
              ...m, 
              name: newItem.itemName, 
              itemCode: newItem.itemCode, 
              unit: newItem.unit, 
              category: newItem.category,
              itemGroupId: finalGroupId,
              gstPercent: newItem.gstPercent
            };
          }
          return m;
        });
        setMaterials(updatedMaterials);
        updateField("materials", updatedMaterials);
        setEditingItem(null);
        setEditingRequirementId(null);
        setShowItemModal(false);
      } else {
        const response = await axios.post("/inventory/materials", itemData);
        const materialId = response.data.materialId;
        
        // Automatically add to project materials
        const newEntry = {
          id: Date.now() + Math.random(),
          materialId: materialId,
          name: newItem.itemName,
          category: newItem.category,
          quantity: 1, // Default quantity
          unit: newItem.unit,
          itemCode: newItem.itemCode,
          itemGroupId: finalGroupId,
          gstPercent: newItem.gstPercent
        };
        
        const updated = [...materials, newEntry];
        setMaterials(updated);
        updateField("materials", updated);
        setShowItemModal(false);
      }
      
      setNewItem({
        itemCode: "",
        itemName: "",
        itemGroupId: "",
        category: "Raw Material",
        unit: "Nos",
        valuationRate: 0,
        sellingRate: 0,
        noOfCavity: 1,
        weightPerUnit: 0,
        weightUom: "kg",
        drawingNo: "",
        revision: "",
        materialGrade: "",
        eanBarcode: "",
        gstPercent: 0,
      });
      fetchInventoryData();
    } catch (error) {
      alert(error.response?.data?.message || "Error processing item");
    }
  };

  const handleEditRequirement = (material) => {
    const item = inventoryItems.find(i => i.id === material.materialId);
    if (!item) {
      alert("Material details not found in inventory");
      return;
    }
    
    setEditingItem(item);
    setEditingRequirementId(material.id);
    setNewItem({
      itemCode: item.itemCode,
      itemName: item.itemName,
      itemGroupId: item.itemGroupId || "",
      category: item.category || "Raw Material",
      unit: item.unit || "Nos",
      valuationRate: item.valuationRate || 0,
      sellingRate: item.sellingRate || 0,
      noOfCavity: item.noOfCavity || 1,
      weightPerUnit: item.weightPerUnit || 0,
      weightUom: item.weightUom || "",
      drawingNo: item.drawingNo || "",
      revision: item.revision || "",
      materialGrade: item.materialGrade || "",
      eanBarcode: item.eanBarcode || "",
      gstPercent: item.gstPercent || 0,
    });
    setShowItemModal(true);
  };

  const generateItemCode = (name, groupId) => {
    if (!name) return "";
    
    let prefix = "ITEM";
    // If groupId is a name (for new groups) or an ID (for existing groups)
    const group = itemGroups.find(g => String(g.id) === String(groupId)) || { name: String(groupId) };
    
    if (group && group.name) {
      const groupName = group.name.toLowerCase();
      if (groupName.includes("raw material") || groupName.includes("rm")) prefix = "RM";
      else if (groupName.includes("finished good") || groupName.includes("fg")) prefix = "FG";
      else if (groupName.includes("sub assemblies") || groupName.includes("sub-assemblies") || groupName.includes("s-")) prefix = "S";
      else if (groupName.includes("scrap")) prefix = "S";
      else if (groupName.includes("component")) prefix = "COMP";
      else if (groupName.includes("consumable")) prefix = "CON";
    }

    const slug = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "") // Remove non-alphanumeric characters
      .slice(0, 20); // Limit slug length

    return `${prefix}-${slug}`;
  };

  const handleItemNameChange = (name) => {
    setNewItem(prev => {
      const updates = { ...prev, itemName: name };
      // Detect if the current code was likely auto-generated or is empty
      const currentPrefix = prev.itemCode.split('-')[0];
      const autoPrefixes = ["RM", "FG", "ITEM", "COMP", "CON", "S"];
      const isAutoGenerated = !prev.itemCode || autoPrefixes.includes(currentPrefix);
      
      if (isAutoGenerated) {
        updates.itemCode = generateItemCode(name, prev.itemGroupId);
      }
      return updates;
    });
  };

  const handleGroupChange = (groupId) => {
    setNewItem(prev => {
      const updates = { ...prev, itemGroupId: groupId };
      const currentPrefix = prev.itemCode.split('-')[0];
      const autoPrefixes = ["RM", "FG", "ITEM", "COMP", "CON", "S"];
      const isAutoGenerated = !prev.itemCode || autoPrefixes.includes(currentPrefix);
      
      if (isAutoGenerated && prev.itemName) {
        updates.itemCode = generateItemCode(prev.itemName, groupId);
      }
      return updates;
    });
  };

  const removeMaterial = (id) => {
    const updated = materials.filter(m => m.id !== id);
    setMaterials(updated);
    updateField("materials", updated);
  };

  return (
    <div className="space-y-6">
      <AssigneeField
        stepType="material_requirement"
        formData={state.formData}
        updateField={updateField}
        employees={state.employees}
      />
      
      <div className="flex flex-wrap items-center gap-4 py-2">
        <Button 
          onClick={() => {
            setEditingItem(null);
            setEditingRequirementId(null);
            setShowItemModal(true);
          }}
          variant="secondary"
          className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm"
          icon={Plus}
        >
          Add Item
        </Button>
        <Button 
          onClick={() => setShowGroupModal(true)}
          variant="secondary"
          className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          icon={Tag}
        >
          Manage Item Groups
        </Button>
      </div>

      {materials.length > 0 ? (
        <FormSection
          title="Project Material Requirements"
          subtitle="Specific materials defined for this project"
          icon={Package}
        >
          <div className="overflow-x-auto -mx-4 md:mx-0 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Item Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    UOM
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    GST %
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Req. Qty
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {materials.map(material => (
                  <tr key={material.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 text-slate-900 font-mono text-xs">
                      {material.itemCode}
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-bold">
                      {material.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {itemGroups.find(g => g.id === material.itemGroupId)?.name || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {material.unit}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {Number(material.gstPercent || 0).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-bold">
                      {material.quantity}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditRequirement(material)}
                          className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-sm transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => removeMaterial(material.id)}
                          className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm transition-all"
                          title="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FormSection>
      ) : (
        <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Package size={32} className="text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-semibold">No Materials Added</h3>
          <p className="text-slate-500 text-sm mt-1">Use "Add Item" to add requirements for this project</p>
        </div>
      )}

      {/* Create Item Modal */}
      <Modal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        size="xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Package size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {editingItem ? "Edit Item" : "Add New Item"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Define item specifications for this project</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setShowItemModal(false);
              setEditingItem(null);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreateItem} className="bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-6 max-h-[70vh] overflow-y-auto modal-body-scroll">
            <div className="space-y-6">
              {/* Main Item Specification Grid */}
              <div className="space-y-4">
                <FormRow cols={3}>
                  <Input
                    label="Item Code *"
                    placeholder="Auto-generated or enter to fetch"
                    required
                    value={newItem.itemCode}
                    onChange={(e) => setNewItem({...newItem, itemCode: e.target.value})}
                  />
                  <Input
                    label="Item Name *"
                    placeholder="Enter item name (item code auto-generated)"
                    required
                    value={newItem.itemName}
                    onChange={(e) => handleItemNameChange(e.target.value)}
                  />
                  <SearchableSelect
                    label="Item Group *"
                    value={newItem.itemGroupId}
                    onChange={(value) => handleGroupChange(value)}
                    options={itemGroups.map(g => ({ value: g.id, label: g.name }))}
                    allowCustom={true}
                    placeholder="Select or type new group"
                  />
                </FormRow>

                <FormRow cols={3}>
                  <SearchableSelect
                    label="Default UOM *"
                    value={newItem.unit}
                    onChange={(value) => setNewItem({...newItem, unit: value})}
                    options={[
                      { value: "Nos", label: "Nos" },
                      { value: "kg", label: "kg" },
                      { value: "meters", label: "meters" },
                      { value: "Set", label: "Set" }
                    ]}
                    allowCustom={true}
                    placeholder="Select or type UOM"
                  />
                  <Input
                    label="Valuation Rate"
                    type="number"
                    value={newItem.valuationRate}
                    onChange={(e) => setNewItem({...newItem, valuationRate: e.target.value})}
                  />
                  <Input
                    label="Selling Rate"
                    type="number"
                    value={newItem.sellingRate}
                    onChange={(e) => setNewItem({...newItem, sellingRate: e.target.value})}
                  />
                </FormRow>

                <FormRow cols={3}>
                  <Input
                    label="No. of Cavity (for mould items)"
                    type="number"
                    value={newItem.noOfCavity}
                    onChange={(e) => setNewItem({...newItem, noOfCavity: e.target.value})}
                  />
                  <Input
                    label="Weight per Unit"
                    type="number"
                    step="0.001"
                    placeholder="0.00"
                    value={newItem.weightPerUnit}
                    onChange={(e) => setNewItem({...newItem, weightPerUnit: e.target.value})}
                  />
                  <SearchableSelect
                    label="Weight UOM"
                    value={newItem.weightUom}
                    onChange={(value) => setNewItem({...newItem, weightUom: value})}
                    options={[
                      { value: "kg", label: "kg" },
                      { value: "gm", label: "gm" },
                      { value: "ton", label: "ton" }
                    ]}
                    allowCustom={true}
                    placeholder="Select or type weight UOM"
                  />
                </FormRow>

                <FormRow cols={3}>
                  <Input
                    label="Drawing No (Optional)"
                    placeholder="Enter drawing number"
                    value={newItem.drawingNo}
                    onChange={(e) => setNewItem({...newItem, drawingNo: e.target.value})}
                  />
                  <Input
                    label="Revision (Optional)"
                    placeholder="Enter revision"
                    value={newItem.revision}
                    onChange={(e) => setNewItem({...newItem, revision: e.target.value})}
                  />
                  <Input
                    label="Material Grade (Optional)"
                    placeholder="Enter material grade"
                    value={newItem.materialGrade}
                    onChange={(e) => setNewItem({...newItem, materialGrade: e.target.value})}
                  />
                </FormRow>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                {editingItem && (
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => {
                      setEditingItem(null);
                      setEditingRequirementId(null);
                      setNewItem({
                        itemCode: "",
                        itemName: "",
                        itemGroupId: "",
                        category: "Raw Material",
                        unit: "Nos",
                        valuationRate: 0,
                        sellingRate: 0,
                        noOfCavity: 1,
                        weightPerUnit: 0,
                        weightUom: "kg",
                        drawingNo: "",
                        revision: "",
                        materialGrade: "",
                        eanBarcode: "",
                        gstPercent: 0,
                      });
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="px-10 font-bold shadow-lg shadow-blue-500/20"
                  icon={editingItem ? Edit2 : Plus}
                >
                  {editingItem ? "Update Item" : "Add Material"}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setShowItemModal(false);
                setEditingItem(null);
              }}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </form>
      </Modal>

      {/* Item Group Modal */}
      <Modal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        size="default"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Tag size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage Item Groups</h2>
          </div>
          <button 
            onClick={() => setShowGroupModal(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 bg-white dark:bg-slate-900">
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              {editingGroup ? "Edit Group" : "Add New Group"}
            </h4>
            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all">
              <Input
                label="Group Name"
                placeholder="e.g. Raw Materials, Finished Goods"
                required
                value={newGroup.name}
                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                className="w-full bg-white dark:bg-slate-900"
              />
              <Input
                label="Description"
                placeholder="Enter group description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                className="w-full bg-white dark:bg-slate-900"
              />
              <div className="flex gap-2 mt-4">
                <Button 
                  type="submit" 
                  variant="primary"
                  className="flex-1 font-bold shadow-lg shadow-blue-500/10"
                  icon={editingGroup ? Edit2 : Plus}
                >
                  {editingGroup ? "Update Group" : "Create Group"}
                </Button>
                {editingGroup && (
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={() => {
                      setEditingGroup(null);
                      setNewGroup({ name: "", description: "" });
                    }}
                    className="font-bold"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </form>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Existing Groups
            </h4>
            <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3.5 font-bold uppercase tracking-tight">Name</th>
                      <th className="px-6 py-3.5 font-bold uppercase tracking-tight">Description</th>
                      <th className="px-6 py-3.5 font-bold uppercase tracking-tight text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {itemGroups.length > 0 ? (
                      itemGroups.map(group => (
                        <tr key={group.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                            {group.name}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {group.description || <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditGroup(group)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteGroup(group.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-10 text-center text-slate-400 italic">
                          No groups created yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

