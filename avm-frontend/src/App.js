// import React, { useEffect, useState } from "react";
// import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
// import { HelmetProvider } from "react-helmet-async";

// import LandingPage from "./pages/LandingPage";
// import Landing from "./pages/Landing";
// import ValuationForm from "./pages/ValuationForm";
// import Report from "./pages/Report";
// import ValuCheckSignup from "./pages/ValueCheckSignup";
// import ChatPage from "./pages/ChatPage";

// import Signup from "./pages/Signup";
// import Login from "./pages/Login";
// import UserDashboard from "./pages/UserDashboard";

// import ProtectedRoute from "./components/ProtectedRoute";
// import SetPassword from "./pages/SetPassword";

// import PropertyPassport from "./pages/PropertyPassport";
// import AdminDashboard from "./pages/AdminDashboard";
// import Pricing from "./pages/Pricing";
// import VerifyOtp from "./pages/VerifyOtp";
// import ForgotPassword from "./pages/ForgotPassword";
// import ValuCheckOtp from "./pages/ValuCheckOtp";
// import AuthCallback from "./pages/AuthCallBack";
// import MyReports from "./pages/MyReports";
// import Settings from "./pages/Settings";
// import CompleteProfile from "./pages/CompleteProfile";
// import AuthCallbackSignup from "./pages/AuthCallBackSignup";
// import TermsAndConditions from "./pages/TermsAndConditions";
// import BrokerScreen from './pages/BrokerScreen';

// import AdminUsersScreen from './pages/AdminUsersScreen';
// import AdminValuationsScreen from './pages/AdminValuationsScreen';
// import AdminFeedbackScreen from './pages/AdminFeedbackScreen';
// import AdminAnalyticsScreen from './pages/AdminAnalyticsScreen';
// import AdminSettingsScreen from './pages/AdminSettingsScreen';
// import BlogListScreen from "./pages/BlogListScreen";
// import BlogDetailScreen from "./pages/BlogDetailScreen";
// import AdminBlogDashboard from "./pages/AdminBlogDashboard";
// import AdminBlogEditor from "./pages/AdminBlogEditor";

// import AdminDiscountCodesScreen from './pages/AdminDiscountCodesScreen';
// import PartnerLoginScreen       from './pages/PartnerLoginScreen';
// import PartnerDashboardScreen   from './pages/PartnerDashboardScreen';
// /* ✅ ADDED: GA helpers */
// import { initGA, trackPage } from "./analytics";

// const LS_FORM_KEY = "truvalu_formData_v1";
// const LS_REPORT_KEY = "truvalu_reportData_v1";

// function safeParse(json) {
//   try {
//     return JSON.parse(json);
//   } catch {
//     return null;
//   }
// }

// /* ✅ ADDED: Page tracker (must be inside BrowserRouter) */
// function GAListener() {
//   const location = useLocation();

//   useEffect(() => {
//     // track first load + every route change
//     trackPage(location.pathname + location.search);
//   }, [location.pathname, location.search]);

//   return null;
// }

// export default function App() {
//   // ✅ persisted state (DO NOT use this to refill valuation screen UI)
//   const [persistedForm, setPersistedForm] = useState(() =>
//     safeParse(localStorage.getItem(LS_FORM_KEY))
//   );

//   const [reportData, setReportData] = useState(() =>
//     safeParse(localStorage.getItem(LS_REPORT_KEY))
//   );

//   // ✅ UI-only state for valuation screen (this is what ValuationForm will use)
//   // Start blank by default so after success it never auto-fills again.
//   const [valuationDraft, setValuationDraft] = useState(null);

//   // ✅ IMPORTANT: NEVER delete localStorage automatically
//   // Only write when we have a value
//   useEffect(() => {
//     if (persistedForm != null) {
//       localStorage.setItem(LS_FORM_KEY, JSON.stringify(persistedForm));
//     }
//   }, [persistedForm]);

//   useEffect(() => {
//     if (reportData != null) {
//       localStorage.setItem(LS_REPORT_KEY, JSON.stringify(reportData));
//     }
//   }, [reportData]);

//   // ✅ ValuationForm will call this:
//   // - setFormData(payload) => saves to localStorage (persistedForm) and can optionally keep draft
//   // - setFormData(null) => clears UI only (draft), does NOT delete localStorage
//   const setFormData = (next) => {
//     if (next == null) {
//       // clear only the UI
//       setValuationDraft(null);
//       return;
//     }
//     // update both: persist + UI (so Report flow still works instantly)
//     setPersistedForm(next);
//     setValuationDraft(next);
//   };

//   /* ✅ ADDED: Init GA once (no effect on your app logic) */
//   useEffect(() => {
//     initGA();
//   }, []);

//   return (
//      <HelmetProvider>
//     <BrowserRouter>
   
//       {/* ✅ ADDED: route-change tracking */}
//       <GAListener />

//       <Routes>
//         {/* ===================== PUBLIC ===================== */}
//          <Route path="/" element={<Landing />} />
// <Route path="/truvalu" element={<LandingPage />} />

//         {/* Valuation Flow */}
//         <Route
//           path="/valuation"
//           element={
//             <ValuationForm
//               formData={valuationDraft} // ✅ UI-only (starts blank)
//               setFormData={setFormData} // ✅ clears UI when set to null
//               setReportData={setReportData}
//             />
//           }
//         />

//         <Route path="/report" element={<Report reportData={reportData} />} />
//         <Route path="/report/check/:id" element={<Report />} />


//         {/* ValuCheck (OTP / email flow) */}
//         <Route path="/valucheck" element={<ValuCheckSignup />} />

//         {/* ===================== AUTH ===================== */}
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/set-password" element={<SetPassword />} />
//         <Route path="/pricing" element={<Pricing />} />
//         <Route path="/verify-otp" element={<VerifyOtp />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/valucheck-otp" element={<ValuCheckOtp />} />
//         <Route path="/auth/callback" element={<AuthCallback />} />
//          <Route path="/auth/callback-signup" element={<AuthCallbackSignup />} />
//         <Route path="/my-reports" element={<MyReports />} />
//         <Route path="/settings" element={<Settings/>} />

//         <Route path="/complete-profile" element={<CompleteProfile />} />
//         <Route path="/terms" element={<TermsAndConditions />} />
//           <Route path="/broker" element={<BrokerScreen />} />


// <Route path="/blogs" element={<BlogListScreen />} />
// <Route path="/blogs/detail" element={<BlogDetailScreen />} />

// <Route path="/admin/blogs" element={<AdminBlogDashboard />} />
// <Route path="/admin/blog-editor"    element={<AdminBlogEditor />} />


// <Route path="/chat" element={<ChatPage />} />



//         <Route
//           path="/passport"
//           element={
//             <ProtectedRoute>
//               <PropertyPassport />
//             </ProtectedRoute>
//           }
//         />

//         <Route path="/admin-dashboard" element={<AdminDashboard />} />

//         <Route path="/admin/users"        element={<AdminUsersScreen />} />
// <Route path="/admin/valuations"   element={<AdminValuationsScreen />} />
// <Route path="/admin/feedback"     element={<AdminFeedbackScreen />} />
// <Route path="/admin/analytics"    element={<AdminAnalyticsScreen />} />
// <Route path="/admin/settings"     element={<AdminSettingsScreen />} />
// <Route path="/admin/discount-codes" element={<AdminDiscountCodesScreen />} />
// <Route path="/partner-login"        element={<PartnerLoginScreen />} />
// <Route path="/partner-dashboard"    element={<PartnerDashboardScreen />} />

//         {/* ===================== PROTECTED ===================== */}
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <UserDashboard />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//     </HelmetProvider>
//   );
// }














import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import LandingPage from "./pages/LandingPage";
import Landing from "./pages/Landing";
import ValuationForm from "./pages/ValuationForm";
import Report from "./pages/Report";
import ValuCheckSignup from "./pages/ValueCheckSignup";
import ChatPage from "./pages/ChatPage";

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
import CompleteProfile from "./pages/CompleteProfile";
import AuthCallbackSignup from "./pages/AuthCallBackSignup";
import TermsAndConditions from "./pages/TermsAndConditions";
import BrokerScreen from './pages/BrokerScreen';

import AdminUsersScreen from './pages/AdminUsersScreen';
import AdminValuationsScreen from './pages/AdminValuationsScreen';
import AdminFeedbackScreen from './pages/AdminFeedbackScreen';
import AdminAnalyticsScreen from './pages/AdminAnalyticsScreen';
import AdminSettingsScreen from './pages/AdminSettingsScreen';
import BlogListScreen from "./pages/BlogListScreen";
import BlogDetailScreen from "./pages/BlogDetailScreen";
import AdminBlogDashboard from "./pages/AdminBlogDashboard";
import AdminBlogEditor from "./pages/AdminBlogEditor";

import AdminDiscountCodesScreen from './pages/AdminDiscountCodesScreen';
import PartnerLoginScreen       from './pages/PartnerLoginScreen';
import PartnerDashboardScreen   from './pages/PartnerDashboardScreen';
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
     <HelmetProvider>
    <BrowserRouter>
   
      {/* ✅ ADDED: route-change tracking */}
      <GAListener />

      <Routes>
        {/* ===================== PUBLIC ===================== */}
        <Route path="/" element={<ChatPage />} />
<Route path="/truvalu" element={<LandingPage />} />

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
        <Route path="/report/check/:id" element={<Report />} />


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
         <Route path="/auth/callback-signup" element={<AuthCallbackSignup />} />
        <Route path="/my-reports" element={<MyReports />} />
        <Route path="/settings" element={<Settings/>} />

        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/broker" element={<BrokerScreen />} />


<Route path="/blogs" element={<BlogListScreen />} />
<Route path="/blogs/detail" element={<BlogDetailScreen />} />

<Route path="/admin/blogs" element={<AdminBlogDashboard />} />
<Route path="/admin/blog-editor"    element={<AdminBlogEditor />} />


<Route path="/chat" element={<ChatPage />} />



        <Route
          path="/passport"
          element={
            <ProtectedRoute>
              <PropertyPassport />
            </ProtectedRoute>
          }
        />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route path="/admin/users"        element={<AdminUsersScreen />} />
<Route path="/admin/valuations"   element={<AdminValuationsScreen />} />
<Route path="/admin/feedback"     element={<AdminFeedbackScreen />} />
<Route path="/admin/analytics"    element={<AdminAnalyticsScreen />} />
<Route path="/admin/settings"     element={<AdminSettingsScreen />} />
<Route path="/admin/discount-codes" element={<AdminDiscountCodesScreen />} />
<Route path="/partner-login"        element={<PartnerLoginScreen />} />
<Route path="/partner-dashboard"    element={<PartnerDashboardScreen />} />

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
    </HelmetProvider>
  );
}
