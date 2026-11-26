"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Building2,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Menu,
  Flame,
  UserCheck,
  Plus,
  KeyRound,
  ShieldCheck,
  Check,
  Layers
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";

export default function Navbar({ onToggleMobileSidebar }: { onToggleMobileSidebar: () => void }) {
  const router = useRouter();
  const {
    currentUser,
    logout,
    switchDemoRole,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadNotificationsCount,
    departments,
    setIsNewCaseModalOpen,
    setIsAuditModalOpen,
    setActiveView,
    cases,
  } = useApp();

  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const emergencyCount = (cases || []).filter(
    (c) => c.priority === "Emergency" && c.status !== "Resolved"
  ).length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-14">
      <div className="px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        {/* Left: Mobile menu toggle & Municipal Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider">
              PMC
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-sm tracking-tight text-slate-900">
                  CivicCare
                </span>
                <span className="text-slate-400 font-light text-xs">/</span>
                <span className="text-xs font-medium text-slate-600 hidden sm:inline">
                  Operations Platform
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight mt-0.5 hidden sm:block">
                Pune Municipal Corporation &bull; Central Control
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Command Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by case ID, citizen, ward, or keyword..."
              className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none transition text-slate-800 placeholder:text-slate-400"
            />
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded absolute right-2.5 top-1.5 pointer-events-none">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Operations Toolbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Emergency Alert Indicator */}
          {emergencyCount > 0 && (
            <button
              onClick={() => setActiveView("cases")}
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-medium transition cursor-pointer"
              title="Click to inspect active emergency cases"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              <span>{emergencyCount} Critical Cases</span>
            </button>
          )}

          {/* Audit Ledger Trigger */}
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md transition"
            title="Inspect Immutable Municipal Audit Log"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Audit Trail</span>
          </button>

          {/* New Grievance Primary Action */}
          <button
            onClick={() => setIsNewCaseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-md transition shadow-2xs"
            title="Register a new case"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Case</span>
          </button>

          {/* Role Switcher Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleSwitcher(!showRoleSwitcher);
                setShowNotifs(false);
                setShowProfileMenu(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-md transition"
              title="Switch demo view"
            >
              <span className="text-slate-500 text-[11px] hidden sm:inline">View:</span>
              <span className="font-semibold text-slate-900">
                {currentUser?.role === "super_admin"
                  ? "Super Admin"
                  : currentUser?.role === "dept_admin"
                  ? currentUser.department
                  : "Citizen"}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-lg shadow-lg border border-slate-200 p-2 z-50 text-xs animate-in fade-in duration-100">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Role Simulation
                </div>

                <div className="space-y-0.5 mt-1">
                  <button
                    onClick={() => {
                      switchDemoRole("super_admin");
                      setShowRoleSwitcher(false);
                      router.push("/superadmin");
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition ${
                      currentUser?.role === "super_admin"
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
                      <span>Super Administrator</span>
                    </span>
                    {currentUser?.role === "super_admin" && <Check className="w-3.5 h-3.5 text-slate-900" />}
                  </button>

                  <div className="px-2 pt-2 pb-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Department Consoles
                  </div>
                  {departments.map((dept) => {
                    const slugMap: Record<string, string> = {
                      Transportation: "transportation",
                      Sanitation: "sanitation",
                      "Water Supply": "water-supply",
                      "Public Works": "public-works",
                      "Electrical & Power": "electrical",
                      "Public Health": "public-health",
                      "Fire Department": "fire",
                    };
                    const s = slugMap[dept] || "transportation";
                    const isCurrent = currentUser?.role === "dept_admin" && currentUser.department === dept;
                    return (
                      <button
                        key={dept}
                        onClick={() => {
                          switchDemoRole("dept_admin", dept);
                          setShowRoleSwitcher(false);
                          router.push(`/department/${s}`);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition ${
                          isCurrent
                            ? "bg-slate-100 text-slate-900 font-semibold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{dept}</span>
                        </span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-slate-900" />}
                      </button>
                    );
                  })}

                  <div className="px-2 pt-2 pb-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Citizen Service
                  </div>
                  <button
                    onClick={() => {
                      switchDemoRole("citizen");
                      setShowRoleSwitcher(false);
                      router.push("/citizen");
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition ${
                      currentUser?.role === "citizen"
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>Citizen Portal (Priya S.)</span>
                    </span>
                    {currentUser?.role === "citizen" && <Check className="w-3.5 h-3.5 text-slate-900" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowRoleSwitcher(false);
                setShowProfileMenu(false);
              }}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-lg shadow-lg border border-slate-200 p-3 z-50 text-xs animate-in fade-in duration-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                  <span className="font-semibold text-slate-900">Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-2 rounded-md cursor-pointer transition text-xs ${
                        n.isRead ? "text-slate-500 hover:bg-slate-50" : "bg-slate-50 text-slate-800 font-medium"
                      }`}
                    >
                      <p className="font-semibold text-slate-900 leading-tight">{n.title}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                      <span className="text-[10px] text-slate-400 block mt-1">{n.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifs(false);
                  setShowRoleSwitcher(false);
                }}
                className="flex items-center gap-2 p-1 rounded-md hover:bg-slate-100 transition"
              >
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-mono text-[11px] font-semibold flex items-center justify-center shrink-0">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-800 hidden lg:inline">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:inline" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-lg shadow-lg border border-slate-200 p-2 z-50 text-xs animate-in fade-in duration-100">
                  <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                    <p className="font-semibold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                      {currentUser.role === "super_admin"
                        ? "Super Admin"
                        : currentUser.department || "Citizen"}
                    </span>
                  </div>

                  <Link
                    href="/login"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-2 py-1.5 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    <span>Switch Login Portal</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      router.push("/login");
                    }}
                    className="w-full text-left px-2 py-1.5 rounded text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
