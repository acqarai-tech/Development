import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ValuationForm from "./pages/ValuationForm";
import Report from "./pages/Report";

export default function App() {
  // Shared state across pages
  const [formData, setFormData] = useState(null);
  const [reportData, setReportData] = useState(null);

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
          element={<Report formData={formData} reportData={reportData} setReportData={setReportData} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
