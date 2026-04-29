// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import "./styles/global.css";
// import { loadStripe } from "@stripe/stripe-js";

// loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(<App />);










// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import "./styles/global.css";
// import { loadStripe } from "@stripe/stripe-js";
// import { PostHogProvider } from "posthog-js/react";

// loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <PostHogProvider
//     apiKey={process.env.REACT_APP_POSTHOG_KEY}
//     options={{ api_host: "https://app.posthog.com" }}
//   >
//     <App />
//   </PostHogProvider>
// );












import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { loadStripe } from "@stripe/stripe-js";
import { PostHogProvider } from "posthog-js/react";

loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <PostHogProvider
    apiKey="phc_tsbYV5ppfytmT3d5Ueya96nLQfYPhFEJ2tEcqCyokTKY"  // 👈 paste your real key here
    options={{ api_host: "https://app.posthog.com" }}
  >
    <App />
  </PostHogProvider>
);
