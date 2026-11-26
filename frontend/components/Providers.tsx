"use client";

import React from "react";
import { AppProvider } from "../context/AppContext";
import CaseDetailModal from "./CaseDetailModal";
import AuthModal from "./AuthModal";
import NewCaseModal from "./NewCaseModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      {children}
      <CaseDetailModal />
      <AuthModal />
      <NewCaseModal />
    </AppProvider>
  );
}
