import React from "react";
import { loadStripe } from "@stripe/stripe-js";
loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
