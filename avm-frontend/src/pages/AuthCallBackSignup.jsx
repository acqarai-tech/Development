// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// export default function AuthCallbackSignup() {
//   const navigate = useNavigate();

// //   useEffect(() => {
// //     (async () => {
// //       // 1) Get current session
// //       const { data, error } = await supabase.auth.getSession();

// //       // 2) If session is not ready yet, listen for auth state change
// //       if (!data?.session) {
// //         const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
// //           if (session) {
// //             sub.subscription.unsubscribe();

            
// //             navigate("/complete-profile", { replace: true });
// //           }
// //         });

// //         // fallback in case event doesn't fire
// //         setTimeout(() => {
// //           sub.subscription.unsubscribe();
// //           navigate("/complete-profile", { replace: true });
// //         }, 800);

// //         return;
// //       }

// //       // 3) Handle errors
// //       if (error) {
// //         console.error(error);
// //         navigate("/signup", { replace: true });
// //         return;
// //       }

// //       // 4) Redirect to profile completion if session exists
// //       navigate("/complete-profile", { replace: true });
// //     })();
// //   }, [navigate]);

// //   return <div style={{ padding: 24 }}>Setting up your account…</div>;
// // }

// useEffect(() => {
//     (async () => {
//       const { data, error } = await supabase.auth.getSession();

//       if (!data?.session) {
//         const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
//           if (session) {
//             sub.subscription.unsubscribe();

//             // ✅ ADD HERE (for delayed session)
//             const provider = localStorage.getItem("signup_provider") || "google";
//             localStorage.removeItem("signup_provider");
//             supabase.from("users").upsert(
//               {
//                 id: session.user.id,
//                 email: session.user.email,
//                 name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
//                 provider: provider,
//               },
//               { onConflict: "id" }
//             );

//             navigate("/complete-profile", { replace: true });
//           }
//         });

//         setTimeout(() => {
//           sub.subscription.unsubscribe();
//           navigate("/complete-profile", { replace: true });
//         }, 800);

//         return;
//       }

//       if (error) {
//         console.error(error);
//         navigate("/signup", { replace: true });
//         return;
//       }

//       // ✅ ADD HERE (for immediate session)
//       const provider = localStorage.getItem("signup_provider") || "google";
//       localStorage.removeItem("signup_provider");
//       await supabase.from("users").upsert(
//         {
//           id: data.session.user.id,
//           email: data.session.user.email,
//           name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || null,
//           provider: provider,
//         },
//         { onConflict: "id" }
//       );

//       navigate("/complete-profile", { replace: true });
//     })();
//   }, [navigate]);

//   return <div style={{ padding: 24 }}>Setting up your account…</div>;
// }















// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// export default function AuthCallbackSignup() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     (async () => {
//       const { data, error } = await supabase.auth.getSession();

//       if (error) {
//         console.error(error);
//         navigate("/signup", { replace: true });
//         return;
//       }

//       if (!data?.session) {
//         const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
//           if (session) {
//             sub.subscription.unsubscribe();
//             handleSession(session, navigate);
//           }
//         });
//         setTimeout(() => {
//           sub.subscription.unsubscribe();
//           navigate("/signup", { replace: true });
//         }, 3000);
//         return;
//       }

//       handleSession(data.session, navigate);
//     })();
//   }, [navigate]);

//   return <div style={{ padding: 24 }}>Setting up your account…</div>;
// }

// async function handleSession(session, navigate) {
//   const userId = session.user.id;
//   const email = session.user.email;
//   const name =
//     session.user.user_metadata?.full_name ||
//     session.user.user_metadata?.name ||
//     null;

//   // Check if user already exists with a completed profile
//   const { data: existingUser } = await supabase
//     .from("users")
//     .select("id, role, name")
//     .eq("id", userId)
//     .single();

//   // If user exists and has a role = profile is complete → go to dashboard
// if (existingUser?.role) {
//     const pendingQuery = sessionStorage.getItem("acqar_pending_query");
//     if (pendingQuery) {
//       navigate("/", { replace: true });
//     } else {
//       navigate("/dashboard", { replace: true });
//     }
//     return;
//   }

//   // New user or incomplete profile → upsert basic info and go to complete-profile
//   await supabase.from("users").upsert(
//     {
//       id: userId,
//       email,
//       name,
//       provider: "google",
//     },
//     { onConflict: "id" }
//   );

//   localStorage.removeItem("signup_provider");
//   navigate("/complete-profile", { replace: true });
// }
















import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallbackSignup() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        navigate("/signup", { replace: true });
        return;
      }

      if (!data?.session) {
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            sub.subscription.unsubscribe();
            handleSession(session, navigate);
          }
        });
        setTimeout(() => {
          sub.subscription.unsubscribe();
          navigate("/signup", { replace: true });
        }, 3000);
        return;
      }

      handleSession(data.session, navigate);
    })();
  }, [navigate]);

  return <div style={{ padding: 24 }}>Setting up your account…</div>;
}

async function handleSession(session, navigate) {
  const userId = session.user.id;
  const email = session.user.email;
  const name =
    session.user.user_metadata?.full_name ||
    session.user.user_metadata?.name ||
    null;

  // Check if user already exists with a completed profile
  const { data: existingUser } = await supabase
    .from("users")
    .select("id, role, name")
    .eq("id", userId)
    .single();

  // If user exists and has a role = profile is complete → go to dashboard
if (existingUser?.role) {
    const pendingQuery = sessionStorage.getItem("acqar_pending_query");
    const chatPending = sessionStorage.getItem("acqar_chat_pending");
    if (chatPending) {
      navigate("/chat", { replace: true });
    } else if (pendingQuery) {
      navigate("/", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
    return;
  }

  // New user or incomplete profile → upsert basic info and go to complete-profile
  await supabase.from("users").upsert(
    {
      id: userId,
      email,
      name,
      provider: "google",
    },
    { onConflict: "id" }
  );

  localStorage.removeItem("signup_provider");
  navigate("/complete-profile", { replace: true });
}
