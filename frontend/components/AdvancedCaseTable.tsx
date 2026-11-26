"use client";

import React, { useState, useMemo } from "react";
import {
  CivicCase,
  Department,
  CaseStatus,
  CasePriority,
  formatDisplayDate,
} from "../types";
import { useApp } from "../context/AppContext";
import SLABadge, { PriorityBadge, StatusBadge } from "./SLABadge";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  CheckSquare,
  Square,
  ShieldAlert,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
  FileCode,
  ArrowUpRight
} from "lucide-react";

interface AdvancedCaseTableProps {
  cases: CivicCase[];
  title?: string;
  defaultDepartment?: Department;
  onSelectCase?: (c: CivicCase) => void;
  controlledStatus?: string;
  onStatusChange?: (status: string) => void;
  controlledPriority?: string;
  onPriorityChange?: (priority: string) => void;
}

export default function AdvancedCaseTable({
  cases,
  title = "Municipal Grievance Directory",
  defaultDepartment,
  onSelectCase,
  controlledStatus,
  onStatusChange,
  controlledPriority,
  onPriorityChange,
}: AdvancedCaseTableProps) {
  const { setSelectedCase, bulkUpdateStatus, exportCasesReport } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>(defaultDepartment || "ALL");
  const [internalStatus, setInternalStatus] = useState<string>("ALL");
  const [internalPriority, setInternalPriority] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"date" | "priority" | "sla">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection & Pagination
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Sync with controlled filters if provided
  const selectedStatus = controlledStatus !== undefined ? controlledStatus : internalStatus;
  const setSelectedStatus = (status: string) => {
    if (onStatusChange) onStatusChange(status);
    else setInternalStatus(status);
  };

  const selectedPriority = controlledPriority !== undefined ? controlledPriority : internalPriority;
  const setSelectedPriority = (priority: string) => {
    if (onPriorityChange) onPriorityChange(priority);
    else setInternalPriority(priority);
  };

  // Filter & Sort
  const processedCases = useMemo(() => {
    return cases
      .filter((c) => {
        const q = searchTerm.toLowerCase();
        const matchesQuery =
          !q ||
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.citizenName.toLowerCase().includes(q) ||
          c.location.ward.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q);

        const matchesDept = selectedDept === "ALL" || c.department === selectedDept;

        const matchesStatus =
          selectedStatus === "ALL" ||
          selectedStatus === "All" ||
          c.status.toLowerCase() === selectedStatus.toLowerCase();

        const matchesPriority =
          selectedPriority === "ALL" ||
          selectedPriority === "All" ||
          c.priority.toLowerCase() === selectedPriority.toLowerCase();

        return matchesQuery && matchesDept && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === "priority") {
          const rank: Record<CasePriority, number> = { Emergency: 4, High: 3, Medium: 2, Low: 1 };
          const diff = rank[b.priority] - rank[a.priority];
          return sortOrder === "asc" ? -diff : diff;
        } else if (sortBy === "sla") {
          const aTime = new Date(a.dueDate).getTime();
          const bTime = new Date(b.dueDate).getTime();
          return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
        } else {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();
          return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
        }
      });
  }, [cases, searchTerm, selectedDept, selectedStatus, selectedPriority, sortBy, sortOrder]);

  const totalPages = Math.ceil(processedCases.length / pageSize) || 1;
  const paginatedCases = processedCases.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedCases.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCases.map((c) => c.id));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleBulkAction = (status: CaseStatus) => {
    if (selectedIds.length === 0) return;
    bulkUpdateStatus(selectedIds, status, `Bulk updated by supervisor to ${status}`);
    setSelectedIds([]);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDept("ALL");
    setSelectedStatus("ALL");
    setSelectedPriority("ALL");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedDept !== "ALL" ||
    (selectedStatus !== "ALL" && selectedStatus !== "All") ||
    (selectedPriority !== "ALL" && selectedPriority !== "All");

  return (
    <div id="grievance-directory-table" className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {processedCases.length} Records
            </span>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCasesReport("csv")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded transition"
              title="Export CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => exportCasesReport("json")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded transition"
              title="Export JSON"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-500" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 pt-1">
          {/* Search input */}
          <div className="relative md:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by ID, citizen, ward, or title..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded border border-slate-200 bg-white outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder:text-slate-400 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-700 outline-none focus:border-slate-400 transition"
          >
            <option value="ALL">All Departments</option>
            <option value="Transportation">Transportation &amp; Roads</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Electrical & Power">Electrical &amp; Power</option>
            <option value="Public Works">Public Works</option>
            <option value="Public Health">Public Health</option>
            <option value="Fire Department">Fire Department</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-700 outline-none focus:border-slate-400 transition"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending Triage</option>
            <option value="In Progress">In Progress</option>
            <option value="Overdue">Overdue</option>
            <option value="Escalated">Escalated</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Closed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white text-slate-700 outline-none focus:border-slate-400 transition"
          >
            <option value="ALL">All Priorities</option>
            <option value="Emergency">P0 Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Filter Breadcrumbs */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs text-slate-500">
            <span>Filtered:</span>
            {selectedStatus !== "ALL" && selectedStatus !== "All" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800">
                Status: {selectedStatus}
                <button onClick={() => setSelectedStatus("ALL")} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedPriority !== "ALL" && selectedPriority !== "All" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800">
                Priority: {selectedPriority}
                <button onClick={() => setSelectedPriority("ALL")} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedDept !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-800">
                Dept: {selectedDept}
                <button onClick={() => setSelectedDept("ALL")} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-[11px] text-blue-600 hover:underline ml-1"
            >
              Reset
            </button>
          </div>
        )}

        {/* Floating Bulk Actions Ribbon */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded bg-slate-900 text-white text-xs animate-in fade-in duration-100">
            <span className="font-semibold flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-400" />
              <span>{selectedIds.length} complaints selected</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction("In Progress")}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleBulkAction("Resolved")}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2 py-1 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scannable Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <th className="py-2.5 px-3 w-8 text-center">
                <button
                  onClick={handleSelectAll}
                  className="text-slate-400 hover:text-slate-700"
                  aria-label="Select all"
                >
                  {selectedIds.length === paginatedCases.length && paginatedCases.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-slate-900" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                </button>
              </th>
              <th
                onClick={() => {
                  setSortBy("date");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Case ID &amp; Reported</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3">Grievance &amp; Location</th>
              <th className="py-2.5 px-3">Department</th>
              <th
                onClick={() => {
                  setSortBy("priority");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3">Status</th>
              <th
                onClick={() => {
                  setSortBy("sla");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 transition"
              >
                <div className="flex items-center gap-1">
                  <span>SLA Countdown</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedCases.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <SlidersHorizontal className="w-6 h-6 text-slate-300" />
                    <p className="font-semibold text-slate-700 text-xs">No complaints match your filters</p>
                    <p className="text-[11px] text-slate-400">
                      Try adjusting the search query or reset the filter dropdowns
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={resetFilters}
                        className="mt-2 px-2.5 py-1 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedCases.map((c) => {
                const isSelected = selectedIds.includes(c.id);
                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-50/70 transition cursor-pointer ${
                      isSelected ? "bg-slate-50" : ""
                    }`}
                    onClick={() => {
                      if (onSelectCase) onSelectCase(c);
                      else setSelectedCase(c);
                    }}
                  >
                    <td
                      className="py-2.5 px-3 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleRow(c.id);
                      }}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-3.5 h-3.5 text-slate-900 inline" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 inline" />
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-mono text-xs whitespace-nowrap">
                      <span className="font-semibold text-slate-900 group-hover:text-blue-600 block leading-tight">
                        {c.id}
                      </span>
                      <span className="text-[10px] text-slate-400" suppressHydrationWarning>
                        {formatDisplayDate(c.createdAt)}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 max-w-sm">
                      <p className="font-medium text-slate-900 truncate leading-snug">
                        {c.title}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        Ward: {c.location.ward} &bull; Citizen: {c.citizenName}
                      </p>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {c.department}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <SLABadge dueDate={c.dueDate} status={c.status} priority={c.priority} />
                    </td>

                    <td
                      className="py-2.5 px-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          if (onSelectCase) onSelectCase(c);
                          else setSelectedCase(c);
                        }}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing{" "}
          <strong className="text-slate-900 font-medium font-mono">
            {processedCases.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </strong>{" "}
          to{" "}
          <strong className="text-slate-900 font-medium font-mono">
            {Math.min(currentPage * pageSize, processedCases.length)}
          </strong>{" "}
          of <strong className="text-slate-900 font-medium font-mono">{processedCases.length}</strong> cases
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-slate-700 font-mono text-[11px]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            aria-label="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
