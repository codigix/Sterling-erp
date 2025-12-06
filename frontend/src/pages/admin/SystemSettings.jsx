import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    general: {
      companyName: 'Sterling Techno System',
      companyAddress: '',
      contactEmail: '',
      contactPhone: '',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      currency: 'INR'
    },
    security: {
      sessionTimeout: 30,
      passwordMinLength: 8,
      passwordRequireSpecialChars: true,
      passwordRequireNumbers: true,
      twoFactorAuth: false,
      loginAttempts: 5,
      accountLockoutDuration: 30
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      taskReminders: true,
      escalationAlerts: true,
      systemAlerts: true,
      dailyReports: false
    },
    workflow: {
      autoApproveSmallOrders: false,
      smallOrderThreshold: 50000,
      qcRequiredForAll: true,
      autoAssignTasks: false,
      defaultProjectTimeline: 90
    },
    integrations: {
      emailProvider: 'smtp',
      smsProvider: 'twilio',
      backupFrequency: 'daily',
      backupRetention: 30
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/settings');
      setSettings(response.data);
    } catch (err) {
      console.error('Settings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await axios.put('/api/admin/settings', settings);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Settings save error:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading system settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Configure system-wide settings and preferences
            </p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <i className="mdi mdi-content-save mr-2"></i>Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Card Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex overflow-x-auto">
            {[
              { id: 'general', label: 'General', icon: 'mdi-cog' },
              { id: 'security', label: 'Security', icon: 'mdi-shield' },
              { id: 'notifications', label: 'Notifications', icon: 'mdi-bell' },
              { id: 'workflow', label: 'Workflow', icon: 'mdi-sitemap' },
              { id: 'integrations', label: 'Integrations', icon: 'mdi-link' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-fit px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50 dark:bg-gray-800'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                <i className={`mdi ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-10">
              {/* Company Information Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <i className="mdi mdi-building mr-2 text-blue-600 dark:text-blue-400"></i>Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={settings.general.companyName}
                      onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={settings.general.contactPhone}
                      onChange={(e) => updateSetting('general', 'contactPhone', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Company Address</label>
                  <textarea
                    value={settings.general.companyAddress}
                    onChange={(e) => updateSetting('general', 'companyAddress', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  ></textarea>
                </div>
              </div>

              {/* Regional Settings Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <i className="mdi mdi-earth mr-2 text-blue-600 dark:text-blue-400"></i>Regional Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date Format</label>
                    <select
                      value={settings.general.dateFormat}
                      onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Currency</label>
                    <select
                      value={settings.general.currency}
                      onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings Tab */}
          {activeTab === 'security' && (
            <div className="space-y-10">
              {/* Authentication Settings */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <i className="mdi mdi-lock mr-2 text-blue-600 dark:text-blue-400"></i>Authentication Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="480"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Login Attempts Before Lockout</label>
                    <input
                      type="number"
                      value={settings.security.loginAttempts}
                      onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
                      min="3"
                      max="10"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Account Lockout Duration (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.accountLockoutDuration}
                      onChange={(e) => updateSetting('security', 'accountLockoutDuration', parseInt(e.target.value))}
                      min="5"
                      max="1440"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Two-Factor Authentication</span>
                  </label>
                </div>
              </div>

              {/* Password Policy */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <i className="mdi mdi-key mr-2 text-blue-600 dark:text-blue-400"></i>Password Policy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Minimum Password Length</label>
                    <input
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                      min="6"
                      max="20"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.passwordRequireSpecialChars}
                      onChange={(e) => updateSetting('security', 'passwordRequireSpecialChars', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Special Characters</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.passwordRequireNumbers}
                      onChange={(e) => updateSetting('security', 'passwordRequireNumbers', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Numbers</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                <i className="mdi mdi-bell mr-2 text-blue-600 dark:text-blue-400"></i>Notification Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative inline-flex w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-all ${settings.notifications.emailNotifications ? 'bg-blue-600 translate-x-4' : 'bg-white'}`}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative inline-flex w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full">
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-all ${settings.notifications.smsNotifications ? 'bg-blue-600 translate-x-4' : 'bg-white'}`}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SMS Notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative inline-flex w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full">
                      <input
                        type="checkbox"
                        checked={settings.notifications.taskReminders}
                        onChange={(e) => updateSetting('notifications', 'taskReminders', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-all ${settings.notifications.taskReminders ? 'bg-blue-600 translate-x-4' : 'bg-white'}`}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Task Reminders</span>
                  </label>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative inline-flex w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full">
                      <input
                        type="checkbox"
                        checked={settings.notifications.escalationAlerts}
                        onChange={(e) => updateSetting('notifications', 'escalationAlerts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-all ${settings.notifications.escalationAlerts ? 'bg-blue-600 translate-x-4' : 'bg-white'}`}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Escalation Alerts</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative inline-flex w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full">
                      <input
                        type="checkbox"
                        checked={settings.notifications.systemAlerts}
                        onChange={(e) => updateSetting('notifications', 'systemAlerts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-all ${settings.notifications.systemAlerts ? 'bg-blue-600 translate-x-4' : 'bg-white'}`}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System Alerts</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative inline-flex w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full">
                      <input
                        type="checkbox"
                        checked={settings.notifications.dailyReports}
                        onChange={(e) => updateSetting('notifications', 'dailyReports', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-all ${settings.notifications.dailyReports ? 'bg-blue-600 translate-x-4' : 'bg-white'}`}></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Summary Reports</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Workflow Settings Tab */}
          {activeTab === 'workflow' && (
            <div className="space-y-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <i className="mdi mdi-sitemap mr-2 text-blue-600 dark:text-blue-400"></i>Workflow Automation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.workflow.autoApproveSmallOrders}
                        onChange={(e) => updateSetting('workflow', 'autoApproveSmallOrders', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-approve Small Orders</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Small Order Threshold (₹)</label>
                    <input
                      type="number"
                      value={settings.workflow.smallOrderThreshold}
                      onChange={(e) => updateSetting('workflow', 'smallOrderThreshold', parseInt(e.target.value))}
                      min="1000"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.workflow.qcRequiredForAll}
                        onChange={(e) => updateSetting('workflow', 'qcRequiredForAll', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">QC Required for All Items</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.workflow.autoAssignTasks}
                        onChange={(e) => updateSetting('workflow', 'autoAssignTasks', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-assign Tasks</span>
                    </label>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Default Project Timeline (days)</label>
                  <input
                    type="number"
                    value={settings.workflow.defaultProjectTimeline}
                    onChange={(e) => updateSetting('workflow', 'defaultProjectTimeline', parseInt(e.target.value))}
                    min="30"
                    max="365"
                    className="w-full md:w-1/3 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Integration Settings Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-10">
              {/* External Integrations */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <i className="mdi mdi-link mr-2 text-blue-600 dark:text-blue-400"></i>External Integrations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Provider</label>
                    <select
                      value={settings.integrations.emailProvider}
                      onChange={(e) => updateSetting('integrations', 'emailProvider', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="smtp">SMTP</option>
                      <option value="sendgrid">SendGrid</option>
                      <option value="mailgun">Mailgun</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">SMS Provider</label>
                    <select
                      value={settings.integrations.smsProvider}
                      onChange={(e) => updateSetting('integrations', 'smsProvider', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="twilio">Twilio</option>
                      <option value="aws-sns">AWS SNS</option>
                      <option value="messagebird">MessageBird</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Backup Frequency</label>
                    <select
                      value={settings.integrations.backupFrequency}
                      onChange={(e) => updateSetting('integrations', 'backupFrequency', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Backup Retention (days)</label>
                    <input
                      type="number"
                      value={settings.integrations.backupRetention}
                      onChange={(e) => updateSetting('integrations', 'backupRetention', parseInt(e.target.value))}
                      min="7"
                      max="365"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* System Maintenance */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <i className="mdi mdi-wrench mr-2 text-blue-600 dark:text-blue-400"></i>System Maintenance
                </h3>
                <div className="flex flex-wrap gap-4">
                  <button className="inline-flex items-center px-6 py-2.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 font-medium rounded-lg transition-colors">
                    <i className="mdi mdi-database mr-2"></i>Test Database Connection
                  </button>
                  <button className="inline-flex items-center px-6 py-2.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800 font-medium rounded-lg transition-colors">
                    <i className="mdi mdi-backup-restore mr-2"></i>Manual Backup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Save Button */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-8 py-6 flex justify-center">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <i className="mdi mdi-content-save mr-2"></i>Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
