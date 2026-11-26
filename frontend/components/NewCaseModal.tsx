"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  MapPin,
  Camera,
  Navigation,
  Check,
  Building2,
  AlertTriangle,
  RefreshCw,
  Send,
  User,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Flame,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Upload
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Department, CasePriority } from "../types";
import CivicGISMap from "./CivicGISMap";

const WARDS = [
  "Ward 04 - Malleshwaram West",
  "Ward 07 - Rajajinagar Industrial",
  "Ward 12 - Indiranagar / MG Road",
  "Ward 15 - Koramangala 4th Block",
  "Ward 19 - Whitefield Tech Zone",
  "Ward 22 - Jayanagar 7th Block",
  "Ward 28 - HSR Layout Sector 2",
];

const PRESET_HAZARD_SAMPLES = [
  {
    title: "Large Road Pothole",
    dept: "Transportation" as Department,
    desc: "Deep crater in asphalt causing two-wheeler skids and tire damage",
    priority: "High" as CasePriority,
    img: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Overflowing Garbage Dumpster",
    dept: "Sanitation" as Department,
    desc: "Commercial waste container spilling onto pedestrian footpath for 3+ days",
    priority: "Medium" as CasePriority,
    img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Burst Water Main & Pipeline Flood",
    dept: "Water Supply" as Department,
    desc: "Pressurized drinking water pipe ruptured, street flooded with clean water",
    priority: "Emergency" as CasePriority,
    img: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Loose High-Voltage Streetlight Cable",
    dept: "Electrical & Power" as Department,
    desc: "Hanging spark-prone wire near school gate following storm gusts",
    priority: "Emergency" as CasePriority,
    img: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=800",
  },
];

export default function NewCaseModal() {
  const {
    isNewCaseModalOpen,
    setIsNewCaseModalOpen,
    departments,
    createCase,
    setSelectedCase,
    currentUser,
    cases,
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [dept, setDept] = useState<Department>(
    currentUser?.role === "dept_admin" && currentUser.department
      ? currentUser.department
      : "Transportation"
  );
  const [priority, setPriority] = useState<CasePriority>("Medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ward, setWard] = useState(WARDS[2]);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({ lat: 12.9716, lng: 77.5946 });
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800",
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewCaseModalOpen) return null;

  // Auto GPS Detection
  const handleDetectLocation = () => {
    setIsDetectingGps(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
          });
          setAddress(`Geo-pin ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E`);
          setIsDetectingGps(false);
          setGpsDetected(true);
        },
        () => {
          setCoords({ lat: 12.9716, lng: 77.5946 });
          setAddress("100 Feet Road, Indiranagar, Bengaluru");
          setIsDetectingGps(false);
          setGpsDetected(true);
        },
        { timeout: 4000 }
      );
    } else {
      setCoords({ lat: 12.9716, lng: 77.5946 });
      setAddress("100 Feet Road, Indiranagar, Bengaluru");
      setIsDetectingGps(false);
      setGpsDetected(true);
    }
  };

  const handlePickLocation = (lat: number, lng: number, addr: string) => {
    setCoords({ lat, lng });
    setAddress(addr);
    setGpsDetected(true);
  };

  const handleApplyPreset = (sample: typeof PRESET_HAZARD_SAMPLES[0]) => {
    setTitle(sample.title);
    setDescription(sample.desc);
    setDept(sample.dept);
    setPriority(sample.priority);
    setImages([sample.img]);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const finalImages = [...images];
      if (imageUrl.trim() && !finalImages.includes(imageUrl.trim())) {
        finalImages.push(imageUrl.trim());
      }

      const created = createCase({
        title,
        description,
        department: dept,
        ward,
        address: address.trim() || `${ward}, Municipal Zone`,
        lat: coords.lat,
        lng: coords.lng,
        priority,
        images: finalImages,
        file: selectedFile,
      });

      setIsNewCaseModalOpen(false);
      setSelectedCase(created);
      setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nearby duplicate detection suggestion
  const nearbyComplaints = cases.filter(
    (c) => c.location.ward === ward && c.department === dept && c.status !== "Resolved"
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Breadcrumb matching Mockup */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 mb-0.5">
              Home &gt; <span className="text-blue-600 font-bold">Submit Complaint</span>
            </div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Submit a New Complaint</h3>
          </div>
          <button
            onClick={() => setIsNewCaseModalOpen(false)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper matching Mockup: 1 Details ── 2 Location ── 3 Upload ── 4 Review */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-center gap-3 sm:gap-6 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 transition ${step === 1 ? "text-blue-600" : "text-slate-500"}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step === 1 ? "bg-blue-600 text-white" : step > 1 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
            }`}>
              {step > 1 ? "✓" : "1"}
            </span>
            <span>Details</span>
          </button>
          <div className="w-6 sm:w-10 h-0.5 bg-slate-200" />
          <button
            type="button"
            onClick={() => title.trim() && setStep(2)}
            className={`flex items-center gap-2 transition ${step === 2 ? "text-blue-600" : "text-slate-500"}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step === 2 ? "bg-blue-600 text-white" : step > 2 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
            }`}>
              {step > 2 ? "✓" : "2"}
            </span>
            <span>Location</span>
          </button>
          <div className="w-6 sm:w-10 h-0.5 bg-slate-200" />
          <button
            type="button"
            onClick={() => title.trim() && setStep(3)}
            className={`flex items-center gap-2 transition ${step === 3 ? "text-blue-600" : "text-slate-500"}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step === 3 ? "bg-blue-600 text-white" : step > 3 ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
            }`}>
              {step > 3 ? "✓" : "3"}
            </span>
            <span>Upload</span>
          </button>
          <div className="w-6 sm:w-10 h-0.5 bg-slate-200" />
          <button
            type="button"
            onClick={() => title.trim() && setStep(4)}
            className={`flex items-center gap-2 transition ${step === 4 ? "text-blue-600" : "text-slate-500"}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step === 4 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
            }`}>
              4
            </span>
            <span>Review</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-6">
          {/* ================= STEP 1: GRIEVANCE DETAILS & GIS PREVIEW (SIDE BY SIDE MATCHING MOCKUP) ================= */}
          {step === 1 && (
            <div className="space-y-4">
              {/* 1-Click Hazard Presets Pill Row */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  ⚡ Quick Hazard Samples:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_HAZARD_SAMPLES.map((sample) => (
                    <button
                      key={sample.title}
                      type="button"
                      onClick={() => handleApplyPreset(sample)}
                      className="p-2 rounded-xl text-left border border-slate-200 hover:border-blue-500 hover:bg-blue-50/60 transition group text-xs"
                    >
                      <span className="font-bold text-slate-800 group-hover:text-blue-700 block truncate">
                        {sample.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{sample.dept}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Side-by-side 2-column layout matching Mockup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Left Column: Form Fields */}
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Department *
                    </label>
                    <select
                      value={dept}
                      onChange={(e) => setDept(e.target.value as Department)}
                      disabled={currentUser?.role === "dept_admin"}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 bg-white font-medium"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Water Leakage in Main Road"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Water is leaking for 2 days..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Right Column: GIS Map with Red Location Pin */}
                <div className="space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        <span>Incident Map Location</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800"
                      >
                        {isDetectingGps ? "Detecting..." : "📍 GPS"}
                      </button>
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden min-h-[220px]">
                      <CivicGISMap
                        cases={cases}
                        isPickerMode={true}
                        onPickLocation={handlePickLocation}
                        height="220px"
                        showFilters={false}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate pt-1">
                    📍 {address || "Click on map to position pin"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: INTERACTIVE GIS MAP PICKER ================= */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Civic Ward Zone *
                  </label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 bg-white font-medium"
                  >
                    {WARDS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Street Address / Landmark *
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingGps}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      {isDetectingGps ? "Detecting..." : gpsDetected ? "📍 GPS Locked" : "📍 Auto GPS"}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter landmark or click pin on the map below"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-600 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Interactive Map */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Click anywhere on the map to pin exact geo-coordinates:</span>
                  </span>
                  {coords.lat && (
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">
                      {coords.lat.toFixed(4)}°N, {coords.lng?.toFixed(4)}°E
                    </span>
                  )}
                </div>

                <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-inner">
                  <CivicGISMap
                    cases={cases}
                    isPickerMode={true}
                    onPickLocation={handlePickLocation}
                    height="280px"
                    showFilters={false}
                  />
                </div>
              </div>

              {/* Duplicate Complaint Warning if any nearby */}
              {nearbyComplaints.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Nearby Active Complaints in {ward}:</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      There are currently {nearbyComplaints.length} active issues in this ward for {dept}. Our AI duplicate detector will link your report to expedite dispatch.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 3: VISION EVIDENCE ================= */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Photo Evidence (File Attachment)
                </label>
                <div className="p-4 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer transition">
                  <Upload className="w-8 h-8 text-blue-500 mb-2" />
                  <span className="text-xs font-bold text-slate-800">
                    Choose an image file from your device
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports JPG, PNG, WEBP up to 25MB for Civic Vision AI evaluation
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const f = e.target.files[0];
                        setSelectedFile(f);
                        const previewUrl = URL.createObjectURL(f);
                        setImages([previewUrl]);
                      }
                    }}
                    className="mt-3 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Or Paste Public Image URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (imageUrl.trim() && !images.includes(imageUrl.trim())) {
                        setImages((prev) => [...prev, imageUrl.trim()]);
                        setImageUrl("");
                      }
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Preview thumbnails */}
              {images.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">
                    Attached Evidence Preview ({images.length}):
                  </span>
                  <div className="flex items-center gap-3 flex-wrap">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-28 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-2xs group"
                      >
                        <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multi-Spectral Vision AI Verification Badge */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold">Computer Vision Ready:</span>
                  <span className="text-[11px] text-emerald-700 ml-1">
                    MLCA feature enhancement & TorchScript JIT compiled weights enabled.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: REVIEW & CONFIRMATION ================= */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Review Complaint Dossier
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">{title}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      priority === "Emergency"
                        ? "bg-rose-100 text-rose-800"
                        : priority === "High"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {priority} Urgency
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{description}</p>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Department:</span>
                    <strong className="text-slate-900">{dept}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px]">Ward Location:</span>
                    <strong className="text-slate-900">{ward}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-semibold block text-[11px]">Exact Address:</span>
                    <span className="text-slate-900 font-medium">{address || "Coordinates pinned on map"}</span>
                  </div>
                </div>
              </div>

              {/* Statutory SLA Commitment */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-950">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold text-blue-900 block">
                      Statutory SLA Resolution Commitment
                    </span>
                    <span className="text-[11px] text-blue-700">
                      Standard SLA for {priority} urgency:{" "}
                      <strong>{priority === "Emergency" ? "24 Hours" : priority === "High" ? "48 Hours" : "72 Hours"}</strong>
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                  SLA Active
                </span>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsNewCaseModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                disabled={!title.trim() || !description.trim()}
                onClick={() => setStep((s) => (s + 1) as any)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Dispatching...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Authorize & Submit Dispatch
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
