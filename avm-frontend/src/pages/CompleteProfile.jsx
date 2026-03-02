import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ROLES = ["Investor", "Buyer", "Seller", "Agent"];

const COUNTRY_CODES = [
  { code: "+971", label: "United Arab Emirates (+971)" },
  { code: "+1",   label: "United States (+1)" },
  { code: "+44",  label: "United Kingdom (+44)" },
  { code: "+91",  label: "India (+91)" },
  { code: "+92",  label: "Pakistan (+92)" },
  // add more as needed
];

export default function CompleteProfilePage() {
  const navigate = useNavigate();

  const [role, setRole]               = useState("Investor");
  const [name, setName]               = useState("");
  const [countryCode, setCountryCode] = useState("+971");
  const [phone, setPhone]             = useState("");
  const [agree, setAgree]             = useState(false);
  const [error, setError]             = useState(null);
  const [loading, setLoading]         = useState(false);
  const [email, setEmail] = useState("");

  useMemo(() => {
  (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  })();
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // ── Validation ──────────────────────────────────────
    if (!name.trim())  return setError("Please enter your full name.");
    if (!phone.trim()) return setError("Please enter your phone number.");
    if (!agree)        return setError("Please agree to the Terms of Service and Privacy Policy.");

    setLoading(true);
    try {
      // 1. Get the current session (Google OAuth user is already logged in)
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !session) throw new Error("Session not found. Please sign in again.");

      const user = session.user;

      // 2. Update auth metadata (optional but keeps things consistent)
      await supabase.auth.updateUser({
        data: {
          name: name.trim(),
          role,
          phone: `${countryCode}${phone.trim()}`,
        },
      });

      // 3. Upsert into your `users` table
      const { error: upsertErr } = await supabase.from("users").upsert(
        {
          id:    user.id,
          email: user.email,
          name:  name.trim(),
          role,
          phone: `${countryCode}${phone.trim()}`,
        },
        { onConflict: "id" }
      );
      if (upsertErr) throw upsertErr;

      // 4. All done → go to dashboard
      navigate("/dashboard");

    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.logoRow}>
          <div style={styles.logoBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2"  y="2"  width="8" height="8" rx="1.5" fill="#e87722" />
              <rect x="14" y="2"  width="8" height="8" rx="1.5" fill="#e87722" opacity="0.7" />
              <rect x="2"  y="14" width="8" height="8" rx="1.5" fill="#e87722" opacity="0.7" />
              <rect x="14" y="14" width="8" height="8" rx="1.5" fill="#e87722" opacity="0.4" />
            </svg>
          </div>
          <span style={styles.logoText}>ACQAR</span>
        </div>

        <h2 style={styles.title}>Complete Your Profile</h2>
        <p style={styles.sub}>
          Just a few details to personalise your ACQAR experience.
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Role selector */}
        <div style={styles.section}>
          <div style={styles.label}>I am a/an:</div>
          <div style={styles.roleRow}>
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  ...styles.roleBtn,
                  ...(r === role ? styles.roleBtnActive : {}),
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              style={styles.input}
              autoComplete="name"
            />
          </div>

          {/* Email */}
<div style={styles.field}>
  <label style={styles.label}>Email</label>
  <input
    type="email"
    value={email}
    readOnly
    style={{ ...styles.input, backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
  />
</div>

          {/* Phone */}
          <div style={styles.field}>
            <label style={styles.label}>Phone Number</label>
            <div style={styles.phoneRow}>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                style={styles.ccSelect}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="50 000 0000"
                style={styles.phoneInput}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Terms */}
          <div style={styles.termsRow}>
            <input
              id="agree"
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              style={styles.checkbox}
            />
            <label htmlFor="agree" style={styles.termsText}>
              I agree to the{" "}
              <a href="/terms" style={styles.link}>Terms of Service</a> and{" "}
              <a href="/privacy" style={styles.link}>Privacy Policy</a>,
              including the processing of my property data.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.cta,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Saving…" : "Complete Registration →"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f0eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: 20,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 480,
    boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
  },
  logoRow:  { display: "flex", alignItems: "center", gap: 10, marginBottom: 24 },
  logoBox:  {
    width: 36, height: 36, borderRadius: 9,
    background: "#fff8f3", border: "1px solid #fcd9b6",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: { fontSize: 17, fontWeight: 800, color: "#111827", letterSpacing: 2.5 },
  title: { margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: "#111827" },
  sub:   { margin: "0 0 24px", fontSize: 14, color: "#6b7280", lineHeight: 1.5 },

  errorBox: {
    marginBottom: 16,
    background: "#fff1f2", border: "1px solid #fecdd3",
    color: "#9f1239", padding: "11px 14px",
    borderRadius: 12, fontSize: 13, fontWeight: 600,
  },

  section: { marginBottom: 20 },
  label:   { display: "block", fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 8 },
  roleRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  roleBtn: {
    padding: "9px 20px", borderRadius: 10,
    border: "1px solid #d1d5db", background: "#ffffff",
    fontWeight: 600, fontSize: 14, color: "#374151",
    cursor: "pointer", fontFamily: "inherit",
  },
  roleBtnActive: {
    border: "1.5px solid #e87722",
    background: "#fff8f3", color: "#c05e10", fontWeight: 700,
  },

  field:  { marginBottom: 16 },
  input:  {
    width: "100%", boxSizing: "border-box",
    border: "1px solid #d1d5db", borderRadius: 12,
    padding: "13px 14px", fontSize: 14,
    outline: "none", background: "#ffffff",
    color: "#111827", fontFamily: "inherit",
  },

  phoneRow: { display: "flex", gap: 8 },
  ccSelect: {
    width: 170, flexShrink: 0, height: 46,
    borderRadius: 12, border: "1px solid #d1d5db",
    background: "#ffffff", fontWeight: 600,
    color: "#374151", outline: "none",
    padding: "0 10px", cursor: "pointer",
    fontSize: 13, fontFamily: "inherit",
  },
  phoneInput: {
    flex: 1, border: "1px solid #d1d5db",
    borderRadius: 12, outline: "none",
    fontSize: 14, padding: "13px 14px",
    background: "#ffffff", color: "#111827",
    fontFamily: "inherit",
  },

  termsRow: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 },
  checkbox: { width: 16, height: 16, marginTop: 2, flexShrink: 0, accentColor: "#e87722" },
  termsText:{ fontSize: 13, color: "#6b7280", fontWeight: 500, lineHeight: 1.5 },
  link:     { color: "#e87722", fontWeight: 700, textDecoration: "none" },

  cta: {
    width: "100%", border: "none", borderRadius: 12,
    padding: "15px 18px",
    background: "linear-gradient(180deg, #f09030 0%, #d96b10 100%)",
    boxShadow: "0 8px 24px rgba(217,107,16,0.32)",
    fontSize: 16, fontWeight: 800, color: "#ffffff",
    fontFamily: "inherit",
  },
};
