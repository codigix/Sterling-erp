# Complete Frontend-to-API Field Mapping Analysis

## Overview
This document maps all frontend form fields across 8 steps to the required API request/response structures.

---

## STEP 1: Client PO & Project Details (3 Tabs)

### Tab 1: Client Info
**Frontend Fields:**
- poNumber (string, required)
- poDate (date, required)
- clientName (string, required)
- clientEmail (email, required)
- clientPhone (string, required)

**Backend Storage:** Not saved in step API yet (Step 1 creates draft only)

---

### Tab 2: Project Details
**Frontend Fields:**
- projectName (string, required)
- projectCode (string, auto-generated)
- billingAddress (string, required)
- shippingAddress (string, required)

**Backend Storage:** Not saved in step API yet (Step 1 creates draft only)

---

### Tab 3: Project Requirements
**Frontend Fields:**
- projectRequirements.application (string)
- projectRequirements.numberOfUnits (number)
- projectRequirements.dimensions (string)
- projectRequirements.loadCapacity (string)
- projectRequirements.materialGrade (string)
- projectRequirements.finishCoatings (string)
- projectRequirements.installationRequirement (string)
- projectRequirements.testingStandards (string)
- projectRequirements.acceptanceCriteria (string)
- projectRequirements.documentationRequirement (string)
- projectRequirements.warrantTerms (string)

**Backend Storage:** Not saved in step API yet (Step 1 creates draft only)

---

## STEP 2: Sales Order & Order Information (3 Tabs)

### Tab 1: Sales & Product Details
**Frontend Fields:**
- clientEmail (string, required)
- clientPhone (string, required)
- estimatedEndDate (date, required)
- billingAddress (string, required)
- shippingAddress (string, required)
- productDetails.itemName (string, required)
- productDetails.itemDescription (string, required)
- productDetails.componentsList (string)
- productDetails.certification (string)

**API Endpoint:** `POST /api/sales/steps/{salesOrderId}/sales-order`

**API Request Data:**
```json
{
  "clientEmail": "string",
  "clientPhone": "string",
  "estimatedEndDate": "date",
  "billingAddress": "string",
  "shippingAddress": "string",
  "productDetails": {
    "itemName": "string",
    "itemDescription": "string",
    "componentsList": "string",
    "certification": "string"
  },
  "qualityCompliance": {},
  "warrantySupport": {},
  "paymentTerms": "string",
  "totalAmount": "decimal",
  "specialInstructions": "string"
}
```

### Tab 2: Quality & Compliance
**Frontend Fields:**
- qualityCompliance.qualityStandards (string)
- qualityCompliance.weldingStandards (string)
- qualityCompliance.surfaceFinish (string)
- qualityCompliance.mechanicalLoadTesting (string)
- qualityCompliance.electricalCompliance (string)
- qualityCompliance.documentsRequired (string)
- warrantySupport.warrantyPeriod (string)
- warrantySupport.serviceSupport (string)

### Tab 3: Payment & Internal
**Frontend Fields:**
- paymentTerms (string)
- projectPriority (enum: low, medium, high, critical)
- totalAmount (decimal, required)
- projectCode (string)
- internalInfo.estimatedCosting (decimal)
- internalInfo.estimatedProfit (decimal)
- internalInfo.jobCardNo (string)
- specialInstructions (textarea)

---

## STEP 3: Design Engineering

**Frontend Fields:**
- designEngineering.generalDesignInfo.designId (string)
- designEngineering.productSpecification.productName (string, required)
- designEngineering.generalDesignInfo.designStatus (string)
- designEngineering.generalDesignInfo.designEngineerName (string)
- designEngineering.productSpecification.systemLength (string)
- designEngineering.productSpecification.systemWidth (string)
- designEngineering.productSpecification.systemHeight (string)
- designEngineering.productSpecification.loadCapacity (string)
- designEngineering.productSpecification.operatingEnvironment (string)
- designEngineering.productSpecification.materialGrade (string)
- designEngineering.productSpecification.surfaceFinish (string)

**Materials Required (Multi-select arrays):**
- designEngineering.materialsRequired.steelSections (array)
- designEngineering.materialsRequired.plates (array)
- designEngineering.materialsRequired.fasteners (array)
- designEngineering.materialsRequired.components (array)
- designEngineering.materialsRequired.electrical (array)
- designEngineering.materialsRequired.consumables (array)

**File Uploads:**
- designEngineering.attachments.drawings (array of files)
- designEngineering.attachments.documents (array of files)

**API Endpoint:** `POST /api/sales/steps/{salesOrderId}/design-engineering`

**API Request Data:**
```json
{
  "generalDesignInfo": {
    "designId": "string",
    "designStatus": "string",
    "designEngineerName": "string"
  },
  "productSpecification": {
    "productName": "string",
    "systemLength": "string",
    "systemWidth": "string",
    "systemHeight": "string",
    "loadCapacity": "string",
    "operatingEnvironment": "string",
    "materialGrade": "string",
    "surfaceFinish": "string"
  },
  "materialsRequired": {
    "steelSections": [],
    "plates": [],
    "fasteners": [],
    "components": [],
    "electrical": [],
    "consumables": []
  },
  "attachments": {
    "drawings": [],
    "documents": []
  },
  "documents": [
    {
      "type": "Drawings|PD|QAP|ATP|FEA",
      "filePath": "string",
      "fileName": "string"
    }
  ]
}
```

---

## STEP 4: Material Requirements

**Frontend Fields:**
- materials (array of material objects)

**Each Material Object:**
```json
{
  "id": "number (timestamp)",
  "materialType": "steelSection|plateType|materialGrade|fastenerType|machinedParts|rollerMovementComponents|liftingPullingMechanisms|electricalAutomation|safetyMaterials|surfacePrepPainting|fabricationConsumables|hardwareMisc|documentationMaterials",
  "quantity": "number (from type-specific field)",
  "[specific fields based on type]": "values"
}
```

**Type-Specific Quantity Field Names:**
- steelSection → steelSectionQuantity
- plateType → plateTypeQuantity
- materialGrade → materialGradeQuantity
- fastenerType → fastenerTypeQuantity
- machinedParts → machinedPartsQuantity
- rollerMovementComponents → rollerMovementComponentsQuantity
- liftingPullingMechanisms → liftingPullingMechanismsQuantity
- electricalAutomation → electricalAutomationQuantity
- safetyMaterials → safetyMaterialsQuantity
- surfacePrepPainting → surfacePrepPaintingQuantity
- fabricationConsumables → fabricationConsumablesQuantity
- hardwareMisc → hardwareMiscQuantity
- documentationMaterials → documentationMaterialsQuantity

**API Endpoint:** `POST /api/sales/steps/{salesOrderId}/material-requirements`

**API Request Data:**
```json
{
  "materials": [
    {
      "id": "number",
      "materialType": "string",
      "quantity": "number",
      "...other fields": "..."
    }
  ]
}
```

---

## STEP 5: Production Plan

**Frontend Fields:**
- productionStartDate (date)
- estimatedCompletionDate (date)
- selectedPhases (object with boolean flags for each phase)

**Production Phases Available:**
- Material Prep (marking, cutting_laser)
- Fabrication (edge_prep, mig_welding, fit_up, structure_fabrication, heat_treatment)
- Machining (drilling, turning, milling, boring)
- Surface Prep (grinding, shot_blasting, painting)
- Assembly (mechanical_assembly, shaft_bearing_assembly, alignment)
- Electrical (panel_wiring, motor_wiring, sensor_installation)

**Each Phase Has Dynamic Form Fields** (detailed specs for each operation)

**API Endpoint:** `POST /api/sales/steps/{salesOrderId}/production-plan`

**API Request Data:**
```json
{
  "timeline": {
    "startDate": "date",
    "endDate": "date"
  },
  "selectedPhases": {
    "marking": true,
    "cutting_laser": true,
    "edge_prep": false,
    "...": "boolean"
  }
}
```

---

## STEP 6: Quality Check

**Frontend Fields:**
- qualityCompliance.qualityStandards (string)
- qualityCompliance.weldingStandards (string)
- qualityCompliance.surfaceFinish (string)
- qualityCompliance.mechanicalLoadTesting (string)
- qualityCompliance.electricalCompliance (string)
- qualityCompliance.documentsRequired (string)
- warrantySupport.warrantyPeriod (string)
- warrantySupport.serviceSupport (string)
- internalProjectOwner (employee ID)

**API Endpoint:** `POST /api/sales/steps/{salesOrderId}/quality-check`

**API Request Data:**
```json
{
  "qualityCompliance": {
    "qualityStandards": "string",
    "weldingStandards": "string",
    "surfaceFinish": "string",
    "mechanicalLoadTesting": "string",
    "electricalCompliance": "string",
    "documentsRequired": "string"
  },
  "warrantySupport": {
    "warrantyPeriod": "string",
    "serviceSupport": "string"
  },
  "internalProjectOwner": "number"
}
```

---

## STEP 7: Shipment & Logistics

**Frontend Fields (2 Sections):**

### Delivery Terms Fields:
- deliveryTerms.deliverySchedule (string)
- deliveryTerms.packagingInfo (string)
- deliveryTerms.dispatchMode (string)
- deliveryTerms.installationRequired (string)
- deliveryTerms.siteCommissioning (string)

### Shipment Process Fields:
- shipment.marking (string)
- shipment.dismantling (string)
- shipment.packing (string)
- shipment.dispatch (string)

**API Endpoint:** `POST /api/sales/steps/{salesOrderId}/shipment`

**API Request Data:**
```json
{
  "deliveryTerms": {
    "deliverySchedule": "string",
    "packagingInfo": "string",
    "dispatchMode": "string",
    "installationRequired": "string",
    "siteCommissioning": "string"
  },
  "shipment": {
    "marking": "string",
    "dismantling": "string",
    "packing": "string",
    "dispatch": "string"
  }
}
```

---

## STEP 8: Delivery & Handover

**Frontend Fields:**

### Final Delivery:
- deliveryTerms.deliverySchedule (date) ← REUSED FIELD
- customerContact (string)

### Installation Status:
- deliveryTerms.installationRequired (string) ← REUSED FIELD
- deliveryTerms.siteCommissioning (string) ← REUSED FIELD

### Warranty & Compliance:
- warrantySupport.warrantyPeriod (string) ← REUSED FIELD

### Project Completion:
- projectRequirements.acceptanceCriteria (string) ← REUSED FIELD

### Internal Project Info:
- internalInfo.projectManager (string)
- internalInfo.productionSupervisor (string)

**API Endpoint:** `POST /api/sales/steps/{salesOrderId}/delivery`

**API Request Data:**
```json
{
  "deliveryTerms": {
    "deliverySchedule": "date",
    "installationRequired": "string",
    "siteCommissioning": "string"
  },
  "warrantySupport": {
    "warrantyPeriod": "string"
  },
  "customerContact": "string",
  "projectRequirements": {
    "acceptanceCriteria": "string"
  },
  "internalInfo": {
    "projectManager": "string",
    "productionSupervisor": "string"
  }
}
```

---

## Key Issues Found

### 1. Field Reuse Across Steps
Many fields appear in multiple steps (e.g., `deliveryTerms.*`, `qualityCompliance.*`). Need to decide:
- Should they sync across steps?
- Or maintain separate copies?

### 2. formData Structure in Frontend
```javascript
formData = {
  // Step 1
  poNumber, poDate, clientName, clientEmail, clientPhone,
  projectName, projectCode, billingAddress, shippingAddress,
  projectRequirements: {},
  
  // Step 2
  estimatedEndDate, paymentTerms, totalAmount, specialInstructions,
  productDetails: {},
  qualityCompliance: {},
  warrantySupport: {},
  internalInfo: {},
  
  // Step 3
  designEngineering: {},
  
  // Step 4
  materials: [],
  
  // Step 5
  productionStartDate, estimatedCompletionDate, selectedPhases: {},
  
  // Step 6
  internalProjectOwner,
  
  // Step 7
  deliveryTerms: {},
  shipment: {},
  
  // Step 8
  customerContact
}
```

### 3. API Data Sent to Backend (Current in index.jsx)
```javascript
const endpoints = {
  2: { url: `/api/sales/steps/${createdOrderId}/sales-order`, data: stepData },
  3: { url: `/api/sales/steps/${createdOrderId}/design-engineering`, data: {} },
  4: { url: `/api/sales/steps/${createdOrderId}/material-requirements`, data: { materials: [] } },
  5: { url: `/api/sales/steps/${createdOrderId}/production-plan`, data: { timeline, selectedPhases } },
  6: { url: `/api/sales/steps/${createdOrderId}/quality-check`, data: formData.qualityCheck || {} },
  7: { url: `/api/sales/steps/${createdOrderId}/shipment`, data: { deliveryTerms, shipment } },
  8: { url: `/api/sales/steps/${createdOrderId}/delivery`, data: formData.delivery || {} }
};
```

---

## Recommendations

1. **Standardize API payloads** - Each endpoint should receive exactly the fields it needs
2. **Fix field reuse** - Either consolidate data or explicitly map fields
3. **Update backend validators** - Match actual form field names and structures
4. **Create detailed API contracts** - Document exact request/response formats for each step
