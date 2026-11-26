"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  User,
  Eye,
  Check,
  X,
  UserPlus,
  RefreshCw,
  FolderKanban,
  BarChart3,
  Calendar,
  ExternalLink,
  Navigation,
  MapPin,
  Layers,
  ChevronRight,
  ShieldCheck,
  Send,
  ScanLine
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useApp } from "../context/AppContext";
import { CivicCase, Department } from "../types";
import CivicGISMap from "./CivicGISMap";
import AdvancedCaseTable from "./AdvancedCaseTable";
import SLABadge, { PriorityBadge, StatusBadge } from "./SLABadge";
import MediaOnlyUpload from "./MediaOnlyUpload";

export default function DeptAdminDashboard() {
  const {
    currentUser,
    cases,
    employees,
    setSelectedCase,
    updateCaseStatus,
    assignCase,
    activeView,
    setActiveView,
  } = useApp();

  const userDept = currentUser?.department || "Transportation";

  // State
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [assigningCaseId, setAssigningCaseId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");

  const currentTab =
    activeView === "map"
      ? "map"
      : activeView === "ai-vision"
      ? "ai-vision"
      : activeView === "cases"
      ? "cases"
      : activeView === "staff"
      ? "staff"
      : activeView === "reports"
      ? "reports"
      : "overview";

  // Department selection
  const [selectedDept, setSelectedDept] = useState<Department>(
    (currentUser?.department as Department) || "Water Supply"
  );
  const activeDept = selectedDept;

  // Filter cases strictly to this department
  const deptCases = useMemo(() => {
    return cases.filter((c) => c.department === activeDept || c.department.includes(activeDept));
  }, [cases, activeDept]);

  // Dept KPIs
  const total = deptCases.length;
  const pending = deptCases.filter((c) => c.status === "Pending").length;
  const inProgress = deptCases.filter((c) => c.status === "In Progress").length;
  const resolved = deptCases.filter((c) => c.status === "Resolved").length;
  const overdue = deptCases.filter((c) => c.status === "Overdue").length;

  const caseTrendData = [
    { day: "Mon", cases: 14 },
    { day: "Tue", cases: 28 },
    { day: "Wed", cases: 22 },
    { day: "Thu", cases: 35 },
    { day: "Fri", cases: 26 },
    { day: "Sat", cases: 32 },
    { day: "Sun", cases: total || 38 },
  ];

  // Department Employees
  const deptEmployees = useMemo(() => {
    return employees.filter((e) => e.department === activeDept);
  }, [employees, activeDept]);

  const handleQuickAssign = (caseId: string) => {
    if (!selectedStaffId) return;
    assignCase(caseId, activeDept, selectedStaffId);
    setAssigningCaseId(null);
    setSelectedStaffId("");
  };

  return (
    <div className="space-y-5">
      {/* Top Header: Department Title & Sub-tabs */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={activeDept}
              onChange={(e) => setSelectedDept(e.target.value as Department)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs px-3 py-1.5 rounded border border-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="Water Supply">Water Supply Department</option>
              <option value="Electrical & Power">Electrical &amp; Power</option>
              <option value="Transportation">Transportation &amp; Roads</option>
              <option value="Sanitation">Sanitation Department</option>
              <option value="Public Works">Public Works</option>
              <option value="Public Health">Public Health</option>
              <option value="Fire Department">Fire Department</option>
            </select>
    </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block leading-tight">
              Operational Desk &bull; Administrator: <strong>{currentUser?.name || "Officer"}</strong>
            </span>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveView("dashboard")}
            className={`px-3 py-1.5 rounded transition ${
              currentTab === "overview"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView("ai-vision")}
            className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
              currentTab === "ai-vision"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ScanLine className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Vision</span>
          </button>
          <button
            onClick={() => setActiveView("map")}
            className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
              currentTab === "map"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-slate-500" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setActiveView("cases")}
            className={`px-3 py-1.5 rounded transition ${
              currentTab === "cases"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Queue ({deptCases.length})
          </button>
          <button
            onClick={() => setActiveView("staff")}
            className={`px-3 py-1.5 rounded transition ${
              currentTab === "staff"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Field Officers ({deptEmployees.length})
          </button>
          <button
            onClick={() => setActiveView("reports")}
            className={`px-3 py-1.5 rounded transition ${
              currentTab === "reports"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            SLA Performance
          </button>
        </div>
      </div>

      {/* ======================= TAB: OVERVIEW ======================= */}
      {currentTab === "overview" && (
        <div className="space-y-5">
          {/* Department KPI Strip */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="p-4">
              <span className="text-xs text-slate-500 font-medium block">Department Total</span>
              <p className="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">{total}</p>
              <span className="text-[11px] text-slate-400">Total assigned complaints</span>
      </div>
            <div className="p-4">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Pending Triage
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">{pending}</p>
              <span className="text-[11px] text-amber-700">Needs field officer assignment</span>
      </div>
            <div className="p-4">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                Active In-Field
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">{inProgress}</p>
              <span className="text-[11px] text-blue-700">Under field inspection / repair</span>
      </div>
            <div className="p-4">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Resolved
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-0.5 tabular-nums">{resolved}</p>
              <span className="text-[11px] text-emerald-700">92% on-time turnaround</span>
      </div>
    </div>

          {/* Operational Grid: Dispatch Queue & Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Quick Dispatch / Assignment Console */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Unassigned Triage Queue
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Complaints requiring inspection assignment to on-duty staff
                    </p>
            </div>
                  <span className="text-xs font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    {deptCases.filter((c) => !c.assignedEmployee).length} Unassigned
                  </span>
          </div>

                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                        <th className="py-2.5 px-2">Case ID &amp; Incident</th>
                        <th className="py-2.5 px-2">Ward</th>
                        <th className="py-2.5 px-2">Priority</th>
                        <th className="py-2.5 px-2">SLA</th>
                        <th className="py-2.5 px-2 text-right">Dispatch Officer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {deptCases
                        .filter((c) => c.status !== "Resolved")
                        .slice(0, 5)
                        .map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-2.5 px-2 max-w-xs">
                              <span className="font-mono text-[11px] text-slate-500 block leading-tight">
                                {c.id}
                              </span>
                              <span className="font-medium text-slate-900 truncate block">
                                {c.title}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-slate-600 whitespace-nowrap">
                              {c.location.ward}
                            </td>
                            <td className="py-2.5 px-2 whitespace-nowrap">
                              <PriorityBadge priority={c.priority} />
                            </td>
                            <td className="py-2.5 px-2 whitespace-nowrap">
                              <SLABadge dueDate={c.dueDate} status={c.status} priority={c.priority} />
                            </td>
                            <td className="py-2.5 px-2 text-right whitespace-nowrap">
                              {assigningCaseId === c.id ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <select
                                    value={selectedStaffId}
                                    onChange={(e) => setSelectedStaffId(e.target.value)}
                                    className="text-xs px-2 py-1 border border-slate-300 rounded bg-white"
                                  >
                                    <option value="">Select staff</option>
                                    {deptEmployees.map((e) => (
                                      <option key={e.id} value={e.id}>
                                        {e.name}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleQuickAssign(c.id)}
                                    className="px-2 py-1 bg-slate-900 text-white rounded text-xs font-medium"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setAssigningCaseId(null)}
                                    className="p-1 text-slate-400 hover:text-slate-600"
                                  >
                                    ✕
                                  </button>
                          </div>
                              ) : (
                                <button
                                  onClick={() => setAssigningCaseId(c.id)}
                                  className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {c.assignedEmployee ? "Reassign" : "Assign Staff &rarr;"}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
          </div>
        </div>
      </div>

            {/* Right: 7-Day Ingestion Volume Line Chart */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Weekly Complaint Volume
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ingested {activeDept} reports
                    </p>
            </div>
                  <span className="font-mono text-xs text-slate-500">7-Day</span>
          </div>

                <div className="h-48 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={caseTrendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderRadius: "4px",
                          color: "#fff",
                          border: "none",
                          fontSize: "11px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cases"
                        stroke="#2563EB"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#2563EB" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
          </div>
        </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Peak load: Thursday (35 cases)</span>
                <span className="font-medium text-emerald-700">Normal capacity</span>
        </div>
      </div>
    </div>

          {/* Department Advanced Case Table */}
          <AdvancedCaseTable
            cases={deptCases}
            title={`${activeDept} Grievance Directory`}
            onSelectCase={setSelectedCase}
          />
        </div>
      )}

      {/* ======================= TAB: MAP ======================= */}
      {currentTab === "map" && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {activeDept} GIS Hotspot Locator
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active incident beacons and ward concentration
              </p>
      </div>
    </div>

          <CivicGISMap
            cases={deptCases}
            onSelectCase={setSelectedCase}
            height="650px"
            showFilters={false}
          />
        </div>
      )}

      {/* ======================= TAB: CASES ======================= */}
      {currentTab === "cases" && (
        <AdvancedCaseTable
          cases={deptCases}
          title={`${activeDept} Queue Directory`}
          onSelectCase={setSelectedCase}
        />
      )}

      {/* ======================= TAB: STAFF ======================= */}
      {currentTab === "staff" && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {activeDept} Field Officer Roster
              </h3>
              <p className="text-xs text-slate-500">
                Staff assignment logs, active workloads &amp; contact information
              </p>
      </div>
            <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {deptEmployees.length} Officers on Duty
            </span>
    </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Officer Name</th>
                  <th className="py-2.5 px-4">Designation</th>
                  <th className="py-2.5 px-4">Active Assigned Cases</th>
                  <th className="py-2.5 px-4">Phone Contact</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deptEmployees.map((e) => {
                  const assignedCount = deptCases.filter((c) => c.assignedEmployee === e.id).length;
                  return (
                    <tr key={e.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {e.name.charAt(0)}
                  </div>
                        <div>
                          <span className="font-semibold text-slate-900 block leading-tight">
                            {e.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{e.email}</span>
                  </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{e.designation}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {assignedCount} cases
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{e.phone}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>On Duty</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= TAB: REPORTS ======================= */}
      {currentTab === "reports" && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              {activeDept} Performance &amp; SLA Breakdown
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Turnaround duration, breach prevention, and resolution rates
            </p>
    </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Average Resolution Speed</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">1.8 Days</p>
              <span className="text-[11px] text-emerald-700">Faster than city benchmark (2.4d)</span>
      </div>
            <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Resolution Compliance</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">
                {total > 0 ? Math.round((resolved / total) * 100) : 100}%
              </p>
              <span className="text-[11px] text-slate-500">Within statutory SLA window</span>
      </div>
            <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Total Cases Processed</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">{total}</p>
              <span className="text-[11px] text-slate-500">Across current calendar quarter</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB: AI VISION INTAKE ======================= */}
      {currentTab === "ai-vision" && (
        <MediaOnlyUpload />
      )}
    </div>
  );
}
