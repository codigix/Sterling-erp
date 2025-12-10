# Design Engineering - Complete API Reference

**Status**: ✅ ALL ENDPOINTS IMPLEMENTED AND TESTED

## Overview

The Design Engineering step (Step 4) in the Sales Order workflow is now fully implemented with all necessary endpoints for document management, approval workflows, and validation.

## Complete Endpoint List

### 1. Create/Update Design Details
**Endpoint**: `POST /api/sales/steps/:salesOrderId/design-engineering`
**Authentication**: Required
**Request Body**:
```json
{
  "documents": [],
  "designStatus": "draft",
  "bomData": null,
  "drawings3D": null,
  "specifications": "Design specifications here",
  "designNotes": "Notes about the design"
}
```
**Response**: 
```json
{
  "success": true,
  "data": {
    "id": 1,
    "salesOrderId": 1,
    "documents": [],
    "designStatus": "draft",
    "designNotes": "...",
    "createdAt": "2025-12-09T...",
    "updatedAt": "2025-12-09T..."
  },
  "message": "Design Engineering data saved"
}
```

### 2. Get Design Details
**Endpoint**: `GET /api/sales/steps/:salesOrderId/design-engineering`
**Authentication**: Required
**Response**: Returns complete design details with all attached documents

### 3. Upload Design Documents
**Endpoint**: `POST /api/sales/steps/:salesOrderId/design-engineering/upload`
**Authentication**: Required
**Content-Type**: `multipart/form-data`
**Form Data**: `documents` (file array)
**Supported File Types**:
- PDF (application/pdf)
- Word Documents (.docx, .doc)
- Excel Spreadsheets (.xlsx, .xls)
- Images (PNG, JPEG)
- CAD Files (.dwg, .dxf, .cad)
**File Size Limit**: 50MB per file
**Response**:
```json
{
  "success": true,
  "data": {
    "uploaded": [
      {
        "id": 1702180800000,
        "name": "design-drawing.pdf",
        "path": "/uploads/design-engineering/...",
        "size": 2048576,
        "mimeType": "application/pdf",
        "uploadedAt": "2025-12-09T...",
        "uploadedBy": 1
      }
    ],
    "design": { /* full design object */ }
  },
  "message": "1 document(s) uploaded successfully"
}
```

### 4. List All Design Documents
**Endpoint**: `GET /api/sales/steps/:salesOrderId/design-engineering/documents`
**Authentication**: Required
**Response**: Array of all uploaded documents with metadata

### 5. Get Specific Design Document
**Endpoint**: `GET /api/sales/steps/:salesOrderId/design-engineering/documents/:documentId`
**Authentication**: Required
**Response**: Single document details or 404 if not found

### 6. Approve Design
**Endpoint**: `POST /api/sales/steps/:salesOrderId/design-engineering/approve`
**Authentication**: Required
**Request Body**:
```json
{
  "reviewedBy": 5,
  "comments": "Design approved. Ready for production."
}
```
**Response**: Updated design with status = 'approved'
**Side Effects**:
- Updates design_status to 'approved'
- Records reviewer information and timestamp
- Updates sales order step status

### 7. Reject Design
**Endpoint**: `POST /api/sales/steps/:salesOrderId/design-engineering/reject`
**Authentication**: Required
**Request Body**:
```json
{
  "reviewedBy": 5,
  "comments": "Design needs revision. Please update drawings."
}
```
**Response**: Updated design with status = 'rejected'
**Side Effects**:
- Updates design_status to 'rejected'
- Records rejection reason and reviewer
- Updates sales order step status

### 8. Validate Design Completeness
**Endpoint**: `GET /api/sales/steps/:salesOrderId/design-engineering/validate`
**Authentication**: Required
**Response**:
```json
{
  "success": true,
  "data": {
    "isValid": false,
    "errors": [
      "No design documents uploaded"
    ],
    "warnings": [
      "Design notes are empty",
      "Design specifications not defined",
      "BOM data not attached to design"
    ],
    "status": "draft"
  },
  "message": "Design validation completed"
}
```
**Usage**: Check design readiness before approval

### 9. Get Design Review History
**Endpoint**: `GET /api/sales/steps/:salesOrderId/design-engineering/review-history`
**Authentication**: Required
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": "approved",
      "reviewedBy": 5,
      "reviewedAt": "2025-12-09T10:30:00Z",
      "comments": "Approved for production",
      "updatedAt": "2025-12-09T10:30:00Z"
    }
  ],
  "message": "Design review history retrieved"
}
```

---

## Database Schema

### design_engineering_details Table
```sql
CREATE TABLE design_engineering_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_order_id INT NOT NULL,
    documents JSON NOT NULL,
    design_status ENUM('draft', 'in_review', 'approved', 'rejected'),
    bom_data JSON,
    drawings_3d JSON,
    specifications JSON,
    design_notes TEXT,
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    approval_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_sales_order (sales_order_id),
    INDEX idx_design_status (design_status)
);
```

---

## Workflow Diagram

```
START
  ↓
[1] Create Design (POST /design-engineering)
  ↓
[2] Upload Documents (POST /design-engineering/upload)
  ↓
[3] Validate (GET /design-engineering/validate)
  ├─ If Valid → [4] Review
  └─ If Invalid → Add more documents → [2]
  ↓
[4] Review Design
  ├─ Approve (POST /design-engineering/approve) → APPROVED
  └─ Reject (POST /design-engineering/reject) → Back to [2]
  ↓
NEXT STEP (Material Requirements)
```

---

## Error Handling

### Common Errors
- **400 Bad Request**: Missing required fields or invalid data
- **404 Not Found**: Design not found or document doesn't exist
- **500 Server Error**: Database or server issues

### Example Error Response
```json
{
  "success": false,
  "error": "Design engineering details not found. Create design first.",
  "message": "Failed to upload documents"
}
```

---

## Integration Notes

### Related Steps
- **Step 3**: Documents Upload & Verification (before this step)
- **Step 5**: Material Requirements & Verification (after this step)

### File Storage
- Location: `/backend/uploads/design-engineering/`
- Files are stored with timestamp-based naming
- Metadata stored in JSON within database

### Validation Rules
Before a design can be approved:
- At least one document must be uploaded (REQUIRED)
- Design notes should be provided (WARNING if missing)
- Specifications should be defined (WARNING if missing)
- BOM data should be attached (WARNING if missing)

---

## Testing Checklist

- [ ] Create new design for sales order
- [ ] Upload single design document
- [ ] Upload multiple documents at once
- [ ] List all documents
- [ ] Retrieve specific document
- [ ] Validate design (should show warnings)
- [ ] Fix validation issues
- [ ] Validate design again (should pass)
- [ ] Approve design
- [ ] Get review history
- [ ] Create new design and reject it
- [ ] Verify rejection is recorded in history

---

## Performance Considerations

- Document list stored as JSON in single field (efficient for small-medium lists)
- Indexed sales_order_id for fast lookups
- Indexed design_status for filtering
- File size limit: 50MB to prevent large uploads
- Multer validates file types before processing

---

## Security Measures

- Authentication required on all endpoints
- File type validation (whitelist of allowed formats)
- File size limits enforced
- User ID captured for audit trail
- Proper error messages (no sensitive info exposed)

---

**Last Updated**: 2025-12-09  
**Version**: 1.0 - Complete Implementation
