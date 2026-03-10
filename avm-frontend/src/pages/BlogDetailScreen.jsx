// import { useEffect, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { trackEvent } from '../analytics';
// import { supabase } from '../lib/supabase';

// /* ─── Styles ────────────────────────────────────────────────────────── */
// const globalStyles = `
//   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
//   @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

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
//   .mat-icon.sm { font-size: 1rem; }
//   .mat-icon.lg { font-size: 1.5rem; }

//   .blog-content h1, .blog-content h2, .blog-content h3 {
//     font-weight: 800; color: #2B2B2B; margin: 2rem 0 1rem; line-height: 1.2;
//   }
//   .blog-content h2 { font-size: 1.5rem; }
//   .blog-content h3 { font-size: 1.2rem; }
//   .blog-content p  { margin-bottom: 1.25rem; line-height: 1.8; color: rgba(43,43,43,0.78); }
//   .blog-content ul, .blog-content ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
//   .blog-content li { margin-bottom: 0.5rem; line-height: 1.7; color: rgba(43,43,43,0.78); }
//   .blog-content strong { font-weight: 700; color: #2B2B2B; }
//   .blog-content a { color: #B87333; text-decoration: underline; }
//   .blog-content blockquote {
//     border-left: 3px solid #B87333; margin: 1.5rem 0;
//     padding: 0.75rem 1.25rem; background: #FAFAFA; border-radius: 0 8px 8px 0;
//     font-style: italic; color: rgba(43,43,43,0.65);
//   }

//   .related-card-img { transition: transform 0.6s ease; width: 100%; height: 100%; object-fit: cover; }
//   .related-card:hover .related-card-img { transform: scale(1.07); }
//   .related-card-title { transition: color 0.2s ease; color: #2B2B2B; }
//   .related-card:hover .related-card-title { color: #B87333; }

//   .share-btn { transition: background 0.18s, color 0.18s, border-color 0.18s; }
//   .share-btn:hover { background: #B87333!important; color: #fff!important; border-color: #B87333!important; }

//   /* Skeleton shimmer */
//   @keyframes shimmer {
//     0%   { background-position: -800px 0; }
//     100% { background-position:  800px 0; }
//   }
//   .skeleton {
//     background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
//     background-size: 800px 100%;
//     animation: shimmer 1.4s infinite linear;
//     border-radius: 8px;
//   }

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

//   @media (max-width: 768px) {
//     .detail-hero-title { font-size: 2rem !important; }
//     .detail-share-row { flex-direction: column !important; align-items: flex-start !important; }
//   }
//   @media (max-width: 1024px) {
//     .acq-footer-grid { grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
//     .acq-brand-col { grid-column: 1 / -1; }
//   }
//   @media (max-width: 640px) {
//     .acq-footer-grid { grid-template-columns: 1fr 1fr; gap: 28px; padding: 0 1rem 40px; }
//     .acq-brand-col { grid-column: 1 / -1; }
//     .acq-footer-bottom { flex-direction: column; align-items: center; text-align: center; gap: 14px; padding: 18px 1rem 28px; }
//     .acq-legal { justify-content: center; gap: 18px; }
//     .acq-divider { padding: 0 1rem; }
//     .related-grid { grid-template-columns: 1fr !important; }
//   }
//   @media (max-width: 420px) {
//     .acq-footer-grid { grid-template-columns: 1fr; }
//   }
// `;

// function Icon({ name, size = '' }) {
//   return <span className={`mat-icon${size ? ' ' + size : ''}`}>{name}</span>;
// }

// /* ─── Skeleton loader ────────────────────────────────────────────────── */
// function SkeletonLoader() {
//   return (
//     <main style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
//       <div style={{ maxWidth: '52rem', margin: '0 auto', padding: '48px 24px 80px' }}>
//         <div className="skeleton" style={{ height: 14, width: 140, marginBottom: 40 }} />
//         <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
//           <div className="skeleton" style={{ height: 26, width: 100, borderRadius: 999 }} />
//           <div className="skeleton" style={{ height: 26, width: 80,  borderRadius: 999 }} />
//         </div>
//         <div className="skeleton" style={{ height: 52, width: '90%', marginBottom: 14 }} />
//         <div className="skeleton" style={{ height: 52, width: '65%', marginBottom: 36 }} />
//         <div style={{ display: 'flex', gap: 14, padding: '18px 20px', background: '#FAFAFA', borderRadius: 16, border: '1px solid rgba(212,212,212,0.3)', marginBottom: 36 }}>
//           <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
//           <div style={{ flex: 1 }}>
//             <div className="skeleton" style={{ height: 13, width: 160, marginBottom: 8 }} />
//             <div className="skeleton" style={{ height: 12, width: 200 }} />
//           </div>
//         </div>
//         <div className="skeleton" style={{ width: '100%', height: 380, borderRadius: 24, marginBottom: 44 }} />
//         {[100, 95, 88, 100, 72, 92, 85, 60].map((w, i) => (
//           <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, marginBottom: 16 }} />
//         ))}
//       </div>
//     </main>
//   );
// }

// /* ─── Header ─────────────────────────────────────────────────────────── */
// function Header() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const current  = location.pathname;
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
//     const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
//     return () => listener.subscription.unsubscribe();
//   }, []);

//   const navItems = [
//     { label: 'Pricing',   path: '/pricing' },
//     { label: 'Resources', path: '/blogs'   },
//   ];

//   return (
//     <>
//       <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#D4D4D4] bg-white">
//         <div className="hdrWrap max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
//           <div className="hdrLogo flex items-center cursor-pointer shrink-0 whitespace-nowrap" onClick={() => { trackEvent('nav_click', { item: 'logo' }); navigate('/'); }}>
//             <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
//               <span style={{ color: '#B87333' }}>ACQ</span><span style={{ color: '#111111' }}>AR</span>
//             </h1>
//           </div>
//           <button onClick={() => { trackEvent('nav_click', { item: 'pricing' }); navigate('/pricing'); }}
//             className={`md:hidden text-[10px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-full ${current === '/pricing' ? 'text-[#B87333] underline underline-offset-4' : 'text-[#2B2B2B]/70'}`}>
//             Pricing
//           </button>
//           <nav className="hidden md:flex items-center gap-10">
//             {navItems.map(item => (
//               <button key={item.label} onClick={() => { trackEvent('Nav', 'Click', item.label); navigate(item.path); }}
//                 className={`text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap ${current === item.path ? 'text-[#B87333]' : 'text-[#2B2B2B]'}`}>
//                 {item.label}
//               </button>
//             ))}
//           </nav>
//           <div className="hdrRight flex items-center gap-2 sm:gap-4 shrink-0 flex-nowrap">
//             {user
//               ? <button onClick={() => navigate('/dashboard')} className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] whitespace-nowrap">Dashboard</button>
//               : <button onClick={() => { trackEvent('nav_click', { item: 'login' }); navigate('/login'); }} className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] whitespace-nowrap">Sign In</button>
//             }
//             <button onClick={() => { trackEvent('valuation_start', { location: 'header' }); navigate('/valuation'); }} className="hidden md:inline-flex hdrCta bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] whitespace-nowrap">Get Started</button>
//           </div>
//         </div>
//         <style>{`
//           @media (max-width:420px){ .hdrWrap{ padding-left:10px!important; padding-right:10px!important; gap:8px!important; } .hdrLogo h1{ font-size:18px!important; } .hdrCta{ padding:9px 12px!important; font-size:10px!important; } }
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
//     ['PRODUCT',     ['TruValu™ Products','ValuCheck™ (FREE)','DealLens™','InvestIQ™','CertiFi™','Compare Tiers']],
//     ['COMPANY',     ['About ACQAR','How It Works','Pricing','Contact Us','Partners','Press Kit']],
//     ['RESOURCES',   ['Help Center','Market Reports','Blog','Comparisons']],
//     ['COMPARISONS', ['vs Bayut TruEstimate','vs Property Finder','vs Traditional Valuers','Why ACQAR?']],
//   ];
//   return (
//     <footer className="acq-footer">
//       <div className="acq-footer-grid">
//         <div className="acq-brand-col">
//           <span className="acq-brand-name">ACQAR</span>
//           <p className="acq-brand-desc">The world's first AI-powered property intelligence platform for Dubai real estate. Independent, instant, investment-grade.</p>
//           <div className="acq-rics-badge">
//             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
//             <span>RICS-Aligned Intelligence</span>
//           </div>
//           <div className="acq-social-row">
//             <a href="https://www.linkedin.com/company/acqar" target="_blank" rel="noopener noreferrer" className="acq-social-btn">
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5S1.1 1 2.48 1c1.38 0 2.5 1.12 2.5 2.5zM0 8h5v16H0V8zm7.5 0h4.8v2.2h.1c.67-1.2 2.3-2.4 4.73-2.4C22.2 7.8 24 10.2 24 14.1V24h-5v-8.5c0-2-.04-4.6-2.8-4.6-2.8 0-3.2 2.2-3.2 4.4V24h-5V8z"/></svg>
//             </a>
//           </div>
//         </div>
//         {cols.map(([title, items]) => (
//           <div key={title}>
//             <h6 className="acq-col-title">{title}</h6>
//             <ul className="acq-link-list">{items.map(item => <li key={item} className="acq-link-item">{item}</li>)}</ul>
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

// /* ─── BlogDetailScreen ───────────────────────────────────────────────── */
// const BlogDetailScreen = () => {
//   const navigate = useNavigate();
//   const [blog,         setBlog]         = useState(null);
//   const [relatedBlogs, setRelatedBlogs] = useState([]);
//   const [loading,      setLoading]      = useState(true);

//   useEffect(() => {
//     // ✅ FIX 1: always scroll to top immediately on page load
//     window.scrollTo({ top: 0, behavior: 'instant' });

//     const id = localStorage.getItem('selected_blog_id');

//     // ✅ FIX 2: if no id, redirect back rather than showing loading forever
//     if (!id) {
//       navigate('/blogs');
//       return;
//     }

//     loadBlog(id);
//   }, []);

//   const loadBlog = async (id) => {
//     setLoading(true);
//     setBlog(null);

//     const { data, error } = await supabase
//       .from('blogs')
//       .select('*')
//       .eq('id', id)
//       .single();

//     // ✅ FIX 3: always set loading false — even on error — so it never stays stuck
//     if (error || !data) {
//       setLoading(false);
//       return;
//     }

//     setBlog(data);
//     setLoading(false); // ← content is ready, show the page

//     // Increment read count (non-blocking)
//     await supabase
//       .from('blogs')
//       .update({ read_count: (data.read_count ?? 0) + 1 })
//       .eq('id', id);

//     setBlog(prev => prev ? { ...prev, read_count: (data.read_count ?? 0) + 1 } : prev);

//     // Fetch related blogs
//     const { data: related } = await supabase
//       .from('blogs')
//       .select('id, title, image_url, date')
//       .eq('status', 'published')
//       .neq('id', id)
//       .order('date', { ascending: false })
//       .limit(2);

//     if (related) setRelatedBlogs(related);
//   };

//   const handleRelatedClick = (related) => {
//     localStorage.setItem('selected_blog_id', related.id);
//     window.scrollTo({ top: 0, behavior: 'instant' }); // ← scroll top on related click too
//     setRelatedBlogs([]);
//     loadBlog(related.id);
//   };

//   // ── Skeleton while loading ──
//   if (loading) return (
//     <>
//       <style>{globalStyles}</style>
//       <Header />
//       <SkeletonLoader />
//       <Footer />
//     </>
//   );

//   // ── Failed to fetch ──
//   if (!blog) return (
//     <>
//       <style>{globalStyles}</style>
//       <Header />
//       <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#FAFAFA' }}>
//         <p style={{ color: '#2B2B2B', fontWeight: 900, fontSize: '1.125rem', fontFamily: 'Inter, sans-serif' }}>Article not found.</p>
//         <button onClick={() => navigate('/blogs')} style={{ background: '#B87333', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
//           Back to Resources
//         </button>
//       </div>
//       <Footer />
//     </>
//   );

//   const minRead = Math.ceil((blog.content?.length || 0) / 500);

//   return (
//     <>
//       <style>{globalStyles}</style>
//       <Header />

//       <main style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
//         <div style={{ maxWidth: '52rem', margin: '0 auto', padding: '48px 24px 80px' }}>

//           {/* Back */}
//           <button onClick={() => navigate('/blogs')}
//             style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(43,43,43,0.4)', fontWeight: 800, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: 'Inter, sans-serif', marginBottom: 40, padding: 0, transition: 'color 0.15s' }}
//             onMouseEnter={e => e.currentTarget.style.color = '#B87333'}
//             onMouseLeave={e => e.currentTarget.style.color = 'rgba(43,43,43,0.4)'}>
//             <Icon name="arrow_back" size="sm" /> Back to Resources
//           </button>

//           {/* Meta */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
//             <span style={{ background: 'rgba(184,115,51,0.1)', color: '#B87333', padding: '4px 14px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{blog.date}</span>
//             <span style={{ color: 'rgba(43,43,43,0.38)', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{minRead} MIN READ</span>
//           </div>

//           {/* Title */}
//           <h1 className="detail-hero-title" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#2B2B2B', lineHeight: 1.08, marginBottom: 28 }}>
//             {blog.title}
//           </h1>

//           {/* Author */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: '#FAFAFA', borderRadius: 16, border: '1px solid rgba(212,212,212,0.3)', marginBottom: 36 }}>
//             <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#B87333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 }}>
//               {blog.author?.charAt(0)}
//             </div>
//             <div>
//               <p style={{ fontWeight: 800, fontSize: '0.8125rem', color: '#2B2B2B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{blog.author}</p>
//               <p style={{ fontSize: '0.75rem', color: '#B3B3B3', fontWeight: 500 }}>Senior Market Analyst at Acqar</p>
//             </div>
//           </div>

//           {/* Featured image */}
//           {blog.image_url && (
//             <div style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 44, boxShadow: '0 16px 48px rgba(0,0,0,0.1)' }}>
//               <img src={blog.image_url} alt={blog.title} style={{ width: '100%', height: 'auto', display: 'block' }} referrerPolicy="no-referrer" />
//             </div>
//           )}

//           {/* Excerpt */}
//           {blog.excerpt && (
//             <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#2B2B2B', lineHeight: 1.7, marginBottom: 28, borderLeft: '3px solid #B87333', paddingLeft: 18 }}>
//               {blog.excerpt}
//             </p>
//           )}

//           {/* Content */}
//           <div className="blog-content" style={{ fontSize: '1rem', lineHeight: 1.8, color: 'rgba(43,43,43,0.78)' }} dangerouslySetInnerHTML={{ __html: blog.content }} />

//           {/* Share + Views */}
//           <div className="detail-share-row" style={{ marginTop: 56, paddingTop: 28, borderTop: '1px solid rgba(212,212,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//               <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(43,43,43,0.38)' }}>Share this insight:</span>
//               <button className="share-btn"
//                 onClick={async () => {
//                   try {
//                     if (navigator.share) await navigator.share({ title: blog.title, text: blog.excerpt, url: window.location.href });
//                     else { await navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
//                   } catch (_) {}
//                 }}
//                 style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(212,212,212,0.5)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(43,43,43,0.5)' }}>
//                 <Icon name="share" size="sm" />
//               </button>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(43,43,43,0.38)', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
//               <Icon name="visibility" size="sm" />
//               {(blog.read_count ?? 0).toLocaleString()} Views
//             </div>
//           </div>

//           {/* Related */}
//           {relatedBlogs.length > 0 && (
//             <div style={{ marginTop: 72 }}>
//               <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#2B2B2B', marginBottom: 32, textTransform: 'uppercase' }}>
//                 More from <span style={{ color: '#B87333' }}>Acqar</span>
//               </h2>
//               <div className="related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
//                 {relatedBlogs.map(related => (
//                   <div key={related.id} className="related-card" onClick={() => handleRelatedClick(related)} style={{ cursor: 'pointer' }}>
//                     <div style={{ height: 180, borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
//                       <img src={related.image_url} alt={related.title} className="related-card-img" referrerPolicy="no-referrer" />
//                     </div>
//                     <h3 className="related-card-title" style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.35 }}>{related.title}</h3>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//         </div>
//       </main>
//       <Footer />
//     </>
//   );
// };

// export default BlogDetailScreen;

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { trackEvent } from '../analytics';
import { supabase } from '../lib/supabase';

/* ─── Styles ────────────────────────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

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
  .mat-icon.sm { font-size: 1rem; }
  .mat-icon.lg { font-size: 1.5rem; }

  .blog-content h1, .blog-content h2, .blog-content h3 {
    font-weight: 800; color: #2B2B2B; margin: 2rem 0 1rem; line-height: 1.2;
  }
  .blog-content h2 { font-size: 1.5rem; }
  .blog-content h3 { font-size: 1.2rem; }
  .blog-content p  { margin-bottom: 1.25rem; line-height: 1.8; color: rgba(43,43,43,0.78); }
  .blog-content ul, .blog-content ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
  .blog-content li { margin-bottom: 0.5rem; line-height: 1.7; color: rgba(43,43,43,0.78); }
  .blog-content strong { font-weight: 700; color: #2B2B2B; }
  .blog-content a { color: #B87333; text-decoration: underline; }
  .blog-content blockquote {
    border-left: 3px solid #B87333; margin: 1.5rem 0;
    padding: 0.75rem 1.25rem; background: #FAFAFA; border-radius: 0 8px 8px 0;
    font-style: italic; color: rgba(43,43,43,0.65);
  }

  .related-card-img { transition: transform 0.6s ease; width: 100%; height: 100%; object-fit: cover; }
  .related-card:hover .related-card-img { transform: scale(1.07); }
  .related-card-title { transition: color 0.2s ease; color: #2B2B2B; }
  .related-card:hover .related-card-title { color: #B87333; }

  .share-btn { transition: background 0.18s, color 0.18s, border-color 0.18s; }
  .share-btn:hover { background: #B87333!important; color: #fff!important; border-color: #B87333!important; }

  /* Skeleton shimmer */
  @keyframes shimmer {
    0%   { background-position: -800px 0; }
    100% { background-position:  800px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 800px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 8px;
  }

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

  @media (max-width: 768px) {
    .detail-hero-title { font-size: 2rem !important; }
    .detail-share-row { flex-direction: column !important; align-items: flex-start !important; }
  }
  @media (max-width: 1024px) {
    .acq-footer-grid { grid-template-columns: 1fr 1fr 1fr; gap: 32px; }
    .acq-brand-col { grid-column: 1 / -1; }
  }
  @media (max-width: 640px) {
    .acq-footer-grid { grid-template-columns: 1fr 1fr; gap: 28px; padding: 0 1rem 40px; }
    .acq-brand-col { grid-column: 1 / -1; }
    .acq-footer-bottom { flex-direction: column; align-items: center; text-align: center; gap: 14px; padding: 18px 1rem 28px; }
    .acq-legal { justify-content: center; gap: 18px; }
    .acq-divider { padding: 0 1rem; }
    .related-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 420px) {
    .acq-footer-grid { grid-template-columns: 1fr; }
  }
`;

function Icon({ name, size = '' }) {
  return <span className={`mat-icon${size ? ' ' + size : ''}`}>{name}</span>;
}

/* ─── Skeleton loader ────────────────────────────────────────────────── */
function SkeletonLoader() {
  return (
    <main style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '52rem', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div className="skeleton" style={{ height: 14, width: 140, marginBottom: 40 }} />
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div className="skeleton" style={{ height: 26, width: 100, borderRadius: 999 }} />
          <div className="skeleton" style={{ height: 26, width: 80,  borderRadius: 999 }} />
        </div>
        <div className="skeleton" style={{ height: 52, width: '90%', marginBottom: 14 }} />
        <div className="skeleton" style={{ height: 52, width: '65%', marginBottom: 36 }} />
        <div style={{ display: 'flex', gap: 14, padding: '18px 20px', background: '#FAFAFA', borderRadius: 16, border: '1px solid rgba(212,212,212,0.3)', marginBottom: 36 }}>
          <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 13, width: 160, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 12, width: 200 }} />
          </div>
        </div>
        <div className="skeleton" style={{ width: '100%', height: 380, borderRadius: 24, marginBottom: 44 }} />
        {[100, 95, 88, 100, 72, 92, 85, 60].map((w, i) => (
          <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, marginBottom: 16 }} />
        ))}
      </div>
    </main>
  );
}

/* ─── Header ─────────────────────────────────────────────────────────── */
function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const current  = location.pathname;
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const navItems = [
    { label: 'Pricing',   path: '/pricing' },
    { label: 'Resources', path: '/blogs'   },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#D4D4D4] bg-white">
        <div className="hdrWrap max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
          <div className="hdrLogo flex items-center cursor-pointer shrink-0 whitespace-nowrap" onClick={() => { trackEvent('nav_click', { item: 'logo' }); navigate('/'); }}>
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
              <span style={{ color: '#B87333' }}>ACQ</span><span style={{ color: '#111111' }}>AR</span>
            </h1>
          </div>
          <button onClick={() => { trackEvent('nav_click', { item: 'pricing' }); navigate('/pricing'); }}
            className={`md:hidden text-[10px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-full ${current === '/pricing' ? 'text-[#B87333] underline underline-offset-4' : 'text-[#2B2B2B]/70'}`}>
            Pricing
          </button>
          <nav className="hidden md:flex items-center gap-10">
            {navItems.map(item => (
              <button key={item.label} onClick={() => { trackEvent('Nav', 'Click', item.label); navigate(item.path); }}
                className={`text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap ${current === item.path ? 'text-[#B87333]' : 'text-[#2B2B2B]'}`}>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="hdrRight flex items-center gap-2 sm:gap-4 shrink-0 flex-nowrap">
            {user
              ? <button onClick={() => navigate('/dashboard')} className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] whitespace-nowrap">Dashboard</button>
              : <button onClick={() => { trackEvent('nav_click', { item: 'login' }); navigate('/login'); }} className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] whitespace-nowrap">Sign In</button>
            }
            <button onClick={() => { trackEvent('valuation_start', { location: 'header' }); navigate('/valuation'); }} className="hidden md:inline-flex hdrCta bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] whitespace-nowrap">Get Started</button>
          </div>
        </div>
        <style>{`
          @media (max-width:420px){ .hdrWrap{ padding-left:10px!important; padding-right:10px!important; gap:8px!important; } .hdrLogo h1{ font-size:18px!important; } .hdrCta{ padding:9px 12px!important; font-size:10px!important; } }
        `}</style>
      </header>
      <div className="h-20" />
    </>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────── */
function Footer() {
  const navigate = useNavigate();
  const cols = [
    ['PRODUCT',     ['TruValu™ Products','ValuCheck™ (FREE)','DealLens™','InvestIQ™','CertiFi™','Compare Tiers']],
    ['COMPANY',     ['About ACQAR','How It Works','Pricing','Contact Us','Partners','Press Kit']],
    ['RESOURCES',   ['Help Center','Market Reports','Blog','Comparisons']],
    ['COMPARISONS', ['vs Bayut TruEstimate','vs Property Finder','vs Traditional Valuers','Why ACQAR?']],
  ];
  return (
    <footer className="acq-footer">
      <div className="acq-footer-grid">
        <div className="acq-brand-col">
          <span className="acq-brand-name">ACQAR</span>
          <p className="acq-brand-desc">The world's first AI-powered property intelligence platform for Dubai real estate. Independent, instant, investment-grade.</p>
          <div className="acq-rics-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
            <span>RICS-Aligned Intelligence</span>
          </div>
          <div className="acq-social-row">
            <a href="https://www.linkedin.com/company/acqar" target="_blank" rel="noopener noreferrer" className="acq-social-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5S1.1 1 2.48 1c1.38 0 2.5 1.12 2.5 2.5zM0 8h5v16H0V8zm7.5 0h4.8v2.2h.1c.67-1.2 2.3-2.4 4.73-2.4C22.2 7.8 24 10.2 24 14.1V24h-5v-8.5c0-2-.04-4.6-2.8-4.6-2.8 0-3.2 2.2-3.2 4.4V24h-5V8z"/></svg>
            </a>
          </div>
        </div>
        {cols.map(([title, items]) => (
          <div key={title}>
            <h6 className="acq-col-title">{title}</h6>
            <ul className="acq-link-list">{items.map(item => <li key={item} className="acq-link-item">{item}</li>)}</ul>
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

/* ─── BlogDetailScreen ───────────────────────────────────────────────── */
const BlogDetailScreen = () => {
  const navigate = useNavigate();
  const [blog,         setBlog]         = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    // ✅ FIX 1: always scroll to top immediately on page load
    window.scrollTo({ top: 0, behavior: 'instant' });

    // const id = localStorage.getItem('selected_blog_id');

    const params = new URLSearchParams(window.location.search);
const id = params.get('id') || localStorage.getItem('selected_blog_id');
if (id) localStorage.setItem('selected_blog_id', id);

    // ✅ FIX 2: if no id, redirect back rather than showing loading forever
    if (!id) {
      navigate('/blogs');
      return;
    }

    loadBlog(id);
  }, []);

  const loadBlog = async (id) => {
    setLoading(true);
    setBlog(null);

    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();

    // ✅ FIX 3: always set loading false — even on error — so it never stays stuck
    if (error || !data) {
      setLoading(false);
      return;
    }

    setBlog(data);
    setLoading(false); // ← content is ready, show the page

    // Increment read count (non-blocking)
    await supabase
      .from('blogs')
      .update({ read_count: (data.read_count ?? 0) + 1 })
      .eq('id', id);

    setBlog(prev => prev ? { ...prev, read_count: (data.read_count ?? 0) + 1 } : prev);

    // Fetch related blogs
    const { data: related } = await supabase
      .from('blogs')
      .select('id, title, image_url, date')
      .eq('status', 'published')
      .neq('id', id)
      .order('date', { ascending: false })
      .limit(2);

    if (related) setRelatedBlogs(related);
  };

  const handleRelatedClick = (related) => {
    localStorage.setItem('selected_blog_id', related.id);
    window.scrollTo({ top: 0, behavior: 'instant' }); // ← scroll top on related click too
    setRelatedBlogs([]);
    loadBlog(related.id);
  };

  // ── Skeleton while loading ──
  if (loading) return (
    <>
      <style>{globalStyles}</style>
      <Header />
      <SkeletonLoader />
      <Footer />
    </>
  );

  // ── Failed to fetch ──
  if (!blog) return (
    <>
      <style>{globalStyles}</style>
      <Header />
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#FAFAFA' }}>
        <p style={{ color: '#2B2B2B', fontWeight: 900, fontSize: '1.125rem', fontFamily: 'Inter, sans-serif' }}>Article not found.</p>
        <button onClick={() => navigate('/blogs')} style={{ background: '#B87333', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 800, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
          Back to Resources
        </button>
      </div>
      <Footer />
    </>
  );

  const minRead = Math.ceil((blog.content?.length || 0) / 500);

  return (
    <>
      <style>{globalStyles}</style>
      <Header />

      <main style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: '52rem', margin: '0 auto', padding: '48px 24px 80px' }}>

          {/* Back */}
          <button onClick={() => navigate('/blogs')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(43,43,43,0.4)', fontWeight: 800, fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: 'Inter, sans-serif', marginBottom: 40, padding: 0, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#B87333'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(43,43,43,0.4)'}>
            <Icon name="arrow_back" size="sm" /> Back to Resources
          </button>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(184,115,51,0.1)', color: '#B87333', padding: '4px 14px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{blog.date}</span>
            <span style={{ color: 'rgba(43,43,43,0.38)', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{minRead} MIN READ</span>
          </div>

          {/* Title */}
          <h1 className="detail-hero-title" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#2B2B2B', lineHeight: 1.08, marginBottom: 28 }}>
            {blog.title}
          </h1>

          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: '#FAFAFA', borderRadius: 16, border: '1px solid rgba(212,212,212,0.3)', marginBottom: 36 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#B87333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 }}>
              {blog.author?.charAt(0)}
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.8125rem', color: '#2B2B2B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{blog.author}</p>
              <p style={{ fontSize: '0.75rem', color: '#B3B3B3', fontWeight: 500 }}>Senior Market Analyst at Acqar</p>
            </div>
          </div>

          {/* Featured image */}
          {blog.image_url && (
            <div style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 44, boxShadow: '0 16px 48px rgba(0,0,0,0.1)' }}>
              <img src={blog.image_url} alt={blog.title} style={{ width: '100%', height: 'auto', display: 'block' }} referrerPolicy="no-referrer" />
            </div>
          )}

          {/* Excerpt */}
          {blog.excerpt && (
            <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#2B2B2B', lineHeight: 1.7, marginBottom: 28, borderLeft: '3px solid #B87333', paddingLeft: 18 }}>
              {blog.excerpt}
            </p>
          )}

          {/* Content */}
          <div className="blog-content" style={{ fontSize: '1rem', lineHeight: 1.8, color: 'rgba(43,43,43,0.78)' }} dangerouslySetInnerHTML={{ __html: blog.content }} />

          {/* Share + Views */}
          <div className="detail-share-row" style={{ marginTop: 56, paddingTop: 28, borderTop: '1px solid rgba(212,212,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(43,43,43,0.38)' }}>Share this insight:</span>
              <button className="share-btn"
                // onClick={async () => {
                //   try {
                //     if (navigator.share) await navigator.share({ title: blog.title, text: blog.excerpt, url: window.location.href });
                //     else { await navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
                //   } catch (_) {}
                // }}

                onClick={async () => {
  const blogId = localStorage.getItem('selected_blog_id');
  const shareUrl = `${window.location.origin}/blogs/detail?id=${blogId}`;
  try {
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      await navigator.share({ title: blog.title, text: blog.excerpt, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('✓ Link copied to clipboard!');
    }
  } catch (err) {
    // Final fallback if clipboard also fails
    prompt('Copy this link:', shareUrl);
  }
}}
                style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid rgba(212,212,212,0.5)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(43,43,43,0.5)' }}>
                <Icon name="share" size="sm" />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(43,43,43,0.38)', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              <Icon name="visibility" size="sm" />
              {(blog.read_count ?? 0).toLocaleString()} Views
            </div>
          </div>

          {/* Related */}
          {relatedBlogs.length > 0 && (
            <div style={{ marginTop: 72 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#2B2B2B', marginBottom: 32, textTransform: 'uppercase' }}>
                More from <span style={{ color: '#B87333' }}>Acqar</span>
              </h2>
              <div className="related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                {relatedBlogs.map(related => (
                  <div key={related.id} className="related-card" onClick={() => handleRelatedClick(related)} style={{ cursor: 'pointer' }}>
                    <div style={{ height: 180, borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
                      <img src={related.image_url} alt={related.title} className="related-card-img" referrerPolicy="no-referrer" />
                    </div>
                    <h3 className="related-card-title" style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.35 }}>{related.title}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
};

export default BlogDetailScreen;
