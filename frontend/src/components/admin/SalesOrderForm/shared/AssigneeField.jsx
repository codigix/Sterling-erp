import React, { useMemo } from 'react';
import { Users } from 'lucide-react';
import Input from '../../../ui/Input';

const DEPARTMENT_MANAGERS = {
  design_engineering: {
    department: 'Design Engineering',
    manager: 'Design Engineer',
    defaultManager: 'design.engineer',
    color: 'bg-purple-50 border-purple-200'
  },
  material_requirement: {
    department: 'Inventory Management',
    manager: 'Inventory Manager',
    defaultManager: 'inventory.manager',
    color: 'bg-blue-50 border-blue-200'
  },
  production_plan: {
    department: 'Production',
    manager: 'Production Manager',
    defaultManager: 'production.manager',
    color: 'bg-orange-50 border-orange-200'
  },
  quality_check: {
    department: 'Quality Control',
    manager: 'QC Manager',
    defaultManager: 'qc.manager',
    color: 'bg-green-50 border-green-200'
  },
  shipment: {
    department: 'Logistics',
    manager: 'Logistics Manager',
    defaultManager: 'inventory.manager',
    color: 'bg-yellow-50 border-yellow-200'
  },
  delivery: {
    department: 'Delivery',
    manager: 'Logistics Manager',
    defaultManager: 'inventory.manager',
    color: 'bg-red-50 border-red-200'
  }
};

const AssigneeField = ({ stepType, formData, updateField, employees = [] }) => {
  const deptConfig = DEPARTMENT_MANAGERS[stepType];
  
  if (!deptConfig) return null;

  const assigneeKey = `${stepType}AssignedTo`;
  const assigneeValue = formData[assigneeKey] || deptConfig.defaultManager;

  const departmentEmployees = useMemo(() => {
    return employees.filter(emp => {
      const deptName = deptConfig.manager.toLowerCase();
      return emp.designation?.toLowerCase().includes(deptName) ||
             emp.role?.toLowerCase().includes(deptName) ||
             emp.username === deptConfig.defaultManager;
    });
  }, [employees, deptConfig]);

  return (
    <div className={`p-4 rounded-lg border ${deptConfig.color} mb-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Users size={18} className="text-slate-700" />
        <h4 className="text-sm font-semibold text-slate-900">
          Assign to {deptConfig.manager}
        </h4>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">
            Department: <span className="text-blue-600 font-semibold">{deptConfig.department}</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900 text-left mb-2">
            {deptConfig.manager} *
          </label>
          <select
            value={assigneeValue}
            onChange={(e) => updateField(assigneeKey, e.target.value)}
            className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select {deptConfig.manager}</option>
            {departmentEmployees.length > 0 ? (
              departmentEmployees.map((emp) => (
                <option key={emp.id || emp.username} value={emp.username || emp.id}>
                  {emp.name || emp.username} ({emp.designation})
                </option>
              ))
            ) : (
              <option value={deptConfig.defaultManager}>
                {deptConfig.manager} (Default)
              </option>
            )}
          </select>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          This person will receive notifications for all {stepType.replace(/_/g, ' ')} updates
        </p>
      </div>
    </div>
  );
};

export default AssigneeField;
export { DEPARTMENT_MANAGERS };
