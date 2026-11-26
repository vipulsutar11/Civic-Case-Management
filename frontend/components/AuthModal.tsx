"use client";

import React, { useState } from "react";
import {
  X,
  Eye,
  EyeOff,
  ShieldAlert,
  Building2,
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  KeyRound
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { UserRole, Department } from "../types";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    registerCitizen,
    forgotPassword,
    resetPassword,
    departments,
    switchDemoRole,
  } = useApp();

  // Role tab for login
  const [selectedRole, setSelectedRole] = useState<UserRole>("citizen");
  const [selectedDept, setSelectedDept] = useState<Department>("Transportation");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    setSuccessMsg(null);
    if (role === "super_admin") {
      setEmail("superadmin@civic.gov");
      setPassword("admin123");
    } else if (role === "dept_admin") {
      setEmail("transport.admin@civic.gov");
      setPassword("password123");
    } else {
      setEmail("priya.sharma@example.com");
      setPassword("password123");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      const ok = login(email, password, selectedRole);
      setLoading(false);
      if (!ok) {
        setErrorMsg("Invalid credentials. Please verify your email and password.");
      }
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!name || !email || !password) {
      setErrorMsg("Please fill in all mandatory fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = registerCitizen(name, email, password, phone);
      setLoading(false);
      if (!ok) {
        setErrorMsg("An account with this email already exists.");
      } else {
        setSuccessMsg("Account registered successfully! Welcome to CivicPulse.");
      }
    }, 400);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = forgotPassword(email);
      setLoading(false);
      if (ok) {
        setSuccessMsg("Verification code dispatched to your email! (Demo OTP: 123456)");
        setAuthModalMode("reset");
      } else {
        setErrorMsg("Email not recognized in the citizen directory.");
      }
    }, 400);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (otp !== "123456" && otp.length !== 6) {
      setErrorMsg("Invalid 6-digit OTP code. (Use demo code 123456)");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const ok = resetPassword(email, otp, password);
      setLoading(false);
      if (ok) {
        setSuccessMsg("Password reset successfully! You can now log in.");
        setTimeout(() => setAuthModalMode("login"), 1000);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-blue-900 text-white p-6 relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">CivicPulse Access</h3>
              <p className="text-xs text-blue-200">Municipal Grievance & Case Management</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ======================= LOGIN MODE ======================= */}
          {authModalMode === "login" && (
            <div>
              {/* Role Select Tabs */}
              <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleRoleTabChange("citizen")}
                  className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                    selectedRole === "citizen" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" /> Citizen
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleTabChange("dept_admin")}
                  className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                    selectedRole === "dept_admin" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Dept Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleTabChange("super_admin")}
                  className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                    selectedRole === "super_admin" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Super Admin
                </button>
              </div>

              {/* Department Selector if Dept Admin */}
              {selectedRole === "dept_admin" && (
                <div className="mb-4">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Select Department
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => {
                      const d = e.target.value as Department;
                      setSelectedDept(d);
                      if (d === "Transportation") setEmail("transport.admin@civic.gov");
                      else if (d === "Sanitation") setEmail("sanitation.admin@civic.gov");
                      else if (d === "Water Supply") setEmail("water.admin@civic.gov");
                      else if (d === "Electrical & Power") setEmail("electrical.admin@civic.gov");
                      else if (d === "Fire Department") setEmail("fire.admin@civic.gov");
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-blue-500"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg(null);
                        setSuccessMsg(null);
                        setAuthModalMode("forgot");
                      }}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Sign In as {selectedRole === "super_admin" ? "Super Admin" : selectedRole === "dept_admin" ? "Dept Admin" : "Citizen"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo 1-Click Credentials Box */}
              <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  1-Click Demo Evaluation Sign-Ins:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      switchDemoRole("super_admin");
                      setIsAuthModalOpen(false);
                    }}
                    className="p-1.5 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-slate-700 font-medium text-center"
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchDemoRole("dept_admin", "Transportation");
                      setIsAuthModalOpen(false);
                    }}
                    className="p-1.5 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-slate-700 font-medium text-center truncate"
                  >
                    Dept Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchDemoRole("citizen");
                      setIsAuthModalOpen(false);
                    }}
                    className="p-1.5 bg-white border border-slate-200 hover:border-blue-500 rounded-lg text-slate-700 font-medium text-center"
                  >
                    Citizen
                  </button>
                </div>
              </div>

              {/* Toggle to Register */}
              <div className="text-center mt-5 text-xs text-slate-500">
                New citizen?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setAuthModalMode("register");
                  }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Create an account
                </button>
              </div>
            </div>
          )}

          {/* ======================= REGISTER MODE (CITIZEN) ======================= */}
          {authModalMode === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="text-center mb-3">
                <h4 className="font-bold text-slate-900 text-sm">Citizen Registration</h4>
                <p className="text-xs text-slate-500">Register to submit grievances and track live resolutions</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full pl-10 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPass"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="showPass" className="text-xs text-slate-600 cursor-pointer">
                  Show passwords
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "Complete Registration"}
              </button>

              <div className="text-center text-xs text-slate-500 pt-1">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setAuthModalMode("login");
                  }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* ======================= FORGOT PASSWORD MODE ======================= */}
          {authModalMode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="text-center mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-2">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Forgot Password</h4>
                <p className="text-xs text-slate-500">
                  Enter your registered email and we'll dispatch an authorization OTP code.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya.sharma@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "Send Verification OTP"}
              </button>

              <div className="text-center text-xs text-slate-500">
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => setAuthModalMode("login")}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* ======================= RESET PASSWORD MODE ======================= */}
          {authModalMode === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="text-center mb-2">
                <h4 className="font-bold text-slate-900 text-sm">Reset Password</h4>
                <p className="text-xs text-slate-500">
                  Enter the 6-digit OTP code sent to <span className="font-bold text-slate-700">{email}</span>
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full px-3.5 py-2.5 text-center text-base tracking-widest font-mono border border-slate-300 rounded-xl focus:border-blue-500 outline-none"
                />
                <span className="text-[10px] text-slate-400 block text-center mt-1">Hint: Test with code 123456</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:border-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : "Update Password & Log In"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
