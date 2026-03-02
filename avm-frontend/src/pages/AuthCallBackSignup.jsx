import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallbackSignup() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      // 1) Get current session
      const { data, error } = await supabase.auth.getSession();

      // 2) If session is not ready yet, listen for auth state change
      if (!data?.session) {
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            sub.subscription.unsubscribe();
            navigate("/complete-profile", { replace: true });
          }
        });

        // fallback in case event doesn't fire
        setTimeout(() => {
          sub.subscription.unsubscribe();
          navigate("/complete-profile", { replace: true });
        }, 800);

        return;
      }

      // 3) Handle errors
      if (error) {
        console.error(error);
        navigate("/signup", { replace: true });
        return;
      }

      // 4) Redirect to profile completion if session exists
      navigate("/complete-profile", { replace: true });
    })();
  }, [navigate]);

  return <div style={{ padding: 24 }}>Setting up your account…</div>;
}