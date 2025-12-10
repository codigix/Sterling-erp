# Sales Order Form - Complete Data Structure Analysis

## Overview
The Sales Order Form is an 8-step wizard that collects comprehensive project and sales data. Each step maps to specific API endpoints that persist data to the database.

---

## Step-by-Step API Data Requirements

### **STEP 1: Client PO & Project Details**
**API Endpoint**: `POST /api/sales/steps/{salesOrderId}/client-po`

**Frontend Form Fields Used**:
- `poNumber` (string)
- `poDate` (date)
- `clientName` (string)
- `clientEmail` (email)
- `clientPhone` (string)
- `billingAddress` (string)
- `shippingAddress` (string)
- `projectName` (string)
- `projectCode` (string - auto-generated)
- `projectRequirements` (object):
  - `application` (string)
  - `numberOfUnits` (number)
  - `dimensions` (string)
  - `loadCapacity` (string)
  - `materialGrade` (string)
  - `finishCoatings` (string)
  - `installationRequirement` (string)
  - `testingStandards` (string)
  - `acceptanceCriteria` (string)
  - `documentationRequirement` (string)
  - `warrantTerms` (string)

**What Gets Sent to API**:
```javascript
{
  poNumber,
  poDate,
  clientName,
  clientEmail,
  clientPhone,
  billingAddress,
  shippingAddress,
  projectName,
  projectCode,
  projectRequirements: {...}
}
```

---

### **STEP 2: Sales Order & Order Information**
**API Endpoint**: `POST /api/sales/steps/{salesOrderId}/sales-order`

**Frontend Form Fields Used**:
- `clientEmail` (email)
- `clientPhone` (string)
- `estimatedEndDate` (date)
- `billingAddress` (string)
- `shippingAddress` (string)
- `productDetails` (object):
  - `itemName` (string)
  - `itemDescription` (string)
  - `componentsList` (string)
  - `certification` (string)
- `qualityCompliance` (object):
  - `qualityStandards` (string)
  - `weldingStandards` (string)
  - `surfaceFinish` (string)
  - `mechanicalLoadTesting` (string)
  - `electricalCompliance` (string)
  - `documentsRequired` (string)
- `warrantySupport` (object):
  - `warrantyPeriod` (string)
  - `serviceSupport` (string)
- `paymentTerms` (string)
- `projectPriority` (enum: low/medium/high/critical)
- `totalAmount` (number)
- `projectCode` (string)
- `internalInfo` (object):
  - `estimatedCosting` (number)
  - `estimatedProfit` (number)
  - `jobCardNo` (string)
- `specialInstructions` (text)

**What Gets Sent to API**:
```javascript
{
  clientEmail,
  clientPhone,
  billingAddress,
  shippingAddress,
  productDetails: {...},
  pricingDetails: {...},
  deliveryTerms: {...},
  qualityCompliance: {...},
  warrantySupport: {...},
  paymentTerms,
  projectPriority,
  totalAmount,
  projectCode,
  internalInfo: {...},
  specialInstructions
}
```

---

### **STEP 3: Design Engineering**
**API Endpoint**: `POST /api/sales/steps/{salesOrderId}/design-engineering`

**What Gets Sent to API**:
```javascript
{
  ...formData.designEngineering,
  documents: [
    {
      type: 'Drawings',
      filePath: fileName,
      fileName: fileName
    },
    {
      type: 'PD',
      filePath: fileName,
      fileName: fileName
    }
  ]
}
```

**Data Structure in formData.designEngineering**:
```javascript
{
  generalDesignInfo: {
    designId,
    revisionNo,
    designEngineerName,
    designStartDate,
    designCompletionDate,
    designStatus
  },
  productSpecification: {
    productName,
    systemLength,
    systemWidth,
    systemHeight,
    loadCapacity,
    operatingEnvironment,
    materialGrade,
    surfaceFinish
  },
  baseFrameRails: {...},
  rollerSaddleAssembly: {...},
  rotationalCradle: {...},
  winchPullingSystem: {...},
  electricalControl: {...},
  safetyRequirements: {...},
  standardsCompliance: {...},
  attachments: {
    model3D,
    fabricationDrawings,
    assemblyDrawings,
    bomSheet,
    calculationSheet
  },
  commentsNotes: {...}
}
```

---

### **STEP 4: Material Requirements**
**API Endpoint**: `POST /api/sales/steps/{salesOrderId}/material-requirements`

**What Gets Sent to API**:
```javascript
{
  materials: formData.materials || []
}
```

**Materials Array Structure**:
Each material in `formData.materials` contains:
```javascript
{
  materialType: string,      // e.g., "steelSection"
  name: string,
  quantity: number,          // Normalized from type-specific fields
  unit: string,
  vendor: string,
  cost: number,
  ...other type-specific fields
}
```

**Form Data**: Uses type-specific quantity fields like:
- `steelSectionQuantity`
- `plateTypeQuantity`
- `materialGradeQuantity`
- etc.

**Note**: These must be normalized to `quantity` before sending to API.

---

### **STEP 5: Production Plan**
**API Endpoint**: `POST /api/sales/steps/{salesOrderId}/production-plan`

**What Gets Sent to API**:
```javascript
{
  timeline: {
    startDate: formData.productionStartDate,
    endDate: formData.estimatedCompletionDate
  },
  selectedPhases: formData.selectedPhases || {}
}
```

**selectedPhases Structure**:
```javascript
{
  phaseKey1: true/false,
  phaseKey2: true/false,
  ...
}
```

**Note**: `selectedPhases` is local state in Step5 and must be saved to formData via `updateField()`.

---

### **STEP 6: Quality Check**
**API Endpoint**: `POST /api/sales/steps/{salesOrderId}/quality-check`

**What Gets Sent to API**:
```javascript
{
  qualityCompliance: {
    qualityStandards,
    weldingStandards,
    surfaceFinish,
    mechanicalLoadTesting,
    electricalCompliance,
    documentsRequired
  },
  warrantySupport: {
    warrantyPeriod,
    serviceSupport
  },
  internalProjectOwner  // Employee ID
}
```

**Form Fields**:
- `formData.qualityCompliance` (from Step2, reused)
- `formData.warrantySupport` (from Step2, reused)
- `formData.internalProjectOwner` (dropdown to select employee)

**Database Columns**:
- quality_standards, welding_standards, surface_finish, mechanical_load_testing
- electrical_compliance, documents_required
- warranty_period, service_support
- internal_project_owner (foreign key to users table)

---

### **STEP 7: Shipment & Logistics**
**API Endpoint**: `POST /api/sales/steps/{salesOrderId}/shipment`

**What Gets Sent to API**:
```javascript
{
  deliveryTerms: formData.deliveryTerms || {},
  shipment: formData.shipment || {}
}
```

**Form Fields - deliveryTerms**:
- `deliverySchedule` (string)
- `packagingInfo` (string)
- `dispatchMode` (string)
- `installationRequired` (string)
- `siteCommissioning` (string)

**Form Fields - shipment**:
- `marking` (string)
- `dismantling` (string)
- `packing` (string)
- `dispatch` (string)

**Database Columns**:
```
delivery_schedule, packaging_info, dispatch_mode, installation_required, site_commissioning,
marking, dismantling, packing, dispatch,
shipment_method, carrier_name, tracking_number, estimated_delivery_date, shipping_address,
shipment_date, shipment_status, shipment_cost, notes
```

---

### **STEP 8: Delivery & Handover**
**API Endpoint**: `POST /api/sales/steps/{salesOrderId}/delivery`

**What Gets Sent to API**:
```javascript
{
  delivery: formData.delivery || {}
}
```

**Form Fields Used** (mapped from various sources):
- `actualDeliveryDate` (from deliveryTerms.deliverySchedule)
- `customerContact` (from customerContact field)
- `installationCompleted` (from deliveryTerms.installationRequired)
- `siteCcommissioningCompleted` (from deliveryTerms.siteCommissioning)
- `warrantyTermsAcceptance` (from warrantySupport.warrantyPeriod)
- `completionRemarks` (from projectRequirements.acceptanceCriteria)
- `projectManager` (from internalInfo.projectManager)
- `productionSupervisor` (from internalInfo.productionSupervisor)

**Database Columns**:
```
actual_delivery_date, customer_contact, installation_completed, site_commissioning_completed,
warranty_terms_acceptance, completion_remarks, project_manager, production_supervisor,
delivery_date, received_by, delivery_status, delivered_quantity, recipient_signature_path,
delivery_notes, pod_number, delivery_cost
```

---

## Key Data Flow Patterns

### 1. **Nested Field Updates**
```javascript
// Used for updating nested objects
setNestedField("qualityCompliance", "qualityStandards", value)

// This updates:
formData.qualityCompliance.qualityStandards = value
```

### 2. **Material Type Quantity Mapping**
```javascript
// Form uses type-specific fields:
steelSectionQuantity, plateTypeQuantity, etc.

// Must be normalized to:
{ quantity: value }
```

### 3. **State Persistence**
- Local component state ≠ formData
- Local state must be saved via `updateField()` to persist
- Example: Step5's `selectedPhases` must be saved to formData

### 4. **Form Data Reuse**
Some data is collected once and reused:
- `qualityCompliance` - Collected in Step2, used in Step6
- `warrantySupport` - Collected in Step2, used in Steps 6 and 8
- `deliveryTerms` - Collected in Step7, used in Step8

---

## Database Schema Mapping

Each step creates/updates a detail table:

| Step | Table | Primary Key | Created When |
|------|-------|-------------|--------------|
| 1 | client_po_details | id | Step 1 POST |
| 2 | sales_order_details | id | Step 2 POST |
| 3 | design_engineering_details | id | Step 3 POST |
| 4 | material_requirements_details | id | Step 4 POST |
| 5 | production_plan_details | id | Step 5 POST |
| 6 | quality_check_details | id | Step 6 POST |
| 7 | shipment_details | id | Step 7 POST |
| 8 | delivery_details | id | Step 8 POST |

All tables have:
- `sales_order_id` (UNIQUE, foreign key)
- `created_at`, `updated_at` timestamps

---

## Critical Implementation Notes

### ✅ What Currently Works
1. Steps 1-5 API endpoints working correctly
2. Data persistence for design engineering, materials, production plan
3. Form validation on steps 1-5

### ⚠️ What Needs Fixing
1. **Step 6 (Quality Check)**: Form doesn't collect "inspectionType" and "inspections" arrays - instead collects qualityCompliance and warrantySupport
2. **Step 7 (Shipment)**: Frontend sends separate `deliveryTerms` and `shipment` objects - backend expects flattened structure
3. **Step 8 (Delivery)**: Form fields not properly mapped to database columns
4. **Validators**: Some are too strict and don't match form data structure

### 🔧 How to Fix
1. Ensure API sends/receives data in same format as frontend
2. Use proper null coalescing for all optional fields
3. Match field names exactly between frontend and backend
4. Test full workflow creating a fresh order from scratch

---

## Frontend Endpoint Configuration (Updated)

This is the current configuration in `index.jsx` for sending step data:

### Step 2
```javascript
{
  url: `/api/sales/steps/${createdOrderId}/sales-order`,
  data: {
    clientEmail,
    clientPhone,
    billingAddress,
    shippingAddress,
    productDetails,
    pricingDetails,
    deliveryTerms,
    qualityCompliance,
    warrantySupport,
    internalInfo
  }
}
```

### Step 3
```javascript
{
  url: `/api/sales/steps/${createdOrderId}/design-engineering`,
  data: {
    ...designEngineering,
    documents: [
      { type: 'Drawings', filePath, fileName },
      { type: 'PD', filePath, fileName }
    ]
  }
}
```

### Step 4
```javascript
{
  url: `/api/sales/steps/${createdOrderId}/material-requirements`,
  data: {
    materials: [
      { materialType, name, quantity, unit, vendor, cost, ... }
    ]
  }
}
```

### Step 5
```javascript
{
  url: `/api/sales/steps/${createdOrderId}/production-plan`,
  data: {
    timeline: {
      startDate,
      endDate
    },
    selectedPhases: {
      phase1: true/false,
      phase2: true/false,
      ...
    }
  }
}
```

### Step 6 (UPDATED)
```javascript
{
  url: `/api/sales/steps/${createdOrderId}/quality-check`,
  data: {
    qualityCompliance: {
      qualityStandards,
      weldingStandards,
      surfaceFinish,
      mechanicalLoadTesting,
      electricalCompliance,
      documentsRequired
    },
    warrantySupport: {
      warrantyPeriod,
      serviceSupport
    },
    internalProjectOwner: employeeId
  }
}
```

### Step 7
```javascript
{
  url: `/api/sales/steps/${createdOrderId}/shipment`,
  data: {
    deliveryTerms: {
      deliverySchedule,
      packagingInfo,
      dispatchMode,
      installationRequired,
      siteCommissioning
    },
    shipment: {
      marking,
      dismantling,
      packing,
      dispatch
    }
  }
}
```

### Step 8 (UPDATED)
```javascript
{
  url: `/api/sales/steps/${createdOrderId}/delivery`,
  data: {
    actualDeliveryDate,       // from deliveryTerms.deliverySchedule
    customerContact,
    installationCompleted,     // from deliveryTerms.installationRequired
    siteCcommissioningCompleted, // from deliveryTerms.siteCommissioning
    warrantyTermsAcceptance,  // from warrantySupport.warrantyPeriod
    completionRemarks,        // from projectRequirements.acceptanceCriteria
    projectManager,           // from internalInfo.projectManager
    productionSupervisor      // from internalInfo.productionSupervisor
  }
}
```

---

## Backend Controller Requirements

Each controller's `createOrUpdate()` method should:

1. **Accept the exact data structure** sent by frontend
2. **Normalize field names** if needed (e.g., camelCase to snake_case)
3. **Apply null coalescing** for all optional fields:
   ```javascript
   field || null  // for regular fields
   stringifyJsonField(field) || JSON.stringify({})  // for JSON fields
   ```
4. **Validate only critical fields** - relax validators
5. **Return formatted response** with the saved data

### Example Pattern
```javascript
static async createOrUpdate(req, res) {
  const { salesOrderId } = req.params;
  const data = req.body;

  // Validate (optional/minimal)
  const validation = validateStep(data);
  if (!validation.isValid) {
    return res.status(400).json(formatErrorResponse(validation.errors));
  }

  // Create or update
  data.salesOrderId = salesOrderId;
  let detail = await Model.findBySalesOrderId(salesOrderId);
  
  if (detail) {
    await Model.update(salesOrderId, data);
  } else {
    await Model.create(data);
  }

  const updated = await Model.findBySalesOrderId(salesOrderId);
  await SalesOrderStep.update(salesOrderId, stepNumber, {
    status: 'in_progress',
    data: updated
  });

  res.json(formatSuccessResponse(updated, 'Data saved'));
}
```

---

## Testing Workflow

To test the complete form:

1. **Create fresh order** - Start at Step 1, fill all fields
2. **Progress through steps** - Each step should save and advance
3. **Verify data persistence** - Load order in view/edit mode
4. **Check database** - Verify all detail tables have correct data
5. **Reload form** - Data should populate correctly from database

### Sample Complete Order Flow
```
Step 1 → PO & Project (POST client-po)
Step 2 → Sales Order (POST sales-order)  
Step 3 → Design Eng (POST design-engineering)
Step 4 → Materials (POST material-requirements)
Step 5 → Production (POST production-plan)
Step 6 → Quality Check (POST quality-check)
Step 7 → Shipment (POST shipment)
Step 8 → Delivery (POST delivery)
```
