import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const current = location.pathname;

  const navItems = [
    { label: "Products", path: "/" },
    { label: "Pricing", path: "/pricing" },
    { label: "Resources", path: "/resources" },
    { label: "About", path: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D4D4D4] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <div
          className="flex items-center cursor-pointer shrink-0"
          onClick={() => navigate("/")}
        >
          <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-[#2B2B2B] uppercase">
            ACQAR
          </h1>
        </div>

        {/* Mobile pricing */}
        <button
          onClick={() => navigate("/pricing")}
          className={`md:hidden text-[10px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-full ${
            current === "/pricing"
              ? "text-[#B87333] underline underline-offset-4"
              : "text-[#2B2B2B]/70"
          }`}
        >
          Pricing
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] ${
                current === item.path ? "text-[#B87333]" : "text-[#2B2B2B]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right buttons */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={() => navigate("/login")}
            className="hidden sm:block text-sm font-bold px-4 py-2 text-[#2B2B2B] hover:text-[#B87333]"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate("/valuation")}
            className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
          >
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
