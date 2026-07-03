// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import "./styles/global.css";
// import { loadStripe } from "@stripe/stripe-js";

// loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(<App />);









import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import { loadStripe } from "@stripe/stripe-js";
import posthog from "posthog-js";

posthog.init("phc_tsbYV5ppfytmT3d5Ueya96nLQfYPhFEJ2tEcqCyokTKY", {
  api_host: "https://app.posthog.com",
  capture_pageview: false,   // we handle this manually via PostHogPageTracker
  capture_pageleave: true,
});

loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);




