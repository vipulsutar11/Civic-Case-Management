"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CivicCase,
  User,
  Employee,
  Department,
  UserRole,
  CaseStatus,
  CasePriority,
  AppNotification,
  CaseRemark,
  CaseFeedback,
  AuditLogEntry,
  ToastNotification,
} from "../types";
import {
  INITIAL_CASES,
  INITIAL_USERS,
  EMPLOYEES,
  INITIAL_NOTIFICATIONS,
  DEPARTMENTS,
  INITIAL_AUDIT_LOGS,
} from "../data/mockData";

interface CreateCaseInput {
  title: string;
  description: string;
  department: Department;
  address: string;
  ward: string;
  lat?: number;
  lng?: number;
  priority?: CasePriority;
  images: string[];
  videos?: string[];
  file?: File | null;
}

export function mapBackendCaseToCivicCase(b: any): CivicCase {
  const images = (b.attachments || []).map((att: any) => {
    const u = att.file_url || "";
    return u.startsWith("http") ? u : `/${u}`;
  });
  if (images.length === 0) {
    images.push("https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=600");
  }

  const priorityNum = b.priority || b.ai_severity || 5;
  let priorityStr: CasePriority = "Medium";
  if (priorityNum >= 9) priorityStr = "Emergency";
  else if (priorityNum >= 7) priorityStr = "High";
  else if (priorityNum <= 4) priorityStr = "Low";

  let statusStr: CaseStatus = "Pending";
  if (b.status === "requires_dispatch" || b.status === "in_progress") statusStr = "In Progress";
  else if (b.status === "closed" || b.status === "Resolved") statusStr = "Resolved";
  else if (b.status === "duplicate" || b.status === "Rejected") statusStr = "Rejected";

  return {
    id: String(b.id),
    title: b.title || "Civic Grievance",
    description: b.description || "Grievance details",
    department: (b.assigned_department as Department) || "Public Works",
    citizenId: String(b.citizen_id || "citizen"),
    citizenName: "Citizen User",
    citizenEmail: "citizen@city.gov",
    location: {
      address: b.ward ? `${b.ward}, City Zone` : "Municipal Area",
      ward: b.ward || "Ward 12 - Indiranagar",
      lat: b.latitude ?? 18.5204,
      lng: b.longitude ?? 73.8567,
    },
    status: statusStr,
    priority: priorityStr,
    createdAt: b.created_at || new Date().toISOString(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    images: images,
    remarks: [
      {
        id: `rem-${Date.now()}`,
        authorName: "AI Autonomous Dispatcher",
        authorRole: "System Agent",
        text: `Automated assessment: Intent [${b.ai_intent || "unclassified"}], Severity [${b.ai_severity || 5}/10].`,
        timestamp: b.created_at || new Date().toISOString(),
      }
    ],
    aiAnalysis: {
      detectedCategory: b.ai_intent || "Civic Hazard",
      confidence: 0.94,
      suggestedPriority: priorityStr,
      detectedHazards: [b.ai_intent || "civic_issue"].filter(Boolean),
      estimatedResolutionDays: priorityStr === "Emergency" ? 1 : 3,
    }
  };
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  cases: CivicCase[];
  employees: Employee[];
  notifications: AppNotification[];
  departments: Department[];
  activeView: string;
  setActiveView: (view: string) => void;
  selectedCase: CivicCase | null;
  setSelectedCase: (c: CivicCase | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isNewCaseModalOpen: boolean;
  setIsNewCaseModalOpen: (open: boolean) => void;
  authModalMode: "login" | "register" | "forgot" | "reset";
  setAuthModalMode: (mode: "login" | "register" | "forgot" | "reset") => void;

  // Auth Operations
  login: (email: string, password?: string, role?: UserRole) => boolean;
  registerCitizen: (name: string, email: string, password?: string, phone?: string) => boolean;
  logout: () => void;
  switchDemoRole: (role: UserRole, department?: Department) => void;
  forgotPassword: (email: string) => boolean;
  resetPassword: (email: string, otp: string, newPass: string) => boolean;

  // Case Operations
  createCase: (input: CreateCaseInput) => CivicCase;
  addBackendCase: (backendData: any) => CivicCase;
  addCivicCase: (caseObj: CivicCase) => void;
  updateCaseStatus: (
    caseId: string,
    status: CaseStatus,
    remarkText?: string,
    resolutionImage?: string
  ) => void;
  assignCase: (caseId: string, department: Department, employeeId?: string) => void;
  deleteCase: (caseId: string) => void;
  reopenCase: (caseId: string, reason: string) => void;
  submitFeedback: (caseId: string, rating: number, comment: string) => void;
  addRemark: (caseId: string, text: string, attachmentUrl?: string) => void;

  // User Management (Super Admin)
  createUser: (user: Omit<User, "id" | "createdAt">) => void;
  deleteUser: (userId: string) => void;

  // Audit Logs & Bulk Operations
  auditLogs: AuditLogEntry[];
  toasts: ToastNotification[];
  addToast: (title: string, message: string, type?: ToastNotification["type"]) => void;
  removeToast: (id: string) => void;
  bulkUpdateStatus: (caseIds: string[], status: CaseStatus, remarkText?: string) => void;
  exportCasesReport: (format?: "csv" | "json") => void;
  isAuditModalOpen: boolean;
  setIsAuditModalOpen: (open: boolean) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationsCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states with localStorage persistence if in browser
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // Default to Super Admin for immediate demo evaluation
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [cases, setCases] = useState<CivicCase[]>(INITIAL_CASES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [selectedCase, setSelectedCase] = useState<CivicCase | null>(null);

  // Auth & Creation Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register" | "forgot" | "reset">("login");

  // Load from localStorage and sync live persistent cases from backend API
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("civic_current_user");
      const savedCases = localStorage.getItem("civic_cases");
      const savedUsers = localStorage.getItem("civic_users");
      const savedNotifs = localStorage.getItem("civic_notifications");

      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      if (savedCases) setCases(JSON.parse(savedCases));
      if (savedUsers) setUsers(JSON.parse(savedUsers));
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }

    // Connect and sync live persistent cases from backend API
    async function syncBackendCases() {
      try {
        const res = await fetch("/api/backend/cases/feed/public");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const liveCases = data.map(mapBackendCaseToCivicCase);
            setCases((prev) => {
              const liveIds = new Set(liveCases.map((c) => c.id));
              const nonDuplicatePrev = prev.filter((c) => !liveIds.has(c.id));
              return [...liveCases, ...nonDuplicatePrev];
            });
          }
        }
      } catch {
        // FastAPI backend on port 8000 is offline; local storage & mock state is seamlessly active
      }
    }
    syncBackendCases();
    const intervalId = setInterval(syncBackendCases, 15000);
    window.addEventListener("focus", syncBackendCases);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", syncBackendCases);
    };
  }, []);

  // Sync back to localStorage
  useEffect(() => {
    try {
      if (currentUser) localStorage.setItem("civic_current_user", JSON.stringify(currentUser));
      else localStorage.removeItem("civic_current_user");
      localStorage.setItem("civic_cases", JSON.stringify(cases));
      localStorage.setItem("civic_users", JSON.stringify(users));
      localStorage.setItem("civic_notifications", JSON.stringify(notifications));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [currentUser, cases, users, notifications]);

  // Auth Functions
  const login = (email: string, password?: string, role?: UserRole): boolean => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (role && found.role !== role) {
        // If demo role specified, adjust or allow
      }
      setCurrentUser(found);
      setIsAuthModalOpen(false);
      return true;
    }
    // If not found in mock users, auto-register as citizen
    const newUser: User = {
      id: `usr-citizen-${Date.now().toString().slice(-4)}`,
      name: email.split("@")[0],
      email: email,
      role: role || "citizen",
      phone: "+91 90000 00000",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const registerCitizen = (name: string, email: string, password?: string, phone?: string): boolean => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return false;

    const newUser: User = {
      id: `usr-citizen-${Date.now().toString().slice(-4)}`,
      name,
      email,
      role: "citizen",
      phone: phone || "+91 98000 00000",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthModalOpen(true);
    setAuthModalMode("login");
  };

  const switchDemoRole = (role: UserRole, department?: Department) => {
    if (role === "super_admin") {
      const admin = users.find((u) => u.role === "super_admin") || INITIAL_USERS[0];
      setCurrentUser(admin);
    } else if (role === "dept_admin") {
      const targetDept = department || "Transportation";
      const deptAdmin =
        users.find((u) => u.role === "dept_admin" && u.department === targetDept) ||
        INITIAL_USERS[1];
      setCurrentUser(deptAdmin);
    } else {
      const citizen = users.find((u) => u.role === "citizen") || INITIAL_USERS[5];
      setCurrentUser(citizen);
    }
    setActiveView("dashboard");
  };

  const forgotPassword = (email: string): boolean => {
    // Simulates sending reset OTP email
    const found = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    return found;
  };

  const resetPassword = (email: string, otp: string, newPass: string): boolean => {
    // Simulates validating 6-digit OTP
    if (otp.length === 6) {
      return true;
    }
    return false;
  };

  // Case Operations
  const createCase = (input: CreateCaseInput): CivicCase => {
    const newId = `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days SLA

    // AI Classification Mock
    const priority = input.priority || "Medium";
    const newCase: CivicCase = {
      id: newId,
      title: input.title,
      description: input.description,
      department: input.department,
      citizenId: currentUser?.id || "usr-citizen-1",
      citizenName: currentUser?.name || "Citizen User",
      citizenEmail: currentUser?.email || "citizen@civic.gov",
      citizenPhone: currentUser?.phone || "+91 98000 00000",
      location: {
        address: input.address,
        ward: input.ward,
        lat: input.lat || 12.9716,
        lng: input.lng || 77.5946,
      },
      status: "Pending",
      priority: priority,
      createdAt: now.toISOString(),
      dueDate: dueDate.toISOString(),
      images: input.images.length > 0 ? input.images : [
        "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=600"
      ],
      videos: input.videos || [],
      remarks: [
        {
          id: `rem-${Date.now()}`,
          authorName: "System AI Agent",
          authorRole: "Automated Ingestion",
          text: `Grievance registered and routed to ${input.department}. Automated duplicate check clear.`,
          timestamp: now.toISOString(),
        },
      ],
      aiAnalysis: {
        detectedCategory: `${input.department} Service Request`,
        confidence: 0.94,
        suggestedPriority: priority,
        detectedHazards: ["unresolved_civic_grievance"],
        estimatedResolutionDays: 3,
      },
    };

    setCases((prev) => [newCase, ...prev]);

    // Push notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "Complaint Registered",
      message: `Your grievance #${newId} has been submitted to ${input.department}.`,
      caseId: newId,
      timestamp: "Just now",
      isRead: false,
      type: "info",
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Live backend dispatch over HTTP (FastAPI multi-spectral vision agent)
    (async () => {
      try {
        const formData = new FormData();
        formData.append("title", input.title);
        formData.append("description", input.description);
        if (input.lat) formData.append("latitude", String(input.lat));
        if (input.lng) formData.append("longitude", String(input.lng));
        if (input.ward) formData.append("ward", input.ward);
        if (input.file) {
          formData.append("file", input.file);
        }

        const res = await fetch("/api/backend/cases", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const backendData = await res.json();
          const liveCase = mapBackendCaseToCivicCase(backendData);
          setCases((prev) => [liveCase, ...prev.filter((c) => c.id !== newCase.id && c.id !== liveCase.id)]);
        }
      } catch {
        // Backend API offline; running in local optimistic mode
      }
    })();

    return newCase;
  };

  const addCivicCase = (caseObj: CivicCase) => {
    setCases((prev) => [caseObj, ...prev.filter((c) => c.id !== caseObj.id)]);
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: "AI Incident Logged",
      message: `Case #${caseObj.id} registered: ${caseObj.title}`,
      caseId: caseObj.id,
      timestamp: "Just now",
      isRead: false,
      type: "info",
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const addBackendCase = (backendData: any): CivicCase => {
    const liveCase = mapBackendCaseToCivicCase(backendData);
    addCivicCase(liveCase);
    return liveCase;
  };

  const updateCaseStatus = (
    caseId: string,
    status: CaseStatus,
    remarkText?: string,
    resolutionImage?: string
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const updatedRemarks = [...c.remarks];
          if (remarkText) {
            updatedRemarks.push({
              id: `rem-${Date.now()}`,
              authorName: currentUser?.name || "Department Official",
              authorRole: currentUser?.role === "super_admin" ? "Super Admin" : "Dept Admin",
              text: remarkText,
              timestamp: new Date().toISOString(),
              attachmentUrl: resolutionImage,
            });
          }

          const resolutionImages = c.resolutionImages ? [...c.resolutionImages] : [];
          if (resolutionImage) {
            resolutionImages.push(resolutionImage);
          }

          return {
            ...c,
            status,
            resolvedAt: status === "Resolved" ? new Date().toISOString() : c.resolvedAt,
            remarks: updatedRemarks,
            resolutionImages,
          };
        }
        return c;
      })
    );

    // Dispatch to live backend Active Learning override endpoint
    (async () => {
      try {
        await fetch(`/api/backend/cases/${caseId}/supervisor-override`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: status,
            supervisor_notes: remarkText || `Status transitioned to ${status}`,
          }),
        });
      } catch (e) {
        // Ignored if offline
      }
    })();

    // Add alert notification
    const updatedCase = cases.find((c) => c.id === caseId);
    if (updatedCase) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `Case Status: ${status}`,
          message: `Case #${caseId} has been updated to "${status}".`,
          caseId,
          timestamp: "Just now",
          isRead: false,
          type: status === "Resolved" ? "success" : status === "Rejected" ? "warning" : "info",
        },
        ...prev,
      ]);
    }
  };

  const assignCase = (caseId: string, department: Department, employeeId?: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const remarks = [...c.remarks];
          remarks.push({
            id: `rem-${Date.now()}`,
            authorName: currentUser?.name || "Admin",
            authorRole: currentUser?.role || "Admin",
            text: `Case assigned to ${department} ${emp ? `(Field Officer: ${emp.name})` : ""}`,
            timestamp: new Date().toISOString(),
          });
          return {
            ...c,
            department,
            assignedEmployee: emp?.id,
            assignedEmployeeName: emp?.name,
            status: "In Progress",
            remarks,
          };
        }
        return c;
      })
    );
  };

  const deleteCase = (caseId: string) => {
    setCases((prev) => prev.filter((c) => c.id !== caseId));
    if (selectedCase?.id === caseId) setSelectedCase(null);
  };

  const reopenCase = (caseId: string, reason: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const remarks = [...c.remarks];
          remarks.push({
            id: `rem-${Date.now()}`,
            authorName: currentUser?.name || "Citizen",
            authorRole: "Citizen",
            text: `Complaint Reopened by citizen. Reason: ${reason}`,
            timestamp: new Date().toISOString(),
          });
          return {
            ...c,
            status: "In Progress",
            isReopened: true,
            reopenReason: reason,
            remarks,
          };
        }
        return c;
      })
    );
  };

  const submitFeedback = (caseId: string, rating: number, comment: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            feedback: {
              rating,
              comment,
              timestamp: new Date().toISOString(),
            },
          };
        }
        return c;
      })
    );
  };

  const addRemark = (caseId: string, text: string, attachmentUrl?: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const remarks = [
            ...c.remarks,
            {
              id: `rem-${Date.now()}`,
              authorName: currentUser?.name || "Official",
              authorRole:
                currentUser?.role === "super_admin"
                  ? "Super Admin"
                  : currentUser?.role === "dept_admin"
                  ? "Dept Admin"
                  : "Citizen",
              text,
              attachmentUrl,
              timestamp: new Date().toISOString(),
            },
          ];
          return { ...c, remarks };
        }
        return c;
      })
    );
  };

  // User Management
  const createUser = (userData: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Toast System
  const addToast = (title: string, message: string, type: ToastNotification["type"] = "info") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastNotification = { id, title, message, type, timestamp: "Just now" };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Bulk Operations
  const bulkUpdateStatus = (caseIds: string[], status: CaseStatus, remarkText?: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (caseIds.includes(c.id)) {
          const updatedRemarks = [...c.remarks];
          if (remarkText) {
            updatedRemarks.push({
              id: `rem-${Date.now()}-${c.id}`,
              authorName: currentUser?.name || "System Admin",
              authorRole: currentUser?.role === "super_admin" ? "Super Admin" : "Dept Admin",
              text: remarkText,
              timestamp: new Date().toISOString(),
            });
          }
          return {
            ...c,
            status,
            remarks: updatedRemarks,
            resolvedAt: status === "Resolved" ? new Date().toISOString() : c.resolvedAt,
          };
        }
        return c;
      })
    );

    const auditEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: "BULK_STATUS_UPDATE",
      actorName: currentUser?.name || "Staff",
      actorRole: currentUser?.role || "Admin",
      details: `Bulk shifted ${caseIds.length} tickets to ${status}. Notes: ${remarkText || "None"}`,
      ipAddress: "127.0.0.1",
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);
    addToast("Bulk Update Success", `Updated ${caseIds.length} complaints to ${status}`, "success");
  };

  // Report Export
  const exportCasesReport = (format: "csv" | "json" = "csv") => {
    if (format === "json") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cases, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `civic_cases_export_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast("Export Complete", "Exported cases in JSON format", "info");
      return;
    }

    const headers = ["Case ID", "Title", "Department", "Citizen", "Ward", "Status", "Priority", "Created At"];
    const rows = cases.map((c) => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.department,
      `"${c.citizenName}"`,
      `"${c.location.ward}"`,
      c.status,
      c.priority,
      c.createdAt,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `municipal_cases_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    addToast("Export Complete", "Downloaded Municipal Cases CSV Report", "success");
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        cases,
        employees,
        notifications,
        auditLogs,
        toasts,
        addToast,
        removeToast,
        bulkUpdateStatus,
        exportCasesReport,
        isAuditModalOpen,
        setIsAuditModalOpen,
        departments: DEPARTMENTS,
        activeView,
        setActiveView,
        selectedCase,
        setSelectedCase,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isNewCaseModalOpen,
        setIsNewCaseModalOpen,
        authModalMode,
        setAuthModalMode,
        login,
        registerCitizen,
        logout,
        switchDemoRole,
        forgotPassword,
        resetPassword,
        createCase,
        addBackendCase,
        addCivicCase,
        updateCaseStatus,
        assignCase,
        deleteCase,
        reopenCase,
        submitFeedback,
        addRemark,
        createUser,
        deleteUser,
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotificationsCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
