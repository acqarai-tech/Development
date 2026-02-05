import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function SetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    (async () => {
      // User must arrive via the email link (Supabase creates a session)
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        setMsg({ type: "error", text: "Invalid or expired link. Please open the latest email link again." });
      }
    })();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (password.length < 8) {
      setMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (password !== confirm) {
      setMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    try {
      setLoading(true);

      const { data: ses } = await supabase.auth.getSession();
      if (!ses?.session) {
        setMsg({ type: "error", text: "Session expired. Please open the email link again." });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMsg({ type: "success", text: "Password registered. Congratulations!" });

      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Failed to set password." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "50px auto", padding: 16 }}>
      <h2>Set Password</h2>
      <p style={{ opacity: 0.75, marginTop: 6 }}>
        Create a password to access your account.
      </p>

      {msg.text ? (
        <div style={{ padding: 10, border: "1px solid #ddd", borderRadius: 10, marginTop: 12 }}>
          <b>{msg.type === "error" ? "Error: " : "Success: "}</b>{msg.text}
        </div>
      ) : null}

      <form onSubmit={onSubmit} style={{ marginTop: 14 }}>
        <label style={{ display: "block", marginTop: 10 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 11, borderRadius: 10, border: "1px solid #ccc" }}
        />

        <label style={{ display: "block", marginTop: 10 }}>Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={{ width: "100%", padding: 11, borderRadius: 10, border: "1px solid #ccc" }}
        />

        <button
          type="submit"
          disabled={loading || msg.type === "error"}
          style={{ width: "100%", marginTop: 16, padding: 12, borderRadius: 12, border: "none", cursor: "pointer" }}
        >
          {loading ? "Saving..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
