import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-3ZRKF69290");
};

export const trackPage = (path) => {
  ReactGA.send({
    hitType: "pageview",
    page: path,
    title: document.title,
  });
};

export const trackEvent = (category, action, label = "") => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
