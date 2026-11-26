"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Department } from "../../../types";

const DEPT_SLUGS: Record<Department, string> = {
  Transportation: "transportation",
  Sanitation: "sanitation",
  "Water Supply": "water-supply",
  "Public Works": "public-works",
  "Electrical & Power": "electrical",
  "Public Health": "public-health",
  "Fire Department": "fire",
};

export default function DepartmentLoginPage() {
  const router = useRouter();
  const { login, departments, switchDemoRole } = useApp();

  const [selectedDept, setSelectedDept] = useState<Department>("Transportation");
  const [email, setEmail] = useState("dept.transport@civic.gov");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDeptChange = (dept: Department) => {
    setSelectedDept(dept);
    if (dept === "Transportation") setEmail("dept.transport@civic.gov");
    else if (dept === "Sanitation") setEmail("dept.sanitation@civic.gov");
    else if (dept === "Water Supply") setEmail("dept.water@civic.gov");
    else if (dept === "Public Works") setEmail("dept.pwd@civic.gov");
    else if (dept === "Electrical & Power") setEmail("dept.electrical@civic.gov");
    else if (dept === "Public Health") setEmail("dept.health@civic.gov");
    else if (dept === "Fire Department") setEmail("dept.fire@civic.gov");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const ok = login(email, password, "dept_admin");
    if (ok) {
      setSuccessMsg(`Welcome, ${selectedDept} Admin. Redirecting to department queue...`);
      const slug = DEPT_SLUGS[selectedDept] || "transportation";
      setTimeout(() => router.push(`/department/${slug}`), 800);
    } else {
      // Fallback switch demo role
      switchDemoRole("dept_admin", selectedDept);
      setSuccessMsg(`Authenticated as ${selectedDept} Admin. Redirecting...`);
      const slug = DEPT_SLUGS[selectedDept] || "transportation";
      setTimeout(() => router.push(`/department/${slug}`), 800);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Department Administration</h2>
          <p className="text-xs text-slate-500">
            Authorized municipal officers & dispatch supervisor login portal.
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 border border-rose-200">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Your Department *
            </label>
            <select
              value={selectedDept}
              onChange={(e) => handleDeptChange(e.target.value as Department)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 bg-white font-medium"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Official Municipal Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@civic.gov"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-mono"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Password *</label>
              <Link
                href="/login/forgot-password"
                className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <span>Login to {selectedDept} Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link href="/login" className="hover:text-slate-800">
            ← Role Selector
          </Link>
          <button
            onClick={() => {
              switchDemoRole("dept_admin", selectedDept);
              router.push(`/department/${DEPT_SLUGS[selectedDept] || "transportation"}`);
            }}
            className="text-emerald-600 font-bold hover:underline"
          >
            Direct Demo Jump →
          </button>
        </div>
      </div>
    </div>
  );
}
