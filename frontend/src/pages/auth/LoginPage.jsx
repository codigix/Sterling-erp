import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Lock, User, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="branding-logo">
              <div className="logo-icon">SE</div>
            </div>
            <h1>Sterling ERP</h1>
            <p>Enterprise Resource Planning</p>
            
            <div className="branding-features">
              <div className="feature">
                <div className="feature-dot"></div>
                <span>Seamless Operations</span>
              </div>
              <div className="feature">
                <div className="feature-dot"></div>
                <span>Real-time Analytics</span>
              </div>
              <div className="feature">
                <div className="feature-dot"></div>
                <span>Role-based Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="login-form-container">
          <div className="form-wrapper">
            <div className="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to continue to your workspace</p>
            </div>

            {/* Demo Credentials */}
            <div className="demo-credentials">
              <div className="demo-label">Demo Credentials</div>
              <div className="demo-items">
                <div className="demo-item">
                  <span className="demo-key">Username:</span>
                  <code className="demo-value">admin</code>
                </div>
                <div className="demo-item">
                  <span className="demo-key">Password:</span>
                  <code className="demo-value">password</code>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Username Field */}
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="admin"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-message">
                  <span>⚠</span>
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="login-button"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Logging in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="form-footer">
              <span>New to Sterling ERP?</span>
              <Link to="/register">Create an account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
