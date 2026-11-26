import type { Metadata } from "next";
import Providers from "../components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicCare Operations Platform | Pune Municipal Corporation",
  description: "Enterprise Municipal Grievance & Dispatch Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Tailwind CSS Browser Engine - React 19 hoisted script */}
        <script src="https://cdn.tailwindcss.com" async></script>
        {/* Leaflet CSS for Interactive Municipal GIS Map */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-full bg-[#F8F9FA] text-slate-900 antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
