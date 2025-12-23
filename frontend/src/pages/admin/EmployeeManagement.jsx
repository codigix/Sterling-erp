import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/api";
import Card, { CardContent, CardTitle, CardHeader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable/DataTable";
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Search,
  Lock,
  Shield,
  CheckCircle2,
  Users,
  LogIn,
  Mail,
} from "lucide-react";

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [selectedCredentials, setSelectedCredentials] = useState(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [registeringEmployee, setRegisteringEmployee] = useState(null);
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

  const designations = ["Manager", "Senior Engineer", "Engineer", "Supervisor", "Associate", "Intern", "Coordinator"];
  const departments = ["Engineering", "Sales", "Production", "QC", "Inventory", "Procurement", "HR"];
  const availableRoles = [
    { id: 9, name: "Worker" },
    { id: 8, name: "Production Supervisor" },
    { id: 7, name: "Inventory Manager" },
    { id: 6, name: "QC Inspector" },
    { id: 5, name: "Procurement Officer" },
    { id: 4, name: "Engineering" },
    { id: 3, name: "Sales" },
    { id: 2, name: "Management" },
  ];

  const fallbackSampleEmployees = [
    {
      id: 1,
      firstName: "Rajesh",
      lastName: "Kumar",
      email: "rajesh.kumar@sterling.com",
      designation: "Senior Engineer",
      department: "Engineering",
      role: "Engineering",
      loginId: "rajesh.kumar",
      status: "active",
    },
    {
      id: 2,
      firstName: "Priya",
      lastName: "Sharma",
      email: "priya.sharma@sterling.com",
      designation: "Production Manager",
      department: "Production",
      role: "Production Supervisor",
      loginId: "priya.sharma",
      status: "active",
    },
    {
      id: 3,
      firstName: "Amit",
      lastName: "Patel",
      email: "amit.patel@sterling.com",
      designation: "QC Inspector",
      department: "QC",
      role: "QC Inspector",
      loginId: "amit.patel",
      status: "active",
    },
    {
      id: 4,
      firstName: "Neha",
      lastName: "Singh",
      email: "neha.singh@sterling.com",
      designation: "Inventory Manager",
      department: "Inventory",
      role: "Inventory Manager",
      loginId: "neha.singh",
      status: "active",
    },
  ];

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/employees");
      setEmployees(response.data || []);
    } catch (err) {
      console.error("API Error:", err);
      setError("API unavailable. Using sample data.");
      setEmployees(fallbackSampleEmployees);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

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
        await axios.put(`/api/employees/${editingEmployee.id}`, data);
      } else {
        const response = await axios.post("/api/employees", data);
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
        await axios.delete(`/api/employees/${id}`);
        await fetchEmployees();
      } catch (err) {
        setError("Failed to delete employee");
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleRegister = (employee) => {
    setRegisteringEmployee(employee);
    setShowRegisterDialog(true);
  };

  const sendRegistrationEmail = async () => {
    try {
      await axios.post(`/api/employees/${registeringEmployee.id}/send-credentials`, {
        email: registeringEmployee.email,
        loginId: registeringEmployee.loginId,
        password: registeringEmployee.password,
        name: `${registeringEmployee.firstName} ${registeringEmployee.lastName}`
      });
      setError(null);
      setShowRegisterDialog(false);
      alert(`Registration email sent to ${registeringEmployee.email}`);
    } catch (err) {
      setError("Failed to send registration email: " + err.message);
    }
  };

  const handleLogin = (employee) => {
    localStorage.setItem("token", "demo-token");
    localStorage.setItem("demoUser", JSON.stringify({
      id: `demo-${employee.loginId}`,
      username: employee.loginId,
      role: employee.role || "Employee",
      name: `${employee.firstName} ${employee.lastName}`,
      type: 'employee',
      email: employee.email,
      designation: employee.designation,
      department: employee.department
    }));
    window.location.href = "/employee/dashboard";
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'firstName',
      label: 'Name',
      sortable: true,
      render: (value, row) => (
        <span className="font-medium  dark:">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value) => (
        <span className="text-slate-600 dark:text-slate-400 text-sm">
          {value}
        </span>
      ),
    },
    {
      key: 'designation',
      label: 'Designation',
      sortable: true,
      render: (value) => (
        <span className=" dark: text-sm">
          {value}
        </span>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      render: (value) => (
        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {value}
        </span>
      ),
    },
    {
      key: 'roleId',
      label: 'Role',
      sortable: true,
      render: (value) => (
        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
          {availableRoles.find(r => r.id === value)?.name || 'N/A'}
        </span>
      ),
    },
    {
      key: 'loginId',
      label: 'Login ID',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Credentials',
      sortable: false,
      render: (value, row) => (
        <button
          onClick={() => handleRegister(row)}
          title="Send Registration Email"
          className="inline-flex items-center gap-1 p-1 text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Mail className="w-4 h-4" />
          Register
        </button>
      ),
    },
    {
      key: 'loginId',
      label: 'Quick Login',
      sortable: false,
      render: (value, row) => (
        <button
          onClick={() => handleLogin(row)}
          title="Login as this employee"
          className="inline-flex items-center gap-1 p-1 text-xs font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <LogIn className="w-4 h-4" />
          Login
        </button>
      ),
    },
    {
      key: 'id',
      label: 'Manage',
      sortable: false,
      render: (value, row) => (
        <div className="flex items-center text-xs gap-1">
          <button
            onClick={() => handleEdit(row)}
            title="Edit"
            className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition"
          >
            <Edit2 className="w-4 h-4 text-green-600" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            title="Delete"
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold  text-left">
            Employee Management
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 text-left">
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
          className="flex items-center text-xs gap-1 text-sm px-3 py-2 h-auto"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded flex items-center text-xs gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, or designation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800  dark: placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingEmployee ? "Edit Employee" : "New Employee"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information */}
              <div>
                <h3 className="text-sm font-semibold  dark: mb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="John"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Doe"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-semibold  dark: mb-2">
                  Contact Information
                </h3>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john.doe@sterling.com"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Job Information */}
              <div>
                <h3 className="text-sm font-semibold  dark: mb-2">
                  Job Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">
                      Designation
                    </label>
                    <select
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Role Assignment */}
              <div>
                <h3 className="text-sm font-semibold  dark: mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Role Assignment
                </h3>
                <select
                  name="roleId"
                  value={formData.roleId || ""}
                  onChange={(e) => setFormData({ ...formData, roleId: parseInt(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Role</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Credentials (only for new employees) */}
              {!editingEmployee && (
                <div>
                  <h3 className="text-sm font-semibold  dark: mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Login Credentials (Auto-generated)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">
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
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 text-left">
                        Temporary Password
                      </label>
                      <input
                        type="text"
                        name="password"
                        value={formData.password || generatePassword()}
                        readOnly
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700 text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 text-xs ">
                    Password will be displayed after employee creation
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 mt-6">
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEmployee(null);
                  }}
                  variant="secondary"
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" className="text-xs">
                  {editingEmployee ? "Update Employee" : "Create Employee"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Credentials Dialog */}
      {showCredentialsDialog && selectedCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Employee Created Successfully
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Employee "{selectedCredentials.name}" has been created. Share these credentials:
              </p>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-3 rounded">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Email</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="font-mono text-sm">{selectedCredentials.email}</p>
                    <button
                      onClick={() => copyToClipboard(selectedCredentials.email)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded hover:bg-blue-200"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Login ID</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="font-mono text-sm">{selectedCredentials.loginId}</p>
                    <button
                      onClick={() => copyToClipboard(selectedCredentials.loginId)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded hover:bg-blue-200"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Temporary Password</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="font-mono text-sm">{selectedCredentials.password}</p>
                    <button
                      onClick={() => copyToClipboard(selectedCredentials.password)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded hover:bg-blue-200"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                ⚠️ The employee must change their password on first login
              </p>

              <Button
                onClick={() => setShowCredentialsDialog(false)}
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Registration Dialog */}
      {showRegisterDialog && registeringEmployee && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Register Employee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700/50">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  Send registration credentials to <strong>{registeringEmployee.firstName} {registeringEmployee.lastName}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">Email Address</p>
                <p className="text-sm font-medium text-slate-900 text-left dark:text-slate-100">{registeringEmployee.email}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">Login ID</p>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                  <p className="font-mono text-sm text-slate-900 dark:text-slate-100">{registeringEmployee.loginId}</p>
                  <button
                    onClick={() => copyToClipboard(registeringEmployee.loginId)}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded hover:bg-blue-200"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">Temporary Password</p>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
                  <p className="font-mono text-sm text-slate-900 dark:text-slate-100">{registeringEmployee.password}</p>
                  <button
                    onClick={() => copyToClipboard(registeringEmployee.password)}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded hover:bg-blue-200"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                ⚠️ Employee must change password on first login
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={sendRegistrationEmail}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Mail className="w-4 h-4" />
                  Send Email
                </Button>
                <Button
                  onClick={() => setShowRegisterDialog(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredEmployees.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            No employees found
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {searchTerm ? "Try adjusting your search filters" : "Create your first employee to get started"}
          </p>
        </div>
      )}

      {/* Employee Table */}
      {filteredEmployees.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={filteredEmployees}
              sortable={true}
              striped={true}
              hover={true}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployeeManagement;
