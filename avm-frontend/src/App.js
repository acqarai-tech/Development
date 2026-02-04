import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";  // NEW: ACQAR Landing Page
import Home from "./pages/Home";                  // EXISTING: TruValu Home (moved to /home)
import ValuationForm from "./pages/ValuationForm";
import Report from "./pages/Report";

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
  // ✅ Load saved state so /valuation and /report work independently (refresh/direct open)
  const [formData, setFormData] = useState(() => safeParse(localStorage.getItem(LS_FORM_KEY)));
  const [reportData, setReportData] = useState(() => safeParse(localStorage.getItem(LS_REPORT_KEY)));

  // ✅ Persist whenever state changes
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
        {/* NEW: ACQAR Landing Page at root */}
        <Route path="/" element={<LandingPage />} />
        
        {/* MOVED: TruValu Home to /home */}
        <Route path="/home" element={<Home />} />
        
        {/* UNCHANGED: Existing valuation and report routes */}
        <Route
          path="/valuation"
          element={<ValuationForm formData={formData} setFormData={setFormData} setReportData={setReportData} />}
        />
        <Route path="/report" element={<Report reportData={reportData} />} />
      </Routes>

             <Routes>
        
        <Route path="/valucheck" element={<ValuCheckSignup />} />
      </Routes>
    </BrowserRouter>
  );
}
