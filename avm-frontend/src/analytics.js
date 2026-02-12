import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-3ZRKF69290");
};

export const trackPage = (path) => {
  ReactGA.send({
    hitType: "pageview",
    page: path,
  });
};
