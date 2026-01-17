import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
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
        <Route path="/" element={<Home />} />

        <Route
          path="/valuation"
          element={<ValuationForm formData={formData} setFormData={setFormData} />}
        />

        <Route
          path="/report"
          element={
            <Report
              formData={formData}
              reportData={reportData}
              setReportData={setReportData}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
