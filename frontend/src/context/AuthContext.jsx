import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "../utils/api";

const DEMO_USERS = {
  admin: { password: "password", role: "admin", name: "System Admin" },
  sales: { password: "password", role: "sales", name: "Sales Manager" },
  engineering: { password: "password", role: "engineering", name: "Design Lead" },
  procurement: { password: "password", role: "procurement", name: "Procurement Lead" },
  qc: { password: "password", role: "qc", name: "Quality Head" },
  inventory: { password: "password", role: "inventory", name: "Stores Supervisor" },
  production: { password: "password", role: "production", name: "Production Planner" },
  mes: { password: "password", role: "mes", name: "MES Controller" },
  challan: { password: "password", role: "challan", name: "Logistics Coordinator" },
  "john.doe": { password: "password", role: "employee", name: "John Doe", designation: "Senior Engineer", department: "Engineering" },
  "jane.smith": { password: "password", role: "supervisor", name: "Jane Smith", designation: "Project Supervisor", department: "Production" },
  "rajesh.kumar": { password: "password", role: "employee", name: "Rajesh Kumar", designation: "Engineer", department: "Engineering" },
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
