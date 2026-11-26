"use client";

import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import VMSIntegrationDashboard from "../../components/VMSIntegrationDashboard";

export default function VMSPage() {
  return (
    <DashboardLayout>
      <VMSIntegrationDashboard />
    </DashboardLayout>
  );
}
