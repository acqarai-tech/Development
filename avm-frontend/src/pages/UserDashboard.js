// src/pages/UserDashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setMsg("");

      // ✅ get authenticated user
      const { data, error: userErr } = await supabase.auth.getUser();
      if (userErr) {
        if (mounted) setMsg(userErr.message);
        return;
      }

      const user = data?.user;
      if (!user?.id) return;

      // ✅ ensure row exists in public.users (important for OAuth users)
      const { error: upsertErr } = await supabase.from("users").upsert(
        {
          id: user.id,
          email: (user.email || "").toLowerCase(),
        },
        { onConflict: "id" }
      );

      if (upsertErr) {
        if (mounted) setMsg(upsertErr.message);
        // continue anyway; maybe select still works if row exists
      }

      // ✅ now read profile row (use correct column names)
      const { data: row, error: selErr } = await supabase
        .from("users")
        .select("id, name, email, phone, created_at")
        .eq("id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (selErr) setMsg(selErr.message);

      setProfile(
        row || {
          id: user.id,
          name: null,
          email: user.email || null,
          phone: null,
          created_at: null,
        }
      );
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div style={{ padding: 24, background: "#f5f7fb", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ margin: 0 }}>User Dashboard</h2>
        <button onClick={handleLogout} style={btn}>
          Logout
        </button>
      </div>

      {msg ? <div style={msgStyle}>{msg}</div> : null}

      <div style={card}>
        <div>
          <b>Full Name:</b> {profile?.name || "-"}
        </div>
        <div>
          <b>Email:</b> {profile?.email || "-"}
        </div>
        <div>
          <b>Phone:</b> {profile?.phone || "-"}
        </div>
        <div>
          <b>User ID:</b> {profile?.id || "-"}
        </div>
      </div>
    </div>
  );
}

const btn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 700,
};

const card = {
  marginTop: 16,
  padding: 16,
  borderRadius: 14,
  border: "1px solid #e5e7eb",
  background: "#fff",
  maxWidth: 520,
  display: "grid",
  gap: 8,
};

const msgStyle = {
  marginTop: 12,
  padding: 10,
  borderRadius: 10,
  background: "#fee2e2",
  border: "1px solid #fecaca",
};
