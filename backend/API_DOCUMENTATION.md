# Sales Order Management API Documentation

## Overview
This document describes the comprehensive REST API for managing the 8-step sales order workflow in the Sterling ERP system. The API follows a modular architecture with clear separation of concerns.

## Base URL
```
http://localhost:5000/api/sales/steps
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## Sales Order Steps Overview

1. **Step 1**: Client PO - Initial client purchase order information
2. **Step 2**: Sales Order - Sales order details and product specifications  
3. **Step 3**: Design Engineering - Technical design and engineering documents
4. **Step 4**: Material Requirements - Material procurement requirements
5. **Step 5**: Production Plan - Manufacturing timeline and phases
6. **Step 6**: Quality Check - QC inspection and testing
7. **Step 7**: Shipment - Shipment and logistics details
8. **Step 8**: Delivery - Final delivery and handover

---

## Endpoints

### 1. Get All Steps for a Sales Order
**GET** `/:salesOrderId/steps`

Returns all steps with their current status and data for a specific sales order.

**Response:**
```json
{
  "success": true,
  "message": "Steps retrieved successfully",
  "data": {
    "salesOrderId": 1,
    "steps": [
      {
        "id": 1,
        "salesOrderId": 1,
        "stepId": 1,
        "stepKey": "clientPO",
        "stepName": "Client PO",
        "status": "completed",
        "data": {...},
        "assignedTo": 5,
        "startedAt": "2024-01-01T10:00:00Z",
        "completedAt": "2024-01-01T11:00:00Z",
        "notes": "PO verified and approved",
        "createdAt": "2024-01-01T09:00:00Z",
        "updatedAt": "2024-01-01T11:00:00Z"
      }
    ],
    "progress": {
      "totalSteps": 8,
      "completedSteps": 1,
      "inProgressSteps": 0,
      "remainingSteps": 7,
      "progressPercentage": 12.5
    }
  }
}
```

---

### 2. Get Specific Step Details
**GET** `/:salesOrderId/steps/:stepKey`

Get detailed information for a specific step.

**Parameters:**
- `salesOrderId` (path) - Sales order ID
- `stepKey` (path) - Step key (e.g., clientPO, salesOrder, designEngineering, etc.)

**Response:**
```json
{
  "success": true,
  "message": "Step retrieved successfully",
  "data": {
    "id": 1,
    "salesOrderId": 1,
    "stepId": 1,
    "stepKey": "clientPO",
    "stepName": "Client PO",
    "status": "completed",
    "data": {...},
    "assignedTo": 5,
    "notes": "..."
  }
}
```

---

### 3. Update Step Status
**PUT** `/:salesOrderId/steps/:stepKey/status`

Update the status of a step and optionally add notes.

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Optional notes about the step"
}
```

**Status Values:**
- `pending` - Waiting to be started
- `in_progress` - Currently being worked on
- `completed` - Work is finished
- `on_hold` - Temporarily paused
- `approved` - Approved by reviewer
- `rejected` - Rejected and needs rework

---

### 4. Assign Employee to Step
**POST** `/:salesOrderId/steps/:stepKey/assign`

Assign an employee to work on a specific step.

**Request Body:**
```json
{
  "employeeId": 5
}
```

---

### 5. Add Notes to Step
**POST** `/:salesOrderId/steps/:stepKey/notes`

Add or update notes for a step.

**Request Body:**
```json
{
  "notes": "Detailed notes about this step"
}
```

---

### 6. Get Step Progress
**GET** `/:salesOrderId/progress`

Get overall progress metrics for the sales order.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSteps": 8,
    "completedSteps": 3,
    "inProgressSteps": 1,
    "remainingSteps": 4,
    "progressPercentage": 37.5,
    "steps": [...]
  }
}
```

---

### 7. Get Completed Steps
**GET** `/:salesOrderId/completed-steps`

Get all completed steps for a sales order.

**Response:**
```json
{
  "success": true,
  "data": {
    "salesOrderId": 1,
    "completedSteps": [
      {
        "stepId": 1,
        "stepName": "Client PO"
      }
    ],
    "count": 1
  }
}
```

---

### 8. Get Pending Steps
**GET** `/:salesOrderId/pending-steps`

Get all pending steps that haven't been started yet.

**Response:**
```json
{
  "success": true,
  "data": {
    "salesOrderId": 1,
    "pendingSteps": [
      {
        "id": 2,
        "stepId": 2,
        "stepKey": "salesOrder",
        "stepName": "Sales Order",
        "status": "pending",
        "data": null
      }
    ],
    "count": 7
  }
}
```

---

## Step 1: Client PO Endpoints

### Create/Update Client PO
**POST** `/:salesOrderId/client-po`

Create or update client PO information.

**Request Body:**
```json
{
  "poNumber": "PO-2024-001",
  "poDate": "2024-01-01",
  "clientName": "ABC Corporation",
  "clientEmail": "contact@abc.com",
  "clientPhone": "+1-800-123-4567",
  "projectName": "Container Assembly",
  "projectCode": "ABC-001",
  "clientCompanyName": "ABC Corporation Ltd",
  "clientAddress": "123 Business Street",
  "clientGSTIN": "29ABCDE1234F1Z5",
  "billingAddress": "456 Billing Lane",
  "poValue": 100000,
  "currency": "INR",
  "termsConditions": [
    "Payment within 30 days",
    "Delivery in 60 days"
  ],
  "attachments": [
    {
      "name": "po_document.pdf",
      "type": "application/pdf",
      "url": "/uploads/..."
    }
  ],
  "notes": "Standard terms apply"
}
```

---

### Get Client PO
**GET** `/:salesOrderId/client-po`

Retrieve client PO information for a sales order.

---

### Verify PO Number
**GET** `/client-po/verify/:poNumber`

Check if a PO number already exists in the system.

**Response:**
```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2024-001",
    "exists": false
  }
}
```

---

### Get All Client POs
**GET** `/client-po/all?poNumber=PO-2024`

Retrieve all client POs with optional filtering.

**Query Parameters:**
- `poNumber` (optional) - Filter by PO number (partial match)

---

### Delete Client PO
**DELETE** `/:salesOrderId/client-po`

Delete client PO information for a sales order.

---

## Step 1a: Client Info Sub-Section Endpoints

### Create/Update Client Info
**POST** `/:salesOrderId/client-po/client-info`

Save or update client information details (PO Number, Date, Client Name, Email, Phone).

**Request Body:**
```json
{
  "poNumber": "PO-2024-001",
  "poDate": "2024-01-01",
  "clientName": "ABC Corporation",
  "clientEmail": "contact@abc.com",
  "clientPhone": "+1-800-123-4567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client information saved successfully",
  "data": {
    "poNumber": "PO-2024-001",
    "poDate": "2024-01-01",
    "clientName": "ABC Corporation",
    "clientEmail": "contact@abc.com",
    "clientPhone": "+1-800-123-4567"
  }
}
```

---

### Get Client Info
**GET** `/:salesOrderId/client-po/client-info`

Retrieve client information for a sales order.

**Response:**
```json
{
  "success": true,
  "message": "Client information retrieved successfully",
  "data": {
    "poNumber": "PO-2024-001",
    "poDate": "2024-01-01",
    "clientName": "ABC Corporation",
    "clientEmail": "contact@abc.com",
    "clientPhone": "+1-800-123-4567"
  }
}
```

---

## Step 1b: Project Details Sub-Section Endpoints

### Create/Update Project Details
**POST** `/:salesOrderId/client-po/project-details`

Save or update project details (Project Name, Code, Billing Address, Shipping Address).

**Request Body:**
```json
{
  "projectName": "Container Assembly",
  "projectCode": "ABC-001",
  "billingAddress": "123 Business Street",
  "shippingAddress": "456 Shipping Lane"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project details saved successfully",
  "data": {
    "projectName": "Container Assembly",
    "projectCode": "ABC-001",
    "billingAddress": "123 Business Street",
    "shippingAddress": "456 Shipping Lane"
  }
}
```

---

### Get Project Details
**GET** `/:salesOrderId/client-po/project-details`

Retrieve project details for a sales order.

**Response:**
```json
{
  "success": true,
  "message": "Project details retrieved successfully",
  "data": {
    "projectName": "Container Assembly",
    "projectCode": "ABC-001",
    "billingAddress": "123 Business Street",
    "shippingAddress": "456 Shipping Lane"
  }
}
```

---

## Step 1c: Project Requirements Sub-Section Endpoints

### Create/Update Project Requirements
**POST** `/:salesOrderId/client-po/project-requirements`

Save or update detailed project requirements and specifications.

**Request Body:**
```json
{
  "application": "Container handling",
  "numberOfUnits": 2,
  "dimensions": "3000mm x 2000mm x 1500mm",
  "loadCapacity": "5000 kg",
  "materialGrade": "EN8",
  "finishCoatings": "Powder coated",
  "installationRequirement": "On-site assembly",
  "testingStandards": "IS 1566",
  "acceptanceCriteria": "Function test, Load test 150%",
  "documentationRequirement": "Complete with drawings",
  "warrantTerms": "12 months"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project requirements saved successfully",
  "data": {
    "application": "Container handling",
    "numberOfUnits": 2,
    "dimensions": "3000mm x 2000mm x 1500mm",
    "loadCapacity": "5000 kg",
    "materialGrade": "EN8",
    "finishCoatings": "Powder coated",
    "installationRequirement": "On-site assembly",
    "testingStandards": "IS 1566",
    "acceptanceCriteria": "Function test, Load test 150%",
    "documentationRequirement": "Complete with drawings",
    "warrantTerms": "12 months"
  }
}
```

---

### Get Project Requirements
**GET** `/:salesOrderId/client-po/project-requirements`

Retrieve project requirements for a sales order.

**Response:**
```json
{
  "success": true,
  "message": "Project requirements retrieved successfully",
  "data": {
    "application": "Container handling",
    "numberOfUnits": 2,
    "dimensions": "3000mm x 2000mm x 1500mm",
    "loadCapacity": "5000 kg",
    "materialGrade": "EN8",
    "finishCoatings": "Powder coated",
    "installationRequirement": "On-site assembly",
    "testingStandards": "IS 1566",
    "acceptanceCriteria": "Function test, Load test 150%",
    "documentationRequirement": "Complete with drawings",
    "warrantTerms": "12 months"
  }
}
```

---

## Step 2: Sales Order & Order Information Endpoints

### Create/Update Complete Sales Order Details
**POST** `/:salesOrderId/sales-order`

Save or update complete sales order information (all three tabs at once).

**Request Body:**
```json
{
  "clientEmail": "contact@example.com",
  "clientPhone": "+1-800-123-4567",
  "estimatedEndDate": "2024-03-30",
  "billingAddress": "123 Business Street",
  "shippingAddress": "456 Shipping Lane",
  "productDetails": {
    "itemName": "CCIS – Container Canister Integration Stand",
    "itemDescription": "Specialized equipment for container handling",
    "componentsList": "Long Base Frame, Roller Saddle Assemblies",
    "certification": "QAP, FAT Report, CoC"
  },
  "qualityCompliance": {
    "qualityStandards": "ISO 9001:2015, DRDO standards",
    "weldingStandards": "AWS D1.1",
    "surfaceFinish": "Blasting + Epoxy primer + PU coat",
    "mechanicalLoadTesting": "6000 kg load test",
    "electricalCompliance": "IEC 61010, Safety compliance",
    "documentsRequired": "QAP, FAT Report, Installation Manual, Warranty Certificate"
  },
  "warrantySupport": {
    "warrantyPeriod": "12 Months from installation",
    "serviceSupport": "AMC available / On-call support"
  },
  "paymentTerms": "40% advance, 40% before dispatch, 20% after installation",
  "projectPriority": "high",
  "totalAmount": 250000.00,
  "projectCode": "ABC-001",
  "internalInfo": {
    "estimatedCosting": 180000.00,
    "estimatedProfit": 70000.00,
    "jobCardNo": "JC-2024-001"
  },
  "specialInstructions": "Rush delivery required. Coordinate with logistics team."
}
```

---

### Get Complete Sales Order Details
**GET** `/:salesOrderId/sales-order`

Retrieve all sales order details.

---

### Delete Sales Order Details
**DELETE** `/:salesOrderId/sales-order`

Delete sales order details for a sales order.

---

## Step 2a: Sales & Product Tab Endpoints

### Create/Update Sales & Product Details
**POST** `/:salesOrderId/sales-order/sales-product`

Save or update sales contact and product information.

**Request Body:**
```json
{
  "clientEmail": "contact@example.com",
  "clientPhone": "+1-800-123-4567",
  "estimatedEndDate": "2024-03-30",
  "billingAddress": "123 Business Street",
  "shippingAddress": "456 Shipping Lane",
  "productDetails": {
    "itemName": "CCIS – Container Canister Integration Stand",
    "itemDescription": "Specialized equipment for container handling",
    "componentsList": "Long Base Frame, Roller Saddle Assemblies",
    "certification": "QAP, FAT Report, CoC"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sales & Product details saved successfully",
  "data": {
    "clientEmail": "contact@example.com",
    "clientPhone": "+1-800-123-4567",
    "estimatedEndDate": "2024-03-30",
    "billingAddress": "123 Business Street",
    "shippingAddress": "456 Shipping Lane",
    "productDetails": {
      "itemName": "CCIS – Container Canister Integration Stand",
      "itemDescription": "Specialized equipment for container handling",
      "componentsList": "Long Base Frame, Roller Saddle Assemblies",
      "certification": "QAP, FAT Report, CoC"
    }
  }
}
```

---

### Get Sales & Product Details
**GET** `/:salesOrderId/sales-order/sales-product`

Retrieve sales and product information.

---

## Step 2b: Quality & Compliance Tab Endpoints

### Create/Update Quality & Compliance Details
**POST** `/:salesOrderId/sales-order/quality-compliance`

Save or update quality standards and warranty information.

**Request Body:**
```json
{
  "qualityCompliance": {
    "qualityStandards": "ISO 9001:2015, DRDO standards",
    "weldingStandards": "AWS D1.1",
    "surfaceFinish": "Blasting + Epoxy primer + PU coat",
    "mechanicalLoadTesting": "6000 kg load test",
    "electricalCompliance": "IEC 61010, Safety compliance",
    "documentsRequired": "QAP, FAT Report, Installation Manual, Warranty Certificate"
  },
  "warrantySupport": {
    "warrantyPeriod": "12 Months from installation",
    "serviceSupport": "AMC available / On-call support"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quality & Compliance details saved successfully",
  "data": {
    "qualityCompliance": {
      "qualityStandards": "ISO 9001:2015, DRDO standards",
      "weldingStandards": "AWS D1.1",
      "surfaceFinish": "Blasting + Epoxy primer + PU coat",
      "mechanicalLoadTesting": "6000 kg load test",
      "electricalCompliance": "IEC 61010, Safety compliance",
      "documentsRequired": "QAP, FAT Report, Installation Manual, Warranty Certificate"
    },
    "warrantySupport": {
      "warrantyPeriod": "12 Months from installation",
      "serviceSupport": "AMC available / On-call support"
    }
  }
}
```

---

### Get Quality & Compliance Details
**GET** `/:salesOrderId/sales-order/quality-compliance`

Retrieve quality and compliance information.

---

## Step 2c: Payment & Internal Tab Endpoints

### Create/Update Payment & Internal Details
**POST** `/:salesOrderId/sales-order/payment-internal`

Save or update payment terms, costing, and internal information.

**Request Body:**
```json
{
  "paymentTerms": "40% advance, 40% before dispatch, 20% after installation",
  "projectPriority": "high",
  "totalAmount": 250000.00,
  "projectCode": "ABC-001",
  "internalInfo": {
    "estimatedCosting": 180000.00,
    "estimatedProfit": 70000.00,
    "jobCardNo": "JC-2024-001"
  },
  "specialInstructions": "Rush delivery required. Coordinate with logistics team."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment & Internal details saved successfully",
  "data": {
    "paymentTerms": "40% advance, 40% before dispatch, 20% after installation",
    "projectPriority": "high",
    "totalAmount": 250000.00,
    "projectCode": "ABC-001",
    "internalInfo": {
      "estimatedCosting": 180000.00,
      "estimatedProfit": 70000.00,
      "jobCardNo": "JC-2024-001"
    },
    "specialInstructions": "Rush delivery required. Coordinate with logistics team."
  }
}
```

---

### Get Payment & Internal Details
**GET** `/:salesOrderId/sales-order/payment-internal`

Retrieve payment, costing, and internal information.

---

## Step 3: Design Engineering Endpoints

### Update Design Engineering Data
**POST/PUT** `/:salesOrderId/design-engineering`

Save or update design engineering documents and specifications.

**Request Body:**
```json
{
  "documents": [
    {
      "type": "QAP",
      "filePath": "/uploads/qap.pdf",
      "description": "Quality Assurance Plan"
    },
    {
      "type": "Drawings",
      "filePath": "/uploads/drawings.dwg"
    }
  ],
  "designStatus": "approved",
  "bomData": {
    "itemCode": "ABC-001",
    "materials": [...]
  },
  "specifications": {
    "tolerances": "±0.5mm",
    "finishType": "Polished"
  },
  "designNotes": "Design approved with modifications"
}
```

---

### Approve Design
**POST** `/:salesOrderId/design-engineering/approve`

Approve the design documents.

**Request Body:**
```json
{
  "reviewedBy": 5,
  "comments": "Approved for production"
}
```

---

### Reject Design
**POST** `/:salesOrderId/design-engineering/reject`

Reject the design and request revisions.

**Request Body:**
```json
{
  "reviewedBy": 5,
  "comments": "Please revise the tolerance specifications"
}
```

---

## Step 4: Material Requirements Endpoints

### Create/Update Material Requirements
**POST/PUT** `/:salesOrderId/material-requirements`

Create or update material requirements.

**Request Body:**
```json
{
  "materials": [
    {
      "materialType": "Steel Plate",
      "specification": "MS Plate 10mm",
      "quantity": 100,
      "unit": "kg",
      "unitPrice": 500,
      "supplier": "Steel Suppliers Inc",
      "leadTime": "2 weeks"
    }
  ],
  "totalMaterialCost": 50000,
  "procurementStatus": "pending",
  "notes": "Urgent procurement required"
}
```

---

### Update Procurement Status
**PATCH** `/:salesOrderId/material-requirements/status`

Update the overall procurement status.

**Request Body:**
```json
{
  "status": "ordered"
}
```

**Status Values:**
- `pending` - Not yet ordered
- `ordered` - Order placed
- `received` - Materials received
- `partial` - Partially received

---

## Step 5: Production Plan Endpoints

### Create/Update Production Plan
**POST/PUT** `/:salesOrderId/production-plan`

Create or update production plan.

**Request Body:**
```json
{
  "timeline": {
    "startDate": "2024-02-01",
    "endDate": "2024-03-15"
  },
  "selectedPhases": {
    "Fabrication": true,
    "Welding": true,
    "Assembly": true,
    "Testing": true,
    "Painting": true
  },
  "phaseDetails": {
    "Fabrication": {
      "duration": "5 days",
      "assignedTo": 10,
      "notes": "Initial fabrication"
    }
  },
  "productionNotes": "Standard production process",
  "estimatedCompletionDate": "2024-03-15"
}
```

---

## Step 6: Quality Check Endpoints

### Create Quality Check
**POST** `/:salesOrderId/quality-check`

Create quality check record.

**Request Body:**
```json
{
  "inspectionType": "final",
  "inspections": [
    {
      "parameter": "Dimension Check",
      "result": "passed",
      "actualValue": "100.2mm",
      "tolerance": "±0.5mm",
      "notes": "Within tolerance"
    }
  ],
  "qcStatus": "pending",
  "remarks": "Product ready for shipment"
}
```

---

### Update QC Status
**PATCH** `/:salesOrderId/quality-check/status`

Update QC status.

**Request Body:**
```json
{
  "status": "passed",
  "inspectedBy": 5,
  "qcReport": "All tests passed successfully"
}
```

---

## Step 7: Shipment Endpoints

### Create/Update Shipment
**POST/PUT** `/:salesOrderId/shipment`

Create or update shipment details.

**Request Body:**
```json
{
  "shipmentMethod": "Road Transport",
  "carrierName": "ABC Logistics",
  "trackingNumber": "TRACK123456",
  "estimatedDeliveryDate": "2024-03-20",
  "shippingAddress": "Customer Address, City, State",
  "shipmentStatus": "pending",
  "shipmentCost": 5000,
  "notes": "Fragile - Handle with care"
}
```

---

### Update Shipment Status
**PATCH** `/:salesOrderId/shipment/status`

Update shipment status.

**Request Body:**
```json
{
  "status": "dispatched"
}
```

**Status Values:**
- `pending` - Not yet ready
- `ready` - Ready for dispatch
- `dispatched` - Dispatched from warehouse
- `in_transit` - In transit to destination
- `delivered` - Delivered to customer
- `cancelled` - Shipment cancelled

---

## Step 8: Delivery Endpoints

### Create/Update Delivery
**POST/PUT** `/:salesOrderId/delivery`

Create or update delivery information.

**Request Body:**
```json
{
  "deliveryDate": "2024-03-20",
  "receivedBy": "John Doe",
  "deliveryStatus": "complete",
  "deliveredQuantity": 100,
  "recipientSignaturePath": "/uploads/signature.png",
  "deliveryNotes": "Received in good condition",
  "podNumber": "POD-123456",
  "deliveryCost": 0
}
```

---

### Update Delivery Status
**PATCH** `/:salesOrderId/delivery/status`

Update delivery status.

**Request Body:**
```json
{
  "status": "complete"
}
```

**Status Values:**
- `pending` - Pending delivery
- `partial` - Partially delivered
- `complete` - Fully delivered
- `signed` - Signed by recipient
- `cancelled` - Delivery cancelled

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "errors": [
    "Error message 1",
    "Error message 2"
  ],
  "timestamp": "2024-01-01T10:00:00Z"
}
```

### Common HTTP Status Codes:
- `200 OK` - Successful GET request
- `201 Created` - Successfully created resource
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Data Models

### SalesOrderStep
```javascript
{
  id: Integer,
  salesOrderId: Integer,
  stepId: Integer (1-8),
  stepKey: String,
  stepName: String,
  status: Enum[pending, in_progress, completed, on_hold, approved, rejected],
  data: JSON,
  assignedTo: Integer (userId),
  startedAt: DateTime,
  completedAt: DateTime,
  notes: Text,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### ClientPODetail
```javascript
{
  id: Integer,
  salesOrderId: Integer,
  poNumber: String,
  poDate: Date,
  clientName: String,
  clientEmail: String,
  clientPhone: String,
  projectName: String,
  projectCode: String,
  clientCompanyName: String,
  clientAddress: Text,
  clientGSTIN: String,
  billingAddress: Text,
  poValue: Decimal,
  currency: String,
  termsConditions: JSON,
  attachments: JSON,
  notes: Text
}
```

---

## Module Structure

The implementation follows a clean, modular architecture:

```
backend/
├── utils/
│   ├── salesOrderStepConstants.js    # Constants and enums
│   ├── salesOrderValidators.js       # Validation functions
│   └── salesOrderHelpers.js          # Helper utilities
├── models/
│   ├── SalesOrderStep.js             # Main step tracking model
│   ├── ClientPODetail.js
│   ├── DesignEngineeringDetail.js
│   ├── MaterialRequirementsDetail.js
│   ├── ProductionPlanDetail.js
│   ├── QualityCheckDetail.js
│   ├── ShipmentDetail.js
│   └── DeliveryDetail.js
├── controllers/
│   └── sales/
│       ├── salesOrderStepController.js        # Step management
│       ├── clientPOController.js
│       ├── designEngineeringController.js
│       ├── materialRequirementsController.js
│       ├── productionPlanController.js
│       ├── qualityCheckController.js
│       ├── shipmentController.js
│       └── deliveryController.js
├── routes/
│   └── sales/
│       └── salesOrderStepsRoutes.js   # Consolidated routes
└── migrations/
    └── 005_create_sales_order_steps.js
```

---

## Example Workflow

### Complete Sales Order Workflow

```javascript
// 1. Initialize a new sales order
POST /api/sales
{
  "customerName": "ABC Corp",
  "priority": "high"
}

// 2. Create Step 1 - Client PO
POST /api/sales/steps/:salesOrderId/client-po
{
  "poNumber": "PO-2024-001",
  "poDate": "2024-01-01",
  ...
}

// 3. Update step status
PUT /api/sales/steps/:salesOrderId/steps/clientPO/status
{
  "status": "completed"
}

// 4. Get overall progress
GET /api/sales/steps/:salesOrderId/progress

// 5. Continue with subsequent steps...
```

---

## Best Practices

1. **Always validate input** - Use the validators before creating/updating records
2. **Maintain audit trail** - All changes are automatically timestamped
3. **Use transactions** - For operations spanning multiple tables
4. **Assign steps** - Assign steps to employees for accountability
5. **Add notes** - Document decisions and changes for traceability

---

## Support

For additional support or questions about the API, refer to:
- Project documentation
- Development team
- Code comments in controller files
