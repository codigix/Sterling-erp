# Material Requirements - Complete API Reference

**Status**: ✅ ALL ENDPOINTS IMPLEMENTED

## Overview

Material Requirements (Step 5) in the Sales Order workflow is now fully implemented with endpoints for managing materials, assigning employees, cost calculations, and validation.

## Complete Endpoint List

### 1. Create/Update Material Requirements
**Endpoint**: `POST /api/sales/steps/:salesOrderId/material-requirements`
**Authentication**: Required
**Request Body**:
```json
{
  "materials": [
    {
      "id": 1702180800000,
      "steelSection": "I-Beam",
      "quantity": 10,
      "unit": "meters",
      "source": "vendor",
      "assignee_id": 5,
      "unitCost": 500,
      "notes": "Material notes"
    }
  ],
  "totalMaterialCost": 5000,
  "notes": "Overall notes"
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "salesOrderId": 1,
    "materials": [...],
    "totalMaterialCost": 5000,
    "procurementStatus": "pending",
    "createdAt": "2025-12-09T...",
    "updatedAt": "2025-12-09T..."
  },
  "message": "Material requirements saved"
}
```

### 2. Get Material Requirements
**Endpoint**: `GET /api/sales/steps/:salesOrderId/material-requirements`
**Authentication**: Required
**Response**: Returns complete material requirements with all materials and costs

### 3. Update Procurement Status
**Endpoint**: `PATCH /api/sales/steps/:salesOrderId/material-requirements/status`
**Authentication**: Required
**Request Body**:
```json
{
  "status": "ordered"
}
```
**Valid Statuses**: `pending`, `ordered`, `received`, `partial`
**Response**: Updated requirements with new procurement status

### 4. Get All Materials
**Endpoint**: `GET /api/sales/steps/:salesOrderId/material-requirements/materials`
**Authentication**: Required
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1702180800000,
      "name": "Steel I-Beam",
      "quantity": 10,
      "unit": "meters",
      "unitCost": 500,
      "totalCost": 5000,
      "assignee_id": 5,
      "procurementStatus": "pending"
    }
  ],
  "message": "Materials retrieved successfully"
}
```

### 5. Add New Material
**Endpoint**: `POST /api/sales/steps/:salesOrderId/material-requirements/materials`
**Authentication**: Required
**Request Body**:
```json
{
  "name": "Steel I-Beam",
  "quantity": 10,
  "unit": "meters",
  "unitCost": 500,
  "source": "vendor",
  "assignee_id": 5,
  "specifications": "Grade A, 200mm height"
}
```
**Response**: New material object with generated ID
**Status**: 201 Created

### 6. Get Specific Material
**Endpoint**: `GET /api/sales/steps/:salesOrderId/material-requirements/materials/:materialId`
**Authentication**: Required
**Response**: Single material details or 404 if not found

### 7. Update Material
**Endpoint**: `PUT /api/sales/steps/:salesOrderId/material-requirements/materials/:materialId`
**Authentication**: Required
**Request Body**: Any material fields to update
```json
{
  "quantity": 15,
  "unitCost": 550,
  "specifications": "Updated specs"
}
```
**Response**: Updated material object

### 8. Remove Material
**Endpoint**: `DELETE /api/sales/steps/:salesOrderId/material-requirements/materials/:materialId`
**Authentication**: Required
**Response**: Confirmation of removal

### 9. Assign Material to Employee
**Endpoint**: `POST /api/sales/steps/:salesOrderId/material-requirements/materials/:materialId/assign`
**Authentication**: Required
**Request Body**:
```json
{
  "employeeId": 5
}
```
**Response**: Updated material with assignee information

### 10. Validate Materials
**Endpoint**: `GET /api/sales/steps/:salesOrderId/material-requirements/validate`
**Authentication**: Required
**Response**:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": ["Material 1: No assignee assigned"],
    "materialCount": 3,
    "totalCost": 15000
  },
  "message": "Material validation completed"
}
```

### 11. Calculate Material Costs
**Endpoint**: `POST /api/sales/steps/:salesOrderId/material-requirements/calculate-cost`
**Authentication**: Required
**Request Body**:
```json
{
  "materials": [
    {
      "id": 1,
      "name": "Steel I-Beam",
      "quantity": 10,
      "unitCost": 500
    },
    {
      "id": 2,
      "name": "Fasteners",
      "quantity": 50,
      "unitCost": 10
    }
  ]
}
```
**Response**:
```json
{
  "success": true,
  "data": {
    "totalCost": 5500,
    "costBreakdown": [
      {
        "id": 1,
        "name": "Steel I-Beam",
        "quantity": 10,
        "unitCost": 500,
        "totalCost": 5000
      },
      {
        "id": 2,
        "name": "Fasteners",
        "quantity": 50,
        "unitCost": 10,
        "totalCost": 500
      }
    ],
    "materials": 2
  },
  "message": "Costs calculated successfully"
}
```

---

## Database Schema

### material_requirements_details Table
```sql
CREATE TABLE material_requirements_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_order_id INT NOT NULL UNIQUE,
    materials JSON NOT NULL,
    total_material_cost DECIMAL(12,2),
    procurement_status ENUM('pending', 'ordered', 'received', 'partial'),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id),
    INDEX idx_sales_order (sales_order_id),
    INDEX idx_procurement_status (procurement_status)
);
```

### Material Object Structure (in JSON array)
```json
{
  "id": 1702180800000,
  "name": "Steel I-Beam",
  "steelSection": "I-Beam",
  "plateType": "MS Plate",
  "materialGrade": "Grade A",
  "fastenerType": "Bolt",
  "machinedParts": "Shaft",
  "rollerMovementComponents": "Roller",
  "liftingPullingMechanisms": "Pulley",
  "electricalAutomation": "Motor",
  "safetyMaterials": "Guard",
  "surfacePrepPainting": "Paint",
  "fabricationConsumables": "Welding Rod",
  "hardwareMisc": "Nut",
  "documentationMaterials": "Manual",
  "quantity": 10,
  "unit": "meters",
  "unitCost": 500,
  "totalCost": 5000,
  "source": "vendor",
  "assignee_id": 5,
  "specifications": "Grade A, 200mm height",
  "procurementStatus": "pending",
  "createdAt": "2025-12-09T10:00:00Z",
  "updatedAt": "2025-12-09T10:00:00Z"
}
```

---

## Workflow Diagram

```
Step 1: Create/Update Requirements
  ↓
Step 2: Add Materials (one or multiple)
  ├─ User adds material with details
  ├─ System calculates cost
  └─ User assigns employee
  ↓
Step 3: Validate Materials
  ├─ Check for required fields
  ├─ Check for assigned employees
  └─ Review cost breakdown
  ↓
Step 4: Update Status
  ├─ pending → ordered (PO created)
  ├─ ordered → partial (partial receipt)
  └─ partial/ordered → received (all received)
  ↓
Step 5: Next Step (Production Planning)
```

---

## Common Workflows

### Adding Material to Requirements

```bash
# 1. Create initial requirements (if not exists)
curl -X POST http://localhost:5000/api/sales/steps/1/material-requirements \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "materials": [],
    "totalMaterialCost": 0
  }'

# 2. Add material
curl -X POST http://localhost:5000/api/sales/steps/1/material-requirements/materials \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Steel I-Beam",
    "quantity": 10,
    "unit": "meters",
    "unitCost": 500,
    "assignee_id": 5
  }'

# 3. Validate
curl http://localhost:5000/api/sales/steps/1/material-requirements/validate \
  -H "Authorization: Bearer token"

# 4. Update status
curl -X PATCH http://localhost:5000/api/sales/steps/1/material-requirements/status \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"status": "ordered"}'
```

### Calculate Costs

```bash
curl -X POST http://localhost:5000/api/sales/steps/1/material-requirements/calculate-cost \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{
    "materials": [
      {"id": 1, "name": "Steel", "quantity": 10, "unitCost": 500},
      {"id": 2, "name": "Fasteners", "quantity": 100, "unitCost": 5}
    ]
  }'
```

### Assign Employee to Material

```bash
curl -X POST http://localhost:5000/api/sales/steps/1/material-requirements/materials/1702180800000/assign \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"employeeId": 5}'
```

---

## Error Handling

### Common Errors
- **400 Bad Request**: Missing required fields or invalid data
- **404 Not Found**: Requirements or material doesn't exist
- **500 Server Error**: Database or server issues

### Validation Rules

#### Required Fields
- `quantity` - Material quantity (numeric)

#### Recommended Fields
- `unit` - Measurement unit (meters, kg, etc.)
- `assignee_id` - Employee managing the material
- `unitCost` - Cost per unit

#### Optional Fields
- `source` - Where material comes from
- `specifications` - Detailed specifications
- `notes` - Additional notes

---

## Integration Notes

### Related Steps
- **Step 4**: Design Engineering (provides BOM/specifications)
- **Step 6**: Production Planning (uses materials for planning)

### External Integration
- **Procurement Module**: Creates purchase requisitions from materials
- **Inventory System**: Tracks received materials
- **Cost Management**: Uses unit costs for budgeting

---

## Performance Considerations

- Materials stored as JSON array (efficient for small-medium lists)
- Indexed sales_order_id for fast lookups
- Indexed procurement_status for filtering
- Cost calculation done on-demand
- Assignee stored as ID for referential integrity

---

## Security Measures

- Authentication required on all endpoints
- Input validation on quantity, costs, and IDs
- Employee ID validation against users table
- Proper error messages without sensitive info
- Audit fields (createdAt, updatedAt) for tracking

---

## Testing Checklist

- [ ] Create material requirements
- [ ] Add single material
- [ ] Add multiple materials
- [ ] Get all materials
- [ ] Get specific material
- [ ] Update material quantity
- [ ] Update material cost
- [ ] Assign employee to material
- [ ] Remove material
- [ ] Validate requirements (success case)
- [ ] Validate requirements (missing data)
- [ ] Calculate costs
- [ ] Update procurement status
- [ ] Verify all materials have assignees
- [ ] Check total cost calculation

---

**Last Updated**: 2025-12-09  
**Version**: 1.0 - Complete Implementation  
**Status**: Production Ready ✅
