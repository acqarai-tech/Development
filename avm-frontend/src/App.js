import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import ValuationForm from "./pages/ValuationForm";
import Report from "./pages/Report";
import ValuCheckSignup from "./pages/ValueCheckSignup";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import SetPassword from "./pages/SetPassword";

import PropertyPassport from "./pages/PropertyPassport";
import AdminDashboard from "./pages/AdminDashboard";
import Pricing from "./pages/Pricing";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ValuCheckOtp from "./pages/ValuCheckOtp";
import AuthCallback from "./pages/AuthCallBack";
import MyReports from "./pages/MyReports";
import Settings from "./pages/Settings";

/* ✅ ADDED: GA helpers */
import { initGA, trackPage } from "./analytics";

const LS_FORM_KEY = "truvalu_formData_v1";
const LS_REPORT_KEY = "truvalu_reportData_v1";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/* ✅ ADDED: Page tracker (must be inside BrowserRouter) */
function GAListener() {
  const location = useLocation();

  useEffect(() => {
    // track first load + every route change
    trackPage(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}

export default function App() {
  // ✅ persisted state (DO NOT use this to refill valuation screen UI)
  const [persistedForm, setPersistedForm] = useState(() =>
    safeParse(localStorage.getItem(LS_FORM_KEY))
  );

  const [reportData, setReportData] = useState(() =>
    safeParse(localStorage.getItem(LS_REPORT_KEY))
  );

  // ✅ UI-only state for valuation screen (this is what ValuationForm will use)
  // Start blank by default so after success it never auto-fills again.
  const [valuationDraft, setValuationDraft] = useState(null);

  // ✅ IMPORTANT: NEVER delete localStorage automatically
  // Only write when we have a value
  useEffect(() => {
    if (persistedForm != null) {
      localStorage.setItem(LS_FORM_KEY, JSON.stringify(persistedForm));
    }
  }, [persistedForm]);

  useEffect(() => {
    if (reportData != null) {
      localStorage.setItem(LS_REPORT_KEY, JSON.stringify(reportData));
    }
  }, [reportData]);

  // ✅ ValuationForm will call this:
  // - setFormData(payload) => saves to localStorage (persistedForm) and can optionally keep draft
  // - setFormData(null) => clears UI only (draft), does NOT delete localStorage
  const setFormData = (next) => {
    if (next == null) {
      // clear only the UI
      setValuationDraft(null);
      return;
    }
    // update both: persist + UI (so Report flow still works instantly)
    setPersistedForm(next);
    setValuationDraft(next);
  };

  /* ✅ ADDED: Init GA once (no effect on your app logic) */
  useEffect(() => {
    initGA();
  }, []);

  return (
    <BrowserRouter>
      {/* ✅ ADDED: route-change tracking */}
      <GAListener />

      <Routes>
        {/* ===================== PUBLIC ===================== */}
        <Route path="/" element={<LandingPage />} />

        {/* Valuation Flow */}
        <Route
          path="/valuation"
          element={
            <ValuationForm
              formData={valuationDraft} // ✅ UI-only (starts blank)
              setFormData={setFormData} // ✅ clears UI when set to null
              setReportData={setReportData}
            />
          }
        />

        <Route path="/report" element={<Report reportData={reportData} />} />

        {/* ValuCheck (OTP / email flow) */}
        <Route path="/valucheck" element={<ValuCheckSignup />} />

        {/* ===================== AUTH ===================== */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/valucheck-otp" element={<ValuCheckOtp />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/settings" element={<Settings/>} />



        <Route
          path="/passport"
          element={
            <ProtectedRoute>
              <PropertyPassport />
            </ProtectedRoute>
          }
        />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* ===================== PROTECTED ===================== */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
