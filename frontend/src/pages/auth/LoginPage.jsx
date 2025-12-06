import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./LoginPage.css";

const ROLE_MAP = {
  admin: "/admin/dashboard",
  sales: "/department/sales",
  engineering: "/department/engineering",
  procurement: "/department/procurement",
  qc: "/department/qc",
  inventory: "/department/inventory",
  production: "/department/production",
  mes: "/department/mes",
  challan: "/department/challan"
};

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  const getRolePath = useCallback((userData = {}) => {
    if (userData.type === 'employee') {
      return "/employee/dashboard";
    }
    const role = userData.role || "";
    return ROLE_MAP[role.toLowerCase()] || "/department/sales";
  }, []);

  useEffect(() => {
    if (user?.role) {
      navigate(getRolePath(user), { replace: true });
    }
  }, [user, navigate, getRolePath]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(formData.username, formData.password);

    if (result.success) {
      navigate(getRolePath(result.user || {}));
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-form-header">
          <div className="logo-badge">SE</div>
          <div>
            <h2>Welcome Back</h2>
            <p>Sign in to access your role workspace</p>
          </div>
        </div>

        <div className="demo-box">
          <div className="demo-box-row">
            <span>Username</span>
            <code>admin</code>
          </div>
          <div className="demo-box-row">
            <span>Password</span>
            <code>password</code>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="form-footer">
          <span>Don't have an account?</span>
          <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
