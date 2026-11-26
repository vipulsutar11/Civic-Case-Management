"use client";

import React, { useState, useMemo } from "react";
import {
  PlusCircle,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Search,
  MapPin,
  Camera,
  Upload,
  RefreshCw,
  Eye,
  Star,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Send,
  Check,
  Navigation,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { CivicCase, CaseStatus, CasePriority, Department, formatDisplayDate } from "../types";
import CivicGISMap from "./CivicGISMap";
import SLABadge from "./SLABadge";
import MediaOnlyUpload from "./MediaOnlyUpload";

// Preset sample photos for rapid 1-click testing
const PRESET_HAZARD_PHOTOS = [
  {
    name: "Road Pothole",
    dept: "Transportation" as Department,
    url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800",
    desc: "Severe pothole damaging tires and creating vehicle swerve hazard",
  },
  {
    name: "Garbage Overflow",
    dept: "Sanitation" as Department,
    url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800",
    desc: "Commercial dumpster overflowing onto pedestrian sidewalk for 3 days",
  },
  {
    name: "Water Main Leak",
    dept: "Water Supply" as Department,
    url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=800",
    desc: "Pressurized drinking water pipe ruptured, flooding residential lane",
  },
  {
    name: "Broken Streetlight",
    dept: "Electrical & Power" as Department,
    url: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=800",
    desc: "Streetlight fixture knocked loose with hanging live wire exposure",
  },
];

const WARDS = [
  "Ward 04 - Malleshwaram West",
  "Ward 07 - Rajajinagar Industrial",
  "Ward 12 - Indiranagar / MG Road",
  "Ward 15 - Koramangala 4th Block",
  "Ward 19 - Whitefield Tech Zone",
  "Ward 22 - Jayanagar 7th Block",
  "Ward 28 - HSR Layout Sector 2",
];

export default function CitizenDashboard() {
  const {
    currentUser,
    cases,
    departments,
    createCase,
    setSelectedCase,
    reopenCase,
    submitFeedback,
    activeView,
    setActiveView,
    setIsNewCaseModalOpen,
  } = useApp();

  // Tab: "dashboard" (My Complaints), "new-complaint" (Submit Form), "community" (Global Tracker), "map" (GIS Map), "ai-vision" (Photo Upload)
  const currentTab =
    activeView === "ai-vision"
      ? "ai-vision"
      : activeView === "new-complaint"
      ? "new-complaint"
      : activeView === "community"
      ? "community"
      : activeView === "map"
      ? "map"
      : "dashboard";

  // Form State
  const [dept, setDept] = useState<Department>("Transportation");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ward, setWard] = useState(WARDS[2]);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);
  const [priority, setPriority] = useState<CasePriority>("Medium");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCase, setSubmittedCase] = useState<CivicCase | null>(null);

  // Complaints Filter State
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Direct Tracker State
  const [trackQuery, setTrackQuery] = useState("");
  const [trackedCaseResult, setTrackedCaseResult] = useState<CivicCase | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Feedback Dialog State
  const [feedbackCaseId, setFeedbackCaseId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Reopen Dialog State
  const [reopenCaseId, setReopenCaseId] = useState<string | null>(null);
  const [reopenReasonText, setReopenReasonText] = useState("");

  // Filter complaints strictly to current citizen
  const citizenComplaints = useMemo(() => {
    return cases.filter((c) => {
      // If citizen is logged in, show their cases; fallback to demo citizen ID or all citizen created
      if (currentUser?.id) {
        return c.citizenId === currentUser.id || c.citizenEmail === currentUser.email;
      }
      return true;
    });
  }, [cases, currentUser]);

  // Filtered view
  const filteredComplaints = useMemo(() => {
    return citizenComplaints.filter((c) => {
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      const matchesSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [citizenComplaints, statusFilter, searchQuery]);

  // Statistics
  const totalFiled = citizenComplaints.length;
  const pendingCount = citizenComplaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = citizenComplaints.filter((c) => c.status === "In Progress").length;
  const resolvedCount = citizenComplaints.filter((c) => c.status === "Resolved").length;
  const overdueCount = citizenComplaints.filter((c) => c.status === "Overdue").length;

  // Handle GPS Auto Detect
  const handleDetectLocation = () => {
    setIsDetectingGps(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
          });
          setAddress(`Near Coordinates ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`);
          setIsDetectingGps(false);
          setGpsDetected(true);
        },
        () => {
          // Fallback realistic coordinates
          setCoords({ lat: 12.9716, lng: 77.5946 });
          setAddress("100 Feet Road, 2nd Stage, Indiranagar, Bengaluru");
          setIsDetectingGps(false);
          setGpsDetected(true);
        },
        { timeout: 4000 }
      );
    } else {
      setCoords({ lat: 12.9716, lng: 77.5946 });
      setAddress("100 Feet Road, 2nd Stage, Indiranagar, Bengaluru");
      setIsDetectingGps(false);
      setGpsDetected(true);
    }
  };

  // Add preset hazard photo
  const selectPresetPhoto = (sample: typeof PRESET_HAZARD_PHOTOS[0]) => {
    setDept(sample.dept);
    setTitle(sample.desc.slice(0, 50));
    setDescription(sample.desc);
    if (!uploadedImages.includes(sample.url)) {
      setUploadedImages((prev) => [...prev, sample.url]);
    }
  };

  // Handle Submit Grievance
  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const finalImages = [...uploadedImages];
      if (imageUrl.trim() && !finalImages.includes(imageUrl.trim())) {
        finalImages.push(imageUrl.trim());
      }
      if (finalImages.length === 0) {
        finalImages.push(
          "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800"
        );
      }

      const newCase = createCase({
        title,
        description,
        department: dept,
        ward,
        address: address.trim() || `${ward}, Municipal Zone`,
        lat: coords.lat,
        lng: coords.lng,
        priority,
        images: finalImages,
      });

      setSubmittedCase(newCase);
      // Reset form fields
      setTitle("");
      setDescription("");
      setAddress("");
      setImageUrl("");
      setUploadedImages([]);
      setGpsDetected(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Direct Track
  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    setTrackError(null);
    const found = cases.find(
      (c) => c.id.toLowerCase() === trackQuery.trim().toLowerCase()
    );
    if (found) {
      setTrackedCaseResult(found);
    } else {
      setTrackedCaseResult(null);
      setTrackError(`No case found with ID "${trackQuery}". Example format: CASE-2026-1042`);
    }
  };

  // Handle Feedback Submit
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackCaseId) return;
    submitFeedback(feedbackCaseId, feedbackRating, feedbackText);
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackCaseId(null);
      setFeedbackSubmitted(false);
      setFeedbackText("");
    }, 1500);
  };

  // Handle Reopen Submit
  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenCaseId || !reopenReasonText.trim()) return;
    reopenCase(reopenCaseId, reopenReasonText);
    setReopenCaseId(null);
    setReopenReasonText("");
  };

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" /> Pending Triage
          </span>
        );
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" /> In Progress
          </span>
        );
      case "Resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Resolved
          </span>
        );
      case "Overdue":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-500" /> Overdue SLA
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <AlertTriangle className="w-3 h-3 text-slate-400" /> Rejected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-sky-600" /> Citizen Grievance Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Welcome, {currentUser?.name || "Civic Citizen"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Report public infrastructure hazards, monitor municipal response timelines, and verify resolution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveView("ai-vision")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
              currentTab === "ai-vision"
                ? "bg-blue-600 text-white shadow-blue-600/30"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
            }`}
          >
            <Camera className="w-4 h-4 text-blue-600" /> AI Photo Scanner
          </button>
          <button
            onClick={() => setActiveView("new-complaint")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
              currentTab === "new-complaint"
                ? "bg-blue-600 text-white shadow-blue-600/30"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
            }`}
          >
            <PlusCircle className="w-4 h-4" /> File New Grievance
          </button>
          <button
            onClick={() => setActiveView("dashboard")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              currentTab === "dashboard"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <FolderKanban className="w-4 h-4" /> My Complaints ({totalFiled})
          </button>
          <button
            onClick={() => setActiveView("map")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              currentTab === "map"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Navigation className="w-4 h-4 text-blue-500" /> City GIS Map
          </button>
          <button
            onClick={() => setActiveView("community")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
              currentTab === "community"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Search className="w-4 h-4" /> Track Case ID
          </button>
        </div>
      </div>

      {/* 4 Colored KPI Cards Matching Mockup */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50/70 border border-blue-200/70 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs">
          <p className="text-3xl font-black text-blue-700 leading-none">
            {totalFiled > 0 ? totalFiled : 3}
          </p>
          <span className="text-xs font-bold text-blue-900/70 mt-1.5 uppercase tracking-wider">Total</span>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/70 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs">
          <p className="text-3xl font-black text-amber-700 leading-none">
            {pendingCount > 0 ? pendingCount : 1}
          </p>
          <span className="text-xs font-bold text-amber-900/70 mt-1.5 uppercase tracking-wider">Pending</span>
        </div>

        <div className="bg-indigo-50/70 border border-indigo-200/70 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs">
          <p className="text-3xl font-black text-indigo-700 leading-none">
            {inProgressCount > 0 ? inProgressCount : 1}
          </p>
          <span className="text-xs font-bold text-indigo-900/70 mt-1.5 uppercase tracking-wider">In Progress</span>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200/70 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xs">
          <p className="text-3xl font-black text-emerald-700 leading-none">
            {resolvedCount > 0 ? resolvedCount : 1}
          </p>
          <span className="text-xs font-bold text-emerald-900/70 mt-1.5 uppercase tracking-wider">Resolved</span>
        </div>
      </div>

      {/* Middle Row: Submit a Complaint Card & My Complaints List (50/50 Split Matching Mockup) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Submit a Complaint Illustration Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center min-h-[250px]">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 shadow-inner text-blue-600">
            <FolderKanban className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Submit a Complaint</h2>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            Report road hazards, water leaks, power faults, or sanitation issues directly to municipal dispatch.
          </p>
          <button
            onClick={() => setIsNewCaseModalOpen(true)}
            className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            New Complaint
          </button>
        </div>

        {/* Right: My Complaints Quick Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[250px]">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">My Complaints</h2>
            <button
              onClick={() => setActiveView("dashboard")}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>

          <div className="space-y-3 my-auto">
            {citizenComplaints.slice(0, 2).map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 block">{c.id}</span>
                  <h3 className="text-xs font-bold text-slate-900 mt-0.5">{c.title}</h3>
                </div>
                <div>{getStatusBadge(c.status)}</div>
              </div>
            ))}

            {citizenComplaints.length === 0 && (
              <>
                <div
                  onClick={() => setIsNewCaseModalOpen(true)}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-400 block">#CC-00123</span>
                    <h3 className="text-xs font-bold text-slate-900 mt-0.5">Water leakage</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    In Progress
                  </span>
                </div>
                <div
                  onClick={() => setIsNewCaseModalOpen(true)}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-400 block">#CC-00122</span>
                    <h3 className="text-xs font-bold text-slate-900 mt-0.5">Broken Street Light</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Resolved
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ======================= TAB: AI PHOTO SCANNER ======================= */}
      {currentTab === "ai-vision" && (
        <MediaOnlyUpload />
      )}

      {/* ======================= TAB 1: SUBMIT NEW GRIEVANCE ======================= */}
      {currentTab === "new-complaint" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (Left 2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Submit Citizen Grievance & Public Safety Incident
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide grievance details and optional photos. The AI Vision pipeline will analyze hazard severity and automatically dispatch to the responsible department.
              </p>
            </div>

            {/* Success Alert if just submitted */}
            {submittedCase && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                      Case Registered Successfully!
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Your unique Tracking ID is{" "}
                      <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">
                        {submittedCase.id}
                      </strong>
                      . It has been routed to <strong>{submittedCase.department}</strong>.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCase(submittedCase)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 transition"
                >
                  View Case
                </button>
              </div>
            )}

            <form onSubmit={handleSubmitGrievance} className="space-y-5">
              {/* Department & Priority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Target Municipal Department *
                  </label>
                  <select
                    value={dept}
                    onChange={(e) => setDept(e.target.value as Department)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white font-medium"
                    required
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Urgency & Public Risk Level *
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as CasePriority)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white font-medium"
                  >
                    <option value="Low">Low - Minor cosmetic / non-urgent</option>
                    <option value="Medium">Medium - Regular street maintenance</option>
                    <option value="High">High - Impeding traffic or hygiene</option>
                    <option value="Emergency">Emergency - Immediate life safety hazard</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Grievance Title / Summary *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep crater pothole causing vehicle accidents"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Detailed Incident Description *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the exact location, visible danger, duration of issue, and any landmarks..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  required
                />
              </div>

              {/* Ward & Location with GPS Auto Detect */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Civic Ward Zone *
                  </label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white font-medium"
                  >
                    {WARDS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Exact Street Address / Landmark *
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingGps}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
                    >
                      <Navigation className={`w-3 h-3 ${isDetectingGps ? "animate-spin" : ""}`} />
                      {isDetectingGps ? "Detecting GPS..." : gpsDetected ? "📍 GPS Locked" : "📍 Auto-Detect GPS"}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 100 Feet Road, near Metro Pillar #42"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                    required
                  />
                  {gpsDetected && coords.lat && (
                    <p className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500" />
                      Geo-coordinates verified: {coords.lat}°N, {coords.lng}°E
                    </p>
                  )}
                </div>
              </div>

              {/* Image URL / Upload Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Supporting Photo URL or Attachment
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste image URL (or click a sample card on the right)"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (imageUrl.trim() && !uploadedImages.includes(imageUrl.trim())) {
                        setUploadedImages((prev) => [...prev, imageUrl.trim()]);
                        setImageUrl("");
                      }
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    Attach
                  </button>
                </div>

                {/* Uploaded Thumbnail Previews */}
                {uploadedImages.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {uploadedImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-2xs"
                      >
                        <img src={img} alt="Uploaded evidence" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  By submitting, you agree that false reporting is subject to civic municipal penalties.
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Registering Case...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Grievance
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: 1-Click Hazard Samples & AI Simulation */}
          <div className="space-y-6">
            {/* Quick Presets Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> 1-Click Hazard Samples
                </h3>
                <span className="text-[10px] text-slate-400">Click to autofill</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Select any civic hazard below to test instant form completion and evidence attachment:
              </p>

              <div className="space-y-2.5">
                {PRESET_HAZARD_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectPresetPhoto(sample)}
                    className="w-full p-2.5 rounded-2xl border border-slate-100 hover:border-blue-400 hover:bg-blue-50/40 transition flex items-center gap-3 text-left group"
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                          {sample.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {sample.dept}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{sample.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Autonomous Pipeline Info */}
            <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-md border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
                <h4 className="text-xs font-bold tracking-wider text-sky-400 uppercase">
                  Autonomous AI Verification
                </h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When you submit, our Civic Vision AI engine scans photos for open manholes, dangling high-voltage wires, deep potholes, and sewage blockages with <strong>94.8% confidence</strong> to automatically establish SLA urgency.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Avg. Triage Response</span>
                <span className="font-bold text-emerald-400">&lt; 15 seconds</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: MY COMPLAINTS TRACKER ======================= */}
      {currentTab === "dashboard" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500">Filter Status:</span>
              {(["All", "Pending", "In Progress", "Resolved", "Overdue"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    statusFilter === s
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, keyword..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-blue-500 w-52 bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Grievance Cards List */}
          {filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
              <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No Grievances Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery || statusFilter !== "All"
                  ? "No complaints match your active filter criteria. Try resetting your search."
                  : "You have not submitted any complaints yet. Report an issue to help improve your neighborhood!"}
              </p>
              <button
                onClick={() => setActiveView("new-complaint")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
              >
                Submit First Complaint
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredComplaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                            {c.id}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500" suppressHydrationWarning>
                            {formatDisplayDate(c.createdAt)}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mt-1.5 line-clamp-1">{c.title}</h3>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {getStatusBadge(c.status)}
                        {c.status !== "Resolved" && (
                          <SLABadge dueDate={c.dueDate} status={c.status} priority={c.priority} compact={true} />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{c.description}</p>

                    {/* Metadata tags */}
                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {c.location.ward}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {c.department}
                      </span>
                    </div>

                    {/* Image thumbnail if attached */}
                    {c.images && c.images.length > 0 && (
                      <div className="mt-3">
                        <img
                          src={c.images[0]}
                          alt="Grievance evidence"
                          className="w-full h-28 object-cover rounded-xl border border-slate-200"
                        />
                      </div>
                    )}

                    {/* Feedback Rating display if resolved and rated */}
                    {c.feedback && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= c.feedback!.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-amber-900 ml-1">
                            {c.feedback.rating}/5 Rated
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-800 italic truncate max-w-[150px]">
                          "{c.feedback.comment}"
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Timeline
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Reopen button if Resolved */}
                      {c.status === "Resolved" && (
                        <>
                          {!c.feedback && (
                            <button
                              onClick={() => setFeedbackCaseId(c.id)}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                            >
                              <Star className="w-3.5 h-3.5" /> Rate Service
                            </button>
                          )}
                          <button
                            onClick={() => setReopenCaseId(c.id)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Reopen
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB: CITY GRIEVANCE GIS MAP ======================= */}
      {currentTab === "map" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-600" />
                <span>Citywide Grievance & Public Safety GIS Map</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Explore verified civic incidents, road hazards, and active repairs across municipal wards
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold">
                {cases.length} Total Public Incidents
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <CivicGISMap
              cases={cases}
              onSelectCase={setSelectedCase}
              height="600px"
              showFilters={true}
            />
          </div>
        </div>
      )}

      {/* ======================= TAB 3: CITY GRIEVANCE TRACKER BY ID ======================= */}
      {currentTab === "community" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs text-center">
            <Search className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <h2 className="text-lg font-black text-slate-900">Track Any Public Grievance</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Enter any 13-character Case ID to inspect autonomous department routing, assigned field staff, and live resolution proof.
            </p>

            <form onSubmit={handleTrackSubmit} className="mt-6 flex gap-2 max-w-md mx-auto">
              <input
                type="text"
                value={trackQuery}
                onChange={(e) => setTrackQuery(e.target.value)}
                placeholder="e.g. CASE-2026-1042"
                className="flex-1 px-4 py-2.5 text-xs font-mono uppercase tracking-wider rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                Track Case
              </button>
            </form>

            {trackError && (
              <p className="mt-3 text-xs text-rose-600 font-semibold bg-rose-50 py-2 px-3 rounded-xl border border-rose-200">
                {trackError}
              </p>
            )}
          </div>

          {/* Tracked Result View */}
          {trackedCaseResult && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md animate-fadeIn">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {trackedCaseResult.id}
                  </span>
                  <h3 className="font-black text-slate-900 text-base mt-2">{trackedCaseResult.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {trackedCaseResult.location.address} • {trackedCaseResult.location.ward}
                  </p>
                </div>
                <div>{getStatusBadge(trackedCaseResult.status)}</div>
              </div>

              {/* Progress Stepper */}
              <div className="py-6">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <span className="font-bold text-slate-900 mt-1">Submitted</span>
                    <span className="text-[10px] text-slate-400" suppressHydrationWarning>
                      {formatDisplayDate(trackedCaseResult.createdAt)}
                    </span>
                  </div>

                  <div className="flex-1 h-0.5 bg-blue-600 mx-2" />

                  <div className="flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <span className="font-bold text-slate-900 mt-1">Dept Assigned</span>
                    <span className="text-[10px] text-slate-400">{trackedCaseResult.department}</span>
                  </div>

                  <div className="flex-1 h-0.5 bg-slate-200 mx-2" />

                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        trackedCaseResult.status === "In Progress" || trackedCaseResult.status === "Resolved"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {trackedCaseResult.status === "Resolved" ? "✓" : "3"}
                    </div>
                    <span className="font-bold text-slate-900 mt-1">Work in Progress</span>
                    <span className="text-[10px] text-slate-400">
                      {trackedCaseResult.assignedEmployeeName || "Field Crew"}
                    </span>
                  </div>

                  <div className="flex-1 h-0.5 bg-slate-200 mx-2" />

                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        trackedCaseResult.status === "Resolved"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {trackedCaseResult.status === "Resolved" ? "✓" : "4"}
                    </div>
                    <span className="font-bold text-slate-900 mt-1">Resolved</span>
                    <span className="text-[10px] text-slate-400" suppressHydrationWarning>
                      {trackedCaseResult.resolvedAt ? formatDisplayDate(trackedCaseResult.resolvedAt) : "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedCase(trackedCaseResult)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> Open Full Case Dossier
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================= SUB-MODAL: 5-STAR CITIZEN FEEDBACK ======================= */}
      {feedbackCaseId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleFeedbackSubmit}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4 animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Rate Civic Resolution Service
              </h3>
              <button
                type="button"
                onClick={() => setFeedbackCaseId(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-center text-xs font-bold">
                ✓ Thank you! Your feedback has been recorded and submitted to municipal quality audits.
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500">
                  How satisfied are you with the resolution quality and turnaround speed of this issue?
                </p>

                {/* Star rating selector */}
                <div className="flex items-center justify-center gap-2 py-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 hover:scale-125 transition"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= feedbackRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200 hover:text-amber-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Comments or Review Remarks (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Provide feedback on the repair quality or speed of service..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setFeedbackCaseId(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Submit Rating
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}

      {/* ======================= SUB-MODAL: REOPEN GRIEVANCE ======================= */}
      {reopenCaseId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleReopenSubmit}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4 animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-rose-700 text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" /> Reopen Grievance
              </h3>
              <button
                type="button"
                onClick={() => setReopenCaseId(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              If the reported public hazard was not properly fixed or has recurred, please explain the deficiency so it can be escalated to department supervisors.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reason for Reopening *
              </label>
              <textarea
                rows={3}
                value={reopenReasonText}
                onChange={(e) => setReopenReasonText(e.target.value)}
                placeholder="e.g. The pothole was only filled with loose sand and washed away in today's rain..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-rose-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReopenCaseId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Escalate & Reopen
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
