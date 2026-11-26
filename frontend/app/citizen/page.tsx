"use client";

import React, { useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import CitizenDashboard from "../../components/CitizenDashboard";
import { useApp } from "../../context/AppContext";

export default function CitizenPage() {
  const { currentUser, switchDemoRole, setActiveView } = useApp();

  useEffect(() => {
    if (currentUser?.role !== "citizen") {
      switchDemoRole("citizen");
    }
    setActiveView("dashboard");
  }, [currentUser, switchDemoRole, setActiveView]);

  return (
    <DashboardLayout>
      <CitizenDashboard />
    </DashboardLayout>
  );
}
