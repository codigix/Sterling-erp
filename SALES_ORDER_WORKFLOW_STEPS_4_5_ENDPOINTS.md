# Sales Order Workflow - Steps 4 & 5 Complete API Endpoints

**Status**: ✅ ALL 20 ENDPOINTS IMPLEMENTED AND DOCUMENTED

---

## 📋 Step 4: Design Engineering Endpoints

### Base Path: `/api/sales/steps/:salesOrderId/design-engineering`

#### 1. Create/Update Design Details
```
POST /api/sales/steps/:salesOrderId/design-engineering
```
**Authentication**: Required (JWT)  
**Request Body**:
```json
{
  "documents": [],
  "designStatus": "draft",
  "bomData": {},
  "drawings3D": {},
  "specifications": "Design specs",
  "designNotes": "Design notes"
}
```
**Response**: 201 Created  
**Returns**: Design object with all fields

---

#### 2. Get Design Details
```
GET /api/sales/steps/:salesOrderId/design-engineering
```
**Authentication**: Required (JWT)  
**Response**: 200 OK  
**Returns**: Complete design object with documents and specifications

---

#### 3. Approve Design
```
POST /api/sales/steps/:salesOrderId/design-engineering/approve
```
**Authentication**: Required (JWT)  
**Request Body**:
```json
{
  "reviewedBy": 5,
  "comments": "Approved for production"
}
```
**Response**: 200 OK  
**Returns**: Updated design with approval info

---

#### 4. Reject Design
```
POST /api/sales/steps/:salesOrderId/design-engineering/reject
```
**Authentication**: Required (JWT)  
**Request Body**:
```json
{
  "reviewedBy": 5,
  "comments": "Needs revision"
}
```
**Response**: 200 OK  
**Returns**: Updated design with rejection info

---

#### 5. Upload Design Documents
```
POST /api/sales/steps/:salesOrderId/design-engineering/upload
```
**Authentication**: Required (JWT)  
**Content-Type**: multipart/form-data  
**Form Data**: `documents` (file array)  
**Supported Types**: PDF, Word, Excel, Images, CAD (*.dwg, *.dxf)  
**File Size Limit**: 50MB per file  
**Response**: 200 OK  
**Returns**: Array of uploaded documents

---

#### 6. List Design Documents
```
GET /api/sales/steps/:salesOrderId/design-engineering/documents
```
**Authentication**: Required (JWT)  
**Response**: 200 OK  
**Returns**: Array of document objects with metadata

---

#### 7. Get Specific Design Document
```
GET /api/sales/steps/:salesOrderId/design-engineering/documents/:documentId
```
**Authentication**: Required (JWT)  
**Response**: 200 OK or 404 Not Found  
**Returns**: Single document object

---

#### 8. Validate Design Completeness
```
GET /api/sales/steps/:salesOrderId/design-engineering/validate
```
**Authentication**: Required (JWT)  
**Response**: 200 OK  
**Returns**: 
```json
{
  "isValid": true/false,
  "errors": [],
  "warnings": [],
  "status": "draft"
}
```

---

#### 9. Get Design Review History
```
GET /api/sales/steps/:salesOrderId/design-engineering/review-history
```
**Authentication**: Required (JWT)  
**Response**: 200 OK or 404 Not Found  
**Returns**: Array of review/approval records

---

## 📋 Step 5: Material Requirements Endpoints

### Base Path: `/api/sales/steps/:salesOrderId/material-requirements`

#### 1. Create/Update Material Requirements
```
POST /api/sales/steps/:salesOrderId/material-requirements
```
**Authentication**: Required (JWT)  
**Request Body**:
```json
{
  "materials": [
    {
      "id": 1702180800000,
      "name": "Steel I-Beam",
      "quantity": 10,
      "unit": "meters",
      "unitCost": 500,
      "assignee_id": 5
    }
  ],
  "totalMaterialCost": 5000,
  "notes": "Material notes"
}
```
**Response**: 200 OK  
**Returns**: Material requirements object

---

#### 2. Get Material Requirements
```
GET /api/sales/steps/:salesOrderId/material-requirements
```
**Authentication**: Required (JWT)  
**Response**: 200 OK  
**Returns**: Complete requirements object with all materials

---

#### 3. Update Procurement Status
```
PATCH /api/sales/steps/:salesOrderId/material-requirements/status
```
**Authentication**: Required (JWT)  
**Request Body**:
```json
{
  "status": "ordered"
}
```
**Valid Statuses**: `pending`, `ordered`, `received`, `partial`  
**Response**: 200 OK  
**Returns**: Updated requirements

---

#### 4. Validate Material Requirements
```
GET /api/sales/steps/:salesOrderId/material-requirements/validate
```
**Authentication**: Required (JWT)  
**Response**: 200 OK  
**Returns**:
```json
{
  "isValid": true/false,
  "errors": [],
  "warnings": [],
  "materialCount": 3,
  "totalCost": 15000
}
```

---

#### 5. Calculate Material Costs
```
POST /api/sales/steps/:salesOrderId/material-requirements/calculate-cost
```
**Authentication**: Required (JWT)  
**Request Body**:
```json
{
  "materials": [
    {
      "id": 1,
      "name": "Steel",
      "quantity": 10,
      "unitCost": 500
    }
  ]
}
```
**Response**: 200 OK  
**Returns**:
```json
{
  "totalCost": 5000,
  "costBreakdown": [...],
  "materials": 1
}
```

---

#### 6. Get All Materials
```
GET /api/sales/steps/:salesOrderId/material-requirements/materials
```
**Authentication**: Required (JWT)  
**Response**: 200 OK  
**Returns**: Array of material objects

---

#### 7. Add New Material
```
POST /api/sales/steps/:salesOrderId/material-requirements/materials
```
**Authentication**: Required (JWT)  
**Request Body**:
```json
{
  "name": "Steel I-Beam",
  "quantity": 10,
  "unit": "meters",
  "unitCost": 500,
  "source": "vendor",
  "assignee_id": 5,
  "specifications": "Grade A"
}
```
**Response**: 201 Created  
**Returns**: New material object with generated ID

---

#### 8. Get Specific Material
```
GET /api/sales/steps/:salesOrderId/material-requirements/materials/:materialId
```
**Authentication**: Required (JWT)  
**Response**: 200 OK or 404 Not Found  
**Returns**: Single material object

---

#### 9. Update Material
```
PUT /api/sales/steps/:salesOrderId/material-requirements/materials/:materialId
```
**Authentication**: Required (JWT)  
**Request Body**: Any material fields to update
```json
{
  "quantity": 15,
  "unitCost": 550
}
```
**Response**: 200 OK  
**Returns**: Updated material object

---

#### 10. Remove Material
```
DELETE /api/sales/steps/:salesOrderId/material-requirements/materials/:materialId
```
**Authentication**: Required (JWT)  
**Response**: 200 OK  
**Returns**: Confirmation message

---

#### 11. Assign Material to Employee
```
POST /api/sales/steps/:salesOrderId/material-requirements/materials/:materialId/assign
```
**Authentication**: Required (JWT)  
**Request Body**:
```json
{
  "employeeId": 5
}
```
**Response**: 200 OK  
**Returns**: Updated material with assignee

---

## 🔄 Full Workflow Example

### Step 4: Design Engineering Workflow

```bash
# 1. Create design
POST /api/sales/steps/1/design-engineering
{
  "documents": [],
  "designStatus": "draft",
  "specifications": "Standard specifications"
}

# 2. Upload documents
POST /api/sales/steps/1/design-engineering/upload
Form Data: files (QAP, ATP, Drawings)

# 3. List documents
GET /api/sales/steps/1/design-engineering/documents

# 4. Validate design
GET /api/sales/steps/1/design-engineering/validate

# 5. Approve design
POST /api/sales/steps/1/design-engineering/approve
{
  "reviewedBy": 5,
  "comments": "Ready for production"
}

# 6. Get review history
GET /api/sales/steps/1/design-engineering/review-history
```

### Step 5: Material Requirements Workflow

```bash
# 1. Create requirements
POST /api/sales/steps/1/material-requirements
{
  "materials": [],
  "totalMaterialCost": 0
}

# 2. Add materials
POST /api/sales/steps/1/material-requirements/materials
{
  "name": "Steel I-Beam",
  "quantity": 10,
  "unit": "meters",
  "unitCost": 500
}

# 3. Get all materials
GET /api/sales/steps/1/material-requirements/materials

# 4. Assign employee to material
POST /api/sales/steps/1/material-requirements/materials/1702180800000/assign
{
  "employeeId": 5
}

# 5. Calculate costs
POST /api/sales/steps/1/material-requirements/calculate-cost
{
  "materials": [...]
}

# 6. Validate requirements
GET /api/sales/steps/1/material-requirements/validate

# 7. Update procurement status
PATCH /api/sales/steps/1/material-requirements/status
{
  "status": "ordered"
}
```

---

## 🔑 Common Parameters

### URL Parameters
- **salesOrderId** (required): The sales order ID
- **documentId** (required for document endpoints): Document ID
- **materialId** (required for material endpoints): Material ID

### Headers (All Requests)
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Response Format (All Endpoints)
```json
{
  "success": true/false,
  "data": { /* endpoint-specific data */ },
  "message": "Success or error message"
}
```

---

## ⚠️ Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT, PATCH, POST with no body) |
| 201 | Created (POST endpoint) |
| 400 | Bad Request (invalid data) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Server Error (database/server issue) |

---

## 📊 Request/Response Summary

### Design Engineering
- **Total Endpoints**: 9
- **GET Requests**: 4
- **POST Requests**: 4
- **PUT Requests**: 0
- **PATCH Requests**: 0
- **DELETE Requests**: 0

### Material Requirements
- **Total Endpoints**: 11
- **GET Requests**: 4
- **POST Requests**: 5
- **PUT Requests**: 1
- **PATCH Requests**: 1
- **DELETE Requests**: 1

### Grand Total
- **Total Endpoints**: 20
- **GET Requests**: 8
- **POST Requests**: 9
- **PUT Requests**: 1
- **PATCH Requests**: 1
- **DELETE Requests**: 1

---

## 🧪 Quick Test Commands

### Design Engineering Test
```bash
# Test design creation and approval
curl -X POST http://localhost:5000/api/sales/steps/1/design-engineering \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"designStatus":"draft","specifications":"Test"}'

curl http://localhost:5000/api/sales/steps/1/design-engineering/validate \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X POST http://localhost:5000/api/sales/steps/1/design-engineering/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reviewedBy":5,"comments":"Approved"}'
```

### Material Requirements Test
```bash
# Test material creation and assignment
curl -X POST http://localhost:5000/api/sales/steps/1/material-requirements \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"materials":[],"totalMaterialCost":0}'

curl -X POST http://localhost:5000/api/sales/steps/1/material-requirements/materials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Steel","quantity":10,"unit":"meters","unitCost":500}'

curl http://localhost:5000/api/sales/steps/1/material-requirements/validate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Documentation References

- **Step 4 Analysis**: `DESIGN_ENGINEERING_ENDPOINTS_ANALYSIS.md`
- **Step 4 Full Reference**: `DESIGN_ENGINEERING_COMPLETE_REFERENCE.md`
- **Step 5 Analysis**: `MATERIAL_REQUIREMENTS_ANALYSIS.md`
- **Step 5 Full Reference**: `MATERIAL_REQUIREMENTS_COMPLETE_REFERENCE.md`
- **Combined Summary**: `DESIGN_ENGINEERING_AND_MATERIAL_REQUIREMENTS_SUMMARY.md`

---

**Last Updated**: 2025-12-09  
**Version**: 1.0  
**Status**: ✅ PRODUCTION READY
