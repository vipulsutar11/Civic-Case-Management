"use client";

import React from "react";
import { Clock, AlertTriangle, CheckCircle2, Flame, AlertCircle } from "lucide-react";
import { CasePriority, CaseStatus } from "../types";

export function PriorityBadge({ priority }: { priority: CasePriority }) {
  switch (priority) {
    case "Emergency":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
          <span>P0 Critical</span>
        </span>
      );
    case "High":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          <span>High</span>
        </span>
      );
    case "Medium":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
          <span>Medium</span>
        </span>
      );
    case "Low":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          <span>Low</span>
        </span>
      );
  }
}

export function StatusBadge({ status }: { status: CaseStatus }) {
  switch (status) {
    case "Resolved":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          <span>Resolved</span>
        </span>
      );
    case "In Progress":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
          <span>In Progress</span>
        </span>
      );
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          <span>Pending</span>
        </span>
      );
    case "Escalated":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
          <span>Escalated</span>
        </span>
      );
    case "Overdue":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
          <span>Overdue</span>
        </span>
      );
    case "Rejected":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
          <span>Closed</span>
        </span>
      );
  }
}

export default function SLABadge({
  dueDate,
  status,
  priority,
  compact = false,
}: {
  dueDate: string;
  status: CaseStatus;
  priority?: CasePriority;
  compact?: boolean;
}) {
  if (status === "Resolved") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 tabular-nums">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>SLA Met</span>
      </span>
    );
  }

  const now = new Date().getTime();
  const due = new Date(dueDate).getTime();
  const diffMs = due - now;
  const isOverdue = diffMs < 0;
  const hoursLeft = Math.abs(Math.round(diffMs / (1000 * 60 * 60)));
  const daysLeft = Math.floor(hoursLeft / 24);
  const remainingHours = hoursLeft % 24;

  let timeString = "";
  if (isOverdue) {
    timeString = daysLeft > 0 ? `${daysLeft}d ${remainingHours}h overdue` : `${hoursLeft}h overdue`;
  } else {
    timeString = daysLeft > 0 ? `${daysLeft}d ${remainingHours}h left` : `${hoursLeft}h left`;
  }

  if (isOverdue || status === "Overdue") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 tabular-nums">
        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>{timeString}</span>
      </span>
    );
  }

  if (hoursLeft <= 12) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 tabular-nums">
        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>{timeString}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 tabular-nums">
      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span>{timeString}</span>
    </span>
  );
}
