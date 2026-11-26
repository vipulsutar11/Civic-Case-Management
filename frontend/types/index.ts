export type UserRole = "super_admin" | "dept_admin" | "citizen";

export type Department =
  | "Transportation"
  | "Sanitation"
  | "Water Supply"
  | "Public Works"
  | "Electrical & Power"
  | "Public Health"
  | "Fire Department";

export type CaseStatus =
  | "Pending"
  | "In Progress"
  | "Resolved"
  | "Rejected"
  | "Overdue"
  | "Escalated";

export type CasePriority = "Low" | "Medium" | "High" | "Emergency";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  caseId?: string;
  action: string;
  actorName: string;
  actorRole: string;
  details: string;
  ipAddress?: string;
}

export interface DepartmentSLAStats {
  department: Department;
  totalCases: number;
  resolvedCases: number;
  slaComplianceRate: number; // e.g. 94.2%
  avgResolutionHours: number;
  overdueCount: number;
  activeEscalations: number;
  criticalCases: number;
}

export interface OfficerPerformance {
  id: string;
  name: string;
  department: Department;
  designation: string;
  assignedCases: number;
  resolvedCases: number;
  avgRating: number;
  slaAdherenceRate: number;
  status: "active" | "on_field" | "standby";
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info" | "emergency";
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: Department;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: Department;
  designation: string;
  assignedCasesCount: number;
  status: "active" | "on_leave" | "busy";
}

export interface CaseRemark {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
  attachmentUrl?: string;
}

export interface CaseFeedback {
  rating: number; // 1 to 5
  comment: string;
  timestamp: string;
}

export interface AICaseAnalysis {
  detectedCategory: string;
  confidence: number;
  suggestedPriority: CasePriority;
  detectedHazards: string[];
  estimatedResolutionDays: number;
  hazardDetections?: {
    flame?: { detected: boolean; confidence: number; areaCoverage: string; density?: string };
    smokePlume?: { detected: boolean; confidence: number; areaCoverage: string; density?: string };
  };
  dispatchRecommendation?: {
    priority: string;
    dispatchStatus: string;
    primaryUnit: string;
    targetResponseTime: string;
  };
}

export interface CivicCase {
  id: string; // e.g. CASE-2026-1042
  title: string;
  description: string;
  department: Department;
  citizenId: string;
  citizenName: string;
  citizenEmail: string;
  citizenPhone?: string;
  location: {
    address: string;
    ward: string;
    lat?: number;
    lng?: number;
  };
  status: CaseStatus;
  priority: CasePriority;
  createdAt: string;
  dueDate: string;
  resolvedAt?: string;
  assignedEmployee?: string; // Employee ID or name
  assignedEmployeeName?: string;
  images: string[];
  videos?: string[];
  resolutionImages?: string[];
  remarks: CaseRemark[];
  aiAnalysis?: AICaseAnalysis;
  feedback?: CaseFeedback;
  isReopened?: boolean;
  reopenReason?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  caseId?: string;
  timestamp: string;
  isRead: boolean;
  type: "info" | "warning" | "success" | "emergency";
}

export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      return `${parts[0]}-${parts[1]}-${parts[2]}`;
    }
    return dateStr.slice(0, 10);
  } catch {
    return dateStr || "";
  }
}
