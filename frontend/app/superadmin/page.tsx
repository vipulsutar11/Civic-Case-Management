"use client";

import React, { useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import SuperAdminDashboard from "../../components/SuperAdminDashboard";
import { useApp } from "../../context/AppContext";

export default function SuperAdminPage() {
  const { currentUser, switchDemoRole } = useApp();

  // Ensure current user is Super Admin for this dedicated route
  useEffect(() => {
    if (currentUser?.role !== "super_admin") {
      switchDemoRole("super_admin");
    }
  }, [currentUser, switchDemoRole]);

  return (
    <DashboardLayout>
      <SuperAdminDashboard />
    </DashboardLayout>
  );
}
