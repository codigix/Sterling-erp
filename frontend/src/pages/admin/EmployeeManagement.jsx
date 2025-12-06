import React, { useState, useEffect } from "react";
import axios from "../../utils/api";
import Card, { CardContent, CardTitle, CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  Search,
  ChevronDown,
  Lock,
  Shield,
} from "lucide-react";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [selectedCredentials, setSelectedCredentials] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    designation: "",
    department: "",
    roleId: null,
    loginId: "",
    password: "",
    actions: [],
  });

  const designations = [
    "Manager",
    "Senior Engineer",
    "Engineer",
    "Supervisor",
    "Associate",
    "Intern",
    "Coordinator",
  ];

  const departments = [
    "Engineering",
    "Sales",
    "Production",
    "QC",
    "Inventory",
    "Procurement",
    "HR",
  ];

  const availableRoles = [
    { id: 9, name: "Worker", description: "Basic worker access" },
    {
      id: 8,
      name: "Production Supervisor",
      description: "Can manage team and tasks",
    },
    {
      id: 7,
      name: "Inventory Manager",
      description: "Can manage inventory",
    },
    {
      id: 6,
      name: "QC Inspector",
      description: "Quality control access",
    },
    {
      id: 5,
      name: "Procurement Officer",
      description: "Can manage procurement",
    },
    {
      id: 4,
      name: "Engineering",
      description: "Engineering access",
    },
    {
      id: 3,
      name: "Sales",
      description: "Sales access",
    },
    {
      id: 2,
      name: "Management",
      description: "Can manage all",
    },
  ];

  const availableActions = [
    {
      id: "view_tasks",
      name: "View Tasks",
      category: "Tasks",
      description: "Can view assigned tasks",
    },
    {
      id: "manage_tasks",
      name: "Manage Tasks",
      category: "Tasks",
      description: "Can create and edit tasks",
    },
    {
      id: "view_projects",
      name: "View Projects",
      category: "Projects",
      description: "Can view projects",
    },
    {
      id: "manage_projects",
      name: "Manage Projects",
      category: "Projects",
      description: "Can manage projects",
    },
    {
      id: "view_attendance",
      name: "View Attendance",
      category: "Attendance",
      description: "Can view attendance records",
    },
    {
      id: "manage_attendance",
      name: "Manage Attendance",
      category: "Attendance",
      description: "Can manage attendance",
    },
    {
      id: "view_reports",
      name: "View Reports",
      category: "Reports",
      description: "Can view reports",
    },
    {
      id: "export_data",
      name: "Export Data",
      category: "Reports",
      description: "Can export data",
    },
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/employee-list");
      setEmployees(response.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load employees");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleActionToggle = (actionId) => {
    setFormData((prev) => ({
      ...prev,
      actions: prev.actions.includes(actionId)
        ? prev.actions.filter((id) => id !== actionId)
        : [...prev.actions, actionId],
    }));
  };

  const generateLoginId = (firstName, lastName) => {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  };

  const generatePassword = () => {
    return Math.random().toString(36).substring(2, 12);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.roleId) {
        setError("Please select a role");
        return;
      }

      const autoLoginId =
        formData.loginId || generateLoginId(formData.firstName, formData.lastName);
      const autoPassword = formData.password || generatePassword();

      const data = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        designation: formData.designation,
        department: formData.department,
        roleId: formData.roleId,
        loginId: autoLoginId,
        password: autoPassword,
        actions: formData.actions,
      };

      if (editingEmployee) {
        await axios.put(`/api/admin/employee-list/${editingEmployee.id}`, data);
      } else {
        const response = await axios.post("/api/admin/employee-list", data);
        setSelectedCredentials({
          name: `${formData.firstName} ${formData.lastName}`,
          loginId: autoLoginId,
          password: autoPassword,
          email: formData.email
        });
        setShowCredentialsDialog(true);
      }

      await fetchEmployees();
      setShowForm(false);
      setEditingEmployee(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        designation: "",
        department: "",
        roleId: null,
        loginId: "",
        password: "",
        actions: [],
      });
    } catch (err) {
      setError("Failed to save employee: " + err.message);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      designation: employee.designation,
      department: employee.department,
      roleId: employee.roleId || null,
      loginId: employee.loginId,
      password: "",
      actions: employee.actions || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`/api/admin/employee-list/${id}`);
        await fetchEmployees();
      } catch (err) {
        setError("Failed to delete employee");
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Employee Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create and manage employees with role-based access controls
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingEmployee(null);
            setFormData({
              firstName: "",
              lastName: "",
              email: "",
              designation: "",
              department: "",
              roleId: null,
              loginId: "",
              password: "",
              actions: [],
            });
          }}
          className="flex items-center space-x-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEmployee ? "Edit Employee" : "Create New Employee"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Job Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Designation *
                    </label>
                    <select
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="">Select Designation</option>
                      {designations.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Role *
                    </label>
                    <select
                      name="roleId"
                      value={formData.roleId || ""}
                      onChange={(e) => setFormData({...formData, roleId: parseInt(e.target.value)})}
                      required
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="">Select Role</option>
                      {availableRoles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Login Credentials */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Login Credentials</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Login ID
                    </label>
                    <input
                      type="text"
                      name="loginId"
                      value={
                        formData.loginId ||
                        generateLoginId(formData.firstName, formData.lastName)
                      }
                      onChange={handleInputChange}
                      placeholder="Auto-generated from name"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Leave empty to auto-generate from name
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Password
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Auto-generated if empty"
                        className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            password: generatePassword(),
                          }))
                        }
                        className="text-sm"
                      >
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Leave empty to auto-generate
                    </p>
                  </div>
                </div>
              </div>

              {/* Role-Based Actions */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Permissions & Actions</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableActions.map((action) => (
                    <label
                      key={action.id}
                      className="flex items-start p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                    >
                      <input
                        type="checkbox"
                        checked={formData.actions.includes(action.id)}
                        onChange={() => handleActionToggle(action.id)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {action.name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {action.description}
                        </p>
                        <Badge className="mt-2 text-xs bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200">
                          {action.category}
                        </Badge>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit">
                  {editingEmployee ? "Update Employee" : "Create Employee"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEmployee(null);
                    setFormData({
                      firstName: "",
                      lastName: "",
                      email: "",
                      designation: "",
                      department: "",
                      roleId: null,
                      loginId: "",
                      password: "",
                      actions: [],
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Employees List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading employees...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEmployees.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-600 dark:text-slate-400">
                  No employees found
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEmployees.map((emp) => (
              <Card key={emp.id} className="hover:shadow-md transition">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {emp.firstName} {emp.lastName}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {emp.designation} • {emp.department}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {emp.email}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {availableRoles.find(r => r.id === emp.roleId)?.name || emp.role}
                        </Badge>
                        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Login ID: {emp.loginId}
                        </Badge>
                        <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                          {emp.actions?.length || 0} actions
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleEdit(emp)}
                        className="flex items-center space-x-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDelete(emp.id)}
                        className="flex items-center space-x-2 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {showCredentialsDialog && selectedCredentials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Employee Login Credentials</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
                  Share these credentials with the employee. They can change password after first login.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">Employee Name</p>
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                      <code className="flex-1 text-sm font-mono text-slate-900 dark:text-slate-100">{selectedCredentials.name}</code>
                      <button onClick={() => copyToClipboard(selectedCredentials.name)} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 p-1">
                        {/* Copy icon emoji */}
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">Login ID</p>
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                      <code className="flex-1 text-sm font-mono text-slate-900 dark:text-slate-100">{selectedCredentials.loginId}</code>
                      <button onClick={() => copyToClipboard(selectedCredentials.loginId)} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 p-1">
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">Temporary Password</p>
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                      <code className="flex-1 text-sm font-mono text-slate-900 dark:text-slate-100">{selectedCredentials.password}</code>
                      <button onClick={() => copyToClipboard(selectedCredentials.password)} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 p-1">
                        📋
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">Email</p>
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                      <code className="flex-1 text-sm font-mono text-slate-900 dark:text-slate-100 break-all">{selectedCredentials.email}</code>
                      <button onClick={() => copyToClipboard(selectedCredentials.email)} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 p-1">
                        📋
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                  ⚠️ Save these credentials securely. Employee should change password on first login.
                </p>
              </div>

              <Button 
                onClick={() => setShowCredentialsDialog(false)}
                className="w-full"
              >
                Done
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
