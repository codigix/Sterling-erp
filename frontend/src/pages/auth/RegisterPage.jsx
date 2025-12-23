import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, Mail, Shield, Eye, EyeOff, Check, AlertCircle, Loader } from 'lucide-react';
import './RegisterPage.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    roleId: ''
  });
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validations, setValidations] = useState({
    username: false,
    password: false,
    match: false,
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const response = await fetch('http://localhost:5001/api/auth/roles/active');
        if (response.ok) {
          const data = await response.json();
          setRoles(data.roles || []);
        } else {
          console.error('Failed to load roles');
          setRoles([]);
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        setRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Real-time validation
    if (name === 'username') {
      setValidations(prev => ({
        ...prev,
        username: value.length >= 3
      }));
    }
    if (name === 'password') {
      setValidations(prev => ({
        ...prev,
        password: value.length >= 6,
        match: value === formData.confirmPassword && value.length >= 6
      }));
    }
    if (name === 'confirmPassword') {
      setValidations(prev => ({
        ...prev,
        match: value === formData.password && value.length >= 6
      }));
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.roleId) {
      setError('Please select a role');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const result = await register(formData.username, formData.password, formData.roleId, formData.email);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="register-page">
      <div className="register-content">
        {/* Header Section */}
        <div className="register-header">
          <div className="header-logo">
            <div className="logo-badge">SE</div>
          </div>
          <div className="header-text">
            <h1>Sterling ERP</h1>
            <p>Enterprise Resource Planning System</p>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="register-form-container">
          <div className="form-wrapper">
            <div className="form-header">
              <h2>Create Account</h2>
              <p>Join Sterling ERP and manage your operations efficiently</p>
            </div>

            {success && (
              <div className="success-message">
                <Check size={20} />
                <span>Registration successful! Redirecting to login...</span>
              </div>
            )}

            {error && (
              <div className="error-message">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              {/* Username Field */}
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Choose a username"
                    className={`form-input ${formData.username && !validations.username ? 'invalid' : ''}`}
                  />
                  {formData.username && (
                    validations.username ? (
                      <Check className="validation-icon valid" size={18} />
                    ) : (
                      <AlertCircle className="validation-icon invalid" size={18} />
                    )
                  )}
                </div>
                {formData.username && !validations.username && (
                  <p className="validation-message">Username must be at least 3 characters</p>
                )}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email <span className="optional">(optional)</span></label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@company.com"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="form-group">
                <label htmlFor="roleId">Select Role *</label>
                <div className="role-selector">
                  {rolesLoading ? (
                    <div className="roles-loading">
                      <Loader size={18} className="spinner" />
                      <span>Loading roles...</span>
                    </div>
                  ) : roles.length > 0 ? (
                    <div className="roles-grid">
                      {roles.map((role) => (
                        <label key={role.id} className={`role-option ${formData.roleId === String(role.id) ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="roleId"
                            value={role.id}
                            onChange={handleChange}
                            required
                          />
                          <div className="role-card">
                            <Shield size={20} />
                            <span>{role.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <select
                      id="roleId"
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleChange}
                      required
                      className="form-input"
                    >
                      <option value="">Select a role</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Minimum 6 characters"
                    className={`form-input ${formData.password && !validations.password ? 'invalid' : ''}`}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {formData.password && (
                    validations.password ? (
                      <Check className="validation-icon valid" size={18} />
                    ) : (
                      <AlertCircle className="validation-icon invalid" size={18} />
                    )
                  )}
                </div>
                {formData.password && !validations.password && (
                  <p className="validation-message">Password must be at least 6 characters</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Re-enter your password"
                    className={`form-input ${formData.confirmPassword && !validations.match ? 'invalid' : ''}`}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {formData.confirmPassword && (
                    validations.match ? (
                      <Check className="validation-icon valid" size={18} />
                    ) : (
                      <AlertCircle className="validation-icon invalid" size={18} />
                    )
                  )}
                </div>
                {formData.confirmPassword && !validations.match && (
                  <p className="validation-message">Passwords do not match</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || rolesLoading}
                className="register-button"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="spinner" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="form-footer">
              <span>Already have an account?</span>
              <Link to="/login">Sign in here</Link>
            </div>

            {/* Terms */}
            <div className="terms-notice">
              <p>By registering, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
