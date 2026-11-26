"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  KeyRound
} from "lucide-react";
import { useApp } from "../../../context/AppContext";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { login, switchDemoRole } = useApp();

  const [email, setEmail] = useState("superadmin@civic.gov");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const ok = login(email, password, "super_admin");
    if (ok) {
      setSuccessMsg("Super Admin authorization verified. Redirecting to Command Center...");
      setTimeout(() => router.push("/superadmin"), 800);
    } else {
      switchDemoRole("super_admin");
      setSuccessMsg("Demo Authorization Granted. Redirecting...");
      setTimeout(() => router.push("/superadmin"), 800);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-700 shadow-2xl space-y-6 z-10 text-white">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 block">
            Executive Level Clearance
          </span>
          <h2 className="text-2xl font-black text-white">Super Admin Command</h2>
          <p className="text-xs text-slate-400">
            Citywide Grievance Master Registry & Administrative Oversight
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2 border border-rose-500/30">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Administrative Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@civic.gov"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none font-mono text-white"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-300">Security Key / Password *</label>
              <Link
                href="/login/forgot-password"
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Reset Key?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 outline-none text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <KeyRound className="w-4 h-4" />
            <span>Authorize & Open Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <Link href="/login" className="hover:text-white">
            ← Other Portals
          </Link>
          <Link href="/superadmin" className="text-indigo-400 font-bold hover:underline">
            Open Directly →
          </Link>
        </div>
      </div>
    </div>
  );
}
