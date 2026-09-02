import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Briefcase,
  IndianRupee,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
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

export const SignUpPage: React.FC = () => {
  const { signup, setAuthView } = useApp();

  // Multi-step registration state: step 1 (Owner credentials) -> step 2 (Business & Capital)
  const [step, setStep] = useState<1 | 2>(1);

  // Form fields
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [businessType, setBusinessType] = useState(BUSINESS_TYPE_OPTIONS[0]);
  const [availableWorkingCapital, setAvailableWorkingCapital] = useState<number>(1000000);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!ownerName.trim()) {
      setErrorMessage('Please enter the business owner / director full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid work email address.');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setErrorMessage('Please provide a valid mobile number.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!businessName.trim()) {
      setErrorMessage('Please enter your registered enterprise legal name.');
      return;
    }
    if (!availableWorkingCapital || availableWorkingCapital < 50000) {
      setErrorMessage('Please specify available working capital buffer (minimum ₹50,000).');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      signup({
        ownerName,
        email,
        phone,
        password,
        businessName,
        industry,
        businessType,
        availableWorkingCapital,
      });
      setIsLoading(false);
    }, 450);
  };

  return (
    <div>
      {/* Progress Indicators */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 1
                ? 'bg-blue-600 text-white ring-2 ring-blue-400/30'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {step === 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : '1'}
          </div>
          <span className={`text-xs font-medium ${step === 1 ? 'text-white' : 'text-slate-400'}`}>
            Account Credentials
          </span>
        </div>

        <div className="h-0.5 w-12 bg-slate-800" />

        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 2
                ? 'bg-blue-600 text-white ring-2 ring-blue-400/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            2
          </div>
          <span className={`text-xs font-medium ${step === 2 ? 'text-white' : 'text-slate-400'}`}>
            Business & Capital
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Owner & Account Credentials */}
      {step === 1 && (
        <form onSubmit={handleStep1Next} className="space-y-3.5">
          {/* Owner Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Owner / Managing Director Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="signup-owner-name"
                type="text"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                placeholder="e.g. Ravi Sharma"
                required
                className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Official Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ravi@sharmapack.in"
                  required
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98200 12345"
                  required
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Next Button */}
          <button
            type="submit"
            className="w-full mt-3 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Proceed to Business Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Step 2: Business & Capital Registration */}
      {step === 2 && (
        <form onSubmit={handleFinalSubmit} className="space-y-3.5">
          {/* Business Name */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Registered Business / Enterprise Legal Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                id="signup-business-name"
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Industrial Solutions Pvt. Ltd."
                required
                className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Industry & Business Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Industry Sector
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <select
                  id="signup-industry"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  {INDUSTRY_OPTIONS.map(ind => (
                    <option key={ind} value={ind} className="bg-slate-900 text-white">
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">
                Business Legal Entity Type
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Layers className="w-4 h-4" />
                </div>
                <select
                  id="signup-businesstype"
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  {BUSINESS_TYPE_OPTIONS.map(bt => (
                    <option key={bt} value={bt} className="bg-slate-900 text-white">
                      {bt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Available Working Capital */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-300">
                Available Liquid Working Capital (₹)
              </label>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                {formatINR(availableWorkingCapital)}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                ₹
              </div>
              <input
                id="signup-working-capital"
                type="number"
                value={availableWorkingCapital}
                onChange={e => setAvailableWorkingCapital(Number(e.target.value))}
                min="50000"
                step="50000"
                required
                className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Used by PaySure's Deal Safety Engine to simulate cash gaps and calculate advance requirements.
            </p>

            {/* Quick Chips */}
            <div className="flex items-center gap-1.5 pt-1">
              {[500000, 1000000, 2500000, 5000000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAvailableWorkingCapital(val)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer border transition-colors ${
                    availableWorkingCapital === val
                      ? 'bg-blue-600 text-white border-blue-500 font-bold'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {val >= 10000000 ? `₹${val / 10000000} Cr` : `₹${val / 100000} L`}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              id="btn-signup-submit"
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Registration & Open Dashboard</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Switch to Login */}
      <div className="pt-4 mt-4 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-400">
          Already have a registered account?{' '}
          <button
            type="button"
            onClick={() => setAuthView('login')}
            className="font-semibold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};
