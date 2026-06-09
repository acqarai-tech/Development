// import { useState, useEffect, useRef } from "react";
// import AcqarAIChat from "../components/AcqarAIChat";
// import { Helmet } from "react-helmet-async";

// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import { trackEvent } from "../analytics"; 
// import { Link } from 'react-router-dom';

// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//   :root {
//     --copper:        #B87333;
//     --copper-light:  #D4924A;
//     --copper-dark:   #8C5A25;
//     --copper-glow:   rgba(184,115,51,0.22);
//     --copper-tint:   rgba(184,115,51,0.10);
//     --dark:          #0C0C0C;
//     --dark-2:        #131313;
//     --dark-3:        #1A1A1A;
//     --dark-4:        #242424;
//     --dark-card:     #181818;
//     --border:        rgba(255,255,255,0.10);
//     --border-copper: rgba(184,115,51,0.35);
//     --text-primary:  #F2F0EB;
//     --text-secondary:#B8B3A8;
//     --text-muted:    #6B6560;
//     --green:         #22C55E;
//     --red:           #EF4444;
//     --amber:         #F59E0B;
//     --blue:          #3B82F6;
//     --radius-sm:     6px;
//     --radius-md:     12px;
//     --radius-lg:     18px;
//     --radius-xl:     24px;
//   }

//   [data-theme="light"] {
//     --dark:          #FFFFFF;
//     --dark-2:        #FAFAFA;
//     --dark-3:        #F5F5F5;
//     --dark-4:        #EFEFEF;
//     --dark-card:     #FFFFFF;
//     --border:        rgba(0,0,0,0.09);
//     --border-copper: rgba(184,115,51,0.35);
//     --copper-tint:   rgba(184,115,51,0.07);
//     --copper-glow:   rgba(184,115,51,0.12);
//     --text-primary:  #2B2B2B;
//     --text-secondary:#5C6B7A;
//     --text-muted:    #9CA3AF;
//   }

//   html { scroll-behavior: smooth; transition: color 0.25s ease, background 0.25s ease; overflow-y: scroll; }

//   body {
//     font-family: 'Inter', system-ui, -apple-system, sans-serif;
//     background: var(--dark);
//     color: var(--text-primary);
//     line-height: 1.6;
//     overflow-x: hidden;
//     -webkit-font-smoothing: antialiased;
//   }

//   a { text-decoration: none; color: inherit; }
//   img { display: block; max-width: 100%; }

//   button, a, [role="button"] {
//     touch-action: manipulation;
//     -webkit-tap-highlight-color: transparent;
//   }

//   /* DARK MODE DEPTH */
//   html:not([data-theme="light"]) .feature-card,
//   html:not([data-theme="light"]) .testimonial-card,
//   html:not([data-theme="light"]) .hiw-card {
//     box-shadow: 0 1px 0 0 rgba(255,255,255,0.07) inset, 0 -1px 0 0 rgba(0,0,0,0.5) inset, 0 4px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4);
//   }
//   html:not([data-theme="light"]) .feature-card:hover,
//   html:not([data-theme="light"]) .hiw-card:hover {
//     box-shadow: 0 1px 0 0 rgba(255,255,255,0.10) inset, 0 -1px 0 0 rgba(0,0,0,0.5) inset, 0 20px 56px rgba(0,0,0,0.65), 0 0 0 1px var(--border-copper), 0 0 32px rgba(184,115,51,0.08);
//   }
//   html:not([data-theme="light"]) .testimonial-card { box-shadow: 0 1px 0 0 rgba(255,255,255,0.07) inset, 0 4px 20px rgba(0,0,0,0.5); }
//   html:not([data-theme="light"]) .hiw-connector { background: linear-gradient(90deg, transparent 5%, rgba(184,115,51,0.25) 15%, rgba(184,115,51,0.25) 85%, transparent 95%) !important; }
//   html:not([data-theme="light"]) .hiw-number { box-shadow: 0 0 20px rgba(184,115,51,0.25), 0 0 0 4px rgba(184,115,51,0.08); }
//   html:not([data-theme="light"]) .stats-section { background: linear-gradient(180deg, var(--dark-3) 0%, var(--dark-2) 100%) !important; border-top: 1px solid rgba(184,115,51,0.2) !important; border-bottom: 1px solid rgba(184,115,51,0.2) !important; }
//   html:not([data-theme="light"]) .stat-block { border-right-color: rgba(255,255,255,0.08) !important; }
//   html:not([data-theme="light"]) .stat-block .stat-num { text-shadow: 0 0 40px rgba(184,115,51,0.4); }
//   html:not([data-theme="light"]) .problem-cost-bar { background: linear-gradient(135deg, #1C1A17 0%, #181815 100%) !important; box-shadow: 0 1px 0 0 rgba(255,255,255,0.07) inset, 0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(184,115,51,0.25); }
//   html:not([data-theme="light"]) .problem-section  { background: var(--dark-2) !important; }
//   html:not([data-theme="light"]) .stats-section    { background: var(--dark-4) !important; }
//   html:not([data-theme="light"]) #features         { background: var(--dark) !important; }
//   html:not([data-theme="light"]) #how-it-works     { background: var(--dark-2) !important; }
//   html:not([data-theme="light"]) footer { background: #181818 !important; border-top-color: rgba(255,255,255,0.08) !important; }
//   html:not([data-theme="light"]) footer h6 { color: #F2F0EB !important; }
//   html:not([data-theme="light"]) footer li { color: rgba(255,255,255,0.45) !important; }
//   html:not([data-theme="light"]) footer a { color: rgba(255,255,255,0.45) !important; }
//   html:not([data-theme="light"]) footer p { color: rgba(255,255,255,0.35) !important; }
//   html:not([data-theme="light"]) .footer-bottom-bar { border-top-color: rgba(255,255,255,0.08) !important; }
//   html:not([data-theme="light"]) footer .footer-inner-wrap div[style*="background: white"] { background: #242424 !important; }
//   html:not([data-theme="light"]) footer a[style*="background: rgba(255,255,255"] { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.1) !important; }
//   html:not([data-theme="light"]) .feature-card.large { background: linear-gradient(135deg, #1C1A17 0%, #181818 60%, #1A1815 100%); }
//   html:not([data-theme="light"]) nav { box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 4px 32px rgba(0,0,0,0.6); }
//   html:not([data-theme="light"]) body::before {
//     content: ''; position: fixed; inset: 0; z-index: -1; pointer-events: none;
//     background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(184,115,51,0.04) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(184,115,51,0.03) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(184,115,51,0.02) 0%, transparent 50%);
//   }
//   html:not([data-theme="light"]) .live-ticker { background: #111111 !important; border-bottom-color: rgba(255,255,255,0.12) !important; }
//   html:not([data-theme="light"]) .ticker-label { background: #111111 !important; border-right-color: rgba(255,255,255,0.12) !important; }
//   html:not([data-theme="light"]) .dashboard-frame { box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(184,115,51,0.05); }
//   html:not([data-theme="light"]) .hero-grid-bg { background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px) !important; }
//   html:not([data-theme="light"]) .source-item { background: rgba(255,255,255,0.02); }
//   html:not([data-theme="light"]) .source-item:hover { background: rgba(255,255,255,0.04); }
//   html:not([data-theme="light"]) .footer-copyright { color: rgba(255,255,255,0.35) !important; }
//   html:not([data-theme="light"]) .footer-rics-text { color: rgba(255,255,255,0.7) !important; }
//   html:not([data-theme="light"]) .footer-rics-badge { background: rgba(184,115,51,0.12) !important; border-color: rgba(184,115,51,0.35) !important; }
//   html:not([data-theme="light"]) .nav-links-mobile a { color: rgba(255,255,255,0.55) !important; }
//   html:not([data-theme="light"]) .nav-links-mobile a:hover { color: var(--copper) !important; }

//   /* LIGHT MODE */
//   [data-theme="light"] .feature-card,
//   [data-theme="light"] .hiw-card,
//   [data-theme="light"] .testimonial-card { box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05); }
//   [data-theme="light"] .feature-card:hover,
//   [data-theme="light"] .hiw-card:hover,
//   [data-theme="light"] .testimonial-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06); }
//   [data-theme="light"] .feature-card.large { background: linear-gradient(135deg, #FFFDF9 0%, #FFFFFF 60%, #FDF9F5 100%); }
//   [data-theme="light"] .problem-cost-bar { background: linear-gradient(135deg, #FDF9F4 0%, #FFFFFF 100%) !important; box-shadow: 0 2px 16px rgba(0,0,0,0.07), 0 0 0 1px rgba(184,115,51,0.2); }
//   [data-theme="light"] .stats-section { background: #F5F1EC !important; border-top: 1px solid rgba(184,115,51,0.15) !important; border-bottom: 1px solid rgba(184,115,51,0.15) !important; }
//   [data-theme="light"] .stat-block { border-right-color: rgba(0,0,0,0.08) !important; }
//   [data-theme="light"] .stat-block .stat-num { text-shadow: none; }
//   [data-theme="light"] .stats-grid { background: transparent; }
//   [data-theme="light"] .hiw-connector { background: linear-gradient(90deg, transparent 5%, rgba(184,115,51,0.2) 15%, rgba(184,115,51,0.2) 85%, transparent 95%) !important; }
//   [data-theme="light"] .source-item { background: #F8F6F3 !important; }
//   [data-theme="light"] .source-item:hover { background: #F0EDE8 !important; }
//   [data-theme="light"] .dashboard-frame { box-shadow: 0 4px 40px rgba(0,0,0,0.12), 0 1px 0 rgba(0,0,0,0.06); }
//   [data-theme="light"] nav { background: rgba(255,255,255,0.96); border-bottom-color: rgba(0,0,0,0.08); box-shadow: 0 1px 20px rgba(0,0,0,0.06); }
//   [data-theme="light"] .nav-logo .brand span:last-child { color: #2B2B2B; }
//   [data-theme="light"] .btn-ghost { color: #5C6B7A; border-color: rgba(0,0,0,0.15); }
//   [data-theme="light"] .btn-ghost:hover { color: #2B2B2B; border-color: rgba(0,0,0,0.3); }
//   [data-theme="light"] .live-ticker { background: #F8F8F8 !important; border-bottom: 1px solid rgba(0,0,0,0.08) !important; }
//   [data-theme="light"] .ticker-label { background: #F8F8F8 !important; border-right-color: rgba(0,0,0,0.08) !important; }
//   [data-theme="light"] .hero-grid-bg { background-image: linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px); }
//   [data-theme="light"] .hero::before { background: radial-gradient(ellipse 60% 50% at 70% 40%, rgba(184,115,51,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 20% 80%, rgba(184,115,51,0.04) 0%, transparent 60%); }
//   [data-theme="light"] .terminal-window, [data-theme="light"] .dashboard-frame { --dark:#0C0C0C;--dark-2:#131313;--dark-3:#1A1A1A;--dark-4:#242424;--dark-card:#181818;--border:rgba(255,255,255,0.10);--border-copper:rgba(184,115,51,0.35);--copper-tint:rgba(184,115,51,0.10);--text-primary:#F2F0EB;--text-secondary:#B8B3A8;--text-muted:#6B6560; }
//   [data-theme="light"] .terminal-window { background: #181818; box-shadow: 0 20px 60px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.08); }
//   [data-theme="light"] .dashboard-frame { box-shadow: 0 24px 80px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.07); }
//   [data-theme="light"] .dashboard-cta-overlay { background: linear-gradient(180deg, transparent 0%, transparent 40%, rgba(13,13,13,0.96) 100%); }
//   [data-theme="light"] .problem-section   { background: #FAFAFA !important; }
//   [data-theme="light"] .problem-list      { border-top-color: rgba(0,0,0,0.1); }
//   [data-theme="light"] .problem-row       { border-bottom-color: rgba(0,0,0,0.1); }
//   [data-theme="light"] .problem-row:hover { background: rgba(184,115,51,0.05); }
//   [data-theme="light"] .problem-tag-pill  { border-color: rgba(184,115,51,0.3); }
//   [data-theme="light"] #features         { background: #FFFFFF !important; }
//   [data-theme="light"] #how-it-works     { background: #FAFAFA !important; }
//   [data-theme="light"] .footer-bottom { border-top-color: rgba(0,0,0,0.08) !important; }
//   [data-theme="light"] .final-cta-section::before { background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(184,115,51,0.07) 0%, transparent 70%); }
//   [data-theme="light"] .sev-5 { background: rgba(239,68,68,0.12); }
//   [data-theme="light"] .sev-4 { background: rgba(245,158,11,0.12); }
//   [data-theme="light"] .sev-3 { background: rgba(184,115,51,0.12); }
//   [data-theme="light"] .sev-2 { background: rgba(59,130,246,0.12); }
//   [data-theme="light"] .nav-links-mobile a { color: rgba(43,43,43,0.65) !important; }
//   [data-theme="light"] .nav-links-mobile a:hover { color: var(--copper) !important; }

//   /* SCROLLBAR */
//   ::-webkit-scrollbar { width: 6px; }
//   ::-webkit-scrollbar-track { background: var(--dark-2); }
//   ::-webkit-scrollbar-thumb { background: var(--copper-dark); border-radius: 3px; }
//   ::-webkit-scrollbar-thumb:hover { background: var(--copper); }
//   * { scrollbar-width: thin; scrollbar-color: var(--copper-dark) var(--dark-2); }

//   /* THEME TOGGLE */
//   .theme-toggle { width:36px;height:36px;border-radius:var(--radius-sm);border:1px solid var(--border);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;line-height:1;color:var(--text-secondary);transition:border-color 0.2s,color 0.2s,background 0.2s;flex-shrink:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent; }
//   .theme-toggle:hover { border-color:var(--border-copper);color:var(--copper);background:var(--copper-tint); }

//   /* NAV */
//   nav { position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px;background:rgba(13,13,13,0.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border); }
//   .nav-logo { display:flex;align-items:center;gap:6px;min-width:0;flex-shrink:0; }
//   .nav-logo .brand { font-size:24px;font-weight:900;letter-spacing:-0.3px; }
//   .nav-logo .brand span:first-child { color:var(--copper); }
//   .nav-logo .brand span:last-child  { color:var(--text-primary); }
//   .nav-logo .signal-badge { font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--copper);border:1px solid var(--border-copper);padding:3px 10px;border-radius:4px;background:var(--copper-tint);text-transform:uppercase; }

//   /* DESKTOP nav links */
//   .nav-links { display:flex;align-items:center;gap:32px;list-style:none;font-size:14px; font-weight:500;color:var(--text-primary); }
// .nav-links a:hover { color:var(--copper); }

//   /* MOBILE nav links — inline compact, always visible on small screens */
//   .nav-links-mobile {
//     display: none;
//     align-items: center;
//     gap: 2px;
//     list-style: none;
//     flex-shrink: 1;
//     min-width: 0;
//   }
//   .nav-links-mobile a {
//     font-size: 9px;
//     font-weight: 900;
//     letter-spacing: 0.15em;
//     text-transform: uppercase;
//     color: var(--text-primary);
//     padding: 6px 8px;
//     border-radius: 20px;
//     white-space: nowrap;
//     text-decoration: none;
//     display: block;
//     touch-action: manipulation;
//     -webkit-tap-highlight-color: transparent;
//     transition: color 0.2s;
//   }
//   .nav-links-mobile a:hover { color: var(--copper); }

//   .nav-actions { display:flex;gap:8px;align-items:center;flex-shrink:0; }
//   .btn-ghost { font-size:14px;font-weight:600;color:var(--text-secondary);padding:9px 20px;border:1px solid var(--border);border-radius:var(--radius-sm);background:transparent;cursor:pointer;transition:color 0.2s,border-color 0.2s;touch-action:manipulation;-webkit-tap-highlight-color:transparent; }
//   .btn-ghost:hover { color:var(--text-primary);border-color:rgba(255,255,255,0.2); }
//   .btn-primary { font-size:15px;font-weight:700;color:#fff;padding:9px 24px;border:none;border-radius:var(--radius-sm);background:var(--copper);cursor:pointer;transition:background 0.2s,transform 0.1s;touch-action:manipulation;-webkit-tap-highlight-color:transparent; }
//   .btn-primary:hover { background:var(--copper-light);transform:translateY(-1px); }

//   /* TICKER */
//   .live-ticker { position:fixed;top:64px;left:0;right:0;z-index:99;background:var(--dark-2);border-bottom:1px solid var(--border);height:32px;overflow:hidden;display:flex;align-items:center; }
//   .ticker-label { flex-shrink:0;display:flex;align-items:center;gap:6px;padding:0 16px;font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--copper);text-transform:uppercase;border-right:1px solid var(--border);height:100%;background:var(--dark-2); }
//   .ticker-dot { width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);animation:pulse-dot 1.5s ease-in-out infinite; }
//   @keyframes pulse-dot { 0%,100%{opacity:1}50%{opacity:0.3} }
//   .ticker-track { display:flex;gap:0;animation:ticker-scroll 30s linear infinite;white-space:nowrap; }
//   .ticker-track:hover { animation-play-state:paused; }
//   @keyframes ticker-scroll { 0%{transform:translateX(0)}100%{transform:translateX(-50%)} }
//   .ticker-item { display:inline-flex;align-items:center;gap:8px;padding:0 24px;font-size:11px;color:var(--text-secondary); }
//   .ticker-item .sev { font-weight:700;font-size:9px;padding:1px 5px;border-radius:3px; }
//   .sev-5 { background:rgba(239,68,68,0.2);color:#EF4444; }
//   .sev-4 { background:rgba(245,158,11,0.2);color:#F59E0B; }
//   .sev-3 { background:rgba(184,115,51,0.2);color:var(--copper); }
//   .sev-2 { background:rgba(59,130,246,0.2);color:#3B82F6; }
//   .ticker-item .loc { color:var(--text-muted); }

//   /* HERO */
//   .hero { min-height:100vh;padding:160px 48px 80px;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;position:relative;overflow:hidden; }
//   .hero::before { content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 70% 30%, rgba(184,115,51,0.13) 0%, transparent 65%),radial-gradient(ellipse 50% 50% at 20% 70%, rgba(184,115,51,0.07) 0%, transparent 55%),radial-gradient(ellipse 40% 40% at 50% 100%, rgba(184,115,51,0.05) 0%, transparent 50%);pointer-events:none; }
//   .hero-grid-bg { position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);background-size:60px 60px;pointer-events:none;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent); }
//   .hero-content { position:relative;z-index:2; }
//   .hero-eyebrow { display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--copper);border:1px solid var(--border-copper);padding:6px 14px;border-radius:20px;background:var(--copper-tint);margin-bottom:28px; }
//   .hero-eyebrow .dot { width:6px;height:6px;border-radius:50%;background:var(--copper);animation:pulse-dot 1.5s infinite; }
//   .hero h1 { font-size:68px;font-weight:900;line-height:1.0;letter-spacing:-2px;margin-bottom:24px; }
//   .hero h1 em { font-style:normal;background:linear-gradient(135deg, var(--copper-light), var(--copper-dark));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
//   .hero-sub { font-size:18px;color:var(--text-secondary);line-height:1.7;max-width:480px;margin-bottom:40px;font-weight:400; }
//   .hero-sub strong { color:var(--text-primary);font-weight:600; }
//   .hero-cta-row { display:flex;align-items:center;gap:16px;margin-bottom:48px; }
//   .btn-hero { display:inline-flex;align-items:center;gap:8px;font-size:16px;font-weight:700;color:#fff;padding:16px 32px;border:none;border-radius:var(--radius-md);background:var(--copper);cursor:pointer;transition:all 0.2s;box-shadow:0 8px 32px rgba(184,115,51,0.30);text-decoration:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent; }
//   .btn-hero:hover { background:var(--copper-light);transform:translateY(-2px);box-shadow:0 12px 40px rgba(184,115,51,0.40); }
//   .btn-hero-ghost { display:inline-flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:var(--text-secondary);padding:16px 24px;border:1px solid var(--border);border-radius:var(--radius-md);background:transparent;cursor:pointer;transition:all 0.2s;text-decoration:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent; }
//   .btn-hero-ghost:hover { color:var(--text-primary);border-color:rgba(255,255,255,0.2); }
//   .hero-trust-row { display:flex;align-items:center;gap:24px;font-size:12px;color:var(--text-muted); }
//   .hero-trust-row .check { display:flex;align-items:center;gap:6px; }
//   .hero-trust-row .check::before { content:'✓';color:var(--green);font-weight:700; }
//   .hero-visual { position:relative;z-index:2; }

//   /* TERMINAL */
//   .terminal-window { background:var(--dark-card);border:1px solid var(--border);border-radius:var(--radius-xl);overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.05),inset 0 1px 0 rgba(255,255,255,0.05); }
//   .terminal-topbar { display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:rgba(255,255,255,0.03);border-bottom:1px solid var(--border);gap:8px;min-width:0; }
//   .terminal-dots { display:flex;gap:6px; }
//   .terminal-dots span { width:10px;height:10px;border-radius:50%; }
//   .terminal-dots span:nth-child(1){background:#FF5F56}
//   .terminal-dots span:nth-child(2){background:#FFBD2E}
//   .terminal-dots span:nth-child(3){background:#27C93F}
//   .terminal-title { font-size:11px;color:var(--text-muted);font-weight:500;display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0; }
//   .terminal-live-badge { font-size:9px;font-weight:700;letter-spacing:1px;color:var(--green);background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.25);padding:2px 7px;border-radius:10px;text-transform:uppercase;flex-shrink:0; }
//   .terminal-stats-bar { display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--border); }
//   .t-stat { padding:10px 14px;border-right:1px solid var(--border);font-size:10px; }
//   .t-stat:last-child{border-right:none}
//   .t-stat .label{color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px}
//   .t-stat .value{font-size:15px;font-weight:700;color:var(--text-primary)}
//   .t-stat .value.up{color:var(--green)}
//   .t-stat .value.copper{color:var(--copper)}
//   .t-stat .delta{font-size:9px;color:var(--green);margin-top:1px}
//   .terminal-map { height:180px;background:var(--dark-3);position:relative;overflow:hidden; }
//   .map-dot { position:absolute;border-radius:50%;transform:translate(-50%,-50%); }
//   .map-dot.s5 { width:18px;height:18px;background:rgba(239,68,68,0.3);border:2px solid #EF4444;box-shadow:0 0 20px rgba(239,68,68,0.5);animation:pulse-ring 2s ease-out infinite; }
//   .map-dot.s4 { width:14px;height:14px;background:rgba(245,158,11,0.3);border:2px solid #F59E0B;box-shadow:0 0 14px rgba(245,158,11,0.4);animation:pulse-ring 2.5s ease-out infinite; }
//   .map-dot.s3 { width:11px;height:11px;background:rgba(184,115,51,0.3);border:2px solid var(--copper);animation:pulse-ring 3s ease-out infinite; }
//   .map-dot.s2 { width:8px;height:8px;background:rgba(59,130,246,0.3);border:2px solid #3B82F6; }
//   @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)}70%{box-shadow:0 0 0 14px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)} }
//   .map-label { position:absolute;font-size:8px;font-weight:600;color:var(--text-muted);white-space:nowrap;transform:translate(-50%,100%);margin-top:4px;letter-spacing:0.5px;text-transform:uppercase; }
//   .map-grid-line { position:absolute;background:rgba(255,255,255,0.04); }
//   .map-grid-line.h{height:1px;left:0;right:0}
//   .map-grid-line.v{width:1px;top:0;bottom:0}
//   .terminal-feed { max-height:220px;overflow:hidden; }
//   .feed-header { display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--border);font-size:10px; }
//   .feed-header .title{font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px}
//   .feed-header .count{color:var(--copper);font-weight:700;background:var(--copper-tint);padding:2px 8px;border-radius:10px;border:1px solid var(--border-copper)}
//   .feed-row { display:grid;grid-template-columns:36px 1fr 70px 50px;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.03);font-size:11px;transition:background 0.15s; }
//   .feed-row:hover{background:rgba(255,255,255,0.03)}
//   .feed-row.new{animation:feed-flash 0.8s ease-out}
//   @keyframes feed-flash{0%{background:rgba(184,115,51,0.12)}100%{background:transparent}}
//   .feed-sev{display:flex;justify-content:center}
//   .sev-pill{font-size:9px;font-weight:800;padding:2px 6px;border-radius:3px;text-align:center;letter-spacing:0.5px}
//   .feed-content{min-width:0}
//   .feed-content .feed-title{font-size:11px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3;margin-bottom:1px}
//   .feed-content .feed-meta{font-size:9px;color:var(--text-muted)}
//   .feed-area{font-size:9px;color:var(--text-muted);text-align:right;white-space:nowrap}
//   .feed-time{font-size:9px;color:var(--text-muted);text-align:right;font-variant-numeric:tabular-nums}

//   /* SECTIONS */
//   section { padding:100px 48px;position:relative; }
//   .section-label { display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--copper);margin-bottom:20px; }
//   .section-label::before { content:'';display:block;width:20px;height:1px;background:var(--copper); }
//   .section-title { font-size:52px;font-weight:900;letter-spacing:-1.5px;line-height:1.05;margin-bottom:20px; }
//   .section-sub { font-size:18px;color:var(--text-secondary);line-height:1.7;max-width:560px; }
//   .text-copper{color:var(--copper)}

//   /* PROBLEM */
//   .problem-section { background:var(--dark-2);border-top:1px solid var(--border);border-bottom:1px solid var(--border); }
//   .problem-layout { max-width:1200px;margin:0 auto; }
//   .problem-intro { margin-bottom:72px;text-align:center; }
//   .problem-list { border-top:1px solid var(--border);margin-bottom:72px; }
//   .problem-row { display:grid;grid-template-columns:88px 1fr 1.8fr;gap:0 56px;padding:52px 0;border-bottom:1px solid var(--border);align-items:start;cursor:default;position:relative;transition:background 0.25s ease; }
//   .problem-row:hover{background:var(--copper-tint)}
//   .problem-row::after { content:'';position:absolute;bottom:-1px;left:0;height:1px;width:0;background:var(--copper);transition:width 0.45s cubic-bezier(0.4,0,0.2,1); }
//   .problem-row:hover::after{width:100%}
//   .problem-num { font-size:56px;font-weight:900;line-height:1;color:var(--copper);opacity:0.4;letter-spacing:-3px;font-variant-numeric:tabular-nums;padding-top:2px;transition:opacity 0.25s; }
//   .problem-row:hover .problem-num{opacity:0.9}
//   .problem-title-col{padding-top:6px}
//   .problem-tag-pill { display:inline-block;font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--copper);padding:3px 9px;border:1px solid var(--border-copper);border-radius:3px;margin-bottom:14px; }
//   .problem-title{font-size:20px;font-weight:700;letter-spacing:-0.3px;line-height:1.3;color:var(--text-primary)}
//   .problem-desc-col{padding-top:10px}
//   .problem-desc-col p{font-size:15px;color:var(--text-secondary);line-height:1.75}
//   .problem-desc-col p strong{color:var(--text-primary);font-weight:600}
//   .problem-cost-bar { background:var(--dark-card);border:1px solid var(--border-copper);border-radius:var(--radius-lg);padding:36px 48px;display:flex;align-items:center;justify-content:space-between;gap:32px; }
//   .cost-text h3{font-size:22px;font-weight:900;letter-spacing:-0.5px;margin-bottom:8px}
//   .cost-text p{font-size:15px;color:var(--text-secondary)}
//   .cost-number{text-align:right;flex-shrink:0}
//   .cost-number .amount{font-size:52px;font-weight:900;color:#EF4444;letter-spacing:-2px;line-height:1}
//   .cost-number .label{font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-top:4px}

//   /* FEATURES */
//   .features-section{max-width:1200px;margin:0 auto}
//   .features-header{margin-bottom:64px}
//   .features-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
//   .feature-card { background:var(--dark-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:36px;position:relative;overflow:hidden;transition:all 0.3s; }
//   .feature-card:hover { border-color:var(--border-copper);transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,0.4),0 0 0 1px var(--border-copper); }
//   .feature-card.large { grid-column:span 2;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center; }
//   .feature-icon { width:44px;height:44px;color:var(--copper);margin-bottom:28px;display:flex;align-items:flex-start;position:relative; }
//   .feature-icon::after { content:'';position:absolute;bottom:-10px;left:0;width:20px;height:1px;background:var(--border-copper); }
//   .feature-icon svg { width:36px;height:36px;stroke:currentColor;stroke-width:1.4;fill:none;stroke-linecap:round;stroke-linejoin:round; }
//   .feature-card h3{font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:12px}
//   .feature-card p{font-size:15px;color:var(--text-secondary);line-height:1.7;margin-bottom:20px}
//   .feature-tags{display:flex;flex-wrap:wrap;gap:8px}
//   .ftag{font-size:11px;font-weight:600;color:var(--text-muted);padding:4px 10px;border:1px solid var(--border);border-radius:4px}
//   .ftag.active{color:var(--copper);border-color:var(--border-copper);background:var(--copper-tint)}
//   .source-list{display:flex;flex-direction:column;gap:8px}
//   .source-item { display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--dark-3);border:1px solid var(--border);border-radius:var(--radius-sm);font-size:12px;font-weight:600;color:var(--text-secondary); }
//   .source-item .src-dot{width:7px;height:7px;border-radius:50%;background:var(--green);flex-shrink:0}
//   .source-item .src-count{margin-left:auto;color:var(--text-muted);font-weight:400;font-size:11px}

//   /* DASHBOARD */
//   .dashboard-section{background:var(--dark-2);border-top:1px solid var(--border);border-bottom:1px solid var(--border);overflow:hidden}
//   .dashboard-intro{max-width:700px;margin:0 auto 64px;text-align:center}
//   .dashboard-frame { max-width:1300px;margin:0 auto;background:var(--dark);border:1px solid var(--border);border-radius:var(--radius-xl);overflow:hidden;box-shadow:0 60px 120px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.04);position:relative; }
//   .dashboard-frame::before { content:'';position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,var(--copper),transparent); }
//   .dash-topbar { display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:44px;background:var(--dark-card);border-bottom:1px solid var(--border);overflow:hidden;gap:8px; }
//   .dash-logo{font-size:13px;font-weight:900;letter-spacing:-0.3px}
//   .dash-logo span:first-child{color:var(--copper)}
//   .dash-tabs{display:flex;gap:0;overflow-x:auto;flex:1;scrollbar-width:none;}
//   .dash-tabs::-webkit-scrollbar{display:none;}
//   .dash-tab { padding:0 12px;height:44px;display:flex;align-items:center;font-size:11px;font-weight:600;color:var(--text-muted);border-right:1px solid var(--border);cursor:pointer;white-space:nowrap;flex-shrink:0; }
//   .dash-tab.active{color:var(--copper);background:var(--copper-tint);border-bottom:1px solid var(--copper)}
//   .dash-status{display:flex;align-items:center;gap:12px;font-size:10px;color:var(--text-muted)}
//   .dash-status .live-ind{display:flex;align-items:center;gap:5px;color:var(--green)}
//   .dash-body{display:grid;grid-template-columns:280px 1fr 280px;height:520px}
//   .dash-sidebar-left{border-right:1px solid var(--border);display:flex;flex-direction:column}
//   .dash-sidebar-section{border-bottom:1px solid var(--border);padding:12px}
//   .dash-sidebar-title{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px}
//   .filter-chip { display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:4px;margin:2px;font-size:10px;font-weight:600;cursor:pointer;border:1px solid var(--border);color:var(--text-muted); }
//   .filter-chip.active{background:var(--copper-tint);border-color:var(--border-copper);color:var(--copper)}
//   .filter-chip .chip-dot{width:5px;height:5px;border-radius:50%;background:currentColor}
//   .signal-row { display:flex;align-items:flex-start;gap:8px;padding:8px;border-bottom:1px solid rgba(255,255,255,0.03);cursor:pointer;transition:background 0.15s;font-size:10px; }
//   .signal-row:hover{background:rgba(255,255,255,0.03)}
//   .signal-row.active{background:rgba(184,115,51,0.06);border-left:2px solid var(--copper)}
//   .sig-sev-badge{flex-shrink:0;width:22px;height:22px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800}
//   .sig-content{flex:1;min-width:0}
//   .sig-title{font-size:10px;font-weight:600;color:var(--text-primary);line-height:1.3;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
//   .sig-meta{font-size:9px;color:var(--text-muted)}
//   .dash-map{position:relative;background:var(--dark-3);overflow:hidden}
//   .dash-map-bg { position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%, rgba(184,115,51,0.04) 0%, transparent 70%),linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);background-size:100% 100%,40px 40px,40px 40px; }
//   .map-hotspot{position:absolute;transform:translate(-50%,-50%);cursor:pointer}
//   .map-hotspot .hs-ring{border-radius:50%;animation:hs-pulse 2s ease-out infinite}
//   .map-hotspot .hs-core{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:50%}
//   @keyframes hs-pulse{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2.5);opacity:0}}
//   .map-hotspot .hs-label{position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);font-size:8px;color:var(--text-muted);white-space:nowrap;text-align:center;letter-spacing:0.5px;text-transform:uppercase}
//   .map-event-card{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);background:var(--dark-card);border:1px solid var(--border-copper);border-radius:var(--radius-md);padding:12px 16px;width:260px;font-size:11px}
//   .map-event-card .mec-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
//   .map-event-card .mec-loc{font-size:9px;color:var(--copper);font-weight:700;text-transform:uppercase;letter-spacing:1px}
//   .map-event-card .mec-title{font-size:12px;font-weight:700;color:var(--text-primary);line-height:1.3;margin-bottom:6px}
//   .map-event-card .mec-meta{display:flex;gap:10px;font-size:9px;color:var(--text-muted)}
//   .map-event-card .mec-price{color:var(--copper);font-weight:600}
//   .dash-sidebar-right{border-left:1px solid var(--border);display:flex;flex-direction:column}
//   .analytics-block{padding:12px;border-bottom:1px solid var(--border)}
//   .mini-bar-chart{display:flex;align-items:flex-end;gap:4px;height:50px;margin-top:8px}
//   .mini-bar{flex:1;border-radius:2px;background:var(--dark-3);border:1px solid var(--border);transition:height 0.3s}
//   .mini-bar.active{background:var(--copper);border-color:var(--copper)}
//   .area-momentum-list{display:flex;flex-direction:column;gap:4px}
//   .momentum-row{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:10px}
//   .momentum-row .m-name{flex:1;color:var(--text-secondary);font-weight:500}
//   .momentum-row .m-bar-wrap{width:80px;height:4px;background:var(--dark-3);border-radius:2px;overflow:hidden}
//   .momentum-row .m-bar{height:100%;background:var(--copper);border-radius:2px}
//   .momentum-row .m-count{font-size:9px;color:var(--text-muted);width:20px;text-align:right}
//   .chat-input-bar{margin-top:auto;padding:10px 12px;border-top:1px solid var(--border)}
//   .chat-input{width:100%;background:var(--dark-3);border:1px solid var(--border);border-radius:var(--radius-sm);padding:7px 12px;font-size:10px;color:var(--text-muted);display:flex;align-items:center;justify-content:space-between}
//   .chat-input .send-icon{color:var(--copper);font-size:12px}
//   .dash-statusbar { display:flex;align-items:center;justify-content:space-between;padding:6px 16px;height:28px;background:var(--dark-card);border-top:1px solid var(--border);font-size:9px;color:var(--text-muted); }
//   .status-items{display:flex;gap:20px}
//   .status-item{display:flex;align-items:center;gap:4px}
//   .status-item .si-dot{width:5px;height:5px;border-radius:50%}
//   .dashboard-cta-overlay { position:absolute;inset:0;background:linear-gradient(180deg,transparent 0%,transparent 40%,rgba(13,13,13,0.97) 100%);display:flex;align-items:flex-end;justify-content:center;padding-bottom:40px;pointer-events:none; }
//   .dashboard-cta-overlay .overlay-cta{pointer-events:all;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center}
//   .overlay-cta .blur-notice{font-size:13px;color:var(--text-secondary);font-weight:500}
//   .overlay-cta .blur-notice strong{color:var(--text-primary)}

//   /* HOW IT WORKS */
//   .hiw-section{max-width:1200px;margin:0 auto}
//   .hiw-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:64px;position:relative}
//   .hiw-connector{position:absolute;top:30px;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 5%,var(--border) 15%,var(--border) 85%,transparent 95%);z-index:0}
//   .hiw-card{position:relative;z-index:1;background:var(--dark-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:32px 28px;text-align:center;transition:border-color 0.3s,transform 0.3s}
//   .hiw-card:hover{border-color:var(--border-copper);transform:translateY(-4px)}
//   .hiw-number{width:44px;height:44px;border-radius:50%;background:var(--dark);border:2px solid var(--copper);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:var(--copper);margin:0 auto 20px}
//   .hiw-card h4{font-size:16px;font-weight:800;letter-spacing:-0.3px;margin-bottom:10px}
//   .hiw-card p{font-size:13px;color:var(--text-secondary);line-height:1.6}

//   /* STATS */
//   .stats-section{background:var(--dark-2);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
//   .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);max-width:1200px;margin:0 auto;gap:0}
//   .stat-block{padding:56px 40px;border-right:1px solid var(--border);text-align:center}
//   .stat-block:last-child{border-right:none}
//   .stat-block .stat-num{font-size:52px;font-weight:900;letter-spacing:-2px;line-height:1;color:var(--copper);margin-bottom:8px}
//   .stat-block .stat-label{font-size:13px;color:var(--text-secondary);font-weight:500;line-height:1.4}
//   .stat-block .stat-sub{font-size:11px;color:var(--text-muted);margin-top:4px}

//   /* TESTIMONIALS */
//   @keyframes marquee-left{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
//   .marquee-wrap{overflow:hidden;mask-image:linear-gradient(to right,transparent,black 8%,black 92%,transparent);-webkit-mask-image:linear-gradient(to right,transparent,black 8%,black 92%,transparent)}
//   .marquee-track{display:flex;gap:20px;width:max-content;animation:marquee-left 40s linear infinite;padding:8px 0 16px;align-items:stretch;}
//   .marquee-track:hover{animation-play-state:paused}
//   .testimonial-card{flex:0 0 380px;min-height:400px;height:auto;background:var(--dark-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:28px 28px 24px;position:relative;overflow:hidden;transition:border-color 0.3s,transform 0.25s;display:flex;flex-direction:column;}
//   .testimonial-card:hover{border-color:var(--border-copper);transform:translateY(-3px)}
//   .t-stars{color:var(--copper);font-size:13px;letter-spacing:2px;margin-bottom:14px}
//   .t-persona{display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--copper);background:var(--copper-tint);border:1px solid var(--border-copper);padding:3px 9px;border-radius:20px;margin-bottom:14px;align-self:flex-start}
//   .t-persona-dot{width:4px;height:4px;border-radius:50%;background:var(--copper)}
//   .t-quote{font-size:13.5px;color:var(--text-secondary);line-height:1.72;margin-bottom:20px;flex:1}
//   .t-quote strong{color:var(--text-primary);font-weight:800}
//   .t-author{display:flex;align-items:center;gap:12px;border-top:1px solid var(--border);padding-top:16px}
//   .t-avatar{width:38px;height:38px;border-radius:50%;background:var(--copper-tint);border:1.5px solid var(--border-copper);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:var(--copper);flex-shrink:0;letter-spacing:0.5px}
//   .t-info .name{font-size:13px;font-weight:700;margin-bottom:2px;color:var(--text-primary)}
//   .t-info .role{font-size:11px;color:var(--text-muted);line-height:1.4}
//   .t-info .location{font-size:10.5px;color:var(--text-muted);margin-top:1px}

//   /* FINAL CTA */
//   .final-cta-section{position:relative;overflow:hidden;text-align:center;padding:120px 48px}
//   .final-cta-section::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% 50%,rgba(184,115,51,0.16) 0%,transparent 70%),radial-gradient(ellipse 100% 40% at 50% 100%,rgba(184,115,51,0.06) 0%,transparent 60%)}
//   .final-cta-section::after{content:'';position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,var(--copper),transparent)}
//   .final-cta-content{position:relative;z-index:1;max-width:700px;margin:0 auto}
//   .final-cta-eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--copper);margin-bottom:24px}
//   .final-cta-section h2{font-size:60px;font-weight:900;letter-spacing:-2px;line-height:1.05;margin-bottom:20px}
//   .final-cta-section p{font-size:16px;color:var(--text-secondary);line-height:1.7;margin-bottom:40px}
//   .final-cta-buttons{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:24px}
//   .final-trust{font-size:12px;color:var(--text-muted);display:flex;align-items:center;justify-content:center;gap:20px}
//   .final-trust span{display:flex;align-items:center;gap:5px}
//   .final-trust span::before{content:'✓';color:var(--green);font-weight:700}

//   /* FOOTER */
//   footer{background:var(--dark-card);border-top:1px solid var(--border);padding:48px}
//   .footer-main-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
//   .footer-bottom-bar{display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(10,10,10,0.06);padding-top:32px;flex-wrap:wrap;gap:16px;}
//   .footer-inner-wrap { max-width: 1280px; margin: 0 auto; padding: 48px 5px 32px 5px; }
//   .footer-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px}
//   .footer-brand .logo-text{font-size:20px;font-weight:900;margin-bottom:12px}
//   .footer-brand .logo-text span:first-child{color:var(--copper)}
//   .footer-brand p{font-size:13px;color:var(--text-muted);line-height:1.7;max-width:260px;margin-bottom:16px}
//   .footer-badge{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text-muted);border:1px solid var(--border);padding:5px 12px;border-radius:4px}
//   .footer-col h5{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-muted);margin-bottom:16px}
//   .footer-col ul{list-style:none;display:flex;flex-direction:column;gap:10px}
//   .footer-col ul li a{font-size:13px;color:var(--text-secondary);transition:color 0.2s}
//   .footer-col ul li a:hover{color:var(--text-primary)}
//   .footer-bottom{max-width:1200px;margin:32px auto 0;padding-top:24px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--text-muted)}
//   .footer-bottom a{color:var(--text-muted)}
//   .footer-bottom a:hover{color:var(--text-primary)}
//   .footer-links{display:flex;gap:24px}
//   .rics-tag{color:var(--copper);font-weight:600;font-size:11px}
//   .footer-social-link {
//     width:36px;height:36px;border-radius:50%;
//     border:1px solid rgba(10,10,10,0.09);
//     background:rgba(255,255,255,0.6);
//     display:flex;align-items:center;justify-content:center;
//     color:rgba(10,10,10,0.35);text-decoration:none;
//     transition:all 0.2s;
//     touch-action:manipulation;
//     -webkit-tap-highlight-color:transparent;
//   }
//   .footer-social-link:hover { color:#B87333;border-color:rgba(184,115,51,0.4); }

//   /* ── RESPONSIVE ── */

//   @media(max-width:1100px){
//     nav{padding:0 24px}
//     .nav-links{display:flex}
//     .nav-logo .brand { font-size:18px; }
//     section{padding:64px 24px}
//     .section-title{font-size:38px}
//     .hero{grid-template-columns:1fr;padding:130px 24px 60px;gap:32px;align-items:start}
//     .hero h1{font-size:40px;letter-spacing:-1.5px}
//     .hero-content{width:100%;min-width:0}
//     .hero-visual{width:100%;min-width:0;overflow:hidden}
//     .hero-cta-row{flex-wrap:wrap;gap:12px}
//     .btn-hero,.btn-hero-ghost{width:100%;justify-content:center;font-size:14px;padding:14px 20px}
//     .hero-trust-row{flex-wrap:wrap;gap:8px;font-size:11px}
//     .problem-row{grid-template-columns:1fr;gap:8px 0;padding:36px 0}
//     .problem-num{font-size:40px;letter-spacing:-2px;opacity:0.55}
//     .problem-cost-bar{flex-direction:column;padding:28px 24px;gap:20px}
//     .cost-number{text-align:left}
//     .cost-number .amount{font-size:44px}
//     .features-grid{grid-template-columns:1fr}
//     .feature-card.large{grid-column:span 1;grid-template-columns:1fr}
//     .stats-grid{grid-template-columns:repeat(2,1fr)}
//     .hiw-grid{grid-template-columns:repeat(2,1fr)}
//     .testimonial-card{flex:0 0 320px;min-height:420px;height:auto;}
//     .dash-body{grid-template-columns:1fr;height:auto}
//     .dash-sidebar-left,.dash-sidebar-right{display:none}
//     .dash-map{min-height:420px}
//     .footer-inner{grid-template-columns:1fr 1fr;gap:36px}
//     .final-cta-section{padding:100px 24px}
//     .final-cta-section h2{font-size:44px}
//     .footer-main-grid { grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
//     .terminal-title { white-space: nowrap; overflow: hidden; }
//     .terminal-live-badge { flex-shrink: 0; }
//   }

//   @media(max-width:768px){
//     /* Switch to mobile nav links, hide desktop ones */
//     .nav-links { display: none !important; }
//     .nav-links-mobile { display: flex; }
//     nav { padding: 0 16px; }

//     section{padding:60px 24px}
//     .section-title{font-size:32px;letter-spacing:-0.8px}
//     .hero h1{font-size:40px}
//     .hero-cta-row{flex-wrap:wrap;gap:12px}
//     .stat-block{padding:40px 24px}
//     .stat-block .stat-num{font-size:44px}
//     .hiw-connector{display:none}
//     .final-cta-section h2{font-size:36px}
//     .footer-inner{grid-template-columns:1fr;gap:32px}
//     .footer-bottom{flex-direction:column;gap:12px;text-align:center}
//     .footer-links{flex-wrap:wrap;justify-content:center;gap:16px}
//     .footer-main-grid { grid-template-columns: 1fr; gap: 40px; }
//     .footer-bottom-bar { flex-direction: column !important; gap: 12px !important; text-align: center !important; }
//     .footer-inner-wrap { padding: 48px 24px 24px; }
//     .dash-status { display:none; }
//     .dash-topbar { padding:0 12px; }
//     .map-event-card { display: none; }
//     .hs-label { display: block; }
//     .dashboard-cta-overlay { background: linear-gradient(180deg, transparent 0%, transparent 55%, rgba(13,13,13,0.97) 80%); }
//     .overlay-cta .blur-notice { font-size: 12px; padding: 0 16px; text-align: center; }
//     .marquee-wrap { mask-image: none !important; -webkit-mask-image: none !important; }
//   }

//   @media(max-width:480px){
//     section{padding:52px 16px}
//     .section-title{font-size:28px}
//     .section-sub{font-size:15px}
//     nav{padding:0 10px;height:48px}
//     .live-ticker{top:48px}
//     .btn-ghost{display:none}
//     .btn-primary{font-size:10px;padding:7px 10px;white-space:nowrap;}
//     .nav-logo .brand{font-size:17px;}
//     .theme-toggle{width:24px;height:24px;font-size:11px;}
//    .nav-links-mobile a {
//   font-size: 9px;
//   font-weight: 900;
//   letter-spacing: 0.05em;
//   text-transform: uppercase;
//   color: var(--text-primary);
//   padding: 4px 5px;
//   border-radius: 20px;
//   white-space: nowrap;
//   text-decoration: none;
//   display: block;
//   touch-action: manipulation;
//   -webkit-tap-highlight-color: transparent;
//   transition: color 0.2s;
// }
//     .hero{padding:110px 16px 48px;gap:24px;display:flex;flex-direction:column}
//     .hero-content{order:1;width:100%}
//     .hero-visual{order:2;width:100%;overflow-x:hidden}
//     .hero h1{font-size:32px;letter-spacing:-1px}
//     .hero-sub{font-size:15px;margin-bottom:32px}
//     .hero-cta-row{flex-direction:column;gap:12px;margin-bottom:28px}
//     .btn-hero,.btn-hero-ghost{width:100%;justify-content:center}
//     .hero-trust-row{flex-wrap:wrap;gap:10px}
//     .problem-row{padding:24px 0}
//     .problem-num{font-size:28px;letter-spacing:-1px}
//     .problem-title{font-size:17px}
//     .problem-desc-col p{font-size:14px}
//     .problem-cost-bar{flex-direction:column;padding:24px 16px;gap:20px}
//     .cost-text h3{font-size:17px}
//     .cost-number .amount{font-size:40px}
//     .features-grid{gap:16px}
//     .feature-card{padding:24px 20px}
//     .feature-card h3{font-size:18px}
//     .feature-card p{font-size:14px}
//     .stat-block{padding:28px 12px}
//     .stat-block .stat-num{font-size:36px}
//     .stat-block .stat-label{font-size:12px}
//     .hiw-grid{grid-template-columns:1fr;gap:16px}
//     .hiw-card{padding:28px 20px}
//     .testimonials-header{padding:0 16px;margin-bottom:28px}
//     .testimonial-card{flex:0 0 280px;min-height:420px;height:auto;}
//     .final-cta-section{padding:72px 16px}
//     .final-cta-section h2{font-size:28px;letter-spacing:-0.8px}
//     .final-cta-section p{font-size:15px}
//     .final-cta-buttons{flex-direction:column;gap:12px}
//     .final-trust{flex-wrap:wrap;justify-content:center;gap:8px;font-size:11px}
//     footer{padding:40px 16px}
//     .footer-inner{gap:28px}
//     .footer-bottom{flex-direction:column;gap:10px;text-align:center}
//     .footer-links{flex-wrap:wrap;justify-content:center;gap:12px}
//     .footer-main-grid { grid-template-columns: 1fr; gap: 32px; }
//     .footer-bottom-bar { flex-direction: column !important; gap: 10px !important; text-align: center !important; }
//     .footer-inner-wrap { padding: 40px 16px 20px; }
//     .map-event-card { display: none; }
//     .dashboard-cta-overlay { background: linear-gradient(180deg, transparent 0%, transparent 50%, rgba(13,13,13,0.97) 78%); padding-bottom: 24px; }
//     .overlay-cta { gap: 12px; }
//     .overlay-cta .blur-notice { font-size: 11px; padding: 0 20px; }
//     .btn-hero { font-size: 14px !important; padding: 14px 24px !important; }
//     .ticker-track { animation-duration: 10s; }
//   }

//   @media(max-width:360px){
//     nav { padding: 0 8px; }
//     .nav-logo .brand { font-size: 15px; }
//     .nav-links-mobile { gap: 0; }
//     .nav-links-mobile a { font-size: 9px; padding: 3px 5px; letter-spacing: 0.05em; color: var(--text-primary);}
//     .btn-primary { font-size: 11px; padding: 6px 8px; }
//     .theme-toggle { width: 24px; height: 24px; font-size: 11px; }
//   }

//   @media(max-width: 768px) {
//   .video-section { padding: 48px 16px !important; }
//   .video-section video { min-height: 220px; }
// }

// @media(max-width: 480px) {
//   .video-section { padding: 40px 12px !important; }
//   .video-section video { min-height: 200px; }
// }
// `;

// const tickerItems = [
//   { sev: "S5", sevClass: "sev-5", text: "Emaar launches AED 3.2B tower adjacent to Burj Khalifa", loc: "Downtown Dubai" },
//   { sev: "S4", sevClass: "sev-4", text: "Record AED 65M penthouse sold — Dubai's highest residential deal", loc: "Palm Jumeirah" },
//   { sev: "S3", sevClass: "sev-3", text: "RERA confirms mandatory blockchain title deed registration Q3", loc: "DIFC" },
//   { sev: "S5", sevClass: "sev-5", text: "DLD reports AED 141.9B transactions — 22% YoY growth", loc: "Dubai-wide" },
//   { sev: "S4", sevClass: "sev-4", text: "Foreign buyers surge: 71% of off-plan sales to non-UAE nationals", loc: "All areas" },
//   { sev: "S3", sevClass: "sev-3", text: "Dubai Marina prime prices hit AED 2,100/sqft — 18% YoY", loc: "Dubai Marina" },
//   { sev: "S4", sevClass: "sev-4", text: "Nakheel confirms Palm Jebel Ali Phase 2, AED 12B investment", loc: "Jebel Ali" },
//   { sev: "S3", sevClass: "sev-3", text: "JVC records highest-ever rental yield at 9.1% — Q2 2025", loc: "JVC" },
// ];

// const testimonials = [
//   {
//     initials: "RM", persona: "Property Owner · UAE", stars: "★★★★★",
//     quote: (<>I own three units across JVC, Dubai Hills, and Arjan. In Q1 2026, the Arjan metro extension approval came through as an S4 infrastructure signal on ACQAR before any of my WhatsApp groups picked it up. <strong>I listed my unit the same afternoon. It sold in six days at asking price.</strong></>),
//     name: "Rajan Mehta", role: "Property Owner — 3 Units", location: "Dubai, UAE"
//   },
//   {
//     initials: "EV", persona: "Property Owner · Abroad", stars: "★★★★★",
//     quote: (<>I manage my Palm Jumeirah apartment from London. A RERA short-term rental circular hit as S4 Regulatory at 7am Dubai time — 9pm my time — <strong>before my own Dubai agent knew it existed.</strong> I responded, updated my NOC, and avoided a fine. That single alert justified everything.</>),
//     name: "Elena Vassiliev", role: "Property Owner — Palm Jumeirah", location: "London, United Kingdom"
//   },
//   {
//     initials: "KA", persona: "Property Buyer · UAE", stars: "★★★★★",
//     quote: (<>I'd been hunting in Dubai Creek Harbour for eight months, always too late. Three weeks into using ACQAR Signal, <strong>I caught a DLD transaction cluster — 18 deals in four days — before any portal repriced.</strong> I offered that week and paid AED 85,000 below where identical floors listed two weeks later.</>),
//     name: "Khalid Al-Ansari", role: "First-Time Property Buyer", location: "Abu Dhabi, UAE"
//   },
//   {
//     initials: "MF", persona: "Property Buyer · International", stars: "★★★★★",
//     quote: (<>By the time any Dubai launch reaches European media, the good units are gone. ACQAR Signal gave me an <strong>S5 alert on a Nakheel Dubai Islands launch three hours before reservations opened.</strong> I called my broker at midnight Milan time and reserved a unit. Simply not possible otherwise.</>),
//     name: "Marco Ferretti", role: "Property Buyer — Dubai Islands", location: "Milan, Italy"
//   },
//   {
//     initials: "PN", persona: "Portfolio Investor", stars: "★★★★★",
//     quote: (<>I treat Dubai real estate like an equity portfolio — entry timing, area rotation, yield arbitrage. <strong>The area momentum overlay showed JVC accumulating S3+ signals 11 weeks before Bayut's quarterly report flagged the same trend.</strong> I added two more units in that window. That changes your return profile permanently.</>),
//     name: "Priya Nair", role: "Portfolio Investor — 9 Units", location: "Dubai, UAE"
//   },
//   {
//     initials: "JC", persona: "Luxury RE Broker · DIFC", stars: "★★★★★",
//     quote: (<>In the AED 10M-plus segment, clients pay for intelligence no one else has. <strong>When an Emaar ultra-luxury launch hit as S5, I had pre-qualified four UHNW clients before the developer's press briefing.</strong> Three transacted. Over AED 80M in deals from a single early signal. ACQAR Signal is the first screen I open every morning.</>),
//     name: "James Crawford", role: "Director, Ultra-Prime Sales", location: "DIFC, Dubai"
//   },
// ];


// // function VideoEmbed() {
// //   return (
// //     <div style={{
// //       borderRadius: 'var(--radius-xl)',
// //       overflow: 'hidden',
// //       border: '1px solid var(--border-copper)',
// //       boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
// //     }}>
// //       <video
// //         controls
// //         playsInline
// //         autoPlay
// //         muted
// //         style={{ width: '100%', display: 'block' }}
// //       >
// //         <source src="/How_It_Work.mp4" type="video/mp4" />
// //       </video>
// //     </div>
// //   );
// // }


// function HowItWorksSection() {
//   return (
//     <section style={{ padding: '80px 0' }}>
//       {/* Heading */}
//       <div style={{ marginBottom: '40px', textAlign: 'center' }}>
//         <p style={{
//           fontSize: '13px',
//           fontWeight: '600',
//           letterSpacing: '0.15em',
//           textTransform: 'uppercase',
//           color: '#C17F3E',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           gap: '10px',
//           marginBottom: '16px',
//         }}>
//           <span style={{ display: 'inline-block', width: '32px', height: '1px', background: '#C17F3E' }} />
//           HOW IT WORKS
//           <span style={{ display: 'inline-block', width: '32px', height: '1px', background: '#C17F3E' }} />
//         </p>
//         <h2 style={{
//           fontSize: 'clamp(36px, 5vw, 60px)',
//           fontWeight: '800',
//           lineHeight: '1.05',
//           margin: 0,
//         }}>
//           <span style={{ color: '#1A1A1A' }}>How </span>
//           <span style={{ color: '#C17F3E' }}>ACQAR</span>
//           <span style={{ color: '#1A1A1A' }}> Works</span>
//         </h2>
//       </div>

//       {/* Video */}
//       <VideoEmbed />
//     </section>
//   );
// }

// function VideoEmbed() {
//   return (
//     <div style={{
//       borderRadius: 'var(--radius-xl)',
//       overflow: 'hidden',
//       border: '1px solid var(--border-copper)',
//       boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
//     }}>
//       <video
//         controls
//         playsInline
//         autoPlay
//         muted
//         poster="/share-preview.jpg"
//         style={{
//           width: '100%',
//           display: 'block',
//           minHeight: '200px',   // 👈 adds minimum height on mobile
//         }}
//       >
//         <source src="/How_It_Work.mp4" type="video/mp4" />
//       </video>
//     </div>
//   );
// }

// export default function AcqarSignal() {
//   const [theme, setTheme] = useState("dark");
 
//   const [marqueeKey, setMarqueeKey] = useState(0);

//   useEffect(() => {
//     const saved = localStorage.getItem("acqar-theme");
//     if (saved) {
//       setTheme(saved);
//     } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
//       setTheme("light");
//     }
//   }, []);

//   useEffect(() => {
//     if (theme === "light") {
//       document.documentElement.setAttribute("data-theme", "light");
//     } else {
//       document.documentElement.removeAttribute("data-theme");
//     }
//     localStorage.setItem("acqar-theme", theme);
//   }, [theme]);

//   // useEffect(() => { window.scrollTo(0, 0); }, []);
//   useEffect(() => {
//     window.scrollTo(0, 0);
//     trackEvent("page_viewed", { page: "signal_landing" });
//   }, []);


//   useEffect(() => {
//   const scrolled = { 25: false, 50: false, 75: false, 100: false };
//   const handleScroll = () => {
//     const scrollPercent = Math.round(
//       (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
//     );
//     if (scrollPercent >= 25 && !scrolled[25]) { scrolled[25] = true; trackEvent("scroll_depth", { page: "signal_landing", depth: "25%" }); }
//     if (scrollPercent >= 50 && !scrolled[50]) { scrolled[50] = true; trackEvent("scroll_depth", { page: "signal_landing", depth: "50%" }); }
//     if (scrollPercent >= 75 && !scrolled[75]) { scrolled[75] = true; trackEvent("scroll_depth", { page: "signal_landing", depth: "75%" }); }
//     if (scrollPercent >= 100 && !scrolled[100]) { scrolled[100] = true; trackEvent("scroll_depth", { page: "signal_landing", depth: "100%" }); }
//   };
//   window.addEventListener("scroll", handleScroll);
//   return () => window.removeEventListener("scroll", handleScroll);
// }, []);

// useEffect(() => {
//   const startTime = Date.now();
//   return () => {
//     const timeSpent = Math.round((Date.now() - startTime) / 1000);
//     trackEvent("time_spent", { page: "signal_landing", seconds: timeSpent });
//   };
// }, []);


//   useEffect(() => {
//     let timeout;
//     const handleResize = () => {
//       clearTimeout(timeout);
//       timeout = setTimeout(() => { setMarqueeKey(k => k + 1); }, 150);
//     };
//     requestAnimationFrame(() => {
//       requestAnimationFrame(() => { setMarqueeKey(k => k + 1); });
//     });
//     window.addEventListener('resize', handleResize);
//     return () => { window.removeEventListener('resize', handleResize); clearTimeout(timeout); };
//   }, []);

//    const toggleTheme = () => {
//     const next = theme === "light" ? "dark" : "light";
//     trackEvent("theme_toggle", { to: next });
//     setTheme(next);
//   };
//   const navigate = useNavigate();
// // const openSignIn = () => navigate("/login");

// const openSignIn = (location = "unknown") => {
//   trackEvent("cta_click", { location });
//   window.location.href = "/login";
// };

// const [user, setUser] = useState(null);

// useEffect(() => {
//   supabase.auth.getSession().then(({ data }) => {
//     setUser(data.session?.user ?? null);
//   });
//   const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//     setUser(session?.user ?? null);
//   });
//   return () => listener.subscription.unsubscribe();
// }, []);

//   return (
//     <>
//      <Helmet>
//   <title>Acqar Signal | AI Real Estate Market Intelligence — Dubai</title>
//   <meta name="description" content="Acqar Signal monitors every Dubai property transaction, off-plan launch, and regulation in real-time. AI-powered market intelligence for investors, brokers & developers." />
//   <link rel="canonical" href="https://www.acqar.com/signal" />
//   <meta property="og:title" content="Acqar Signal | AI Real Estate Market Intelligence — Dubai" />
//   <meta property="og:description" content="Real-time Dubai property signals — DLD transactions, off-plan launches, RERA alerts. S1–S5 AI severity scoring across 43 areas." />
//   <meta property="og:url" content="https://www.acqar.com/signal" />
//   <meta name="robots" content="index, follow" />
//   <script type="application/ld+json">{`
//     {
//       "@context": "https://schema.org",
//       "@type": "SoftwareApplication",
//       "name": "Acqar Signal",
//       "applicationCategory": "BusinessApplication",
//       "operatingSystem": "Web",
//       "url": "https://www.acqar.com/signal",
//       "description": "AI-powered real estate market intelligence platform monitoring every Dubai property transaction, off-plan launch, and regulation in real-time.",
//       "offers": {
//         "@type": "Offer",
//         "price": "0",
//         "priceCurrency": "AED",
//         "availability": "https://schema.org/InStock"
//       },
//       "provider": {
//         "@type": "Organization",
//         "name": "ACQAR",
//         "url": "https://www.acqar.com"
//       },
//       "featureList": [
//         "14 live data sources",
//         "S1-S5 AI severity scoring",
//         "Real-time Dubai property signals",
//         "DLD transaction monitoring",
//         "RERA regulatory alerts",
//         "43 Dubai areas covered"
//       ],
//       "aggregateRating": {
//         "@type": "AggregateRating",
//         "ratingValue": "4.9",
//         "reviewCount": "240",
//         "bestRating": "5"
//       }
//     }
//   `}</script>
//   <script type="application/ld+json">{`
//     {
//       "@context": "https://schema.org",
//       "@type": "FAQPage",
//       "mainEntity": [
//         {
//           "@type": "Question",
//           "name": "What is Acqar Signal?",
//           "acceptedAnswer": {
//             "@type": "Answer",
//             "text": "Acqar Signal is the UAE's first AI agent that monitors every Dubai property transaction, off-plan launch, regulation, and market movement in real-time — updated every 3 minutes across 14 data sources."
//           }
//         },
//         {
//           "@type": "Question",
//           "name": "How does Acqar Signal work?",
//           "acceptedAnswer": {
//             "@type": "Answer",
//             "text": "Acqar Signal deploys a persistent AI agent that fetches from RSS feeds, Google News, DLD signals, Reddit, and GDELT every 3 minutes. Each event is classified across 10 categories and scored S1-S5 by severity."
//           }
//         },
//         {
//           "@type": "Question",
//           "name": "Is Acqar Signal free?",
//           "acceptedAnswer": {
//             "@type": "Answer",
//             "text": "Yes, Acqar Signal is free to access. No credit card required. Live data updated every 3 minutes."
//           }
//         },
//         {
//           "@type": "Question",
//           "name": "How many Dubai areas does Acqar Signal cover?",
//           "acceptedAnswer": {
//             "@type": "Answer",
//             "text": "Acqar Signal monitors 43 Dubai areas with GPS-accurate mapping, covering every major community and district in Dubai."
//           }
//         }
//       ]
//     }
//   `}</script>
// </Helmet>
// <style>{styles}</style>

//       {/* ── NAV ── */}
//       <nav>
//         {/* Logo */}
//         <div className="nav-logo">
//           <div className="brand"><span>ACQ</span><span>AR</span></div>
//         </div>

//         {/* Desktop nav links (hidden below 768px) */}
//         <ul className="nav-links">
           
//           {/* <li><a href="https://www.acqar.com/truvalu" target="_blank" rel="noopener noreferrer">TRUVALU™</a></li> */}
//           <li><Link to="/truvalu">TRUVALU™</Link></li>
//            <li><a href="/pricing">PRICING</a></li>
//           <li><a href="https://www.acqar.com/blogs" target="_blank" rel="noopener noreferrer">RESOURCES</a></li>
         
//         </ul>

//         {/* Mobile nav links — compact inline, visible below 768px */}
//         <ul className="nav-links-mobile">
//           <li><a href="https://www.acqar.com/truvalu" target="_blank" rel="noopener noreferrer">TRUVALU™</a></li>
//           <li><a href="/pricing">PRICING</a></li>
//           <li><a href="https://www.acqar.com/blogs" target="_blank" rel="noopener noreferrer">RESOURCES</a></li>
//         </ul>

//         {/* Right actions */}
//         <div className="nav-actions">
//           <button
//             className="theme-toggle"
//             onClick={toggleTheme}
//             aria-label="Toggle theme"
//             title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
//           >
//             {theme === "dark" ? "☀" : "🌙"}
//           </button>
//           {user ? (
//   <button
//     className="btn-primary"
//   onClick={() => window.location.href = "/dashboard"}
//     style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
//   >
//     Dashboard 
//   </button>
// ) : (
//   <button
//     className="btn-primary"
//     onClick={openSignIn}
//     style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
//   >
//     Sign In 
//   </button>
// )}
//         </div>
//       </nav>

//       {/* LIVE TICKER */}
//       <div className="live-ticker">
//         <div className="ticker-label"><div className="ticker-dot"></div> Live Signals</div>
//         <div style={{ overflow: "hidden", flex: 1 }}>
//           <div className="ticker-track">
//             {[...tickerItems, ...tickerItems].map((item, i) => (
//               <div className="ticker-item" key={i}>
//                 <span className={`sev ${item.sevClass}`}>{item.sev}</span>
//                 {item.text}
//                 <span className="loc">· {item.loc}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* HERO */}
//       <section className="hero" id="hero" style={{ marginTop: 96 }}>
//         <div className="hero-grid-bg"></div>
//         <div className="hero-content">
//           <div className="hero-eyebrow"><div className="dot"></div> AI-Powered · Real-Time · Dubai Only</div>
//         <h1>The Bloomberg<br />of <em>Dubai Real<br /> Estate.</em></h1>
//           <p className="hero-sub">
//            ACQAR Signal is the <strong> UAE’s 1st AI agent</strong> that monitors every transaction, off-plan launch, regulation, and market movement across Dubai's property market — <strong>in real-time, before anyone else.</strong>
//           </p>
//           <div className="hero-cta-row">
//             <button className="btn-hero" onClick={() => openSignIn("hero")} style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
//              Access the Terminal →
//             </button>
//           <button className="btn-hero-ghost" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })} style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
//   ▶ How It Works
// </button>
//           </div>
//           <div className="hero-trust-row">
//             <div className="check">14 Live Data Sources</div>
//             <div className="check">S1–S5 AI Severity Scoring</div>
//             <div className="check">Updates Every 3 Minutes</div>
//           </div>
//         </div>

//         {/* Terminal Window */}
//         <div className="hero-visual">
//           <div className="terminal-window">
//             <div className="terminal-topbar">
//               <div className="terminal-dots"><span></span><span></span><span></span></div>
//               <div className="terminal-title">ACQAR SIGNAL — Dubai RE Intelligence</div>
//               <span className="terminal-live-badge">● Live</span>
//             </div>
//             <div className="terminal-stats-bar">
//               <div className="t-stat"><div className="label">Signals Today</div><div className="value up">247</div><div className="delta">↑ 18% vs yesterday</div></div>
//               <div className="t-stat"><div className="label">S4/S5 Alerts</div><div className="value" style={{ color: "#EF4444" }}>12</div><div className="delta" style={{ color: "var(--text-muted)" }}>Active now</div></div>
//               <div className="t-stat"><div className="label">Areas Monitored</div><div className="value copper">43</div><div className="delta" style={{ color: "var(--text-muted)" }}>All Dubai zones</div></div>
//               <div className="t-stat"><div className="label">Last Update</div><div className="value" style={{ fontSize: 12, color: "var(--green)" }}>14s ago</div><div className="delta" style={{ color: "var(--text-muted)" }}>Auto-refresh 3min</div></div>
//             </div>
//             <div className="terminal-map">
//               <div className="map-grid-line h" style={{ top: "33%" }}></div>
//               <div className="map-grid-line h" style={{ top: "66%" }}></div>
//               <div className="map-grid-line v" style={{ left: "25%" }}></div>
//               <div className="map-grid-line v" style={{ left: "50%" }}></div>
//               <div className="map-grid-line v" style={{ left: "75%" }}></div>
//               <div className="map-dot s5" style={{ left: "50%", top: "38%" }}></div>
//               <div className="map-label" style={{ left: "50%", top: "38%" }}>Downtown</div>
//               <div className="map-dot s4" style={{ left: "22%", top: "55%" }}></div>
//               <div className="map-label" style={{ left: "22%", top: "55%" }}>Palm</div>
//               <div className="map-dot s4" style={{ left: "18%", top: "65%" }}></div>
//               <div className="map-label" style={{ left: "18%", top: "65%" }}>Marina</div>
//               <div className="map-dot s3" style={{ left: "54%", top: "44%" }}></div>
//               <div className="map-dot s3" style={{ left: "46%", top: "42%" }}></div>
//               <div className="map-dot s2" style={{ left: "32%", top: "62%" }}></div>
//               <div className="map-dot s2" style={{ left: "38%", top: "68%" }}></div>
//               <div className="map-dot s3" style={{ left: "66%", top: "32%" }}></div>
//               <div className="map-dot s4" style={{ left: "60%", top: "40%" }}></div>
//             </div>
//             <div className="terminal-feed">
//               <div className="feed-header"><div className="title">Live Event Feed</div><div className="count">247 signals</div></div>
//               {[
//                 { sev: "S5", sevClass: "sev-5", title: "Emaar AED 3.2B tower launch — adjacent to Burj Khalifa", meta: "Off-Plan · Arabian Business", area: "Downtown", time: "2m ago", isNew: true },
//                 { sev: "S4", sevClass: "sev-4", title: "Record AED 65M penthouse sold — Palm Jumeirah", meta: "Transaction · The National", area: "Palm", time: "14m ago" },
//                 { sev: "S3", sevClass: "sev-3", title: "RERA blockchain title deed mandate — effective Q3", meta: "Regulatory · Gulf News", area: "DIFC", time: "31m ago" },
//                 { sev: "S2", sevClass: "sev-2", title: "JVC rental yield stabilises at 9.1% — highest in Dubai", meta: "Rental Yield · Bayut Blog", area: "JVC", time: "52m ago" },
//               ].map((row, i) => (
//                 <div className={`feed-row${row.isNew ? " new" : ""}`} key={i}>
//                   <div className="feed-sev"><span className={`sev-pill ${row.sevClass}`}>{row.sev}</span></div>
//                   <div className="feed-content"><div className="feed-title">{row.title}</div><div className="feed-meta">{row.meta}</div></div>
//                   <div className="feed-area">{row.area}</div>
//                   <div className="feed-time">{row.time}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>


// {/* HOW ACQAR WORKS — Video Section */}

// <section className="video-section" style={{ padding: '80px 48px', background: 'var(--dark)' }}>
//   <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 0px' }}>
    
//     {/* Heading — same style as other sections */}
//     <div style={{ marginBottom: '48px', textAlign: 'center' }}>
//       <div className="section-label" style={{ justifyContent: 'center' }}>See it in Action</div>
//       <h2 className="section-title" style={{ textAlign: 'center' }}>
//         How <span className="text-copper">ACQAR</span> Works
//       </h2>
//     </div>

//     {/* Video */}
//     <VideoEmbed />

//   </div>
// </section>

//       {/* AI CHAT SECTION */}
//       <section style={{
//         padding: "80px 48px",
//         background: "var(--dark-2)",
//         borderTop: "1px solid var(--border)",
//       }}>
//         <div style={{ maxWidth: 1100, margin: "0 auto" }}>
//           <div style={{ textAlign: "center", marginBottom: 40 }}>
//             <div className="section-label" style={{ justifyContent: "center" }}>
//               AI Property Assistant
//             </div>
//             <h2 className="section-title" style={{ textAlign: "center" }}>
//               Ask <span className="text-copper">ACQAR AI</span>
//             </h2>
//             <p className="section-sub" style={{
//               margin: "0 auto",
//               textAlign: "center",
//             }}>
//               Instant answers on Dubai prices, yields, and market trends.
//               Sign in free to get started.
//             </p>
//           </div>
//           <AcqarAIChat />
//         </div>
//       </section>


//       {/* PROBLEM SECTION */}
//       <section className="problem-section" id="problem">
//         <div className="problem-layout">
//           <div className="problem-intro">
//             <div className="section-label">The Problem</div>
//             <h2 className="section-title">Dubai's Market Never Sleeps.<br /><span className="text-copper">You Can't Afford to Either.</span></h2>
//             <p className="section-sub" style={{ margin: "0 auto", textAlign: "center" }}>Dubai real estate moves at a speed unlike any market on earth. Off-plan launches sell out in hours. Regulations shift overnight. Billion-dirham opportunities open and close before most investors even see the news.</p>
//           </div>
//           <div className="problem-list">
//             {[
//               { num: "01", tag: "Speed", title: "By The Time You Read It, It's Gone", desc: (<>News sites, portals, and newsletters publish 6–24 hours after an event. <strong>Binghatti Apex sold 180 units in 4 hours.(Arabian Business, 2026)</strong> Your inbox never stood a chance.</>) },
//               { num: "02", tag: "Fragmentation", title: "Manual Monitoring Is Chaos", desc: (<>You're juggling <strong>10 WhatsApp groups, 5 property portals, 4 news sites, and 3 developer newsletters</strong> — manually, every single day. And still missing signals.</>) },
//               { num: "03", tag: "Intelligence Gap", title: "The Smart Money Has Better Data", desc: (<>Institutional investors and tier-1 brokers have teams dedicated to monitoring this market. Without the same intelligence, <strong>you're always reacting, never anticipating.</strong></>) },
//               { num: "04", tag: "Compliance", title: "Regulatory Surprises Kill Deals", desc: (<>RERA circulars, DLD policy changes, golden visa thresholds — <strong>one missed regulation can invalidate a deal or trigger a penalty.</strong> These come with no warning.</>) },
//               { num: "05", tag: "Momentum", title: "Area Momentum Is Invisible", desc: (<>Which neighbourhood is quietly accumulating deals? Which area just got a school, metro line, or park approved? <strong>These signals are buried in 200 news articles a day.</strong></>) },
//                { num: "06", tag: "Sentiment", title: "Community Signals Get Lost in Noise", desc: (<>Reddit discussions, broker WhatsApp leaks, r/DubaiRealEstate threads — <strong>real sentiment from real investors</strong> is scattered, unfiltered, and impossible to act on.</>) },
//             ].map((row, i) => (
//               <div className="problem-row" key={i}>
//                 <div className="problem-num">{row.num}</div>
//                 <div className="problem-title-col"><div className="problem-tag-pill">{row.tag}</div><h3 className="problem-title">{row.title}</h3></div>
//                 <div className="problem-desc-col"><p>{row.desc}</p></div>
//               </div>
//             ))}
//           </div>
//           <div className="problem-cost-bar">
//             <div className="cost-text">
//               <h3>The Real Cost of Being Uninformed</h3>
//               <p>A single missed S5 signal — one off-plan launch, one major transaction, one regulatory shift — can represent millions in lost opportunity or unnecessary risk in Dubai's market.</p>
//             </div>
//             <div className="cost-number">
//               <div className="amount">AED 0</div>
//               <div className="label">Cost of ACQAR Signal vs. the alternative</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* FEATURES */}
//       <section id="features">
//         <div className="features-section">
//           <div className="features-header">
//             <div className="section-label">The Solution</div>
//             <h2 className="section-title">One AI Agent.<br /><span className="text-copper">Every Signal. Nothing Missed.</span></h2>
//             <p className="section-sub">ACQAR Signal deploys a persistent AI agent that monitors 14 data sources simultaneously, classifies every event by category and severity, and surfaces exactly what matters — plotted on a live map of Dubai.</p>
//           </div>
//           <div className="features-grid">
//             <div className="feature-card large">
//               <div>
//                 <div className="feature-icon">
//                   <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 7.5a12 12 0 0 1 19 0"/><path d="M5.5 11a8 8 0 0 1 13 0"/><path d="M8.5 14.5a4 4 0 0 1 7 0"/><line x1="12" y1="18" x2="12" y2="18.5" strokeWidth="2"/></svg>
//                 </div>
//                 <h3>14 Sources. One Feed. Zero Manual Work.</h3>
//                 <p>The Signal AI agent simultaneously monitors RSS feeds from Gulf News, Arabian Business, The National, Zawya, Bayut, and Property Finder; Google News feeds for DLD, RERA, and major developers; Reddit's r/DubaiRealEstate; GDELT global events; and direct DLD transaction signals. Every 3 minutes, automatically.</p>
//                 <div className="feature-tags">
//                   {["RSS Feeds", "Google News", "Reddit", "DLD Direct", "GDELT"].map(t => <span className="ftag active" key={t}>{t}</span>)}
//                   {["Twitter (coming)", "LinkedIn (coming)"].map(t => <span className="ftag" key={t}>{t}</span>)}
//                 </div>
//               </div>
//               <div className="source-list">
//                 {[
//                   { name: "Gulf News Property RSS", active: true },
//                   { name: "The National Property RSS", active: true },
//                   { name: "Arabian Business RE RSS", active: true },
//                   { name: "DLD Transaction Signals", active: true },
//                   { name: "Reddit r/DubaiRealEstate", active: true },
//                   { name: "Google News: RERA / DLD", active: true },
//                   { name: "GDELT Global Events", active: true },
//                   { name: "Twitter / LinkedIn", active: false },
//                 ].map((s, i) => (
//                   <div className="source-item" key={i}>
//                     <div className="src-dot" style={!s.active ? { background: "var(--text-muted)" } : {}}></div>
//                     {s.name}
//                     <span className="src-count" style={!s.active ? { color: "var(--text-muted)" } : {}}>{s.active ? "Live" : "Soon"}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="feature-card">
//               <div className="feature-icon">
//                 <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01"/><path d="M6 12h3M15 12h3"/><path d="M9 12a1.5 1.5 0 0 0 0 3h6a1.5 1.5 0 0 0 0-3"/></svg>
//               </div>
//               <h3>AI Severity Classification — S1 to S5</h3>
//               <p>Every event is instantly classified by our AI engine across 10 categories — Transaction, Off-Plan, Regulatory, Construction, Investment, Price Signal, Rental Yield, Free Zone, Infrastructure, and Foreign Buyers — then assigned a severity score from S1 (watch) to S5 (critical alert).</p>
//               <div className="feature-tags">
//                 <span className="ftag active" style={{ color: "#EF4444", borderColor: "rgba(239,68,68,0.4)" }}>S5 Critical</span>
//                 <span className="ftag active" style={{ color: "#F59E0B", borderColor: "rgba(245,158,11,0.4)" }}>S4 High</span>
//                 <span className="ftag active">S3 Medium</span>
//                 <span className="ftag">S2 Standard</span>
//                 <span className="ftag">S1 Watch</span>
//               </div>
//             </div>

//             <div className="feature-card">
//               <div className="feature-icon">
//                 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
//               </div>
//               <h3>Live Geographic Intelligence</h3>
//               <p>Every signal is geolocated and plotted on an interactive Dubai map. Watch deals, launches, and regulatory changes appear in real-time across 43 monitored areas — colour-coded by severity. Identify area momentum clusters the moment they form.</p>
//               <div className="feature-tags">
//                 {["43 Areas", "GPS-accurate", "Momentum clusters"].map(t => <span className="ftag active" key={t}>{t}</span>)}
//                 <span className="ftag">Overlay layers</span>
//               </div>
//             </div>

//             <div className="feature-card">
//               <div className="feature-icon">
//                 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="2"/></svg>
//               </div>
//               <h3>Community Signal Panel</h3>
//               <p>A curated, AI-filtered stream of real investor sentiment from Reddit, social media, and community sources — stripped of noise and formatted as actionable signals. Know what the smart money is actually saying.</p>
//               <div className="feature-tags">
//                 <span className="ftag active">Reddit r/DubaiRE</span>
//                 <span className="ftag active">Sentiment scored</span>
//                 <span className="ftag">Broker intel (coming)</span>
//               </div>
//             </div>

//             <div className="feature-card">
//               <div className="feature-icon">
//                 <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v18h18"/><path d="M7 16l4-5 4 3 4-7"/><circle cx="7" cy="16" r="1" fill="currentColor" stroke="none"/><circle cx="11" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="7" r="1" fill="currentColor" stroke="none"/></svg>
//               </div>
//               <h3>Institutional-Grade Reports Tab</h3>
//               <p>All S4 and S5 events are automatically surfaced in the Reports tab — ready for portfolio review, investor presentations, or due diligence. Structured, sourced, and exportable.</p>
//               <div className="feature-tags">
//                 <span className="ftag active">S4/S5 only</span>
//                 <span className="ftag active">Sourced &amp; cited</span>
//                 <span className="ftag">PDF export (coming)</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* DASHBOARD */}
//       <section className="dashboard-section" id="dashboard">
//         <div className="dashboard-intro">
//           <div className="section-label" style={{ justifyContent: "center" }}>The Terminal</div>
//           <h2 className="section-title" style={{ textAlign: "center" }}>One Screen.<br /><span className="text-copper">The Entire Dubai Market.</span></h2>
//           <p className="section-sub" style={{ margin: "0 auto", textAlign: "center" }}>Built like a Bloomberg Terminal, designed for Dubai real estate. Every live signal, every area, every source — in one unified intelligence interface.</p>
//         </div>
//         <div className="dashboard-frame" style={{ position: "relative" }}>
//           <div className="dash-topbar">
//             <div className="dash-logo"><span>ACQ</span><span style={{ color: "var(--text-primary)" }}>AR</span>&nbsp;<span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: 12 }}>SIGNAL</span></div>
//             <div className="dash-tabs">
//               {[
//                 { label: "Live Feed", active: true },
//                 { label: "Map View" },
//                 { label: "Reports" },
//                 { label: "Community" },
//                 { label: "Analytics" },
//               ].map((tab, i) => (
//                 <div className={`dash-tab${tab.active ? " active" : ""}`} key={i}>{tab.label}</div>
//               ))}
//             </div>
//             <div className="dash-status">
//               <div className="live-ind"><div className="ticker-dot" style={{ background: "var(--green)" }}></div>&nbsp;Live</div>
//               <span>247 signals · 43 areas</span>
//               <span>Last fetch: 14s ago</span>
//             </div>
//           </div>

//           <div className="dash-body">
//             {/* Left sidebar */}
//             <div className="dash-sidebar-left">
//               <div className="dash-sidebar-section">
//                 <div className="dash-sidebar-title">Time Filter</div>
//                 <div>
//                   {[["24H", true], ["1H", false], ["6H", false], ["72H", false]].map(([l, a]) => (
//                     <span className={`filter-chip${a ? " active" : ""}`} key={l}><span className="chip-dot"></span> {l}</span>
//                   ))}
//                 </div>
//               </div>
//               <div className="dash-sidebar-section">
//                 <div className="dash-sidebar-title">Severity</div>
//                 <div>
//                   <span className="filter-chip active" style={{ color: "#EF4444", borderColor: "rgba(239,68,68,0.4)" }}><span className="chip-dot" style={{ background: "#EF4444" }}></span> S5</span>
//                   <span className="filter-chip active" style={{ color: "#F59E0B", borderColor: "rgba(245,158,11,0.4)" }}><span className="chip-dot" style={{ background: "#F59E0B" }}></span> S4</span>
//                   <span className="filter-chip active"><span className="chip-dot"></span> S3</span>
//                   <span className="filter-chip">S2</span>
//                   <span className="filter-chip">S1</span>
//                 </div>
//               </div>
//               <div className="dash-sidebar-section">
//                 <div className="dash-sidebar-title">Category</div>
//                 <div>
//                   {[["Transaction", true], ["Off-Plan", true], ["Regulatory", false], ["Price Signal", true], ["Construction", false], ["Rental Yield", false]].map(([l, a]) => (
//                     <span className={`filter-chip${a ? " active" : ""}`} key={l}>{l}</span>
//                   ))}
//                 </div>
//               </div>
//               <div style={{ overflowY: "auto", flex: 1 }}>
//                 <div className="dash-sidebar-title" style={{ padding: "10px 12px 0", margin: 0 }}>Signal Rows</div>
//                 {[
//                   { sev: "S5", bg: "rgba(239,68,68,0.15)", color: "#EF4444", title: "Emaar AED 3.2B tower — Downtown", meta: "Off-Plan · 2m ago", active: true },
//                   { sev: "S4", bg: "rgba(245,158,11,0.15)", color: "#F59E0B", title: "AED 65M penthouse — Palm Jumeirah", meta: "Transaction · 14m ago" },
//                   { sev: "S4", bg: "rgba(245,158,11,0.15)", color: "#F59E0B", title: "Nakheel Palm Jebel Ali Ph2 AED 12B", meta: "Off-Plan · 31m ago" },
//                   { sev: "S3", bg: "rgba(184,115,51,0.15)", color: "var(--copper)", title: "RERA blockchain mandate Q3 2025", meta: "Regulatory · 52m ago" },
//                   { sev: "S3", bg: "rgba(184,115,51,0.15)", color: "var(--copper)", title: "Dubai Hills 4BR AED 12.5M sold", meta: "Transaction · 1h ago" },
//                   { sev: "S2", bg: "rgba(59,130,246,0.15)", color: "#3B82F6", title: "JVC rental yield 9.1% — Q2 record", meta: "Rental · 2h ago" },
//                 ].map((s, i) => (
//                   <div className={`signal-row${s.active ? " active" : ""}`} key={i}>
//                     <div className="sig-sev-badge" style={{ background: s.bg, color: s.color }}>{s.sev}</div>
//                     <div className="sig-content"><div className="sig-title">{s.title}</div><div className="sig-meta">{s.meta}</div></div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Center map */}
//             <div className="dash-map">
//               <div className="dash-map-bg"></div>
//               {["25%", "50%", "75%"].map(t => <div className="map-grid-line h" style={{ top: t }} key={t}></div>)}
//               {["20%", "40%", "60%", "80%"].map(l => <div className="map-grid-line v" style={{ left: l }} key={l}></div>)}
//               {[
//                 { left: "52%", top: "36%", size: 28, bg: "rgba(239,68,68,0.2)", border: "#EF4444", core: 10, coreBg: "#EF4444", coreGlow: "#EF4444", label: "Downtown", delay: "" },
//                 { left: "19%", top: "55%", size: 22, bg: "rgba(245,158,11,0.2)", border: "#F59E0B", core: 8, coreBg: "#F59E0B", label: "Palm", delay: "0.5s" },
//                 { left: "15%", top: "65%", size: 22, bg: "rgba(245,158,11,0.2)", border: "#F59E0B", core: 8, coreBg: "#F59E0B", label: "Marina", delay: "1s" },
//                 { left: "56%", top: "42%", size: 18, bg: "rgba(184,115,51,0.2)", border: "var(--copper)", core: 7, coreBg: "var(--copper)", label: "Bus. Bay", delay: "0.3s" },
//                 { left: "47%", top: "40%", size: 16, bg: "rgba(184,115,51,0.2)", border: "var(--copper)", core: 6, coreBg: "var(--copper)", label: "DIFC", delay: "0.8s" },
//                 { left: "68%", top: "30%", size: 16, bg: "rgba(184,115,51,0.2)", border: "var(--copper)", core: 6, coreBg: "var(--copper)", label: "Creek Harbour", delay: "1.2s" },
//                 { left: "32%", top: "63%", size: 14, bg: "rgba(59,130,246,0.2)", border: "#3B82F6", core: 5, coreBg: "#3B82F6", label: "JVC", delay: "0.6s" },
//                 { left: "40%", top: "72%", size: 14, bg: "rgba(59,130,246,0.2)", border: "#3B82F6", core: 5, coreBg: "#3B82F6", label: "Dubai Hills", delay: "0.4s" },
//                 { left: "62%", top: "44%", size: 20, bg: "rgba(245,158,11,0.2)", border: "#F59E0B", core: 7, coreBg: "#F59E0B", label: "MBR City", delay: "0.9s" },
//               ].map((hs, i) => (
//                 <div className="map-hotspot" style={{ left: hs.left, top: hs.top }} key={i}>
//                   <div className="hs-ring" style={{ width: hs.size, height: hs.size, background: hs.bg, border: `2px solid ${hs.border}`, animationDelay: hs.delay }}></div>
//                   <div className="hs-core" style={{ width: hs.core, height: hs.core, background: hs.coreBg, boxShadow: hs.coreGlow ? `0 0 12px ${hs.coreGlow}` : undefined }}></div>
//                   <div className="hs-label">{hs.label}</div>
//                 </div>
//               ))}
//               <div className="map-event-card">
//                 <div className="mec-top">
//                   <span className="mec-loc">📍 Downtown Dubai</span>
//                   <span className="sev-pill sev-5" style={{ fontSize: 9, padding: "2px 7px", borderRadius: 3, background: "rgba(239,68,68,0.2)", color: "#EF4444", fontWeight: 800 }}>S5 · Critical</span>
//                 </div>
//                 <div className="mec-title">Emaar launches Burj Khalifa-adjacent mega-tower with AED 3.2B GDV</div>
//                 <div className="mec-meta"><span>Off-Plan</span><span className="mec-price">AED 3.2B</span><span>Arabian Business · 2m ago</span></div>
//               </div>
//               <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(13,13,13,0.85)", backdropFilter: "blur(8px)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 9 }}>
//                 <div style={{ marginBottom: 6, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase" }}>Signal Severity</div>
//                 <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
//                   {[["#EF4444", "S5 Critical", "0 0 6px #EF4444"], ["#F59E0B", "S4 High", ""], ["var(--copper)", "S3 Medium", ""], ["#3B82F6", "S2 Standard", ""]].map(([color, label, shadow]) => (
//                     <div style={{ display: "flex", alignItems: "center", gap: 6 }} key={label}>
//                       <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: shadow || undefined }}></div>
//                       <span style={{ color: "var(--text-secondary)" }}>{label}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Right sidebar */}
//             <div className="dash-sidebar-right">
//               <div className="analytics-block">
//                 <div className="dash-sidebar-title">Signals by Category (24H)</div>
//                 <div className="mini-bar-chart">
//                   {[[true, "90%"], [false, "60%"], [true, "75%"], [false, "40%"], [false, "55%"], [true, "85%"], [false, "30%"], [false, "50%"]].map(([active, h], i) => (
//                     <div className={`mini-bar${active ? " active" : ""}`} style={{ height: h }} key={i}></div>
//                   ))}
//                 </div>
//                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "var(--text-muted)", marginTop: 4 }}>
//                   {["OffPlan", "Trans", "Price", "Reg", "Const", "Invest", "Rent", "Int'l"].map(l => <span key={l}>{l}</span>)}
//                 </div>
//               </div>
//               <div className="analytics-block">
//                 <div className="dash-sidebar-title">Area Momentum</div>
//                 <div className="area-momentum-list">
//                   {[["Downtown", "100%", "#EF4444", 18], ["Palm Jumeirah", "78%", "var(--copper)", 14], ["Business Bay", "66%", "var(--copper)", 12], ["Dubai Marina", "55%", "var(--copper)", 10], ["MBR City", "44%", "var(--copper)", 8], ["Creek Harbour", "33%", "var(--copper)", 6]].map(([name, w, color, count]) => (
//                     <div className="momentum-row" key={name}>
//                       <span className="m-name">{name}</span>
//                       <div className="m-bar-wrap"><div className="m-bar" style={{ width: w, background: color }}></div></div>
//                       <span className="m-count">{count}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div className="analytics-block">
//                 <div className="dash-sidebar-title">Pipeline Status</div>
//                 <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
//                   {["RSS Feeds", "DLD Signals", "Reddit Feed", "GDELT Events"].map((src, i) => (
//                     <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, padding: "5px 0", borderBottom: i < 3 ? "1px solid var(--border)" : undefined }} key={src}>
//                       <span style={{ color: "var(--text-secondary)" }}>{src}</span>
//                       <span style={{ color: "var(--green)", fontWeight: 700 }}>● Live</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div className="chat-input-bar">
//                 <div className="chat-input"><span>Ask the AI agent...</span><span className="send-icon">↑</span></div>
//               </div>
//             </div>
//           </div>

//           <div className="dash-statusbar">
//             <div className="status-items">
//               <div className="status-item"><div className="si-dot" style={{ background: "var(--green)" }}></div> Connected</div>
//               <div className="status-item"><div className="si-dot" style={{ background: "var(--copper)" }}></div> 247 signals in store</div>
//               <div className="status-item"><div className="si-dot" style={{ background: "var(--blue)" }}></div> 43 areas monitored</div>
//               <div className="status-item">14 active sources</div>
//             </div>
//             <div>© 2025 ACQARLABS L.L.C-FZ · RICS-Aligned Intelligence</div>
//           </div>

//           <div className="dashboard-cta-overlay" style={{ pointerEvents: 'none' }}>
//             <div className="overlay-cta" style={{ pointerEvents: 'auto' }}>
//               <p className="blur-notice"><strong>This is your competition's edge.</strong> Request access to see the full, live terminal.</p>
//               <button
//                 className="btn-hero"
//                 style={{ fontSize: 16, pointerEvents: 'auto', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
//                onClick={() => openSignIn("dashboard_overlay")}
//               >
//                 Access the Terminal →
//               </button>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* HOW IT WORKS */}
//       <section id="how-it-works">
//         <div className="hiw-section">
//           <div className="features-header" style={{ textAlign: "center", marginBottom: 0 }}>
//             <div className="section-label" style={{ justifyContent: "center" }}>How It Works</div>
//             <h2 className="section-title" style={{ textAlign: "center" }}>From Market Event to<br /><span className="text-copper">Your Screen in Minutes.</span></h2>
//             <p className="section-sub" style={{ margin: "0 auto", textAlign: "center" }}>A fully autonomous AI pipeline that never sleeps, never misses, and never needs prompting.</p>
//           </div>
//           <div className="hiw-grid">
//             <div className="hiw-connector"></div>
//             {[
//               { n: "1", title: "Agent Monitors 14 Sources", desc: "Every 3 minutes, the AI agent fetches from RSS feeds, Google News, DLD signals, Reddit, and GDELT — automatically, in parallel." },
//               { n: "2", title: "AI Filters Dubai RE Only", desc: "Irrelevant content is discarded using a strict Dubai real estate relevance filter. Only property intelligence passes through." },
//               { n: "3", title: "Classified by Severity", desc: "Each event is categorised (10 types) and scored S1–S5 by an AI classifier trained on Dubai market dynamics and institutional frameworks." },
//               { n: "4", title: "Delivered to Your Terminal", desc: "New signals appear on your map and feed in real-time via Socket.io push. No refresh needed. High-severity signals alert immediately." },
//             ].map((card) => (
//               <div className="hiw-card" key={card.n}>
//                 <div className="hiw-number">{card.n}</div>
//                 <h4>{card.title}</h4>
//                 <p>{card.desc}</p>
//               </div>
//             ))}
//           </div>

      

//         </div>
//       </section>

//       {/* STATS */}
//       <section className="stats-section">
//         <div className="stats-grid">
//           {[
//             { num: "14", label: "Live Data Sources\nMonitored Simultaneously", sub: "RSS · Google News · Reddit · DLD · GDELT" },
//             { num: "43", label: "Dubai Areas Covered\nWith GPS-Accurate Mapping", sub: "Every major community and district" },
//             { num: "3min", label: "Refresh Cycle\nFaster Than Any News Outlet", sub: "Automated · Continuous · Never sleeps" },
//             { num: "S1–S5", label: "AI Severity Scoring\nAcross 10 Event Categories", sub: "From watch signals to critical alerts" },
//           ].map((s) => (
//             <div className="stat-block" key={s.num}>
//               <div className="stat-num">{s.num}</div>
//               <div className="stat-label" style={{ whiteSpace: "pre-line" }}>{s.label}</div>
//               <div className="stat-sub">{s.sub}</div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* TESTIMONIALS */}
//       <section>
//         <div>
//           <div style={{ maxWidth: 1200, margin: "0 auto 52px", textAlign: "center", padding: "0 24px" }}>
//             <div className="section-label" style={{ justifyContent: "center" }}>Trusted By Those Who Act First</div>
//             <h2 className="section-title" style={{ textAlign: "center" }}>The Edge Every<br /><span className="text-copper">Market Player Needs.</span></h2>
//           </div>
//           <div className="marquee-wrap" key={marqueeKey}>
//             <div className="marquee-track">
//               {[...testimonials, ...testimonials].map((t, i) => (
//                 <div className="testimonial-card" key={i}>
//                   <div className="t-stars">{t.stars}</div>
//                   <div className="t-persona"><div className="t-persona-dot"></div>{t.persona}</div>
//                   <p className="t-quote">{t.quote}</p>
//                   <div className="t-author">
//                     <div className="t-avatar">{t.initials}</div>
//                     <div className="t-info">
//                       <div className="name">{t.name}</div>
//                       <div className="role">{t.role}</div>
//                       <div className="location">{t.location}</div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* FINAL CTA */}
//       <section className="final-cta-section" id="final-cta">
//         <div className="final-cta-content">
//           <div className="final-cta-eyebrow"><div className="ticker-dot"></div> ACQAR Signal — Early Access Open</div>
//           <h2>Stop Watching.<br /><span className="text-copper">Start Knowing.</span></h2>
//           <p>Join the investors, brokers, and analysts who have given themselves the same real-time intelligence edge that institutional money has always had. Dubai's market moves at speed. Now, so do you.</p>
//           <div className="final-cta-buttons">
//             <button className="btn-hero" style={{ fontSize: 16, padding: "18px 36px", touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }} onClick={() => openSignIn("final_cta")}>
//               Access the Terminal →
//             </button>
//             <a href="https://www.acqar.com" target="_blank" rel="noreferrer" className="btn-hero-ghost" style={{ fontSize: 15, padding: "18px 28px" }}>Learn About ACQAR ↗</a>
//           </div>
//           <div className="final-trust">
//             <span>Free to Access</span>
//             <span>No Credit Card Required</span>
//             <span>Live Data · Updated Every 3 Minutes</span>
//             <span>RICS-Aligned Intelligence</span>
//           </div>
//         </div>
//       </section>

//       {/* FOOTER */}
//       <footer style={{ position: 'relative', background: 'var(--dark-card)', borderTop: '1px solid var(--border)', fontFamily: "'Inter', sans-serif" }}>
//         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent 0%, #B87333 35%, #B87333 65%, transparent 100%)' }}></div>
//         <div className="footer-inner-wrap">
//           <div className="footer-main-grid" style={{ marginBottom: 80 }}>
//             {/* Brand column */}
//             <div>
//               <div style={{ marginBottom: 24, lineHeight: 1 }}>
//                 <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px', display: 'inline-block' }}>
//                   <span style={{ color: '#B87333' }}>ACQ</span><span style={{ color: 'var(--text-primary)' }}>AR</span>
//                 </span>
//               </div>
//               <p style={{ fontSize: 12, lineHeight: 1.75, color: 'rgba(10,10,10,0.5)', fontWeight: 500, marginBottom: 28, maxWidth: 280 }}>
//                 An AI-powered property intelligence platform built exclusively for Dubai real estate. Independent, institutional-quality, and always on.
//               </p>
//               {/* <div className="footer-rics-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'white', border: '1px solid rgba(184,115,51,0.2)', borderRadius: 999, marginBottom: 32 }}>
//                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
//                   <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M9 12l2 2 4-4" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//                 <span className="footer-rics-text" style={{ fontSize: 9, fontWeight: 900, color: 'rgba(10,10,10,0.7)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>RICS-Aligned Intelligence</span>
//               </div> */}
//               <div style={{ display: 'flex', gap: 12 }}>
//                 {[
//                   { href: 'https://www.linkedin.com/company/acqar', label: 'LinkedIn', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
//                   { href: 'https://www.instagram.com/acqar.dxb/', label: 'Instagram', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
//                 ].map(({ href, label, icon }) => (
//                   <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="footer-social-link">
//                     {icon}
//                   </a>
//                 ))}
//               </div>
//             </div>

//             {/* Product column */}
//             <div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
//                 <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#B87333', opacity: 0.7 }}></span>
//                 <h6 style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#0A0A0A', margin: 0 }}>Product</h6>
//               </div>
//               <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
//                 {[
//                   { label: 'ACQAR TRUVALU™', active: true, href: 'https://www.acqar.com/truvalu' },
//                   { label: 'ACQAR SIGNAL™', active: true, href: 'https://www.acqar.com/' },
//                   { label: 'ACQAR PASSPORT™' },
//                   { label: 'PRICING', active: true, href: '/pricing' },
//                 ].map(({ label, active, soon, href }) => (
//                   <li key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, fontWeight: 600, color: 'rgba(10,10,10,0.55)', cursor: active ? 'pointer' : 'default' }}>
//                     {href ? (
//                       <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{label}</a>
//                     ) : label}
//                     {soon && <span style={{ padding: '1px 6px', fontSize: 8, fontWeight: 900, textTransform: 'uppercase', background: 'rgba(184,115,51,0.1)', color: '#B87333', border: '1px solid rgba(184,115,51,0.2)', borderRadius: 4 }}>Soon</span>}
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Company column */}
//             <div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
//                 <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#B87333', opacity: 0.7 }}></span>
//                 <h6 style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#0A0A0A', margin: 0 }}>Company</h6>
//               </div>
//               <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
//                 {['About ACQAR',  'Contact Us'].map(l => (
//   <li key={l} style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(10,10,10,0.55)', cursor: 'pointer' }}>{l}</li>
// ))}
// <li style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(10,10,10,0.55)' }}>
//   <a href="/broker" style={{ color: 'inherit', textDecoration: 'none' }}>Brokers</a>
// </li>
//               </ul>
//             </div>

//             {/* Legal column */}
//             <div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
//                 <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#B87333', opacity: 0.7 }}></span>
//                 <h6 style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#0A0A0A', margin: 0 }}>Legal & Info</h6>
//               </div>
//               <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
//                 {[
//                   { label: 'Intelligence Blog', href: 'https://www.acqar.com/blogs' },
//                   { label: 'Terms of Use', href: 'https://www.acqar.com/terms' },
//                   { label: 'Privacy Policy', href: 'https://www.acqar.com/terms' },
//                 ].map(({ label, href }) => (
//                   <li key={label}>
//                     <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(10,10,10,0.55)', textDecoration: 'none', cursor: 'pointer' }}>{label}</a>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Comparisons column */}
//             <div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
//                 <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#B87333', opacity: 0.7 }}></span>
//                 <h6 style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#0A0A0A', margin: 0 }}>Comparisons</h6>
//               </div>
//               <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
//                 {['vs Bayut TruEstimate', 'vs Property Finder', 'vs Traditional Valuers', 'Why ACQAR?'].map(l => (
//                   <li key={l} style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(10,10,10,0.55)', cursor: 'pointer' }}>{l}</li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           {/* Bottom bar */}
//           <div className="footer-bottom-bar">
//             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//               <span style={{ fontWeight: 900, fontSize: 10, letterSpacing: '0.05em' }}>
//                 <span style={{ color: '#B87333' }}>ACQ</span>
//                 <span style={{ color: 'var(--text-primary)' }}>AR</span>
//               </span>
//               <span style={{ width: 1, height: 12, background: 'var(--border)' }}></span>
//               <span style={{ fontWeight: 600, fontSize: 10, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Dubai, United Arab Emirates</span>
//             </div>
//             <p className="footer-copyright" style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.2em', textAlign: 'center', margin: 0, color: 'var(--text-muted)' }}>
//               © 2026 ACQARLABS L.L.C-FZ. All rights reserved.
//             </p>
//             <p style={{ fontWeight: 500, fontSize: 10, margin: 0, color: 'var(--text-muted)' }}>Not financial advice.</p>
//           </div>
//         </div>
//       </footer>


      
//     </>
//   );
// }


















import { useState, useEffect, useRef } from "react";

import { Helmet } from "react-helmet-async";

import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { trackEvent } from "../analytics"; 
import { Link } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --copper:        #B87333;
    --copper-light:  #D4924A;
    --copper-dark:   #8C5A25;
    --copper-glow:   rgba(184,115,51,0.22);
    --copper-tint:   rgba(184,115,51,0.10);
    --dark:          #0C0C0C;
    --dark-2:        #131313;
    --dark-3:        #1A1A1A;
    --dark-4:        #242424;
    --dark-card:     #181818;
    --border:        rgba(255,255,255,0.10);
    --border-copper: rgba(184,115,51,0.35);
    --text-primary:  #F2F0EB;
    --text-secondary:#B8B3A8;
    --text-muted:    #6B6560;
    --green:         #22C55E;
    --red:           #EF4444;
    --amber:         #F59E0B;
    --blue:          #3B82F6;
    --radius-sm:     6px;
    --radius-md:     12px;
    --radius-lg:     18px;
    --radius-xl:     24px;
  }

  [data-theme="light"] {
    --dark:          #FFFFFF;
    --dark-2:        #FAFAFA;
    --dark-3:        #F5F5F5;
    --dark-4:        #EFEFEF;
    --dark-card:     #FFFFFF;
    --border:        rgba(0,0,0,0.09);
    --border-copper: rgba(184,115,51,0.35);
    --copper-tint:   rgba(184,115,51,0.07);
    --copper-glow:   rgba(184,115,51,0.12);
    --text-primary:  #2B2B2B;
    --text-secondary:#5C6B7A;
    --text-muted:    #9CA3AF;
  }

  html { scroll-behavior: smooth; transition: color 0.25s ease, background 0.25s ease; overflow-y: scroll; }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--dark);
    color: var(--text-primary);
    line-height: 1.6;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  a { text-decoration: none; color: inherit; }
  img { display: block; max-width: 100%; }

  button, a, [role="button"] {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  /* DARK MODE DEPTH */
  html:not([data-theme="light"]) .feature-card,
  html:not([data-theme="light"]) .testimonial-card,
  html:not([data-theme="light"]) .hiw-card {
    box-shadow: 0 1px 0 0 rgba(255,255,255,0.07) inset, 0 -1px 0 0 rgba(0,0,0,0.5) inset, 0 4px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4);
  }
  html:not([data-theme="light"]) .feature-card:hover,
  html:not([data-theme="light"]) .hiw-card:hover {
    box-shadow: 0 1px 0 0 rgba(255,255,255,0.10) inset, 0 -1px 0 0 rgba(0,0,0,0.5) inset, 0 20px 56px rgba(0,0,0,0.65), 0 0 0 1px var(--border-copper), 0 0 32px rgba(184,115,51,0.08);
  }
  html:not([data-theme="light"]) .testimonial-card { box-shadow: 0 1px 0 0 rgba(255,255,255,0.07) inset, 0 4px 20px rgba(0,0,0,0.5); }
  html:not([data-theme="light"]) .hiw-connector { background: linear-gradient(90deg, transparent 5%, rgba(184,115,51,0.25) 15%, rgba(184,115,51,0.25) 85%, transparent 95%) !important; }
  html:not([data-theme="light"]) .hiw-number { box-shadow: 0 0 20px rgba(184,115,51,0.25), 0 0 0 4px rgba(184,115,51,0.08); }
  html:not([data-theme="light"]) .stats-section { background: linear-gradient(180deg, var(--dark-3) 0%, var(--dark-2) 100%) !important; border-top: 1px solid rgba(184,115,51,0.2) !important; border-bottom: 1px solid rgba(184,115,51,0.2) !important; }
  html:not([data-theme="light"]) .stat-block { border-right-color: rgba(255,255,255,0.08) !important; }
  html:not([data-theme="light"]) .stat-block .stat-num { text-shadow: 0 0 40px rgba(184,115,51,0.4); }
  html:not([data-theme="light"]) .problem-cost-bar { background: linear-gradient(135deg, #1C1A17 0%, #181815 100%) !important; box-shadow: 0 1px 0 0 rgba(255,255,255,0.07) inset, 0 4px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(184,115,51,0.25); }
  html:not([data-theme="light"]) .problem-section  { background: var(--dark-2) !important; }
  html:not([data-theme="light"]) .stats-section    { background: var(--dark-4) !important; }
  html:not([data-theme="light"]) #features         { background: var(--dark) !important; }
  html:not([data-theme="light"]) #how-it-works     { background: var(--dark-2) !important; }
  html:not([data-theme="light"]) footer { background: #181818 !important; border-top-color: rgba(255,255,255,0.08) !important; }
  html:not([data-theme="light"]) footer h6 { color: #F2F0EB !important; }
  html:not([data-theme="light"]) footer li { color: rgba(255,255,255,0.45) !important; }
  html:not([data-theme="light"]) footer a { color: rgba(255,255,255,0.45) !important; }
  html:not([data-theme="light"]) footer p { color: rgba(255,255,255,0.35) !important; }
  html:not([data-theme="light"]) .footer-bottom-bar { border-top-color: rgba(255,255,255,0.08) !important; }
  html:not([data-theme="light"]) footer .footer-inner-wrap div[style*="background: white"] { background: #242424 !important; }
  html:not([data-theme="light"]) footer a[style*="background: rgba(255,255,255"] { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.1) !important; }
  html:not([data-theme="light"]) .feature-card.large { background: linear-gradient(135deg, #1C1A17 0%, #181818 60%, #1A1815 100%); }
  html:not([data-theme="light"]) nav { box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 4px 32px rgba(0,0,0,0.6); }
  html:not([data-theme="light"]) body::before {
    content: ''; position: fixed; inset: 0; z-index: -1; pointer-events: none;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(184,115,51,0.04) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(184,115,51,0.03) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(184,115,51,0.02) 0%, transparent 50%);
  }
  html:not([data-theme="light"]) .live-ticker { background: #111111 !important; border-bottom-color: rgba(255,255,255,0.12) !important; }
  html:not([data-theme="light"]) .ticker-label { background: #111111 !important; border-right-color: rgba(255,255,255,0.12) !important; }
  html:not([data-theme="light"]) .dashboard-frame { box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(184,115,51,0.05); }
  html:not([data-theme="light"]) .hero-grid-bg { background-image: linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px) !important; }
  html:not([data-theme="light"]) .source-item { background: rgba(255,255,255,0.02); }
  html:not([data-theme="light"]) .source-item:hover { background: rgba(255,255,255,0.04); }
  html:not([data-theme="light"]) .footer-copyright { color: rgba(255,255,255,0.35) !important; }
  html:not([data-theme="light"]) .footer-rics-text { color: rgba(255,255,255,0.7) !important; }
  html:not([data-theme="light"]) .footer-rics-badge { background: rgba(184,115,51,0.12) !important; border-color: rgba(184,115,51,0.35) !important; }
  html:not([data-theme="light"]) .nav-links-mobile a { color: rgba(255,255,255,0.55) !important; }
  html:not([data-theme="light"]) .nav-links-mobile a:hover { color: var(--copper) !important; }

  /* LIGHT MODE */
  [data-theme="light"] .feature-card,
  [data-theme="light"] .hiw-card,
  [data-theme="light"] .testimonial-card { box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05); }
  [data-theme="light"] .feature-card:hover,
  [data-theme="light"] .hiw-card:hover,
  [data-theme="light"] .testimonial-card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06); }
  [data-theme="light"] .feature-card.large { background: linear-gradient(135deg, #FFFDF9 0%, #FFFFFF 60%, #FDF9F5 100%); }
  [data-theme="light"] .problem-cost-bar { background: linear-gradient(135deg, #FDF9F4 0%, #FFFFFF 100%) !important; box-shadow: 0 2px 16px rgba(0,0,0,0.07), 0 0 0 1px rgba(184,115,51,0.2); }
  [data-theme="light"] .stats-section { background: #F5F1EC !important; border-top: 1px solid rgba(184,115,51,0.15) !important; border-bottom: 1px solid rgba(184,115,51,0.15) !important; }
  [data-theme="light"] .stat-block { border-right-color: rgba(0,0,0,0.08) !important; }
  [data-theme="light"] .stat-block .stat-num { text-shadow: none; }
  [data-theme="light"] .stats-grid { background: transparent; }
  [data-theme="light"] .hiw-connector { background: linear-gradient(90deg, transparent 5%, rgba(184,115,51,0.2) 15%, rgba(184,115,51,0.2) 85%, transparent 95%) !important; }
  [data-theme="light"] .source-item { background: #F8F6F3 !important; }
  [data-theme="light"] .source-item:hover { background: #F0EDE8 !important; }
  [data-theme="light"] .dashboard-frame { box-shadow: 0 4px 40px rgba(0,0,0,0.12), 0 1px 0 rgba(0,0,0,0.06); }
  [data-theme="light"] nav { background: rgba(255,255,255,0.96); border-bottom-color: rgba(0,0,0,0.08); box-shadow: 0 1px 20px rgba(0,0,0,0.06); }
  [data-theme="light"] .nav-logo .brand span:last-child { color: #2B2B2B; }
  [data-theme="light"] .btn-ghost { color: #5C6B7A; border-color: rgba(0,0,0,0.15); }
  [data-theme="light"] .btn-ghost:hover { color: #2B2B2B; border-color: rgba(0,0,0,0.3); }
  [data-theme="light"] .live-ticker { background: #F8F8F8 !important; border-bottom: 1px solid rgba(0,0,0,0.08) !important; }
  [data-theme="light"] .ticker-label { background: #F8F8F8 !important; border-right-color: rgba(0,0,0,0.08) !important; }
  [data-theme="light"] .hero-grid-bg { background-image: linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px); }
  [data-theme="light"] .hero::before { background: radial-gradient(ellipse 60% 50% at 70% 40%, rgba(184,115,51,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 20% 80%, rgba(184,115,51,0.04) 0%, transparent 60%); }
  [data-theme="light"] .terminal-window, [data-theme="light"] .dashboard-frame { --dark:#0C0C0C;--dark-2:#131313;--dark-3:#1A1A1A;--dark-4:#242424;--dark-card:#181818;--border:rgba(255,255,255,0.10);--border-copper:rgba(184,115,51,0.35);--copper-tint:rgba(184,115,51,0.10);--text-primary:#F2F0EB;--text-secondary:#B8B3A8;--text-muted:#6B6560; }
  [data-theme="light"] .terminal-window { background: #181818; box-shadow: 0 20px 60px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.08); }
  [data-theme="light"] .dashboard-frame { box-shadow: 0 24px 80px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.07); }
  [data-theme="light"] .dashboard-cta-overlay { background: linear-gradient(180deg, transparent 0%, transparent 40%, rgba(13,13,13,0.96) 100%); }
  [data-theme="light"] .problem-section   { background: #FAFAFA !important; }
  [data-theme="light"] .problem-list      { border-top-color: rgba(0,0,0,0.1); }
  [data-theme="light"] .problem-row       { border-bottom-color: rgba(0,0,0,0.1); }
  [data-theme="light"] .problem-row:hover { background: rgba(184,115,51,0.05); }
  [data-theme="light"] .problem-tag-pill  { border-color: rgba(184,115,51,0.3); }
  [data-theme="light"] #features         { background: #FFFFFF !important; }
  [data-theme="light"] #how-it-works     { background: #FAFAFA !important; }
  [data-theme="light"] .footer-bottom { border-top-color: rgba(0,0,0,0.08) !important; }
  [data-theme="light"] .final-cta-section::before { background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(184,115,51,0.07) 0%, transparent 70%); }
  [data-theme="light"] .sev-5 { background: rgba(239,68,68,0.12); }
  [data-theme="light"] .sev-4 { background: rgba(245,158,11,0.12); }
  [data-theme="light"] .sev-3 { background: rgba(184,115,51,0.12); }
  [data-theme="light"] .sev-2 { background: rgba(59,130,246,0.12); }
  [data-theme="light"] .nav-links-mobile a { color: rgba(43,43,43,0.65) !important; }
  [data-theme="light"] .nav-links-mobile a:hover { color: var(--copper) !important; }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--dark-2); }
  ::-webkit-scrollbar-thumb { background: var(--copper-dark); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--copper); }
  * { scrollbar-width: thin; scrollbar-color: var(--copper-dark) var(--dark-2); }

  /* THEME TOGGLE */
  .theme-toggle { width:36px;height:36px;border-radius:var(--radius-sm);border:1px solid var(--border);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;line-height:1;color:var(--text-secondary);transition:border-color 0.2s,color 0.2s,background 0.2s;flex-shrink:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent; }
  .theme-toggle:hover { border-color:var(--border-copper);color:var(--copper);background:var(--copper-tint); }

  /* NAV */
  nav { position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px;background:rgba(13,13,13,0.85);backdrop-filter:blur(20px);border-bottom:1px solid var(--border); }
  .nav-logo { display:flex;align-items:center;gap:6px;min-width:0;flex-shrink:0; }
  .nav-logo .brand { font-size:24px;font-weight:900;letter-spacing:-0.3px; }
  .nav-logo .brand span:first-child { color:var(--copper); }
  .nav-logo .brand span:last-child  { color:var(--text-primary); }
  .nav-logo .signal-badge { font-size:11px;font-weight:700;letter-spacing:1.5px;color:var(--copper);border:1px solid var(--border-copper);padding:3px 10px;border-radius:4px;background:var(--copper-tint);text-transform:uppercase; }

  /* DESKTOP nav links */
  .nav-links { display:flex;align-items:center;gap:32px;list-style:none;font-size:14px; font-weight:500;color:var(--text-primary); }
.nav-links a:hover { color:var(--copper); }

  /* MOBILE nav links — inline compact, always visible on small screens */
  .nav-links-mobile {
    display: none;
    align-items: center;
    gap: 2px;
    list-style: none;
    flex-shrink: 1;
    min-width: 0;
  }
  .nav-links-mobile a {
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-primary);
    padding: 6px 8px;
    border-radius: 20px;
    white-space: nowrap;
    text-decoration: none;
    display: block;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: color 0.2s;
  }
  .nav-links-mobile a:hover { color: var(--copper); }

  .nav-actions { display:flex;gap:8px;align-items:center;flex-shrink:0; }
  .btn-ghost { font-size:14px;font-weight:600;color:var(--text-secondary);padding:9px 20px;border:1px solid var(--border);border-radius:var(--radius-sm);background:transparent;cursor:pointer;transition:color 0.2s,border-color 0.2s;touch-action:manipulation;-webkit-tap-highlight-color:transparent; }
  .btn-ghost:hover { color:var(--text-primary);border-color:rgba(255,255,255,0.2); }
  .btn-primary { font-size:15px;font-weight:700;color:#fff;padding:9px 24px;border:none;border-radius:var(--radius-sm);background:var(--copper);cursor:pointer;transition:background 0.2s,transform 0.1s;touch-action:manipulation;-webkit-tap-highlight-color:transparent; }
  .btn-primary:hover { background:var(--copper-light);transform:translateY(-1px); }

  /* TICKER */
  .live-ticker { position:fixed;top:64px;left:0;right:0;z-index:99;background:var(--dark-2);border-bottom:1px solid var(--border);height:32px;overflow:hidden;display:flex;align-items:center; }
  .ticker-label { flex-shrink:0;display:flex;align-items:center;gap:6px;padding:0 16px;font-size:10px;font-weight:700;letter-spacing:1.5px;color:var(--copper);text-transform:uppercase;border-right:1px solid var(--border);height:100%;background:var(--dark-2); }
  .ticker-dot { width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);animation:pulse-dot 1.5s ease-in-out infinite; }
  @keyframes pulse-dot { 0%,100%{opacity:1}50%{opacity:0.3} }
  .ticker-track { display:flex;gap:0;animation:ticker-scroll 30s linear infinite;white-space:nowrap; }
  .ticker-track:hover { animation-play-state:paused; }
  @keyframes ticker-scroll { 0%{transform:translateX(0)}100%{transform:translateX(-50%)} }
  .ticker-item { display:inline-flex;align-items:center;gap:8px;padding:0 24px;font-size:11px;color:var(--text-secondary); }
  .ticker-item .sev { font-weight:700;font-size:9px;padding:1px 5px;border-radius:3px; }
  .sev-5 { background:rgba(239,68,68,0.2);color:#EF4444; }
  .sev-4 { background:rgba(245,158,11,0.2);color:#F59E0B; }
  .sev-3 { background:rgba(184,115,51,0.2);color:var(--copper); }
  .sev-2 { background:rgba(59,130,246,0.2);color:#3B82F6; }
  .ticker-item .loc { color:var(--text-muted); }

  /* HERO */
  .hero { min-height:100vh;padding:160px 48px 80px;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;position:relative;overflow:hidden; }
  .hero::before { content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 70% 30%, rgba(184,115,51,0.13) 0%, transparent 65%),radial-gradient(ellipse 50% 50% at 20% 70%, rgba(184,115,51,0.07) 0%, transparent 55%),radial-gradient(ellipse 40% 40% at 50% 100%, rgba(184,115,51,0.05) 0%, transparent 50%);pointer-events:none; }
  .hero-grid-bg { position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);background-size:60px 60px;pointer-events:none;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent); }
  .hero-content { position:relative;z-index:2; }
  .hero-eyebrow { display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--copper);border:1px solid var(--border-copper);padding:6px 14px;border-radius:20px;background:var(--copper-tint);margin-bottom:28px; }
  .hero-eyebrow .dot { width:6px;height:6px;border-radius:50%;background:var(--copper);animation:pulse-dot 1.5s infinite; }
  .hero h1 { font-size:68px;font-weight:900;line-height:1.0;letter-spacing:-2px;margin-bottom:24px; }
  .hero h1 em { font-style:normal;background:linear-gradient(135deg, var(--copper-light), var(--copper-dark));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
  .hero-sub { font-size:18px;color:var(--text-secondary);line-height:1.7;max-width:480px;margin-bottom:40px;font-weight:400; }
  .hero-sub strong { color:var(--text-primary);font-weight:600; }
  .hero-cta-row { display:flex;align-items:center;gap:16px;margin-bottom:48px; }
  .btn-hero { display:inline-flex;align-items:center;gap:8px;font-size:16px;font-weight:700;color:#fff;padding:16px 32px;border:none;border-radius:var(--radius-md);background:var(--copper);cursor:pointer;transition:all 0.2s;box-shadow:0 8px 32px rgba(184,115,51,0.30);text-decoration:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent; }
  .btn-hero:hover { background:var(--copper-light);transform:translateY(-2px);box-shadow:0 12px 40px rgba(184,115,51,0.40); }
  .btn-hero-ghost { display:inline-flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:var(--text-secondary);padding:16px 24px;border:1px solid var(--border);border-radius:var(--radius-md);background:transparent;cursor:pointer;transition:all 0.2s;text-decoration:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent; }
  .btn-hero-ghost:hover { color:var(--text-primary);border-color:rgba(255,255,255,0.2); }
  .hero-trust-row { display:flex;align-items:center;gap:24px;font-size:12px;color:var(--text-muted); }
  .hero-trust-row .check { display:flex;align-items:center;gap:6px; }
  .hero-trust-row .check::before { content:'✓';color:var(--green);font-weight:700; }
  .hero-visual { position:relative;z-index:2; }

  /* TERMINAL */
  .terminal-window { background:var(--dark-card);border:1px solid var(--border);border-radius:var(--radius-xl);overflow:hidden;box-shadow:0 40px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.05),inset 0 1px 0 rgba(255,255,255,0.05); }
  .terminal-topbar { display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:rgba(255,255,255,0.03);border-bottom:1px solid var(--border);gap:8px;min-width:0; }
  .terminal-dots { display:flex;gap:6px; }
  .terminal-dots span { width:10px;height:10px;border-radius:50%; }
  .terminal-dots span:nth-child(1){background:#FF5F56}
  .terminal-dots span:nth-child(2){background:#FFBD2E}
  .terminal-dots span:nth-child(3){background:#27C93F}
  .terminal-title { font-size:11px;color:var(--text-muted);font-weight:500;display:flex;align-items:center;gap:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;min-width:0; }
  .terminal-live-badge { font-size:9px;font-weight:700;letter-spacing:1px;color:var(--green);background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.25);padding:2px 7px;border-radius:10px;text-transform:uppercase;flex-shrink:0; }
  .terminal-stats-bar { display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid var(--border); }
  .t-stat { padding:10px 14px;border-right:1px solid var(--border);font-size:10px; }
  .t-stat:last-child{border-right:none}
  .t-stat .label{color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:3px}
  .t-stat .value{font-size:15px;font-weight:700;color:var(--text-primary)}
  .t-stat .value.up{color:var(--green)}
  .t-stat .value.copper{color:var(--copper)}
  .t-stat .delta{font-size:9px;color:var(--green);margin-top:1px}
  .terminal-map { height:180px;background:var(--dark-3);position:relative;overflow:hidden; }
  .map-dot { position:absolute;border-radius:50%;transform:translate(-50%,-50%); }
  .map-dot.s5 { width:18px;height:18px;background:rgba(239,68,68,0.3);border:2px solid #EF4444;box-shadow:0 0 20px rgba(239,68,68,0.5);animation:pulse-ring 2s ease-out infinite; }
  .map-dot.s4 { width:14px;height:14px;background:rgba(245,158,11,0.3);border:2px solid #F59E0B;box-shadow:0 0 14px rgba(245,158,11,0.4);animation:pulse-ring 2.5s ease-out infinite; }
  .map-dot.s3 { width:11px;height:11px;background:rgba(184,115,51,0.3);border:2px solid var(--copper);animation:pulse-ring 3s ease-out infinite; }
  .map-dot.s2 { width:8px;height:8px;background:rgba(59,130,246,0.3);border:2px solid #3B82F6; }
  @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)}70%{box-shadow:0 0 0 14px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)} }
  .map-label { position:absolute;font-size:8px;font-weight:600;color:var(--text-muted);white-space:nowrap;transform:translate(-50%,100%);margin-top:4px;letter-spacing:0.5px;text-transform:uppercase; }
  .map-grid-line { position:absolute;background:rgba(255,255,255,0.04); }
  .map-grid-line.h{height:1px;left:0;right:0}
  .map-grid-line.v{width:1px;top:0;bottom:0}
  .terminal-feed { max-height:220px;overflow:hidden; }
  .feed-header { display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--border);font-size:10px; }
  .feed-header .title{font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px}
  .feed-header .count{color:var(--copper);font-weight:700;background:var(--copper-tint);padding:2px 8px;border-radius:10px;border:1px solid var(--border-copper)}
  .feed-row { display:grid;grid-template-columns:36px 1fr 70px 50px;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.03);font-size:11px;transition:background 0.15s; }
  .feed-row:hover{background:rgba(255,255,255,0.03)}
  .feed-row.new{animation:feed-flash 0.8s ease-out}
  @keyframes feed-flash{0%{background:rgba(184,115,51,0.12)}100%{background:transparent}}
  .feed-sev{display:flex;justify-content:center}
  .sev-pill{font-size:9px;font-weight:800;padding:2px 6px;border-radius:3px;text-align:center;letter-spacing:0.5px}
  .feed-content{min-width:0}
  .feed-content .feed-title{font-size:11px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3;margin-bottom:1px}
  .feed-content .feed-meta{font-size:9px;color:var(--text-muted)}
  .feed-area{font-size:9px;color:var(--text-muted);text-align:right;white-space:nowrap}
  .feed-time{font-size:9px;color:var(--text-muted);text-align:right;font-variant-numeric:tabular-nums}

  /* SECTIONS */
  section { padding:100px 48px;position:relative; }
  .section-label { display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--copper);margin-bottom:20px; }
  .section-label::before { content:'';display:block;width:20px;height:1px;background:var(--copper); }
  .section-title { font-size:52px;font-weight:900;letter-spacing:-1.5px;line-height:1.05;margin-bottom:20px; }
  .section-sub { font-size:18px;color:var(--text-secondary);line-height:1.7;max-width:560px; }
  .text-copper{color:var(--copper)}

  /* PROBLEM */
  .problem-section { background:var(--dark-2);border-top:1px solid var(--border);border-bottom:1px solid var(--border); }
  .problem-layout { max-width:1200px;margin:0 auto; }
  .problem-intro { margin-bottom:72px;text-align:center; }
  .problem-list { border-top:1px solid var(--border);margin-bottom:72px; }
  .problem-row { display:grid;grid-template-columns:88px 1fr 1.8fr;gap:0 56px;padding:52px 0;border-bottom:1px solid var(--border);align-items:start;cursor:default;position:relative;transition:background 0.25s ease; }
  .problem-row:hover{background:var(--copper-tint)}
  .problem-row::after { content:'';position:absolute;bottom:-1px;left:0;height:1px;width:0;background:var(--copper);transition:width 0.45s cubic-bezier(0.4,0,0.2,1); }
  .problem-row:hover::after{width:100%}
  .problem-num { font-size:56px;font-weight:900;line-height:1;color:var(--copper);opacity:0.4;letter-spacing:-3px;font-variant-numeric:tabular-nums;padding-top:2px;transition:opacity 0.25s; }
  .problem-row:hover .problem-num{opacity:0.9}
  .problem-title-col{padding-top:6px}
  .problem-tag-pill { display:inline-block;font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--copper);padding:3px 9px;border:1px solid var(--border-copper);border-radius:3px;margin-bottom:14px; }
  .problem-title{font-size:20px;font-weight:700;letter-spacing:-0.3px;line-height:1.3;color:var(--text-primary)}
  .problem-desc-col{padding-top:10px}
  .problem-desc-col p{font-size:15px;color:var(--text-secondary);line-height:1.75}
  .problem-desc-col p strong{color:var(--text-primary);font-weight:600}
  .problem-cost-bar { background:var(--dark-card);border:1px solid var(--border-copper);border-radius:var(--radius-lg);padding:36px 48px;display:flex;align-items:center;justify-content:space-between;gap:32px; }
  .cost-text h3{font-size:22px;font-weight:900;letter-spacing:-0.5px;margin-bottom:8px}
  .cost-text p{font-size:15px;color:var(--text-secondary)}
  .cost-number{text-align:right;flex-shrink:0}
  .cost-number .amount{font-size:52px;font-weight:900;color:#EF4444;letter-spacing:-2px;line-height:1}
  .cost-number .label{font-size:12px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-top:4px}

  /* FEATURES */
  .features-section{max-width:1200px;margin:0 auto}
  .features-header{margin-bottom:64px}
  .features-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
  .feature-card { background:var(--dark-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:36px;position:relative;overflow:hidden;transition:all 0.3s; }
  .feature-card:hover { border-color:var(--border-copper);transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,0.4),0 0 0 1px var(--border-copper); }
  .feature-card.large { grid-column:span 2;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center; }
  .feature-icon { width:44px;height:44px;color:var(--copper);margin-bottom:28px;display:flex;align-items:flex-start;position:relative; }
  .feature-icon::after { content:'';position:absolute;bottom:-10px;left:0;width:20px;height:1px;background:var(--border-copper); }
  .feature-icon svg { width:36px;height:36px;stroke:currentColor;stroke-width:1.4;fill:none;stroke-linecap:round;stroke-linejoin:round; }
  .feature-card h3{font-size:22px;font-weight:800;letter-spacing:-0.5px;margin-bottom:12px}
  .feature-card p{font-size:15px;color:var(--text-secondary);line-height:1.7;margin-bottom:20px}
  .feature-tags{display:flex;flex-wrap:wrap;gap:8px}
  .ftag{font-size:11px;font-weight:600;color:var(--text-muted);padding:4px 10px;border:1px solid var(--border);border-radius:4px}
  .ftag.active{color:var(--copper);border-color:var(--border-copper);background:var(--copper-tint)}
  .source-list{display:flex;flex-direction:column;gap:8px}
  .source-item { display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--dark-3);border:1px solid var(--border);border-radius:var(--radius-sm);font-size:12px;font-weight:600;color:var(--text-secondary); }
  .source-item .src-dot{width:7px;height:7px;border-radius:50%;background:var(--green);flex-shrink:0}
  .source-item .src-count{margin-left:auto;color:var(--text-muted);font-weight:400;font-size:11px}

  /* DASHBOARD */
  .dashboard-section{background:var(--dark-2);border-top:1px solid var(--border);border-bottom:1px solid var(--border);overflow:hidden}
  .dashboard-intro{max-width:700px;margin:0 auto 64px;text-align:center}
  .dashboard-frame { max-width:1300px;margin:0 auto;background:var(--dark);border:1px solid var(--border);border-radius:var(--radius-xl);overflow:hidden;box-shadow:0 60px 120px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.04);position:relative; }
  .dashboard-frame::before { content:'';position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,var(--copper),transparent); }
  .dash-topbar { display:flex;align-items:center;justify-content:space-between;padding:0 20px;height:44px;background:var(--dark-card);border-bottom:1px solid var(--border);overflow:hidden;gap:8px; }
  .dash-logo{font-size:13px;font-weight:900;letter-spacing:-0.3px}
  .dash-logo span:first-child{color:var(--copper)}
  .dash-tabs{display:flex;gap:0;overflow-x:auto;flex:1;scrollbar-width:none;}
  .dash-tabs::-webkit-scrollbar{display:none;}
  .dash-tab { padding:0 12px;height:44px;display:flex;align-items:center;font-size:11px;font-weight:600;color:var(--text-muted);border-right:1px solid var(--border);cursor:pointer;white-space:nowrap;flex-shrink:0; }
  .dash-tab.active{color:var(--copper);background:var(--copper-tint);border-bottom:1px solid var(--copper)}
  .dash-status{display:flex;align-items:center;gap:12px;font-size:10px;color:var(--text-muted)}
  .dash-status .live-ind{display:flex;align-items:center;gap:5px;color:var(--green)}
  .dash-body{display:grid;grid-template-columns:280px 1fr 280px;height:520px}
  .dash-sidebar-left{border-right:1px solid var(--border);display:flex;flex-direction:column}
  .dash-sidebar-section{border-bottom:1px solid var(--border);padding:12px}
  .dash-sidebar-title{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px}
  .filter-chip { display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:4px;margin:2px;font-size:10px;font-weight:600;cursor:pointer;border:1px solid var(--border);color:var(--text-muted); }
  .filter-chip.active{background:var(--copper-tint);border-color:var(--border-copper);color:var(--copper)}
  .filter-chip .chip-dot{width:5px;height:5px;border-radius:50%;background:currentColor}
  .signal-row { display:flex;align-items:flex-start;gap:8px;padding:8px;border-bottom:1px solid rgba(255,255,255,0.03);cursor:pointer;transition:background 0.15s;font-size:10px; }
  .signal-row:hover{background:rgba(255,255,255,0.03)}
  .signal-row.active{background:rgba(184,115,51,0.06);border-left:2px solid var(--copper)}
  .sig-sev-badge{flex-shrink:0;width:22px;height:22px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800}
  .sig-content{flex:1;min-width:0}
  .sig-title{font-size:10px;font-weight:600;color:var(--text-primary);line-height:1.3;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sig-meta{font-size:9px;color:var(--text-muted)}
  .dash-map{position:relative;background:var(--dark-3);overflow:hidden}
  .dash-map-bg { position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%, rgba(184,115,51,0.04) 0%, transparent 70%),linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);background-size:100% 100%,40px 40px,40px 40px; }
  .map-hotspot{position:absolute;transform:translate(-50%,-50%);cursor:pointer}
  .map-hotspot .hs-ring{border-radius:50%;animation:hs-pulse 2s ease-out infinite}
  .map-hotspot .hs-core{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:50%}
  @keyframes hs-pulse{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2.5);opacity:0}}
  .map-hotspot .hs-label{position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);font-size:8px;color:var(--text-muted);white-space:nowrap;text-align:center;letter-spacing:0.5px;text-transform:uppercase}
  .map-event-card{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);background:var(--dark-card);border:1px solid var(--border-copper);border-radius:var(--radius-md);padding:12px 16px;width:260px;font-size:11px}
  .map-event-card .mec-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
  .map-event-card .mec-loc{font-size:9px;color:var(--copper);font-weight:700;text-transform:uppercase;letter-spacing:1px}
  .map-event-card .mec-title{font-size:12px;font-weight:700;color:var(--text-primary);line-height:1.3;margin-bottom:6px}
  .map-event-card .mec-meta{display:flex;gap:10px;font-size:9px;color:var(--text-muted)}
  .map-event-card .mec-price{color:var(--copper);font-weight:600}
  .dash-sidebar-right{border-left:1px solid var(--border);display:flex;flex-direction:column}
  .analytics-block{padding:12px;border-bottom:1px solid var(--border)}
  .mini-bar-chart{display:flex;align-items:flex-end;gap:4px;height:50px;margin-top:8px}
  .mini-bar{flex:1;border-radius:2px;background:var(--dark-3);border:1px solid var(--border);transition:height 0.3s}
  .mini-bar.active{background:var(--copper);border-color:var(--copper)}
  .area-momentum-list{display:flex;flex-direction:column;gap:4px}
  .momentum-row{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:10px}
  .momentum-row .m-name{flex:1;color:var(--text-secondary);font-weight:500}
  .momentum-row .m-bar-wrap{width:80px;height:4px;background:var(--dark-3);border-radius:2px;overflow:hidden}
  .momentum-row .m-bar{height:100%;background:var(--copper);border-radius:2px}
  .momentum-row .m-count{font-size:9px;color:var(--text-muted);width:20px;text-align:right}
  .chat-input-bar{margin-top:auto;padding:10px 12px;border-top:1px solid var(--border)}
  .chat-input{width:100%;background:var(--dark-3);border:1px solid var(--border);border-radius:var(--radius-sm);padding:7px 12px;font-size:10px;color:var(--text-muted);display:flex;align-items:center;justify-content:space-between}
  .chat-input .send-icon{color:var(--copper);font-size:12px}
  .dash-statusbar { display:flex;align-items:center;justify-content:space-between;padding:6px 16px;height:28px;background:var(--dark-card);border-top:1px solid var(--border);font-size:9px;color:var(--text-muted); }
  .status-items{display:flex;gap:20px}
  .status-item{display:flex;align-items:center;gap:4px}
  .status-item .si-dot{width:5px;height:5px;border-radius:50%}
  .dashboard-cta-overlay { position:absolute;inset:0;background:linear-gradient(180deg,transparent 0%,transparent 40%,rgba(13,13,13,0.97) 100%);display:flex;align-items:flex-end;justify-content:center;padding-bottom:40px;pointer-events:none; }
  .dashboard-cta-overlay .overlay-cta{pointer-events:all;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center}
  .overlay-cta .blur-notice{font-size:13px;color:var(--text-secondary);font-weight:500}
  .overlay-cta .blur-notice strong{color:var(--text-primary)}

  /* HOW IT WORKS */
  .hiw-section{max-width:1200px;margin:0 auto}
  .hiw-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:64px;position:relative}
  .hiw-connector{position:absolute;top:30px;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 5%,var(--border) 15%,var(--border) 85%,transparent 95%);z-index:0}
  .hiw-card{position:relative;z-index:1;background:var(--dark-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:32px 28px;text-align:center;transition:border-color 0.3s,transform 0.3s}
  .hiw-card:hover{border-color:var(--border-copper);transform:translateY(-4px)}
  .hiw-number{width:44px;height:44px;border-radius:50%;background:var(--dark);border:2px solid var(--copper);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:var(--copper);margin:0 auto 20px}
  .hiw-card h4{font-size:16px;font-weight:800;letter-spacing:-0.3px;margin-bottom:10px}
  .hiw-card p{font-size:13px;color:var(--text-secondary);line-height:1.6}

  /* STATS */
  .stats-section{background:var(--dark-2);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);max-width:1200px;margin:0 auto;gap:0}
  .stat-block{padding:56px 40px;border-right:1px solid var(--border);text-align:center}
  .stat-block:last-child{border-right:none}
  .stat-block .stat-num{font-size:52px;font-weight:900;letter-spacing:-2px;line-height:1;color:var(--copper);margin-bottom:8px}
  .stat-block .stat-label{font-size:13px;color:var(--text-secondary);font-weight:500;line-height:1.4}
  .stat-block .stat-sub{font-size:11px;color:var(--text-muted);margin-top:4px}

  /* TESTIMONIALS */
  @keyframes marquee-left{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .marquee-wrap{overflow:hidden;mask-image:linear-gradient(to right,transparent,black 8%,black 92%,transparent);-webkit-mask-image:linear-gradient(to right,transparent,black 8%,black 92%,transparent)}
  .marquee-track{display:flex;gap:20px;width:max-content;animation:marquee-left 40s linear infinite;padding:8px 0 16px;align-items:stretch;}
  .marquee-track:hover{animation-play-state:paused}
  .testimonial-card{flex:0 0 380px;min-height:400px;height:auto;background:var(--dark-card);border:1px solid var(--border);border-radius:var(--radius-lg);padding:28px 28px 24px;position:relative;overflow:hidden;transition:border-color 0.3s,transform 0.25s;display:flex;flex-direction:column;}
  .testimonial-card:hover{border-color:var(--border-copper);transform:translateY(-3px)}
  .t-stars{color:var(--copper);font-size:13px;letter-spacing:2px;margin-bottom:14px}
  .t-persona{display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--copper);background:var(--copper-tint);border:1px solid var(--border-copper);padding:3px 9px;border-radius:20px;margin-bottom:14px;align-self:flex-start}
  .t-persona-dot{width:4px;height:4px;border-radius:50%;background:var(--copper)}
  .t-quote{font-size:13.5px;color:var(--text-secondary);line-height:1.72;margin-bottom:20px;flex:1}
  .t-quote strong{color:var(--text-primary);font-weight:800}
  .t-author{display:flex;align-items:center;gap:12px;border-top:1px solid var(--border);padding-top:16px}
  .t-avatar{width:38px;height:38px;border-radius:50%;background:var(--copper-tint);border:1.5px solid var(--border-copper);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:var(--copper);flex-shrink:0;letter-spacing:0.5px}
  .t-info .name{font-size:13px;font-weight:700;margin-bottom:2px;color:var(--text-primary)}
  .t-info .role{font-size:11px;color:var(--text-muted);line-height:1.4}
  .t-info .location{font-size:10.5px;color:var(--text-muted);margin-top:1px}

  /* FINAL CTA */
  .final-cta-section{position:relative;overflow:hidden;text-align:center;padding:120px 48px}
  .final-cta-section::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% 50%,rgba(184,115,51,0.16) 0%,transparent 70%),radial-gradient(ellipse 100% 40% at 50% 100%,rgba(184,115,51,0.06) 0%,transparent 60%)}
  .final-cta-section::after{content:'';position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,var(--copper),transparent)}
  .final-cta-content{position:relative;z-index:1;max-width:700px;margin:0 auto}
  .final-cta-eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--copper);margin-bottom:24px}
  .final-cta-section h2{font-size:60px;font-weight:900;letter-spacing:-2px;line-height:1.05;margin-bottom:20px}
  .final-cta-section p{font-size:16px;color:var(--text-secondary);line-height:1.7;margin-bottom:40px}
  .final-cta-buttons{display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:24px}
  .final-trust{font-size:12px;color:var(--text-muted);display:flex;align-items:center;justify-content:center;gap:20px}
  .final-trust span{display:flex;align-items:center;gap:5px}
  .final-trust span::before{content:'✓';color:var(--green);font-weight:700}

  /* FOOTER */
  footer{background:var(--dark-card);border-top:1px solid var(--border);padding:48px}
  .footer-main-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
  .footer-bottom-bar{display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(10,10,10,0.06);padding-top:32px;flex-wrap:wrap;gap:16px;}
  .footer-inner-wrap { max-width: 1280px; margin: 0 auto; padding: 48px 5px 32px 5px; }
  .footer-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px}
  .footer-brand .logo-text{font-size:20px;font-weight:900;margin-bottom:12px}
  .footer-brand .logo-text span:first-child{color:var(--copper)}
  .footer-brand p{font-size:13px;color:var(--text-muted);line-height:1.7;max-width:260px;margin-bottom:16px}
  .footer-badge{display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text-muted);border:1px solid var(--border);padding:5px 12px;border-radius:4px}
  .footer-col h5{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-muted);margin-bottom:16px}
  .footer-col ul{list-style:none;display:flex;flex-direction:column;gap:10px}
  .footer-col ul li a{font-size:13px;color:var(--text-secondary);transition:color 0.2s}
  .footer-col ul li a:hover{color:var(--text-primary)}
  .footer-bottom{max-width:1200px;margin:32px auto 0;padding-top:24px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--text-muted)}
  .footer-bottom a{color:var(--text-muted)}
  .footer-bottom a:hover{color:var(--text-primary)}
  .footer-links{display:flex;gap:24px}
  .rics-tag{color:var(--copper);font-weight:600;font-size:11px}
  .footer-social-link {
    width:36px;height:36px;border-radius:50%;
    border:1px solid rgba(10,10,10,0.09);
    background:rgba(255,255,255,0.6);
    display:flex;align-items:center;justify-content:center;
    color:rgba(10,10,10,0.35);text-decoration:none;
    transition:all 0.2s;
    touch-action:manipulation;
    -webkit-tap-highlight-color:transparent;
  }
  .footer-social-link:hover { color:#B87333;border-color:rgba(184,115,51,0.4); }

  /* ── RESPONSIVE ── */

  @media(max-width:1100px){
    nav{padding:0 24px}
    .nav-links{display:flex}
    .nav-logo .brand { font-size:18px; }
    section{padding:64px 24px}
    .section-title{font-size:38px}
    .hero{grid-template-columns:1fr;padding:130px 24px 60px;gap:32px;align-items:start}
    .hero h1{font-size:40px;letter-spacing:-1.5px}
    .hero-content{width:100%;min-width:0}
    .hero-visual{width:100%;min-width:0;overflow:hidden}
    .hero-cta-row{flex-wrap:wrap;gap:12px}
    .btn-hero,.btn-hero-ghost{width:100%;justify-content:center;font-size:14px;padding:14px 20px}
    .hero-trust-row{flex-wrap:wrap;gap:8px;font-size:11px}
    .problem-row{grid-template-columns:1fr;gap:8px 0;padding:36px 0}
    .problem-num{font-size:40px;letter-spacing:-2px;opacity:0.55}
    .problem-cost-bar{flex-direction:column;padding:28px 24px;gap:20px}
    .cost-number{text-align:left}
    .cost-number .amount{font-size:44px}
    .features-grid{grid-template-columns:1fr}
    .feature-card.large{grid-column:span 1;grid-template-columns:1fr}
    .stats-grid{grid-template-columns:repeat(2,1fr)}
    .hiw-grid{grid-template-columns:repeat(2,1fr)}
    .testimonial-card{flex:0 0 320px;min-height:420px;height:auto;}
    .dash-body{grid-template-columns:1fr;height:auto}
    .dash-sidebar-left,.dash-sidebar-right{display:none}
    .dash-map{min-height:420px}
    .footer-inner{grid-template-columns:1fr 1fr;gap:36px}
    .final-cta-section{padding:100px 24px}
    .final-cta-section h2{font-size:44px}
    .footer-main-grid { grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
    .terminal-title { white-space: nowrap; overflow: hidden; }
    .terminal-live-badge { flex-shrink: 0; }
  }

  @media(max-width:768px){
    /* Switch to mobile nav links, hide desktop ones */
    .nav-links { display: none !important; }
    .nav-links-mobile { display: flex; }
    nav { padding: 0 16px; }

    section{padding:60px 24px}
    .section-title{font-size:32px;letter-spacing:-0.8px}
    .hero h1{font-size:40px}
    .hero-cta-row{flex-wrap:wrap;gap:12px}
    .stat-block{padding:40px 24px}
    .stat-block .stat-num{font-size:44px}
    .hiw-connector{display:none}
    .final-cta-section h2{font-size:36px}
    .footer-inner{grid-template-columns:1fr;gap:32px}
    .footer-bottom{flex-direction:column;gap:12px;text-align:center}
    .footer-links{flex-wrap:wrap;justify-content:center;gap:16px}
    .footer-main-grid { grid-template-columns: 1fr; gap: 40px; }
    .footer-bottom-bar { flex-direction: column !important; gap: 12px !important; text-align: center !important; }
    .footer-inner-wrap { padding: 48px 24px 24px; }
    .dash-status { display:none; }
    .dash-topbar { padding:0 12px; }
    .map-event-card { display: none; }
    .hs-label { display: block; }
    .dashboard-cta-overlay { background: linear-gradient(180deg, transparent 0%, transparent 55%, rgba(13,13,13,0.97) 80%); }
    .overlay-cta .blur-notice { font-size: 12px; padding: 0 16px; text-align: center; }
    .marquee-wrap { mask-image: none !important; -webkit-mask-image: none !important; }
  }

  @media(max-width:480px){
    section{padding:52px 16px}
    .section-title{font-size:28px}
    .section-sub{font-size:15px}
    nav{padding:0 10px;height:48px}
    .live-ticker{top:48px}
    .btn-ghost{display:none}
    .btn-primary{font-size:10px;padding:7px 10px;white-space:nowrap;}
    .nav-logo .brand{font-size:17px;}
    .theme-toggle{width:24px;height:24px;font-size:11px;}
   .nav-links-mobile a {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-primary);
  padding: 4px 5px;
  border-radius: 20px;
  white-space: nowrap;
  text-decoration: none;
  display: block;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.2s;
}
    .hero{padding:110px 16px 48px;gap:24px;display:flex;flex-direction:column}
    .hero-content{order:1;width:100%}
    .hero-visual{order:2;width:100%;overflow-x:hidden}
    .hero h1{font-size:32px;letter-spacing:-1px}
    .hero-sub{font-size:15px;margin-bottom:32px}
    .hero-cta-row{flex-direction:column;gap:12px;margin-bottom:28px}
    .btn-hero,.btn-hero-ghost{width:100%;justify-content:center}
    .hero-trust-row{flex-wrap:wrap;gap:10px}
    .problem-row{padding:24px 0}
    .problem-num{font-size:28px;letter-spacing:-1px}
    .problem-title{font-size:17px}
    .problem-desc-col p{font-size:14px}
    .problem-cost-bar{flex-direction:column;padding:24px 16px;gap:20px}
    .cost-text h3{font-size:17px}
    .cost-number .amount{font-size:40px}
    .features-grid{gap:16px}
    .feature-card{padding:24px 20px}
    .feature-card h3{font-size:18px}
    .feature-card p{font-size:14px}
    .stat-block{padding:28px 12px}
    .stat-block .stat-num{font-size:36px}
    .stat-block .stat-label{font-size:12px}
    .hiw-grid{grid-template-columns:1fr;gap:16px}
    .hiw-card{padding:28px 20px}
    .testimonials-header{padding:0 16px;margin-bottom:28px}
    .testimonial-card{flex:0 0 280px;min-height:420px;height:auto;}
    .final-cta-section{padding:72px 16px}
    .final-cta-section h2{font-size:28px;letter-spacing:-0.8px}
    .final-cta-section p{font-size:15px}
    .final-cta-buttons{flex-direction:column;gap:12px}
    .final-trust{flex-wrap:wrap;justify-content:center;gap:8px;font-size:11px}
    footer{padding:40px 16px}
    .footer-inner{gap:28px}
    .footer-bottom{flex-direction:column;gap:10px;text-align:center}
    .footer-links{flex-wrap:wrap;justify-content:center;gap:12px}
    .footer-main-grid { grid-template-columns: 1fr; gap: 32px; }
    .footer-bottom-bar { flex-direction: column !important; gap: 10px !important; text-align: center !important; }
    .footer-inner-wrap { padding: 40px 16px 20px; }
    .map-event-card { display: none; }
    .dashboard-cta-overlay { background: linear-gradient(180deg, transparent 0%, transparent 50%, rgba(13,13,13,0.97) 78%); padding-bottom: 24px; }
    .overlay-cta { gap: 12px; }
    .overlay-cta .blur-notice { font-size: 11px; padding: 0 20px; }
    .btn-hero { font-size: 14px !important; padding: 14px 24px !important; }
    .ticker-track { animation-duration: 10s; }
  }

  @media(max-width:360px){
    nav { padding: 0 8px; }
    .nav-logo .brand { font-size: 15px; }
    .nav-links-mobile { gap: 0; }
    .nav-links-mobile a { font-size: 9px; padding: 3px 5px; letter-spacing: 0.05em; color: var(--text-primary);}
    .btn-primary { font-size: 11px; padding: 6px 8px; }
    .theme-toggle { width: 24px; height: 24px; font-size: 11px; }
  }

  @media(max-width: 768px) {
  .video-section { padding: 48px 16px !important; }
  .video-section video { min-height: 220px; }
}

@media(max-width: 480px) {
  .video-section { padding: 40px 12px !important; }
  .video-section video { min-height: 200px; }
}
`;

const tickerItems = [
  { sev: "S5", sevClass: "sev-5", text: "Emaar launches AED 3.2B tower adjacent to Burj Khalifa", loc: "Downtown Dubai" },
  { sev: "S4", sevClass: "sev-4", text: "Record AED 65M penthouse sold — Dubai's highest residential deal", loc: "Palm Jumeirah" },
  { sev: "S3", sevClass: "sev-3", text: "RERA confirms mandatory blockchain title deed registration Q3", loc: "DIFC" },
  { sev: "S5", sevClass: "sev-5", text: "DLD reports AED 141.9B transactions — 22% YoY growth", loc: "Dubai-wide" },
  { sev: "S4", sevClass: "sev-4", text: "Foreign buyers surge: 71% of off-plan sales to non-UAE nationals", loc: "All areas" },
  { sev: "S3", sevClass: "sev-3", text: "Dubai Marina prime prices hit AED 2,100/sqft — 18% YoY", loc: "Dubai Marina" },
  { sev: "S4", sevClass: "sev-4", text: "Nakheel confirms Palm Jebel Ali Phase 2, AED 12B investment", loc: "Jebel Ali" },
  { sev: "S3", sevClass: "sev-3", text: "JVC records highest-ever rental yield at 9.1% — Q2 2025", loc: "JVC" },
];

const testimonials = [
  {
    initials: "RM", persona: "Property Owner · UAE", stars: "★★★★★",
    quote: (<>I own three units across JVC, Dubai Hills, and Arjan. In Q1 2026, the Arjan metro extension approval came through as an S4 infrastructure signal on ACQAR before any of my WhatsApp groups picked it up. <strong>I listed my unit the same afternoon. It sold in six days at asking price.</strong></>),
    name: "Rajan Mehta", role: "Property Owner — 3 Units", location: "Dubai, UAE"
  },
  {
    initials: "EV", persona: "Property Owner · Abroad", stars: "★★★★★",
    quote: (<>I manage my Palm Jumeirah apartment from London. A RERA short-term rental circular hit as S4 Regulatory at 7am Dubai time — 9pm my time — <strong>before my own Dubai agent knew it existed.</strong> I responded, updated my NOC, and avoided a fine. That single alert justified everything.</>),
    name: "Elena Vassiliev", role: "Property Owner — Palm Jumeirah", location: "London, United Kingdom"
  },
  {
    initials: "KA", persona: "Property Buyer · UAE", stars: "★★★★★",
    quote: (<>I'd been hunting in Dubai Creek Harbour for eight months, always too late. Three weeks into using ACQAR Signal, <strong>I caught a DLD transaction cluster — 18 deals in four days — before any portal repriced.</strong> I offered that week and paid AED 85,000 below where identical floors listed two weeks later.</>),
    name: "Khalid Al-Ansari", role: "First-Time Property Buyer", location: "Abu Dhabi, UAE"
  },
  {
    initials: "MF", persona: "Property Buyer · International", stars: "★★★★★",
    quote: (<>By the time any Dubai launch reaches European media, the good units are gone. ACQAR Signal gave me an <strong>S5 alert on a Nakheel Dubai Islands launch three hours before reservations opened.</strong> I called my broker at midnight Milan time and reserved a unit. Simply not possible otherwise.</>),
    name: "Marco Ferretti", role: "Property Buyer — Dubai Islands", location: "Milan, Italy"
  },
  {
    initials: "PN", persona: "Portfolio Investor", stars: "★★★★★",
    quote: (<>I treat Dubai real estate like an equity portfolio — entry timing, area rotation, yield arbitrage. <strong>The area momentum overlay showed JVC accumulating S3+ signals 11 weeks before Bayut's quarterly report flagged the same trend.</strong> I added two more units in that window. That changes your return profile permanently.</>),
    name: "Priya Nair", role: "Portfolio Investor — 9 Units", location: "Dubai, UAE"
  },
  {
    initials: "JC", persona: "Luxury RE Broker · DIFC", stars: "★★★★★",
    quote: (<>In the AED 10M-plus segment, clients pay for intelligence no one else has. <strong>When an Emaar ultra-luxury launch hit as S5, I had pre-qualified four UHNW clients before the developer's press briefing.</strong> Three transacted. Over AED 80M in deals from a single early signal. ACQAR Signal is the first screen I open every morning.</>),
    name: "James Crawford", role: "Director, Ultra-Prime Sales", location: "DIFC, Dubai"
  },
];


// function VideoEmbed() {
//   return (
//     <div style={{
//       borderRadius: 'var(--radius-xl)',
//       overflow: 'hidden',
//       border: '1px solid var(--border-copper)',
//       boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
//     }}>
//       <video
//         controls
//         playsInline
//         autoPlay
//         muted
//         style={{ width: '100%', display: 'block' }}
//       >
//         <source src="/How_It_Work.mp4" type="video/mp4" />
//       </video>
//     </div>
//   );
// }


function HowItWorksSection() {
  return (
    <section style={{ padding: '80px 0' }}>
      {/* Heading */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <p style={{
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#C17F3E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '16px',
        }}>
          <span style={{ display: 'inline-block', width: '32px', height: '1px', background: '#C17F3E' }} />
          HOW IT WORKS
          <span style={{ display: 'inline-block', width: '32px', height: '1px', background: '#C17F3E' }} />
        </p>
        <h2 style={{
          fontSize: 'clamp(36px, 5vw, 60px)',
          fontWeight: '800',
          lineHeight: '1.05',
          margin: 0,
        }}>
          <span style={{ color: '#1A1A1A' }}>How </span>
          <span style={{ color: '#C17F3E' }}>ACQAR</span>
          <span style={{ color: '#1A1A1A' }}> Works</span>
        </h2>
      </div>

      {/* Video */}
      <VideoEmbed />
    </section>
  );
}

function VideoEmbed() {
  return (
    <div style={{
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      border: '1px solid var(--border-copper)',
      boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
    }}>
      <video
        controls
        playsInline
        autoPlay
        muted
        poster="/share-preview.jpg"
        style={{
          width: '100%',
          display: 'block',
          minHeight: '200px',   // 👈 adds minimum height on mobile
        }}
      >
        <source src="/How_It_Work.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

export default function AcqarSignal() {
  const [theme, setTheme] = useState("dark");
 
  const [marqueeKey, setMarqueeKey] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("acqar-theme");
    if (saved) {
      setTheme(saved);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("acqar-theme", theme);
  }, [theme]);

  // useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent("page_viewed", { page: "signal_landing" });
  }, []);


  useEffect(() => {
  const scrolled = { 25: false, 50: false, 75: false, 100: false };
  const handleScroll = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );
    if (scrollPercent >= 25 && !scrolled[25]) { scrolled[25] = true; trackEvent("scroll_depth", { page: "signal_landing", depth: "25%" }); }
    if (scrollPercent >= 50 && !scrolled[50]) { scrolled[50] = true; trackEvent("scroll_depth", { page: "signal_landing", depth: "50%" }); }
    if (scrollPercent >= 75 && !scrolled[75]) { scrolled[75] = true; trackEvent("scroll_depth", { page: "signal_landing", depth: "75%" }); }
    if (scrollPercent >= 100 && !scrolled[100]) { scrolled[100] = true; trackEvent("scroll_depth", { page: "signal_landing", depth: "100%" }); }
  };
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

useEffect(() => {
  const startTime = Date.now();
  return () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    trackEvent("time_spent", { page: "signal_landing", seconds: timeSpent });
  };
}, []);


  useEffect(() => {
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => { setMarqueeKey(k => k + 1); }, 150);
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { setMarqueeKey(k => k + 1); });
    });
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); clearTimeout(timeout); };
  }, []);

   const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    trackEvent("theme_toggle", { to: next });
    setTheme(next);
  };
  const navigate = useNavigate();
// const openSignIn = () => navigate("/login");

const openSignIn = (location = "unknown") => {
  trackEvent("cta_click", { location });
  window.location.href = "/login";
};

const [user, setUser] = useState(null);

useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setUser(data.session?.user ?? null);
  });
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });
  return () => listener.subscription.unsubscribe();
}, []);

  return (
    <>
     <Helmet>
  <title>Acqar Signal | AI Real Estate Market Intelligence — Dubai</title>
  <meta name="description" content="Acqar Signal monitors every Dubai property transaction, off-plan launch, and regulation in real-time. AI-powered market intelligence for investors, brokers & developers." />
  <link rel="canonical" href="https://www.acqar.com/signal" />
  <meta property="og:title" content="Acqar Signal | AI Real Estate Market Intelligence — Dubai" />
  <meta property="og:description" content="Real-time Dubai property signals — DLD transactions, off-plan launches, RERA alerts. S1–S5 AI severity scoring across 43 areas." />
  <meta property="og:url" content="https://www.acqar.com/signal" />
  <meta name="robots" content="index, follow" />
  <script type="application/ld+json">{`
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Acqar Signal",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "url": "https://www.acqar.com/signal",
      "description": "AI-powered real estate market intelligence platform monitoring every Dubai property transaction, off-plan launch, and regulation in real-time.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "AED",
        "availability": "https://schema.org/InStock"
      },
      "provider": {
        "@type": "Organization",
        "name": "ACQAR",
        "url": "https://www.acqar.com"
      },
      "featureList": [
        "14 live data sources",
        "S1-S5 AI severity scoring",
        "Real-time Dubai property signals",
        "DLD transaction monitoring",
        "RERA regulatory alerts",
        "43 Dubai areas covered"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "240",
        "bestRating": "5"
      }
    }
  `}</script>
  <script type="application/ld+json">{`
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Acqar Signal?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Acqar Signal is the UAE's first AI agent that monitors every Dubai property transaction, off-plan launch, regulation, and market movement in real-time — updated every 3 minutes across 14 data sources."
          }
        },
        {
          "@type": "Question",
          "name": "How does Acqar Signal work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Acqar Signal deploys a persistent AI agent that fetches from RSS feeds, Google News, DLD signals, Reddit, and GDELT every 3 minutes. Each event is classified across 10 categories and scored S1-S5 by severity."
          }
        },
        {
          "@type": "Question",
          "name": "Is Acqar Signal free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Acqar Signal is free to access. No credit card required. Live data updated every 3 minutes."
          }
        },
        {
          "@type": "Question",
          "name": "How many Dubai areas does Acqar Signal cover?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Acqar Signal monitors 43 Dubai areas with GPS-accurate mapping, covering every major community and district in Dubai."
          }
        }
      ]
    }
  `}</script>
</Helmet>
<style>{styles}</style>

      {/* ── NAV ── */}
      <nav>
        {/* Logo */}
        <div className="nav-logo">
          <div className="brand"><span>ACQ</span><span>AR</span></div>
        </div>

        {/* Desktop nav links (hidden below 768px) */}
        <ul className="nav-links">
           
          {/* <li><a href="https://www.acqar.com/truvalu" target="_blank" rel="noopener noreferrer">TRUVALU™</a></li> */}
          <li><Link to="/truvalu">TRUVALU™</Link></li>
           <li><a href="/pricing">PRICING</a></li>
          <li><a href="https://www.acqar.com/blogs" target="_blank" rel="noopener noreferrer">RESOURCES</a></li>
         
        </ul>

        {/* Mobile nav links — compact inline, visible below 768px */}
        <ul className="nav-links-mobile">
          <li><a href="https://www.acqar.com/truvalu" target="_blank" rel="noopener noreferrer">TRUVALU™</a></li>
          <li><a href="/pricing">PRICING</a></li>
          <li><a href="https://www.acqar.com/blogs" target="_blank" rel="noopener noreferrer">RESOURCES</a></li>
        </ul>

        {/* Right actions */}
        <div className="nav-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? "☀" : "🌙"}
          </button>
          {user ? (
  <button
    className="btn-primary"
  onClick={() => window.location.href = "/dashboard"}
    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
  >
    Dashboard 
  </button>
) : (
  <button
    className="btn-primary"
    onClick={openSignIn}
    style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
  >
    Sign In 
  </button>
)}
        </div>
      </nav>

      {/* LIVE TICKER */}
      <div className="live-ticker">
        <div className="ticker-label"><div className="ticker-dot"></div> Live Signals</div>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <div className="ticker-item" key={i}>
                <span className={`sev ${item.sevClass}`}>{item.sev}</span>
                {item.text}
                <span className="loc">· {item.loc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="hero" id="hero" style={{ marginTop: 96 }}>
        <div className="hero-grid-bg"></div>
        <div className="hero-content">
          <div className="hero-eyebrow"><div className="dot"></div> AI-Powered · Real-Time · Dubai Only</div>
        <h1>The Bloomberg<br />of <em>Dubai Real<br /> Estate.</em></h1>
          <p className="hero-sub">
           ACQAR Signal is the <strong> UAE’s 1st AI agent</strong> that monitors every transaction, off-plan launch, regulation, and market movement across Dubai's property market — <strong>in real-time, before anyone else.</strong>
          </p>
          <div className="hero-cta-row">
            <button className="btn-hero" onClick={() => openSignIn("hero")} style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
             Access the Terminal →
            </button>
          <button className="btn-hero-ghost" onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })} style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}>
  ▶ How It Works
</button>
          </div>
          <div className="hero-trust-row">
            <div className="check">14 Live Data Sources</div>
            <div className="check">S1–S5 AI Severity Scoring</div>
            <div className="check">Updates Every 3 Minutes</div>
          </div>
        </div>

        {/* Terminal Window */}
        <div className="hero-visual">
          <div className="terminal-window">
            <div className="terminal-topbar">
              <div className="terminal-dots"><span></span><span></span><span></span></div>
              <div className="terminal-title">ACQAR SIGNAL — Dubai RE Intelligence</div>
              <span className="terminal-live-badge">● Live</span>
            </div>
            <div className="terminal-stats-bar">
              <div className="t-stat"><div className="label">Signals Today</div><div className="value up">247</div><div className="delta">↑ 18% vs yesterday</div></div>
              <div className="t-stat"><div className="label">S4/S5 Alerts</div><div className="value" style={{ color: "#EF4444" }}>12</div><div className="delta" style={{ color: "var(--text-muted)" }}>Active now</div></div>
              <div className="t-stat"><div className="label">Areas Monitored</div><div className="value copper">43</div><div className="delta" style={{ color: "var(--text-muted)" }}>All Dubai zones</div></div>
              <div className="t-stat"><div className="label">Last Update</div><div className="value" style={{ fontSize: 12, color: "var(--green)" }}>14s ago</div><div className="delta" style={{ color: "var(--text-muted)" }}>Auto-refresh 3min</div></div>
            </div>
            <div className="terminal-map">
              <div className="map-grid-line h" style={{ top: "33%" }}></div>
              <div className="map-grid-line h" style={{ top: "66%" }}></div>
              <div className="map-grid-line v" style={{ left: "25%" }}></div>
              <div className="map-grid-line v" style={{ left: "50%" }}></div>
              <div className="map-grid-line v" style={{ left: "75%" }}></div>
              <div className="map-dot s5" style={{ left: "50%", top: "38%" }}></div>
              <div className="map-label" style={{ left: "50%", top: "38%" }}>Downtown</div>
              <div className="map-dot s4" style={{ left: "22%", top: "55%" }}></div>
              <div className="map-label" style={{ left: "22%", top: "55%" }}>Palm</div>
              <div className="map-dot s4" style={{ left: "18%", top: "65%" }}></div>
              <div className="map-label" style={{ left: "18%", top: "65%" }}>Marina</div>
              <div className="map-dot s3" style={{ left: "54%", top: "44%" }}></div>
              <div className="map-dot s3" style={{ left: "46%", top: "42%" }}></div>
              <div className="map-dot s2" style={{ left: "32%", top: "62%" }}></div>
              <div className="map-dot s2" style={{ left: "38%", top: "68%" }}></div>
              <div className="map-dot s3" style={{ left: "66%", top: "32%" }}></div>
              <div className="map-dot s4" style={{ left: "60%", top: "40%" }}></div>
            </div>
            <div className="terminal-feed">
              <div className="feed-header"><div className="title">Live Event Feed</div><div className="count">247 signals</div></div>
              {[
                { sev: "S5", sevClass: "sev-5", title: "Emaar AED 3.2B tower launch — adjacent to Burj Khalifa", meta: "Off-Plan · Arabian Business", area: "Downtown", time: "2m ago", isNew: true },
                { sev: "S4", sevClass: "sev-4", title: "Record AED 65M penthouse sold — Palm Jumeirah", meta: "Transaction · The National", area: "Palm", time: "14m ago" },
                { sev: "S3", sevClass: "sev-3", title: "RERA blockchain title deed mandate — effective Q3", meta: "Regulatory · Gulf News", area: "DIFC", time: "31m ago" },
                { sev: "S2", sevClass: "sev-2", title: "JVC rental yield stabilises at 9.1% — highest in Dubai", meta: "Rental Yield · Bayut Blog", area: "JVC", time: "52m ago" },
              ].map((row, i) => (
                <div className={`feed-row${row.isNew ? " new" : ""}`} key={i}>
                  <div className="feed-sev"><span className={`sev-pill ${row.sevClass}`}>{row.sev}</span></div>
                  <div className="feed-content"><div className="feed-title">{row.title}</div><div className="feed-meta">{row.meta}</div></div>
                  <div className="feed-area">{row.area}</div>
                  <div className="feed-time">{row.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


{/* HOW ACQAR WORKS — Video Section */}

<section className="video-section" style={{ padding: '80px 48px', background: 'var(--dark)' }}>
  <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 0px' }}>
    
    {/* Heading — same style as other sections */}
    <div style={{ marginBottom: '48px', textAlign: 'center' }}>
      <div className="section-label" style={{ justifyContent: 'center' }}>See it in Action</div>
      <h2 className="section-title" style={{ textAlign: 'center' }}>
        How <span className="text-copper">ACQAR</span> Works
      </h2>
    </div>

    {/* Video */}
    <VideoEmbed />

  </div>
</section>

   


      {/* PROBLEM SECTION */}
      <section className="problem-section" id="problem">
        <div className="problem-layout">
          <div className="problem-intro">
            <div className="section-label">The Problem</div>
            <h2 className="section-title">Dubai's Market Never Sleeps.<br /><span className="text-copper">You Can't Afford to Either.</span></h2>
            <p className="section-sub" style={{ margin: "0 auto", textAlign: "center" }}>Dubai real estate moves at a speed unlike any market on earth. Off-plan launches sell out in hours. Regulations shift overnight. Billion-dirham opportunities open and close before most investors even see the news.</p>
          </div>
          <div className="problem-list">
            {[
              { num: "01", tag: "Speed", title: "By The Time You Read It, It's Gone", desc: (<>News sites, portals, and newsletters publish 6–24 hours after an event. <strong>Binghatti Apex sold 180 units in 4 hours.(Arabian Business, 2026)</strong> Your inbox never stood a chance.</>) },
              { num: "02", tag: "Fragmentation", title: "Manual Monitoring Is Chaos", desc: (<>You're juggling <strong>10 WhatsApp groups, 5 property portals, 4 news sites, and 3 developer newsletters</strong> — manually, every single day. And still missing signals.</>) },
              { num: "03", tag: "Intelligence Gap", title: "The Smart Money Has Better Data", desc: (<>Institutional investors and tier-1 brokers have teams dedicated to monitoring this market. Without the same intelligence, <strong>you're always reacting, never anticipating.</strong></>) },
              { num: "04", tag: "Compliance", title: "Regulatory Surprises Kill Deals", desc: (<>RERA circulars, DLD policy changes, golden visa thresholds — <strong>one missed regulation can invalidate a deal or trigger a penalty.</strong> These come with no warning.</>) },
              { num: "05", tag: "Momentum", title: "Area Momentum Is Invisible", desc: (<>Which neighbourhood is quietly accumulating deals? Which area just got a school, metro line, or park approved? <strong>These signals are buried in 200 news articles a day.</strong></>) },
               { num: "06", tag: "Sentiment", title: "Community Signals Get Lost in Noise", desc: (<>Reddit discussions, broker WhatsApp leaks, r/DubaiRealEstate threads — <strong>real sentiment from real investors</strong> is scattered, unfiltered, and impossible to act on.</>) },
            ].map((row, i) => (
              <div className="problem-row" key={i}>
                <div className="problem-num">{row.num}</div>
                <div className="problem-title-col"><div className="problem-tag-pill">{row.tag}</div><h3 className="problem-title">{row.title}</h3></div>
                <div className="problem-desc-col"><p>{row.desc}</p></div>
              </div>
            ))}
          </div>
          <div className="problem-cost-bar">
            <div className="cost-text">
              <h3>The Real Cost of Being Uninformed</h3>
              <p>A single missed S5 signal — one off-plan launch, one major transaction, one regulatory shift — can represent millions in lost opportunity or unnecessary risk in Dubai's market.</p>
            </div>
            <div className="cost-number">
              <div className="amount">AED 0</div>
              <div className="label">Cost of ACQAR Signal vs. the alternative</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="features-section">
          <div className="features-header">
            <div className="section-label">The Solution</div>
            <h2 className="section-title">One AI Agent.<br /><span className="text-copper">Every Signal. Nothing Missed.</span></h2>
            <p className="section-sub">ACQAR Signal deploys a persistent AI agent that monitors 14 data sources simultaneously, classifies every event by category and severity, and surfaces exactly what matters — plotted on a live map of Dubai.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card large">
              <div>
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 7.5a12 12 0 0 1 19 0"/><path d="M5.5 11a8 8 0 0 1 13 0"/><path d="M8.5 14.5a4 4 0 0 1 7 0"/><line x1="12" y1="18" x2="12" y2="18.5" strokeWidth="2"/></svg>
                </div>
                <h3>14 Sources. One Feed. Zero Manual Work.</h3>
                <p>The Signal AI agent simultaneously monitors RSS feeds from Gulf News, Arabian Business, The National, Zawya, Bayut, and Property Finder; Google News feeds for DLD, RERA, and major developers; Reddit's r/DubaiRealEstate; GDELT global events; and direct DLD transaction signals. Every 3 minutes, automatically.</p>
                <div className="feature-tags">
                  {["RSS Feeds", "Google News", "Reddit", "DLD Direct", "GDELT"].map(t => <span className="ftag active" key={t}>{t}</span>)}
                  {["Twitter (coming)", "LinkedIn (coming)"].map(t => <span className="ftag" key={t}>{t}</span>)}
                </div>
              </div>
              <div className="source-list">
                {[
                  { name: "Gulf News Property RSS", active: true },
                  { name: "The National Property RSS", active: true },
                  { name: "Arabian Business RE RSS", active: true },
                  { name: "DLD Transaction Signals", active: true },
                  { name: "Reddit r/DubaiRealEstate", active: true },
                  { name: "Google News: RERA / DLD", active: true },
                  { name: "GDELT Global Events", active: true },
                  { name: "Twitter / LinkedIn", active: false },
                ].map((s, i) => (
                  <div className="source-item" key={i}>
                    <div className="src-dot" style={!s.active ? { background: "var(--text-muted)" } : {}}></div>
                    {s.name}
                    <span className="src-count" style={!s.active ? { color: "var(--text-muted)" } : {}}>{s.active ? "Live" : "Soon"}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01"/><path d="M6 12h3M15 12h3"/><path d="M9 12a1.5 1.5 0 0 0 0 3h6a1.5 1.5 0 0 0 0-3"/></svg>
              </div>
              <h3>AI Severity Classification — S1 to S5</h3>
              <p>Every event is instantly classified by our AI engine across 10 categories — Transaction, Off-Plan, Regulatory, Construction, Investment, Price Signal, Rental Yield, Free Zone, Infrastructure, and Foreign Buyers — then assigned a severity score from S1 (watch) to S5 (critical alert).</p>
              <div className="feature-tags">
                <span className="ftag active" style={{ color: "#EF4444", borderColor: "rgba(239,68,68,0.4)" }}>S5 Critical</span>
                <span className="ftag active" style={{ color: "#F59E0B", borderColor: "rgba(245,158,11,0.4)" }}>S4 High</span>
                <span className="ftag active">S3 Medium</span>
                <span className="ftag">S2 Standard</span>
                <span className="ftag">S1 Watch</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
              </div>
              <h3>Live Geographic Intelligence</h3>
              <p>Every signal is geolocated and plotted on an interactive Dubai map. Watch deals, launches, and regulatory changes appear in real-time across 43 monitored areas — colour-coded by severity. Identify area momentum clusters the moment they form.</p>
              <div className="feature-tags">
                {["43 Areas", "GPS-accurate", "Momentum clusters"].map(t => <span className="ftag active" key={t}>{t}</span>)}
                <span className="ftag">Overlay layers</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="2"/></svg>
              </div>
              <h3>Community Signal Panel</h3>
              <p>A curated, AI-filtered stream of real investor sentiment from Reddit, social media, and community sources — stripped of noise and formatted as actionable signals. Know what the smart money is actually saying.</p>
              <div className="feature-tags">
                <span className="ftag active">Reddit r/DubaiRE</span>
                <span className="ftag active">Sentiment scored</span>
                <span className="ftag">Broker intel (coming)</span>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v18h18"/><path d="M7 16l4-5 4 3 4-7"/><circle cx="7" cy="16" r="1" fill="currentColor" stroke="none"/><circle cx="11" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="7" r="1" fill="currentColor" stroke="none"/></svg>
              </div>
              <h3>Institutional-Grade Reports Tab</h3>
              <p>All S4 and S5 events are automatically surfaced in the Reports tab — ready for portfolio review, investor presentations, or due diligence. Structured, sourced, and exportable.</p>
              <div className="feature-tags">
                <span className="ftag active">S4/S5 only</span>
                <span className="ftag active">Sourced &amp; cited</span>
                <span className="ftag">PDF export (coming)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD */}
      <section className="dashboard-section" id="dashboard">
        <div className="dashboard-intro">
          <div className="section-label" style={{ justifyContent: "center" }}>The Terminal</div>
          <h2 className="section-title" style={{ textAlign: "center" }}>One Screen.<br /><span className="text-copper">The Entire Dubai Market.</span></h2>
          <p className="section-sub" style={{ margin: "0 auto", textAlign: "center" }}>Built like a Bloomberg Terminal, designed for Dubai real estate. Every live signal, every area, every source — in one unified intelligence interface.</p>
        </div>
        <div className="dashboard-frame" style={{ position: "relative" }}>
          <div className="dash-topbar">
            <div className="dash-logo"><span>ACQ</span><span style={{ color: "var(--text-primary)" }}>AR</span>&nbsp;<span style={{ color: "var(--text-muted)", fontWeight: 500, fontSize: 12 }}>SIGNAL</span></div>
            <div className="dash-tabs">
              {[
                { label: "Live Feed", active: true },
                { label: "Map View" },
                { label: "Reports" },
                { label: "Community" },
                { label: "Analytics" },
              ].map((tab, i) => (
                <div className={`dash-tab${tab.active ? " active" : ""}`} key={i}>{tab.label}</div>
              ))}
            </div>
            <div className="dash-status">
              <div className="live-ind"><div className="ticker-dot" style={{ background: "var(--green)" }}></div>&nbsp;Live</div>
              <span>247 signals · 43 areas</span>
              <span>Last fetch: 14s ago</span>
            </div>
          </div>

          <div className="dash-body">
            {/* Left sidebar */}
            <div className="dash-sidebar-left">
              <div className="dash-sidebar-section">
                <div className="dash-sidebar-title">Time Filter</div>
                <div>
                  {[["24H", true], ["1H", false], ["6H", false], ["72H", false]].map(([l, a]) => (
                    <span className={`filter-chip${a ? " active" : ""}`} key={l}><span className="chip-dot"></span> {l}</span>
                  ))}
                </div>
              </div>
              <div className="dash-sidebar-section">
                <div className="dash-sidebar-title">Severity</div>
                <div>
                  <span className="filter-chip active" style={{ color: "#EF4444", borderColor: "rgba(239,68,68,0.4)" }}><span className="chip-dot" style={{ background: "#EF4444" }}></span> S5</span>
                  <span className="filter-chip active" style={{ color: "#F59E0B", borderColor: "rgba(245,158,11,0.4)" }}><span className="chip-dot" style={{ background: "#F59E0B" }}></span> S4</span>
                  <span className="filter-chip active"><span className="chip-dot"></span> S3</span>
                  <span className="filter-chip">S2</span>
                  <span className="filter-chip">S1</span>
                </div>
              </div>
              <div className="dash-sidebar-section">
                <div className="dash-sidebar-title">Category</div>
                <div>
                  {[["Transaction", true], ["Off-Plan", true], ["Regulatory", false], ["Price Signal", true], ["Construction", false], ["Rental Yield", false]].map(([l, a]) => (
                    <span className={`filter-chip${a ? " active" : ""}`} key={l}>{l}</span>
                  ))}
                </div>
              </div>
              <div style={{ overflowY: "auto", flex: 1 }}>
                <div className="dash-sidebar-title" style={{ padding: "10px 12px 0", margin: 0 }}>Signal Rows</div>
                {[
                  { sev: "S5", bg: "rgba(239,68,68,0.15)", color: "#EF4444", title: "Emaar AED 3.2B tower — Downtown", meta: "Off-Plan · 2m ago", active: true },
                  { sev: "S4", bg: "rgba(245,158,11,0.15)", color: "#F59E0B", title: "AED 65M penthouse — Palm Jumeirah", meta: "Transaction · 14m ago" },
                  { sev: "S4", bg: "rgba(245,158,11,0.15)", color: "#F59E0B", title: "Nakheel Palm Jebel Ali Ph2 AED 12B", meta: "Off-Plan · 31m ago" },
                  { sev: "S3", bg: "rgba(184,115,51,0.15)", color: "var(--copper)", title: "RERA blockchain mandate Q3 2025", meta: "Regulatory · 52m ago" },
                  { sev: "S3", bg: "rgba(184,115,51,0.15)", color: "var(--copper)", title: "Dubai Hills 4BR AED 12.5M sold", meta: "Transaction · 1h ago" },
                  { sev: "S2", bg: "rgba(59,130,246,0.15)", color: "#3B82F6", title: "JVC rental yield 9.1% — Q2 record", meta: "Rental · 2h ago" },
                ].map((s, i) => (
                  <div className={`signal-row${s.active ? " active" : ""}`} key={i}>
                    <div className="sig-sev-badge" style={{ background: s.bg, color: s.color }}>{s.sev}</div>
                    <div className="sig-content"><div className="sig-title">{s.title}</div><div className="sig-meta">{s.meta}</div></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center map */}
            <div className="dash-map">
              <div className="dash-map-bg"></div>
              {["25%", "50%", "75%"].map(t => <div className="map-grid-line h" style={{ top: t }} key={t}></div>)}
              {["20%", "40%", "60%", "80%"].map(l => <div className="map-grid-line v" style={{ left: l }} key={l}></div>)}
              {[
                { left: "52%", top: "36%", size: 28, bg: "rgba(239,68,68,0.2)", border: "#EF4444", core: 10, coreBg: "#EF4444", coreGlow: "#EF4444", label: "Downtown", delay: "" },
                { left: "19%", top: "55%", size: 22, bg: "rgba(245,158,11,0.2)", border: "#F59E0B", core: 8, coreBg: "#F59E0B", label: "Palm", delay: "0.5s" },
                { left: "15%", top: "65%", size: 22, bg: "rgba(245,158,11,0.2)", border: "#F59E0B", core: 8, coreBg: "#F59E0B", label: "Marina", delay: "1s" },
                { left: "56%", top: "42%", size: 18, bg: "rgba(184,115,51,0.2)", border: "var(--copper)", core: 7, coreBg: "var(--copper)", label: "Bus. Bay", delay: "0.3s" },
                { left: "47%", top: "40%", size: 16, bg: "rgba(184,115,51,0.2)", border: "var(--copper)", core: 6, coreBg: "var(--copper)", label: "DIFC", delay: "0.8s" },
                { left: "68%", top: "30%", size: 16, bg: "rgba(184,115,51,0.2)", border: "var(--copper)", core: 6, coreBg: "var(--copper)", label: "Creek Harbour", delay: "1.2s" },
                { left: "32%", top: "63%", size: 14, bg: "rgba(59,130,246,0.2)", border: "#3B82F6", core: 5, coreBg: "#3B82F6", label: "JVC", delay: "0.6s" },
                { left: "40%", top: "72%", size: 14, bg: "rgba(59,130,246,0.2)", border: "#3B82F6", core: 5, coreBg: "#3B82F6", label: "Dubai Hills", delay: "0.4s" },
                { left: "62%", top: "44%", size: 20, bg: "rgba(245,158,11,0.2)", border: "#F59E0B", core: 7, coreBg: "#F59E0B", label: "MBR City", delay: "0.9s" },
              ].map((hs, i) => (
                <div className="map-hotspot" style={{ left: hs.left, top: hs.top }} key={i}>
                  <div className="hs-ring" style={{ width: hs.size, height: hs.size, background: hs.bg, border: `2px solid ${hs.border}`, animationDelay: hs.delay }}></div>
                  <div className="hs-core" style={{ width: hs.core, height: hs.core, background: hs.coreBg, boxShadow: hs.coreGlow ? `0 0 12px ${hs.coreGlow}` : undefined }}></div>
                  <div className="hs-label">{hs.label}</div>
                </div>
              ))}
              <div className="map-event-card">
                <div className="mec-top">
                  <span className="mec-loc">📍 Downtown Dubai</span>
                  <span className="sev-pill sev-5" style={{ fontSize: 9, padding: "2px 7px", borderRadius: 3, background: "rgba(239,68,68,0.2)", color: "#EF4444", fontWeight: 800 }}>S5 · Critical</span>
                </div>
                <div className="mec-title">Emaar launches Burj Khalifa-adjacent mega-tower with AED 3.2B GDV</div>
                <div className="mec-meta"><span>Off-Plan</span><span className="mec-price">AED 3.2B</span><span>Arabian Business · 2m ago</span></div>
              </div>
              <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(13,13,13,0.85)", backdropFilter: "blur(8px)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", fontSize: 9 }}>
                <div style={{ marginBottom: 6, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase" }}>Signal Severity</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {[["#EF4444", "S5 Critical", "0 0 6px #EF4444"], ["#F59E0B", "S4 High", ""], ["var(--copper)", "S3 Medium", ""], ["#3B82F6", "S2 Standard", ""]].map(([color, label, shadow]) => (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }} key={label}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: shadow || undefined }}></div>
                      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="dash-sidebar-right">
              <div className="analytics-block">
                <div className="dash-sidebar-title">Signals by Category (24H)</div>
                <div className="mini-bar-chart">
                  {[[true, "90%"], [false, "60%"], [true, "75%"], [false, "40%"], [false, "55%"], [true, "85%"], [false, "30%"], [false, "50%"]].map(([active, h], i) => (
                    <div className={`mini-bar${active ? " active" : ""}`} style={{ height: h }} key={i}></div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "var(--text-muted)", marginTop: 4 }}>
                  {["OffPlan", "Trans", "Price", "Reg", "Const", "Invest", "Rent", "Int'l"].map(l => <span key={l}>{l}</span>)}
                </div>
              </div>
              <div className="analytics-block">
                <div className="dash-sidebar-title">Area Momentum</div>
                <div className="area-momentum-list">
                  {[["Downtown", "100%", "#EF4444", 18], ["Palm Jumeirah", "78%", "var(--copper)", 14], ["Business Bay", "66%", "var(--copper)", 12], ["Dubai Marina", "55%", "var(--copper)", 10], ["MBR City", "44%", "var(--copper)", 8], ["Creek Harbour", "33%", "var(--copper)", 6]].map(([name, w, color, count]) => (
                    <div className="momentum-row" key={name}>
                      <span className="m-name">{name}</span>
                      <div className="m-bar-wrap"><div className="m-bar" style={{ width: w, background: color }}></div></div>
                      <span className="m-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="analytics-block">
                <div className="dash-sidebar-title">Pipeline Status</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
                  {["RSS Feeds", "DLD Signals", "Reddit Feed", "GDELT Events"].map((src, i) => (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, padding: "5px 0", borderBottom: i < 3 ? "1px solid var(--border)" : undefined }} key={src}>
                      <span style={{ color: "var(--text-secondary)" }}>{src}</span>
                      <span style={{ color: "var(--green)", fontWeight: 700 }}>● Live</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="chat-input-bar">
                <div className="chat-input"><span>Ask the AI agent...</span><span className="send-icon">↑</span></div>
              </div>
            </div>
          </div>

          <div className="dash-statusbar">
            <div className="status-items">
              <div className="status-item"><div className="si-dot" style={{ background: "var(--green)" }}></div> Connected</div>
              <div className="status-item"><div className="si-dot" style={{ background: "var(--copper)" }}></div> 247 signals in store</div>
              <div className="status-item"><div className="si-dot" style={{ background: "var(--blue)" }}></div> 43 areas monitored</div>
              <div className="status-item">14 active sources</div>
            </div>
            <div>© 2025 ACQARLABS L.L.C-FZ · RICS-Aligned Intelligence</div>
          </div>

          <div className="dashboard-cta-overlay" style={{ pointerEvents: 'none' }}>
            <div className="overlay-cta" style={{ pointerEvents: 'auto' }}>
              <p className="blur-notice"><strong>This is your competition's edge.</strong> Request access to see the full, live terminal.</p>
              <button
                className="btn-hero"
                style={{ fontSize: 16, pointerEvents: 'auto', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
               onClick={() => openSignIn("dashboard_overlay")}
              >
                Access the Terminal →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works">
        <div className="hiw-section">
          <div className="features-header" style={{ textAlign: "center", marginBottom: 0 }}>
            <div className="section-label" style={{ justifyContent: "center" }}>How It Works</div>
            <h2 className="section-title" style={{ textAlign: "center" }}>From Market Event to<br /><span className="text-copper">Your Screen in Minutes.</span></h2>
            <p className="section-sub" style={{ margin: "0 auto", textAlign: "center" }}>A fully autonomous AI pipeline that never sleeps, never misses, and never needs prompting.</p>
          </div>
          <div className="hiw-grid">
            <div className="hiw-connector"></div>
            {[
              { n: "1", title: "Agent Monitors 14 Sources", desc: "Every 3 minutes, the AI agent fetches from RSS feeds, Google News, DLD signals, Reddit, and GDELT — automatically, in parallel." },
              { n: "2", title: "AI Filters Dubai RE Only", desc: "Irrelevant content is discarded using a strict Dubai real estate relevance filter. Only property intelligence passes through." },
              { n: "3", title: "Classified by Severity", desc: "Each event is categorised (10 types) and scored S1–S5 by an AI classifier trained on Dubai market dynamics and institutional frameworks." },
              { n: "4", title: "Delivered to Your Terminal", desc: "New signals appear on your map and feed in real-time via Socket.io push. No refresh needed. High-severity signals alert immediately." },
            ].map((card) => (
              <div className="hiw-card" key={card.n}>
                <div className="hiw-number">{card.n}</div>
                <h4>{card.title}</h4>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>

      

        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="stats-grid">
          {[
            { num: "14", label: "Live Data Sources\nMonitored Simultaneously", sub: "RSS · Google News · Reddit · DLD · GDELT" },
            { num: "43", label: "Dubai Areas Covered\nWith GPS-Accurate Mapping", sub: "Every major community and district" },
            { num: "3min", label: "Refresh Cycle\nFaster Than Any News Outlet", sub: "Automated · Continuous · Never sleeps" },
            { num: "S1–S5", label: "AI Severity Scoring\nAcross 10 Event Categories", sub: "From watch signals to critical alerts" },
          ].map((s) => (
            <div className="stat-block" key={s.num}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label" style={{ whiteSpace: "pre-line" }}>{s.label}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section>
        <div>
          <div style={{ maxWidth: 1200, margin: "0 auto 52px", textAlign: "center", padding: "0 24px" }}>
            <div className="section-label" style={{ justifyContent: "center" }}>Trusted By Those Who Act First</div>
            <h2 className="section-title" style={{ textAlign: "center" }}>The Edge Every<br /><span className="text-copper">Market Player Needs.</span></h2>
          </div>
          <div className="marquee-wrap" key={marqueeKey}>
            <div className="marquee-track">
              {[...testimonials, ...testimonials].map((t, i) => (
                <div className="testimonial-card" key={i}>
                  <div className="t-stars">{t.stars}</div>
                  <div className="t-persona"><div className="t-persona-dot"></div>{t.persona}</div>
                  <p className="t-quote">{t.quote}</p>
                  <div className="t-author">
                    <div className="t-avatar">{t.initials}</div>
                    <div className="t-info">
                      <div className="name">{t.name}</div>
                      <div className="role">{t.role}</div>
                      <div className="location">{t.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta-section" id="final-cta">
        <div className="final-cta-content">
          <div className="final-cta-eyebrow"><div className="ticker-dot"></div> ACQAR Signal — Early Access Open</div>
          <h2>Stop Watching.<br /><span className="text-copper">Start Knowing.</span></h2>
          <p>Join the investors, brokers, and analysts who have given themselves the same real-time intelligence edge that institutional money has always had. Dubai's market moves at speed. Now, so do you.</p>
          <div className="final-cta-buttons">
            <button className="btn-hero" style={{ fontSize: 16, padding: "18px 36px", touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }} onClick={() => openSignIn("final_cta")}>
              Access the Terminal →
            </button>
            <a href="https://www.acqar.com" target="_blank" rel="noreferrer" className="btn-hero-ghost" style={{ fontSize: 15, padding: "18px 28px" }}>Learn About ACQAR ↗</a>
          </div>
          <div className="final-trust">
            <span>Free to Access</span>
            <span>No Credit Card Required</span>
            <span>Live Data · Updated Every 3 Minutes</span>
            <span>RICS-Aligned Intelligence</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ position: 'relative', background: 'var(--dark-card)', borderTop: '1px solid var(--border)', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent 0%, #B87333 35%, #B87333 65%, transparent 100%)' }}></div>
        <div className="footer-inner-wrap">
          <div className="footer-main-grid" style={{ marginBottom: 80 }}>
            {/* Brand column */}
            <div>
              <div style={{ marginBottom: 24, lineHeight: 1 }}>
                <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px', display: 'inline-block' }}>
                  <span style={{ color: '#B87333' }}>ACQ</span><span style={{ color: 'var(--text-primary)' }}>AR</span>
                </span>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.75, color: 'rgba(10,10,10,0.5)', fontWeight: 500, marginBottom: 28, maxWidth: 280 }}>
                An AI-powered property intelligence platform built exclusively for Dubai real estate. Independent, institutional-quality, and always on.
              </p>
              {/* <div className="footer-rics-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'white', border: '1px solid rgba(184,115,51,0.2)', borderRadius: 999, marginBottom: 32 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="footer-rics-text" style={{ fontSize: 9, fontWeight: 900, color: 'rgba(10,10,10,0.7)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>RICS-Aligned Intelligence</span>
              </div> */}
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { href: 'https://www.linkedin.com/company/acqar', label: 'LinkedIn', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
                  { href: 'https://www.instagram.com/acqar.dxb/', label: 'Instagram', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
                ].map(({ href, label, icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="footer-social-link">
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Product column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#B87333', opacity: 0.7 }}></span>
                <h6 style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#0A0A0A', margin: 0 }}>Product</h6>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'ACQAR TRUVALU™', active: true, href: 'https://www.acqar.com/truvalu' },
                  { label: 'ACQAR SIGNAL™', active: true, href: 'https://www.acqar.com/' },
                  { label: 'ACQAR PASSPORT™' },
                  { label: 'PRICING', active: true, href: '/pricing' },
                ].map(({ label, active, soon, href }) => (
                  <li key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, fontWeight: 600, color: 'rgba(10,10,10,0.55)', cursor: active ? 'pointer' : 'default' }}>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{label}</a>
                    ) : label}
                    {soon && <span style={{ padding: '1px 6px', fontSize: 8, fontWeight: 900, textTransform: 'uppercase', background: 'rgba(184,115,51,0.1)', color: '#B87333', border: '1px solid rgba(184,115,51,0.2)', borderRadius: 4 }}>Soon</span>}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#B87333', opacity: 0.7 }}></span>
                <h6 style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#0A0A0A', margin: 0 }}>Company</h6>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {['About ACQAR',  'Contact Us'].map(l => (
  <li key={l} style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(10,10,10,0.55)', cursor: 'pointer' }}>{l}</li>
))}
<li style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(10,10,10,0.55)' }}>
  <a href="/broker" style={{ color: 'inherit', textDecoration: 'none' }}>Brokers</a>
</li>
              </ul>
            </div>

            {/* Legal column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#B87333', opacity: 0.7 }}></span>
                <h6 style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#0A0A0A', margin: 0 }}>Legal & Info</h6>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Intelligence Blog', href: 'https://www.acqar.com/blogs' },
                  { label: 'Terms of Use', href: 'https://www.acqar.com/terms' },
                  { label: 'Privacy Policy', href: 'https://www.acqar.com/terms' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(10,10,10,0.55)', textDecoration: 'none', cursor: 'pointer' }}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Comparisons column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#B87333', opacity: 0.7 }}></span>
                <h6 style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#0A0A0A', margin: 0 }}>Comparisons</h6>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {['vs Bayut TruEstimate', 'vs Property Finder', 'vs Traditional Valuers', 'Why ACQAR?'].map(l => (
                  <li key={l} style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(10,10,10,0.55)', cursor: 'pointer' }}>{l}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 900, fontSize: 10, letterSpacing: '0.05em' }}>
                <span style={{ color: '#B87333' }}>ACQ</span>
                <span style={{ color: 'var(--text-primary)' }}>AR</span>
              </span>
              <span style={{ width: 1, height: 12, background: 'var(--border)' }}></span>
              <span style={{ fontWeight: 600, fontSize: 10, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Dubai, United Arab Emirates</span>
            </div>
            <p className="footer-copyright" style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.2em', textAlign: 'center', margin: 0, color: 'var(--text-muted)' }}>
              © 2026 ACQARLABS L.L.C-FZ. All rights reserved.
            </p>
            <p style={{ fontWeight: 500, fontSize: 10, margin: 0, color: 'var(--text-muted)' }}>Not financial advice.</p>
          </div>
        </div>
      </footer>


      
{/* Floating ACQAR Intelligence button */}
      <button
        onClick={() => navigate("/chat")}
        style={{
          position: "fixed",
          bottom: 28,
          right: 24,
          zIndex: 998,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "13px 22px",
          background: "var(--copper)",
          color: "#fff",
          border: "none",
          borderRadius: 30,
          fontWeight: 700,
          fontSize: 14,
          boxShadow: "0 8px 32px rgba(184,115,51,0.45)",
          cursor: "pointer",
          fontFamily: "inherit",
          letterSpacing: 0.2,
        }}
      >
        <span style={{ fontSize: 15 }}>✦</span>
        Ask ACQAR AI
      </button>
    </>
  );
}
