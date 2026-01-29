import React, { useMemo } from 'react';
import { Users } from 'lucide-react';
import Input from '../../../ui/Input';
import { DEPARTMENT_MANAGERS } from './constants';

const AssigneeField = ({ stepType, formData, updateField, employees = [], readOnly = false }) => {
  const deptConfig = DEPARTMENT_MANAGERS[stepType];
  
  const assigneeKey = `${stepType}AssignedTo`;
  
  // Resolve default assignee ID from loginId if needed
  const defaultEmployee = useMemo(() => 
    deptConfig ? employees.find(emp => emp.loginId === deptConfig.defaultManager) : null,
    [employees, deptConfig]
  );
  
  const departmentEmployees = useMemo(() => {
    if (!deptConfig) return [];
    return employees.filter(emp => {
      const deptName = deptConfig.manager.toLowerCase();
      const loginIdMatch = emp.loginId === deptConfig.defaultManager;
      const designationMatch = emp.designation?.toLowerCase().includes(deptName);
      const roleMatch = emp.role?.toLowerCase().includes(deptName);
      
      return designationMatch || roleMatch || loginIdMatch;
    });
  }, [employees, deptConfig]);

  if (!deptConfig) return null;

  const defaultValue = defaultEmployee ? defaultEmployee.id : deptConfig.defaultManager;
  const assigneeValue = formData[assigneeKey] || defaultValue;

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
            disabled={readOnly}
            className="w-full p-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
          >
            <option value="">Select {deptConfig.manager}</option>
            {departmentEmployees.length > 0 ? (
              departmentEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.designation || emp.role})
                </option>
              ))
            ) : (
              <option value={defaultValue}>
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
