import React, { useState, useEffect } from 'react';
import axios from '../../utils/api';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  Settings,
  Lock,
  Bell,
  Zap,
  Link,
  Save,
  Building2,
  Globe,
  Loader,
} from 'lucide-react';

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

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'workflow', label: 'Workflow', icon: Zap },
    { id: 'integrations', label: 'Integrations', icon: Link },
  ];

  const SettingInput = ({ label, type = 'text', value, onChange, placeholder = '' }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
    </div>
  );

  const SettingSelect = ({ label, value, onChange, options }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const SettingToggle = ({ label, checked, onChange }) => (
    <label className="flex items-center text-xs gap-3 cursor-pointer p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
      <div className="relative inline-flex w-10 h-6  rounded-full">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-all ${checked ? 'bg-blue-600 translate-x-4' : 'bg-white'}`}></div>
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-slate-600">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold ">System Settings</h1>
          <p className="text-sm text-slate-600 mt-1 text-left">
            Configure system-wide settings and preferences
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center text-xs gap-2"
        >
          {saving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </div>

      {/* Tabs Navigation */}
      <Card className="border border-slate-100">
        <div className="border-b border-slate-200 flex gap-8 overflow-x-auto p-6 bg-slate-50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-1 font-medium text-sm flex items-center text-xs gap-2 transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tab Content */}
      <div>
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Company Information */}
            <Card className="hover:shadow-lg transition-shadow border border-slate-100">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center text-xs gap-2 text-lg">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Company Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <SettingInput
                    label="Company Name"
                    value={settings.general.companyName}
                    onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                  />
                  <SettingInput
                    label="Contact Email"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                  />
                  <SettingInput
                    label="Contact Phone"
                    type="tel"
                    value={settings.general.contactPhone}
                    onChange={(e) => updateSetting('general', 'contactPhone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Company Address</label>
                  <textarea
                    value={settings.general.companyAddress}
                    onChange={(e) => updateSetting('general', 'companyAddress', e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  ></textarea>
                </div>
              </CardContent>
            </Card>

            {/* Regional Settings */}
            <Card className="hover:shadow-lg transition-shadow border border-slate-100">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center text-xs gap-2 text-lg">
                  <div className="p-2 bg-cyan-50 rounded-lg">
                    <Globe className="w-5 h-5 text-cyan-600" />
                  </div>
                  <span>Regional Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SettingSelect
                    label="Timezone"
                    value={settings.general.timezone}
                    onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                    options={[
                      { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
                      { value: 'UTC', label: 'UTC' },
                      { value: 'America/New_York', label: 'America/New_York (EST)' },
                    ]}
                  />
                  <SettingSelect
                    label="Date Format"
                    value={settings.general.dateFormat}
                    onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
                    options={[
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                    ]}
                  />
                  <SettingSelect
                    label="Currency"
                    value={settings.general.currency}
                    onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                    options={[
                      { value: 'INR', label: 'INR (₹)' },
                      { value: 'USD', label: 'USD ($)' },
                      { value: 'EUR', label: 'EUR (€)' },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Authentication */}
            <Card className="hover:shadow-lg transition-shadow border border-slate-100">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center text-xs gap-2 text-lg">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Lock className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>Authentication Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <SettingInput
                    label="Session Timeout (minutes)"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                  <SettingInput
                    label="Login Attempts Before Lockout"
                    type="number"
                    value={settings.security.loginAttempts}
                    onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
                  />
                  <SettingInput
                    label="Account Lockout Duration (minutes)"
                    type="number"
                    value={settings.security.accountLockoutDuration}
                    onChange={(e) => updateSetting('security', 'accountLockoutDuration', parseInt(e.target.value))}
                  />
                </div>
                <SettingToggle
                  label="Enable Two-Factor Authentication"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                />
              </CardContent>
            </Card>

            {/* Password Policy */}
            <Card className="hover:shadow-lg transition-shadow border border-slate-100">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center text-xs gap-2 text-lg">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Lock className="w-5 h-5 text-purple-600" />
                  </div>
                  <span>Password Policy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6">
                  <SettingInput
                    label="Minimum Password Length"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-3">
                  <SettingToggle
                    label="Require Special Characters"
                    checked={settings.security.passwordRequireSpecialChars}
                    onChange={(e) => updateSetting('security', 'passwordRequireSpecialChars', e.target.checked)}
                  />
                  <SettingToggle
                    label="Require Numbers"
                    checked={settings.security.passwordRequireNumbers}
                    onChange={(e) => updateSetting('security', 'passwordRequireNumbers', e.target.checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <Card className="hover:shadow-lg transition-shadow border border-slate-100">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center text-xs gap-2 text-lg">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SettingToggle
                  label="Email Notifications"
                  checked={settings.notifications.emailNotifications}
                  onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                />
                <SettingToggle
                  label="SMS Notifications"
                  checked={settings.notifications.smsNotifications}
                  onChange={(e) => updateSetting('notifications', 'smsNotifications', e.target.checked)}
                />
                <SettingToggle
                  label="Task Reminders"
                  checked={settings.notifications.taskReminders}
                  onChange={(e) => updateSetting('notifications', 'taskReminders', e.target.checked)}
                />
                <SettingToggle
                  label="Escalation Alerts"
                  checked={settings.notifications.escalationAlerts}
                  onChange={(e) => updateSetting('notifications', 'escalationAlerts', e.target.checked)}
                />
                <SettingToggle
                  label="System Alerts"
                  checked={settings.notifications.systemAlerts}
                  onChange={(e) => updateSetting('notifications', 'systemAlerts', e.target.checked)}
                />
                <SettingToggle
                  label="Daily Reports"
                  checked={settings.notifications.dailyReports}
                  onChange={(e) => updateSetting('notifications', 'dailyReports', e.target.checked)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workflow Settings */}
        {activeTab === 'workflow' && (
          <Card className="hover:shadow-lg transition-shadow border border-slate-100">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center text-xs gap-2 text-lg">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <span>Workflow Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingInput
                  label="Small Order Threshold (₹)"
                  type="number"
                  value={settings.workflow.smallOrderThreshold}
                  onChange={(e) => updateSetting('workflow', 'smallOrderThreshold', parseInt(e.target.value))}
                />
                <SettingInput
                  label="Default Project Timeline (days)"
                  type="number"
                  value={settings.workflow.defaultProjectTimeline}
                  onChange={(e) => updateSetting('workflow', 'defaultProjectTimeline', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-3">
                <SettingToggle
                  label="Auto-Approve Small Orders"
                  checked={settings.workflow.autoApproveSmallOrders}
                  onChange={(e) => updateSetting('workflow', 'autoApproveSmallOrders', e.target.checked)}
                />
                <SettingToggle
                  label="QC Required For All Products"
                  checked={settings.workflow.qcRequiredForAll}
                  onChange={(e) => updateSetting('workflow', 'qcRequiredForAll', e.target.checked)}
                />
                <SettingToggle
                  label="Auto-Assign Tasks"
                  checked={settings.workflow.autoAssignTasks}
                  onChange={(e) => updateSetting('workflow', 'autoAssignTasks', e.target.checked)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integrations Settings */}
        {activeTab === 'integrations' && (
          <Card className="hover:shadow-lg transition-shadow border border-slate-100">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center text-xs gap-2 text-lg">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Link className="w-5 h-5 text-indigo-600" />
                </div>
                <span>Integration Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingSelect
                  label="Email Provider"
                  value={settings.integrations.emailProvider}
                  onChange={(e) => updateSetting('integrations', 'emailProvider', e.target.value)}
                  options={[
                    { value: 'smtp', label: 'SMTP' },
                    { value: 'sendgrid', label: 'SendGrid' },
                    { value: 'mailgun', label: 'Mailgun' },
                  ]}
                />
                <SettingSelect
                  label="SMS Provider"
                  value={settings.integrations.smsProvider}
                  onChange={(e) => updateSetting('integrations', 'smsProvider', e.target.value)}
                  options={[
                    { value: 'twilio', label: 'Twilio' },
                    { value: 'aws_sns', label: 'AWS SNS' },
                    { value: 'custom', label: 'Custom' },
                  ]}
                />
                <SettingSelect
                  label="Backup Frequency"
                  value={settings.integrations.backupFrequency}
                  onChange={(e) => updateSetting('integrations', 'backupFrequency', e.target.value)}
                  options={[
                    { value: 'hourly', label: 'Hourly' },
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                  ]}
                />
                <SettingInput
                  label="Backup Retention (days)"
                  type="number"
                  value={settings.integrations.backupRetention}
                  onChange={(e) => updateSetting('integrations', 'backupRetention', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;
