import React from 'react';
import { ShieldCheck, Lock, TrendingUp, Sparkles, Building2, CheckCircle2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#090f1d] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute top-[40%] -right-[15%] w-[550px] h-[550px] rounded-full bg-indigo-600/10 blur-[140px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-600/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">PaySure</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  MSME Capital Guard
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Order Risk Intelligence & MSMED Legal Protection</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit Bank Grade Encryption</span>
            </div>
            <span className="text-slate-700">•</span>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>MSMED Act 2006 Compliant</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Value Prop (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium w-fit">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Intelligent Working Capital Shield</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug">
                Never accept an order that chokes your working capital.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                PaySure evaluates wholesale and corporate purchase orders in real-time, guarantees safe advance structures, and enforces statutory MSMED penal interest protections.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 bg-slate-800/40 border border-slate-800 p-3 rounded-xl backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Deal Safety Engine</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Instant safety check on deal margins, cash gaps, and client payment history.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/40 border border-slate-800 p-3 rounded-xl backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">What-If Restructuring</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Auto-negotiate terms from High Risk to Safe before commitment.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/40 border border-slate-800 p-3 rounded-xl backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Statutory MSMED Notices</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Section 15/16 automated demand notices with 3x RBI Repo compound interest.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-blue-600 text-[10px] font-bold flex items-center justify-center text-white">RS</div>
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-emerald-600 text-[10px] font-bold flex items-center justify-center text-white">SM</div>
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-amber-600 text-[10px] font-bold flex items-center justify-center text-white">PK</div>
              </div>
              <span>Trusted by 2,400+ Indian MSME manufacturers & distributors</span>
            </div>
          </div>

          {/* Right Column: Auth Card */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">{subtitle}</p>
              </div>

              {children}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-6 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} PaySure Technologies Pvt. Ltd. All rights reserved.</span>
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span className="hover:text-slate-200 cursor-pointer">Security Protocol</span>
            <span>•</span>
            <span className="hover:text-slate-200 cursor-pointer">MSME Samadhaan Integration</span>
            <span>•</span>
            <span className="hover:text-slate-200 cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
