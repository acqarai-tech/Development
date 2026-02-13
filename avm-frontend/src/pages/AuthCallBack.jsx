import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      // 1) Let Supabase read the URL and store the session
      const { data, error } = await supabase.auth.getSession();

      // If session not ready yet, wait briefly for auth event
      if (!data?.session) {
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            sub.subscription.unsubscribe();
            navigate("/dashboard", { replace: true });
          }
        });

        // fallback (if something goes wrong)
        setTimeout(() => {
          sub.subscription.unsubscribe();
          navigate("/dashboard", { replace: true });
        }, 800);

        return;
      }

      if (error) {
        console.error(error);
        navigate("/login", { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });
    })();
  }, [navigate]);

  return <div style={{ padding: 24 }}>Signing you in…</div>;
}
