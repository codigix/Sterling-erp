# Step-by-Step Data Persistence Verification Guide

This guide walks you through verifying that each form step stores all its data correctly in the database.

---

## Quick Start

### 1. **Before You Start**
- Open the Root Card Wizard form and proceed to create a new sales order
- Once you reach Step 1, note the **Sales Order ID** from the URL or the created order
- Keep the **Sales Order ID** handy for verification commands

### 2. **Create a New Sales Order**
1. Navigate to: **Admin Panel → Sales Orders → Create New Order**
2. Follow the 8-step wizard
3. On completion, note your **Sales Order ID** (let's call it: `<SO_ID>`)

---

## Verification Process

### **STEP 1: Client PO & Project Details**

**Form Fields Being Saved:**
- ✅ PO Number
- ✅ PO Date
- ✅ Client Name
- ✅ Client Email
- ✅ Client Phone
- ✅ Project Name
- ✅ Project Code
- ✅ Billing Address
- ✅ Shipping Address
- ✅ Project Requirements (Application, Dimensions, Load Capacity, Material Grade, etc.)
- ✅ Notes

**API Endpoint:** `POST /sales/steps/{salesOrderId}/client-po`  
**Database Table:** `client_po_details`

**Verification Steps:**

1. **Fill out the form** with all fields visible in the screenshot:
   - PO Number: `PO-001`
   - PO Date: `12-01-2026`
   - Client Name: `sanika mote`
   - Client Email: `sanikanote@gmail.com`
   - Client Phone: `9022319832`

2. **Check browser Network tab:**
   - Open DevTools (F12 → Network tab)
   - Click "Next"
   - Look for API call: `POST /sales/steps/xxx/client-po`
   - Status should be **200 OK** ✅

3. **Verify in database:**
   ```bash
   node backend/comprehensive-form-data-verification.js <SO_ID> 1
   ```
   Expected output:
   ```
   ✅ Database table 'client_po_details' exists
   📊 Field Definitions:
       ✅ PO Number → po_number [VARCHAR required]
       ✅ Client Name → client_name [VARCHAR required]
       ✅ Client Email → client_email [VARCHAR required]
       ✅ Client Phone → client_phone [VARCHAR required]
       ...
   💾 Data Presence Check:
       ✅ Data found (1 record(s))
   📋 Field Values:
       ✅ po_number : PO-001
       ✅ client_name : sanika mote
       ✅ client_email : sanikanote@gmail.com
   ```

---

### **STEP 2: Sales Order Details (3 Tabs)**

**This is ONE form split into 3 tabs, stored in ONE database table**

**Tab 1: Sales & Product**
- ✅ Client Email (from Step 1)
- ✅ Client Phone (from Step 1)
- ✅ Estimated End Date
- ✅ Billing Address
- ✅ Shipping Address
- ✅ Item Name
- ✅ Item Description
- ✅ Components List
- ✅ Certification

**Tab 2: Quality & Compliance**
- ✅ Quality Standards
- ✅ Welding Standards
- ✅ Surface Finish
- ✅ Mechanical Load Testing
- ✅ Electrical Compliance
- ✅ Documents Required
- ✅ Warranty Period
- ✅ Service Support

**Tab 3: Payment & Internal**
- ✅ Payment Terms
- ✅ Project Priority
- ✅ Total Amount
- ✅ Project Code
- ✅ Estimated Costing
- ✅ Estimated Profit
- ✅ Job Card Number
- ✅ Special Instructions

**API Endpoints:** (3 separate POST calls)
- `POST /sales/steps/{salesOrderId}/sales-order/sales-product`
- `POST /sales/steps/{salesOrderId}/sales-order/quality-compliance`
- `POST /sales/steps/{salesOrderId}/sales-order/payment-internal`

**Database Table:** `sales_order_details` (single table, all 3 tabs stored together)

**Verification Steps:**

1. **Fill all 3 tabs** with sample data
2. **Check Network tab:**
   - Should see 3 API calls (one per tab)
   - Each should return **200 OK** ✅

3. **Verify in database:**
   ```bash
   node backend/comprehensive-form-data-verification.js <SO_ID> 2
   ```
   Expected:
   ```
   ✅ Database table 'sales_order_details' exists
   💾 Data Presence Check:
       ✅ Data found (1 record(s))
   📋 Field Values:
       ✅ client_email : sanikanote@gmail.com
       ✅ estimated_end_date : 2026-01-25
       ✅ product_details : {"itemName":"CCIS - Container Canister..."}
       ✅ quality_compliance : {"qualityStandards":"ISO 9001:2015",...}
       ✅ warranty_support : {"warrantyPeriod":"12 Months from...",...}
       ✅ payment_terms : 40% advance, 40% before dispatch...
   ```

---

### **STEP 3: Design Engineering**

**Form Fields:**
- ✅ Design Engineer (Employee assignment)
- ✅ Raw Design Drawings (File upload)
- ✅ Required Documents (File upload)

**API Endpoint:** `POST /sales/steps/{salesOrderId}/design-engineering`  
**Database Table:** `design_engineering_details`

**Verification:**
```bash
node backend/comprehensive-form-data-verification.js <SO_ID> 3
```

**Expected:** Design engineer assigned + files uploaded

---

### **STEP 4: Material Requirements**

**Form Fields:**
- ✅ Material Category Checkboxes (Structural, Hardware, Components, Electrical, Safety, Consumables, Docs)
- ✅ Each category has selectable items
- ✅ Inventory Manager assignment

**API Endpoint:** `POST /sales/steps/{salesOrderId}/material-requirements`  
**Database Table:** `material_requirements_details`

**Verification:**
```bash
node backend/comprehensive-form-data-verification.js <SO_ID> 4
```

**Expected:** Selected materials stored as JSON array with cost calculations

---

### **STEP 5: Production Plan**

**Form Fields:**
- ✅ Production Start Date
- ✅ Estimated Completion Date
- ✅ Procurement Status
- ✅ Production Phases (Material Prep, Fabrication, Machining, Surface Prep, Assembly, Electrical)
- ✅ Production Manager assignment

**API Endpoint:** `POST /sales/steps/{salesOrderId}/production-plan`  
**Database Table:** `production_plan_details`

**Verification:**
```bash
node backend/comprehensive-form-data-verification.js <SO_ID> 5
```

**Expected:** Timeline, phases, and assignments stored

---

### **STEP 6: Quality Check & Compliance**

**Form Fields:**
- ✅ Quality Standards (e.g., DRDO standard)
- ✅ Welding Standards (e.g., AWS)
- ✅ Surface Finish (e.g., PU coating)
- ✅ Mechanical Load Testing (e.g., 6000kg load test)
- ✅ Electrical Compliance (e.g., Safety complains)
- ✅ Documents Required (e.g., FAT reports)
- ✅ Warranty Period (e.g., 12 month)
- ✅ Service Support (e.g., AMC)
- ✅ QC Manager assignment

**API Endpoint:** `POST /sales/steps/{salesOrderId}/quality-check`  
**Database Table:** `quality_check_details`

**Verification:**
```bash
node backend/comprehensive-form-data-verification.js <SO_ID> 6
```

**Expected:** All compliance standards and quality checks stored

---

### **STEP 7: Shipment & Logistics**

**Form Fields:**
- ✅ Delivery Schedule (e.g., 12-16 weeks from PO)
- ✅ Packaging Information (e.g., Wooden box, anti-rust oil)
- ✅ Dispatch Mode (e.g., Road transport)
- ✅ Installation Required (e.g., Yes, on-site installation)
- ✅ Site Commissioning (e.g., Yes, commissioning required)
- ✅ Marking (e.g., Marked and labeled)
- ✅ Dismantling (e.g., Not required)
- ✅ Packing (e.g., Industrial packing applied)
- ✅ Dispatch (e.g., Ready for dispatch)
- ✅ Logistics Manager assignment

**API Endpoint:** `POST /sales/steps/{salesOrderId}/shipment`  
**Database Table:** `shipment_details`

**Verification:**
```bash
node backend/comprehensive-form-data-verification.js <SO_ID> 7
```

**Expected:** All shipment logistics data stored

---

### **STEP 8: Delivery & Handover**

**Form Fields:**
- ✅ Actual Delivery Date
- ✅ Delivered To (Name)
- ✅ Installation Completed (Yes/No)
- ✅ Site Commissioning Completed (Yes/No)
- ✅ Warranty Terms Acceptance
- ✅ Completion Remarks
- ✅ Project Manager (Name)
- ✅ Production Supervisor (Name)
- ✅ Delivery Assignment (Employee)

**API Endpoint:** `POST /sales/steps/{salesOrderId}/delivery`  
**Database Table:** `delivery_details`

**Verification:**
```bash
node backend/comprehensive-form-data-verification.js <SO_ID> 8
```

**Expected:** All delivery data stored with assigned employee

---

## Complete Verification Command

### Run Full Verification (All Steps)
```bash
node backend/comprehensive-form-data-verification.js <SO_ID>
```

This will show:
- ✅ All 8 steps table schemas
- ✅ All field definitions
- ✅ Which fields exist vs. missing
- ✅ Data presence in database
- ✅ Sample values for each field

### Verify Specific Step
```bash
node backend/comprehensive-form-data-verification.js <SO_ID> 3
```

This will check only Step 3 (Design Engineering)

---

## View Your Data

### In Root Cards
1. Go to **Admin Panel → Root Cards**
2. Click on your created root card
3. You should see all 8 steps completed with ✅ marks

### In Database (Manual Check)
```sql
-- Check all 8 steps for a sales order
SELECT 
  'Step 1' as step, COUNT(*) as records FROM client_po_details WHERE sales_order_id = 5
UNION ALL SELECT 
  'Step 2', COUNT(*) FROM sales_order_details WHERE sales_order_id = 5
UNION ALL SELECT 
  'Step 3', COUNT(*) FROM design_engineering_details WHERE sales_order_id = 5
UNION ALL SELECT 
  'Step 4', COUNT(*) FROM material_requirements_details WHERE sales_order_id = 5
UNION ALL SELECT 
  'Step 5', COUNT(*) FROM production_plan_details WHERE sales_order_id = 5
UNION ALL SELECT 
  'Step 6', COUNT(*) FROM quality_check_details WHERE sales_order_id = 5
UNION ALL SELECT 
  'Step 7', COUNT(*) FROM shipment_details WHERE sales_order_id = 5
UNION ALL SELECT 
  'Step 8', COUNT(*) FROM delivery_details WHERE sales_order_id = 5;
```

---

## Troubleshooting

### Issue: Data not appearing after clicking "Next"

**Check 1: API Response**
1. Open DevTools (F12)
2. Go to Network tab
3. Look for the API call
4. If status is **400 or 500**: Check console for error message
5. If status is **401**: Re-login
6. If status is **200** but data still missing: Data should be in DB

**Check 2: Database**
```bash
node backend/comprehensive-form-data-verification.js <SO_ID>
```

**Check 3: Browser Console**
1. Open F12 → Console tab
2. Look for JavaScript errors
3. Check if form validation is failing

### Issue: Fields not storing

1. Check if field names match between frontend and backend
2. Verify database table has the column
3. Run verification script to see which fields are missing

### Issue: JSON fields not storing

Some fields (like Project Requirements, Product Details) are stored as JSON:
- These should appear as structured objects, not plain text
- Check the database field type - should be `JSON`

---

## Success Criteria

✅ All steps completed with data visible in the form  
✅ Each API call returns 200 OK status  
✅ Verification script shows data in database  
✅ Root Card shows all 8 steps as completed  
✅ All field values match what was entered in the form  
✅ Can view the data when clicking on the root card

---

## API Endpoint Summary

| Step | Endpoint | Controller | DB Table |
|------|----------|-----------|----------|
| 1 | POST `/sales/steps/{id}/client-po` | ClientPOController | `client_po_details` |
| 2a | POST `/sales/steps/{id}/sales-order/sales-product` | SalesOrderDetailController | `sales_order_details` |
| 2b | POST `/sales/steps/{id}/sales-order/quality-compliance` | SalesOrderDetailController | `sales_order_details` |
| 2c | POST `/sales/steps/{id}/sales-order/payment-internal` | SalesOrderDetailController | `sales_order_details` |
| 3 | POST `/sales/steps/{id}/design-engineering` | DesignEngineeringController | `design_engineering_details` |
| 4 | POST `/sales/steps/{id}/material-requirements` | MaterialRequirementsController | `material_requirements_details` |
| 5 | POST `/sales/steps/{id}/production-plan` | ProductionPlanController | `production_plan_details` |
| 6 | POST `/sales/steps/{id}/quality-check` | QualityCheckController | `quality_check_details` |
| 7 | POST `/sales/steps/{id}/shipment` | ShipmentController | `shipment_details` |
| 8 | POST `/sales/steps/{id}/delivery` | DeliveryController | `delivery_details` |
