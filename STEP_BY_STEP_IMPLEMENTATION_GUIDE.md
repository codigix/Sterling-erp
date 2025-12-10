# Multi-Tab Data Persistence - Implementation Guide

## Status Summary
✅ **Step 1**: FIXED - All 3 tabs now load correctly  
⏳ **Steps 2-8**: Need implementation below

---

## Step 1: Client PO (3 Tabs)

**Status**: ✅ **COMPLETED**

### Data Flow:
1. **Saving**: stepDataService.js sends all data in ONE request to `/client-po`
2. **Database**: ClientPODetail model saves everything in one INSERT
3. **Loading**: ✅ Now loads all fields from API response

### What Was Fixed:
- Added loading of: poNumber, poDate, clientName, projectName, projectCode, billingAddress, shippingAddress
- Added loading of projectRequirements object

---

## Step 2: Sales Order (3 Tabs)

**Affected Fields**:
- **Tab 1**: clientEmail, clientPhone, billingAddress, shippingAddress, productDetails
- **Tab 2**: qualityCompliance, warrantySupport  
- **Tab 3**: paymentTerms, projectPriority, totalAmount, projectCode, internalInfo, specialInstructions

**Current Issue**:
In index.jsx, there's NO code currently loading Step 2 data. The stepDataService sends complete data but the frontend never retrieves it on edit/view.

### Fix Needed:

Add to index.jsx after Step 1 loading block (around line 108):

```javascript
// Step 2: Sales Order Detail
const salesOrderResponse = await axios.get(`/api/sales/steps/${salesOrderId}/sales-order`).catch(() => null);

if (salesOrderResponse?.data?.data) {
  const soData = salesOrderResponse.data.data;
  // Tab 1: Sales & Product Details
  updateField('clientEmail', soData.clientEmail || '');
  updateField('clientPhone', soData.clientPhone || '');
  updateField('billingAddress', soData.billingAddress || '');
  updateField('shippingAddress', soData.shippingAddress || '');
  if (soData.productDetails) {
    updateField('productDetails', soData.productDetails);
  }
  // Tab 2: Quality & Compliance
  if (soData.qualityCompliance) {
    updateField('qualityCompliance', soData.qualityCompliance);
  }
  if (soData.warrantySupport) {
    updateField('warrantySupport', soData.warrantySupport);
  }
  // Tab 3: Payment & Internal
  updateField('paymentTerms', soData.paymentTerms || '');
  updateField('projectPriority', soData.projectPriority || '');
  updateField('totalAmount', soData.totalAmount || '');
  updateField('projectCode', soData.projectCode || '');
  if (soData.internalInfo) {
    updateField('internalInfo', soData.internalInfo);
  }
  updateField('specialInstructions', soData.specialInstructions || '');
}
```

**Database**: sales_order_details table stores all data in JSON fields

---

## Step 3: Design Engineering

**Affected Fields**:
- generalDesignInfo (JSON)
- productSpecification (JSON)
- attachments (JSON - drawings + documents)
- documents (array)

**Current Database Schema**:
- Simplified to: documents, design_status, bom_data, drawings_3d, specifications, design_notes, reviewed_by

**Issue**: 
- Frontend sends nested structures
- Current schema doesn't store generalDesignInfo, productSpecification as separate JSON fields
- Only documents array is properly stored

### Option A: Keep Current Simplified Schema
Just load what's available:

```javascript
if (designResponse?.data?.data) {
  const designData = designResponse.data.data;
  // Basic fields
  updateField('designEngineering', {
    documents: designData.documents || [],
    designStatus: designData.designStatus || 'draft',
    bomData: designData.bomData || null,
    specifications: designData.specifications || null,
    designNotes: designData.designNotes || ''
  });
}
```

### Option B: Update Schema to Support Full Data (Recommended)
Update the database schema to add these columns:
```sql
ALTER TABLE design_engineering_details 
ADD COLUMN general_design_info JSON,
ADD COLUMN product_specification JSON,
ADD COLUMN materials_required JSON;
```

Then update the model to save/retrieve these fields.

**For Now**: Use Option A

---

## Step 4: Material Requirements

**Data Structure**:
- materials (array of objects with type-specific quantity fields)

**Current Loading Code** (line 114-117):
```javascript
if (materialsResponse?.data?.data) {
  const materialsData = materialsResponse.data.data;
  updateField('materialProcurement', materialsData);
}
```

**Issue**: 
- The `materialProcurement` is a nested structure, but the frontend sends just `materials` array
- Need to normalize the field names

### Fix:
```javascript
if (materialsResponse?.data?.data) {
  const materialsData = materialsResponse.data.data;
  // Load materials array properly
  if (materialsData.materials && Array.isArray(materialsData.materials)) {
    updateField('materials', materialsData.materials);
  } else {
    updateField('materials', []);
  }
  // Also load materialProcurement for backward compatibility
  updateField('materialProcurement', materialsData);
}
```

---

## Step 5: Production Plan

**Data Structure**:
- timeline (object with startDate, endDate)
- selectedPhases (object with boolean flags for each phase)
- phaseDetails (object with details for each phase)

**Current Loading Code** (line 119-122):
```javascript
if (productionResponse?.data?.data) {
  const productionData = productionResponse.data.data;
  updateField('productionPlan', productionData);
}
```

**This might work**, but need to verify the nested structure is properly handled.

### Better Approach:
```javascript
if (productionResponse?.data?.data) {
  const prodData = productionResponse.data.data;
  // Timeline
  if (prodData.timeline) {
    updateField('productionStartDate', prodData.timeline.startDate || '');
    updateField('estimatedCompletionDate', prodData.timeline.endDate || '');
  }
  // Phases
  if (prodData.selectedPhases) {
    updateField('selectedPhases', prodData.selectedPhases);
  }
  // Store complete data
  updateField('productionPlan', prodData);
}
```

---

## Step 6: Quality Check

**Affected Fields**:
- qualityCompliance (nested)
- warrantySupport (nested)
- internalProjectOwner (INT)

**Current Loading Code** (line 124-127):
```javascript
if (qcResponse?.data?.data) {
  const qcData = qcResponse.data.data;
  updateField('qualityCheck', qcData);
}
```

### Fix:
```javascript
if (qcResponse?.data?.data) {
  const qcData = qcResponse.data.data;
  // Nested objects
  if (qcData.qualityCompliance) {
    updateField('qualityCompliance', qcData.qualityCompliance);
  }
  if (qcData.warrantySupport) {
    updateField('warrantySupport', qcData.warrantySupport);
  }
  // Single values
  if (qcData.internalProjectOwner) {
    updateField('internalProjectOwner', qcData.internalProjectOwner);
  }
  // Complete object
  updateField('qualityCheck', qcData);
}
```

---

## Step 7: Shipment (2 Sections)

**Data Sections**:
- deliveryTerms (object with schedule, packaging, dispatch, installation, commissioning)
- shipment (object with marking, dismantling, packing, dispatch)

**Current Code** (line 129-132):
```javascript
if (shipmentResponse?.data?.data) {
  const shipmentData = shipmentResponse.data.data;
  updateField('shipment', shipmentData);
}
```

**Issue**: This stores under `shipment` field, but form has both `deliveryTerms` and `shipment` as separate sections

### Fix:
```javascript
if (shipmentResponse?.data?.data) {
  const shipData = shipmentResponse.data.data;
  // Delivery Terms section
  if (shipData.deliveryTerms) {
    updateField('deliveryTerms', shipData.deliveryTerms);
  }
  // Shipment Process section
  if (shipData.shipment) {
    updateField('shipment', shipData.shipment);
  }
}
```

---

## Step 8: Delivery (4 Sections)

**Data Sections**:
- deliveryTerms (from Step 7, reused)
- warrantySupport (from Step 6, reused)
- customerContact
- projectRequirements (from Step 1, reused)
- internalInfo (from Step 2, reused)

**Current Code** (line 134-137):
```javascript
if (deliveryResponse?.data?.data) {
  const deliveryData = deliveryResponse.data.data;
  updateField('delivery', deliveryData);
}
```

### Fix:
```javascript
if (deliveryResponse?.data?.data) {
  const delData = deliveryResponse.data.data;
  // Final Delivery
  updateField('customerContact', delData.customerContact || '');
  // Installation & Warranty
  if (delData.deliveryTerms) {
    updateField('deliveryTerms', {
      ...formData.deliveryTerms,
      ...delData.deliveryTerms
    });
  }
  if (delData.warrantySupport) {
    updateField('warrantySupport', {
      ...formData.warrantySupport,
      ...delData.warrantySupport
    });
  }
  // Internal Info
  if (delData.internalInfo) {
    updateField('internalInfo', delData.internalInfo);
  }
  // Project Requirements
  if (delData.projectRequirements) {
    updateField('projectRequirements', {
      ...formData.projectRequirements,
      ...delData.projectRequirements
    });
  }
  // Complete object
  updateField('delivery', delData);
}
```

---

## Implementation Priority

1. **DONE**: ✅ Step 1 (Client PO)
2. **CRITICAL**: Step 2 (Sales Order) - Essential data
3. **HIGH**: Step 7 (Shipment) - Separate sections
4. **MEDIUM**: Steps 3, 5, 6, 8
5. **LOW**: Step 4 (Material Requirements) - Might already work

---

## Testing After Implementation

For each step:
1. Create sales order, fill all tabs
2. Move to next step
3. Go back to previous step
4. **Verify all tabs reload with correct data**
5. Edit and save
6. Reload page and verify persistence

---

## Files to Modify

1. `frontend/src/components/admin/SalesOrderForm/index.jsx` 
   - Location: lines 80-140 (loadAllStepData function)
   - Add/modify the data loading blocks for each step

2. No backend changes needed - models/controllers already save complete data

---

## Quick Reference: Field Mappings

| Step | Key Fields to Load | Database Table | API Field Count |
|------|-------------------|-----------------|-----------------|
| 1 | poNumber, poDate, clientName, projectName, billingAddress, shippingAddress, projectRequirements | client_po_details | 22 |
| 2 | clientEmail, clientPhone, productDetails, qualityCompliance, warrantySupport, paymentTerms, internalInfo | sales_order_details | 18 |
| 3 | documents, generalDesignInfo, productSpecification | design_engineering_details | 13 |
| 4 | materials array | material_requirements_details | 7 |
| 5 | timeline, selectedPhases, phaseDetails | production_plan_details | 8 |
| 6 | qualityCompliance, warrantySupport, internalProjectOwner | quality_check_details | 17 |
| 7 | deliveryTerms, shipment (both subsections) | shipment_details | 19 |
| 8 | All from previous steps + delivery info | delivery_details | 18 |

