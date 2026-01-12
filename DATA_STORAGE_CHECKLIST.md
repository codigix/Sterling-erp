# Root Card Wizard - Data Storage Verification Checklist

Use this checklist when testing each form step to ensure all data is being stored correctly.

---

## Pre-Test Setup

- [ ] Backend server is running
- [ ] Frontend is accessible at `localhost:5173`
- [ ] Logged in with valid credentials
- [ ] Have a text editor or notepad ready to record Sales Order ID
- [ ] Browser DevTools are open (F12)

---

## STEP 1: Client PO & Project Details ✓

**Database Table:** `client_po_details`  
**Status:** Should be **COMPLETED** after step submission

### Fill Form Section 1: Client Information
- [ ] Enter PO Number: `PO-001`
- [ ] Enter PO Date: `12-01-2026`
- [ ] Enter Client Name: `sanika mote`
- [ ] Enter Client Email: `sanikanote@gmail.com`
- [ ] Enter Client Phone: `9022319832`

### Fill Form Section 2: Project Details
- [ ] Enter Project Name: `(any project name)`
- [ ] Project Code auto-fills: `(check it appears)`
- [ ] Enter Billing Address: `pimpri` (or blank - optional)
- [ ] Enter Shipping Address: `Wagholi` (or blank - optional)

### Fill Form Section 3: Project Requirements
- [ ] Application/Use Case: `Container handling, Material lifting`
- [ ] Number of Units: `2`
- [ ] Dimensions: `3000mm x 2000mm x 1500mm`
- [ ] Load Capacity: `5000 kg`
- [ ] Material Grade: `EN 10025, ASTM A36`
- [ ] Finish & Coatings: `Epoxy, Powder coated, Painted`
- [ ] Installation Requirement: `Yes, On-site assembly`
- [ ] Testing Standards: `IS 1566, EN 13849-1`
- [ ] Documentation Required: `Complete with drawings`
- [ ] Warranty Terms: `12 months`
- [ ] Penalty Clauses: `1% per week of delay` (optional)
- [ ] Confidentiality Clauses: (optional)
- [ ] Acceptance Criteria: `Load test 150%`

### Save & Verify Step 1
- [ ] Click "Next" button
- [ ] Check Network tab: API call `POST /sales/steps/{id}/client-po` returns **200 OK**
- [ ] See success message: "Step 1 saved successfully!"
- [ ] Note your Sales Order ID: `SO-ID: _______`

### Database Verification
```bash
node backend/comprehensive-form-data-verification.js <SO_ID> 1
```
- [ ] Shows: ✅ Table 'client_po_details' exists
- [ ] Shows: ✅ Data found (1 record(s))
- [ ] Shows: po_number = PO-001
- [ ] Shows: client_name = sanika mote
- [ ] Shows: project_name = (your entry)

---

## STEP 2: Sales Order Details (3 TABS) ✓

**Database Table:** `sales_order_details`  
**Note:** This is ONE table with 3 API calls (one per tab)

### Tab 1: Sales & Product Details
- [ ] Client Email auto-fills: `sanikanote@gmail.com`
- [ ] Client Phone auto-fills: `9022319832`
- [ ] Enter Estimated End Date: `(any future date)`
- [ ] Billing Address: `pimpri` (optional - can autofill from Step 1)
- [ ] Shipping Address: `Wagholi` (optional - can autofill from Step 1)

**Product Item Details Section:**
- [ ] Item Name: `CCIS - Container Canister Integration Stand`
- [ ] Item Description: `Brief description of the item`
- [ ] Components Included: `Long Base Frame, Roller Saddle Assemblies`
- [ ] Certification/Testing Requirements: `QAP, FAT Report, CoC`

### Tab 2: Quality & Compliance
- [ ] Quality Standards: `ISO 9001:2015, DRDO standards`
- [ ] Welding Standards: `AWS D1.1`
- [ ] Surface Finish: `Blasting + Epoxy primer + PU coat`
- [ ] Mechanical Load Testing: `6000 kg load test`
- [ ] Electrical Compliance: `IEC 61010, Safety compliance`
- [ ] Documents Required: `QAP, FAT Report, Installation Manual, Warranty Certificate`
- [ ] Warranty Period: `12 Months from installation`
- [ ] Service Support: `AMC available / On-call support`

### Tab 3: Payment & Internal Information
- [ ] Payment Terms: `40% advance, 40% before dispatch, 20% after installation`
- [ ] Project Priority: `Medium` (select from dropdown)
- [ ] Order Status: `Pending` (should be auto-set)
- [ ] Total Amount: `0.00` (can be left as is or filled)
- [ ] Project Code: `D-401091` (auto-filled from Step 1)
- [ ] Estimated Costing: (optional)
- [ ] Estimated Profit: (optional)
- [ ] Job Card Number: (optional)
- [ ] Special Instructions: `(any notes)` (optional)

### Save & Verify Step 2
- [ ] Click "Next" button
- [ ] Check Network tab: Should see **3 API calls**, all returning **200 OK**:
  - [ ] POST `/sales/steps/{id}/sales-order/sales-product` → 200
  - [ ] POST `/sales/steps/{id}/sales-order/quality-compliance` → 200
  - [ ] POST `/sales/steps/{id}/sales-order/payment-internal` → 200
- [ ] See success message: "Step 1 saved successfully!" (note: step counter updates)

### Database Verification
```bash
node backend/comprehensive-form-data-verification.js <SO_ID> 2
```
- [ ] Shows: ✅ Table 'sales_order_details' exists
- [ ] Shows: ✅ Data found (1 record(s))
- [ ] Shows: client_email = sanikanote@gmail.com
- [ ] Shows: product_details = `{...JSON with itemName...}`
- [ ] Shows: quality_compliance = `{...JSON with standards...}`
- [ ] Shows: payment_terms = `(your entry)`

---

## STEP 3: Design Engineering ✓

**Database Table:** `design_engineering_details`

### Form: Design Engineering
- [ ] Select Design Engineer: `Design Engineer (Default)` (from dropdown)
- [ ] Upload Raw Design Drawings: (optional - can upload or skip)
  - Accepted: PDF, DWG, DXF, STEP, IGS, PNG, JPG
- [ ] Upload Required Documents: (optional - can upload or skip)
  - Accepted: PDF, DOC, DOCX, XLS, XLSX, TXT

### Save & Verify Step 3
- [ ] Click "Next" button
- [ ] Check Network tab: API call `POST /sales/steps/{id}/design-engineering` returns **200 OK**
- [ ] Employee receives notification for design engineering assignment

### Database Verification
```bash
node backend/comprehensive-form-data-verification.js <SO_ID> 3
```
- [ ] Shows: ✅ Table 'design_engineering_details' exists
- [ ] Shows: ✅ Data found (1 record(s))
- [ ] Shows: documents = `[...]` (if files uploaded, shows JSON array)
- [ ] Shows: design_status = draft

---

## STEP 4: Material Requirements ✓

**Database Table:** `material_requirements_details`

### Form: Material Requirements

**Instructions:** Check the categories and items you need

- [ ] **Structural**
  - [ ] Steel Sections (if needed)
  - [ ] Plates (if needed)

- [ ] **Hardware**
  - [ ] Fasteners & Hardware (if needed)

- [ ] **Components**
  - [ ] Machined Parts (if needed)
  - [ ] Mechanical Components (if needed)

- [ ] **Electrical**
  - [ ] Electrical & Automation (if needed)

- [ ] **Safety**
  - [ ] Safety Materials (if needed)

- [ ] **Consumables**
  - [ ] Consumables & Paint (if needed)

- [ ] **Docs**
  - [ ] Documentation Materials (if needed)

- [ ] Click "Add Selected Materials" button
- [ ] Select Inventory Manager: `Inventory Manager (Default)` (from dropdown)

### Save & Verify Step 4
- [ ] Click "Next" button
- [ ] Check Network tab: API call `POST /sales/steps/{id}/material-requirements` returns **200 OK**
- [ ] Inventory Manager receives notification

### Database Verification
```bash
node backend/comprehensive-form-data-verification.js <SO_ID> 4
```
- [ ] Shows: ✅ Table 'material_requirements_details' exists
- [ ] Shows: ✅ Data found (1 record(s))
- [ ] Shows: materials = `[...]` (JSON array with selected items)
- [ ] Shows: procurement_status = pending

---

## STEP 5: Production Plan ✓

**Database Table:** `production_plan_details`

### Form: Manufacturing Timeline
- [ ] Production Start Date: `(select a date)`
- [ ] Estimated Completion Date: `(select a date after start)`

### Form: Material Procurement Status
- [ ] Procurement Status: `(select from dropdown - Pending/Ordered/Partial/Received)`

### Form: Production Phases
**Select phases required for your project:**
- [ ] Material Prep
- [ ] Fabrication
- [ ] Machining
- [ ] Surface Prep
- [ ] Assembly
- [ ] Electrical

- [ ] Select Production Manager: `Production Manager (Default)` (from dropdown)

### Save & Verify Step 5
- [ ] Click "Next" button
- [ ] Check Network tab: API call `POST /sales/steps/{id}/production-plan` returns **200 OK**
- [ ] Production Manager receives notification

### Database Verification
```bash
node backend/comprehensive-form-data-verification.js <SO_ID> 5
```
- [ ] Shows: ✅ Table 'production_plan_details' exists
- [ ] Shows: ✅ Data found (1 record(s))
- [ ] Shows: timeline = `{...JSON with dates...}`
- [ ] Shows: selected_phases = `[...]` (JSON array with selected phases)

---

## STEP 6: Quality Check & Compliance ✓

**Database Table:** `quality_check_details`

### Form: Quality Standards
- [ ] Quality Standards: `DRDO standard` (or your entry)
- [ ] Welding Standards: `AWS` (or your entry)

### Form: Material & Surface
- [ ] Surface Finish: `PU coating` (or your entry)
- [ ] Mechanical Load Testing: `6000kg` (or your entry)

### Form: Compliance
- [ ] Electrical Compliance: `Safety complains` (or your entry)
- [ ] Documents Required: `FAT reports` (or your entry)

### Form: Warranty & Support
- [ ] Warranty Period: `12 month` (or your entry)
- [ ] Service Support: `AMC` (or your entry)

### Form: Project Assignment
- [ ] Assign to Employee: `QC Manager (Default)` (from dropdown)

### Save & Verify Step 6
- [ ] Click "Next" button
- [ ] Check Network tab: API call `POST /sales/steps/{id}/quality-check` returns **200 OK**
- [ ] QC Manager receives notification

### Database Verification
```bash
node backend/comprehensive-form-data-verification.js <SO_ID> 6
```
- [ ] Shows: ✅ Table 'quality_check_details' exists
- [ ] Shows: ✅ Data found (1 record(s))
- [ ] Shows: quality_standards = DRDO standard
- [ ] Shows: qc_status = pending

---

## STEP 7: Shipment & Logistics ✓

**Database Table:** `shipment_details`

### Form: Delivery Schedule
- [ ] Delivery Schedule: `12-16 weeks from PO` (or your entry)

### Form: Packaging & Dispatch
- [ ] Packaging Information: `Wooden box, anti-rust oil` (or your entry)
- [ ] Dispatch Mode: `Road transport` (or your entry)

### Form: Installation & Commissioning
- [ ] Installation Required: `Yes, on-site installation` (or your entry)
- [ ] Site Commissioning: `Yes, commissioning required` (or your entry)

### Form: Shipment Process
- [ ] Marking: `Marked and labeled` (or your entry)
- [ ] Dismantling: `Not required` (or your entry)
- [ ] Packing: `Industrial packing applied` (or your entry)
- [ ] Dispatch: `Ready for dispatch` (or your entry)

- [ ] Select Logistics Manager: `Logistics Manager (Default)` (from dropdown)

### Save & Verify Step 7
- [ ] Click "Next" button
- [ ] Check Network tab: API call `POST /sales/steps/{id}/shipment` returns **200 OK**
- [ ] Logistics Manager receives notification

### Database Verification
```bash
node backend/comprehensive-form-data-verification.js <SO_ID> 7
```
- [ ] Shows: ✅ Table 'shipment_details' exists
- [ ] Shows: ✅ Data found (1 record(s))
- [ ] Shows: delivery_schedule = `12-16 weeks from PO`
- [ ] Shows: shipment_status = pending

---

## STEP 8: Delivery & Handover ✓

**Database Table:** `delivery_details`

### Form: Final Delivery
- [ ] Actual Delivery Date: `(select a date after completion)`
- [ ] Delivered To (Name): `(enter recipient name)`

### Form: Installation Status
- [ ] Installation Completed: `yes` (select from dropdown)
- [ ] Site Commissioning Completed: `yes` (select from dropdown)

### Form: Warranty & Compliance
- [ ] Warranty Terms Acceptance: `12 month` (or your entry)

### Form: Project Completion
- [ ] Completion Remarks: `Function test` (or your entry)

### Form: Internal Project Info
- [ ] Project Manager: `(enter name)` (optional)
- [ ] Production Supervisor: `(enter name)` (optional)

### Form: Delivery Assignment
- [ ] Assign Delivery to Employee: `Logistics Manager (Default)` (from dropdown)

### Save & Verify Step 8
- [ ] Click "Submit Order" button (last step)
- [ ] Check Network tab: API call `POST /sales/steps/{id}/delivery` returns **200 OK**
- [ ] See success message: "Sales Order created and all steps saved successfully!"
- [ ] Page redirects after 2 seconds

### Database Verification
```bash
node backend/comprehensive-form-data-verification.js <SO_ID> 8
```
- [ ] Shows: ✅ Table 'delivery_details' exists
- [ ] Shows: ✅ Data found (1 record(s))
- [ ] Shows: actual_delivery_date = (your date)
- [ ] Shows: delivery_status = pending

---

## Final Verification

### Complete Verification for All Steps
```bash
node backend/comprehensive-form-data-verification.js <SO_ID>
```
- [ ] All 8 tables exist
- [ ] All 8 tables have data
- [ ] All required fields are present
- [ ] No missing columns

### View in Root Cards
1. Go to **Admin Panel → Root Cards**
2. Find the root card created for your sales order
3. [ ] All 8 steps show ✅ (checkmark)
4. [ ] Can view each step's data
5. [ ] Assigned employees are correct

### View in Sales Orders
1. Go to **Admin Panel → Sales Orders**
2. Find your created sales order
3. [ ] Status shows as "pending" or completed
4. [ ] PO Number matches
5. [ ] Total Amount is correct

---

## Success Criteria ✅

You have successfully verified data storage when:

- ✅ All 8 form steps filled out
- ✅ All 8 API calls return 200 OK
- ✅ Verification script shows all 8 tables have data
- ✅ Root card shows all steps completed
- ✅ Sales order displays correct information
- ✅ No data is missing or empty (except optional fields)
- ✅ All assigned employees received notifications
- ✅ Database queries show all 8 records created

---

## Troubleshooting Quick Links

| Issue | Check This |
|-------|-----------|
| API returns 400 | Check required fields are filled |
| API returns 401 | Re-login, token may have expired |
| API returns 500 | Check backend console for errors |
| Data not in DB | Run verification script, check table exists |
| Fields missing | Check database schema with DESCRIBE |
| Form not validating | Check browser console for JS errors |
| File upload fails | Check file type is in accepted list |
| Employee not assigned | Check employee exists and is active |

---

## Commands Reference

```bash
# Full verification for sales order 5
node backend/comprehensive-form-data-verification.js 5

# Check only Step 1
node backend/comprehensive-form-data-verification.js 5 1

# Check only Step 2
node backend/comprehensive-form-data-verification.js 5 2

# Check all fields per step (alternative)
node backend/validate-step-fields.js 5

# Initialize database tables (if needed)
node backend/initDb.js
```

---

**Last Updated:** 2026-01-12  
**Version:** 1.0
