import { Outlet } from 'react-router-dom';
import { Building2, ShieldCheck, MapPin, Activity, CheckCircle2 } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

const CURRENT_YEAR = new Date().getFullYear();

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 text-slate-100 relative">
      {/* Floating Theme Switcher */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle showLabel={true} />
      </div>

      {/* Left/Hero Panel (Desktop) */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-12 flex-col justify-between overflow-hidden border-r border-slate-800 auth-hero">
        {/* Subtle background glowing ambient orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Building2 className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white m-0">CIVICASSET</h1>
            <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold m-0">
              Municipal Asset & Infrastructure Management
            </p>
          </div>
        </div>

        {/* Central Feature Showcase */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Role-Based Smart Governance Platform</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
            Streamlining Public Infrastructure, GIS Mapping & Maintenance Lifecycle.
          </h2>

          <p className="text-sm text-slate-400 leading-relaxed">
            CivicAsset empowers city administrators, field engineers, inspectors, and citizens
            with real-time GIS asset intelligence, work order dispatch, and verified civic resolution.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">GIS Asset Mapping</h3>
                <p className="text-xs text-slate-400">Poles, pipelines, roads & sensors</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-teal-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">SLA Enforcement</h3>
                <p className="text-xs text-slate-400">Automated dispatch & verification</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-800/60">
          <span>&copy; {CURRENT_YEAR} CivicAsset Municipal Systems</span>
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure 256-bit Encrypted Session</span>
          </div>
        </div>
      </div>

      {/* Right/Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:px-8 lg:px-12 relative overflow-y-auto">
        {/* Mobile Brand Header */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Building2 className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block">CIVICASSET</span>
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold block">
              Municipal Systems
            </span>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
