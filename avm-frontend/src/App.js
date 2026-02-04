import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";   // ACQAR Landing
// import Home from "./pages/Home";                 // TruValu Home
import ValuationForm from "./pages/ValuationForm";
import Report from "./pages/Report";
import ValuCheckSignup from "./pages/ValueCheckSignup";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const LS_FORM_KEY = "truvalu_formData_v1";
const LS_REPORT_KEY = "truvalu_reportData_v1";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function App() {
  // ✅ Persist valuation flow state
  const [formData, setFormData] = useState(() =>
    safeParse(localStorage.getItem(LS_FORM_KEY))
  );
  const [reportData, setReportData] = useState(() =>
    safeParse(localStorage.getItem(LS_REPORT_KEY))
  );

  useEffect(() => {
    if (formData == null) localStorage.removeItem(LS_FORM_KEY);
    else localStorage.setItem(LS_FORM_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (reportData == null) localStorage.removeItem(LS_REPORT_KEY);
    else localStorage.setItem(LS_REPORT_KEY, JSON.stringify(reportData));
  }, [reportData]);

  return (
    <BrowserRouter>
      <Routes>

        {/* ===================== PUBLIC ===================== */}
        <Route path="/" element={<LandingPage />} />
        

        {/* Valuation Flow */}
        <Route
          path="/valuation"
          element={
            <ValuationForm
              formData={formData}
              setFormData={setFormData}
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
