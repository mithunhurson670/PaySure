import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LoginPage: React.FC = () => {
  const { login, setAuthView } = useApp();

  const [email, setEmail] = useState('ravi.sharma@sharmapack.in');
  const [password, setPassword] = useState('PaySure@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your registered business email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(email, password, rememberMe);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid credentials. Please try again.');
      }
    }, 400);
  };

  const handleDemoFill = () => {
    setEmail('ravi.sharma@sharmapack.in');
    setPassword('PaySure@2026');
    setErrorMessage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Demo Credentials Quick Pill */}
      <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs text-blue-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-[11px]">Testing demo account credentials</span>
        </div>
        <button
          type="button"
          onClick={handleDemoFill}
          className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 underline cursor-pointer"
        >
          Auto-Fill
        </button>
      </div>

      {/* Email Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-300">
          Business Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="login-email-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
          />
        </div>
      </div>

      {/* Password Input with Show/Hide */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-300">
            Password
          </label>
          <button
            type="button"
            onClick={() => setAuthView('forgot-password')}
            className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="login-password-input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            className="w-full pl-9 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
          />
          <span className="text-xs text-slate-400">Keep me logged in for 30 days</span>
        </label>
      </div>

      {/* Login Button */}
      <button
        id="btn-login-submit"
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <ShieldCheck className="w-4 h-4" />
            <span>Login to PaySure</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>

      {/* Switch to Sign Up */}
      <div className="pt-4 mt-4 border-t border-slate-800/80 text-center">
        <p className="text-xs text-slate-400">
          Don't have a business account?{' '}
          <button
            type="button"
            onClick={() => setAuthView('signup')}
            className="font-semibold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
          >
            Register your Business
          </button>
        </p>
      </div>
    </form>
  );
};
