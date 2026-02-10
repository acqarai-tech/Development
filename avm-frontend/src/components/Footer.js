import React from "react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-bg-off-white border-t border-gray-200 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
        
        {/* Brand */}
        <div className="md:col-span-3">
          <div
            className="flex items-center mb-6 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <h2 className="text-xl font-black tracking-tighter text-primary uppercase">
              ACQAR
            </h2>
          </div>

          <p className="text-xs text-primary/60 leading-relaxed mb-6">
            The world's first AI-powered property intelligence platform for Dubai real estate.
          </p>

          <div className="flex gap-4">
            <a
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-primary/40 hover:text-accent-copper hover:border-accent-copper transition-all"
              href="https://www.linkedin.com/company/acqar"
              target="_blank"
              rel="noopener noreferrer"
            >
              in
            </a>
          </div>
        </div>

        {/* Product */}
        <div className="md:col-span-2">
          <h6 className="text-primary font-bold text-sm mb-6 uppercase tracking-widest">
            Product
          </h6>
          <ul className="space-y-4 text-xs text-primary/60 font-medium">
            <li onClick={() => navigate("/")} className="cursor-pointer hover:text-accent-copper">
              TruValu™
            </li>
            <li onClick={() => navigate("/pricing")} className="cursor-pointer hover:text-accent-copper">
              ValuCheck™
            </li>
            <li onClick={() => navigate("/pricing")} className="cursor-pointer hover:text-accent-copper">
              DealLens™
            </li>
            <li onClick={() => navigate("/pricing")} className="cursor-pointer hover:text-accent-copper">
              InvestIQ™
            </li>
          </ul>
        </div>

        {/* Company */}
        <div className="md:col-span-2">
          <h6 className="text-primary font-bold text-sm mb-6 uppercase tracking-widest">
            Company
          </h6>
          <ul className="space-y-4 text-xs text-primary/60 font-medium">
            <li className="cursor-pointer hover:text-accent-copper" onClick={() => navigate("/about")}>
              About
            </li>
            <li className="cursor-pointer hover:text-accent-copper" onClick={() => navigate("/pricing")}>
              Pricing
            </li>
            <li className="cursor-pointer hover:text-accent-copper" onClick={() => navigate("/contact")}>
              Contact
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div className="md:col-span-2">
          <h6 className="text-primary font-bold text-sm mb-6 uppercase tracking-widest">
            Resources
          </h6>
          <ul className="space-y-4 text-xs text-primary/60 font-medium">
            <li className="cursor-pointer hover:text-accent-copper" onClick={() => navigate("/blog")}>
              Blog
            </li>
            <li className="cursor-pointer hover:text-accent-copper" onClick={() => navigate("/reports")}>
              Market Reports
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-200 flex justify-between items-center">
        <p className="text-[10px] font-bold text-primary/40 uppercase">
          © 2025 ACQARLABS
        </p>

        <div className="flex gap-6 text-[10px] font-bold text-primary/40 uppercase">
          <span onClick={() => navigate("/terms")} className="cursor-pointer">
            Terms
          </span>
          <span onClick={() => navigate("/privacy")} className="cursor-pointer">
            Privacy
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
