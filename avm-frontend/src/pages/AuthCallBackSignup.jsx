import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallbackSignup() {
  const navigate = useNavigate();

//   useEffect(() => {
//     (async () => {
//       // 1) Get current session
//       const { data, error } = await supabase.auth.getSession();

//       // 2) If session is not ready yet, listen for auth state change
//       if (!data?.session) {
//         const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
//           if (session) {
//             sub.subscription.unsubscribe();

            
//             navigate("/complete-profile", { replace: true });
//           }
//         });

//         // fallback in case event doesn't fire
//         setTimeout(() => {
//           sub.subscription.unsubscribe();
//           navigate("/complete-profile", { replace: true });
//         }, 800);

//         return;
//       }

//       // 3) Handle errors
//       if (error) {
//         console.error(error);
//         navigate("/signup", { replace: true });
//         return;
//       }

//       // 4) Redirect to profile completion if session exists
//       navigate("/complete-profile", { replace: true });
//     })();
//   }, [navigate]);

//   return <div style={{ padding: 24 }}>Setting up your account…</div>;
// }

useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!data?.session) {
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            sub.subscription.unsubscribe();

            // ✅ ADD HERE (for delayed session)
            const provider = localStorage.getItem("signup_provider") || "google";
            localStorage.removeItem("signup_provider");
            supabase.from("users").upsert(
              {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
                provider: provider,
              },
              { onConflict: "id" }
            );

            navigate("/complete-profile", { replace: true });
          }
        });

        setTimeout(() => {
          sub.subscription.unsubscribe();
          navigate("/complete-profile", { replace: true });
        }, 800);

        return;
      }

      if (error) {
        console.error(error);
        navigate("/signup", { replace: true });
        return;
      }

      // ✅ ADD HERE (for immediate session)
      const provider = localStorage.getItem("signup_provider") || "google";
      localStorage.removeItem("signup_provider");
      await supabase.from("users").upsert(
        {
          id: data.session.user.id,
          email: data.session.user.email,
          name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || null,
          provider: provider,
        },
        { onConflict: "id" }
      );

      navigate("/complete-profile", { replace: true });
    })();
  }, [navigate]);

  return <div style={{ padding: 24 }}>Setting up your account…</div>;
}
