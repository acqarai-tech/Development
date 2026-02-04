import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const emailPattern = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password || !phone) {
      setError("Please fill in all fields.");
      return;
    }

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
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

      const { error: upsertErr } = await supabase.from("users").upsert(
        {
          id: userId,
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
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.brandRow}>
            <div style={styles.logo}>A</div>
            <div>
              <div style={styles.brand}>ACQAR</div>
              <div style={styles.subBrand}>Create your account</div>
            </div>
          </div>
          <h2 style={styles.title}>Register</h2>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrap}>
              <input
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...styles.input, paddingRight: 78 }}
                placeholder="Create a password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible((v) => !v)}
                style={styles.passToggle}
              >
                {passwordVisible ? "Hide" : "Show"}
              </button>
            </div>
            <div style={styles.hint}>Minimum 6 characters.</div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={styles.input}
              placeholder="e.g., 50XXXXXXX"
              autoComplete="tel"
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>

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

// ✅ IMPORTANT: styles object MUST exist in same file (or imported)
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    background:
      "radial-gradient(900px 500px at 20% 10%, rgba(48,117,133,0.12), transparent 60%), #f5f7fb",
  },

  container: {
    width: "100%",
    maxWidth: 460,
    padding: 22,
    backgroundColor: "white",
    borderRadius: 12,
    border: "5px solid #307585",
    boxShadow: "0 14px 34px rgba(0,0,0,0.10)",
  },

  header: { marginBottom: 12 },
  brandRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    color: "#fff",
    background: "linear-gradient(135deg, #307585, #1f5c6a)",
  },
  brand: { fontWeight: 900, letterSpacing: 0.3, color: "#0f172a", lineHeight: 1 },
  subBrand: { fontSize: 12, color: "#475569", marginTop: 2 },

  title: {
    textAlign: "center",
    color: "#333",
    fontSize: 34,
    margin: 0,
    marginTop: 6,
    marginBottom: 10,
  },

  errorBox: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14,
  },

  form: { display: "flex", flexDirection: "column" },

  field: { marginBottom: 12 },

  label: {
    fontWeight: "bold",
    color: "#1f2937",
    display: "block",
    marginBottom: 6,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 12px",
    fontSize: 16,
    border: "1px solid black",
    borderRadius: 10,
    outline: "none",
  },

  hint: { marginTop: 6, fontSize: 12, color: "#475569" },

  passwordWrap: { position: "relative" },
  passToggle: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#307585",
    fontWeight: "bold",
    userSelect: "none",
    background: "rgba(48,117,133,0.10)",
    border: "1px solid rgba(48,117,133,0.25)",
    padding: "6px 10px",
    borderRadius: 10,
  },

  button: {
    width: "80%",
    marginLeft: "10%",
    marginTop: 6,
    padding: "12px 10px",
    backgroundColor: "#002147",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
    opacity: 1,
  },

  bottomRow: { textAlign: "center", marginTop: 12 },
  bottomText: { color: "#111827" },
  link: { color: "#307585", fontWeight: "bold", textDecoration: "none" },
};
