import { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "../utils/api";

const DEMO_USERS = {
  admin: { password: "password", role: "Admin", name: "System Admin" },
  sales: { password: "password", role: "Sales", name: "Sales Manager" },
  engineering: { password: "password", role: "Engineering", name: "Design Lead" },
  procurement: { password: "password", role: "Procurement", name: "Procurement Lead" },
  qc: { password: "password", role: "QC", name: "Quality Head" },
  inventory: { password: "password", role: "Inventory", name: "Stores Supervisor" },
  production: { password: "password", role: "Production", name: "Production Planner" },
  mes: { password: "password", role: "MES", name: "MES Controller" },
  challan: { password: "password", role: "Challan", name: "Logistics Coordinator" },
  "john.doe": { password: "password", role: "Employee", name: "John Doe", designation: "Senior Engineer", department: "Engineering" },
  "jane.smith": { password: "password", role: "Supervisor", name: "Jane Smith", designation: "Project Supervisor", department: "Production" },
  "rajesh.kumar": { password: "password", role: "Employee", name: "Rajesh Kumar", designation: "Engineer", department: "Engineering" },
  "inventory.manager": { password: "password", role: "Inventory Manager", name: "Inventory Manager", department: "Inventory" },
  "design.engineer": { password: "password", role: "Design Engineer", name: "Design Engineer", designation: "Design Engineer", department: "Engineering" },
  "qc.manager": { password: "password", role: "QC Manager", name: "QC Manager", department: "Quality Control" },
  "production.manager": { password: "password", role: "Production Manager", name: "Production Manager", department: "Production" },
  "accountant": { password: "password", role: "Admin", name: "Accountant", department: "Finance" },
};

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("demoUser");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    if (token === "demo-token") {
      const storedUser = localStorage.getItem("demoUser");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
      return;
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    try {
      const response = await axios.get("/api/auth/me", { __sessionGuard: true });
      setUser(response.data.user);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (username, password) => {
    try {
      const response = await axios.post("/api/auth/login", {
        username,
        password,
      });
      const { token, user: userData } = response.data;

      localStorage.setItem("token", token);
      localStorage.removeItem("demoUser");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      const normalizedUsername = username?.trim().toLowerCase();
      const demoEntry = normalizedUsername ? DEMO_USERS[normalizedUsername] : null;

      if (demoEntry && password === demoEntry.password) {
        const userData = {
          id: `demo-${normalizedUsername}`,
          username: normalizedUsername,
          role: demoEntry.role,
          name: demoEntry.name,
          type: demoEntry.role === 'employee' ? 'employee' : 'user',
          designation: demoEntry.designation,
          department: demoEntry.department,
        };
        localStorage.setItem("token", "demo-token");
        localStorage.setItem("demoUser", JSON.stringify(userData));
        delete axios.defaults.headers.common["Authorization"];
        setUser(userData);

        return { success: true, user: userData };
      }

      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (username, password, roleId, email) => {
    try {
      const response = await axios.post("/api/auth/register", {
        username,
        password,
        roleId,
        email,
      });

      return {
        success: true,
        message: response.data.message,
        userId: response.data.userId,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
