"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Sparkles,
  HeartHandshake
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { UserRole, Department } from "../../types";

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoRole } = useApp();

  const [userType, setUserType] = useState<"Citizen" | "Department Admin" | "Super Admin">("Citizen");
  const [selectedDept, setSelectedDept] = useState<Department>("Transportation");
  const [email, setEmail] = useState("priya.sharma@civic.in");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-fill sample credentials based on userType dropdown
  const handleUserTypeChange = (type: "Citizen" | "Department Admin" | "Super Admin") => {
    setUserType(type);
    setErrorMsg(null);
    if (type === "Super Admin") {
      setEmail("admin@city.gov");
    } else if (type === "Department Admin") {
      setEmail("transport@city.gov");
    } else {
      setEmail("priya.sharma@civic.in");
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let role: UserRole = "citizen";
    if (userType === "Super Admin") role = "super_admin";
    if (userType === "Department Admin") role = "dept_admin";

    const ok = login(email, password, role);
    if (ok) {
      if (role === "super_admin") {
        router.push("/superadmin");
      } else if (role === "dept_admin") {
        const slugMap: Record<string, string> = {
          Transportation: "transportation",
          Sanitation: "sanitation",
          "Water Supply": "water-supply",
          "Public Works": "public-works",
          "Electrical & Power": "electrical",
          "Public Health": "public-health",
        };
        router.push(`/department/${slugMap[selectedDept] || "transportation"}`);
      } else {
        router.push("/citizen");
      }
    } else {
      setErrorMsg("Invalid credentials. Please verify your email and password.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* ================= LEFT HALF: CIVICCARE HERO ================= */}
        <div className="lg:col-span-5 bg-[#0B1E36] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Glows */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  CivicCare
                </h1>
                <p className="text-xs text-blue-200 font-medium">Smarter City, Happier Citizens.</p>
              </div>
            </div>
          </div>

          {/* Middle: City Skyline SVG Graphic */}
          <div className="my-8 relative z-10 flex flex-col items-center justify-center text-center">
            <div className="w-full max-w-[280px] h-40 opacity-90 relative flex items-end justify-center">
              <svg viewBox="0 0 400 200" className="w-full h-full text-blue-400" fill="currentColor">
                {/* Moon */}
                <circle cx="340" cy="40" r="14" fill="#93C5FD" opacity="0.6" />
                {/* Back Silhouettes */}
                <rect x="20" y="70" width="35" height="130" fill="#1E3A5F" rx="3" />
                <rect x="65" y="40" width="45" height="160" fill="#1E3A5F" rx="3" />
                <polygon points="87,15 65,40 110,40" fill="#1E3A5F" />
                <rect x="120" y="80" width="40" height="120" fill="#1E3A5F" rx="3" />
                <rect x="170" y="30" width="55" height="170" fill="#1E3A5F" rx="3" />
                <rect x="235" y="60" width="45" height="140" fill="#1E3A5F" rx="3" />
                <polygon points="257,35 235,60 280,60" fill="#1E3A5F" />
                <rect x="290" y="90" width="40" height="110" fill="#1E3A5F" rx="3" />
                <rect x="340" y="75" width="45" height="125" fill="#1E3A5F" rx="3" />

                {/* Foreground Buildings */}
                <rect x="35" y="100" width="40" height="100" fill="#2563EB" rx="4" />
                <rect x="90" y="60" width="50" height="140" fill="#3B82F6" rx="4" />
                <rect x="150" y="110" width="45" height="90" fill="#2563EB" rx="4" />
                <rect x="205" y="50" width="60" height="150" fill="#3B82F6" rx="4" />
                <polygon points="235,20 205,50 265,50" fill="#3B82F6" />
                <rect x="275" y="95" width="50" height="105" fill="#2563EB" rx="4" />
                <rect x="335" y="115" width="40" height="85" fill="#3B82F6" rx="4" />

                {/* Windows dots */}
                <circle cx="115" cy="80" r="3" fill="#BFDBFE" />
                <circle cx="115" cy="100" r="3" fill="#BFDBFE" />
                <circle cx="115" cy="120" r="3" fill="#BFDBFE" />
                <circle cx="235" cy="70" r="3" fill="#BFDBFE" />
                <circle cx="235" cy="90" r="3" fill="#BFDBFE" />
                <circle cx="235" cy="110" r="3" fill="#BFDBFE" />
                <circle cx="235" cy="130" r="3" fill="#BFDBFE" />
                <circle cx="55" cy="120" r="2.5" fill="#BFDBFE" />
                <circle cx="55" cy="140" r="2.5" fill="#BFDBFE" />
                <circle cx="300" cy="120" r="2.5" fill="#BFDBFE" />
                <circle cx="300" cy="140" r="2.5" fill="#BFDBFE" />
              </svg>
            </div>
            <p className="text-xs text-blue-200 mt-2 font-medium">
              Empowering 2.4M citizens with automated AI municipal governance.
            </p>
          </div>

          {/* Bottom 3 Feature Pills */}
          <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-blue-900/60 relative z-10 text-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-blue-900/60 text-blue-300 flex items-center justify-center mb-1">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-white">Report Issues</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-blue-900/60 text-blue-300 flex items-center justify-center mb-1">
                <Search className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-white">Track Progress</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-blue-900/60 text-blue-300 flex items-center justify-center mb-1">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-white">Better City</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT HALF: CLEAN AUTH FORM ================= */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 mt-1">Login to your account to continue</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Select User Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select User Type</label>
                <select
                  value={userType}
                  onChange={(e) => handleUserTypeChange(e.target.value as any)}
                  className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 bg-white text-slate-800 outline-none transition"
                >
                  <option value="Citizen">Citizen</option>
                  <option value="Department Admin">Department Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              {/* Department Selector if Department Admin */}
              {userType === "Department Admin" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value as Department)}
                    className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 bg-white text-slate-800 outline-none transition"
                  >
                    <option value="Transportation">Transportation</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Public Works">Public Works</option>
                    <option value="Electrical & Power">Electrical & Power</option>
                    <option value="Public Health">Public Health</option>
                  </select>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Remember Me</span>
                </label>
                <Link
                  href="/login/forgot-password"
                  className="font-bold text-blue-600 hover:text-blue-800 transition"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#0B1E36] hover:bg-[#132C4C] text-white rounded-xl text-xs font-bold transition shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 mt-2"
              >
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Don't have an account?{" "}
                <Link href="/citizen" className="font-bold text-blue-600 hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
