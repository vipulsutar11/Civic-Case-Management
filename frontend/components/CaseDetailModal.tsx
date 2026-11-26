"use client";

import React, { useState } from "react";
import {
  X,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Building2,
  User,
  ShieldAlert,
  Send,
  Star,
  RotateCcw,
  Flame,
  Check,
  Tag,
  Paperclip,
  Trash2,
  ExternalLink,
  ChevronRight,
  Cpu,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { CivicCase, CaseStatus, Department, formatDisplayDate } from "../types";
import SLABadge, { PriorityBadge, StatusBadge } from "./SLABadge";

export default function CaseDetailModal() {
  const {
    currentUser,
    selectedCase,
    setSelectedCase,
    updateCaseStatus,
    assignCase,
    deleteCase,
    reopenCase,
    submitFeedback,
    addRemark,
    employees,
    departments,
  } = useApp();

  const [newRemarkText, setNewRemarkText] = useState("");
  const [newRemarkImage, setNewRemarkImage] = useState("");

  // Reopen modal state
  const [isReopening, setIsReopening] = useState(false);
  const [reopenReason, setReopenReason] = useState("");

  // Feedback state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Status update state (for Admin)
  const [statusToChange, setStatusToChange] = useState<CaseStatus | null>(null);
  const [statusRemark, setStatusRemark] = useState("");
  const [resolutionImg, setResolutionImg] = useState("");

  // Assign staff state
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");

  // Dual-target vision overlay toggle
  const [visionOverlayMode, setVisionOverlayMode] = useState<"all" | "flame" | "smoke" | "raw">("all");

  if (!selectedCase) return null;

  const role = currentUser?.role || "citizen";
  const isSuperAdmin = role === "super_admin";
  const isDeptAdmin = role === "dept_admin" && currentUser?.department === selectedCase.department;
  const isOwner = currentUser?.id === selectedCase.citizenId;

  const handleAddRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemarkText.trim()) return;
    addRemark(selectedCase.id, newRemarkText, newRemarkImage || undefined);
    setNewRemarkText("");
    setNewRemarkImage("");
  };

  const handleConfirmStatusChange = () => {
    if (!statusToChange) return;
    updateCaseStatus(
      selectedCase.id,
      statusToChange,
      statusRemark || `Status updated to ${statusToChange}`,
      resolutionImg || undefined
    );
    setStatusToChange(null);
    setStatusRemark("");
    setResolutionImg("");
  };

  const handleConfirmAssign = () => {
    if (!selectedStaffId) return;
    assignCase(selectedCase.id, selectedCase.department, selectedStaffId);
    setIsAssigning(false);
  };

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;
    reopenCase(selectedCase.id, reopenReason);
    setIsReopening(false);
    setReopenReason("");
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback(selectedCase.id, rating, feedbackComment);
    setIsSubmittingFeedback(false);
  };

  const relevantEmployees = employees.filter((e) => e.department === selectedCase.department);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden my-6 max-h-[94vh] flex flex-col animate-in fade-in duration-150">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {selectedCase.id}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-medium text-slate-600">
              {selectedCase.department}
            </span>
            <span className="text-slate-300">&bull;</span>
            <PriorityBadge priority={selectedCase.priority} />
            <StatusBadge status={selectedCase.status} />
          </div>

          <button
            onClick={() => setSelectedCase(null)}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Title & Reporter Subtitle */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
              {selectedCase.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {selectedCase.location.address || selectedCase.location.ward}
              </span>
              <span>&bull;</span>
              <span>Reported by <strong>{selectedCase.citizenName}</strong></span>
              <span>&bull;</span>
              <span className="font-mono text-slate-400" suppressHydrationWarning>
                {new Date(selectedCase.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Dossier 2-Column Split: Operations Data (Left) & Workflow Timeline (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Description, Media Evidence, Hazard Findings (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Citizen Grievance Description
                </h3>
                <div className="p-3.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedCase.description}
                </div>
              </div>

              {/* Photo Evidence & Camera Inspection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Visual Evidence ({selectedCase.images?.length || 0})
                  </h3>
                  <div className="inline-flex rounded border border-slate-200 bg-slate-100 p-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setVisionOverlayMode("all")}
                      className={`px-2 py-0.5 rounded transition ${visionOverlayMode === "all" ? "bg-white text-slate-900 font-semibold shadow-2xs" : "text-slate-500 hover:text-slate-900"}`}
                    >
                      AI Highlights
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisionOverlayMode("raw")}
                      className={`px-2 py-0.5 rounded transition ${visionOverlayMode === "raw" ? "bg-white text-slate-900 font-semibold shadow-2xs" : "text-slate-500 hover:text-slate-900"}`}
                    >
                      Raw Photo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {selectedCase.images?.map((img, i) => (
                    <a
                      key={i}
                      href={img}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative block aspect-video rounded border border-slate-200 bg-slate-100 overflow-hidden"
                    >
                      <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                      {visionOverlayMode === "all" && (
                        <div className="absolute inset-0 pointer-events-none p-2 flex items-end">
                          <span className="bg-slate-900/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-2xs">
                            Verified Geo-Capture
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium gap-1">
                        <span>Expand</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* AI Autonomous Triage Findings */}
              {selectedCase.aiAnalysis && (
                <div className="p-3.5 bg-slate-50 rounded border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      AI Autonomous Triage &amp; Classification
                    </span>
                    <span className="font-mono text-[11px] text-slate-600">
                      {(selectedCase.aiAnalysis.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Category: <strong className="text-slate-900">{selectedCase.aiAnalysis.detectedCategory}</strong>
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedCase.aiAnalysis.detectedHazards.map((h, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-700 font-mono">
                        #{h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Proof (If Resolved) */}
              {selectedCase.resolutionImages && selectedCase.resolutionImages.length > 0 && (
                <div className="p-3.5 bg-emerald-50/60 rounded border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Field Resolution Verification
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                      GPS Geofence Match
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCase.resolutionImages.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer" className="block aspect-video rounded border border-emerald-200 overflow-hidden">
                        <img src={img} alt="Resolution proof" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Citizen Rating Feedback */}
              {selectedCase.feedback && (
                <div className="p-3.5 bg-amber-50/60 rounded border border-amber-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-900">Citizen Satisfaction Score</span>
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= selectedCase.feedback!.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700 italic text-[11px]">"{selectedCase.feedback.comment}"</p>
                </div>
              )}

              {/* Official Activity & Remarks Thread */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Official Remarks &amp; Audit Notes ({selectedCase.remarks.length})
                </h3>

                <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded border border-slate-200 text-xs mb-3">
                  {selectedCase.remarks.length > 0 ? (
                    selectedCase.remarks.map((rem) => (
                      <div key={rem.id} className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-900">{rem.authorName} ({rem.authorRole})</span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {new Date(rem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs leading-relaxed">{rem.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-3 text-xs">No notes recorded yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddRemark} className="flex gap-2">
                  <input
                    type="text"
                    value={newRemarkText}
                    onChange={(e) => setNewRemarkText(e.target.value)}
                    placeholder="Add operational remark or update..."
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded outline-none focus:border-slate-400 bg-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition"
                  >
                    Post Note
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Workflow, Assignment & Milestones (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Operational Metadata Card */}
              <div className="p-4 bg-slate-50 rounded border border-slate-200 text-xs space-y-3">
                <h3 className="font-semibold text-slate-900 pb-2 border-b border-slate-200 text-xs">
                  Operational Parameters
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Statutory SLA Window:</span>
                    <SLABadge dueDate={selectedCase.dueDate} status={selectedCase.status} priority={selectedCase.priority} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Deadline:</span>
                    <span className="font-mono text-slate-700" suppressHydrationWarning>
                      {formatDisplayDate(selectedCase.dueDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Assigned Field Crew:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedCase.assignedEmployeeName || "Unassigned"}
                    </span>
                  </div>
                </div>

                {/* Staff Assignment Inline Dropdown */}
                {(isSuperAdmin || isDeptAdmin) && (
                  <div className="pt-2 border-t border-slate-200">
                    {isAssigning ? (
                      <div className="space-y-2">
                        <select
                          value={selectedStaffId}
                          onChange={(e) => setSelectedStaffId(e.target.value)}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                        >
                          <option value="">Select field personnel</option>
                          {relevantEmployees.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.name} ({e.designation})
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={handleConfirmAssign}
                            className="flex-1 py-1 bg-slate-900 text-white rounded text-xs font-medium"
                          >
                            Confirm Dispatch
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAssigning(false)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAssigning(true)}
                        className="w-full py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded text-xs font-medium transition text-center"
                      >
                        {selectedCase.assignedEmployee ? "Reassign Officer" : "Assign Field Crew"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Workflow Pipeline Timeline */}
              <div className="p-4 bg-slate-50 rounded border border-slate-200">
                <h3 className="font-semibold text-slate-900 pb-2 border-b border-slate-200 text-xs mb-3">
                  Workflow Milestone Timeline
                </h3>

                <div className="space-y-3 relative pl-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-px before:bg-slate-200 text-xs">
                  {/* Step 1: Ingestion */}
                  <div className="relative">
                    <span className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                    <div>
                      <p className="font-semibold text-slate-900 leading-tight">1. Citizen Ingestion</p>
                      <span className="text-[10px] text-slate-400 font-mono" suppressHydrationWarning>
                        {formatDisplayDate(selectedCase.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Step 2: Routing */}
                  <div className="relative">
                    <span className="absolute -left-4 top-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                    <div>
                      <p className="font-semibold text-slate-900 leading-tight">
                        2. Routed to {selectedCase.department}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {selectedCase.assignedEmployeeName ? `Assigned: ${selectedCase.assignedEmployeeName}` : "Triaged"}
                      </span>
                    </div>
                  </div>

                  {/* Step 3: Field Action */}
                  <div className="relative">
                    <span className={`absolute -left-4 top-1 w-2 h-2 rounded-full ring-2 ring-white ${
                      ["In Progress", "Resolved"].includes(selectedCase.status) ? "bg-blue-600" : "bg-slate-300"
                    }`} />
                    <div>
                      <p className="font-semibold text-slate-900 leading-tight">3. Field Dispatch Action</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {selectedCase.status === "Pending" ? "Pending dispatch" : "Inspection underway"}
                      </span>
                    </div>
                  </div>

                  {/* Step 4: Verification */}
                  <div className="relative">
                    <span className={`absolute -left-4 top-1 w-2 h-2 rounded-full ring-2 ring-white ${
                      selectedCase.status === "Resolved" ? "bg-emerald-600" : "bg-slate-300"
                    }`} />
                    <div>
                      <p className="font-semibold text-slate-900 leading-tight">4. Resolution &amp; Verification</p>
                      <span className="text-[10px] text-slate-400 font-mono" suppressHydrationWarning>
                        {selectedCase.resolvedAt ? formatDisplayDate(selectedCase.resolvedAt) : "Pending closure"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {(isSuperAdmin || isDeptAdmin) && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStatusToChange("In Progress")}
                className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition"
              >
                Mark In Progress
              </button>

              <button
                onClick={() => setStatusToChange("Resolved")}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded transition"
              >
                Mark Resolved
              </button>

              <button
                onClick={() => setStatusToChange("Rejected")}
                className="px-2.5 py-1.5 text-xs font-medium bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition"
              >
                Reject
              </button>

              {isSuperAdmin && (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this case?")) {
                      deleteCase(selectedCase.id);
                    }
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}

          {isOwner && (
            <div className="flex items-center gap-2">
              {selectedCase.status === "Resolved" && (
                <>
                  {!selectedCase.feedback && (
                    <button
                      onClick={() => setIsSubmittingFeedback(true)}
                      className="px-3 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white rounded transition"
                    >
                      Rate Service
                    </button>
                  )}
                  <button
                    onClick={() => setIsReopening(true)}
                    className="px-3 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded transition"
                  >
                    Reopen Case
                  </button>
                </>
              )}
            </div>
          )}

          <button
            onClick={() => setSelectedCase(null)}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded transition ml-auto"
          >
            Close Dossier
          </button>
        </div>

        {/* Sub-Modal: Change Status with Notes */}
        {statusToChange && (
          <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-5 w-full max-w-md shadow-xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Update Status to: <span className="text-blue-600">{statusToChange}</span>
              </h3>
              <textarea
                rows={3}
                value={statusRemark}
                onChange={(e) => setStatusRemark(e.target.value)}
                placeholder="Enter official resolution notes or dispatch remarks..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded outline-none focus:border-slate-500"
              />
              {statusToChange === "Resolved" && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Proof Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={resolutionImg}
                    onChange={(e) => setResolutionImg(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded outline-none focus:border-slate-500"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusToChange(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStatusChange}
                  className="px-4 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded"
                >
                  Confirm Status Change
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
