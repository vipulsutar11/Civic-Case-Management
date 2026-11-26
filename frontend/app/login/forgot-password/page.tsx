"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Send
} from "lucide-react";
import { useApp } from "../../../context/AppContext";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, resetPassword } = useApp();

  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setErrorMsg(null);
    forgotPassword(email.trim());
    setIsSent(true);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10 text-center space-y-6">
        {/* Brand header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#0B1E36] text-white flex items-center justify-center shadow-md">
            <Building2 className="w-5 h-5 text-blue-300" />
          </div>
          <span className="font-black text-slate-900 text-lg">CivicCare</span>
        </div>

        {/* Security Padlock Illustration */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
          <Lock className="w-9 h-9" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900">Forgot Password?</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your email to reset password
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 border border-rose-200 text-left">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs space-y-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="font-bold">Password Reset Link Dispatched!</p>
            <p className="text-[11px] text-emerald-700">
              We have sent an authentication recovery link to <strong>{email}</strong>.
            </p>
            <Link
              href="/login"
              className="inline-block mt-3 px-4 py-2 bg-[#0B1E36] text-white rounded-xl text-xs font-bold hover:bg-[#132C4C] transition"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative text-left">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-2.5 text-xs font-medium rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0B1E36] hover:bg-[#132C4C] text-white rounded-xl text-xs font-bold transition shadow-md shadow-slate-900/20 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Reset Link</span>
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
