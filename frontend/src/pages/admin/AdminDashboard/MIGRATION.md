# Migration Guide: Refactoring AdminDashboard

## What Has Been Done

### ✅ Extracted and Modularized:

#### 1. **Departments Tab**
   - File: `components/DepartmentsTab.jsx`
   - Data: `data/departmentsData.json`
   - Reduced lines: 260 lines → 175 lines

#### 2. **Vendors Tab**
   - File: `components/VendorsTab.jsx`
   - Data: `data/vendorsData.json`
   - Reduced lines: 380 lines → 260 lines

#### 3. **Materials Tab**
   - File: `components/MaterialsTab.jsx`
   - Data: `data/materialsData.json`, `movementLogsData.json`
   - Reduced lines: 450+ lines → 300 lines

#### 4. **Utility Functions**
   - File: `utils/colorHelpers.js`
   - Centralized: 15+ color/status helper functions
   - Reusable across all components

### 📦 Data Files Created:
- `data/departmentsData.json` - 6 department records
- `data/vendorsData.json` - 6 vendor records  
- `data/materialsData.json` - 6 material records
- `data/movementLogsData.json` - 5 movement log records
- `data/employeesData.json` - 6 employee records
- `data/departmentStatsData.json` - 6 department statistics

## How to Update the Main AdminDashboard.jsx

### Step 1: Update Imports

Replace the current imports with modularized versions:

```javascript
// OLD (current)
import { OverviewTab, ProjectsTab, DepartmentsTab } from "../../components/admin/...";

// NEW (modularized)
import { DepartmentsTab, VendorsTab, MaterialsTab } from "./AdminDashboard/components";
import { getStatusColor, getQualityColor } from "./AdminDashboard/utils/colorHelpers";
```

### Step 2: Replace Inline Tabs

For each tab that's been refactored, replace the function definition with import:

```javascript
// OLD (remove this entire function)
const DepartmentsTab = () => {
  const departmentData = [
    { name: "Engineering", ... },
    // ... 260+ lines
  ];
  // ... rest of component
};

// NEW (add import at the top)
import DepartmentsTab from "./AdminDashboard/components/DepartmentsTab";
```

### Step 3: Keep Non-Extracted Tabs (For Now)

These tabs are still in the original file and will be extracted later:
- OverviewTab
- ProjectsTab
- ProductionTab
- EmployeesTab
- ResourcesTab
- SalesOrdersTab

Continue using them as is, or refactor individually.

### Step 4: Remove Duplicate Helper Functions

Since all color/status helpers are now in `utils/colorHelpers.js`, remove:

```javascript
// REMOVE these from AdminDashboard.jsx
const getStatusColor = (status) => { ... };
const getQualityColor = (rating) => { ... };
const getMaterialStatusColor = (status) => { ... };
const getMovementTypeColor = (type) => { ... };
const getStockLevel = (current, min, max) => { ... };
// ... and all other helper functions
```

And import them instead:

```javascript
import {
  getStatusColor,
  getQualityColor,
  getMaterialStatusColor,
  getMovementTypeColor,
  getStockLevel,
} from "./AdminDashboard/utils/colorHelpers";
```

## Implementation Checklist

- [ ] Backup the original AdminDashboard.jsx
- [ ] Update imports at the top of the file
- [ ] Remove DepartmentsTab function definition
- [ ] Remove VendorsTab function definition
- [ ] Remove MaterialsTab function definition
- [ ] Remove all color/status helper functions
- [ ] Import helpers from utils/colorHelpers.js
- [ ] Test all three refactored tabs work correctly
- [ ] Verify no console errors
- [ ] Keep other tabs as is for now

## File Size Reduction

### Before Refactoring:
- AdminDashboard.jsx: **3364 lines**

### After Refactoring (Expected):
- AdminDashboard.jsx: **~2000-2200 lines** (removed 3 large tabs + helpers)
- DepartmentsTab.jsx: **175 lines**
- VendorsTab.jsx: **260 lines**
- MaterialsTab.jsx: **300 lines**
- utils/colorHelpers.js: **130 lines**

**Total reduction**: Organized and maintainable file structure, easier to work with.

## Quick Reference: Extracting the Remaining Tabs

When ready to extract the remaining tabs (ProductionTab, EmployeesTab, etc.):

1. Create component file: `components/ProductionTab.jsx`
2. Create data files: `data/productionData.json`, `data/bottleneckData.json`
3. Move all data arrays from function to JSON files
4. Import data in component: `import data from "../data/productionData.json"`
5. Copy JSX from original function into component
6. Add necessary imports (Icons, Charts, etc.)
7. Update color/status helpers usage
8. Export in `components/index.js`
9. Import in main AdminDashboard.jsx
10. Remove original function from AdminDashboard.jsx

## Testing After Migration

```javascript
// Test that all tabs render correctly
<DepartmentsTab /> 
<VendorsTab />
<MaterialsTab />

// Test that color helpers work
const color = getStatusColor("Excellent"); // Should return Tailwind classes
const quality = getQualityColor(4.8); // Should return appropriate color

// Verify no import errors in console
// Verify all data loads correctly
// Verify all charts render without errors
```

## Questions?

Refer to:
- `README.md` - Complete folder structure and best practices
- Individual component files - See examples of refactored code
- `utils/colorHelpers.js` - All available helper functions

---

**Estimated Effort to Complete All Refactoring**: 2-3 hours
**Current Completion**: 30% (3 tabs + utils extracted)
