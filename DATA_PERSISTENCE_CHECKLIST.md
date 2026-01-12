# Root Card & Sales Order Data Persistence Checklist

## Overview
This document ensures that ALL data entered in the Root Card Wizard (8-step form) is correctly stored in the database at each step.

## Data Flow Architecture

```
Frontend Form (8 Steps)
    ↓
Step Data Handler (frontend/src/components/admin/SalesOrderForm/stepDataHandler.js)
    ↓
API Endpoints (backend/routes/sales/salesOrderStepsRoutes.js)
    ↓
Controllers & Models (backend/controllers/sales & backend/models)
    ↓
Database Tables
```

---

## Step-by-Step Verification

### **Step 1: Client PO Details**
**Database Table:** `client_po_details`

**Fields Being Saved:**
- ✅ `poNumber`
- ✅ `poDate`
- ✅ `clientName`
- ✅ `clientEmail`
- ✅ `clientPhone`
- ✅ `projectName`
- ✅ `projectCode`
- ✅ `clientCompanyName`
- ✅ `clientAddress`
- ✅ `clientGSTIN`
- ✅ `billingAddress`
- ✅ `shippingAddress`
- ✅ `poValue`
- ✅ `currency`
- ✅ `termsConditions` (JSON)
- ✅ `attachments` (JSON)
- ✅ `projectRequirements` (JSON)
- ✅ `notes`

**API Endpoint:** `POST /sales/steps/{salesOrderId}/client-po`  
**Controller:** `clientPOController.createOrUpdate()`  
**Status:** ✅ COMPLETE

---

### **Step 2: Sales Order Details**
**Database Tables:** 
- `sales_order_details` (main step 2 data)
- `sales_orders` (order metadata)

**Subtabs & Fields:**

#### **2a. Sales & Product Tab**
- ✅ `clientEmail`
- ✅ `clientPhone`
- ✅ `estimatedEndDate`
- ✅ `billingAddress`
- ✅ `shippingAddress`
- ✅ `productDetails` (JSON)

**API Endpoint:** `POST /sales/steps/{salesOrderId}/sales-order/sales-product`

#### **2b. Quality & Compliance Tab**
- ✅ `qualityCompliance` (JSON)
- ✅ `warrantySupport` (JSON)

**API Endpoint:** `POST /sales/steps/{salesOrderId}/sales-order/quality-compliance`

#### **2c. Payment & Internal Info Tab**
- ✅ `paymentTerms`
- ✅ `projectPriority`
- ✅ `totalAmount`
- ✅ `projectCode`
- ✅ `internalInfo` (JSON)
- ✅ `specialInstructions`

**API Endpoint:** `POST /sales/steps/{salesOrderId}/sales-order/payment-internal`

**Controller:** `salesOrderDetailController` (multiple methods)  
**Status:** ✅ COMPLETE (3 separate API calls per step 2)

---

### **Step 3: Design Engineering**
**Database Table:** `design_engineering_details`

**Fields Being Saved:**
- ✅ `generalDesignInfo` (JSON)
- ✅ `productSpecification` (JSON)
- ✅ `materialsRequired` (JSON)
- ✅ `attachments` (JSON)
- ✅ `documents` (JSON)
- ✅ `assignedTo` (employee ID)

**API Endpoint:** `POST /sales/steps/{salesOrderId}/design-engineering`  
**Controller:** `designEngineeringController.createOrUpdate()`  
**Status:** ✅ COMPLETE

---

### **Step 4: Material Requirements**
**Database Table:** `material_requirements_details`

**Fields Being Saved:**
- ✅ `materials` (array of material objects)
- ✅ `procurementStatus`
- ✅ `totalMaterialCost`
- ✅ `notes`
- ✅ `assignedTo` (employee ID)

**API Endpoint:** `POST /sales/steps/{salesOrderId}/material-requirements`  
**Controller:** `materialRequirementsController.createOrUpdate()`  
**Status:** ✅ COMPLETE

---

### **Step 5: Production Plan**
**Database Tables:**
- `production_plan_details` (step 5 data)
- `production_plans` (synchronized for visibility)

**Fields Being Saved:**
- ✅ `timeline` (startDate, endDate)
- ✅ `selectedPhases` (JSON)
- ✅ `assignedTo` (employee ID)
- ✅ `planName`
- ✅ `notes`

**API Endpoint:** `POST /sales/steps/{salesOrderId}/production-plan`  
**Controller:** `productionPlanController.createOrUpdate()`  
**Status:** ✅ COMPLETE (syncs to production_plans table)

---

### **Step 6: Quality Check**
**Database Table:** `quality_check_details`

**Fields Being Saved:**
- ✅ `qualityCompliance` (JSON)
- ✅ `warrantySupport` (JSON)
- ✅ `internalProjectOwner`
- ✅ `assignedTo` (employee ID)

**API Endpoint:** `POST /sales/steps/{salesOrderId}/quality-check`  
**Controller:** `qualityCheckController.createOrUpdate()`  
**Status:** ✅ COMPLETE

---

### **Step 7: Shipment**
**Database Table:** `shipment_details`

**Fields Being Saved:**
- ✅ `deliveryTerms` (JSON)
- ✅ `shipment` (JSON - marking, dismantling, packing, dispatch)
- ✅ `assignedTo` (employee ID)

**API Endpoint:** `POST /sales/steps/{salesOrderId}/shipment`  
**Controller:** `shipmentController.createOrUpdate()`  
**Status:** ✅ COMPLETE

---

### **Step 8: Delivery**
**Database Table:** `delivery_details`

**Fields Being Saved:**
- ✅ `deliveryTerms` (JSON)
- ✅ `warrantySupport` (JSON)
- ✅ `customerContact`
- ✅ `internalInfo` (JSON)
- ✅ `assignedTo` (employee ID)

**API Endpoint:** `POST /sales/steps/{salesOrderId}/delivery`  
**Controller:** `deliveryController.createOrUpdate()`  
**Status:** ✅ COMPLETE

---

## Root Card Data Synchronization

**When Sales Order is Created:**
1. ✅ Sales order created in `sales_orders` table
2. ✅ Project created in `projects` table (links to sales order)
3. ✅ Root card created in `root_cards` table (links to project)

**Relationships:**
```
Sales Order → Project → Root Card
     ↓
  Database Links
     ↓
sales_orders.id → projects.sales_order_id → root_cards.project_id
```

---

## Data Verification Steps

### For Users:
1. **Fill Step 1**: Verify client info is saved (check API network tab)
2. **Fill Step 2**: Check all 3 tabs save data separately
3. **Fill Step 3-8**: Verify each step's data is sent to API
4. **Submit Order**: Verify all steps are saved before navigation

### For Developers:
1. **Check browser console** for API errors
2. **Check backend logs** for database errors
3. **Check database directly**:
   ```sql
   SELECT * FROM client_po_details WHERE sales_order_id = ?;
   SELECT * FROM sales_order_details WHERE sales_order_id = ?;
   SELECT * FROM design_engineering_details WHERE sales_order_id = ?;
   SELECT * FROM material_requirements_details WHERE sales_order_id = ?;
   SELECT * FROM production_plan_details WHERE sales_order_id = ?;
   SELECT * FROM quality_check_details WHERE sales_order_id = ?;
   SELECT * FROM shipment_details WHERE sales_order_id = ?;
   SELECT * FROM delivery_details WHERE sales_order_id = ?;
   SELECT * FROM root_cards WHERE sales_order_id = ?;
   ```

---

## Common Issues & Solutions

### Issue: Data Not Appearing in Database
**Solution:**
1. Check if API calls are being made (Network tab in DevTools)
2. Check for 400/500 errors in API responses
3. Verify form validation is not blocking submission
4. Check if database tables exist (run migrations)

### Issue: Missing Fields
**Solution:**
1. Verify field names match between frontend and backend
2. Check camelCase vs snake_case conversions
3. Ensure JSON fields are properly stringified before save

### Issue: Root Card Not Created
**Solution:**
1. Root card is auto-created when sales order is submitted
2. Check `root_cards` table for entry with matching `sales_order_id`
3. Verify `project_id` is correctly linked

---

## API Response Format

All endpoints should return:
```json
{
  "data": { /* field values */ },
  "message": "Data saved successfully"
}
```

If any endpoint returns error, check:
1. Sales Order ID is valid
2. All required fields are present
3. Field types match database schema
4. No duplicate key violations

---

## Database Schema Verification

Run this to verify all tables exist:
```bash
node backend/initDb.js
```

Or manually check:
```sql
SHOW TABLES FROM sterling_erp;
```

Should include:
- ✅ `sales_orders`
- ✅ `client_po_details`
- ✅ `sales_order_details`
- ✅ `design_engineering_details`
- ✅ `material_requirements_details`
- ✅ `production_plan_details`
- ✅ `quality_check_details`
- ✅ `shipment_details`
- ✅ `delivery_details`
- ✅ `projects`
- ✅ `root_cards`

---

## Testing Checklist

- [ ] Create new sales order with all required step 1 fields
- [ ] Fill each step completely
- [ ] Verify data persists when navigating between steps
- [ ] Submit complete order
- [ ] Check all tables in database for data presence
- [ ] Verify root card was created
- [ ] Verify all 8 step detail tables have entries
- [ ] Test edit mode - verify data loads and can be updated
- [ ] Test view mode - verify data displays correctly

---

## Quick Reference: API Endpoints

| Step | Endpoint | Method | Endpoint Path |
|------|----------|--------|---------------|
| 1 | Client PO | POST | `/sales/steps/{id}/client-po` |
| 2a | Sales & Product | POST | `/sales/steps/{id}/sales-order/sales-product` |
| 2b | Quality & Compliance | POST | `/sales/steps/{id}/sales-order/quality-compliance` |
| 2c | Payment & Internal | POST | `/sales/steps/{id}/sales-order/payment-internal` |
| 3 | Design Engineering | POST | `/sales/steps/{id}/design-engineering` |
| 4 | Material Requirements | POST | `/sales/steps/{id}/material-requirements` |
| 5 | Production Plan | POST | `/sales/steps/{id}/production-plan` |
| 6 | Quality Check | POST | `/sales/steps/{id}/quality-check` |
| 7 | Shipment | POST | `/sales/steps/{id}/shipment` |
| 8 | Delivery | POST | `/sales/steps/{id}/delivery` |

---

## Logs to Monitor

Check backend logs for:
```
[ClientPOController] - Client PO data
[SalesOrderDetailController] - Step 2 data
[DesignEngineeringController] - Step 3 data
[MaterialRequirementsController] - Step 4 data
[ProductionPlanController] - Step 5 data
[QualityCheckController] - Step 6 data
[ShipmentController] - Step 7 data
[DeliveryController] - Step 8 data
```

---

**Last Updated:** January 12, 2026  
**Version:** 1.0
