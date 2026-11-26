"use client";

import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ToastContainer from "./ToastContainer";
import AuditLogModal from "./AuditLogModal";
import CaseDetailModal from "./CaseDetailModal";
import NewCaseModal from "./NewCaseModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col text-slate-900 font-sans">
      {/* Toast Alert Notifications Container */}
      <ToastContainer />

      {/* Global Modals */}
      <AuditLogModal />
      <CaseDetailModal />
      <NewCaseModal />

      {/* Top Application Header */}
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)} />

      {/* Main Container */}
      <div className="flex-1 flex">
        {/* Persistent Left Sidebar */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Scrollable Content Workspace */}
        <main className="flex-1 lg:ml-60 px-4 py-5 sm:px-6 lg:px-7 w-full min-w-0 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto space-y-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
