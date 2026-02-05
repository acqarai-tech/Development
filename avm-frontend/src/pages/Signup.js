// src/pages/RegisterPage.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function RegisterPage() {
  const navigate = useNavigate();

  // ✅ NEW (UI only): role + confirm password + terms checkbox
  const ROLES = ["Property Owner", "Investor", "Buyer", "Agent"];
  const [role, setRole] = useState("Investor");
  const [agree, setAgree] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const emailPattern = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // ✅ keep same validations + add confirm + agree + role required
    if (!role || !name || !email || !password || !confirmPassword || !phone) {
      setError("Please fill in all fields.");
      return;
    }

    if (!emailPattern.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agree) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpErr) throw signUpErr;
      if (!data?.user) throw new Error("Signup failed. Please try again.");

      const userId = data.user.id;

      // ✅ keep same upsert + include role (no other behavior change)
      const { error: upsertErr } = await supabase.from("users").upsert(
        {
          id: userId,
          role,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
        },
        { onConflict: "id" }
      );

      if (upsertErr) throw upsertErr;

      navigate("/login");
    } catch (err) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.offerPillRow}>
          
        </div>

        <h1 style={styles.h1}>
           <span style={styles.tm}>Registration</span> 
        </h1>
        

        <div style={styles.sectionLabel}>I AM A:</div>
        <div style={styles.roleRow}>
          {ROLES.map((r) => {
            const active = r === role;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={active}
                style={{
                  ...styles.roleBtn,
                  ...(active ? styles.roleBtnActive : {}),
                }}
              >
                {r}
              </button>
            );
          })}
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>FULL NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={styles.input}
                placeholder="e.g. Alexander Pierce"
                autoComplete="name"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="alex@venture.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div style={{ ...styles.grid2, marginTop: 8 }}>
            <div style={styles.field}>
              <label style={styles.label}>PASSWORD</label>
              <div style={styles.passwordWrap}>
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...styles.input, paddingRight: 86 }}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((v) => !v)}
                  style={styles.eyeBtn}
                >
                  {passwordVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>CONFIRM PASSWORD</label>
              <div style={styles.passwordWrap}>
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ ...styles.input, paddingRight: 86 }}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setConfirmPasswordVisible((v) => !v)}
                  style={styles.eyeBtn}
                >
                  {confirmPasswordVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          <div style={styles.fieldFull}>
            <label style={styles.label}>PHONE NUMBER</label>
            <div style={styles.phoneWrap}>
              <div style={styles.ccBox}>+971</div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={styles.phoneInput}
                placeholder="50 000 0000"
                autoComplete="tel"
              />
            </div>
          </div>

          <div style={styles.termsRow}>
            <input
              id="agree"
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              style={styles.checkbox}
            />
            <label htmlFor="agree" style={styles.termsText}>
              I AGREE TO THE{" "}
              <a href="/terms" style={styles.termsLink}>
                TERMS OF SERVICE
              </a>{" "}
              AND{" "}
              <a href="/privacy" style={styles.termsLink}>
                PRIVACY POLICY
              </a>
              .
            </label>
          </div>

         <button type="submit" style={styles.cta} disabled={loading}>
  <span style={styles.ctaText}>
    {loading ? "Creating..." : "Create Account"}
  </span>
</button>


          

          {/* keep existing flow */}
          <div style={styles.bottomRow}>
            <span style={styles.bottomText}>Already have an account?</span>{" "}
            <Link to="/login" style={styles.link}>
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.10)), radial-gradient(1100px 600px at 50% 15%, rgba(255,255,255,0.30), transparent 55%), #7b8794",
  },

  card: {
    width: "50%",
    maxWidth: 760,
    height:"10%",
    background: "#ffffff",
    borderRadius: 26,
    boxShadow: "0 26px 60px rgba(0,0,0,0.25)",
    padding: "34px 34px 26px",
  },

  offerPillRow: { display: "flex", justifyContent: "center", marginBottom: 14 },
  offerPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 14px",
    borderRadius: 999,
    background: "#fff2e7",
    border: "1px solid rgba(255,153,92,0.45)",
  },
  offerIcon: { fontSize: 14 },
  offerText: {
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.2,
    color: "#ff7a22",
  },

  h1: {
    margin: 0,
    textAlign: "center",
    fontSize: 44,
    fontWeight: 900,
    color: "#0b1220",
    letterSpacing: -0.6,
  },
  tm: { fontWeight: 900 },
  subTitle: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 600,
  },

  sectionLabel: {
    marginTop: 22,
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: 900,
    letterSpacing: 1.2,
  },

  roleRow: {
    marginTop: 10,
    display: "flex",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  roleBtn: {
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#334155",
    padding: "10px 16px",
    borderRadius: 999,
    fontWeight: 800,
    cursor: "pointer",
    minWidth: 130,
    boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
  },
  roleBtnActive: {
    border: "1px solid rgba(35,110,255,0.35)",
    background: "linear-gradient(180deg, #2f86ff 0%, #1246ff 100%)",
    color: "#ffffff",
    boxShadow: "0 14px 26px rgba(18,70,255,0.30)",
  },

  errorBox: {
    marginTop: 16,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    padding: 12,
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 700,
  },

  form: { marginTop: 18 },

  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },

  field: { display: "flex", flexDirection: "column" },
  fieldFull: { display: "flex", flexDirection: "column", marginTop: 14 },

  label: {
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.1,
    color: "#94a3b8",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "14px 14px",
    fontSize: 15,
    outline: "none",
    background: "#ffffff",
    boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
  },

  passwordWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.06)",
    background: "rgba(15, 23, 42, 0.04)",
    cursor: "pointer",
    fontWeight: 800,
    color: "#1f2a44",
  },

  phoneWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "10px 12px",
    background: "#ffffff",
  },
  ccBox: {
    minWidth: 54,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    fontWeight: 900,
    color: "#0b1220",
  },
  phoneInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 15,
    padding: "8px 6px",
    background: "transparent",
  },

  termsRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 14,
  },
  checkbox: { width: 16, height: 16, marginTop: 2 },
  termsText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
    lineHeight: 1.35,
  },
  termsLink: { color: "#1d4ed8", fontWeight: 900, textDecoration: "none" },

  cta: {
    marginTop: 16,
    width: "100%",
    border: "none",
    cursor: "pointer",
    borderRadius: 999,
    padding: "16px 18px",
    background: "linear-gradient(180deg, #2f86ff 0%, #1246ff 100%)",
    boxShadow: "0 18px 34px rgba(18,70,255,0.32)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    opacity: 1,
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 900,
    letterSpacing: 0.2,
  },
  ctaArrow: {
    width: 30,
    height: 30,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.18)",
    color: "#ffffff",
    fontWeight: 900,
  },

  badgesRow: {
    marginTop: 14,
    display: "flex",
    justifyContent: "center",
    gap: 22,
    flexWrap: "wrap",
  },
  badge: { display: "inline-flex", alignItems: "center", gap: 8 },
  badgeIcon: { fontSize: 14 },
  badgeText: {
    fontSize: 12,
    fontWeight: 900,
    color: "#94a3b8",
    letterSpacing: 0.6,
  },

  bottomRow: { textAlign: "center", marginTop: 14 },
  bottomText: { color: "#0b1220", fontWeight: 700 },
  link: { color: "#1d4ed8", fontWeight: 900, textDecoration: "none" },

  // ✅ responsive
  "@media(maxWidth: 760px)": {},
};
