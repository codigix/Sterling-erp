# Quality Check & Compliance (Step 7) - Complete API Reference

## Overview
The Quality Check step manages quality standards, compliance requirements, warranty information, and project ownership assignment. This step defines what quality and compliance expectations exist for the product without performing actual quality inspections.

## Frontend Component
**Location:** `frontend/src/components/admin/SalesOrderForm/steps/Step6_QualityCheck.jsx`

**Functionality:**
- Quality Standards Configuration
- Material & Surface Requirements
- Compliance Documentation
- Warranty & Support Terms
- Project Owner Assignment

## Database Schema

### `quality_check_details` Table
```sql
CREATE TABLE IF NOT EXISTS quality_check_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_order_id INT NOT NULL UNIQUE,
    
    -- Quality Compliance Fields
    quality_standards VARCHAR(255),              -- e.g., ISO 9001, AS9100
    welding_standards VARCHAR(255),              -- e.g., AWS D1.1, EN 287
    surface_finish VARCHAR(255),                 -- e.g., Ra 1.6, Polished
    mechanical_load_testing VARCHAR(255),        -- e.g., 1.5x load capacity
    electrical_compliance VARCHAR(255),          -- e.g., IEC 61439, IP65
    documents_required TEXT,                     -- e.g., QAP, FAT Report, CoC
    
    -- Warranty & Support Fields
    warranty_period VARCHAR(100),                -- e.g., 2 years, 5 years
    service_support VARCHAR(255),                -- e.g., On-site support included
    
    -- Project Assignment
    internal_project_owner INT,                  -- Employee ID
    
    -- QC Status Tracking
    qc_status ENUM('pending', 'in_progress', 
                   'passed', 'failed', 'conditional') DEFAULT 'pending',
    inspected_by INT,                            -- Inspector user ID
    inspection_date TIMESTAMP NULL,
    qc_report TEXT,
    remarks TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (internal_project_owner) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (inspected_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_sales_order (sales_order_id),
    INDEX idx_qc_status (qc_status)
);
```

---

## API Endpoints

### 1. Create/Update Quality Check
**POST** `/api/sales-orders/:salesOrderId/quality-check`

**Request Body:**
```json
{
  "qualityCompliance": {
    "qualityStandards": "ISO 9001",
    "weldingStandards": "AWS D1.1",
    "surfaceFinish": "Ra 1.6",
    "mechanicalLoadTesting": "1.5x load capacity",
    "electricalCompliance": "IEC 61439, IP65",
    "documentsRequired": "QAP, FAT Report, CoC"
  },
  "warrantySupport": {
    "warrantyPeriod": "2 years",
    "serviceSupport": "On-site support included"
  },
  "internalProjectOwner": 5
}
```

**Response:** `200 OK` or `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "salesOrderId": 1,
    "qualityCompliance": {
      "qualityStandards": "ISO 9001",
      "weldingStandards": "AWS D1.1",
      "surfaceFinish": "Ra 1.6",
      "mechanicalLoadTesting": "1.5x load capacity",
      "electricalCompliance": "IEC 61439, IP65",
      "documentsRequired": "QAP, FAT Report, CoC"
    },
    "warrantySupport": {
      "warrantyPeriod": "2 years",
      "serviceSupport": "On-site support included"
    },
    "internalProjectOwner": 5,
    "qcStatus": "pending",
    "createdAt": "2025-01-10T10:00:00Z",
    "updatedAt": "2025-01-10T10:00:00Z"
  },
  "message": "Quality check data saved"
}
```

### 2. Get Quality Check
**GET** `/api/sales-orders/:salesOrderId/quality-check`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "salesOrderId": 1,
    "qualityCompliance": {
      "qualityStandards": "ISO 9001",
      "weldingStandards": "AWS D1.1",
      "surfaceFinish": "Ra 1.6",
      "mechanicalLoadTesting": "1.5x load capacity",
      "electricalCompliance": "IEC 61439, IP65",
      "documentsRequired": "QAP, FAT Report, CoC"
    },
    "warrantySupport": {
      "warrantyPeriod": "2 years",
      "serviceSupport": "On-site support included"
    },
    "internalProjectOwner": 5,
    "qcStatus": "pending",
    "inspectedBy": null,
    "inspectionDate": null,
    "qcReport": null,
    "remarks": null,
    "createdAt": "2025-01-10T10:00:00Z",
    "updatedAt": "2025-01-10T10:00:00Z"
  },
  "message": "Quality check retrieved"
}
```

### 3. Add Quality Compliance Standards
**POST** `/api/sales-orders/:salesOrderId/quality-check/compliance`

**Request Body:**
```json
{
  "qualityStandards": "ISO 9001",
  "weldingStandards": "AWS D1.1",
  "surfaceFinish": "Ra 1.6",
  "mechanicalLoadTesting": "1.5x load capacity",
  "electricalCompliance": "IEC 61439, IP65",
  "documentsRequired": "QAP, FAT Report, CoC"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "qualityCompliance": {
      "qualityStandards": "ISO 9001",
      "weldingStandards": "AWS D1.1",
      "surfaceFinish": "Ra 1.6",
      "mechanicalLoadTesting": "1.5x load capacity",
      "electricalCompliance": "IEC 61439, IP65",
      "documentsRequired": "QAP, FAT Report, CoC"
    },
    ...
  },
  "message": "Quality compliance standards saved"
}
```

### 4. Add Warranty & Support Information
**POST** `/api/sales-orders/:salesOrderId/quality-check/warranty`

**Request Body:**
```json
{
  "warrantyPeriod": "2 years",
  "serviceSupport": "On-site support included"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "warrantySupport": {
      "warrantyPeriod": "2 years",
      "serviceSupport": "On-site support included"
    },
    ...
  },
  "message": "Warranty and support information saved"
}
```

### 5. Assign Project Owner
**POST** `/api/sales-orders/:salesOrderId/quality-check/assign-owner`

**Request Body:**
```json
{
  "employeeId": 5
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "internalProjectOwner": 5,
    ...
  },
  "message": "Project owner assigned successfully"
}
```

### 6. Update QC Status
**PATCH** `/api/sales-orders/:salesOrderId/quality-check/status`

**Request Body:**
```json
{
  "status": "passed",
  "inspectedBy": 3,
  "qcReport": "Product passed all quality checks"
}
```

**Valid Status Values:**
- `pending` - Awaiting inspection
- `in_progress` - Inspection in progress
- `passed` - Quality check passed
- `failed` - Quality check failed
- `conditional` - Conditional pass (with notes)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "qcStatus": "passed",
    "inspectedBy": 3,
    "inspectionDate": "2025-01-15T14:30:00Z",
    "qcReport": "Product passed all quality checks",
    ...
  },
  "message": "QC status updated to passed"
}
```

### 7. Validate Compliance
**GET** `/api/sales-orders/:salesOrderId/quality-check/validate`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": [
      "Quality standards should be specified",
      "Warranty period should be specified"
    ],
    "hasCompliance": false,
    "hasWarranty": false
  },
  "message": "Compliance validation result"
}
```

---

## Quality Standards Reference

### Common Quality Standards
- **ISO 9001** - Quality Management System
- **ISO 13849** - Safety of Control Systems
- **AS9100** - Aerospace Quality Management
- **IATF 16949** - Automotive Industry Standard
- **OHSAS 18001** - Occupational Health & Safety

### Common Welding Standards
- **AWS D1.1** - Structural Welding Code (Steel)
- **AWS D1.2** - Structural Welding Code (Aluminum)
- **EN 287** - Qualification Testing of Welders
- **ISO 5817** - Defects in Fusion-Welded Joints
- **ASME Section IX** - Welding and Brazing Qualifications

### Surface Finish Specifications
- **Ra 0.4** - Very Fine Polish
- **Ra 0.8** - Fine Polish
- **Ra 1.6** - Standard Polish
- **Ra 3.2** - Light Machine Finish
- **Ra 6.3** - Machine Finish
- **Polished** - Mirror Finish

### Common Electrical Standards
- **IEC 61439** - Low-voltage Switchgear and Control Gear
- **IEC 60204-1** - Machine Tool Electrical Safety
- **IP65** - Ingress Protection (Dust Tight, Water Jet Resistant)
- **IP67** - Ingress Protection (Dust Tight, Water Submersion)
- **UL 61010** - Safety Requirements for Laboratory Equipment

### Common Documents Required
- **QAP** - Quality Assurance Plan
- **FAT** - Factory Acceptance Test Report
- **SAT** - Site Acceptance Test Report
- **CoC** - Certificate of Conformance
- **Mill Cert** - Material Mill Certificate
- **First Article** - First Article Inspection Report
- **Drawing Approval** - Approved Drawings
- **Test Reports** - Material Test & Performance Reports

---

## Model Methods

### QualityCheckDetail Methods

```javascript
// CRUD Operations
findBySalesOrderId(salesOrderId)       // Get quality check data
create(data)                           // Create quality check
update(salesOrderId, data)             // Update quality check
updateQCStatus(salesOrderId, status)   // Update QC status

// Compliance Management
addCompliance(salesOrderId, data)      // Add compliance standards
addWarrantySupport(salesOrderId, data) // Add warranty info
assignProjectOwner(salesOrderId, empId) // Assign project owner

// Validation
validateCompliance(salesOrderId)       // Validate compliance data

// Formatting
formatRow(row)                         // Format database row to object
```

---

## Controller Methods

```javascript
class QualityCheckController {
  // Basic CRUD
  createOrUpdate(req, res)             // POST
  getQualityCheck(req, res)            // GET
  updateQCStatus(req, res)             // PATCH

  // Compliance Management
  addCompliance(req, res)              // POST /compliance
  addWarrantySupport(req, res)         // POST /warranty
  assignProjectOwner(req, res)         // POST /assign-owner

  // Validation
  validateCompliance(req, res)         // GET /validate
}
```

---

## Data Structure Reference

### Frontend State Structure
```javascript
formData = {
  qualityCompliance: {
    qualityStandards: string,
    weldingStandards: string,
    surfaceFinish: string,
    mechanicalLoadTesting: string,
    electricalCompliance: string,
    documentsRequired: string
  },
  warrantySupport: {
    warrantyPeriod: string,
    serviceSupport: string
  },
  internalProjectOwner: number (employee ID)
}
```

### Database Structure
```javascript
{
  id: number,
  sales_order_id: number,
  quality_standards: string,
  welding_standards: string,
  surface_finish: string,
  mechanical_load_testing: string,
  electrical_compliance: string,
  documents_required: string,
  warranty_period: string,
  service_support: string,
  internal_project_owner: number,
  qc_status: enum,
  inspected_by: number,
  inspection_date: timestamp,
  qc_report: text,
  remarks: text,
  created_at: timestamp,
  updated_at: timestamp
}
```

---

## Frontend Integration

### Form Sections

#### 1. Quality Standards
- Quality Standards (text input)
- Welding Standards (text input)

#### 2. Material & Surface
- Surface Finish (text input)
- Mechanical Load Testing (text input)

#### 3. Compliance
- Electrical Compliance (text input)
- Documents Required (text input)

#### 4. Warranty & Support
- Warranty Period (text input)
- Service Support (text input)

#### 5. Project Assignment
- Assign to Employee (employee select dropdown)

---

## Error Responses

### 404 Not Found
```json
{
  "success": false,
  "error": "Quality check data not found",
  "statusCode": 404
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "Employee ID is required",
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

## Validation Rules

### Compliance Validation
- ⚠ Quality standards should be specified
- ⚠ Required documents should be specified
- ⚠ Warranty period should be specified

### QC Status Transitions
- `pending` → `in_progress` (start inspection)
- `in_progress` → `passed` (inspection passes)
- `in_progress` → `failed` (inspection fails)
- `in_progress` → `conditional` (conditional pass)

### Step Status Update
- QC Status `passed` → Sales Order Step status: `completed`
- QC Status `failed` → Sales Order Step status: `rejected`
- QC Status `conditional` → Sales Order Step status: `completed`

---

## Complete Endpoint Summary

| # | Method | Endpoint | Purpose | Status |
|---|--------|----------|---------|--------|
| 1 | POST | `/quality-check` | Create/Update quality check | ✅ |
| 2 | GET | `/quality-check` | Get quality check data | ✅ |
| 3 | PATCH | `/quality-check/status` | Update QC status | ✅ |
| 4 | POST | `/quality-check/compliance` | Add compliance standards | ✅ |
| 5 | POST | `/quality-check/warranty` | Add warranty information | ✅ |
| 6 | POST | `/quality-check/assign-owner` | Assign project owner | ✅ |
| 7 | GET | `/quality-check/validate` | Validate compliance | ✅ |

**Total: 7 endpoints implemented**

---

## Testing Examples

### Create Quality Check
```bash
curl -X POST http://localhost:5000/api/sales-orders/1/quality-check \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "qualityCompliance": {
      "qualityStandards": "ISO 9001",
      "weldingStandards": "AWS D1.1",
      "surfaceFinish": "Ra 1.6",
      "mechanicalLoadTesting": "1.5x load capacity",
      "electricalCompliance": "IEC 61439, IP65",
      "documentsRequired": "QAP, FAT Report, CoC"
    },
    "warrantySupport": {
      "warrantyPeriod": "2 years",
      "serviceSupport": "On-site support included"
    },
    "internalProjectOwner": 5
  }'
```

### Add Compliance Standards
```bash
curl -X POST http://localhost:5000/api/sales-orders/1/quality-check/compliance \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "qualityStandards": "ISO 9001",
    "weldingStandards": "AWS D1.1",
    "surfaceFinish": "Ra 1.6",
    "mechanicalLoadTesting": "1.5x load capacity",
    "electricalCompliance": "IEC 61439, IP65",
    "documentsRequired": "QAP, FAT Report, CoC"
  }'
```

### Update QC Status
```bash
curl -X PATCH http://localhost:5000/api/sales-orders/1/quality-check/status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "passed",
    "inspectedBy": 3,
    "qcReport": "Product passed all quality checks"
  }'
```

---

## Notes

- All endpoints require authentication via JWT token
- Quality check data is created automatically when sales order is created
- Compliance and warranty information can be updated independently
- Employee assignment requires valid employee ID from the system
- QC status updates automatically update the sales order step status
- Validation provides advisory warnings, not blocking errors
