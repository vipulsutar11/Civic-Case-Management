"use client";

import React, { useEffect, use } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "../../../components/DashboardLayout";
import DeptAdminDashboard from "../../../components/DeptAdminDashboard";
import { useApp } from "../../../context/AppContext";
import { Department } from "../../../types";

const SLUG_TO_DEPT: Record<string, Department> = {
  transportation: "Transportation",
  sanitation: "Sanitation",
  "water-supply": "Water Supply",
  "public-works": "Public Works",
  electrical: "Electrical & Power",
  "public-health": "Public Health",
  fire: "Fire Department",
  "fire-department": "Fire Department",
};

export default function DepartmentDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const unwrappedParams = use(params);
  const slug = unwrappedParams.slug;
  const targetDept = SLUG_TO_DEPT[slug] || "Transportation";

  const { currentUser, switchDemoRole } = useApp();

  useEffect(() => {
    if (
      currentUser?.role !== "dept_admin" ||
      currentUser?.department !== targetDept
    ) {
      switchDemoRole("dept_admin", targetDept);
    }
  }, [currentUser, targetDept, switchDemoRole]);

  return (
    <DashboardLayout>
      <DeptAdminDashboard />
    </DashboardLayout>
  );
}
