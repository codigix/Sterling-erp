import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Lock, User, Eye, EyeOff, Zap } from "lucide-react";
import "./LoginPage.css";

const ROLE_MAP = {
  admin: "/admin/dashboard",
  management: "/admin/dashboard",
  sales: "/department/sales",
  engineering: "/department/engineering",
  procurement: "/department/procurement",
  qc: "/department/qc",
  inventory: "/department/inventory",
  production: "/department/production",
  mes: "/department/mes",
  challan: "/department/challan",
  worker: "/worker/dashboard",
  inventory_manager: "/inventory-manager/dashboard",
  design_engineer: "/design-engineer/dashboard",
  qc_manager: "/qc-manager/dashboard",
  production_manager: "/production-manager/dashboard",
  accountant: "/admin/dashboard",
  employee: "/employee/dashboard",
  supervisor: "/department/production",
};

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  const normalizeRoleName = (role) => {
    if (!role) return "";
    return role
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
  };

  const getRolePath = useCallback((userData = {}) => {
    if (userData.type === 'employee') {
      return "/employee/dashboard";
    }
    const role = userData.role || "";
    const normalizedRole = normalizeRoleName(role);
    return ROLE_MAP[normalizedRole] || "/department/sales";
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
      <div className="login-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="branding-header">
              <div className="branding-logo">
                <Zap className="logo-icon" size={40} />
              </div>
              <div>
                <h1>Sterling</h1>
                <p className="tagline">Enterprise Resource Planning</p>
              </div>
            </div>

            <div className="branding-features">
              <div className="feature">
                <div className="feature-icon">📊</div>
                <div>
                  <div className="feature-title">Real-time Analytics</div>
                  <div className="feature-desc">Track operations as they happen</div>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">🔒</div>
                <div>
                  <div className="feature-title">Secure Access</div>
                  <div className="feature-desc">Role-based permissions & control</div>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">⚡</div>
                <div>
                  <div className="feature-title">Seamless Operations</div>
                  <div className="feature-desc">Integrated workflows & automation</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="login-form-container">
          <div className="form-wrapper">
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to your account</p>
            </div>

            {/* Quick Access Demo */}
            <div className="quick-access">
              <div className="quick-label">
                <span>Quick Access</span>
                <code className="badge">Demo</code>
              </div>
              <div className="quick-buttons">
                <button 
                  type="button" 
                  className="quick-btn"
                  onClick={() => setFormData({ username: "inventory.manager", password: "password" })}
                >
                  Inventory
                </button>
                <button 
                  type="button" 
                  className="quick-btn"
                  onClick={() => setFormData({ username: "design.engineer", password: "password" })}
                >
                  Design Eng.
                </button>
                <button 
                  type="button" 
                  className="quick-btn"
                  onClick={() => setFormData({ username: "qc.manager", password: "password" })}
                >
                  QC
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <div className="error-icon">⚠️</div>
                <div className="error-content">
                  <div className="error-title">Authentication Failed</div>
                  <div className="error-text">{error}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              {/* Username Field */}
              <div className="form-group">
                <label htmlFor="username">
                  <span>Username</span>
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Enter your username"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="password">
                    <span>Password</span>
                    <span className="required">*</span>
                  </label>
                </div>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="login-button"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="arrow">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="form-footer">
              <span>New user?</span>
              <Link to="/register">Create account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
