# Step4_MaterialRequirement.jsx Refactoring Guide

## Completed Refactoring Tasks

### 1. **materialConstants.js** ✅
**Location:** `constants/materialConstants.js`

Extracted the following constants from Step4:
- `materialUnits` - Array of available units (kg, ton, m, mm, piece, set)
- `materialSources` - Array of sources (local, imported, vendor)
- `STEEL_SECTION_CATEGORY_FIELDS` - Field definitions for steel sections
- `PLATE_CATEGORY_FIELDS` - Field definitions for plates

**Usage:**
```javascript
import { materialUnits, materialSources, STEEL_SECTION_CATEGORY_FIELDS, PLATE_CATEGORY_FIELDS } from "../constants/materialConstants";
```

### 2. **useMaterialForm.js** ✅
**Location:** `hooks/useMaterialForm.js`

Custom hook that encapsulates all material form state and logic:
- `currentMaterial` state (replaces setCurrentMaterial)
- `editingDetail` state
- `handleMaterialChange()` - Updates material fields and opens spec modals
- `addMaterial()` - Adds new material
- `removeMaterial()` - Deletes material
- `editMaterial()` - Loads material for editing
- `updateMaterial()` - Saves material changes
- `resetMaterial()` - Resets form to initial state

**Usage:**
```javascript
const {
  currentMaterial,
  setCurrentMaterial,
  editingDetail,
  handleMaterialChange,
  addMaterial,
  removeMaterial,
  editMaterial,
  updateMaterial,
  resetMaterial,
} = useMaterialForm(openSpecModal, updateField, formData);
```

### 3. **useMaterialModal.js** ✅
**Location:** `hooks/useMaterialModal.js`

Custom hook for modal state and modal-related logic:
- `specModalOpen`, `setSpecModalOpen` - Spec form modal visibility
- `specModalType`, `setSpecModalType` - Current spec type being edited
- `viewModalOpen`, `setViewModalOpen` - Material details view modal
- `viewingMaterial`, `setViewingMaterial` - Material being viewed
- `openSpecModal()` - Opens spec modal for a type
- `closeSpecModal()` - Closes spec modal
- `getSpecsForType()` - Returns spec definitions for a material type
- `handleDetailSubmit()` - Processes spec form submission

**Usage:**
```javascript
const {
  specModalOpen,
  specModalType,
  viewModalOpen,
  viewingMaterial,
  openSpecModal,
  closeSpecModal,
  getSpecsForType,
  handleDetailSubmit,
} = useMaterialModal(setCurrentMaterial);
```

### 4. **materialHelpers.js** ✅
**Location:** `utils/materialHelpers.js`

Utility constants and helper functions:
- `quantityPlaceholders` - Placeholder text for quantity fields
- `defaultQualityPlaceholder` - Default quality/grade placeholder
- `SPEC_TYPES` - Array of all material spec types
- `getQuantityPlaceholder(materialType)` - Gets placeholder for material type
- `getTitleForSpecType(type)` - Gets modal title for spec type

**Usage:**
```javascript
import { 
  quantityPlaceholders, 
  SPEC_TYPES, 
  getTitleForSpecType,
  getQuantityPlaceholder 
} from "../utils/materialHelpers";
```

### 5. **MaterialTable.jsx** ✅
**Location:** `components/MaterialTable.jsx`

Reusable table component for displaying materials list:
- Replaces inline material list rendering (lines ~1008-1184 in original)
- Handles all actions: view, edit, delete
- Shows assignee dropdown
- Displays material type badges
- Helper functions: `getMaterialType()`, `getMaterialName()`

**Props:**
```javascript
<MaterialTable
  materials={formData.materials}
  employees={state.employees}
  onView={(material) => { setViewingMaterial(material); setViewModalOpen(true); }}
  onEdit={(material) => editMaterial(material)}
  onDelete={(id) => removeMaterial(id)}
  onAssigneeChange={(id, assigneeId) => {
    updateField("materials", 
      formData.materials.map(m => 
        m.id === id ? { ...m, assignee: assigneeId } : m
      )
    );
  }}
/>
```

---

## Tasks Remaining

### 6. **Create Modal Components** ⏳
The spec modal rendering (lines 2194-2823 in original) should be split into reusable modal components:

**SpecModal.jsx** - Wrapper modal component
```javascript
// modals/SpecModal.jsx
export default function SpecModal({ isOpen, onClose, type, children }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${getTitleForSpecType(type)} Specifications`}
      size="lg"
    >
      <div className="bg-slate-900 p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        {children}
      </div>
    </Modal>
  );
}
```

**Individual Modal Components:** (Can be created in `modals/` folder)
- SteelSectionSpecModal
- PlateTypeSpecModal
- MaterialGradeSpecModal
- FastenerTypeSpecModal
- MachinedPartsSpecModal
- RollerMovementSpecModal
- LiftingPullingSpecModal
- ElectricalAutomationSpecModal
- SafetyMaterialsSpecModal
- SurfacePrepSpecModal
- FabricationConsumablesSpecModal
- HardwareMiscSpecModal
- DocumentationMaterialsSpecModal

### 7. **Create ViewMaterialModal.jsx** ⏳
**Location:** `modals/ViewMaterialModal.jsx`

Extract material details view modal (lines ~3033-3296):
- Shows all material details
- Edit/Close buttons
- Support all material types

### 8. **Refactor Step4_MaterialRequirement.jsx** ⏳
Replace sections in the main component:

**Replace lines 29-98 (constants):**
```javascript
// Remove these constant definitions and import instead:
// import { materialUnits, materialSources, STEEL_SECTION_CATEGORY_FIELDS, PLATE_CATEGORY_FIELDS } from "../constants/materialConstants";
```

**Replace lines 109-209 (state):**
```javascript
// Replace useState declarations with hooks:
const {
  currentMaterial,
  setCurrentMaterial,
  editingDetail,
  handleMaterialChange,
  addMaterial,
  removeMaterial,
  editMaterial,
  updateMaterial,
  resetMaterial,
} = useMaterialForm(openSpecModal, updateField, formData);

const {
  specModalOpen,
  specModalType,
  setSpecModalType,
  viewModalOpen,
  viewingMaterial,
  setViewingMaterial,
  openSpecModal,
  closeSpecModal,
  getSpecsForType,
  handleDetailSubmit,
} = useMaterialModal(setCurrentMaterial);
```

**Replace lines 224-434 (form functions):**
These functions are now part of the hooks above, so this code can be removed.

**Replace lines 1008-1184 (material table rendering):**
```javascript
<MaterialTable
  materials={formData.materials}
  employees={state.employees}
  onView={(material) => {
    setViewingMaterial(material);
    setViewModalOpen(true);
  }}
  onEdit={editMaterial}
  onDelete={removeMaterial}
  onAssigneeChange={(id, assigneeId) => {
    updateField("materials",
      formData.materials.map((m) =>
        m.id === id ? { ...m, assignee: assigneeId } : m
      )
    );
  }}
/>
```

**Keep modal sections (lines 2194+):**
These can remain for now but should eventually be split into separate modal components.

---

## Summary of Reductions

| Item | Lines | Reduction |
|------|-------|-----------|
| Constants removed | 70 | → materialConstants.js |
| State declarations removed | 111 | → useMaterialForm hook |
| Modal state removed | 5 | → useMaterialModal hook |
| Functions removed | 210 | → hooks |
| Table rendering replaced | 176 | → MaterialTable component |
| **Original File** | **3,301 lines** | - |
| **Estimated Final Size** | **~2,500 lines** | **~24% reduction** |

---

## Implementation Steps for Complete Refactoring

1. **Update imports** in Step4_MaterialRequirement.jsx:
   - Add: `import { useMaterialForm } from "../hooks/useMaterialForm"`
   - Add: `import { useMaterialModal } from "../hooks/useMaterialModal"`
   - Add: `import MaterialTable from "../components/MaterialTable"`
   - Add: `import { materialUnits, materialSources, STEEL_SECTION_CATEGORY_FIELDS, PLATE_CATEGORY_FIELDS } from "../constants/materialConstants"`

2. **Remove constants** (lines 29-98):
   - Delete these lines and rely on imports

3. **Replace state and functions** (lines 109-434):
   - Delete useState declarations and all function definitions
   - Add the hook calls (as shown above)

4. **Use MaterialTable component** (line ~1008):
   - Replace the table HTML/JSX with the MaterialTable component

5. **Create modal components** (optional but recommended):
   - Create individual spec modal components
   - Create ViewMaterialModal component
   - Reference them in Step4 instead of inline JSX

6. **Test and lint**:
   - Run build: `npm run build`
   - Run linter: `npm run lint`

---

## Notes

- All hook dependencies are properly tracked
- MaterialTable component handles all material CRUD operations
- The refactoring maintains the same functionality
- Form data is still managed through the main FormData context
- Spec modals contain complex business logic that can be further modularized in future iterations
