"use client";

import React, { useEffect, useRef, useState } from "react";
import { Department, CivicCase } from "../types";
import {
  Filter,
  Layers,
  Navigation,
  Flame,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Building2,
  ChevronDown,
  Info,
  CheckCircle2,
  Activity,
} from "lucide-react";

export type CityKey = "pune" | "bengaluru" | "mumbai" | "all";

export interface CityConfig {
  id: CityKey;
  name: string;
  shortCode: string;
  corporation: string;
  state: string;
  center: [number, number];
  zoom: number;
  badgeColor: string;
  boundsCoordinates: [number, number][]; // PMC boundary perimeter polygon
  wards: string[];
}

export const CITIES: Record<CityKey, CityConfig> = {
  pune: {
    id: "pune",
    name: "Pune",
    shortCode: "PMC",
    corporation: "Pune Municipal Corporation (PMC)",
    state: "Maharashtra",
    center: [18.5204, 73.8567],
    zoom: 13,
    badgeColor: "#2563EB",
    boundsCoordinates: [
      [18.598, 73.782], // Baner / Pashan North-West
      [18.591, 73.865], // Khadki / Pune Airport North
      [18.572, 73.935], // Viman Nagar / Kharadi North-East
      [18.525, 73.948], // Hadapsar East
      [18.472, 73.912], // Kondhwa / Wanowrie South-East
      [18.441, 73.865], // Katraj South
      [18.452, 73.815], // Dhankawadi / Ambegaon South-West
      [18.498, 73.772], // Warje / Kothrud West
      [18.555, 73.762], // Pashan / Sus West
      [18.598, 73.782], // Closing loop
    ],
    wards: [
      "All PMC Wards",
      "Kothrud",
      "Shivajinagar",
      "Hadapsar",
      "Aundh-Baner",
      "Kasba Peth",
      "Viman Nagar",
      "Sinhagad Road",
      "Bhavani Peth",
      "Dhankawadi",
    ],
  },
  bengaluru: {
    id: "bengaluru",
    name: "Bengaluru",
    shortCode: "BBMP",
    corporation: "Bruhat Bengaluru Mahanagara Palike (BBMP)",
    state: "Karnataka",
    center: [12.9716, 77.5946],
    zoom: 12,
    badgeColor: "#059669",
    boundsCoordinates: [
      [13.060, 77.520],
      [13.060, 77.670],
      [12.900, 77.690],
      [12.880, 77.550],
      [13.060, 77.520],
    ],
    wards: [
      "All BBMP Wards",
      "Indiranagar",
      "Malleshwaram",
      "BTM Layout",
      "Koramangala",
      "Jayanagar",
      "Whitefield",
    ],
  },
  mumbai: {
    id: "mumbai",
    name: "Mumbai",
    shortCode: "BMC",
    corporation: "Brihanmumbai Municipal Corporation (BMC)",
    state: "Maharashtra",
    center: [19.0760, 72.8777],
    zoom: 12,
    badgeColor: "#D97706",
    boundsCoordinates: [
      [19.240, 72.820],
      [19.190, 72.940],
      [18.910, 72.820],
      [18.990, 72.800],
      [19.240, 72.820],
    ],
    wards: [
      "All BMC Wards",
      "Andheri",
      "Bandra",
      "Colaba",
      "Dadar",
      "Kurla",
      "Borivali",
    ],
  },
  all: {
    id: "all",
    name: "All Cities",
    shortCode: "ALL",
    corporation: "National Multi-City Municipal View",
    state: "India",
    center: [15.8, 75.8],
    zoom: 6,
    badgeColor: "#475569",
    boundsCoordinates: [],
    wards: ["All Wards"],
  },
};

interface CivicGISMapProps {
  cases: CivicCase[];
  onSelectCase?: (caseItem: CivicCase) => void;
  selectedCaseId?: string;
  isPickerMode?: boolean;
  onPickLocation?: (lat: number, lng: number, address: string) => void;
  height?: string;
  showFilters?: boolean;
  initialCity?: CityKey;
}

export default function CivicGISMap({
  cases,
  onSelectCase,
  selectedCaseId,
  isPickerMode = false,
  onPickLocation,
  height = "520px",
  showFilters = true,
  initialCity = "all",
}: CivicGISMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const hotspotsLayerRef = useRef<any>(null);
  const boundaryLayerRef = useRef<any>(null);
  const pickerMarkerRef = useRef<any>(null);

  const [selectedCity, setSelectedCity] = useState<CityKey>(initialCity);
  const [selectedDept, setSelectedDept] = useState<Department | "ALL">("ALL");
  const [selectedWard, setSelectedWard] = useState<string>("All PMC Wards");
  const [showHotspots, setShowHotspots] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);
  const [mapStyle, setMapStyle] = useState<"street" | "satellite">("satellite");
  const [mapLoaded, setMapLoaded] = useState(false);
  const tileLayerRef = useRef<any>(null);

  const currentCityConfig = CITIES[selectedCity];

  // 1. City-wise filtering of live registered cases
  const cityCases = cases.filter((c) => {
    const lat = c.location?.lat;
    const lng = c.location?.lng;
    if (!lat || !lng) return false;

    if (selectedCity === "pune") {
      const inPuneCoords = lat >= 18.35 && lat <= 18.70 && lng >= 73.65 && lng <= 74.05;
      const inPuneText =
        c.location.ward?.toLowerCase().includes("pune") ||
        c.location.address?.toLowerCase().includes("pune") ||
        c.id.includes("PMC");
      return inPuneCoords || inPuneText;
    }
    if (selectedCity === "bengaluru") {
      const inBlrCoords = lat >= 12.80 && lat <= 13.20 && lng >= 77.40 && lng <= 77.80;
      const inBlrText =
        c.location.ward?.toLowerCase().includes("indiranagar") ||
        c.location.ward?.toLowerCase().includes("malleshwaram") ||
        c.location.address?.toLowerCase().includes("bengaluru");
      return inBlrCoords || inBlrText;
    }
    if (selectedCity === "mumbai") {
      const inMumCoords = lat >= 18.85 && lat <= 19.35 && lng >= 72.70 && lng <= 73.15;
      const inMumText =
        c.location.ward?.toLowerCase().includes("mumbai") ||
        c.location.address?.toLowerCase().includes("mumbai");
      return inMumCoords || inMumText;
    }
    return true; // All cities
  });

  // 2. Department & Ward filtering
  const filteredCases = cityCases.filter((c) => {
    if (selectedDept !== "ALL" && c.department !== selectedDept) return false;
    if (selectedWard && !selectedWard.startsWith("All") && !c.location.ward?.includes(selectedWard)) {
      return false;
    }
    return true;
  });

  // Summary statistics for current city view
  const emergencyCount = cityCases.filter((c) => c.priority === "Emergency").length;
  const inProgressCount = cityCases.filter((c) => c.status === "In Progress").length;

  // Initialize Leaflet map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const container = mapContainerRef.current as any;
      if (container._leaflet_id) {
        return;
      }

      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current || container._leaflet_id) return;

      const map = L.map(container, {
        center: currentCityConfig.center,
        zoom: currentCityConfig.zoom,
        zoomControl: true,
        attributionControl: false,
      });

      // Public OpenStreetMap tiles (default Street view)
      tileLayerRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      boundaryLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
      hotspotsLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      if (isPickerMode) {
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          if (pickerMarkerRef.current) {
            pickerMarkerRef.current.setLatLng([lat, lng]);
          } else {
            const pickerIcon = L.divIcon({
              className: "custom-picker-pin",
              html: `
                <div style="background-color: #2563EB; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 8px 16px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
              `,
              iconSize: [34, 34],
              iconAnchor: [17, 34],
            });
            pickerMarkerRef.current = L.marker([lat, lng], { icon: pickerIcon }).addTo(map);
          }
          if (onPickLocation) {
            const wardGuess = selectedCity === "pune" ? "PMC Pune Ward" : "Municipal Jurisdiction";
            onPickLocation(
              Number(lat.toFixed(5)),
              Number(lng.toFixed(5)),
              `${currentCityConfig.shortCode} Geo: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (${wardGuess})`
            );
          }
        });
      }

      if (isMounted) setMapLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }
    };
  }, []);

  // Handle City Change (Pan & Boundary Drawing)
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !boundaryLayerRef.current) return;
    const L = (window as any).L || require("leaflet");

    const targetConfig = CITIES[selectedCity];
    mapInstanceRef.current.flyTo(targetConfig.center, targetConfig.zoom, {
      duration: 1.4,
      easeLinearity: 0.25,
    });

    // Draw municipal corporation boundary polygon
    boundaryLayerRef.current.clearLayers();
    if (showBoundary && targetConfig.boundsCoordinates.length > 0) {
      const boundaryPoly = L.polygon(targetConfig.boundsCoordinates, {
        color: targetConfig.badgeColor,
        weight: 2.5,
        dashArray: "6, 6",
        fillColor: targetConfig.badgeColor,
        fillOpacity: 0.05,
      }).addTo(boundaryLayerRef.current);

      boundaryPoly.bindTooltip(
        `<div style="font-weight: 800; font-size: 11px; color: ${targetConfig.badgeColor};">🏛️ ${targetConfig.corporation} Boundary</div>`,
        { sticky: true, className: "pmc-boundary-tooltip" }
      );
    }
  }, [selectedCity, mapLoaded, showBoundary]);

  // Switch between Street and Satellite tile layers
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    const L = (window as any).L || require("leaflet");
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl =
      mapStyle === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
    }).addTo(map);
  }, [mapStyle, mapLoaded]);

  // Update Markers and Hotspots
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !markersLayerRef.current) return;
    const L = (window as any).L || require("leaflet");

    markersLayerRef.current.clearLayers();
    if (hotspotsLayerRef.current) hotspotsLayerRef.current.clearLayers();

    const bounds: [number, number][] = [];

    // Helper for department pin colors
    const getPinColor = (dept: Department, priority: string) => {
      if (priority === "Emergency") return "#DC2626"; // Crimson Pulse
      switch (dept) {
        case "Water Supply":
          return "#0284C7"; // Ocean Sky
        case "Transportation":
          return "#EA580C"; // Amber Orange
        case "Sanitation":
          return "#16A34A"; // Emerald Green
        case "Electrical & Power":
          return "#9333EA"; // Electric Purple
        case "Fire Department":
          return "#EF4444"; // Fire Red
        case "Public Works":
          return "#4F46E5"; // Indigo
        default:
          return "#2563EB";
      }
    };

    filteredCases.forEach((c) => {
      const lat = c.location?.lat;
      const lng = c.location?.lng;
      if (!lat || !lng) return;

      bounds.push([lat, lng]);
      const color = getPinColor(c.department, c.priority);
      const isSelected = selectedCaseId === c.id;
      const isEmergency = c.priority === "Emergency";

      // SVG Marker DivIcon
      const iconHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${
            isEmergency
              ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background-color: rgba(220, 38, 38, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
              : ""
          }
          <div style="
            background: linear-gradient(135deg, ${color}, #0F172A);
            width: ${isSelected ? "38px" : "32px"};
            height: ${isSelected ? "38px" : "32px"};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          ">
            <div style="transform: rotate(45deg); color: white; font-size: 11px; font-weight: 800;">
              ${isEmergency ? "!" : c.id.slice(-2)}
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: `case-pin-${c.id}`,
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 34],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Interactive Dossier Popup
      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; min-width: 220px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 800; font-size: 11px; color: ${color}; text-transform: uppercase;">${c.department}</span>
            <span style="background: ${isEmergency ? '#FEE2E2' : '#F1F5F9'}; color: ${isEmergency ? '#DC2626' : '#334155'}; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
              ${c.priority}
            </span>
          </div>
          <div style="font-weight: 700; color: #0F172A; margin-bottom: 4px; font-size: 12px;">${c.title}</div>
          <div style="color: #64748B; font-size: 11px; margin-bottom: 4px;">📍 ${c.location.address || c.location.ward}</div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #E2E8F0; padding-top: 6px; margin-top: 6px;">
            <span style="font-size: 10px; color: #64748B;">Status: <b style="color: #0F172A;">${c.status}</b></span>
            <button id="view-case-btn-${c.id}" style="background: #2563EB; color: white; border: none; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; cursor: pointer;">
              Open Dossier &rarr;
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on("popupopen", () => {
        const btn = document.getElementById(`view-case-btn-${c.id}`);
        if (btn && onSelectCase) {
          btn.onclick = () => onSelectCase(c);
        }
      });

      markersLayerRef.current.addLayer(marker);

      // Render recurring complaint hotspot circles
      if (showHotspots && hotspotsLayerRef.current) {
        L.circle([lat, lng], {
          radius: isEmergency ? 400 : 220,
          color: color,
          fillColor: color,
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: "4, 6",
        }).addTo(hotspotsLayerRef.current);
      }
    });
  }, [filteredCases, mapLoaded, showHotspots, selectedCaseId]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
      {/* Top Multi-City & Department Control Bar */}
      {showFilters && (
        <div className="absolute top-3 left-3 right-3 z-10 flex flex-col gap-2 pointer-events-none">
          {/* Row 1: City Selector Dropdown + Live City Stats */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* City Selector Pill */}
            <div className="flex items-center gap-2 p-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm pointer-events-auto">
              <div className="flex items-center gap-1.5 px-2 text-xs font-black text-slate-800">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Municipal Corporation:</span>
              </div>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    const newCity = e.target.value as CityKey;
                    setSelectedCity(newCity);
                    setSelectedWard(CITIES[newCity].wards[0]);
                  }}
                  className="appearance-none bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-black py-1.5 pl-3 pr-8 rounded-lg cursor-pointer outline-none transition"
                >
                  <option value="pune">🏛️ Pune (PMC)</option>
                  <option value="bengaluru">🏙️ Bengaluru (BBMP)</option>
                  <option value="mumbai">🌆 Mumbai (BMC)</option>
                  <option value="all">🗺️ All Municipalities</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-blue-700 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Boundary Polygon Toggle */}
              <button
                onClick={() => setShowBoundary(!showBoundary)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  showBoundary
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {currentCityConfig.shortCode} Boundary
              </button>

              {/* Street / Satellite View Toggle */}
              <button
                onClick={() => setMapStyle((prev) => (prev === "street" ? "satellite" : "street"))}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  mapStyle === "satellite"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                {mapStyle === "satellite" ? "Satellite View" : "Street View"}
              </button>
            </div>

            {/* City Live Incident Ticker */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 text-white backdrop-blur-md rounded-xl border border-slate-700 shadow-sm pointer-events-auto text-xs font-bold">
              <span className="flex items-center gap-1 text-emerald-400 pl-1">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                Live {currentCityConfig.shortCode}: {cityCases.length} Cases
              </span>
              {emergencyCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-red-500/30 text-red-300 border border-red-500/50 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-400" />
                  {emergencyCount} Emergency
                </span>
              )}
              <button
                onClick={() => setShowHotspots(!showHotspots)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                  showHotspots ? "bg-amber-400/20 text-amber-300 border border-amber-400/40" : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3 h-3" />
                Hotspots
              </button>
            </div>
          </div>

          {/* Row 2: Department Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm pointer-events-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedDept("ALL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                selectedDept === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              All Depts ({cityCases.length})
            </button>
            {(["Water Supply", "Sanitation", "Transportation", "Electrical & Power", "Fire Department", "Public Works"] as Department[]).map(
              (dept) => {
                const count = cityCases.filter((c) => c.department === dept).length;
                return (
                  <button
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1 ${
                      selectedDept === dept
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span>{dept}</span>
                    {count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedDept === dept ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>

          {/* Row 3: PMC Ward Quick Selector */}
          {selectedCity === "pune" && (
            <div className="flex items-center gap-1 p-1 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-xs pointer-events-auto overflow-x-auto max-w-full text-xs">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2">PMC Wards:</span>
              {currentCityConfig.wards.map((ward) => {
                const isSelected = selectedWard === ward;
                const wardCasesCount =
                  ward === "All PMC Wards"
                    ? cityCases.length
                    : cityCases.filter((c) => c.location.ward?.includes(ward)).length;
                return (
                  <button
                    key={ward}
                    onClick={() => setSelectedWard(ward)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                      isSelected
                        ? "bg-blue-100 text-blue-900 border border-blue-300"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {ward} {wardCasesCount > 0 && `(${wardCasesCount})`}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Compact Street / Satellite Toggle when top filter bar is hidden */}
      {!showFilters && (
        <button
          type="button"
          onClick={() => setMapStyle((prev) => (prev === "street" ? "satellite" : "street"))}
          className={`absolute top-3 right-3 z-10 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-md transition flex items-center gap-1.5 backdrop-blur-md ${
            mapStyle === "satellite"
              ? "bg-indigo-600/95 text-white border border-indigo-400"
              : "bg-white/95 text-slate-800 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          {mapStyle === "satellite" ? "Satellite View" : "Street View"}
        </button>
      )}

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height: height, width: "100%" }} className="z-0 bg-slate-100" />

      {/* Picker Mode Instruction Bar */}
      {isPickerMode && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-slate-900/90 text-white rounded-full text-xs font-bold flex items-center gap-2 shadow-xl backdrop-blur-md">
          <Navigation className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          Click anywhere in {currentCityConfig.name} to pin incident GPS coordinates
        </div>
      )}
    </div>
  );
}
