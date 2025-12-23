import React, { useState } from 'react';
import { FileText, Plus, Edit2, Trash2, Search, Save, X } from 'lucide-react';
import Card, { CardContent, CardTitle, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const MATERIAL_SPECIFICATIONS = [
  {
    id: 1,
    materialType: 'Steel Sections',
    materialName: 'ISMB 100mm',
    grade: 'EN8',
    quantity: '500 Units',
    qualityStandard: 'ISO 3977',
    specs: {
      density: '7.85 g/cm³',
      tensileStrength: '400-500 MPa',
      yieldStrength: '250 MPa',
      thickness: '10mm',
      width: '100mm',
    },
    vendor: 'Steel Co. Ltd',
    cost: '₹150 per unit',
    leadTime: '5-7 days',
    status: 'Active',
  },
  {
    id: 2,
    materialType: 'Plates',
    materialName: 'MS Plate 12mm',
    grade: 'IS 2062',
    quantity: '1000 Units',
    qualityStandard: 'ISO 630',
    specs: {
      density: '7.85 g/cm³',
      tensileStrength: '380-500 MPa',
      yieldStrength: '245 MPa',
      thickness: '12mm',
      surfaceFinish: 'Hot rolled',
    },
    vendor: 'Plate Industries',
    cost: '₹120 per unit',
    leadTime: '3-5 days',
    status: 'Active',
  },
];

const MaterialSpecificationsPage = () => {
  const [materials, setMaterials] = useState(MATERIAL_SPECIFICATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(null);

  const filteredMaterials = materials.filter(m =>
    m.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.materialType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (material) => {
    setFormData({ ...material });
    setEditingId(material.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      setMaterials(materials.filter(m => m.id !== id));
    }
  };

  const handleSave = () => {
    if (editingId) {
      setMaterials(materials.map(m => m.id === editingId ? formData : m));
    } else {
      setMaterials([...materials, { ...formData, id: Date.now() }]);
    }
    setShowForm(false);
    setFormData(null);
    setEditingId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData(null);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <FileText className="text-blue-600" size={36} />
              Material Specifications
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs ">
              Manage material types, quality standards, specifications, and vendor details
            </p>
          </div>
          <Button
            onClick={() => {
              setFormData({
                materialType: '',
                materialName: '',
                grade: '',
                quantity: '',
                qualityStandard: '',
                vendor: '',
                cost: '',
                leadTime: '',
                status: 'Active',
                specs: {},
              });
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Material
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Search className="text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by material name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-0 focus:outline-none bg-transparent text-slate-900 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMaterials.map(material => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{material.materialName}</CardTitle>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {material.materialType}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    material.status === 'Active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {material.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Key Information */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Grade</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {material.grade}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Quality Standard</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {material.qualityStandard}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Quantity Required</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {material.quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Vendor</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {material.vendor}
                    </p>
                  </div>
                </div>

                {/* Specifications */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white uppercase mb-2">
                    Technical Specifications
                  </p>
                  <div className="space-y-1">
                    {Object.entries(material.specs).map(([key, value]) => (
                      <div key={key} className="text-xs flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-slate-900 dark:text-white font-medium">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Procurement Details */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Cost</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {material.cost}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Lead Time</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {material.leadTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    onClick={() => handleEdit(material)}
                    variant="secondary"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(material.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                No materials found matching your search
              </p>
            </CardContent>
          </Card>
        )}

        {/* Form Modal */}
        {showForm && formData && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                <CardTitle>
                  {editingId ? 'Edit Material Specification' : 'Add New Material'}
                </CardTitle>
                <button onClick={handleCancel} className="text-slate-600 hover:text-slate-900">
                  <X size={24} />
                </button>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Material Type"
                    value={formData.materialType}
                    onChange={(e) =>
                      setFormData({ ...formData, materialType: e.target.value })
                    }
                    placeholder="e.g., Steel Sections, Plates"
                  />
                  <Input
                    label="Material Name"
                    value={formData.materialName}
                    onChange={(e) =>
                      setFormData({ ...formData, materialName: e.target.value })
                    }
                    placeholder="e.g., ISMB 100mm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Grade"
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({ ...formData, grade: e.target.value })
                    }
                    placeholder="e.g., EN8"
                  />
                  <Input
                    label="Quality Standard"
                    value={formData.qualityStandard}
                    onChange={(e) =>
                      setFormData({ ...formData, qualityStandard: e.target.value })
                    }
                    placeholder="e.g., ISO 3977"
                  />
                </div>

                <Input
                  label="Quantity Required"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="e.g., 500 Units"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Vendor"
                    value={formData.vendor}
                    onChange={(e) =>
                      setFormData({ ...formData, vendor: e.target.value })
                    }
                    placeholder="e.g., Steel Co. Ltd"
                  />
                  <Input
                    label="Cost"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                    placeholder="e.g., ₹150 per unit"
                  />
                </div>

                <Input
                  label="Lead Time"
                  value={formData.leadTime}
                  onChange={(e) =>
                    setFormData({ ...formData, leadTime: e.target.value })
                  }
                  placeholder="e.g., 5-7 days"
                />

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialSpecificationsPage;
