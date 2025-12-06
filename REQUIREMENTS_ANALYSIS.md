# Sterling ERP - Complete Flow Requirements Analysis

## Current Status vs Requirements

### 1. SALES ORDER MODULE ✅ PARTIALLY DONE
**Status**: Basic implementation exists, needs enhancement

**Current**:
- Sales order creation with client info ✅
- Items/materials list ✅
- Documents support ✅

**Missing**:
- Material request workflow (before creating vendor PO)
- Link materials to specific vendors
- Material specification details
- Purchase order creation from materials

---

### 2. MATERIAL REQUEST & VENDOR PO MODULE ❌ NEEDS IMPLEMENTATION

**Required Flow**:
```
Sales Order Materials 
    ↓
Material Request (MR)
    ↓
Vendor Quote/Selection
    ↓
Vendor Purchase Order (PO)
    ↓
Send to Vendor
    ↓
Receive Material (Inward Challan)
    ↓
Notify Inventory Manager
```

**Database Tables Needed**:
- `material_requests` - store material requests with quantities
- `vendor_quotes` - vendor quotes for materials
- Purchase orders partially exist but need refinement
- Link material_requests → purchase_orders → vendors

---

### 3. PRODUCTION PLANNING MODULE ❌ NEEDS ENHANCEMENT

**Current Database Schema** (from production_plans):
- id, sales_order_id, bom_id, plan_name, status
- planned_start_date, planned_end_date
- estimated_completion_date, supervisor_id, notes
- Missing: production_plan_stages, stage conditions (in-house/outsource)

**Required**:
```
Production Plan
    ↓
├─ Stage 1: Design
│  ├─ Type: In-house/Outsource
│  ├─ Duration, Start/End Date
│  ├─ Delay Tolerance
│  ├─ Assigned Employee
│  └─ If Outsource: Outward Challan
│
├─ Stage 2: Manufacturing
│  └─ Same as Stage 1
│
├─ Stage 3: QC
│  └─ Same as Stage 1
│
└─ Stage N: Final Delivery
   └─ Same as Stage 1
```

**Table Structure Needed**:
```sql
CREATE TABLE production_stages (
  id INT PRIMARY KEY,
  production_plan_id INT,
  stage_order INT,
  stage_name VARCHAR(255),
  stage_type ENUM('design', 'manufacturing', 'qc', 'packing'),
  execution_type ENUM('in-house', 'outsource'),
  assigned_employee_id INT,
  start_date DATE,
  end_date DATE,
  estimated_duration INT,
  delay_tolerance INT,
  required_time INT,
  challan_outward_id INT (if outsource),
  challan_inward_id INT (if outsource),
  status ENUM('pending', 'in_progress', 'completed')
)
```

---

### 4. EMPLOYEE TASK PORTAL ⚠️ PARTIALLY DONE

**Current Implementation**:
- worker_tasks table exists ✅
- Task creation ✅
- Status tracking ✅
- Limited to manufacturing stages

**Missing**:
- Task view by Day/Week/Month filter ❌
- Task status: To Do, In Progress, Pause, Done, Cancel ❌
- Task update log ❌
- Employee dashboard ❌
- Performance metrics ❌

**Required Task Statuses**:
- `to_do` - task assigned
- `in_progress` - employee working
- `pause` - temporarily paused
- `done` - completed
- `cancel` - cancelled
- `stuck` - needs help/alert

---

### 5. NOTIFICATION & ALERT SYSTEM ⚠️ PARTIALLY DONE

**Current**: 
- AlertsNotification model exists
- Notification model exists
- Basic structure in place

**Missing**:
- Trigger alerts when employee is stuck ❌
- Popup notification to assigned employee ❌
- Manager notification on material receipt ❌
- Alert on task deadline breach ❌
- Real-time notification delivery ❌

**Required Alerts**:
1. Material received → Notify Inventory Manager
2. PO approved → Notify Vendor Manager
3. Employee stuck → Alert Manager
4. Task deadline → Notify Employee + Manager
5. Production stage delayed → Alert Supervisor
6. Production stage completed → Notify Next Stage Owner

---

### 6. USER ROLES & PERMISSIONS ⚠️ NEEDS VERIFICATION

**Current**: Role model exists

**Required Roles** (from requirements):
1. **Admin** - System administration ✅
2. **Sales Manager** - Create sales orders, manage customers
3. **Procurement Manager** - Create PO, send to vendors, receive materials
4. **Inventory Manager** - Receive materials, manage stock
5. **Designer** - Create design for production
6. **Production Manager** - Create production plans, assign stages
7. **Operator** - Execute production tasks
8. **Accountant** - Finance/accounting
9. **Quality Manager** - QC inspection
10. **Employee** - General employee for task portal

---

### 7. TRACKING DASHBOARD ❌ NEEDS IMPLEMENTATION

**Project-wise Tracking**:
- All materials for project
- All production stages status
- Timeline vs actual
- Cost tracking
- Resource utilization

**Employee-wise Tracking**:
- Tasks assigned
- Tasks completed
- Performance metrics
- Utilization rate
- Attendance tracking

---

### 8. VENDOR CHALLAN SYSTEM ⚠️ NEEDS ENHANCEMENT

**Current**: Challan model exists

**Missing**:
- Outward Challan (for outsource production stages)
- Inward Challan (for receiving outsourced work)
- Challan material tracking
- Quality verification on inward challan

---

## Implementation Priority

### Phase 1 (Critical - Core Flow):
1. Material Request Module
2. Vendor Purchase Order Enhancement
3. Production Stages with In-house/Outsource logic
4. Vendor Challan (Inward/Outward)

### Phase 2 (Important - Workflow):
1. Employee Task Portal Enhancement (Day/Week/Month filtering)
2. Task Status Management (To Do, In Progress, Pause, Done, Cancel, Stuck)
3. Notification & Alert System
4. Stuck Task Alert to Manager

### Phase 3 (Nice to Have - Analytics):
1. Project-wise Tracking Dashboard
2. Employee-wise Tracking Dashboard
3. Performance Metrics
4. Timeline Analytics

---

## Database Schema Summary

**Tables to Create/Modify**:
1. `material_requests` - NEW
2. `vendor_quotes` - NEW (or enhance purchase_orders)
3. `production_stages` - NEW (or modify existing)
4. `material_tracking` - NEW
5. Modify `worker_tasks` - add more status options
6. Modify `production_plans` - add stage tracking

---

## Next Steps
1. Review this document
2. Confirm priority
3. Provide sample data
4. Begin Phase 1 implementation
