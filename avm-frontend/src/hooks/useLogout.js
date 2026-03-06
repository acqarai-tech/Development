// src/hooks/useLogout.js
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function useLogout() {
  const navigate = useNavigate();

  async function logout() {
    // 1. Clear app-specific keys
    localStorage.removeItem("admin_auth");

    // 2. Clear any Supabase sb-*-auth-token keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
        localStorage.removeItem(key);
      }
    });

    // 3. Sign out from Supabase (won't throw silently)
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("supabase.auth.signOut error (ignored):", err?.message);
    }

    // 4. Navigate and replace history so back button can't return to dashboard
    navigate("/login", { replace: true });
  }

  return logout;
}
