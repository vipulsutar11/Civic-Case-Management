"use client";

import React from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  Building2,
  PlusCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Navigation,
  LogOut,
  Search,
  Activity,
  ScanLine,
  Camera,
  Sparkles,
  Cctv
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useRouter } from "next/navigation";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  alertBadge?: number;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

export default function Sidebar({
  isMobileOpen,
  onCloseMobile,
}: {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const router = useRouter();
  const { currentUser, activeView, setActiveView, cases, setIsAuditModalOpen, logout } = useApp();

  const role = currentUser?.role || "citizen";
  const userDept = currentUser?.department;

  const relevantCases = cases.filter((c) => {
    if (role === "super_admin") return true;
    if (role === "dept_admin") return c.department === userDept;
    if (role === "citizen") return c.citizenId === currentUser?.id;
    return true;
  });

  const pendingCount = relevantCases.filter((c) => c.status === "Pending").length;
  const overdueCount = relevantCases.filter((c) => c.status === "Overdue").length;

  const getNavSections = (): NavSection[] => {
    if (role === "super_admin") {
      return [
        {
          heading: "Operations",
          items: [
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "ai-vision", label: "AI Vision Scanner", icon: ScanLine },
            { id: "cases", label: "Case Directory", icon: FolderKanban, badge: pendingCount },
            { id: "map", label: "GIS Incident Map", icon: Navigation },
          ],
        },
        {
          heading: "Administration",
          items: [
            { id: "vms", label: "VMS Integrations", icon: Cctv },
            { id: "departments", label: "Departments", icon: Building2 },
            { id: "users", label: "Staff & Users", icon: Users },
            { id: "reports", label: "SLA Analytics", icon: BarChart3, alertBadge: overdueCount },
            { id: "audit", label: "Audit Ledger", icon: ShieldCheck },
          ],
        },
      ];
    }
    if (role === "dept_admin") {
      return [
        {
          heading: "Department Operations",
          items: [
            { id: "dashboard", label: "Overview", icon: LayoutDashboard },
            { id: "ai-vision", label: "AI Vision Scanner", icon: ScanLine },
            { id: "cases", label: "Department Queue", icon: FolderKanban, badge: pendingCount },
            { id: "map", label: "Ward Map", icon: Navigation },
          ],
        },
        {
          heading: "Management",
          items: [
            { id: "staff", label: "Field Officers", icon: Users },
            { id: "reports", label: "SLA Performance", icon: BarChart3, alertBadge: overdueCount },
            { id: "audit", label: "Audit Ledger", icon: ShieldCheck },
          ],
        },
      ];
    }
    // Citizen
    return [
      {
        heading: "Citizen Services",
        items: [
          { id: "dashboard", label: "My Dashboard", icon: LayoutDashboard },
          { id: "ai-vision", label: "AI Photo / Media Scan", icon: Camera },
          { id: "cases", label: "My Complaints", icon: FolderKanban, badge: pendingCount },
          { id: "new-complaint", label: "Submit Grievance", icon: PlusCircle },
          { id: "map", label: "City Map", icon: Navigation },
          { id: "community", label: "Track by ID", icon: Search },
        ],
      },
    ];
  };

  const sections = getNavSections();

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar: Rich Deep Royal Navy (Darker version of the #2563EB button) */}
      <aside
        style={{ backgroundColor: "#172E5D", borderColor: "#20427A" }}
        className={`fixed top-0 lg:top-14 bottom-0 left-0 z-40 lg:z-20 w-60 text-blue-100 flex flex-col transition-transform duration-150 ease-in-out lg:translate-x-0 border-r shadow-lg lg:shadow-none ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Workspace Scope Header */}
        <div
          style={{ backgroundColor: "#102244", borderColor: "#20427A" }}
          className="px-4 py-3 border-b"
        >
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-white tracking-tight">
              {role === "super_admin"
                ? "Pune Municipal Corp"
                : role === "dept_admin"
                ? `${userDept}`
                : "Citizen Services"}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Connected" />
          </div>
          <span className="text-[10px] text-blue-200/80 block mt-0.5">
            {role === "super_admin"
              ? "Central Command Hub"
              : role === "dept_admin"
              ? "Department Dispatch Console"
              : "Public Grievance Portal"}
          </span>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-blue-200/60">
                {sec.heading}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "audit") {
                        setIsAuditModalOpen(true);
                      } else {
                        setActiveView(item.id);
                      }
                      onCloseMobile();
                    }}
                    style={
                      isActive
                        ? { backgroundColor: "#2563EB", color: "#FFFFFF" }
                        : undefined
                    }
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group ${
                      isActive
                        ? "shadow-sm shadow-blue-500/30 font-semibold"
                        : "text-blue-100 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? "text-white" : "text-blue-200 group-hover:text-white"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          style={
                            isActive
                              ? { backgroundColor: "rgba(255,255,255,0.25)", color: "#FFFFFF" }
                              : { backgroundColor: "#102244", borderColor: "#20427A", color: "#BFDBFE" }
                          }
                          className="px-1.5 py-0.2 rounded text-[10px] font-mono border"
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.alertBadge !== undefined && item.alertBadge > 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-rose-500/30 text-rose-100 border border-rose-400/40">
                          {item.alertBadge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Operator & Sign Out Footer */}
        <div
          style={{ backgroundColor: "#102244", borderColor: "#20427A" }}
          className="p-3 border-t"
        >
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium text-blue-200 hover:text-rose-200 hover:bg-rose-500/20 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
