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
//   const current  = location.pathname;
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       setUser(data.session?.user ?? null);
//     });
//     const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
//       setUser(session?.user ?? null);
//     });
//     return () => listener.subscription.unsubscribe();
//   }, []);

//   const navItems = [
//     { label: 'Pricing',   path: '/pricing' },
//     { label: 'Resources', path: '/blogs'   },
//   ];

//   return (
//     <>
//       <header style={{
//         position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
//         background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(14px)',
//         borderBottom: '1px solid #E5E7EB',
//       }}>
//         <div style={{
//           maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem',
//           height: 80, display: 'flex', alignItems: 'center',
//           justifyContent: 'space-between', gap: 16,
//         }}>
//           {/* Logo */}
//           <div
//             style={{ cursor: 'pointer', flexShrink: 0 }}
//             onClick={() => { trackEvent('nav_click', { item: 'logo' }); navigate('/'); }}
//           >
//             <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
//               <span style={{ color: '#B87333' }}>ACQ</span>
//               <span style={{ color: '#111' }}>AR</span>
//             </span>
//           </div>

//           {/* Desktop Nav */}
//           <nav style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
//             {navItems.map(item => (
//               <button
//                 key={item.label}
//                 onClick={() => { trackEvent('Nav', 'Click', item.label); navigate(item.path); }}
//                 style={{
//                   background: 'none', border: 'none', cursor: 'pointer',
//                   fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
//                   color: current === item.path ? '#B87333' : '#2B2B2B',
//                   borderBottom: current === item.path ? '2px solid #B87333' : '2px solid transparent',
//                   paddingBottom: 2, whiteSpace: 'nowrap', transition: 'color 0.15s',
//                 }}
//               >
//                 {item.label}
//               </button>
//             ))}
//           </nav>

//           {/* Right buttons */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
//             {user ? (
//               <button
//                 onClick={() => navigate('/dashboard')}
//                 style={{ background: '#B87333', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
//               >
//                 Dashboard
//               </button>
//             ) : (
//               <button
//                 onClick={() => { trackEvent('nav_click', { item: 'login' }); navigate('/login'); }}
//                 style={{ background: 'none', border: '1.5px solid #D4D4D4', borderRadius: 9, padding: '9px 20px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#2B2B2B', whiteSpace: 'nowrap' }}
//               >
//                 Sign In
//               </button>
//             )}
//             <button
//               onClick={() => { trackEvent('valuation_start', { location: 'header' }); navigate('/valuation'); }}
//               style={{ background: '#B87333', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
//             >
//               Get Started
//             </button>
//           </div>
//         </div>
//       </header>
//       {/* Spacer */}
//       <div style={{ height: 80 }} />
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
//   const fetchBlogs = async () => {
//     const { data, error } = await supabase
//       .from('blogs')
//       .select('*')
//       .eq('status', 'published')
//       .order('date', { ascending: false });
//     if (!error && data) setBlogs(data);
//   };
//   fetchBlogs();
// }, []);

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
//                       src={blog.image_url}
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
  const current  = location.pathname;
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const navItems = [
    { label: 'Pricing',   path: '/pricing' },
    { label: 'Resources', path: '/blogs'   },
  ];

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <div style={{
          maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem',
          height: 80, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16,
        }}>
          {/* Logo */}
          <div
            style={{ cursor: 'pointer', flexShrink: 0 }}
            onClick={() => { trackEvent('nav_click', { item: 'logo' }); navigate('/'); }}
          >
            <span style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              <span style={{ color: '#B87333' }}>ACQ</span>
              <span style={{ color: '#111' }}>AR</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            {navItems.map(item => (
              <button
                key={item.label}
                onClick={() => { trackEvent('Nav', 'Click', item.label); navigate(item.path); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                  color: current === item.path ? '#B87333' : '#2B2B2B',
                  borderBottom: current === item.path ? '2px solid #B87333' : '2px solid transparent',
                  paddingBottom: 2, whiteSpace: 'nowrap', transition: 'color 0.15s',
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                style={{ background: '#B87333', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => { trackEvent('nav_click', { item: 'login' }); navigate('/login'); }}
                style={{ background: 'none', border: '1.5px solid #D4D4D4', borderRadius: 9, padding: '9px 20px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', color: '#2B2B2B', whiteSpace: 'nowrap' }}
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => { trackEvent('valuation_start', { location: 'header' }); navigate('/valuation'); }}
              style={{ background: '#B87333', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>
      {/* Spacer */}
      <div style={{ height: 80 }} />
    </>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────── */
function Footer() {
  const navigate = useNavigate();
  const cols = [
    ['PRODUCT',     ['TruValu™ Products', 'ValuCheck™ (FREE)', 'DealLens™', 'InvestIQ™', 'CertiFi™', 'Compare Tiers']],
    ['COMPANY',     ['About ACQAR', 'How It Works', 'Pricing', 'Contact Us', 'Partners', 'Press Kit']],
    ['RESOURCES',   ['Help Center', 'Market Reports', 'Blog', 'Comparisons']],
    ['COMPARISONS', ['vs Bayut TruEstimate', 'vs Property Finder', 'vs Traditional Valuers', 'Why ACQAR?']],
  ];
  return (
    <footer className="acq-footer">
      <div className="acq-footer-grid">
        <div className="acq-brand-col">
          <span className="acq-brand-name">ACQAR</span>
          <p className="acq-brand-desc">
            The world's first AI-powered property intelligence platform for Dubai real estate.
            Independent, instant, investment-grade.
          </p>
          <div className="acq-rics-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            <span>RICS-Aligned Intelligence</span>
          </div>
          <div className="acq-social-row">
            <a href="https://www.linkedin.com/company/acqar" target="_blank" rel="noopener noreferrer" className="acq-social-btn" aria-label="LinkedIn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5S1.1 1 2.48 1c1.38 0 2.5 1.12 2.5 2.5zM0 8h5v16H0V8zm7.5 0h4.8v2.2h.1c.67-1.2 2.3-2.4 4.73-2.4C22.2 7.8 24 10.2 24 14.1V24h-5v-8.5c0-2-.04-4.6-2.8-4.6-2.8 0-3.2 2.2-3.2 4.4V24h-5V8z"/>
              </svg>
            </a>
          </div>
        </div>
        {cols.map(([title, items]) => (
          <div key={title}>
            <h6 className="acq-col-title">{title}</h6>
            <ul className="acq-link-list">
              {items.map(item => <li key={item} className="acq-link-item">{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="acq-divider"><hr /></div>
      <div className="acq-footer-bottom">
        <div className="acq-copy"><p>© 2025 ACQARLABS L.L.C-FZ. All rights reserved.</p></div>
        <nav className="acq-legal">
          <span onClick={() => navigate('/terms')}>Terms</span>
          <span onClick={() => navigate('/privacy')}>Privacy</span>
          <span onClick={() => navigate('/cookies')}>Cookies</span>
          <span onClick={() => navigate('/security')}>Security</span>
        </nav>
      </div>
    </footer>
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
