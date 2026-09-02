import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword, setAuthView } = useApp();

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid registered work email address.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      resetPassword(email);
      setIsLoading(false);
      setIsSubmitted(true);
    }, 400);
  };

  return (
    <div>
      {isSubmitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">Check Your Inbox</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              We have dispatched a secure password reset link and temporary authentication token to{' '}
              <span className="font-mono text-blue-400 font-semibold">{email}</span>.
            </p>
          </div>

          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl text-left text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-slate-200">Next Steps:</div>
            <p className="text-[11px] text-slate-400">
              1. Open the reset email from <span className="font-mono text-slate-300">auth@paysure.in</span>.
            </p>
            <p className="text-[11px] text-slate-400">
              2. Click the authenticated link to set a new password.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Registered Business Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="forgot-password-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              We'll send a one-time reset code to your authenticated corporate email.
            </p>
          </div>

          <button
            id="btn-forgot-password-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Password Reset Link</span>
              </>
            )}
          </button>

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
