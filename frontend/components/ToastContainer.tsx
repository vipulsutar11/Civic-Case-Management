"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X, Flame } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = "bg-slate-900 text-white border-slate-700";
        let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

        if (toast.type === "success") {
          bg = "bg-emerald-950 text-white border-emerald-700";
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === "error" || toast.type === "emergency") {
          bg = "bg-rose-950 text-white border-rose-700 animate-pulse";
          icon = <Flame className="w-5 h-5 text-rose-400 shrink-0" />;
        } else if (toast.type === "warning") {
          bg = "bg-amber-950 text-white border-amber-700";
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all transform animate-fadeIn ${bg}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
              <p className="text-[11px] opacity-80 mt-0.5 leading-snug break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
