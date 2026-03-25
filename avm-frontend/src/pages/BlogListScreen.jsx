// import { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { blogService } from '../services/blogService';
// import { trackEvent } from '../analytics';
// import { supabase } from '../lib/supabase';

// /* ─── Shared Styles ─────────────────────────────────────────────────── */
// const globalStyles = `
//   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
//   @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

//   :root {
//     --primary: #2B2B2B;
//     --accent-copper: #B87333;
//     --gray-light: #D4D4D4;
//     --gray-medium: #3d0909;
//     --bg-off-white: #FAFAFA;
//   }

//   .mat-icon {
//     font-family: 'Material Symbols Outlined';
//     font-weight: normal; font-style: normal;
//     font-size: 1.25rem; line-height: 1;
//     letter-spacing: normal; text-transform: none;
//     display: inline-block; white-space: nowrap;
//     direction: ltr; -webkit-font-smoothing: antialiased;
//     font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
//     user-select: none; vertical-align: middle;
//   }
//   .mat-icon.fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
//   .mat-icon.sm  { font-size: 1rem; }

//   .blog-card { transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: pointer; }
//   .blog-card:hover { transform: translateY(-5px); box-shadow: 0 22px 48px rgba(0,0,0,0.11); }
//   .blog-card-img { transition: transform 0.7s ease; width: 100%; height: 100%; object-fit: cover; }
//   .blog-card:hover .blog-card-img { transform: scale(1.08); }
//   .blog-card-title { transition: color 0.2s ease; color: #2B2B2B; }
//   .blog-card:hover .blog-card-title { color: #B87333; }

//   /* Footer */
//   .acq-footer { background: #F9F9F9; border-top: 1px solid #EBEBEB; padding: 56px 0 0; font-family: 'Inter', sans-serif; }
//   .acq-footer-grid { max-width: 80rem; margin: 0 auto; padding: 0 2rem 48px; display: grid; grid-template-columns: 1.35fr 1fr 1fr 1fr 1fr; gap: 48px; align-items: start; }
//   .acq-brand-name { font-size: 1rem; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; color: #2B2B2B; display: block; margin-bottom: 14px; }
//   .acq-brand-desc { font-size: 0.75rem; color: rgba(43,43,43,0.58); line-height: 1.75; margin: 0 0 18px; max-width: 240px; }
//   .acq-rics-badge { display: inline-flex; align-items: center; gap: 7px; padding: 7px 12px; background: #fff; border: 1px solid #EBEBEB; border-radius: 8px; margin-bottom: 20px; }
//   .acq-rics-badge span { font-size: 0.5625rem; font-weight: 800; color: rgba(43,43,43,0.82); text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }
//   .acq-social-row { display: flex; gap: 10px; }
//   .acq-social-btn { width: 34px; height: 34px; border-radius: 50%; border: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: center; color: rgba(43,43,43,0.38); text-decoration: none; transition: color 0.18s, border-color 0.18s; background: transparent; cursor: pointer; }
//   .acq-social-btn:hover { color: #B87333; border-color: #B87333; }
//   .acq-col-title { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.16em; color: #2B2B2B; margin: 0 0 20px; }
//   .acq-link-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 13px; }
//   .acq-link-item { font-size: 0.8125rem; color: rgba(43,43,43,0.55); font-weight: 400; cursor: pointer; transition: color 0.16s; line-height: 1.4; }
//   .acq-link-item:hover { color: #B87333; }
//   .acq-divider { max-width: 80rem; margin: 0 auto; padding: 0 2rem; }
//   .acq-divider hr { border: none; border-top: 1px solid #E5E7EB; margin: 0; }
//   .acq-footer-bottom { max-width: 80rem; margin: 0 auto; padding: 18px 2rem 28px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
//   .acq-copy p { font-size: 0.5625rem; font-weight: 800; color: rgba(43,43,43,0.38); text-transform: uppercase; letter-spacing: 0.12em; margin: 0; }
//   .acq-legal { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; justify-content: flex-end; }
//   .acq-legal span { font-size: 0.5rem; font-weight: 700; color: rgba(43,43,43,0.35); text-transform: uppercase; letter-spacing: 0.14em; white-space: nowrap; cursor: pointer; transition: color 0.16s ease; }
//   .acq-legal span:hover { color: #B87333; }

//   @media (max-width: 1024px) {
//     .acq-footer-grid { grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
//     .acq-brand-col { grid-column: 1 / -1; }
//     .acq-brand-desc { max-width: 100%; }
//     .blog-grid { grid-template-columns: repeat(2, 1fr) !important; }
//   }
//   @media (max-width: 640px) {
//     .acq-footer-grid { grid-template-columns: 1fr 1fr; gap: 28px; padding: 0 1rem 40px; }
//     .acq-brand-col { grid-column: 1 / -1; }
//     .acq-footer-bottom { flex-direction: column; align-items: center; text-align: center; gap: 14px; padding: 18px 1rem 28px; }
//     .acq-legal { justify-content: center; gap: 18px; }
//     .acq-divider { padding: 0 1rem; }
//     .blog-grid { grid-template-columns: 1fr !important; }
//     .newsletter-row { flex-direction: column !important; }
//     .page-header { padding: 48px 20px 40px !important; }
//   }
//   @media (max-width: 420px) {
//     .acq-footer-grid { grid-template-columns: 1fr; }
//   }
// `;

// /* ─── Icon ───────────────────────────────────────────────────────────── */
// function Icon({ name, fill = false, size = '' }) {
//   return (
//     <span className={`mat-icon${fill ? ' fill' : ''}${size ? ' ' + size : ''}`}>
//       {name}
//     </span>
//   );
// }

// /* ─── Header ─────────────────────────────────────────────────────────── */
// function Header() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const current = location.pathname;

//   const [user, setUser] = useState(null);

// useEffect(() => {
//   // Get current session
//   supabase.auth.getSession().then(({ data }) => {
//     setUser(data.session?.user ?? null);
//   });

//   // Listen for login/logout changes
//   const { data: listener } = supabase.auth.onAuthStateChange(
//     (_event, session) => {
//       setUser(session?.user ?? null);
//     }
//   );

//   return () => {
//     listener.subscription.unsubscribe();
//   };
// }, []);

//   const navItems = [
//     // { label: "Products", path: "/" },
//     { label: "Pricing", path: "/pricing" },
//      { label: "Resources", path: "/blogs" },
//     // { label: "About", path: "/" },
//   ];

//   return (
//     <>
//       <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#D4D4D4] bg-white">
//         <div className="hdrWrap max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
          
//           {/* Logo */}
//           <div
//             className="hdrLogo flex items-center cursor-pointer shrink-0 whitespace-nowrap"
//           onClick={() => {
//   trackEvent("nav_click", { item: "logo" });

//   navigate("/");
// }}

//           >
//             <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
//               <span style={{ color: "#B87333" }}>ACQ</span>
//               <span style={{ color: "#111111" }}>AR</span>
//             </h1>
//           </div>

//             {/* Mobile pricing */}
//            <button
//            onClick={() => {
//   trackEvent("nav_click", { item: "pricing" });

//   navigate("/pricing");
// }}

//             className={`md:hidden text-[10px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-full ${
//               current === "/pricing"
//                 ? "text-[#B87333] underline underline-offset-4"
//                 : "text-[#2B2B2B]/70"
//             }`}
//           >
//             Pricing
//           </button>


//           {/* Desktop nav */}
//           <nav className="hidden md:flex items-center gap-10">
//             {navItems.map((item) => (
//               <button
//                 key={item.label}
//                 onClick={() => {
//   trackEvent("Nav", "Click", item.label);
//   navigate(item.path);
// }}
//                 className={`text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap ${
//                   current === item.path ? "text-[#B87333]" : "text-[#2B2B2B]"
//                 }`}
//               >
//                 {item.label}
//               </button>
//             ))}
//           </nav>

//      {/* Right buttons */}
// <div className="hdrRight flex items-center gap-2 sm:gap-4 shrink-0 flex-nowrap">
//   {user ? (
//   <button
//     onClick={() => navigate("/dashboard")}
//     className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
//   >
//     Dashboard
//   </button>
// ) : (
//   <button
//     onClick={() => {
//       trackEvent("nav_click", { item: "login" });
//       navigate("/login");
//     }}
//     className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
//   >
//     Sign In
//   </button>
// )}


//   {/* ✅ DESKTOP: Get Started ONLY on md+ */}
//   <button
//  onClick={() => {
//   trackEvent("valuation_start", { location: "header" });

//   navigate("/valuation");
// }}

//     className="hidden md:inline-flex hdrCta bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
//   >
//     Get Started
//   </button>
// </div>

//         </div>

//         {/* Mobile spacing tweaks (unchanged) */}
//         <style>{`
//           @media (max-width: 420px){
//             .hdrWrap{
//               padding-left: 10px !important;
//               padding-right: 10px !important;
//               gap: 8px !important;
//             }

//             .hdrLogo h1{
//               font-size: 18px !important;
//               letter-spacing: -0.02em !important;
//             }

//             .hdrPricing{
//               padding: 6px 10px !important;
//               font-size: 9px !important;
//               letter-spacing: 0.16em !important;
//             }

//             .hdrCta{
//               padding: 9px 12px !important;
//               font-size: 10px !important;
//             }
//           }

//           @media (max-width: 360px){
//             .hdrWrap{ gap: 6px !important; }

//             .hdrPricing{
//               padding: 6px 8px !important;
//               letter-spacing: 0.12em !important;
//             }

//             .hdrCta{
//               padding: 8px 10px !important;
//               font-size: 10px !important;
//             }
//           }
//         `}</style>
//       </header>

//       <div className="h-20" />
//     </>
//   );
// }


// /* ─── Footer ─────────────────────────────────────────────────────────── */
// function Footer() {
//   const navigate = useNavigate();
//   const cols = [
//     ['PRODUCT',     ['TruValu™ Products', 'ValuCheck™ (FREE)', 'DealLens™', 'InvestIQ™', 'CertiFi™', 'Compare Tiers']],
//     ['COMPANY',     ['About ACQAR', 'How It Works', 'Pricing', 'Contact Us', 'Partners', 'Press Kit']],
//     ['RESOURCES',   ['Help Center', 'Market Reports', 'Blog', 'Comparisons']],
//     ['COMPARISONS', ['vs Bayut TruEstimate', 'vs Property Finder', 'vs Traditional Valuers', 'Why ACQAR?']],
//   ];
//   return (
//     <footer className="acq-footer">
//       <div className="acq-footer-grid">
//         <div className="acq-brand-col">
//           <span className="acq-brand-name">ACQAR</span>
//           <p className="acq-brand-desc">
//             The world's first AI-powered property intelligence platform for Dubai real estate.
//             Independent, instant, investment-grade.
//           </p>
//           <div className="acq-rics-badge">
//             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
//               <polyline points="9 12 11 14 15 10"/>
//             </svg>
//             <span>RICS-Aligned Intelligence</span>
//           </div>
//           <div className="acq-social-row">
//             <a href="https://www.linkedin.com/company/acqar" target="_blank" rel="noopener noreferrer" className="acq-social-btn" aria-label="LinkedIn">
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
//                 <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5S1.1 1 2.48 1c1.38 0 2.5 1.12 2.5 2.5zM0 8h5v16H0V8zm7.5 0h4.8v2.2h.1c.67-1.2 2.3-2.4 4.73-2.4C22.2 7.8 24 10.2 24 14.1V24h-5v-8.5c0-2-.04-4.6-2.8-4.6-2.8 0-3.2 2.2-3.2 4.4V24h-5V8z"/>
//               </svg>
//             </a>
//           </div>
//         </div>
//         {cols.map(([title, items]) => (
//           <div key={title}>
//             <h6 className="acq-col-title">{title}</h6>
//             <ul className="acq-link-list">
//               {items.map(item => <li key={item} className="acq-link-item">{item}</li>)}
//             </ul>
//           </div>
//         ))}
//       </div>
//       <div className="acq-divider"><hr /></div>
//       <div className="acq-footer-bottom">
//         <div className="acq-copy"><p>© 2025 ACQARLABS L.L.C-FZ. All rights reserved.</p></div>
//         <nav className="acq-legal">
//           <span onClick={() => navigate('/terms')}>Terms</span>
//           <span onClick={() => navigate('/privacy')}>Privacy</span>
//           <span onClick={() => navigate('/cookies')}>Cookies</span>
//           <span onClick={() => navigate('/security')}>Security</span>
//         </nav>
//       </div>
//     </footer>
//   );
// }

// /* ─── Main Screen ────────────────────────────────────────────────────── */
// const BlogListScreen = () => {
//   const navigate = useNavigate();
//   const [blogs, setBlogs] = useState([]);
//   const [email, setEmail] = useState('');

//   useEffect(() => {
//     const allBlogs = blogService.getBlogs();
//     setBlogs(allBlogs.filter(b => b.status === 'published'));
//   }, []);

//   const handleBlogClick = (id) => {
//     localStorage.setItem('selected_blog_id', id);
//     navigate('/blogs/detail');
//   };

//   return (
//     <>
//       <style>{globalStyles}</style>

//       <Header />

//       <main style={{ background: '#FAFAFA', minHeight: '100vh' }}>

//         {/* ── Page Header ── */}
//         <div className="page-header" style={{ padding: '72px 24px 56px', textAlign: 'center' }}>
//           <p style={{ fontSize: '0.6875rem', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B87333', marginBottom: 16 }}>
//             Resources &amp; Insights
//           </p>
//           <h1 style={{
//             fontSize: 'clamp(2rem, 5vw, 3.75rem)', fontWeight: 900,
//             letterSpacing: '-0.03em', color: '#2B2B2B', marginBottom: 18, lineHeight: 1.06,
//           }}>
//             The Acqar{' '}
//             <span style={{
//               background: 'linear-gradient(to right, #B87333, #8B5E2A)',
//               WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
//             }}>
//               Intelligence
//             </span>
//             {' '}Blog
//           </h1>
//           <p style={{ color: '#B3B3B3', fontSize: '1.0625rem', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
//             Deep dives into the Dubai real estate market, AI-powered valuations, and the future of PropTech.
//           </p>
//         </div>

//         {/* ── Blog Grid ── */}
//         <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 24px 72px' }}>
//           {blogs.length === 0 ? (
//             <p style={{ textAlign: 'center', color: '#B3B3B3', padding: '60px 0' }}>No posts published yet.</p>
//           ) : (
//             <div
//               className="blog-grid"
//               style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}
//             >
//               {blogs.map((blog) => (
//                 <div
//                   key={blog.id}
//                   className="blog-card"
//                   onClick={() => handleBlogClick(blog.id)}
//                   style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}
//                 >
//                   {/* Image */}
//                   <div style={{ height: 220, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
//                     <img
//                       src={blog.imageUrl}
//                       alt={blog.title}
//                       className="blog-card-img"
//                       referrerPolicy="no-referrer"
//                     />
//                     <div style={{
//                       position: 'absolute', top: 14, left: 14,
//                       background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
//                       borderRadius: 999, padding: '4px 14px',
//                       fontSize: '0.6875rem', fontWeight: 800, color: '#B87333', letterSpacing: '0.04em',
//                     }}>
//                       {blog.date}
//                     </div>
//                   </div>

//                   {/* Content */}
//                   <div style={{ padding: '22px 22px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
//                     <h3 className="blog-card-title" style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: 10, lineHeight: 1.35 }}>
//                       {blog.title}
//                     </h3>
//                     <p style={{
//                       fontSize: '0.875rem', color: '#B3B3B3', lineHeight: 1.65, flex: 1, marginBottom: 16,
//                       display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
//                     }}>
//                       {blog.excerpt}
//                     </p>
//                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(212,212,212,0.3)' }}>
//                       <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(43,43,43,0.35)' }}>
//                         By {blog.author}
//                       </span>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#B87333', fontWeight: 700, fontSize: '0.875rem' }}>
//                         Read More <Icon name="arrow_forward" size="sm" />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* ── Newsletter ── */}
//         <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 24px 80px' }}>
//           <div style={{ background: '#2B2B2B', borderRadius: 32, padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
//             <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
//             <div style={{ position: 'relative', zIndex: 1, maxWidth: 540, margin: '0 auto' }}>
//               <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.15 }}>
//                 Stay ahead of the market.
//               </h2>
//               <p style={{ color: '#B3B3B3', marginBottom: 32, fontSize: '0.9375rem', lineHeight: 1.65 }}>
//                 Join 5,000+ investors receiving our weekly market intelligence reports.
//               </p>
//               <div className="newsletter-row" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
//                 <input
//                   type="email"
//                   placeholder="Enter your email"
//                   value={email}
//                   onChange={e => setEmail(e.target.value)}
//                   style={{
//                     flex: '1 1 240px', minWidth: 200, maxWidth: 380,
//                     background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
//                     borderRadius: 14, padding: '14px 20px', color: '#fff',
//                     fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif', outline: 'none',
//                   }}
//                 />
//                 <button
//                   onClick={() => { if (email) { alert('Subscribed!'); setEmail(''); } }}
//                   style={{ background: '#B87333', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 28px', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
//                 >
//                   Subscribe Now
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//       </main>

//       <Footer />
//     </>
//   );
// };

// export default BlogListScreen;


import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { blogService } from '../services/blogService';
import { trackEvent } from '../analytics';
import { supabase } from '../lib/supabase';

/* ─── Shared Styles ─────────────────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

  :root {
    --primary: #2B2B2B;
    --accent-copper: #B87333;
    --gray-light: #D4D4D4;
    --gray-medium: #3d0909;
    --bg-off-white: #FAFAFA;
  }

  .mat-icon {
    font-family: 'Material Symbols Outlined';
    font-weight: normal; font-style: normal;
    font-size: 1.25rem; line-height: 1;
    letter-spacing: normal; text-transform: none;
    display: inline-block; white-space: nowrap;
    direction: ltr; -webkit-font-smoothing: antialiased;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    user-select: none; vertical-align: middle;
  }
  .mat-icon.fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .mat-icon.sm  { font-size: 1rem; }

  .blog-card { transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: pointer; }
  .blog-card:hover { transform: translateY(-5px); box-shadow: 0 22px 48px rgba(0,0,0,0.11); }
  .blog-card-img { transition: transform 0.7s ease; width: 100%; height: 100%; object-fit: cover; }
  .blog-card:hover .blog-card-img { transform: scale(1.08); }
  .blog-card-title { transition: color 0.2s ease; color: #2B2B2B; }
  .blog-card:hover .blog-card-title { color: #B87333; }

  /* Footer */
  .acq-footer { background: #F9F9F9; border-top: 1px solid #EBEBEB; padding: 56px 0 0; font-family: 'Inter', sans-serif; }
  .acq-footer-grid { max-width: 80rem; margin: 0 auto; padding: 0 2rem 48px; display: grid; grid-template-columns: 1.35fr 1fr 1fr 1fr 1fr; gap: 48px; align-items: start; }
  .acq-brand-name { font-size: 1rem; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; color: #2B2B2B; display: block; margin-bottom: 14px; }
  .acq-brand-desc { font-size: 0.75rem; color: rgba(43,43,43,0.58); line-height: 1.75; margin: 0 0 18px; max-width: 240px; }
  .acq-rics-badge { display: inline-flex; align-items: center; gap: 7px; padding: 7px 12px; background: #fff; border: 1px solid #EBEBEB; border-radius: 8px; margin-bottom: 20px; }
  .acq-rics-badge span { font-size: 0.5625rem; font-weight: 800; color: rgba(43,43,43,0.82); text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }
  .acq-social-row { display: flex; gap: 10px; }
  .acq-social-btn { width: 34px; height: 34px; border-radius: 50%; border: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: center; color: rgba(43,43,43,0.38); text-decoration: none; transition: color 0.18s, border-color 0.18s; background: transparent; cursor: pointer; }
  .acq-social-btn:hover { color: #B87333; border-color: #B87333; }
  .acq-col-title { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.16em; color: #2B2B2B; margin: 0 0 20px; }
  .acq-link-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 13px; }
  .acq-link-item { font-size: 0.8125rem; color: rgba(43,43,43,0.55); font-weight: 400; cursor: pointer; transition: color 0.16s; line-height: 1.4; }
  .acq-link-item:hover { color: #B87333; }
  .acq-divider { max-width: 80rem; margin: 0 auto; padding: 0 2rem; }
  .acq-divider hr { border: none; border-top: 1px solid #E5E7EB; margin: 0; }
  .acq-footer-bottom { max-width: 80rem; margin: 0 auto; padding: 18px 2rem 28px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .acq-copy p { font-size: 0.5625rem; font-weight: 800; color: rgba(43,43,43,0.38); text-transform: uppercase; letter-spacing: 0.12em; margin: 0; }
  .acq-legal { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; justify-content: flex-end; }
  .acq-legal span { font-size: 0.5rem; font-weight: 700; color: rgba(43,43,43,0.35); text-transform: uppercase; letter-spacing: 0.14em; white-space: nowrap; cursor: pointer; transition: color 0.16s ease; }
  .acq-legal span:hover { color: #B87333; }

  @media (max-width: 1024px) {
    .acq-footer-grid { grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
    .acq-brand-col { grid-column: 1 / -1; }
    .acq-brand-desc { max-width: 100%; }
    .blog-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 640px) {
    .acq-footer-grid { grid-template-columns: 1fr 1fr; gap: 28px; padding: 0 1rem 40px; }
    .acq-brand-col { grid-column: 1 / -1; }
    .acq-footer-bottom { flex-direction: column; align-items: center; text-align: center; gap: 14px; padding: 18px 1rem 28px; }
    .acq-legal { justify-content: center; gap: 18px; }
    .acq-divider { padding: 0 1rem; }
    .blog-grid { grid-template-columns: 1fr !important; }
    .newsletter-row { flex-direction: column !important; }
    .page-header { padding: 48px 20px 40px !important; }
  }
  @media (max-width: 420px) {
    .acq-footer-grid { grid-template-columns: 1fr; }
  }
`;

/* ─── Icon ───────────────────────────────────────────────────────────── */
function Icon({ name, fill = false, size = '' }) {
  return (
    <span className={`mat-icon${fill ? ' fill' : ''}${size ? ' ' + size : ''}`}>
      {name}
    </span>
  );
}

/* ─── Header ─────────────────────────────────────────────────────────── */
function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const current = location.pathname;

  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const navItems = [
    // { label: "Pricing", path: "/pricing" },
    { label: "Resources", path: "/blogs" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#D4D4D4] bg-white">
        <div className="hdrWrap max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">

          {/* Logo */}
          <div
            className="hdrLogo flex items-center cursor-pointer shrink-0 whitespace-nowrap"
            onClick={() => {
              trackEvent("nav_click", { item: "logo" });
              navigate("/");
            }}
          >
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
              <span style={{ color: "#B87333" }}>ACQ</span>
              <span style={{ color: "#111111" }}>AR</span>
            </h1>
          </div>

          {/* ── MOBILE: Pricing + Resources + Signal ── */}
          <div className="md:hidden flex items-center gap-1">
            {/* <button
              onClick={() => {
                trackEvent("nav_click", { item: "pricing" });
                navigate("/pricing");
              }}
              className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1.5 rounded-full whitespace-nowrap ${
                current === "/pricing"
                  ? "text-[#B87333] underline underline-offset-4"
                  : "text-[#2B2B2B]/70"
              }`}
            >
              Pricing
            </button> */}

            <button
              onClick={() => {
                trackEvent("nav_click", { item: "resources" });
                navigate("/blogs");
              }}
              className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1.5 rounded-full whitespace-nowrap ${
                current === "/blogs"
                  ? "text-[#B87333] underline underline-offset-4"
                  : "text-[#2B2B2B]/70"
              }`}
            >
              Resources
            </button>

            {/* Mobile Signal */}
            <a
              href="https://signal.acqar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1.5 rounded-full whitespace-nowrap text-[#2B2B2B]/70"
              style={{ textDecoration: 'none' }}
            >
              Signal
            </a>
          </div>

          {/* ── DESKTOP nav ── */}
          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  trackEvent("Nav", "Click", item.label);
                  navigate(item.path);
                }}
                className={`text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap ${
                  current === item.path ? "text-[#B87333]" : "text-[#2B2B2B]"
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Desktop Signal */}
            <a
              href="https://signal.acqar.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("Nav", "Click", "Signal")}
              className="text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap text-[#2B2B2B]"
              style={{ textDecoration: 'none' }}
            >
              Signal
            </a>
          </nav>

          {/* ── Right buttons ── */}
          <div className="hdrRight flex items-center gap-2 sm:gap-4 shrink-0 flex-nowrap">
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  trackEvent("nav_click", { item: "login" });
                  navigate("/login");
                }}
                className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
              >
                Sign In
              </button>
            )}

            {/* Desktop only: Get Started */}
            <button
              onClick={() => {
                trackEvent("valuation_start", { location: "header" });
                navigate("/valuation");
              }}
              className="hidden md:inline-flex hdrCta bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
            >
              Get Started
            </button>
          </div>

        </div>

        <style>{`
          @media (max-width: 420px) {
            .hdrWrap {
              padding-left: 10px !important;
              padding-right: 10px !important;
              gap: 4px !important;
            }
            .hdrLogo h1 {
              font-size: 17px !important;
              letter-spacing: -0.02em !important;
            }
            .hdrCta {
              padding: 9px 12px !important;
              font-size: 10px !important;
            }
          }

          @media (max-width: 360px) {
            .hdrWrap { gap: 3px !important; }
            .hdrCta {
              padding: 8px 10px !important;
              font-size: 10px !important;
            }
          }
        `}</style>
      </header>

      <div className="h-20" />
    </>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────── */
/* ── FOOTER ── */
function Footer() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .acq-footer-new {
          position: relative;
          background: #F5F5F4;
          border-top: 1px solid rgba(10,10,10,0.06);
          font-family: 'Inter', sans-serif;
        }
        .acq-footer-new .copper-line {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #B87333 35%, #B87333 65%, transparent 100%);
        }
        .acq-footer-new .inner {
          max-width: 100%;
          margin: 0 auto;
          padding: 48px 80px 32px;
        }
        .acq-footer-new .main-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1fr 1fr;
          gap: 32px;
          margin-bottom: 48px;
        }
        .acq-footer-new .col-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
        }
        .acq-footer-new .col-heading-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #B87333;
          opacity: 0.7;
        }
        .acq-footer-new .col-heading h6 {
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.28em;
          color: #0A0A0A;
          margin: 0;
        }
        .acq-footer-new ul {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .acq-footer-new ul li {
          font-size: 11.5px;
          font-weight: 600;
          color: rgba(10,10,10,0.55);
          cursor: pointer;
          transition: color 0.2s;
        }
        .acq-footer-new ul li:hover { color: #B87333; }
        .acq-footer-new ul li.muted {
          color: rgba(10,10,10,0.55);
          cursor: default;
        }
        .acq-footer-new ul li a {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s;
        }
        .acq-footer-new ul li a:hover { color: #B87333; }
        .acq-footer-new .soon-badge {
          padding: 1px 6px;
          font-size: 8px;
          font-weight: 900;
          text-transform: uppercase;
          background: rgba(184,115,51,0.1);
          color: #B87333;
          border: 1px solid rgba(184,115,51,0.2);
          border-radius: 4px;
          margin-left: 6px;
        }
        .acq-footer-new .rics-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: white;
          border: 1px solid rgba(184,115,51,0.2);
          border-radius: 999px;
          margin-bottom: 32px;
        }
        .acq-footer-new .rics-badge span {
          font-size: 9px;
          font-weight: 900;
          color: rgba(10,10,10,0.7);
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }
        .acq-footer-new .social-row { display: flex; gap: 12px; }
        .acq-footer-new .social-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(10,10,10,0.09);
          background: rgba(255,255,255,0.6);
          display: flex; align-items: center; justify-content: center;
          color: rgba(10,10,10,0.35);
          text-decoration: none;
          transition: all 0.2s;
        }
        .acq-footer-new .social-btn:hover {
          color: #B87333;
          border-color: rgba(184,115,51,0.4);
        }
        .acq-footer-new .bottom-bar {
          border-top: 1px solid rgba(10,10,10,0.06);
          padding-top: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          width: 100%;
        }
        .acq-footer-new .bottom-bar p {
          font-weight: 700;
          color: rgba(10,10,10,0.3);
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.2em;
          margin: 0;
        }
        .acq-footer-new .bottom-bar .not-advice {
          font-weight: 500;
          color: rgba(10,10,10,0.25);
          font-size: 10px;
          margin: 0;
        }
        .acq-footer-new .bottom-location {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .acq-footer-new .bottom-location .logo {
          font-weight: 900;
          font-size: 10px;
          letter-spacing: 0.05em;
        }
        .acq-footer-new .bottom-location .divider {
          width: 1px; height: 12px;
          background: rgba(10,10,10,0.15);
        }
        .acq-footer-new .bottom-location .city {
          font-weight: 600;
          color: rgba(10,10,10,0.35);
          font-size: 10px;
          letter-spacing: 0.05em;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .acq-footer-new .inner { padding: 48px 32px 32px; }
          .acq-footer-new .main-grid { grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
        }
        @media (max-width: 768px) {
          .acq-footer-new .inner { padding: 40px 24px 24px; }
          .acq-footer-new .main-grid { grid-template-columns: 1fr 1fr; gap: 32px 16px; }
          .acq-footer-new .bottom-bar { flex-direction: column; text-align: center; justify-content: center; }
          .acq-footer-new .bottom-location { justify-content: center; }
          .acq-footer-new .not-advice { display: none; }
        }
        @media (max-width: 480px) {
          .acq-footer-new .inner { padding: 40px 16px 20px; }
          .acq-footer-new .main-grid { grid-template-columns: 1fr; gap: 28px; }
        }
      `}</style>

      <footer className="acq-footer-new">
        <div className="copper-line"></div>
        <div className="inner">

          {/* Main grid */}
          <div className="main-grid">

            {/* Brand column */}
            <div>
              <div style={{ marginBottom: 24, lineHeight: 1 }}>
                <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px' }}>
                  <span style={{ color: '#B87333' }}>ACQ</span>
                  <span style={{ color: '#111111' }}>AR</span>
                </span>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.75, color: 'rgba(10,10,10,0.5)', fontWeight: 500, marginBottom: 28, maxWidth: 280 }}>
                The world's first AI-powered property intelligence platform for Dubai real estate. Independent, instant, investment-grade.
              </p>
              <div className="rics-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>RICS-Aligned Intelligence</span>
              </div>
              <div className="social-row">
                {[
                  { href: 'https://www.linkedin.com/company/acqar', label: 'LinkedIn', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
                  { href: 'https://www.instagram.com/acqar.dxb/', label: 'Instagram', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
                ].map(({ href, label, icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    aria-label={label} className="social-btn"
                  >{icon}</a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <div className="col-heading">
                <span className="col-heading-dot"></span>
                <h6>Product</h6>
              </div>
              <ul>
                <li>
                  <a href="http://www.acqar.com/" target="_blank" rel="noopener noreferrer">
                    TruValu™
                  </a>
                </li>
                <li>
                  <a href="https://signal.acqar.com/" target="_blank" rel="noopener noreferrer">
                    ACQAR Signal™
                  </a>
                </li>
                <li className="muted">ACQAR Passport™</li>
                {/* <li onClick={() => navigate('/pricing')}>Pricing Tiers</li> */}
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="col-heading">
                <span className="col-heading-dot"></span>
                <h6>Company</h6>
              </div>
              <ul>
                {/* {['About ACQAR', 'How It Works', 'Pricing', 'Contact Us', 'Partners'].map(l => ( */}
                  {['About ACQAR', 'How It Works', 'Contact Us', 'Partners'].map(l => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="col-heading">
                <span className="col-heading-dot"></span>
                <h6>Legal & Info</h6>
              </div>
              <ul>
                <li onClick={() => window.open('https://www.acqar.com/blogs', '_blank')}>Intelligence Blog</li>
                <li onClick={() => navigate('/terms')}>Terms of Use</li>
                <li onClick={() => navigate('/terms')}>Privacy Policy</li>
              </ul>
            </div>

            {/* Comparisons */}
            <div>
              <div className="col-heading">
                <span className="col-heading-dot"></span>
                <h6>Comparisons</h6>
              </div>
              <ul>
                {['vs Bayut TruEstimate', 'vs Property Finder', 'vs Traditional Valuers', 'Why ACQAR?'].map(l => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="bottom-bar">
            <div className="bottom-location">
              <span className="logo">
                <span style={{ color: '#B87333' }}>ACQ</span>
                <span style={{ color: '#0A0A0A' }}>AR</span>
              </span>
              <span className="divider"></span>
              <span className="city">Dubai, United Arab Emirates</span>
            </div>
            <p>© 2026 ACQARLABS L.L.C-FZ. All rights reserved.</p>
            <p className="not-advice">Not financial advice.</p>
          </div>

        </div>
      </footer>
    </>
  );
}
/* ─── Main Screen ────────────────────────────────────────────────────── */
const BlogListScreen = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
  const fetchBlogs = async () => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('status', 'published')
      .order('date', { ascending: false });
    if (!error && data) setBlogs(data);
  };
  fetchBlogs();
}, []);

  const handleBlogClick = (id) => {
    localStorage.setItem('selected_blog_id', id);
    navigate('/blogs/detail');
  };

  return (
    <>
      <style>{globalStyles}</style>

      <Header />

      <main style={{ background: '#FAFAFA', minHeight: '100vh' }}>

        {/* ── Page Header ── */}
        <div className="page-header" style={{ padding: '72px 24px 56px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B87333', marginBottom: 16 }}>
            Resources &amp; Insights
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.75rem)', fontWeight: 900,
            letterSpacing: '-0.03em', color: '#2B2B2B', marginBottom: 18, lineHeight: 1.06,
          }}>
            The Acqar{' '}
            <span style={{
              background: 'linear-gradient(to right, #B87333, #8B5E2A)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Intelligence
            </span>
            {' '}Blog
          </h1>
          <p style={{ color: '#B3B3B3', fontSize: '1.0625rem', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Deep dives into the Dubai real estate market, AI-powered valuations, and the future of PropTech.
          </p>
        </div>

        {/* ── Blog Grid ── */}
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 24px 72px' }}>
          {blogs.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#B3B3B3', padding: '60px 0' }}>No posts published yet.</p>
          ) : (
            <div
              className="blog-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}
            >
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className="blog-card"
                  onClick={() => handleBlogClick(blog.id)}
                  style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}
                >
                  {/* Image */}
                  <div style={{ height: 220, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className="blog-card-img"
                      referrerPolicy="no-referrer"
                    />
                    <div style={{
                      position: 'absolute', top: 14, left: 14,
                      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
                      borderRadius: 999, padding: '4px 14px',
                      fontSize: '0.6875rem', fontWeight: 800, color: '#B87333', letterSpacing: '0.04em',
                    }}>
                      {blog.date}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '22px 22px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 className="blog-card-title" style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: 10, lineHeight: 1.35 }}>
                      {blog.title}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem', color: '#B3B3B3', lineHeight: 1.65, flex: 1, marginBottom: 16,
                      display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {blog.excerpt}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(212,212,212,0.3)' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(43,43,43,0.35)' }}>
                        By {blog.author}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#B87333', fontWeight: 700, fontSize: '0.875rem' }}>
                        Read More <Icon name="arrow_forward" size="sm" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
{/* ── Newsletter ── */}
<div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 24px 80px' }}>
  <div style={{ background: '#2B2B2B', borderRadius: 32, padding: '64px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.15 }}>
        See every deal. Track every signal. Own the market.
      </h2>
      <p style={{ color: '#B3B3B3', marginBottom: 32, fontSize: '0.9375rem', lineHeight: 1.65 }}>
        Join 10,000+ property owners who discovered their property's complete investment potential with ACQAR's TruValu™ analysis.
      </p>
      <button
        className="btn-copper"
        style={{ fontSize: '18px', padding: '15px 30px', borderRadius: '14px', minHeight: '56px', fontWeight: 700, background: '#B87333', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'inline-flex', alignItems: 'center', gap: 8 }}
        onClick={() => { trackEvent('CTA', 'Click', 'CTASection - Get My Free Valuation Now'); navigate('/valuation'); }}
      >
        Get My Free Valuation Now <Icon name="arrow_forward" />
      </button>
    </div>
  </div>
</div>

      </main>

      <Footer />
    </>
  );
};

export default BlogListScreen;
