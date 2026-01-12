# Form Field to Database Mapping - Complete Reference

This document maps every form field from each step screenshot to its corresponding database column and validates storage.

---

## STEP 1: Client PO & Project Details (3 TABS - 1 TABLE)

**Database Table:** `client_po_details`  
**Frontend Handler:** `stepDataHandler.js` → `buildStepPayload(1, formData)`  
**API Endpoint:** `POST /sales/steps/{id}/client-po`  
**Controller:** `ClientPOController.createOrUpdate()`

### Tab 1: Client Information

| Form Field | Frontend Variable | DB Column | Type | Required | Notes |
|---|---|---|---|---|---|
| PO Number | `poNumber` | `po_number` | VARCHAR(100) | ✅ | Unique constraint |
| PO Date | `poDate` | `po_date` | DATE | ✅ | Format: DD-MM-YYYY |
| Client Name | `clientName` | `client_name` | VARCHAR(255) | ✅ | e.g., "sanika mote" |
| Client Email | `clientEmail` | `client_email` | VARCHAR(100) | ✅ | e.g., "sanikanote@gmail.com" |
| Client Phone | `clientPhone` | `client_phone` | VARCHAR(20) | ✅ | 10-digit e.g., "9022319832" |

### Tab 2: Project Details

| Form Field | Frontend Variable | DB Column | Type | Required | Notes |
|---|---|---|---|---|---|
| Project Name | `projectName` | `project_name` | VARCHAR(255) | ✅ | Used to generate project code |
| Project Code | `projectCode` | `project_code` | VARCHAR(100) | ✅ | Auto-generated from name or user input |
| Billing Address | `billingAddress` | `billing_address` | TEXT | ❌ | Optional, e.g., "pimpri" |
| Shipping Address | `shippingAddress` | `shipping_address` | TEXT | ❌ | Optional, e.g., "Wagholi" |

### Tab 3: Project Requirements (JSON OBJECT)

| Form Field | Frontend Variable | DB Column | Stored As | Notes |
|---|---|---|---|---|
| Application / Use Case | `projectRequirements.application` | `project_requirements` | JSON | "Container handling, Material lifting" |
| Number of Units | `projectRequirements.numberOfUnits` | `project_requirements` | JSON | e.g., 2 |
| Dimensions (L x W x H) | `projectRequirements.dimensions` | `project_requirements` | JSON | e.g., "3000mm x 2000mm x 1500mm" |
| Load Capacity | `projectRequirements.loadCapacity` | `project_requirements` | JSON | e.g., "5000 kg" |
| Material Grade | `projectRequirements.materialGrade` | `project_requirements` | JSON | e.g., "EN 10025, ASTM A36" |
| Finish & Coatings | `projectRequirements.finishCoatings` | `project_requirements` | JSON | e.g., "Epoxy, Powder coated, Painted" |
| Installation Requirement | `projectRequirements.installationRequirement` | `project_requirements` | JSON | "Yes, On-site assembly, Factory assembled" |
| Testing Standards | `projectRequirements.testingStandards` | `project_requirements` | JSON | e.g., "IS 1566, EN 13849-1" |
| Documentation Required | `projectRequirements.documentationRequirement` | `project_requirements` | JSON | "Complete with drawings, FAT reports" |
| Warranty Terms | `projectRequirements.warrantTerms` | `project_requirements` | JSON | e.g., "12 months" |
| Penalty Clauses | `projectRequirements.penaltyClauses` | `project_requirements` | JSON | e.g., "1% per week of delay" |
| Confidentiality Clauses | `projectRequirements.confidentialityClauses` | `project_requirements` | JSON | e.g., "Project info confidential" |
| Acceptance Criteria | `projectRequirements.acceptanceCriteria` | `project_requirements` | JSON | "Load test 150%, Dimension tolerance ±5mm" |
| Notes | `notes` | `notes` | TEXT | Optional notes for the PO |

---

## STEP 2: Sales Order Details (3 TABS - 1 TABLE)

**Database Table:** `sales_order_details`  
**Frontend Handler:** `stepDataHandler.js` → `buildStepPayload(2, formData)` (builds 3 payloads)  
**API Endpoints:** 3 separate POST calls  
**Controller:** `SalesOrderDetailController` (3 methods)

### Tab 2A: Sales & Product Details

**API:** `POST /sales/steps/{id}/sales-order/sales-product`

| Form Field | Frontend Variable | DB Column | Type | Required | Notes |
|---|---|---|---|---|---|
| Client Email | `clientEmail` | `client_email` | VARCHAR(100) | ✅ | From Step 1 |
| Client Phone | `clientPhone` | `client_phone` | VARCHAR(20) | ✅ | From Step 1 |
| Estimated End Date | `estimatedEndDate` | `estimated_end_date` | DATE | ✅ | Format: DD-MM-YYYY |
| Billing Address | `billingAddress` | `billing_address` | TEXT | ❌ | From Step 1, e.g., "pimpri" |
| Shipping Address | `shippingAddress` | `shipping_address` | TEXT | ❌ | From Step 1, e.g., "Wagholi" |
| Item Name | `productDetails.itemName` | `product_details` (JSON) | JSON | ❌ | e.g., "CCIS - Container Canister Integration Stand" |
| Item Description | `productDetails.itemDescription` | `product_details` (JSON) | JSON | ❌ | Brief description of the item |
| Components Included | `productDetails.componentsList` | `product_details` (JSON) | JSON | ❌ | e.g., "Long Base Frame, Roller Saddle Assemblies" |
| Certification/Testing Requirements | `productDetails.certification` | `product_details` (JSON) | JSON | ❌ | e.g., "QAP, FAT Report, CoC" |

### Tab 2B: Quality & Compliance

**API:** `POST /sales/steps/{id}/sales-order/quality-compliance`

| Form Field | Frontend Variable | DB Column | Type | Required | Notes |
|---|---|---|---|---|---|
| Quality Standards | `qualityCompliance.qualityStandards` | `quality_compliance` (JSON) | JSON | ❌ | e.g., "ISO 9001:2015, DRDO standards" |
| Welding Standards | `qualityCompliance.weldingStandards` | `quality_compliance` (JSON) | JSON | ❌ | e.g., "AWS D1.1" |
| Surface Finish | `qualityCompliance.surfaceFinish` | `quality_compliance` (JSON) | JSON | ❌ | e.g., "Blasting + Epoxy primer + PU coat" |
| Mechanical Load Testing | `qualityCompliance.mechanicalLoadTesting` | `quality_compliance` (JSON) | JSON | ❌ | e.g., "6000 kg load test" |
| Electrical Compliance | `qualityCompliance.electricalCompliance` | `quality_compliance` (JSON) | JSON | ❌ | e.g., "IEC 61010, Safety compliance" |
| Documents Required | `qualityCompliance.documentsRequired` | `quality_compliance` (JSON) | JSON | ❌ | e.g., "QAP, FAT Report, Installation Manual, Warranty Certificate" |
| Warranty Period | `warrantySupport.warrantyPeriod` | `warranty_support` (JSON) | JSON | ❌ | e.g., "12 Months from installation" |
| Service Support | `warrantySupport.serviceSupport` | `warranty_support` (JSON) | JSON | ❌ | e.g., "AMC available / On-call support" |

### Tab 2C: Payment & Internal Information

**API:** `POST /sales/steps/{id}/sales-order/payment-internal`

| Form Field | Frontend Variable | DB Column | Type | Required | Notes |
|---|---|---|---|---|---|
| Payment Terms | `paymentTerms` | `payment_terms` | TEXT | ❌ | e.g., "40% advance, 40% before dispatch, 20% after installation" |
| Project Priority | `projectPriority` | `project_priority` | VARCHAR(50) | ❌ | Dropdown: low/medium/high/critical |
| Order Status | `status` | N/A | - | - | Set to "Pending" on creation |
| Total Amount | `totalAmount` | `total_amount` | DECIMAL(12,2) | ❌ | e.g., "0.00" (can be updated) |
| Project Code | `projectCode` | `project_code` | VARCHAR(100) | ❌ | e.g., "D-401091" (from Step 1) |
| Estimated Costing (₹) | `internalInfo.estimatedCosting` | `internal_info` (JSON) | JSON | ❌ | Internal costing estimate |
| Estimated Profit (₹) | `internalInfo.estimatedProfit` | `internal_info` (JSON) | JSON | ❌ | Internal profit estimate |
| Job Card Number | `internalInfo.jobCardNumber` | `internal_info` (JSON) | JSON | ❌ | Auto-generated or manual entry |
| Special Instructions | `specialInstructions` | `special_instructions` | TEXT | ❌ | e.g., "Any special instructions or notes" |

---

## STEP 3: Design Engineering

**Database Table:** `design_engineering_details`  
**Frontend:** File uploads for Raw Design Drawings and Required Documents  
**API Endpoint:** `POST /sales/steps/{id}/design-engineering`  
**Controller:** `DesignEngineeringController.createOrUpdate()`

| Form Field | Frontend Variable | DB Column | Type | Notes |
|---|---|---|---|---|
| Design Engineer (Assignment) | `assignedTo` | `assigned_to` (via SalesOrderStep) | INT | Employee ID for notifications |
| Raw Design Drawings | `documents` | `documents` | JSON | File upload metadata and paths |
| Required Documents | `documents` | `documents` | JSON | File upload metadata and paths |
| Design Status | Auto-set | `design_status` | ENUM | 'draft' on creation |

**File Types Accepted:**
- Design Drawings: PDF, DWG, DXF, STEP, IGS, PNG, JPG
- Documents: PDF, DOC, DOCX, XLS, XLSX, TXT

---

## STEP 4: Material Requirements

**Database Table:** `material_requirements_details`  
**Frontend:** Checkbox selections from 7 categories  
**API Endpoint:** `POST /sales/steps/{id}/material-requirements`  
**Controller:** `MaterialRequirementsController.createOrUpdate()`

### Form Structure
The form shows **Checkbox Groups** for material categories. Selected items are stored as a JSON array.

| Form Section | Frontend Variable | DB Column | Type | Example |
|---|---|---|---|---|
| Structural Section | `materials[]` | `materials` | JSON | `[{"category": "Structural", "items": ["Steel Sections", "Plates"]}]` |
| Hardware | `materials[]` | `materials` | JSON | `[{"category": "Hardware", "items": ["Fasteners & Hardware"]}]` |
| Components | `materials[]` | `materials` | JSON | `[{"category": "Components", "items": ["Machined Parts", "Mechanical Components"]}]` |
| Electrical | `materials[]` | `materials` | JSON | `[{"category": "Electrical", "items": ["Electrical & Automation"]}]` |
| Safety | `materials[]` | `materials` | JSON | `[{"category": "Safety", "items": ["Safety Materials"]}]` |
| Consumables | `materials[]` | `materials` | JSON | `[{"category": "Consumables", "items": ["Consumables & Paint"]}]` |
| Docs | `materials[]` | `materials` | JSON | `[{"category": "Docs", "items": ["Documentation Materials"]}]` |
| Total Material Cost | Auto-calculated | `total_material_cost` | DECIMAL(12,2) | Calculated from selected items |
| Inventory Manager (Assignment) | `assignedTo` | `assigned_to` (via SalesOrderStep) | INT | Employee ID |

---

## STEP 5: Production Plan

**Database Table:** `production_plan_details`  
**Frontend:** Timeline, Phase selection, Manager assignment  
**API Endpoint:** `POST /sales/steps/{id}/production-plan`  
**Controller:** `ProductionPlanController.createOrUpdate()`

| Form Field | Frontend Variable | DB Column | Type | Notes |
|---|---|---|---|---|
| Production Start Date | `timeline.startDate` | `timeline` (JSON) | JSON | Format: DD-MM-YYYY |
| Estimated Completion Date | `timeline.endDate` | `timeline` (JSON) | JSON | Format: DD-MM-YYYY |
| Procurement Status | `procurementStatus` | Stored in JSON | SELECT | Dropdown: Pending/Ordered/Partial/Received |
| **Production Phases** (Checkboxes) | `selectedPhases` | `selected_phases` (JSON) | JSON | Selected phases: Material Prep, Fabrication, Machining, Surface Prep, Assembly, Electrical |
| Material Prep Details | `phaseDetails.materialPrep` | `phase_details` (JSON) | JSON | Details for this phase |
| Fabrication Details | `phaseDetails.fabrication` | `phase_details` (JSON) | JSON | Details for this phase |
| Machining Details | `phaseDetails.machining` | `phase_details` (JSON) | JSON | Details for this phase |
| Surface Prep Details | `phaseDetails.surfacePrep` | `phase_details` (JSON) | JSON | Details for this phase |
| Assembly Details | `phaseDetails.assembly` | `phase_details` (JSON) | JSON | Details for this phase |
| Electrical Details | `phaseDetails.electrical` | `phase_details` (JSON) | JSON | Details for this phase |
| Production Manager (Assignment) | `assignedTo` | `assigned_to` (via SalesOrderStep) | INT | Employee ID |
| Production Notes | `productionNotes` | `production_notes` | TEXT | Optional notes |

---

## STEP 6: Quality Check & Compliance

**Database Table:** `quality_check_details`  
**Frontend:** Form with multiple compliance fields and employee assignment  
**API Endpoint:** `POST /sales/steps/{id}/quality-check`  
**Controller:** `QualityCheckController.createOrUpdate()`

| Form Field | Frontend Variable | DB Column | Type | Notes |
|---|---|---|---|---|
| **Quality Standards Section** |
| Quality Standards | `qualityCompliance.qualityStandards` | `quality_standards` | VARCHAR(255) | e.g., "DRDO standard" |
| Welding Standards | `qualityCompliance.weldingStandards` | `welding_standards` | VARCHAR(255) | e.g., "AWS" |
| **Material & Surface Section** |
| Surface Finish | `qualityCompliance.surfaceFinish` | `surface_finish` | VARCHAR(255) | e.g., "PU coating" |
| Mechanical Load Testing | `qualityCompliance.mechanicalLoadTesting` | `mechanical_load_testing` | VARCHAR(255) | e.g., "6000 kg load test" |
| **Compliance Section** |
| Electrical Compliance | `qualityCompliance.electricalCompliance` | `electrical_compliance` | VARCHAR(255) | e.g., "Safety complains" |
| Documents Required | `qualityCompliance.documentsRequired` | `documents_required` | TEXT | e.g., "QAP, FAT Report, Installation Manual" |
| **Warranty & Support** |
| Warranty Period | `warrantySupport.warrantyPeriod` | `warranty_period` | VARCHAR(100) | e.g., "12 month" |
| Service Support | `warrantySupport.serviceSupport` | `service_support` | VARCHAR(255) | e.g., "AMC" |
| **Assignment** |
| Assign to Employee | `assignedTo` | `assigned_to` (via SalesOrderStep) | INT | QC Manager Employee ID |
| QC Status | Auto-set | `qc_status` | ENUM | 'pending' on creation |

---

## STEP 7: Shipment & Logistics

**Database Table:** `shipment_details`  
**Frontend:** Delivery schedule, packaging, dispatch details  
**API Endpoint:** `POST /sales/steps/{id}/shipment`  
**Controller:** `ShipmentController.createOrUpdate()`

| Form Field | Frontend Variable | DB Column | Type | Notes |
|---|---|---|---|---|
| **Delivery Schedule** |
| Delivery Schedule | `deliveryTerms.deliverySchedule` | `delivery_schedule` | VARCHAR(500) | e.g., "12-16 weeks from PO" |
| **Packaging & Dispatch** |
| Packaging Information | `deliveryTerms.packagingInfo` | `packaging_info` | VARCHAR(500) | e.g., "Wooden box, anti-rust oil" |
| Dispatch Mode | `deliveryTerms.dispatchMode` | `dispatch_mode` | VARCHAR(255) | e.g., "Road transport" |
| **Installation & Commissioning** |
| Installation Required | `deliveryTerms.installationRequired` | `installation_required` | VARCHAR(500) | e.g., "Yes, on-site installation" |
| Site Commissioning | `deliveryTerms.siteCommissioning` | `site_commissioning` | VARCHAR(500) | e.g., "Yes, commissioning required" |
| **Shipment Process** |
| Marking | `shipment.marking` | `marking` | VARCHAR(500) | e.g., "Marked and labeled" |
| Dismantling (if needed) | `shipment.dismantling` | `dismantling` | VARCHAR(500) | e.g., "Not required" |
| Packing | `shipment.packing` | `packing` | VARCHAR(500) | e.g., "Industrial packing applied" |
| Dispatch | `shipment.dispatch` | `dispatch` | VARCHAR(500) | e.g., "Ready for dispatch" |
| Logistics Manager (Assignment) | `assignedTo` | `assigned_to` (via SalesOrderStep) | INT | Employee ID |
| Shipment Status | Auto-set | `shipment_status` | ENUM | 'pending' on creation |

---

## STEP 8: Delivery & Handover

**Database Table:** `delivery_details`  
**Frontend:** Final delivery details, installation status, warranty acceptance  
**API Endpoint:** `POST /sales/steps/{id}/delivery`  
**Controller:** `DeliveryController.createOrUpdate()`

| Form Field | Frontend Variable | DB Column | Type | Notes |
|---|---|---|---|---|
| **Final Delivery** |
| Actual Delivery Date | `actualDeliveryDate` | `actual_delivery_date` | DATE | Format: DD-MM-YYYY |
| Delivered To (Name) | `deliveredTo` | `customer_contact` | VARCHAR(255) | Recipient name |
| **Installation Status** |
| Installation Completed | `installationCompleted` | `installation_completed` | VARCHAR(500) | Dropdown: Yes/No, with details |
| Site Commissioning Completed | `siteCommissioningCompleted` | `site_commissioning_completed` | VARCHAR(500) | Dropdown: Yes/No, with details |
| **Warranty & Compliance** |
| Warranty Terms Acceptance | `warrantyTermsAcceptance` | `warranty_terms_acceptance` | VARCHAR(500) | e.g., "12 month" |
| **Project Completion** |
| Completion Remarks | `completionRemarks` | `completion_remarks` | TEXT | e.g., "Function test" |
| **Internal Project Info** |
| Project Manager | `projectManager` | `project_manager` | VARCHAR(255) | Name or ID |
| Production Supervisor | `productionSupervisor` | `production_supervisor` | VARCHAR(255) | Name or ID |
| **Delivery Assignment** |
| Assign Delivery to Employee | `assignedTo` | `assigned_to` | INT | Employee ID |
| Delivery Status | Auto-set | `delivery_status` | ENUM | 'pending' on creation |

---

## Database Schema Verification

### Check if all tables exist:
```sql
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'sterling_erp' ORDER BY TABLE_NAME;
```

### Check specific table structure:
```sql
-- Example: Check client_po_details table
DESCRIBE client_po_details;
SHOW CREATE TABLE client_po_details;
```

### Count records per step:
```sql
SELECT 
  'Step 1' as Step, COUNT(*) as Records FROM client_po_details WHERE sales_order_id = 5
UNION ALL SELECT 'Step 2', COUNT(*) FROM sales_order_details WHERE sales_order_id = 5
UNION ALL SELECT 'Step 3', COUNT(*) FROM design_engineering_details WHERE sales_order_id = 5
UNION ALL SELECT 'Step 4', COUNT(*) FROM material_requirements_details WHERE sales_order_id = 5
UNION ALL SELECT 'Step 5', COUNT(*) FROM production_plan_details WHERE sales_order_id = 5
UNION ALL SELECT 'Step 6', COUNT(*) FROM quality_check_details WHERE sales_order_id = 5
UNION ALL SELECT 'Step 7', COUNT(*) FROM shipment_details WHERE sales_order_id = 5
UNION ALL SELECT 'Step 8', COUNT(*) FROM delivery_details WHERE sales_order_id = 5;
```

---

## Summary Table: 8 Steps → 8 Database Tables

| Step | Form Name | Database Table | Record Count | API Endpoint |
|------|-----------|---|---|---|
| 1 | Client PO & Project Details | `client_po_details` | 1 record | POST `/sales/steps/{id}/client-po` |
| 2 | Sales Order Details (3 tabs) | `sales_order_details` | 1 record | POST `/sales/steps/{id}/sales-order/sales-product` |
| | | | | POST `/sales/steps/{id}/sales-order/quality-compliance` |
| | | | | POST `/sales/steps/{id}/sales-order/payment-internal` |
| 3 | Design Engineering | `design_engineering_details` | 1 record | POST `/sales/steps/{id}/design-engineering` |
| 4 | Material Requirements | `material_requirements_details` | 1 record | POST `/sales/steps/{id}/material-requirements` |
| 5 | Production Plan | `production_plan_details` | 1 record | POST `/sales/steps/{id}/production-plan` |
| 6 | Quality Check & Compliance | `quality_check_details` | 1 record | POST `/sales/steps/{id}/quality-check` |
| 7 | Shipment & Logistics | `shipment_details` | 1 record | POST `/sales/steps/{id}/shipment` |
| 8 | Delivery & Handover | `delivery_details` | 1 record | POST `/sales/steps/{id}/delivery` |

---

## Verification Workflow

1. **Create new Sales Order** (Step 1)
2. **Fill all 8 steps** with data
3. **Submit each step** (click "Next")
4. **Check Network tab** - all API calls should return 200 OK
5. **Run verification:**
   ```bash
   node backend/comprehensive-form-data-verification.js <SO_ID>
   ```
6. **Verify in Root Card view** - all steps should show as completed with ✅
7. **Check Database** - run SQL queries to verify data presence
