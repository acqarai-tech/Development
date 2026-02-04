// File: avm-frontend/src/pages/ValuCheckSignup.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/valucheck.css";

const ROLES = ["Property Owner", "Investor", "Buyer", "Agent"];
const LS_FORM_KEY = "truvalu_formData_v1";

// ✅ format phone like placeholder "50 000 0000"
function formatUaePhone(value) {
  const digits = (value || "").replace(/[^\d]/g, "").slice(0, 9); // 9 digits after +971
  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

function norm(s) {
  return (s || "").trim().replace(/\s+/g, " ");
}
function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function toSqm(areaVal, unit) {
  const v = Number(areaVal || 0);
  if (!v) return 0;
  if (unit === "sq.ft") return v * 0.092903;
  return v;
}

export default function ValuCheckSignup() {
  const navigate = useNavigate();

  const [role, setRole] = useState("Investor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode] = useState("+971");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);

  // OTP step
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const cleanedPhone = useMemo(() => {
    const local = (phone || "").replace(/[^\d]/g, "");
    if (!local) return "";
    return `${countryCode}${local}`;
  }, [phone, countryCode]);

  function validate() {
    if (!role) return "Please select a role.";
    if (!name.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Please enter a valid email.";
    if (!phone.trim()) return "Please enter your phone number.";
    if ((phone || "").replace(/[^\d]/g, "").length < 7) return "Phone number looks too short.";
    if (!agree) return "Please agree to the Terms of Service and Privacy Policy.";
    return "";
  }

  async function sendOtp() {
    setStatus({ type: "", msg: "" });

    const err = validate();
    if (err) {
      setStatus({ type: "error", msg: err });
      return;
    }

    setLoading(true);
    try {
      const targetEmail = email.trim().toLowerCase();

      const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: { shouldCreateUser: true },
      });

      if (error) throw error;

      setStep("otp");
      setStatus({ type: "success", msg: "OTP sent to your email. Please enter the code." });
    } catch (ex) {
      setStatus({ type: "error", msg: ex?.message || "Could not send OTP. Please try again." });
      console.error("OTP send error:", ex);
    } finally {
      setLoading(false);
    }
  }

  // ✅ NEW: insert valuation AFTER navigate (non-blocking)
  async function insertValuationAfterNavigate({ authUserId, savedUserName }) {
    try {
      const raw = localStorage.getItem(LS_FORM_KEY);
      const form = safeParse(raw);
      if (!form) return;

      const sqm = toSqm(form.area_value, form.area_unit);

      const row = {
        user_id: authUserId,
        name: norm(savedUserName || ""),

        district: norm(form.district_name || form.area_name_en || ""),
        property_name: norm(form.property_name || form.project_reference || form.project_name_en || ""),
        building_name: norm(form.building_name || form.building_name_en || ""),
        title_deed_no: norm(form.title_deed_no || ""),
        title_deed_type: norm(form.title_deed_type || ""),
        plot_no: norm(form.plot_no || ""),

        valuation_type: norm(form.valuation_type || ""),
        valuation_type_selection: norm(form.valuation_type || ""),
        property_category: norm(form.property_category || ""),
        purpose_of_valuation: norm(form.purpose_of_valuation || ""),
        property_current_status: norm(form.property_status || ""),

        apartment_no: norm(form.apartment_no || ""),
        apartment_size: sqm ? Number(sqm) : null,
        apartment_size_unit: norm(form.area_unit || ""),
        last_renovated_on: form.last_renovated_on || null,
        floor_level: norm(form.floor_level || ""),

        furnishing_type: norm(form.furnishing || ""),
        bedroom: String(form.bedrooms ?? ""),
        bathroom: String(form.bathrooms ?? ""),
        property_type: norm(form.property_type_en || ""),
        unit: norm(form.property_name_unit || ""),

        features: Array.isArray(form.amenities) ? form.amenities : [],
      };

      const { error } = await supabase.from("valuations").insert([row]);
      if (error) throw error;
    } catch (e) {
      console.error("Valuation insert failed:", e);
    }
  }

  async function verifyOtpAndSave() {
    setStatus({ type: "", msg: "" });

    const code = (otp || "").trim();
    if (!code) {
      setStatus({ type: "error", msg: "Please enter the OTP code." });
      return;
    }

    setLoading(true);
    try {
      const targetEmail = email.trim().toLowerCase();

      // 1) Verify OTP => creates a session (authenticated user)
      const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
        email: targetEmail,
        token: code,
        type: "email",
      });
      if (verifyErr) throw verifyErr;

      const authUserId = verifyData?.user?.id || null;

      // 2) Make sure session exists (extra safety)
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        throw new Error("Session not created. Please try OTP again.");
      }

      // 3) Upsert into users table (same as you had)
      const basePayload = { role, name: name.trim(), email: targetEmail };
      const fullPayload = { ...basePayload, phone: cleanedPhone, auth_user_id: authUserId };

      async function tryUpsert(payload) {
        return await supabase.from("users").upsert([payload], { onConflict: "email" }).select().single();
      }

      let result = await tryUpsert(fullPayload);

      if (result.error) {
        const msg = (result.error.message || "").toLowerCase();
        if (msg.includes("auth_user_id") && (msg.includes("could not find") || msg.includes("does not exist"))) {
          const { auth_user_id, ...withoutAuthId } = fullPayload;
          result = await tryUpsert(withoutAuthId);
        }
      }

      if (result.error) {
        const msg = (result.error.message || "").toLowerCase();
        if (msg.includes("phone") && (msg.includes("could not find") || msg.includes("does not exist"))) {
          result = await tryUpsert(basePayload);
        }
      }

      if (result.error) throw result.error;

      setStatus({ type: "success", msg: "Verified! Generating your report..." });

      // ✅ MUST navigate first (your requirement)
      navigate("/report");

      // ✅ then save valuation in background (no UI change)
      if (authUserId) {
        insertValuationAfterNavigate({
          authUserId,
          savedUserName: result.data?.name || name.trim(),
        });
      }

      // clear
      setName("");
      setEmail("");
      setPhone("");
      setAgree(false);
      setOtp("");
    } catch (ex) {
      const message =
        ex?.message ||
        "OTP verification or saving failed. Please try again. (Check users table RLS policy)";
      setStatus({ type: "error", msg: message });
      console.error("OTP verify/save error:", ex);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (step === "form") return sendOtp();
    return verifyOtpAndSave();
  }

  function changeEmail() {
    setStep("form");
    setOtp("");
    setStatus({ type: "", msg: "" });
  }

  return (
    <div className="vcWrap">
      <div className="vcBackdrop" />

      <div className="vcModal" role="dialog" aria-modal="true" aria-label="ValuCheck Signup">
        <div className="vcPill">
          <span className="vcPillIcon">🎉</span>
          <span className="vcPillText">EARLY CUSTOMER OFFER</span>
        </div>

        <h1 className="vcTitle">Get Your Free ValuCheck™ Report</h1>
        <p className="vcSub">Limited time • No credit card required</p>

        <form className="vcForm" onSubmit={onSubmit}>
          <div className="vcRoleLabel">I AM A:</div>

          <div className="vcRoleGroup" role="tablist" aria-label="Role selection">
            {ROLES.map((r) => {
              const active = r === role;
              return (
                <button
                  key={r}
                  type="button"
                  className={`vcRoleBtn ${active ? "isActive" : ""}`}
                  onClick={() => setRole(r)}
                  aria-pressed={active}
                  disabled={step === "otp"}
                >
                  {r}
                </button>
              );
            })}
          </div>

          <div className="vcGrid2">
            <div className="vcField">
              <label className="vcLabel">FULL NAME</label>
              <input
                className="vcInput"
                placeholder="e.g. Alexander Pierce"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                disabled={step === "otp"}
              />
            </div>

            <div className="vcField">
              <label className="vcLabel">EMAIL ADDRESS</label>
              <input
                className="vcInput"
                placeholder="alex@venture.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={step === "otp"}
              />
            </div>
          </div>

          <div className="vcField vcFieldFull">
            <label className="vcLabel">PHONE NUMBER</label>
            <div className="vcPhoneRow">
              <div className="vcCountryCode" aria-hidden="true">
                {countryCode}
              </div>
              <input
                className="vcInput vcPhoneInput"
                placeholder="50 000 0000"
                value={phone}
                onChange={(e) => setPhone(formatUaePhone(e.target.value))}
                inputMode="numeric"
                autoComplete="tel"
                disabled={step === "otp"}
              />
            </div>
          </div>

          <label className="vcAgree">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              disabled={step === "otp"}
            />
            <span>
              I AGREE TO THE{" "}
              <a href="/terms" className="vcLink">
                TERMS OF SERVICE
              </a>{" "}
              AND{" "}
              <a href="/privacy" className="vcLink">
                PRIVACY POLICY
              </a>
              .
            </span>
          </label>

          {step === "otp" && (
            <div className="vcField vcFieldFull">
              <label className="vcLabel">EMAIL OTP CODE</label>
              <input
                className="vcInput"
                placeholder="Enter OTP from your email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
              />

              <div className="vcTrust" style={{ marginTop: 12, justifyContent: "space-between" }}>
                <button
                  type="button"
                  className="vcRoleBtn"
                  onClick={sendOtp}
                  disabled={loading}
                  style={{ width: "auto", padding: "10px 14px" }}
                >
                  Resend OTP
                </button>

                <button
                  type="button"
                  className="vcRoleBtn"
                  onClick={changeEmail}
                  disabled={loading}
                  style={{ width: "auto", padding: "10px 14px" }}
                >
                  Change Email
                </button>
              </div>
            </div>
          )}

          {status.msg ? (
            <div className={`vcMsg ${status.type === "error" ? "isError" : "isSuccess"}`}>
              {status.msg}
            </div>
          ) : null}

          <button className="vcCTA" type="submit" disabled={loading}>
            <span>
              {loading ? "Please wait..." : step === "form" ? "Send OTP to Email" : "Verify OTP & Get Free ValuCheck™ Report"}
            </span>
            <span className="vcArrow" aria-hidden="true">
              →
            </span>
          </button>

          <div className="vcTrust">
            <div className="vcTrustItem">
              <span className="vcTrustIcon" aria-hidden="true">
                🔒
              </span>
              <span>SSL ENCRYPTED</span>
            </div>
            <div className="vcTrustItem">
              <span className="vcTrustIcon" aria-hidden="true">
                ✅
              </span>
              <span>DLD VERIFIED DATA</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
