# Production Plan (Step 6) - Complete API Reference

## Overview
The Production Plan step manages the manufacturing timeline, material procurement status, and production phases workflow. The frontend has two main tabs:
1. **Timeline & Procurement** - Managing production start date, completion date, and procurement status
2. **Production Phases** - Managing production phases, phase tracking, and phase status updates

## Database Schema

### `production_plan_details` Table
```sql
CREATE TABLE IF NOT EXISTS production_plan_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_order_id INT NOT NULL UNIQUE,
    timeline JSON,                          -- Timeline information (start/end dates)
    selected_phases JSON,                   -- Selected production phases
    phase_details JSON,                     -- Detailed info for each phase
    production_notes TEXT,
    procurement_status VARCHAR(50),         -- Pending, In Progress, Completed, Pending Approval
    estimated_completion_date DATE,
    production_start_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    INDEX idx_sales_order (sales_order_id)
);
```

## API Endpoints

### 1. Create/Update Production Plan
**POST** `/api/sales-orders/:salesOrderId/production-plan`

**Request Body:**
```json
{
  "productionStartDate": "2025-01-15",
  "estimatedCompletionDate": "2025-02-15",
  "procurementStatus": "In Progress",
  "productionNotes": "Follow quality standards ISO 9001"
}
```

**Response:** `200 OK` or `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "salesOrderId": 1,
    "timeline": { ... },
    "selectedPhases": { ... },
    "phaseDetails": { ... },
    "procurementStatus": "In Progress",
    "productionStartDate": "2025-01-15",
    "estimatedCompletionDate": "2025-02-15",
    "productionNotes": "Follow quality standards ISO 9001",
    "createdAt": "2025-01-10T10:00:00Z",
    "updatedAt": "2025-01-10T10:00:00Z"
  },
  "message": "Production plan saved"
}
```

### 2. Get Production Plan
**GET** `/api/sales-orders/:salesOrderId/production-plan`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "salesOrderId": 1,
    "timeline": { ... },
    "selectedPhases": { ... },
    "phaseDetails": { ... },
    "procurementStatus": "In Progress",
    "productionStartDate": "2025-01-15",
    "estimatedCompletionDate": "2025-02-15",
    "productionNotes": "Follow quality standards ISO 9001",
    "createdAt": "2025-01-10T10:00:00Z",
    "updatedAt": "2025-01-10T10:00:00Z"
  },
  "message": "Production plan retrieved"
}
```

### 3. Validate Timeline & Procurement
**POST** `/api/sales-orders/:salesOrderId/production-plan/validate-timeline`

**Request Body:**
```json
{
  "productionStartDate": "2025-01-15",
  "estimatedCompletionDate": "2025-02-15",
  "procurementStatus": "In Progress"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": []
  },
  "message": "Timeline validation result"
}
```

**Validation Rules:**
- ✓ Production start date is required
- ✓ Estimated completion date is required
- ✓ Completion date must be after start date
- ⚠ Procurement status should be specified

### 4. Validate Production Phases
**GET** `/api/sales-orders/:salesOrderId/production-plan/validate-phases`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": [
      "Phase marking-1 has no assignee"
    ],
    "totalPhases": 2
  },
  "message": "Phases validation result"
}
```

**Validation Checks:**
- ✓ Phase status is set
- ✓ Phase and subtask information exists
- ⚠ Each phase has an assignee
- ⚠ At least one phase is added

---

## Production Phase Management

### 5. Add Production Phase
**POST** `/api/sales-orders/:salesOrderId/production-plan/phases`

**Request Body:**
```json
{
  "phaseKey": "marking-1",
  "phaseData": {
    "phase": "Material Prep",
    "subTask": {
      "value": "marking",
      "label": "Marking"
    },
    "stepNumber": 1,
    "processType": "in_house",
    "assignee": "John Doe",
    "status": "Not Started",
    "startTime": null,
    "finishTime": null,
    "componentName": "Shaft Assembly",
    "drawingNo": "DRG-001-R2",
    "markingMethod": "Hand",
    "dimensionsMarked": "50mm, 100mm, Ø25mm",
    "toolsUsed": "Marker, Scribe, Punch",
    "markingDoneBy": "John Doe",
    "markingDate": "2025-01-15",
    "remarks": "Follow drawing exactly",
    "qcInspectionResult": "Pass"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "phase": "Material Prep",
    "subTask": { ... },
    "stepNumber": 1,
    "processType": "in_house",
    "assignee": "John Doe",
    "status": "Not Started",
    "componentName": "Shaft Assembly",
    "drawingNo": "DRG-001-R2",
    "markingMethod": "Hand",
    "dimensionsMarked": "50mm, 100mm, Ø25mm",
    "toolsUsed": "Marker, Scribe, Punch",
    "markingDate": "2025-01-15",
    "remarks": "Follow drawing exactly",
    "qcInspectionResult": "Pass"
  },
  "message": "Production phase added"
}
```

### 6. Get All Production Phases
**GET** `/api/sales-orders/:salesOrderId/production-plan/phases`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "marking-1": {
      "phase": "Material Prep",
      "subTask": { ... },
      "stepNumber": 1,
      "processType": "in_house",
      "assignee": "John Doe",
      "status": "Not Started"
    },
    "cutting_laser-1": {
      "phase": "Material Prep",
      "subTask": { ... },
      "stepNumber": 2,
      "processType": "in_house",
      "assignee": "Laser Team",
      "status": "Not Started"
    }
  },
  "message": "Production phases retrieved"
}
```

### 7. Get Specific Production Phase
**GET** `/api/sales-orders/:salesOrderId/production-plan/phases/:phaseKey`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "phase": "Material Prep",
    "subTask": { ... },
    "stepNumber": 1,
    "processType": "in_house",
    "assignee": "John Doe",
    "status": "Not Started",
    "componentName": "Shaft Assembly",
    "drawingNo": "DRG-001-R2"
  },
  "message": "Phase retrieved"
}
```

### 8. Update Production Phase Details
**PUT** `/api/sales-orders/:salesOrderId/production-plan/phases/:phaseKey`

**Request Body:**
```json
{
  "assignee": "Jane Smith",
  "status": "In Progress",
  "remarks": "Updated remarks",
  "qcInspectionResult": "Pending"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "phase": "Material Prep",
    "subTask": { ... },
    "assignee": "Jane Smith",
    "status": "In Progress",
    "remarks": "Updated remarks",
    "qcInspectionResult": "Pending"
  },
  "message": "Production phase updated"
}
```

### 9. Remove Production Phase
**DELETE** `/api/sales-orders/:salesOrderId/production-plan/phases/:phaseKey`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {},
  "message": "Production phase removed"
}
```

### 10. Update Production Phase Status
**POST** `/api/sales-orders/:salesOrderId/production-plan/phases/:phaseKey/status`

**Request Body:**
```json
{
  "status": "In Progress",
  "startTime": "2025-01-15T09:30:00Z",
  "finishTime": null
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "phase": "Material Prep",
    "subTask": { ... },
    "stepNumber": 1,
    "status": "In Progress",
    "startTime": "2025-01-15T09:30:00Z",
    "finishTime": null,
    "assignee": "John Doe"
  },
  "message": "Production phase status updated"
}
```

**Status Transitions:**
- `Not Started` → `In Progress` (when Start button clicked)
- `In Progress` → `Completed` (when Finish button clicked)
- `In Progress` → `On Hold` (when Hold button clicked)
- `On Hold` or `Not Started` → `Cancelled` (when Cancel button clicked)

---

## Production Phases Configuration

### Supported Production Phases
The system supports 6 main production phases, each with specific subtasks:

#### 1. Material Prep
- **marking** - Marking materials with dimensions and references
- **cutting_laser** - Cutting using laser, plasma, or bandsaw

#### 2. Fabrication
- **edge_prep** - Preparing edges for welding
- **mig_welding** - MIG/SMAW/TIG welding operations
- **fit_up** - Fit-up and tack welding
- **structure_fabrication** - Structure fabrication and assembly
- **heat_treatment** - Heat treatment (optional)

#### 3. Machining
- **drilling** - Drilling operations
- **turning** - Turning operations
- **milling** - Milling operations
- **boring** - Boring operations

#### 4. Surface Prep
- **grinding** - Grinding operations
- **shot_blasting** - Shot blasting for surface preparation
- **painting** - Painting and coating

#### 5. Assembly
- **mechanical_assembly** - Mechanical assembly
- **shaft_bearing_assembly** - Shaft and bearing assembly
- **alignment** - Alignment operations

#### 6. Electrical
- **panel_wiring** - Panel wiring
- **motor_wiring** - Motor wiring
- **sensor_installation** - Sensor installation

---

## Phase Detail Forms

Each phase subtask has a custom form with specific fields:

### Marking Phase
- Component Name
- Drawing Number & Revision
- Marking Method (Hand/Auto marking)
- Dimensions Marked
- Tools Used
- Marking Done By
- Marking Date
- Remarks
- QC Inspection Result (Pass/Fail/Pending)
- Marking Photo (file upload)

### Cutting (Laser/Plasma/Bandsaw)
- Quantity
- Estimated Hours
- Responsible Person / Team
- Equipment Required
- Material Specifications
- Special Instructions / Notes
- Estimated Cost
- Quality Standards

### Edge Prep
- Component Name
- Bevel Angle
- Bevel Type (Single/Double)
- Length Prepared
- Grinder ID
- Operator Name
- Date
- QC Result
- Edge Prep Image

### MIG/SMAW/TIG Welding
- Weld Joint Number
- Welding Process (MIG/SMAW/TIG)
- Electrode/Wire Type
- Current & Voltage
- WPS Number (Welding Procedure Spec)
- Welder ID
- Number of Passes
- Weld Length Completed
- Preheat Temperature
- Post-weld Observation
- NDT Required (Yes/No)
- QC Status
- Weld Photo

### Fit-up
- Assembly Name
- Fit-Up Drawing Number
- Root Gap Required (mm)
- Misalignment Allowed (mm)
- Tack Weld Count

---

## Production Phase Tracking Table

The frontend displays a tracking table with the following columns:

| Column | Description | Editable |
|--------|-------------|----------|
| Step # | Sequential step number | No |
| Phase / SubTask | Phase and subtask names | No |
| Process Type | In-House or Outsource | Yes (dropdown) |
| Assignee / Vendor | Person or vendor name | Yes (input) |
| Contact / Details | Contact information | No (read-only) |
| Start Time | When phase started | Auto-set on Start |
| Finish Time | When phase completed | Auto-set on Finish |
| Status | Current status | Managed by buttons |
| Actions | Action buttons | Managed by buttons |

### Available Actions
- **Edit** - Modify phase details (modal)
- **Start** - Begin the phase (available when Not Started)
- **Finish** - Complete the phase (available when In Progress)
- **Hold** - Pause the phase (available when In Progress)
- **Cancel** - Cancel the phase (available when Not Started or On Hold)

---

## Error Responses

### 404 Not Found
```json
{
  "success": false,
  "error": "Production plan not found",
  "statusCode": 404
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "Phase key and data are required",
  "statusCode": 400
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Database error message",
  "statusCode": 500
}
```

---

## Implementation Details

### Model Methods
The `ProductionPlanDetail` model provides the following methods:

```javascript
// Phase Management
addPhase(salesOrderId, phaseKey, phaseData)
getPhases(salesOrderId)
getPhase(salesOrderId, phaseKey)
updatePhase(salesOrderId, phaseKey, phaseData)
removePhase(salesOrderId, phaseKey)
updatePhaseStatus(salesOrderId, phaseKey, statusData)

// Validation
validateTimeline(data)
validatePhases(salesOrderId)

// Utility
findBySalesOrderId(salesOrderId)
create(data)
update(salesOrderId, data)
```

### Controller Methods
The `ProductionPlanController` provides the following endpoints:

```javascript
createOrUpdate(req, res)      // POST /:salesOrderId/production-plan
getProductionPlan(req, res)   // GET /:salesOrderId/production-plan
addPhase(req, res)            // POST /:salesOrderId/production-plan/phases
getPhases(req, res)           // GET /:salesOrderId/production-plan/phases
getPhase(req, res)            // GET /:salesOrderId/production-plan/phases/:phaseKey
updatePhase(req, res)         // PUT /:salesOrderId/production-plan/phases/:phaseKey
removePhase(req, res)         // DELETE /:salesOrderId/production-plan/phases/:phaseKey
updatePhaseStatus(req, res)   // POST /:salesOrderId/production-plan/phases/:phaseKey/status
validateTimeline(req, res)    // POST /:salesOrderId/production-plan/validate-timeline
validatePhases(req, res)      // GET /:salesOrderId/production-plan/validate-phases
```

---

## Frontend Integration

The frontend (`Step5_ProductionPlan.jsx`) includes:
- Tab navigation for Timeline & Procurement and Production Phases
- Dynamic form fields based on selected phase subtask
- Real-time status updates and tracking
- Modal for detailed phase information
- Action buttons for phase lifecycle management
- Validation feedback and warnings

---

## Complete Endpoint Summary

| # | Method | Endpoint | Purpose | Status |
|---|--------|----------|---------|--------|
| 1 | POST | `/production-plan` | Create/Update production plan | ✅ Implemented |
| 2 | GET | `/production-plan` | Get production plan | ✅ Implemented |
| 3 | POST | `/production-plan/validate-timeline` | Validate timeline & procurement | ✅ Implemented |
| 4 | GET | `/production-plan/validate-phases` | Validate production phases | ✅ Implemented |
| 5 | POST | `/production-plan/phases` | Add production phase | ✅ Implemented |
| 6 | GET | `/production-plan/phases` | Get all production phases | ✅ Implemented |
| 7 | GET | `/production-plan/phases/:phaseKey` | Get specific phase | ✅ Implemented |
| 8 | PUT | `/production-plan/phases/:phaseKey` | Update phase details | ✅ Implemented |
| 9 | DELETE | `/production-plan/phases/:phaseKey` | Remove production phase | ✅ Implemented |
| 10 | POST | `/production-plan/phases/:phaseKey/status` | Update phase status | ✅ Implemented |

**Total: 10 endpoints implemented**
**Coverage: 100% of frontend requirements**

---

## Testing the Endpoints

### Example: Create Production Plan
```bash
curl -X POST http://localhost:5000/api/sales-orders/1/production-plan \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "productionStartDate": "2025-01-15",
    "estimatedCompletionDate": "2025-02-15",
    "procurementStatus": "In Progress"
  }'
```

### Example: Add Production Phase
```bash
curl -X POST http://localhost:5000/api/sales-orders/1/production-plan/phases \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "phaseKey": "marking-1",
    "phaseData": {
      "phase": "Material Prep",
      "subTask": {
        "value": "marking",
        "label": "Marking"
      },
      "assignee": "John Doe",
      "status": "Not Started"
    }
  }'
```

### Example: Update Phase Status
```bash
curl -X POST http://localhost:5000/api/sales-orders/1/production-plan/phases/marking-1/status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress",
    "startTime": "2025-01-15T09:30:00Z"
  }'
```

---

## Notes

- All endpoints require authentication via JWT token in the `Authorization` header
- Production phase keys should follow the format: `{phase}-{sequence}` (e.g., `marking-1`, `cutting_laser-1`)
- Phase status values: `Not Started`, `In Progress`, `Completed`, `On Hold`, `Cancelled`
- Process type values: `in_house`, `outsource`
- Procurement status values: `Pending`, `In Progress`, `Completed`, `Pending Approval`
