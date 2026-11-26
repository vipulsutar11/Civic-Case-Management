"use client";

import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import SuperAdminDashboard from "../components/SuperAdminDashboard";
import DeptAdminDashboard from "../components/DeptAdminDashboard";
import CitizenDashboard from "../components/CitizenDashboard";
import { useApp } from "../context/AppContext";

export default function RootHomePage() {
  const { currentUser } = useApp();
  const role = currentUser?.role || "citizen";

  return (
    <DashboardLayout>
      {role === "super_admin" && <SuperAdminDashboard />}
      {role === "dept_admin" && <DeptAdminDashboard />}
      {role === "citizen" && <CitizenDashboard />}
    </DashboardLayout>
  );
}
