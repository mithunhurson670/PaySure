import React, { useState } from 'react';
import {
  User,
  Building2,
  Lock,
  Bell,
  ShieldCheck,
  Save,
  LogOut,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Briefcase,
  Mail,
  Phone,
  IndianRupee,
  Smartphone,
  History,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/financialCalculations';

const INDUSTRY_OPTIONS = [
  'Packaging & Industrial Printing MSME',
  'Manufacturing & Precision Engineering',
  'FMCG, Food Processing & Wholesale Distribution',
  'Textiles, Apparel & Garments',
  'Chemicals, Polymers & Raw Materials',
  'Electronics & Electrical Equipment',
  'IT Services & Software Consulting',
  'Logistics, Warehousing & Transport',
  'Construction, Building Materials & Hardware',
  'Healthcare, Pharma & Medical Supplies',
  'Other MSME / Enterprise',
];

const BUSINESS_TYPE_OPTIONS = [
  'Private Limited Company (Pvt Ltd)',
  'Sole Proprietorship',
  'Partnership Firm',
  'Limited Liability Partnership (LLP)',
  'One Person Company (OPC)',
  'Public Limited Company',
];

export const SettingsPage: React.FC = () => {
  const {
    userAccount,
    updateUserProfile,
    changePassword,
    updateNotificationPreferences,
    updateSecuritySettings,
    businessSettings,
    updateBusinessSettings,
    logout,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'liquidity'>('profile');

  // --- Profile State ---
  const [ownerName, setOwnerName] = useState(userAccount.ownerName || businessSettings.ownerName);
  const [email, setEmail] = useState(userAccount.email || businessSettings.email);
  const [phone, setPhone] = useState(userAccount.phone || businessSettings.phone);
  const [businessName, setBusinessName] = useState(userAccount.businessName || businessSettings.businessName);
  const [industry, setIndustry] = useState(userAccount.industry || businessSettings.industry || INDUSTRY_OPTIONS[0]);
  const [businessType, setBusinessType] = useState(userAccount.businessType || businessSettings.businessType || BUSINESS_TYPE_OPTIONS[0]);
  const [availableWorkingCapital, setAvailableWorkingCapital] = useState(
    userAccount.currentAvailableCapital || businessSettings.currentAvailableCapital
  );
  const [gstin, setGstin] = useState(businessSettings.gstin || '27AABCS1429B1Z4');

  // --- Security & Password State ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(userAccount.twoFactorEnabled || false);
  const [autoLockMinutes, setAutoLockMinutes] = useState(userAccount.autoLockMinutes || 30);

  // --- Notification Preferences State ---
  const [notifications, setNotifications] = useState({
    emailAlerts: userAccount.notificationPreferences?.emailAlerts ?? true,
    smsAlerts: userAccount.notificationPreferences?.smsAlerts ?? true,
    cashRiskAlerts: userAccount.notificationPreferences?.cashRiskAlerts ?? true,
    weeklyDigest: userAccount.notificationPreferences?.weeklyDigest ?? true,
    msmeStatutoryAlerts: userAccount.notificationPreferences?.msmeStatutoryAlerts ?? true,
  });

  // --- Liquidity Policy State ---
  const [defaultCreditPeriodDays, setDefaultCreditPeriodDays] = useState(businessSettings.defaultCreditPeriodDays || 45);
  const [minimumAdvanceDesiredPercent, setMinimumAdvanceDesiredPercent] = useState(businessSettings.minimumAdvanceDesiredPercent || 50);
  const [safetyBufferAmount, setSafetyBufferAmount] = useState(businessSettings.safetyBufferAmount || 400000);

  // Save Profile Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      ownerName,
      email,
      phone,
      businessName,
      industry,
      businessType,
      currentAvailableCapital: availableWorkingCapital,
    });
    updateBusinessSettings({
      gstin,
    });
  };

  // Change Password Handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    const res = changePassword(currentPassword, newPassword);
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setPasswordError(res.message);
    }
  };

  // Toggle 2FA
  const handleToggle2FA = () => {
    const nextVal = !twoFactorEnabled;
    setTwoFactorEnabled(nextVal);
    updateSecuritySettings({ twoFactorEnabled: nextVal });
    showToast(nextVal ? 'Two-factor authentication enabled via SMS/OTP.' : 'Two-factor authentication disabled.', 'info');
  };

  // Save Notification Preferences
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationPreferences(notifications);
  };

  // Save Liquidity Policy
  const handleSaveLiquidity = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessSettings({
      currentAvailableCapital: availableWorkingCapital,
      defaultCreditPeriodDays,
      minimumAdvanceDesiredPercent,
      safetyBufferAmount,
    });
    updateUserProfile({
      currentAvailableCapital: availableWorkingCapital,
    });
    showToast('Liquidity baseline & credit rules updated!', 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Account & Business Settings
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              MSME Guard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage owner profile, enterprise registration, authentication security, and credit parameters.
          </p>
        </div>

        {/* Quick Logout Button */}
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-medium text-xs rounded-lg transition-colors cursor-pointer w-fit"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <User className="w-4 h-4" />
          <span>User & Business Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Account Security & Password</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'notifications'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab('liquidity')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === 'liquidity'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Liquidity & Credit Rules</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: User & Business Profile                                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Identity Snapshot Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-indigo-900 text-indigo-100 font-bold text-base flex items-center justify-center border border-indigo-700 shadow-inner">
                {ownerName
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'RS'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-slate-900 truncate">{ownerName}</h3>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{businessName}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-blue-600 font-medium">{businessType}</span>
                </p>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Available Liquid Fund</span>
                <span className="text-sm font-bold font-mono text-emerald-600">
                  {formatINR(availableWorkingCapital)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4">
              {/* Owner Full Name */}
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Managing Director / Owner Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Work Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Registered Mobile Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Business Name */}
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Business / Enterprise Legal Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Industry Sector */}
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Industry Sector</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    {INDUSTRY_OPTIONS.map(ind => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Business Type */}
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Business Entity Type</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <select
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    {BUSINESS_TYPE_OPTIONS.map(bt => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Available Working Capital */}
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Available Working Capital Buffer (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                    ₹
                  </div>
                  <input
                    type="number"
                    value={availableWorkingCapital}
                    onChange={e => setAvailableWorkingCapital(Number(e.target.value))}
                    step="50000"
                    min="50000"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Formatted: {formatINR(availableWorkingCapital)}
                </span>
              </div>

              {/* GSTIN */}
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">GSTIN Tax Registration Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={e => setGstin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile & Business Details</span>
            </button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: Account Security & Password                            */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'security' && (
        <div className="space-y-5">
          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <span>Change Password</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your account password to protect access to financial simulations and invoices.
              </p>
            </div>

            {passwordError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Update Password</span>
              </button>
            </div>
          </form>

          {/* 2FA & Session Security */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Security Policies & Two-Factor Authentication</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Strengthen enterprise account access with multi-factor verification and session control.
              </p>
            </div>

            <div className="space-y-3 divide-y divide-slate-100">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 mt-0.5">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Two-Factor Authentication (2FA)</div>
                    <p className="text-[11px] text-slate-500">
                      Require an SMS/WhatsApp OTP token whenever signing in from a new workstation or browser.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={handleToggle2FA}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Inactivity Auto-Lock */}
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Session Idle Auto-Lock</div>
                    <p className="text-[11px] text-slate-500">
                      Automatically lock financial screen after inactivity.
                    </p>
                  </div>
                </div>

                <select
                  value={autoLockMinutes}
                  onChange={e => {
                    const mins = Number(e.target.value);
                    setAutoLockMinutes(mins);
                    updateSecuritySettings({ autoLockMinutes: mins });
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-1.5 text-slate-800 cursor-pointer focus:outline-none"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={0}>Never Lock</option>
                </select>
              </div>

              {/* Login Audit Trail */}
              <div className="pt-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>Recent Security Audit Log</span>
                  </span>
                  <span>Active Session: Current Device</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-[11px] space-y-1.5 text-slate-600 font-mono">
                  <div className="flex justify-between">
                    <span>Last Sign-In:</span>
                    <span className="font-semibold text-slate-800">{userAccount.lastLoginAt || 'Today, 07:15 AM'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IP Location:</span>
                    <span className="text-slate-800">Mumbai, Maharashtra (India)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Encryption Level:</span>
                    <span className="text-emerald-700 font-semibold">TLS 1.3 / AES-256</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: Notification Preferences                               */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveNotifications} className="space-y-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span>Automated Alert & Notification Preferences</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure when PaySure alerts you regarding high risk orders, missed commitments, and MSMED limits.
              </p>
            </div>

            <div className="space-y-3.5 divide-y divide-slate-100 text-xs">
              {/* Due Invoice Alerts */}
              <label className="flex items-center justify-between pt-1 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800">Email Due Date & Overdue Invoice Alerts</div>
                  <p className="text-[11px] text-slate-500">
                    Receive daily morning digest of invoices reaching their credit term limit.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={e => setNotifications(prev => ({ ...prev, emailAlerts: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              {/* SMS / WhatsApp Alerts */}
              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800">SMS / WhatsApp Real-Time Settlement Updates</div>
                  <p className="text-[11px] text-slate-500">
                    Instant mobile notification when customer settles an invoice or honours a payment promise.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.smsAlerts}
                  onChange={e => setNotifications(prev => ({ ...prev, smsAlerts: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              {/* Cash Risk Warnings */}
              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800">High-Risk Deal Cash Deficit Warnings</div>
                  <p className="text-[11px] text-slate-500">
                    Alert team immediately if an analyzed deal's fulfillment costs exceed available liquid capital.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.cashRiskAlerts}
                  onChange={e => setNotifications(prev => ({ ...prev, cashRiskAlerts: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              {/* MSMED Statutory Notices */}
              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800">MSMED Section 15/16 Statutory Reminders (45-Day Rule)</div>
                  <p className="text-[11px] text-slate-500">
                    Notify when buyer default crosses 45 days to initiate MSEFC statutory recovery notices.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.msmeStatutoryAlerts}
                  onChange={e => setNotifications(prev => ({ ...prev, msmeStatutoryAlerts: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>

              {/* Weekly Digest */}
              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800">Weekly Working Capital & Cash Health Digest</div>
                  <p className="text-[11px] text-slate-500">
                    Executive summary of collections, customer score changes, and upcoming supplier outflows.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.weeklyDigest}
                  onChange={e => setNotifications(prev => ({ ...prev, weeklyDigest: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Notification Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: Liquidity & Credit Rules                               */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'liquidity' && (
        <form onSubmit={handleSaveLiquidity} className="space-y-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Working Capital Baseline & Credit Policy</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Used across the Deal Safety Engine and What-If Simulator to assess order viability and buffer gaps.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Available Liquid Working Capital (₹)</label>
                <input
                  type="number"
                  value={availableWorkingCapital}
                  onChange={e => setAvailableWorkingCapital(Number(e.target.value))}
                  step="50000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  required
                />
                <span className="text-[11px] text-slate-500 font-mono">
                  Formatted: {formatINR(availableWorkingCapital)}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Target Minimum Advance Desired (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minimumAdvanceDesiredPercent}
                  onChange={e => setMinimumAdvanceDesiredPercent(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Standard Credit Term Period (Days)</label>
                <input
                  type="number"
                  value={defaultCreditPeriodDays}
                  onChange={e => setDefaultCreditPeriodDays(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Safety Reserve Floor Amount (₹)</label>
                <input
                  type="number"
                  value={safetyBufferAmount}
                  onChange={e => setSafetyBufferAmount(Number(e.target.value))}
                  step="50000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  required
                />
                <span className="text-[11px] text-slate-500 font-mono">
                  Formatted: {formatINR(safetyBufferAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Update Liquidity Rules</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
