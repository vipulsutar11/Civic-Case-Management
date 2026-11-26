"use client";

import React, { useState, useMemo } from "react";
import {
  FolderKanban,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  UserPlus,
  BarChart3,
  TrendingUp,
  ShieldAlert,
  ArrowUpDown,
  Check,
  RefreshCw,
  Users,
  Navigation,
  Layers,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Activity,
  Calendar,
  ChevronRight,
  ScanLine,
  Cctv
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useApp } from "../context/AppContext";
import { CivicCase, Department, User } from "../types";
import CivicGISMap from "./CivicGISMap";
import AdvancedCaseTable from "./AdvancedCaseTable";
import MediaOnlyUpload from "./MediaOnlyUpload";
import VMSIntegrationDashboard from "./VMSIntegrationDashboard";

export default function SuperAdminDashboard() {
  const {
    cases,
    users,
    departments,
    employees,
    setSelectedCase,
    createUser,
    deleteUser,
    activeView,
    setActiveView,
    setIsNewCaseModalOpen,
  } = useApp();

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"dept_admin" | "super_admin">("dept_admin");
  const [newUserDept, setNewUserDept] = useState<Department>("Transportation");
  const [newUserPhone, setNewUserPhone] = useState("");

  const currentTab =
    activeView === "vms"
      ? "vms"
      : activeView === "map"
      ? "map"
      : activeView === "ai-vision"
      ? "ai-vision"
      : activeView === "cases"
      ? "cases"
      : activeView === "departments"
      ? "departments"
      : activeView === "users"
      ? "users"
      : activeView === "reports"
      ? "reports"
      : "overview";

  // Global KPIs
  const totalCases = cases.length;
  const pendingCases = cases.filter((c) => c.status === "Pending").length;
  const inProgressCases = cases.filter((c) => c.status === "In Progress").length;
  const resolvedCases = cases.filter((c) => c.status === "Resolved").length;
  const overdueCases = cases.filter((c) => c.status === "Overdue").length;

  const handleKpiFilter = (status: string) => {
    if (status === "All") {
      setStatusFilter("All");
      setPriorityFilter("All");
    } else if (statusFilter === status) {
      setStatusFilter("All");
    } else {
      setStatusFilter(status);
      setPriorityFilter("All");
    }

    const tableEl = document.getElementById("grievance-directory-table");
    if (tableEl) {
      tableEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Department Workload Table Data
  const deptWorkload = useMemo(() => {
    return departments.map((dept) => {
      const deptCases = cases.filter((c) => c.department === dept);
      const active = deptCases.filter((c) => c.status !== "Resolved").length;
      const resolved = deptCases.filter((c) => c.status === "Resolved").length;
      const critical = deptCases.filter((c) => c.priority === "Emergency").length;
      const staffCount = employees.filter((e) => e.department === dept).length || 4;
      const totalDept = deptCases.length;
      const slaRate = totalDept > 0 ? Math.round((resolved / totalDept) * 100) : 100;

      return {
        name: dept,
        total: totalDept,
        active,
        resolved,
        critical,
        staffCount,
        slaRate,
      };
    });
  }, [departments, cases, employees]);

  // Monthly Trend Data
  const trendData = [
    { month: "Nov", Received: 45, Resolved: 40 },
    { month: "Dec", Received: 52, Resolved: 48 },
    { month: "Jan", Received: 68, Resolved: 58 },
    { month: "Feb", Received: 75, Resolved: 70 },
    { month: "Mar", Received: totalCases || 85, Resolved: resolvedCases || 78 },
  ];

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    createUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      department: newUserRole === "dept_admin" ? newUserDept : undefined,
      phone: newUserPhone || "+91 98765 00000",
    });
    setIsAddUserModalOpen(false);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPhone("");
  };

  const exportCSV = () => {
    const headers = "Case ID,Title,Department,Status,Priority,Citizen,Date\n";
    const rows = cases
      .map(
        (c) =>
          `"${c.id}","${c.title.replace(/"/g, '""')}","${c.department}","${c.status}","${
            c.priority
          }","${c.citizenName}","${c.createdAt.split("T")[0]}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Civic_Cases_Master_Report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5">
      {/* Platform Header & Navigation Sub-tabs */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Municipal Operations</span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live Ingestion Active
            </span>
            <span>&bull;</span>
            <span>Pune Jurisdiction</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
            City Command Operations
          </h1>
        </div>

        {/* Dense View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs font-medium self-start lg:self-auto">
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
            onClick={() => setActiveView("vms")}
            className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
              currentTab === "vms"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Cctv className="w-3.5 h-3.5 text-blue-600" />
            <span>VMS Gateways</span>
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
            <span>GIS Map</span>
          </button>
          <button
            onClick={() => setActiveView("cases")}
            className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
              currentTab === "cases"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>All Cases</span>
            <span className="font-mono text-[11px] text-slate-500">({cases.length})</span>
          </button>
          <button
            onClick={() => setActiveView("departments")}
            className={`px-3 py-1.5 rounded transition ${
              currentTab === "departments"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Departments ({departments.length})
          </button>
          <button
            onClick={() => setActiveView("users")}
            className={`px-3 py-1.5 rounded transition ${
              currentTab === "users"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Staff &amp; Users
          </button>
          <button
            onClick={() => setActiveView("reports")}
            className={`px-3 py-1.5 rounded transition ${
              currentTab === "reports"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            SLA Reports
          </button>
        </div>
      </div>

      {/* ======================= TAB: OVERVIEW ======================= */}
      {currentTab === "overview" && (
        <div className="space-y-5">
          {/* Data-Dense Unified KPI Metric Strip (Linear/Stripe style) */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            {/* Total Cases */}
            <button
              onClick={() => handleKpiFilter("All")}
              className={`p-4 text-left transition hover:bg-slate-50/80 group ${
                statusFilter === "All" && priorityFilter === "All" ? "bg-slate-50/90 ring-1 ring-inset ring-slate-300" : ""
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Total Registered</span>
                <span className="font-mono text-[11px] text-slate-400">All Wards</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1 tabular-nums">
                {totalCases.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Across 10 PMC administrative zones
              </div>
            </button>

            {/* Pending Triage */}
            <button
              onClick={() => handleKpiFilter("Pending")}
              className={`p-4 text-left transition hover:bg-slate-50/80 group ${
                statusFilter === "Pending" ? "bg-amber-50/60 ring-1 ring-inset ring-amber-300" : ""
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Pending Triage
                </span>
                <span className="font-mono text-[11px] text-amber-700 font-semibold">Queue</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1 tabular-nums">
                {pendingCases.toLocaleString()}
              </div>
              <div className="text-[11px] text-amber-800 mt-1 font-medium">
                Awaiting officer review &amp; assignment
              </div>
            </button>

            {/* In Progress */}
            <button
              onClick={() => handleKpiFilter("In Progress")}
              className={`p-4 text-left transition hover:bg-slate-50/80 group ${
                statusFilter === "In Progress" ? "bg-blue-50/60 ring-1 ring-inset ring-blue-300" : ""
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  In Field Progress
                </span>
                <span className="font-mono text-[11px] text-blue-700 font-semibold">Active</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1 tabular-nums">
                {inProgressCases.toLocaleString()}
              </div>
              <div className="text-[11px] text-blue-800 mt-1 font-medium">
                Field dispatch teams deployed
              </div>
            </button>

            {/* Resolved */}
            <button
              onClick={() => handleKpiFilter("Resolved")}
              className={`p-4 text-left transition hover:bg-slate-50/80 group ${
                statusFilter === "Resolved" ? "bg-emerald-50/60 ring-1 ring-inset ring-emerald-300" : ""
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Resolved
                </span>
                <span className="font-mono text-[11px] text-emerald-700 font-semibold">Closed</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1 tabular-nums">
                {resolvedCases.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-800 mt-1 font-medium">
                Verified with citizen sign-off
              </div>
            </button>

            {/* Critical / Overdue */}
            <button
              onClick={() => handleKpiFilter("Overdue")}
              className={`p-4 text-left transition hover:bg-slate-50/80 group ${
                statusFilter === "Overdue" ? "bg-rose-50/60 ring-1 ring-inset ring-rose-300" : ""
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                  SLA Overdue
                </span>
                <span className="font-mono text-[11px] text-rose-700 font-semibold">Breach</span>
              </div>
              <div className="text-2xl font-bold text-rose-700 tracking-tight mt-1 tabular-nums">
                {overdueCases.toLocaleString()}
              </div>
              <div className="text-[11px] text-rose-800 mt-1 font-medium">
                Requires supervisor escalation
              </div>
            </button>
          </div>

          {/* Operational Split: Workload Table (Left) + GIS Map (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Department Operations Workload Matrix */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Department Operations Matrix
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Live dispatch load, field crew availability &amp; SLA compliance
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {departments.length} Municipal Units
                  </span>
                </div>

                <div className="overflow-x-auto mt-2">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                        <th className="py-2.5 px-2">Department</th>
                        <th className="py-2.5 px-2 text-right">Active</th>
                        <th className="py-2.5 px-2 text-right">Resolved</th>
                        <th className="py-2.5 px-2 text-center">SLA Compliance</th>
                        <th className="py-2.5 px-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {deptWorkload.map((d) => (
                        <tr key={d.name} className="hover:bg-slate-50/70 transition">
                          <td className="py-2.5 px-2">
                            <span className="font-medium text-slate-900 block leading-tight">
                              {d.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {d.staffCount} field personnel on duty
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono font-medium text-slate-800">
                            {d.active}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                            {d.resolved}
                          </td>
                          <td className="py-2.5 px-2">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    d.slaRate > 80
                                      ? "bg-emerald-600"
                                      : d.slaRate > 50
                                      ? "bg-amber-500"
                                      : "bg-rose-600"
                                  }`}
                                  style={{ width: `${d.slaRate}%` }}
                                />
                              </div>
                              <span className="font-mono text-[11px] font-medium text-slate-700 w-8 text-right">
                                {d.slaRate}%
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <button
                              onClick={() => {
                                setDeptFilter(d.name);
                                setActiveView("cases");
                              }}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>Queue</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right: GIS Incident Hotspot Map Preview */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Geographic Incident Density
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      PMC ward perimeter &amp; cluster locations
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveView("map")}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Full Map</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="rounded border border-slate-200 overflow-hidden">
                  <CivicGISMap
                    cases={cases}
                    onSelectCase={setSelectedCase}
                    height="280px"
                    showFilters={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Master Case Operations Directory Table */}
          <AdvancedCaseTable
            cases={cases}
            title="Citywide Case Operations Ledger"
            onSelectCase={setSelectedCase}
            controlledStatus={statusFilter}
            onStatusChange={setStatusFilter}
            controlledPriority={priorityFilter}
            onPriorityChange={setPriorityFilter}
          />
        </div>
      )}

      {/* ======================= TAB: GIS MAP ======================= */}
      {currentTab === "map" && (
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Municipal GIS Command Center
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time incident mapping, recurring complaint clusters, and ward boundaries
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
              GPS Feeds Online
            </span>
          </div>

          <CivicGISMap
            cases={cases}
            onSelectCase={setSelectedCase}
            height="650px"
            showFilters={true}
          />
        </div>
      )}

      {/* ======================= TAB: CASES DIRECTORY ======================= */}
      {currentTab === "cases" && (
        <AdvancedCaseTable
          cases={cases}
          title="Master Municipal Grievance Directory"
          onSelectCase={setSelectedCase}
        />
      )}

      {/* ======================= TAB: DEPARTMENTS ======================= */}
      {currentTab === "departments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const deptCases = cases.filter((c) => c.department === dept);
            const resolved = deptCases.filter((c) => c.status === "Resolved").length;
            const overdue = deptCases.filter((c) => c.status === "Overdue").length;
            const active = deptCases.length - resolved;
            const adminUser = users.find(
              (u) => u.role === "dept_admin" && u.department === dept
            );

            return (
              <div
                key={dept}
                className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">{dept}</h3>
                      <span className="text-[11px] text-slate-400">
                        Admin: {adminUser?.name || "Assigned Officer"}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {deptCases.length} Cases
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-3 text-center">
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-medium block">Active</span>
                      <span className="text-sm font-bold text-slate-900 font-mono">{active}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-medium block">Resolved</span>
                      <span className="text-sm font-bold text-emerald-700 font-mono">{resolved}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-medium block">Overdue</span>
                      <span className="text-sm font-bold text-rose-700 font-mono">{overdue}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Ward Dispatch active</span>
                  <button
                    onClick={() => {
                      setDeptFilter(dept);
                      setActiveView("cases");
                    }}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    View Queue &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================= TAB: USERS ======================= */}
      {currentTab === "users" && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                Municipal Personnel &amp; User Directory
              </h3>
              <p className="text-xs text-slate-500">
                Department Administrators, Field Supervisors &amp; Citizens
              </p>
            </div>
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Administrator</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Contact</th>
                  <th className="py-2.5 px-4">Created</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center shrink-0 font-mono">
                        {u.name
                          .split(" ")
                          .map((n) => n[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block leading-tight">
                          {u.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {u.role === "super_admin"
                          ? "Super Admin"
                          : u.role === "dept_admin"
                          ? "Dept Admin"
                          : "Citizen"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {u.department || <span className="text-slate-400 italic">All Wards</span>}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{u.phone || "—"}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{u.createdAt}</td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== "super_admin" && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove user ${u.name}?`)) deleteUser(u.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Deactivate account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= TAB: REPORTS ======================= */}
      {currentTab === "reports" && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Monthly SLA Performance Audit
              </h3>
              <p className="text-xs text-slate-500">
                Statutory resolution rates, ward breach logs &amp; performance metrics
              </p>
            </div>
            <button
              onClick={exportCSV}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Average Resolution Time</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">2.4 Days</p>
              <span className="text-[11px] text-emerald-700">Better than statutory target (3.0d)</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">SLA Compliance Rate</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">91.3%</p>
              <span className="text-[11px] text-slate-500">Within statutory deadline</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Citizen Rating</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">4.7 / 5.0</p>
              <span className="text-[11px] text-slate-500">From verified post-repair feedback</span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <span className="text-xs font-semibold text-slate-600 block mb-2">
              Ingestion vs. Resolution Velocity
            </span>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E2E8F0" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    color: "#fff",
                    borderRadius: "4px",
                    fontSize: "11px",
                    border: "none",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Received"
                  stroke="#2563EB"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorRec)"
                />
                <Area
                  type="monotone"
                  dataKey="Resolved"
                  stroke="#059669"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorRes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ======================= TAB: AI VISION INTAKE ======================= */}
      {currentTab === "ai-vision" && (
        <MediaOnlyUpload />
      )}

      {/* ======================= TAB: VMS INTEGRATIONS ======================= */}
      {currentTab === "vms" && (
        <VMSIntegrationDashboard />
      )}

      {/* Modal: Add Department Admin */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateUserSubmit}
            className="bg-white rounded-lg p-5 w-full max-w-md shadow-xl border border-slate-200 space-y-3 animate-in fade-in duration-100"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                Add Municipal Personnel
              </h3>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Officer Name"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Official Email
              </label>
              <input
                type="email"
                required
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="officer@pmc.gov.in"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Department
              </label>
              <select
                value={newUserDept}
                onChange={(e) => setNewUserDept(e.target.value as Department)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded outline-none bg-white"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={newUserPhone}
                onChange={(e) => setNewUserPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded outline-none focus:border-slate-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded"
              >
                Save Officer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
