"use client";

import React, { useState } from "react";
import { X, Shield, Clock, FileText, CheckCircle2, Flame, AlertTriangle, Search, Filter } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AuditLogModal() {
  const { isAuditModalOpen, setIsAuditModalOpen, auditLogs } = useApp();
  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  if (!isAuditModalOpen) return null;

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = filterAction === "ALL" || log.action === filterAction;
    const matchesQuery =
      !searchTerm ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.caseId && log.caseId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesAction && matchesQuery;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case "EMERGENCY_DISPATCH":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-300 animate-pulse">
            <Flame className="w-3 h-3 text-rose-600" /> EMERGENCY DISPATCH
          </span>
        );
      case "RESOLUTION_VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> RESOLUTION VERIFIED
          </span>
        );
      case "SLA_BREACH_ALERT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> SLA BREACH
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            {action.replace(/_/g, " ")}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">Municipal Audit Trail &amp; Ledger</h3>
              <p className="text-[11px] text-slate-400">Cryptographically verifiable operational state log</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuditModalOpen(false)}
            className="text-slate-400 hover:text-white transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Case ID, actor, or log details..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white outline-none focus:border-blue-600"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 outline-none w-full sm:w-auto"
          >
            <option value="ALL">All Event Types</option>
            <option value="EMERGENCY_DISPATCH">Emergency Dispatches</option>
            <option value="STATUS_UPDATE">Status Shifts</option>
            <option value="RESOLUTION_VERIFIED">Resolution Verifications</option>
            <option value="SLA_BREACH_ALERT">SLA Alerts</option>
            <option value="BULK_STATUS_UPDATE">Bulk Operations</option>
          </select>
        </div>

        {/* Log Entries List */}
        <div className="max-h-[60vh] overflow-y-auto p-6 divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs font-semibold">
              No audit log entries match your filter.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    {log.caseId && (
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {log.caseId}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono" suppressHydrationWarning>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">{log.details}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>
                    Actor: <strong className="text-slate-700">{log.actorName}</strong> ({log.actorRole})
                  </span>
                  {log.ipAddress && <span>Node IP: {log.ipAddress}</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Audit trail is immutable and synchronized across dispatch nodes.</span>
          <button
            onClick={() => setIsAuditModalOpen(false)}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
}
