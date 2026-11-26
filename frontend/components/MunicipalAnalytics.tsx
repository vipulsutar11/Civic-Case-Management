"use client";

import React from "react";
import { CivicCase, Employee, Department } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Award,
  Users,
  Building2,
  Flame,
  CheckCircle2,
} from "lucide-react";

interface MunicipalAnalyticsProps {
  cases: CivicCase[];
  employees: Employee[];
  selectedDepartment?: Department;
}

const COLORS = ["#2563EB", "#0284C7", "#16A34A", "#EA580C", "#9333EA", "#4F46E5"];
const PRIORITY_COLORS: Record<string, string> = {
  Emergency: "#DC2626",
  High: "#EA580C",
  Medium: "#0284C7",
  Low: "#64748B",
};

export default function MunicipalAnalytics({
  cases,
  employees,
  selectedDepartment,
}: MunicipalAnalyticsProps) {
  // 1. Department Workload Data
  const deptData = React.useMemo(() => {
    const counts: Record<string, { total: number; resolved: number; overdue: number }> = {};
    const depts = selectedDepartment
      ? [selectedDepartment]
      : ["Transportation", "Sanitation", "Water Supply", "Electrical & Power", "Public Works", "Public Health"];

    depts.forEach((d) => {
      counts[d] = { total: 0, resolved: 0, overdue: 0 };
    });

    cases.forEach((c) => {
      if (!counts[c.department]) counts[c.department] = { total: 0, resolved: 0, overdue: 0 };
      counts[c.department].total += 1;
      if (c.status === "Resolved") counts[c.department].resolved += 1;
      if (c.status === "Overdue") counts[c.department].overdue += 1;
    });

    return Object.entries(counts).map(([name, data]) => ({
      name: name.replace("Electrical & Power", "Power").replace("Public Works", "P.Works"),
      fullName: name,
      Total: data.total,
      Resolved: data.resolved,
      Overdue: data.overdue,
      Compliance: data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 100,
    }));
  }, [cases, selectedDepartment]);

  // 2. SLA Trend Data (Simulated 7-Day Municipal Timeline)
  const slaTrendData = [
    { day: "Mon", OnTime: 42, Breached: 3, Escalations: 1 },
    { day: "Tue", OnTime: 58, Breached: 4, Escalations: 2 },
    { day: "Wed", OnTime: 65, Breached: 2, Escalations: 1 },
    { day: "Thu", OnTime: 71, Breached: 5, Escalations: 3 },
    { day: "Fri", OnTime: 84, Breached: 3, Escalations: 1 },
    { day: "Sat", OnTime: 52, Breached: 2, Escalations: 0 },
    { day: "Sun", OnTime: 47, Breached: 1, Escalations: 0 },
  ];

  // 3. Priority Distribution
  const priorityData = React.useMemo(() => {
    const counts: Record<string, number> = { Emergency: 0, High: 0, Medium: 0, Low: 0 };
    cases.forEach((c) => {
      counts[c.priority] = (counts[c.priority] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [cases]);

  // Case Trends curve (Total vs Resolved) matching Mockup
  const caseTrendsLineData = [
    { period: "W1", Total: 32, Resolved: 24 },
    { period: "W2", Total: 45, Resolved: 36 },
    { period: "W3", Total: 38, Resolved: 32 },
    { period: "W4", Total: 56, Resolved: 48 },
    { period: "W5", Total: 42, Resolved: 40 },
    { period: "W6", Total: 50, Resolved: 46 },
    { period: "W7", Total: 48, Resolved: 45 },
  ];

  // Department-wise distribution (Water 28%, Electricity 24%, Roads 22%, Others 26%)
  const deptWisePieData = [
    { name: "Water", value: 28, color: "#2563EB" },
    { name: "Electricity", value: 24, color: "#0284C7" },
    { name: "Roads", value: 22, color: "#10B981" },
    { name: "Others", value: 26, color: "#F59E0B" },
  ];

  // 4. Officer Performance
  const filteredEmployees = employees.filter(
    (e) => !selectedDepartment || e.department === selectedDepartment
  );

  return (
    <div className="space-y-6">
      {/* Header with Filters matching Mockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Analytics</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Municipal operational metrics, resolution velocity & SLA audits</p>
        </div>
        <div className="flex items-center gap-2.5">
          <select className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border-none px-3 py-2 rounded-xl focus:outline-hidden cursor-pointer">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          <select className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border-none px-3 py-2 rounded-xl focus:outline-hidden cursor-pointer">
            <option>All Departments</option>
            <option>Water Supply</option>
            <option>Transportation</option>
            <option>Sanitation</option>
            <option>Electrical & Power</option>
          </select>
        </div>
      </div>

      {/* Row 1: Case Trends (60%) & Department-wise (40%) (Matches Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Trends Line Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Case Trends</h3>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-slate-600">Total</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Resolved</span>
              </div>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={caseTrendsLineData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0B1E36",
                    borderRadius: "10px",
                    color: "#fff",
                    border: "none",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Total"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#2563EB", stroke: "#FFFFFF", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="Resolved"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#10B981", stroke: "#FFFFFF", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-wise Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2">Department-wise</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 my-auto">
            <div className="h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptWisePieData}
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {deptWisePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val}%`, name]}
                    contentStyle={{ borderRadius: "10px", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5 text-xs">
              {deptWisePieData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-600 font-medium">{d.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: 3 Performance Metric Cards matching Mockup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-tight">95%</p>
            <span className="text-xs font-semibold text-slate-500">Resolution Rate</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-tight">2.5 hrs</p>
            <span className="text-xs font-semibold text-slate-500">Avg Resolution Time</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 leading-tight">92%</p>
            <span className="text-xs font-semibold text-slate-500">On-Time</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Workload Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Department Workload &amp; Resolution Volume
              </h4>
              <p className="text-xs text-slate-500">Total complaints filed vs resolved to date</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
              Live Aggregate
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="Total" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Overdue" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority & Severity Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <h4 className="text-sm font-extrabold text-slate-900 tracking-tight mb-1">
            Grievance Severity Breakdown
          </h4>
          <p className="text-xs text-slate-500 mb-4">Proportion of high-risk vs routine issues</p>
          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend row */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2 border-t border-slate-100">
            {priorityData.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PRIORITY_COLORS[p.name] || "#64748B" }}
                />
                <span className="text-slate-600">{p.name}:</span>
                <span className="text-slate-900">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Field Officer Performance Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
                Field Officer &amp; Crew Performance Leaderboard
              </h4>
              <p className="text-xs text-slate-500">Live operational dispatch metrics &amp; SLA compliance</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            {filteredEmployees.length} Officers Online
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="py-3 px-4">Officer Name</th>
                <th className="py-3 px-3">Department &amp; Role</th>
                <th className="py-3 px-3 text-center">Active Load</th>
                <th className="py-3 px-3 text-center">SLA Compliance</th>
                <th className="py-3 px-3">Field Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredEmployees.slice(0, 6).map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                      {emp.name.charAt(0)}
                    </div>
                    {emp.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <span className="font-bold text-slate-900 block">{emp.department}</span>
                    <span className="text-[10px] text-slate-400">{emp.designation}</span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {emp.assignedCasesCount} cases
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: "94%" }} />
                      </div>
                      <span className="font-bold text-emerald-700 text-[11px]">94%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active on Field
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
