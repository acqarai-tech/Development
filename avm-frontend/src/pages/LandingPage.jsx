// // ACQAR Landing Page - Complete React Component
// // File: avm-frontend/src/pages/LandingPage.jsx
// // All 10 sections: Navigation, Hero, Stats, Form, How It Works, Products, Passport, Wallet, Chauffeur, Scout, Comparison, FAQ, CTA, Footer

// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';

// const LandingPage = () => {
//   return (
//     <div className="min-h-screen bg-white">
//       <Navigation />
//       <HeroSection />
//       <StatsBar />
//       <FreeValuationForm />
//       <HowItWorks />
//       <ProductSuite />
//       <PassportMockup />
//       <WalletMockup />
//       <ChauffeurMockup />
//       <ScoutMockup />
//       <ComparisonTable />
//       <FAQ />
//       <FinalCTA />
//       <Footer />
//     </div>
//   );
// };

// const Navigation = () => {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           <Link to="/" className="flex items-center space-x-2">
//             <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold text-lg">A</span>
//             </div>
//             <span className="text-xl font-bold text-gray-900">ACQAR</span>
//           </Link>
//           <div className="hidden md:flex items-center space-x-8">
//             <a href="#products" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Products</a>
//             <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">How It Works</a>
//             <a href="#comparison" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Roadmap</a>
//             <a href="#faq" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">FAQ</a>
//           </div>
//           <div className="hidden md:flex items-center space-x-4">
//             <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Log In</Link>

//             {/* <a href="https://acqar-mvp.onrender.com/valuation" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md">Request Access</a> */}
//             <Link to="/login" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md">
//   Request Access
// </Link>

//           </div>
//           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
//             <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
//             </svg>
//           </button>
//         </div>
//         {mobileMenuOpen && (
//           <div className="md:hidden py-4 border-t border-gray-200">
//             <div className="flex flex-col space-y-3">
//               <a href="#products" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2">Products</a>
//               <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2">How It Works</a>
//               <a href="#comparison" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2">Roadmap</a>
//               <a href="#faq" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2">FAQ</a>
//              <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2">
//   Log In
// </Link>

// <Link
//   to="/login"
//   className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-center"
// >
//   Request Access
// </Link>

//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// const HeroSection = () => {
//   const [progress, setProgress] = useState(0);
//   useEffect(() => {
//     const timer = setInterval(() => setProgress((prev) => (prev >= 100 ? 0 : prev + 1)), 50);
//     return () => clearInterval(timer);
//   }, []);
//   return (
//     <section className="pt-24 md:pt-32 pb-16 md:pb-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//           <div>
//             <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6"><span>🌐</span><span>DUBAI'S #1 AI VALUATION ENGINE</span></div>
//             <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">See The Future. <span className="text-blue-600">Invest With Certainty.</span></h1>
//             <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">Enterprise-grade property intelligence for modern investors. Institutional accuracy, real-time data, and instant transparency.</p>
//             <a href="/valuation" className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold text-lg shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 mb-8">Get Started Free</a>
//             <div className="flex items-center space-x-3">
//               <div className="flex -space-x-2">{[1, 2, 3, 4].map((i) => (<div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white"></div>))}</div>
//               <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">10K+</span> Trusted by over 10,000+ institutional investors</p>
//             </div>
//           </div>
//           <div className="relative">
//             <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
//               <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-2"><span className="text-2xl">📊</span><span className="text-white font-bold text-lg">TruValu™ Report</span></div>
//                   <div className="flex items-center space-x-1 bg-red-500 px-3 py-1 rounded-full"><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div><span className="text-white text-xs font-semibold">LIVE GENERATION</span></div>
//                 </div>
//               </div>
//               <div className="p-6">
//                 <div className="text-sm text-gray-500 mb-2">ESTIMATED MARKET VALUE</div>
//                 <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">AED 4,250,000</div>
//                 <div className="inline-flex items-center space-x-1 text-green-600 font-semibold mb-6">
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
//                   <span>+2.4% vs LTM</span>
//                 </div>
//                 <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-4 mb-6">
//                   <div className="flex items-center justify-between">
//                     <div><div className="text-sm text-gray-600 mb-1">TruScore</div><div className="text-3xl font-bold text-green-600">87</div></div>
//                     <div className="text-right"><span className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">HIGH</span><div className="text-xs text-gray-500 mt-1">Confidence</div></div>
//                   </div>
//                 </div>
//                 <div className="bg-gray-100 rounded-lg p-4">
//                   <div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-gray-600">Scanning Transaction Database</span><span className="text-xs font-bold text-blue-600">{progress}%</span></div>
//                   <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-200" style={{ width: `${progress}%` }}></div></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// const StatsBar = () => (
//   <div className="bg-gradient-to-br from-blue-50 to-white py-12 border-b border-gray-200">
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//         <div className="text-center"><div className="text-4xl md:text-5xl font-bold text-blue-900 mb-2">10,000+</div><div className="text-gray-600 text-sm md:text-base">Properties Analyzed</div></div>
//         <div className="text-center"><div className="text-4xl md:text-5xl font-bold text-blue-900 mb-2">4.9/5</div><div className="text-gray-600 text-sm md:text-base">Average Rating</div></div>
//         <div className="text-center"><div className="text-4xl md:text-5xl font-bold text-blue-900 mb-2">AED 500M+</div><div className="text-gray-600 text-sm md:text-base">Assets Valued</div></div>
//       </div>
//     </div>
//   </div>
// );

// const FreeValuationForm = () => (
//   <section id="valuation-form" className="py-16 md:py-20 bg-white">
//     <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//       <div className="text-center mb-10">
//         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get Your Free Property Valuation</h2>
//         <p className="text-lg text-gray-600 max-w-2xl mx-auto">Experience institutional-grade accuracy in seconds. No credit card required.</p>
//       </div>
//       <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl p-6 md:p-10 border border-blue-100">
//         <form className="space-y-5">
//           <div><label className="block text-sm font-semibold text-gray-700 mb-2">Property Area</label><select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"><option value="">Select area...</option><option value="dubai-marina">Dubai Marina</option><option value="downtown">Downtown Dubai</option><option value="jbr">JBR</option><option value="business-bay">Business Bay</option><option value="palm-jumeirah">Palm Jumeirah</option></select></div>
//           <div><label className="block text-sm font-semibold text-gray-700 mb-2">Building / Project</label><input type="text" placeholder="e.g., Marina Heights Tower" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" /></div>
//           <div><label className="block text-sm font-semibold text-gray-700 mb-2">Unit Number</label><input type="text" placeholder="e.g., 2305" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" /></div>
//           <div><label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label><select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900"><option value="">Select...</option><option value="studio">Studio</option><option value="1">1 Bedroom</option><option value="2">2 Bedrooms</option><option value="3">3 Bedrooms</option><option value="4">4+ Bedrooms</option></select></div>
//           <button type="submit" onClick={(e) => {e.preventDefault(); window.location.href='https://acqar-mvp.onrender.com/valuation';}} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-[1.02] active:scale-[0.98]">Generate Free Valuation</button>
//         </form>
//       </div>
//     </div>
//   </section>
// );

// const HowItWorks = () => (
//   <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       <div className="text-center mb-16">
//         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple. Swift. Sophisticated.</h2>
//         <p className="text-lg text-gray-600 max-w-2xl mx-auto">Get enterprise-grade property valuations in four easy steps</p>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//         {[
//           {step: 1, title: 'Enter Details', desc: 'Provide basic property information: location, size, and features.', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'},
//           {step: 2, title: 'AI Analysis', desc: 'Our AI scans 85+ data sources and analyzes market trends in real-time.', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'},
//           {step: 3, title: 'Instant Valuation', desc: 'Receive your institutional-grade valuation in under 5 seconds.', icon: 'M13 10V3L4 14h7v7l9-11h-7z', highlight: true},
//           {step: 4, title: 'Actionable Report', desc: 'Download your comprehensive PDF report with market insights and recommendations.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'}
//         ].map((item) => (
//           <div key={item.step} className={`relative ${item.highlight ? 'transform scale-105' : ''}`}>
//             <div className={`${item.highlight ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-2 border-blue-400' : 'bg-white border border-gray-100'} rounded-xl p-6 shadow-md hover:shadow-xl transition-all`}>
//               <div className={`w-12 h-12 ${item.highlight ? 'bg-white/20' : 'bg-blue-100'} rounded-lg flex items-center justify-center mb-4`}>
//                 <svg className={`w-6 h-6 ${item.highlight ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
//               </div>
//               <div className={`text-sm font-semibold mb-2 ${item.highlight ? 'text-blue-200' : 'text-blue-600'}`}>STEP {item.step}</div>
//               <h3 className={`text-xl font-bold mb-2 ${item.highlight ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
//               <p className={`text-sm ${item.highlight ? 'text-blue-100' : 'text-gray-600'}`}>{item.desc}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   </section>
// );

// // Part 4: Product Suite Cards

// const ProductSuite = () => (
//   <section id="products" className="py-16 md:py-20 bg-white">
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       {/* Header */}
//       <div className="text-center mb-16">
//         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//           TruValu™ Product Suite
//         </h2>
//         <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//           Enterprise-grade tools for every stage of your property investment journey
//         </p>
//       </div>

//       {/* Product Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {/* ValuCheck™ */}
//         <div className="group bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer">
//           <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
//             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//           <h3 className="text-xl font-bold text-gray-900 mb-2">ValuCheck™</h3>
//           <p className="text-gray-600 text-sm mb-4">
//             AI-powered property valuation with institutional accuracy. Get instant market valuations backed by real-time DLD data.
//           </p>
//           <a
//             href="https://acqar-mvp.onrender.com/valuation"
//             className="inline-flex items-center text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
//           >
//             Learn more
//             <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//             </svg>
//           </a>
//         </div>

//         {/* DealLens™ */}
//         <div className="group bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all cursor-pointer">
//           <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
//             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//           <h3 className="text-xl font-bold text-gray-900 mb-2">DealLens™</h3>
//           <p className="text-gray-600 text-sm mb-4">
//             Analyze deal structures and ROI potential. Compare multiple properties and investment scenarios side-by-side.
//           </p>
//           <a
//             href="https://acqar-mvp.onrender.com/valuation"
//             className="inline-flex items-center text-purple-600 font-semibold text-sm hover:text-purple-700 transition-colors"
//           >
//             Learn more
//             <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//             </svg>
//           </a>
//         </div>

//         {/* InvestIQ™ */}
// <div className="group bg-gradient-to-br from-amber-50 to-white rounded-xl p-6 border border-amber-100 hover:border-amber-300 hover:shadow-xl transition-all cursor-pointer">
//   <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
//     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
//       <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//     </svg>
//   </div>
//   <h3 className="text-xl font-bold text-gray-900 mb-2">InvestIQ™</h3>
//   <p className="text-gray-600 text-sm mb-4">
//     Portfolio analytics and market trend forecasting. Track your investments with real-time performance dashboards.
//   </p>
//   <a
//     href="https://acqar-mvp.onrender.com/valuation"
//     className="inline-flex items-center text-amber-600 font-semibold text-sm hover:text-amber-700 transition-colors"
//   >
//     Learn more
//     <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//     </svg>
//   </a>
// </div>


//         {/* Certifi™ */}
//         <div className="group bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100 hover:border-green-300 hover:shadow-xl transition-all cursor-pointer">
//           <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
//             <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//             </svg>
//           </div>
//           <h3 className="text-xl font-bold text-gray-900 mb-2">Certifi™</h3>
//           <p className="text-gray-600 text-sm mb-4">
//             Blockchain-verified property certificates. Secure, immutable proof of ownership and transaction history.
//           </p>
//           <a
//             href="https://acqar-mvp.onrender.com/valuation"
//             className="inline-flex items-center text-green-600 font-semibold text-sm hover:text-green-700 transition-colors"
//           >
//             Learn more
//             <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//             </svg>
//           </a>
//         </div>
//       </div>
//     </div>
//   </section>
// );


// // Passport, Wallet, Chauffeur, Scout, Comparison, FAQ, CTA, Footer components follow the same pattern
// // Due to character limits, I'm providing the essential structure
// // The full file will be downloadable

// // Part 5: ACQAR Passport™ Detailed Mockup

// const PassportMockup = () => (
//   <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white">
//     <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//       {/* Section Header */}
//       <div className="text-center mb-8 md:mb-10">
//         <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
//           ACQAR Passport™
//         </h2>
//         <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
//           A detailed digital dossier that builds trust and accelerates transactions.
//         </p>
//       </div>

//       {/* Passport Card Mockup */}
//       <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-4xl mx-auto">
//         {/* Passport Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 md:px-6 py-3 md:py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2 md:space-x-3">
//               <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
//                 <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
//               </svg>
//               <div>
//                 <div className="text-white text-xs md:text-sm font-semibold">Property Passport</div>
//                 <div className="text-blue-100 text-xs">AQ-8829-DXB</div>
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-white text-lg md:text-xl font-bold">98.5</div>
//               <div className="text-blue-100 text-xs">Trust Score</div>
//             </div>
//           </div>
//         </div>

//         {/* Passport Body */}
//         <div className="p-4 md:p-6">
//           {/* Property Image */}
//           <div className="mb-4 md:mb-6">
//             <div className="relative h-40 md:h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
//               <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
//                 Dubai Marina Property
//               </div>
//             </div>
//           </div>

//           {/* Status Indicators */}
//           <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
//             <div className="flex items-center space-x-2 bg-green-50 rounded-lg p-2 md:p-3">
//               <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//               </svg>
//               <span className="text-xs md:text-sm font-semibold text-gray-700">Title Deed Clear</span>
//             </div>
//             <div className="flex items-center space-x-2 bg-green-50 rounded-lg p-2 md:p-3">
//               <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//               </svg>
//               <span className="text-xs md:text-sm font-semibold text-gray-700">No Liens/Debts</span>
//             </div>
//             <div className="flex items-center space-x-2 bg-blue-50 rounded-lg p-2 md:p-3">
//               <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
//                 <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
//               </svg>
//               <span className="text-xs md:text-sm font-semibold text-gray-700">Yield: 7.2% Net</span>
//             </div>
//             <div className="flex items-center space-x-2 bg-purple-50 rounded-lg p-2 md:p-3">
//               <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
//               </svg>
//               <span className="text-xs md:text-sm font-semibold text-gray-700">Smart Ready</span>
//             </div>
//           </div>

//           {/* Valuation Engine */}
//           <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
//             <div className="text-xs font-semibold text-blue-600 mb-2">VALUATION ENGINE</div>
//             <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">AED 4,250,000</div>
//             <div className="flex items-center justify-between text-xs md:text-sm">
//               <span className="text-green-600 font-semibold">+1.2% above area average</span>
//               <span className="text-gray-500">Updated 2 hours ago</span>
//             </div>
//           </div>

//           {/* Property Details */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
//             <div>
//               <div className="text-xs text-gray-500 mb-1">Location</div>
//               <div className="text-sm font-semibold text-gray-900">Dubai Marina, Silverene Tower A</div>
//             </div>
//             <div>
//               <div className="text-xs text-gray-500 mb-1">Ownership</div>
//               <div className="text-sm font-semibold text-gray-900">Verified Individual (Private)</div>
//             </div>
//           </div>

//           {/* Stats Grid */}
//           <div className="grid grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
//             <div className="text-center p-2 md:p-3 bg-gray-50 rounded-lg">
//               <div className="text-base md:text-lg font-bold text-blue-600">100%</div>
//               <div className="text-xs text-gray-600">On-chain data</div>
//             </div>
//             <div className="text-center p-2 md:p-3 bg-gray-50 rounded-lg">
//               <div className="text-base md:text-lg font-bold text-blue-600">24h</div>
//               <div className="text-xs text-gray-600">Verification</div>
//             </div>
//             <div className="text-center p-2 md:p-3 bg-gray-50 rounded-lg">
//               <div className="text-base md:text-lg font-bold text-blue-600">85+</div>
//               <div className="text-xs text-gray-600">Data Sources</div>
//             </div>
//             <div className="text-center p-2 md:p-3 bg-gray-50 rounded-lg">
//               <div className="text-base md:text-lg font-bold text-green-600">0</div>
//               <div className="text-xs text-gray-600">Counterfeits</div>
//             </div>
//           </div>

//           {/* CTA Button */}
//           <a
//             href="https://acqar-mvp.onrender.com/valuation"
//             className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
//           >
//             Join Waitlist
//           </a>
//         </div>
//       </div>
//     </div>
//   </section>
// );

// // Part 6: ACQAR Wallet™ Detailed Mockup

// const WalletMockup = () => (
//   <section className="py-12 md:py-16 bg-white">
//     <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//       {/* Section Header */}
//       <div className="text-center mb-8 md:mb-10">
//         <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
//           ACQAR Wallet™
//         </h2>
//         <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
//           Digital payment hub for all property-related transactions. Streamline fees, utilities, and international transfers.
//         </p>
//       </div>

//       {/* Wallet Card Mockup */}
//       <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden max-w-4xl mx-auto">
//         {/* Wallet Header */}
//         <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 md:px-6 py-4 md:py-5">
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="text-purple-100 text-xs md:text-sm mb-1">Available Balance</div>
//               <div className="text-white text-2xl md:text-3xl font-bold">AED 125,000</div>
//             </div>
//             <div className="text-right">
//               <div className="text-white text-xs md:text-sm font-semibold">Digital Payment Hub</div>
//               <div className="text-purple-100 text-xs">Instant Transactions</div>
//             </div>
//           </div>
//         </div>

//         {/* Wallet Body */}
//         <div className="p-4 md:p-6">
//           {/* Quick Payments */}
//           <div className="mb-5 md:mb-6">
//             <div className="text-sm font-semibold text-gray-700 mb-3">Quick Payments</div>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
//               <button className="bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-md transition-all">
//                 <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                   <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <div className="text-xs font-semibold text-gray-700 text-center">DLD Fees</div>
//               </button>

//               <button className="bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-md transition-all">
//                 <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                   <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <div className="text-xs font-semibold text-gray-700 text-center">Ejari Reg.</div>
//               </button>

//               <button className="bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-md transition-all">
//                 <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                   <svg className="w-4 h-4 md:w-5 md:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
//                   </svg>
//                 </div>
//                 <div className="text-xs font-semibold text-gray-700 text-center">DEWA Bills</div>
//               </button>

//               <button className="bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-md transition-all">
//                 <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
//                   <svg className="w-4 h-4 md:w-5 md:h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
//                     <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <div className="text-xs font-semibold text-gray-700 text-center">Intl. Transfer</div>
//               </button>
//             </div>
//           </div>

//           {/* Recent Transactions */}
//           <div className="mb-5 md:mb-6">
//             <div className="text-sm font-semibold text-gray-700 mb-3">Recent Transactions</div>
//             <div className="space-y-2 md:space-y-3">
//               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-full flex items-center justify-center">
//                     <svg className="w-4 h-4 md:w-5 md:h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <div>
//                     <div className="text-sm font-semibold text-gray-900">DLD Transfer Fee</div>
//                     <div className="text-xs text-gray-500">Jan 18, 2025</div>
//                   </div>
//                 </div>
//                 <div className="text-sm font-bold text-red-600">-AED 42,500</div>
//               </div>

//               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hidden md:flex">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
//                     <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <div>
//                     <div className="text-sm font-semibold text-gray-900">Ejari Registration</div>
//                     <div className="text-xs text-gray-500">Jan 15, 2025</div>
//                   </div>
//                 </div>
//                 <div className="text-sm font-bold text-red-600">-AED 220</div>
//               </div>

//               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hidden md:flex">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
//                     <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
//                       <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <div className="text-sm font-semibold text-gray-900">DEWA Bill</div>
//                     <div className="text-xs text-gray-500">Jan 12, 2025</div>
//                   </div>
//                 </div>
//                 <div className="text-sm font-bold text-red-600">-AED 850</div>
//               </div>
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <div className="grid grid-cols-2 gap-3">
//             <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg text-sm">
//               Add Funds
//             </button>
//             <a
//               href="https://acqar-mvp.onrender.com/valuation"
//               className="bg-white border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all text-center text-sm"
//             >
//               Join Waitlist
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   </section>
// );


// // Part 7: ACQAR Chauffeur™ Detailed Mockup

// const ChauffeurMockup = () => (
//   <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white">
//     <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//       {/* Section Header */}
//       <div className="text-center mb-8 md:mb-10">
//         <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
//           ACQAR Chauffeur™
//         </h2>
//         <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
//           Your AI-powered transaction assistant. Navigate complex deals with confidence and expert guidance.
//         </p>
//       </div>

//       {/* Chauffeur Card Mockup */}
//       <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-4xl mx-auto">
//         {/* Chauffeur Header */}
//         <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-4 md:px-6 py-3 md:py-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="text-white text-sm md:text-base font-semibold">Active Transactions</div>
//               <div className="text-amber-100 text-xs">AI-Guided Deals</div>
//             </div>
//             <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
//               <div className="text-white text-lg md:text-xl font-bold">3</div>
//             </div>
//           </div>
//         </div>

//         {/* Chauffeur Body */}
//         <div className="p-4 md:p-6">
//           {/* Transaction Timeline */}
//           <div className="mb-5 md:mb-6">
//             <div className="text-sm font-semibold text-gray-700 mb-3">Transaction Timeline</div>
//             <div className="relative">
//               {/* Timeline Line */}
//               <div className="absolute left-4 md:left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-400 to-gray-200"></div>

//               {/* Timeline Items */}
//               <div className="space-y-4 md:space-y-5">
//                 {/* Item 1 - Active */}
//                 <div className="relative pl-10 md:pl-12">
//                   <div className="absolute left-0 w-8 h-8 md:w-10 md:h-10 bg-amber-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
//                     <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <div className="bg-amber-50 rounded-lg p-3 md:p-4 border border-amber-200">
//                     <div className="flex items-start justify-between mb-2">
//                       <div>
//                         <div className="text-sm font-semibold text-gray-900">Offer Negotiation</div>
//                         <div className="text-xs text-gray-500">Dubai Marina Villa</div>
//                       </div>
//                       <span className="px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded">Active</span>
//                     </div>
//                     <div className="text-xs text-gray-600 mb-2 hidden md:block">
//                       AI suggested counter-offer: AED 4.2M (-5%)
//                     </div>
//                     <div className="text-xs font-semibold text-amber-600">2 hours ago</div>
//                   </div>
//                 </div>

//                 {/* Item 2 - Completed */}
//                 <div className="relative pl-10 md:pl-12">
//                   <div className="absolute left-0 w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow">
//                     <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
//                     <div className="flex items-start justify-between mb-2">
//                       <div>
//                         <div className="text-sm font-semibold text-gray-900">Initial Valuation</div>
//                         <div className="text-xs text-gray-500 hidden md:block">Property assessed at AED 4.25M</div>
//                       </div>
//                       <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Done</span>
//                     </div>
//                     <div className="text-xs font-semibold text-gray-500">Yesterday</div>
//                   </div>
//                 </div>

//                 {/* Item 3 - Completed */}
//                 <div className="relative pl-10 md:pl-12">
//                   <div className="absolute left-0 w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow">
//                     <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
//                     <div className="flex items-start justify-between mb-2">
//                       <div>
//                         <div className="text-sm font-semibold text-gray-900">Document Review</div>
//                         <div className="text-xs text-gray-500 hidden md:block">All docs verified by AI</div>
//                       </div>
//                       <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Done</span>
//                     </div>
//                     <div className="text-xs font-semibold text-gray-500">2 days ago</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Chauffeur AI Insights */}
//           <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-3 md:p-4 mb-4 md:mb-5">
//             <div className="flex items-start space-x-3">
//               <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
//                 <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
//                   <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
//                 </svg>
//               </div>
//               <div className="flex-1">
//                 <div className="text-xs md:text-sm font-semibold text-blue-900 mb-1">Chauffeur AI Insight</div>
//                 <div className="text-xs md:text-sm text-gray-700">
//                   Based on recent sales, your counter-offer of <span className="font-bold">AED 4.2M</span> has an <span className="font-bold text-green-600">87% success rate</span>. Similar properties closed 3-5% below asking in the last 30 days.
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//             <button className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all shadow-md hover:shadow-lg text-sm">
//               View All Transactions
//             </button>
//             <a
//               href="https://acqar-mvp.onrender.com/valuation"
//               className="bg-white border-2 border-amber-600 text-amber-600 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-all text-center text-sm"
//             >
//               Join Waitlist
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   </section>
// );

// // Part 8: ACQAR Scout™ Detailed Mockup (Optimized)

// const ScoutMockup = () => (
//   <section className="py-12 md:py-16 bg-white">
//     <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//       {/* Section Header */}
//       <div className="text-center mb-8 md:mb-10">
//         <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
//           ACQAR Scout™
//         </h2>
//         <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
//           Complete property management ecosystem. AI hunter, rental management, and tenant screening—all in one dashboard.
//         </p>
//       </div>

//       {/* Scout Card Mockup */}
//       <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-2xl border border-green-200 overflow-hidden max-w-4xl mx-auto">
//         {/* Scout Header */}
//         <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 md:px-5 py-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
//               </svg>
//               <div>
//                 <div className="text-white text-sm md:text-base font-semibold">AI Hunter Dashboard</div>
//                 <div className="text-green-100 text-xs hidden md:block">Real-time market intelligence</div>
//               </div>
//             </div>
//             <div className="flex items-center space-x-1 bg-red-500 px-2 py-1 rounded">
//               <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
//               <span className="text-white text-xs font-semibold">LIVE</span>
//             </div>
//           </div>
//         </div>

//         {/* Scout Body */}
//         <div className="p-4 md:p-5">
//           {/* Active Hunts */}
//           <div className="mb-4 md:mb-5">
//             <div className="text-sm font-semibold text-gray-700 mb-2">Active Hunts</div>
//             <div className="space-y-2">
//               {/* Hunt 1 */}
//               <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-green-300 transition-all">
//                 <div className="flex items-start justify-between mb-1">
//                   <div className="flex-1">
//                     <div className="text-sm font-semibold text-gray-900">Dubai Marina 3BR</div>
//                     <div className="text-xs text-gray-500">Budget: AED 2.5-3M • ROI Target: 7%+</div>
//                   </div>
//                   <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">12 Matches</span>
//                 </div>
//               </div>

//               {/* Hunt 2 */}
//               <div className="bg-white rounded-lg p-3 border border-gray-200 hover:border-green-300 transition-all">
//                 <div className="flex items-start justify-between mb-1">
//                   <div className="flex-1">
//                     <div className="text-sm font-semibold text-gray-900">JBR Penthouse</div>
//                     <div className="text-xs text-gray-500">Budget: AED 8-10M • Sea View Required</div>
//                   </div>
//                   <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded">3 Matches</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Market Intelligence Center */}
//           <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-3 md:p-4 mb-4 md:mb-5">
//             <div className="text-xs font-semibold text-blue-900 mb-3">Market Intelligence Center</div>
//             <div className="grid grid-cols-2 gap-3">
//               <div>
//                 <div className="text-xs text-gray-500 mb-1">Active Scans</div>
//                 <div className="text-lg md:text-xl font-bold text-gray-900">14,208</div>
//                 <div className="text-xs text-gray-500">units monitored</div>
//               </div>
//               <div>
//                 <div className="text-xs text-gray-500 mb-1">ROI Performance</div>
//                 <div className="text-lg md:text-xl font-bold text-green-600">12.4%</div>
//                 <div className="text-xs text-green-600 font-semibold">+1.6% vs Q4</div>
//               </div>
//             </div>
//           </div>

//           {/* Trending Markets */}
//           <div className="mb-4 md:mb-5">
//             <div className="text-sm font-semibold text-gray-700 mb-2">Trending Markets</div>
//             <div className="space-y-2">
//               <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
//                 <div className="flex-1">
//                   <div className="text-xs font-semibold text-gray-900">Dubai Creek Harbour</div>
//                   <div className="text-xs text-gray-500 hidden md:block">145 new listings</div>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-xs font-bold text-green-600">+18.2%</div>
//                   <div className="text-xs text-gray-500">YoY</div>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
//                 <div className="flex-1">
//                   <div className="text-xs font-semibold text-gray-900">Business Bay</div>
//                   <div className="text-xs text-gray-500 hidden md:block">89 new listings</div>
//                 </div>
//                 <div className="text-right">
//                   <div className="text-xs font-bold text-blue-600">8.5%</div>
//                   <div className="text-xs text-gray-500">Yield</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Feature Cards */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
//             <div className="bg-white border border-gray-200 rounded-lg p-2 text-center hover:border-green-300 transition-all">
//               <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
//                 <svg className="w-3 h-3 md:w-4 md:h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="text-xs font-semibold text-gray-700">AI Hunter</div>
//             </div>

//             <div className="bg-white border border-gray-200 rounded-lg p-2 text-center hover:border-green-300 transition-all">
//               <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
//                 <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
//                 </svg>
//               </div>
//               <div className="text-xs font-semibold text-gray-700">Rental Mgmt</div>
//             </div>

//             <div className="bg-white border border-gray-200 rounded-lg p-2 text-center hover:border-green-300 transition-all">
//               <div className="w-6 h-6 md:w-8 md:h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
//                 <svg className="w-3 h-3 md:w-4 md:h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
//                 </svg>
//               </div>
//               <div className="text-xs font-semibold text-gray-700">Screening</div>
//             </div>

//             <div className="bg-white border border-gray-200 rounded-lg p-2 text-center hover:border-green-300 transition-all">
//               <div className="w-6 h-6 md:w-8 md:h-8 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-1">
//                 <svg className="w-3 h-3 md:w-4 md:h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
//                 </svg>
//               </div>
//               <div className="text-xs font-semibold text-gray-700">Alerts</div>
//             </div>
//           </div>

//           {/* CTA Button */}
//           <a
//             href="https://acqar-mvp.onrender.com/valuation"
//             className="block w-full bg-gradient-to-r from-green-600 to-green-700 text-white text-center py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg text-sm"
//           >
//             Join Waitlist
//           </a>
//         </div>
//       </div>
//     </div>
//   </section>
// );

// // Part 9: Competitive Comparison Table + FAQ Section

// const ComparisonTable = () => (
//   <section id="comparison" className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       {/* Header */}
//       <div className="text-center mb-12">
//         <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//           Why Industry Leaders Choose ACQAR
//         </h2>
//         <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//           See how we compare to traditional methods and competitors
//         </p>
//       </div>

//       {/* Comparison Table */}
//       <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
//                 <th className="px-4 md:px-6 py-4 text-left text-sm font-semibold">Features</th>
//                 <th className="px-4 md:px-6 py-4 text-center text-sm font-semibold">ACQAR</th>
//                 <th className="px-4 md:px-6 py-4 text-center text-sm font-semibold hidden md:table-cell">Competitor A</th>
//                 <th className="px-4 md:px-6 py-4 text-center text-sm font-semibold">Traditional</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {/* Row 1 */}
//               <tr className="hover:bg-gray-50">
//                 <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">AI-Powered Valuations</td>
//                 <td className="px-4 md:px-6 py-4 text-center">
//                   <svg className="w-6 h-6 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                   </svg>
//                 </td>
//                 <td className="px-4 md:px-6 py-4 text-center hidden md:table-cell">
//                   <svg className="w-6 h-6 text-yellow-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
//                   </svg>
//                 </td>
//                 <td className="px-4 md:px-6 py-4 text-center">
//                   <svg className="w-6 h-6 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                   </svg>
//                 </td>
//               </tr>

//               {/* Row 2 */}
//               <tr className="hover:bg-gray-50">
//                 <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">Real-time DLD Integration</td>
//                 <td className="px-4 md:px-6 py-4 text-center">
//                   <svg className="w-6 h-6 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                   </svg>
//                 </td>
//                 <td className="px-4 md:px-6 py-4 text-center hidden md:table-cell">
//                   <svg className="w-6 h-6 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                   </svg>
//                 </td>
//                 <td className="px-4 md:px-6 py-4 text-center">
//                   <svg className="w-6 h-6 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                   </svg>
//                 </td>
//               </tr>

//               {/* Row 3 */}
//               <tr className="hover:bg-gray-50">
//                 <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">Blockchain Verification</td>
//                 <td className="px-4 md:px-6 py-4 text-center">
//                   <svg className="w-6 h-6 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                   </svg>
//                 </td>
//                 <td className="px-4 md:px-6 py-4 text-center hidden md:table-cell">
//                   <svg className="w-6 h-6 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                   </svg>
//                 </td>
//                 <td className="px-4 md:px-6 py-4 text-center">
//                   <svg className="w-6 h-6 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                   </svg>
//                 </td>
//               </tr>

//               {/* Row 4 */}
//               <tr className="hover:bg-gray-50">
//                 <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">Response Time</td>
//                 <td className="px-4 md:px-6 py-4 text-center text-green-600 font-semibold text-sm">&lt;5 sec</td>
//                 <td className="px-4 md:px-6 py-4 text-center text-gray-600 text-sm hidden md:table-cell">~2 min</td>
//                 <td className="px-4 md:px-6 py-4 text-center text-gray-600 text-sm">2-5 days</td>
//               </tr>

//               {/* Row 5 */}
//               <tr className="hover:bg-gray-50">
//                 <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">Accuracy Rate</td>
//                 <td className="px-4 md:px-6 py-4 text-center text-green-600 font-semibold text-sm">98.5%</td>
//                 <td className="px-4 md:px-6 py-4 text-center text-gray-600 text-sm hidden md:table-cell">85-90%</td>
//                 <td className="px-4 md:px-6 py-4 text-center text-gray-600 text-sm">70-80%</td>
//               </tr>

//               {/* Row 6 */}
//               <tr className="hover:bg-gray-50">
//                 <td className="px-4 md:px-6 py-4 text-sm font-medium text-gray-900">Cost</td>
//                 <td className="px-4 md:px-6 py-4 text-center text-green-600 font-semibold text-sm">Free</td>
//                 <td className="px-4 md:px-6 py-4 text-center text-gray-600 text-sm hidden md:table-cell">AED 500+</td>
//                 <td className="px-4 md:px-6 py-4 text-center text-gray-600 text-sm">AED 2,000+</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   </section>
// );

// const FAQ = () => {
//   const faqs = [
//     {
//       question: "How accurate are ACQAR valuations?",
//       answer: "Our AI-powered valuations achieve 98.5% accuracy by analyzing 85+ data sources including real-time DLD transactions, market trends, and property-specific features. All valuations are backed by institutional-grade algorithms."
//     },
//     {
//       question: "What data sources does ACQAR use?",
//       answer: "We integrate with Dubai Land Department (DLD), RERA, multiple property portals, blockchain records, and historical transaction databases. Our AI continuously monitors 85+ data sources for real-time accuracy."
//     },
//     {
//       question: "How long does a valuation take?",
//       answer: "Most valuations are generated in under 5 seconds. Our AI processes millions of data points instantly to deliver institutional-grade accuracy without the wait."
//     },
//     {
//       question: "Is my data secure?",
//       answer: "Yes. We use bank-level encryption (AES-256), blockchain verification for critical data, and comply with international data protection standards. Your information is never shared without explicit consent."
//     },
//     {
//       question: "What payment methods do you accept?",
//       answer: "We accept all major credit cards, bank transfers, and cryptocurrency payments. Enterprise clients can arrange custom billing terms through our sales team."
//     }
//   ];

//   return (
//     <section id="faq" className="py-16 md:py-20 bg-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//             Frequently Asked Questions
//           </h2>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Everything you need to know about ACQAR
//           </p>
//         </div>

//         {/* FAQ Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
//           {/* Left: CTA Card */}
//           <div className="lg:sticky lg:top-8 h-fit">
//             <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
//               <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
//               <p className="text-blue-100 mb-6">
//                 Our team is here to help. Schedule a demo or reach out to our experts.
//               </p>
//               <div className="space-y-3">
//                 <a
//                   href="https://acqar-mvp.onrender.com/valuation"
//                   className="block w-full bg-white text-blue-600 text-center py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-md"
//                 >
//                   Schedule Demo
//                 </a>
//                 <a
//                   href="mailto:support@acqar.ai"
//                   className="block w-full bg-blue-500 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-400 transition-all"
//                 >
//                   Contact Support
//                 </a>
//               </div>
//             </div>
//           </div>

//           {/* Right: FAQ Items */}
//           <div className="space-y-4">
//             {faqs.map((faq, index) => (
//               <details key={index} className="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all cursor-pointer border border-gray-200">
//                 <summary className="flex items-start justify-between font-semibold text-gray-900 cursor-pointer list-none">
//                   <span className="flex-1 pr-4">{faq.question}</span>
//                   <svg className="w-5 h-5 text-blue-600 flex-shrink-0 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </summary>
//                 <p className="mt-4 text-gray-600 text-sm leading-relaxed">
//                   {faq.answer}
//                 </p>
//               </details>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// // Part 10: Final CTA + Footer

// const FinalCTA = () => (
//   <section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 to-white">
//     <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
//       <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl shadow-2xl overflow-hidden">
//         <div className="p-8 md:p-12 text-center">
//           <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
//             Ready to Experience Enterprise-Grade Property Intelligence?
//           </h2>
//           <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
//             Join 10,000+ investors who trust ACQAR for institutional-grade valuations, real-time insights, and blockchain-verified transparency.
//           </p>
          
//           {/* CTA Buttons */}
//           <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
//             <a
//               href="https://acqar-mvp.onrender.com/valuation"
//               className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg shadow-xl hover:bg-blue-50 transition-all transform hover:scale-105"
//             >
//               Start Free Valuation
//             </a>
//             <a
//               href="https://acqar-mvp.onrender.com/valuation"
//               className="w-full sm:w-auto px-8 py-4 bg-blue-500 text-white rounded-lg font-bold text-lg hover:bg-blue-400 transition-all border-2 border-white/30"
//             >
//               Schedule Demo
//             </a>
//           </div>

//           {/* Trust Badges */}
//           <div className="flex flex-wrap items-center justify-center gap-6 text-blue-100 text-sm">
//             <div className="flex items-center space-x-2">
//               <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//               </svg>
//               <span>No credit card required</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//               </svg>
//               <span>Enterprise-grade security</span>
//             </div>
//             <div className="flex items-center space-x-2">
//               <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
//                 <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                 <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//               </svg>
//               <span>24/7 support</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </section>
// );

// const Footer = () => (
//   <footer className="bg-white border-t border-gray-200 pt-12 md:pt-16 pb-8">
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       {/* Main Footer Content */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 md:mb-12">
//         {/* Brand Column */}
//         <div className="lg:col-span-1">
//           <div className="flex items-center space-x-2 mb-4">
//             <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
//               <span className="text-white font-bold text-lg">A</span>
//             </div>
//             <span className="text-xl font-bold text-gray-900">ACQAR</span>
//           </div>
//           <p className="text-gray-600 text-sm mb-6 leading-relaxed">
//             The intelligence layer for Dubai real estate. Empowering investors with real-time data, AI-driven valuations, and transaction transparency.
//           </p>
          
//           {/* Social Icons */}
//           <div className="flex items-center space-x-3">
//             <a href="https://linkedin.com/company/acqar" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all group">
//               <svg className="w-5 h-5 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
//               </svg>
//             </a>
//             <a href="https://instagram.com/acqar.ai" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all group">
//               <svg className="w-5 h-5 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
//               </svg>
//             </a>
//             <a href="https://twitter.com/acqar_ai" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all group">
//               <svg className="w-5 h-5 text-gray-600 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
//               </svg>
//             </a>
//           </div>
//         </div>

//         {/* Products Column */}
//         <div>
//           <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">Products</h3>
//           <ul className="space-y-3">
//             <li><a href="https://acqar-mvp.onrender.com/valuation" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">ValuCheck™</a></li>
//             <li><a href="https://acqar-mvp.onrender.com/valuation" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">DealLens™</a></li>
//             <li><a href="https://acqar-mvp.onrender.com/valuation" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">InvestIQ™</a></li>
//             <li><a href="https://acqar-mvp.onrender.com/valuation" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Certifi™</a></li>
//           </ul>
//         </div>

//         {/* Company Column */}
//         <div>
//           <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">Company</h3>
//           <ul className="space-y-3">
//             <li><a href="https://acqar-mvp.onrender.com/valuation" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">About Us</a></li>
//             <li><a href="https://acqar-mvp.onrender.com/valuation" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Case Studies</a></li>
//             <li><a href="https://acqar-mvp.onrender.com/valuation" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Careers</a></li>
//             <li><a href="https://acqar-mvp.onrender.com/valuation" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Contact</a></li>
//             <li><a href="https://acqar-mvp.onrender.com/valuation" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Press Kit</a></li>
//           </ul>
//         </div>

//         {/* Resources Column */}
//         <div>
//           <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">Resources</h3>
//           <ul className="space-y-3">
//             <li><a href="https://acqar-mvp.onrender.com/valuation" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Documentation</a></li>
//             <li><a href="https://acqar-mvp.onrender.com/valuation" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">API Reference</a></li>
//             <li><a href="https://acqar-mvp.onrender.com/valuation" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Support</a></li>
//             <li><a href="https://acqar-mvp.onrender.com/valuation" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Legal</a></li>
//             <li><a href="https://acqar-mvp.onrender.com/valuation" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">Privacy Policy</a></li>
//           </ul>
//         </div>
//       </div>

//       {/* Bottom Bar */}
//       <div className="border-t border-gray-200 pt-8">
//         <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
//           <div className="text-sm text-gray-600 text-center md:text-left">
//             © 2025 ACQAR Technologies FZE. All rights reserved.
//           </div>
//           <div className="flex items-center space-x-4 text-xs text-gray-500">
//             <div className="flex items-center space-x-1">
//               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//               <span>System Status: Nominal</span>
//             </div>
//             <span>•</span>
//             <span>Made with precision in Dubai, UAE 🇦🇪</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   </footer>
// );


// // const PassportMockup = () => (<section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-8 md:mb-10"><h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">ACQAR Passport™</h2><p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">A detailed digital dossier that builds trust and accelerates transactions.</p></div></div></section>);
// // const WalletMockup = () => (<section className="py-12 md:py-16 bg-white"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-8 md:mb-10"><h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">ACQAR Wallet™</h2></div></div></section>);
// // const ChauffeurMockup = () => (<section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-8 md:mb-10"><h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">ACQAR Chauffeur™</h2></div></div></section>);
// // const ScoutMockup = () => (<section className="py-12 md:py-16 bg-white"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-8 md:mb-10"><h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">ACQAR Scout™</h2></div></div></section>);
// // const ComparisonTable = () => (<section id="comparison" className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Industry Leaders Choose ACQAR</h2></div></div></section>);
// // const FAQ = () => (<section id="faq" className="py-16 md:py-20 bg-white"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2></div></div></section>);
// // const FinalCTA = () => (<section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 to-white"><div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"><div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl shadow-2xl overflow-hidden"><div className="p-8 md:p-12 text-center"><h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Experience Enterprise-Grade Property Intelligence?</h2></div></div></div></section>);
// // const Footer = () => (<footer className="bg-white border-t border-gray-200 pt-12 md:pt-16 pb-8"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center text-sm text-gray-600">© 2025 ACQAR Technologies FZE. All rights reserved.</div></div></footer>);

// export default LandingPage;


import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; }

  :root {
    --primary: #2B2B2B;
    --accent-copper: #B87333;
    --gray-light: #D4D4D4;
    --gray-medium: #B3B3B3;
    --bg-off-white: #FAFAFA;
    --footer-bg: #F5F5F5;
  }

  .mat-icon {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 1.25rem;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    user-select: none;
  }
  .mat-icon.fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .mat-icon.sm { font-size: 1rem; }
  .mat-icon.xs { font-size: 0.875rem; }
  .mat-icon.lg { font-size: 1.5rem; }
  .mat-icon.xl { font-size: 2.25rem; }

  .architectural-lines {
    background-image: radial-gradient(#2B2B2B 0.5px, transparent 0.5px);
    background-size: 40px 40px;
    opacity: 0.05;
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .gradient-text {
    background: linear-gradient(to right, #B87333, #2B2B2B);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .soft-shadow {
    box-shadow: 0 20px 50px -12px rgba(43,43,43,0.15);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }

  /* Layout helpers */
  .container { max-width: 80rem; margin: 0 auto; padding: 0 1.5rem; }
  .container-sm { max-width: 64rem; margin: 0 auto; padding: 0 1.5rem; }
  .container-xs { max-width: 56rem; margin: 0 auto; padding: 0 1.5rem; }

  /* ---------------------------
     ✅ RESPONSIVE (ADDED ONLY)
     --------------------------- */
  html, body { width: 100%; overflow-x: hidden; }
  img, video { max-width: 100%; height: auto; }

  .mobile-menu-btn {
    display: none;
    width: 42px;
    height: 42px;
    border-radius: 10px;
    border: 1px solid rgba(212,212,212,0.6);
    background: rgba(255,255,255,0.9);
    cursor: pointer;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s, color 0.2s;
    color: var(--primary);
  }
  .mobile-menu-btn:hover { border-color: var(--accent-copper); color: var(--accent-copper); }

  .mobile-drawer {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 100;
  }
  .mobile-drawer .backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.35);
  }
  .mobile-drawer .panel {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: min(88vw, 360px);
    background: #fff;
    border-left: 1px solid rgba(212,212,212,0.4);
    box-shadow: -20px 0 50px rgba(0,0,0,0.12);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  @media (max-width: 980px) {
    .desktop-nav { display: none !important; }
    .desktop-cta { display: none !important; }
    .mobile-menu-btn { display: inline-flex; }

    .hero-grid {
      grid-template-columns: 1fr !important;
      gap: 32px !important;
    }
    .hero-left { max-width: 100% !important; }
    .hero-title { font-size: 3.2rem !important; }
  }

  @media (max-width: 640px) {
    .container { padding: 0 1rem; }
    .hero-section { padding-top: 24px !important; padding-bottom: 64px !important; min-height: auto !important; }
    .hero-title { font-size: 2.5rem !important; line-height: 1.1 !important; }
    .hero-sub { font-size: 1rem !important; }

    .hero-cta-row {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 12px !important;
    }
    .hero-cta-row > * { width: 100% !important; }
    .hero-primary-btn { justify-content: center !important; width: 100% !important; padding: 16px 18px !important; }

    .trust-bar { gap: 14px !important; padding: 12px !important; }

    .property-card { padding: 20px !important; border-radius: 14px !important; }
    .property-value { font-size: 1.85rem !important; }

    .property-badge {
      position: static !important;
      margin-top: 14px !important;
      width: 100% !important;
      max-width: 100% !important;
      justify-content: flex-start !important;
    }
  }

  @media (max-width: 1100px) {
    .steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 640px) {
    .steps-grid { grid-template-columns: 1fr !important; }
  }

  @media (max-width: 1024px) {
    .testimonials-top { grid-template-columns: 1fr !important; gap: 28px !important; margin-bottom: 56px !important; }
    .blur-card { display: none !important; }
    .testimonials-center { padding: 0 !important; }
  }

  @media (max-width: 840px) {
    .stats-bar { grid-template-columns: 1fr !important; gap: 18px !important; text-align: left !important; }
    .stats-item { border-right: none !important; padding-right: 0 !important; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; }
    .stats-item:last-child { border-bottom: none !important; padding-bottom: 0 !important; }
  }

  @media (max-width: 1100px) {
    .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
  }
  @media (max-width: 640px) {
    .footer-grid { grid-template-columns: 1fr !important; }
    .footer-bottom { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; }
  }

  /* ---------------------------
     ✅ NEW: MOVING TESTIMONIAL STRIP
     (ADDED ONLY — does not break existing UI)
     --------------------------- */
  .marquee-wrap{
    position: relative;
    overflow: hidden;
    border-top: 1px solid rgba(212,212,212,0.2);
    border-bottom: 1px solid rgba(212,212,212,0.2);
    background: #fff;
  }
  .marquee-inner{
    display: flex;
    gap: 18px;
    width: max-content;
    padding: 18px 0;
    animation: marquee-left 32s linear infinite;
  }
  .marquee-track{
    display: flex;
    gap: 18px;
    align-items: stretch;
  }
  .marquee-card{
    width: 360px;
    max-width: calc(100vw - 3rem);
    background: var(--bg-off-white);
    border: 1px solid rgba(212,212,212,0.35);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .marquee-card:hover .marquee-quote{ color: rgba(43,43,43,0.8); }
  .marquee-quote{
    font-size: 0.875rem;
    line-height: 1.6;
    color: rgba(43,43,43,0.65);
    font-style: italic;
  }
  .marquee-person{
    display: flex;
    align-items: center;
    gap: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(212,212,212,0.28);
  }
  .marquee-avatar{
    width: 42px;
    height: 42px;
    border-radius: 999px;
    object-fit: cover;
    border: 2px solid #fff;
    flex-shrink: 0;
  }
  .marquee-name{
    font-size: 0.875rem;
    font-weight: 800;
    color: var(--primary);
    line-height: 1.2;
  }
  .marquee-role{
    font-size: 0.75rem;
    color: rgba(43,43,43,0.45);
    font-weight: 600;
    margin-top: 2px;
  }

  .marquee-fade-left,
  .marquee-fade-right{
    pointer-events: none;
    position: absolute;
    top: 0; bottom: 0;
    width: 72px;
    z-index: 2;
  }
  .marquee-fade-left{
    left: 0;
    background: linear-gradient(to right, #fff 0%, rgba(255,255,255,0) 100%);
  }
  .marquee-fade-right{
    right: 0;
    background: linear-gradient(to left, #fff 0%, rgba(255,255,255,0) 100%);
  }

  @keyframes marquee-left {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  @media (prefers-reduced-motion: reduce){
    .marquee-inner{ animation: none !important; }
  }
  @media (max-width: 640px){
    .marquee-inner{ animation-duration: 44s; }
    .marquee-card{ width: 310px; }
    .marquee-fade-left,.marquee-fade-right{ width: 42px; }
  }
`;

function Icon({ name, className = "", fill = false, size = "" }) {
  const sizeClass =
    size === "sm"
      ? " sm"
      : size === "xs"
      ? " xs"
      : size === "lg"
      ? " lg"
      : size === "xl"
      ? " xl"
      : "";
  return (
    <span
      className={`mat-icon${fill ? " fill" : ""}${sizeClass}${
        className ? " " + className : ""
      }`}
    >
      {name}
    </span>
  );
}

/* ── HEADER ── */
function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname;

  const [open, setOpen] = useState(false);

  const navItems = [
    { label: "Products", path: "/" },
    { label: "Pricing", path: "/pricing" },
    { label: "Resources", path: "/resources" },
    { label: "About", path: "/about" },
  ];

  useEffect(() => {
    setOpen(false);
  }, [current]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          width: "100%",
          borderBottom: "1px solid rgba(212,212,212,0.3)",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          className="container"
          style={{
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              minWidth: 140,
            }}
            onClick={() => navigate("/")}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: "var(--primary)",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="architecture" className="sm" />
            </div>
            <span
              style={{
                fontSize: "1.125rem",
                fontWeight: 800,
                letterSpacing: "0.05em",
                color: "var(--primary)",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              ACQAR
            </span>
          </div>

          <nav className="desktop-nav" style={{ display: "flex", gap: 40, alignItems: "center" }}>
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.path)}
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: current === item.path ? "var(--accent-copper)" : "var(--primary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-copper)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color =
                    current === item.path ? "var(--accent-copper)" : "var(--primary)")
                }
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="desktop-cta" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--primary)",
                padding: "8px 16px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-copper)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--primary)")}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => navigate("/valuation")}
              style={{
                background: "var(--accent-copper)",
                color: "#fff",
                padding: "10px 24px",
                borderRadius: 8,
                fontSize: "0.875rem",
                fontWeight: 700,
                border: "1px solid var(--accent-copper)",
                cursor: "pointer",
                letterSpacing: "0.04em",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#a6682e";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(184,115,51,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--accent-copper)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Get Started
            </button>
          </div>

          <button
            type="button"
            className="mobile-menu-btn"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" />
          </button>
        </div>
      </header>

      {open && (
        <div className="mobile-drawer" style={{ display: "block" }}>
          <div className="backdrop" onClick={() => setOpen(false)} />
          <div className="panel" role="dialog" aria-modal="true" aria-label="Mobile menu">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    background: "var(--primary)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="architecture" className="sm" />
                </div>
                <div style={{ fontWeight: 900, letterSpacing: "0.05em" }}>ACQAR</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  border: "1px solid rgba(212,212,212,0.6)",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <Icon name="close" />
              </button>
            </div>

            <div style={{ height: 1, background: "rgba(212,212,212,0.5)", margin: "4px 0" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.path)}
                  style={{
                    textAlign: "left",
                    padding: "12px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(212,212,212,0.5)",
                    background: current === item.path ? "rgba(184,115,51,0.08)" : "#fff",
                    color: current === item.path ? "var(--accent-copper)" : "var(--primary)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div style={{ height: 1, background: "rgba(212,212,212,0.5)", margin: "4px 0" }} />

            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(212,212,212,0.6)",
                background: "#fff",
                fontWeight: 800,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => navigate("/valuation")}
              style={{
                width: "100%",
                padding: "14px 14px",
                borderRadius: 12,
                border: "1px solid var(--accent-copper)",
                background: "var(--accent-copper)",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              Get Started <Icon name="arrow_forward" />
            </button>

            <div style={{ marginTop: "auto", fontSize: "0.75rem", color: "rgba(43,43,43,0.5)", lineHeight: 1.6 }}>
              © 2025 ACQARLABS L.L.C-FZ
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── HERO ── */
function Hero() {
  const navigate = useNavigate();
  return (
    <section
      className="hero-section"
      style={{
        position: "relative",
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        paddingTop: 40,
        paddingBottom: 80,
        overflow: "hidden",
      }}
    >
      <div className="architectural-lines" />

      <div
        className="container hero-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 64,
          alignItems: "center",
          flexGrow: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left */}
        <div className="hero-left" style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 560 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 12px",
              background: "rgba(184,115,51,0.1)",
              border: "1px solid rgba(184,115,51,0.2)",
              borderRadius: 9999,
              width: "fit-content",
            }}
          >
            <span
              className="pulse"
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--accent-copper)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: "0.625rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--accent-copper)",
              }}
            >
              Where Dreams Meet Data
            </span>
          </div>

          <h2
            className="hero-title"
            style={{
              fontSize: "4.5rem",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: "var(--primary)",
            }}
          >
            See The Future. <br />
            <span className="gradient-text">Invest With Certainty.</span>
          </h2>

          <p className="hero-sub" style={{ fontSize: "1.125rem", color: "rgba(43,43,43,0.6)", lineHeight: 1.7 }}>
            Enterprise-grade property intelligence for modern investors. Institutional accuracy,
            real-time data, and instant transparency.
          </p>

          <div className="hero-cta-row" style={{ display: "flex", flexDirection: "row", gap: 16, alignItems: "center" }}>
            <button
              onClick={() => navigate("/valuation")}
              className="hero-primary-btn"
              style={{
                background: "var(--accent-copper)",
                color: "#fff",
                padding: "20px 32px",
                borderRadius: 12,
                fontSize: "1rem",
                fontWeight: 700,
                border: "1px solid var(--accent-copper)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 20px 40px rgba(184,115,51,0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              Get Your Free Valuation
              <Icon name="arrow_forward" />
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 16px",
                border: "1px solid var(--gray-light)",
                borderRadius: 12,
                flexWrap: "nowrap",
              }}
            >
              <div style={{ display: "flex" }}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1AfKa0TeL3cutDm2oORjvyJfaZ4sWKjqoymij-VUfwqkb45DX_8i2TZxTL5iJwibp3eJhiolBRUnVXZJLyLX6ngOHCGgzJySTVCswUzMNX1SXHMpZaqBWe94zpXJjaCSWAFGAHlvIe2TLAgoei80lt5n1ecefPDbNqUPHJ2d3kDXpU3i6tSWHaa1SxdUWHu12D1w2VM1cggHgyKK3zb1QAnEf7D-QPEiZK5hKc9TxAPyVm9ofoWHgwoFP68S1Wzs-HgyJ_KEzQfw"
                  alt=""
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    marginRight: -8,
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6t4ms24nlSJb-UnR35BnGcMuHPPgXWLkF3m44dIr8GjwERYw9AtbnnI1EYqkXR3iECnKAyYFkFNau6QJGMOJCJHngAyyXIgjJcUF_PZPb-h41AYfwYA5es1lWZyctwVgdWK3HxpAHArohK4Pp4xjd0YSW_h39WyReIqHcZl8XlOevIqbNEFV0NIWvXS_SSHPJGqNV3ofaJu4pp2BfXm9Q1AlrS9ix-UJq7kjpP8-mHnNMSrvMpf0JeOIrGzH_8GkB0N3xLu_rQ3I"
                  alt=""
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)" }}>2,400+</p>
                <p style={{ fontSize: "0.75rem", color: "rgba(43,43,43,0.4)" }}>Active Investors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Property Card */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: -16,
              background: "rgba(43,43,43,0.05)",
              borderRadius: 32,
              filter: "blur(32px)",
              transition: "background 0.3s",
            }}
          />
          <div
            className="soft-shadow property-card"
            style={{
              position: "relative",
              background: "#fff",
              border: "1px solid rgba(212,212,212,0.3)",
              borderRadius: 16,
              padding: 32,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 32,
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    background: "rgba(43,43,43,0.1)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="analytics" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    Palm Jumeirah Villa
                  </p>
                  <p style={{ fontSize: "0.75rem", color: "rgba(43,43,43,0.4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    ID: ACQ-7721-DUBAI
                  </p>
                </div>
              </div>
              <span
                style={{
                  padding: "4px 12px",
                  background: "var(--gray-light)",
                  borderRadius: 9999,
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                }}
              >
                Live Analysis
              </span>
            </div>

            <div style={{ marginBottom: 24 }}>
              <p
                style={{
                  fontSize: "0.625rem",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "rgba(43,43,43,0.4)",
                  letterSpacing: "0.15em",
                  marginBottom: 4,
                }}
              >
                Estimated Value
              </p>
              <h3 className="property-value" style={{ fontSize: "2.25rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.02em" }}>
                AED 4,250,000
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div style={{ padding: 16, background: "var(--bg-off-white)", borderRadius: 12 }}>
                <p style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 700, color: "rgba(43,43,43,0.4)", marginBottom: 8 }}>
                  Investment Score
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: "1.5rem", fontWeight: 700 }}>87</span>
                  <span style={{ fontSize: "0.75rem", color: "rgba(43,43,43,0.4)", fontWeight: 500 }}>/ 100</span>
                </div>
              </div>
              <div style={{ padding: 16, background: "var(--bg-off-white)", borderRadius: 12 }}>
                <p style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 700, color: "rgba(43,43,43,0.4)", marginBottom: 8 }}>
                  Market Volatility
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>Low</span>
                  <Icon name="trending_down" size="sm" />
                </div>
              </div>
            </div>

            <div
              style={{
                height: 96,
                width: "100%",
                background: "var(--bg-off-white)",
                borderRadius: 8,
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-end",
                padding: "0 4px",
                gap: 4,
                marginBottom: 24,
              }}
            >
              {[
                ["40%", "var(--gray-light)"],
                ["55%", "var(--gray-light)"],
                ["45%", "var(--gray-light)"],
                ["70%", "var(--gray-medium)"],
                ["60%", "rgba(184,115,51,0.6)"],
                ["85%", "rgba(43,43,43,0.6)"],
                ["95%", "var(--primary)"],
              ].map(([h, bg], i) => (
                <div key={i} style={{ flex: 1, height: h, background: bg, borderRadius: "2px 2px 0 0" }} />
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 16,
                borderTop: "1px solid rgba(212,212,212,0.3)",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="history" size="sm" />
                <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "rgba(43,43,43,0.4)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                  Generated in 5s
                </span>
              </div>
              <button
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--primary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "color 0.2s",
                  padding: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-copper)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--primary)")}
              >
                Download PDF <Icon name="download" size="sm" />
              </button>
            </div>
          </div>

          <div
            className="property-badge"
            style={{
              position: "absolute",
              bottom: -24,
              right: -24,
              background: "#fff",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              border: "1px solid rgba(212,212,212,0.3)",
              padding: 16,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 12,
              maxWidth: 180,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--accent-copper)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name="verified" size="xs" />
            </div>
            <p style={{ fontSize: "0.625rem", fontWeight: 500, lineHeight: 1.4, color: "var(--primary)" }}>
              Institutional Quality RICS-Standard AI
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 48, marginBottom: 32, position: "relative", zIndex: 1 }}>
        <div
          className="trust-bar"
          style={{
            border: "1px solid rgba(147,197,253,0.5)",
            background: "rgba(239,246,255,0.3)",
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 32,
          }}
        >
          {[
            ["check_circle", "100% Independent"],
            ["check_circle", "10,000+ Valuations"],
            ["check_circle", "RICS-Aligned"],
          ].map(([icon, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name={icon} size="lg" />
              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--primary)", letterSpacing: "-0.01em" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── HOW IT WORKS ── */
function HowItWorks() {
  const navigate = useNavigate();
  const steps = [
    { icon: "feed", num: "1", title: "Enter Details", desc: "Property location, size, and features.", tag: "INPUT DATA" },
    { icon: "memory", num: "2", title: "AI Analysis", desc: "Comp selection, market signals, RICS standards", tag: "PROCESSING ENGINE" },
    { icon: "auto_awesome", num: "3", title: "Instant Valuation", desc: "Accurate value, confidence score, hidden costs", tag: "60 SECONDS", featured: true },
    { icon: "file_download", num: "4", title: "Actionable Report", desc: "Investment grade, shareable PDF, API-ready!", tag: "VALUE OUTPUT" },
  ];

  return (
    <section style={{ padding: "96px 0", background: "var(--bg-off-white)" }}>
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: 512, margin: "0 auto 64px" }}>
          <h3 style={{ fontSize: "1.875rem", fontWeight: 900, color: "var(--primary)", marginBottom: 16 }}>
            How TruValu™ Works
          </h3>
          <p style={{ color: "rgba(43,43,43,0.6)" }}>
            From property input to investment intelligence in 60 seconds.
          </p>
        </div>

        <div style={{ marginBottom: 80 }}>
          <div
            style={{
              position: "relative",
              maxWidth: "56rem",
              margin: "0 auto",
              aspectRatio: "16/9",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
              background: "var(--primary)",
              cursor: "pointer",
            }}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7qkQArw2TmVGHNN9bcf75S4yDTxSbb9X-TVkQ26MW3akEDTfYgjcPNAMwG0SkcAG8hSo9OwHLiOE94qYlTvYTFMlaoEZG2KFf7HYeXlo9jc2_nMQde_AR3wiRHtiEFrFHqytfb2XyHe3friA06okLMLV8xm2Oit_9jwxLue01sF6BEh6WrXRZbTV2GWkZyyvk_jcA3pwdJZvF65ddn9KLcEcirbxK6jPC2I0AkMIwxtpevnSSzfsJNaFGb2aJJWdiuwnxgkbMzq0"
              alt="Dubai skyline"
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }}
            />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(12px)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    background: "#fff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  }}
                >
                  <Icon name="play_arrow" fill size="xl" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 64 }}>
          {steps.map((step) => (
            <div
              key={step.num}
              style={{
                background: "#fff",
                padding: 32,
                borderRadius: 16,
                border: step.featured ? "1px solid var(--accent-copper)" : "1px solid var(--gray-light)",
                boxShadow: step.featured ? "0 0 0 4px rgba(184,115,51,0.05)" : "none",
                position: "relative",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!step.featured) e.currentTarget.style.borderColor = "var(--accent-copper)";
              }}
              onMouseLeave={(e) => {
                if (!step.featured) e.currentTarget.style.borderColor = "var(--gray-light)";
              }}
            >
              {step.featured && (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: "rgba(184,115,51,0.1)",
                    color: "var(--accent-copper)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: "0.5rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Instant
                </div>
              )}
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: step.featured ? "var(--primary)" : "rgba(212,212,212,0.3)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 24,
                }}
              >
                <Icon name={step.icon} />
              </div>
              <h5 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: 8 }}>
                {step.num}. {step.title}
              </h5>
              <p style={{ fontSize: "0.875rem", color: "rgba(43,43,43,0.6)", lineHeight: 1.6, fontWeight: step.featured ? 600 : 400 }}>
                {step.desc}
              </p>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f3f3f3" }}>
                <span
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: step.featured ? "var(--accent-copper)" : "rgba(43,43,43,0.4)",
                  }}
                >
                  {step.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/valuation")}
            style={{
              background: "var(--accent-copper)",
              color: "#fff",
              padding: "20px 40px",
              borderRadius: 12,
              fontSize: "1.125rem",
              fontWeight: 700,
              border: "1px solid var(--accent-copper)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(184,115,51,0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "none";
            }}
          >
            Get My Free Valuation Now
            <Icon name="arrow_forward" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── NEW: MOVING TESTIMONIALS STRIP ── */
function MovingTestimonials() {
  const testimonials = useMemo(
    () => [
      {
        name: "Ahmed Al Mansouri",
        role: "Chairman, ALM International",
        quote:
          "ACQAR provides the kind of certainty usually reserved for institutional funds. In 60 seconds, I had a valuation that matched my appraiser's 5-day study.",
        img: "https://picsum.photos/200/200?random=10",
      },
      {
        name: "Sarah J.",
        role: "Private Wealth Manager",
        quote:
          "The precision is unmatched in the Dubai market. It's now our primary tool for quarterly portfolio rebalancing and client reporting.",
        img: "https://picsum.photos/200/200?random=11",
      },
      {
        name: "Julian Chen",
        role: "PE Associate, Global Capital",
        quote:
          "We've reduced our appraisal timelines by 80% using TruValu™ technology. The market speed requires tools like this to close high-ticket deals.",
        img: "https://picsum.photos/200/200?random=12",
      },
      {
        name: "Elena Rodriguez",
        role: "Luxury Property Investor",
        quote:
          "Finally, a platform that understands the nuances of prime real estate. The DealLens analysis saved me from a significantly overpriced acquisition.",
        img: "https://picsum.photos/200/200?random=13",
      },
      {
        name: "Marcus Thorne",
        role: "Portfolio Director",
        quote:
          "Institutional-grade data at your fingertips. ACQAR has fundamentally changed how we evaluate exit opportunities in the Palm Jumeirah area.",
        img: "https://picsum.photos/200/200?random=14",
      },
      {
        name: "Fatima Al Sayed",
        role: "Real Estate Developer",
        quote:
          "The RICS-aligned intelligence gives our international investors the confidence they need in the Dubai market. Indispensable tool.",
        img: "https://picsum.photos/200/200?random=15",
      },
    ],
    []
  );

  // duplicate list to create a seamless loop
  const loop = [...testimonials, ...testimonials];

  return (
    <section className="marquee-wrap">
      <div className="container" style={{ paddingTop: 28, paddingBottom: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(43,43,43,0.45)" }}>
            Trusted by investors & institutions
          </p>
        </div>
      </div>

      <div className="marquee-fade-left" />
      <div className="marquee-fade-right" />

      <div className="marquee-inner" aria-label="Testimonials marquee">
        <div className="marquee-track">
          {loop.map((t, idx) => (
            <div key={`${t.name}-${idx}`} className="marquee-card">
              <div className="marquee-quote">“{t.quote}”</div>
              <div className="marquee-person">
                <img className="marquee-avatar" src={t.img} alt={t.name} />
                <div style={{ minWidth: 0 }}>
                  <div className="marquee-name" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {t.name}
                  </div>
                  <div className="marquee-role" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {t.role}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 2, color: "var(--accent-copper)" }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Icon key={i} name="star" fill size="xs" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── TESTIMONIALS (existing section stays as-is) ── */
function Testimonials() {
  return (
    <section style={{ padding: "96px 0", background: "#fff", borderTop: "1px solid rgba(212,212,212,0.2)", borderBottom: "1px solid rgba(212,212,212,0.2)" }}>
      <div className="container">
        <div className="testimonials-top" style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 48, alignItems: "center", marginBottom: 96 }}>
          <div className="blur-card" style={{ opacity: 0.5, filter: "blur(1px)" }}>
            <div style={{ padding: 24, background: "var(--bg-off-white)", borderRadius: 16, border: "1px solid rgba(212,212,212,0.3)" }}>
              <p style={{ fontSize: "0.875rem", fontStyle: "italic", color: "rgba(43,43,43,0.6)", marginBottom: 16, lineHeight: 1.6 }}>
                "The precision is unmatched in the Dubai market. It's my primary tool for portfolio rebalancing."
              </p>
              <p style={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--primary)" }}>Sarah J.</p>
              <p style={{ fontSize: "0.625rem", color: "rgba(43,43,43,0.4)" }}>Wealth Manager</p>
            </div>
          </div>

          <div className="testimonials-center" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 16px" }}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhZrEd_Fibtk9RMe0E0RDZ4eofsU2mVa4fctl-_f36JsDJ_loUt17b4WeVeSWNZ2zu4N2_rI2h9A3fzS21v5McPWxnQ1uRt3v2apIpIkGbDgMTPiBUAGs9R0JneUDHPBLxIOj525LGdgX0fVXyGOSyQyhNTTXU5nI3SoLIlODJjPYC-WkVUm7CqV4BC0JnKoYx5ziir36TS5UIkABtuSbeND29kZCoSk0DjjviTovoHZ2ezk_IULnvMaf0JFo3voosC_qYBu3QR3g"
              alt="Ahmed Al Mansouri"
              style={{ width: 80, height: 80, borderRadius: "50%", border: "4px solid var(--bg-off-white)", marginBottom: 24, objectFit: "cover" }}
            />
            <div style={{ display: "flex", gap: 4, marginBottom: 16, color: "var(--accent-copper)", flexWrap: "wrap", justifyContent: "center" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Icon key={i} name="star" fill size="sm" />
              ))}
            </div>
            <h4 style={{ fontSize: "1.5rem", fontWeight: 700, fontStyle: "italic", color: "var(--primary)", marginBottom: 24, lineHeight: 1.4 }}>
              "ACQAR provides the kind of certainty usually reserved for institutional funds. In 60 seconds, I had a valuation that matched my appraiser's 5-day study."
            </h4>
            <div>
              <p style={{ fontWeight: 700, color: "var(--primary)" }}>Ahmed Al Mansouri</p>
              <p style={{ fontSize: "0.875rem", color: "rgba(43,43,43,0.6)" }}>Chairman, ALM International</p>
            </div>
          </div>

          <div className="blur-card" style={{ opacity: 0.5, filter: "blur(1px)" }}>
            <div style={{ padding: 24, background: "var(--bg-off-white)", borderRadius: 16, border: "1px solid rgba(212,212,212,0.3)" }}>
              <p style={{ fontSize: "0.875rem", fontStyle: "italic", color: "rgba(43,43,43,0.6)", marginBottom: 16, lineHeight: 1.6 }}>
                "We've reduced our appraisal timelines by 80% using TruValu™ technology."
              </p>
              <p style={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--primary)" }}>Julian Chen</p>
              <p style={{ fontSize: "0.625rem", color: "rgba(43,43,43,0.4)" }}>PE Associate</p>
            </div>
          </div>
        </div>

        <div
          className="stats-bar"
          style={{
            background: "var(--primary)",
            borderRadius: 24,
            padding: 40,
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 32,
            textAlign: "center",
            border: "1px solid rgba(184,115,51,0.2)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
          }}
        >
          {[
            ["10,000+", "Valuations Performed"],
            ["4.9 / 5", "Investor Rating"],
            ["AED 500M+", "Capital Analyzed"],
          ].map(([num, label], i) => (
            <div
              key={label}
              className="stats-item"
              style={{
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none",
                paddingRight: i < 2 ? 32 : 0,
              }}
            >
              <h6 style={{ fontSize: "2.25rem", fontWeight: 900, color: "#fff", marginBottom: 8, textTransform: "uppercase" }}>{num}</h6>
              <p style={{ fontSize: "0.625rem", color: "var(--accent-copper)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>{label}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 64, display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 48, filter: "grayscale(1)", opacity: 0.4 }}>
          {["RICS", "DLD", "RERA", "EMIRATES", "DIFC"].map((name) => (
            <div
              key={name}
              style={{
                height: 40,
                width: 96,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "1.25rem",
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA SECTION ── */
function CTASection() {
  return (
    <section style={{ padding: "128px 0", position: "relative", overflow: "hidden", background: "#fff" }}>
      <div className="architectural-lines" />
      <div className="container-xs" style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <h2 style={{ fontSize: "3rem", fontWeight: 900, color: "var(--primary)", marginBottom: 32, lineHeight: 1.2 }}>
          Ready to See Your Property's <br />
          <span style={{ color: "var(--accent-copper)" }}>True Value?</span>
        </h2>
        <p style={{ fontSize: "1.125rem", color: "rgba(43,43,43,0.6)", marginBottom: 48, maxWidth: 512, margin: "0 auto 48px", lineHeight: 1.7 }}>
          Join 10,000+ property owners who discovered their property's complete investment potential with ACQAR's TruValu™ analysis.
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          <button
            style={{
              background: "var(--accent-copper)",
              color: "#fff",
              padding: "20px 40px",
              borderRadius: 12,
              fontSize: "1.125rem",
              fontWeight: 700,
              border: "1px solid var(--accent-copper)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(184,115,51,0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "none";
            }}
          >
            Get My Free Valuation Now
            <Icon name="arrow_forward" />
          </button>
          <button
            style={{
              background: "#fff",
              color: "var(--primary)",
              border: "1px solid var(--gray-light)",
              padding: "20px 40px",
              borderRadius: 12,
              fontSize: "1.125rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-off-white)";
              e.currentTarget.style.borderColor = "var(--accent-copper)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "var(--gray-light)";
            }}
          >
            Talk to an Expert
          </button>
        </div>
        <p style={{ marginTop: 32, fontSize: "0.75rem", color: "rgba(43,43,43,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>
          Results in 60 Seconds • 100% Secure • No Credit Card Required
        </p>
      </div>
    </section>
  );
}

/* ── FOOTER ── */
function Footer() {
  const product = ["TruValu™ Products", "ValuCheck™ (FREE)", "DealLens™", "InvestIQ™", "CertiFi™", "Compare Tiers"];
  const company = ["About ACQAR", "How It Works", "Pricing", "Contact Us", "Partners", "Press Kit"];
  const resources = ["Help Center", "Market Reports", "Blog Column 5", "Comparisons"];
  const comparisons = ["vs Bayut TruEstimate", "vs Property Finder", "vs Traditional Valuers", "Why ACQAR?"];

  const linkStyle = {
    fontSize: "0.75rem",
    color: "rgba(43,43,43,0.6)",
    fontWeight: 500,
    cursor: "pointer",
    transition: "color 0.2s",
    listStyle: "none",
  };

  return (
    <footer style={{ background: "var(--bg-off-white)", borderTop: "1px solid #e5e7eb", paddingTop: 80, paddingBottom: 40 }}>
      <div className="container footer-grid" style={{ display: "grid", gridTemplateColumns: "3fr 2fr 2fr 2fr 3fr", gap: 48, marginBottom: 80 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <div style={{ width: 24, height: 24, background: "var(--primary)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="architecture" size="xs" />
            </div>
            <span style={{ fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--primary)" }}>ACQAR</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "rgba(43,43,43,0.6)", lineHeight: 1.7, marginBottom: 24 }}>
            The world's first AI-powered property intelligence platform for Dubai real estate. Independent, instant, investment-grade.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, background: "#fff", border: "1px solid #f3f4f6", borderRadius: 8, width: "fit-content", marginBottom: 24 }}>
            <Icon name="verified" size="sm" />
            <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "rgba(43,43,43,0.8)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              RICS-Aligned Intelligence
            </span>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {["public", "alternate_email"].map((icon) => (
              <a
                key={icon}
                href="#"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(43,43,43,0.4)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent-copper)";
                  e.currentTarget.style.borderColor = "var(--accent-copper)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(43,43,43,0.4)";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                <Icon name={icon} size="sm" />
              </a>
            ))}
          </div>
        </div>

        {[
          ["PRODUCT", product],
          ["COMPANY", company],
          ["RESOURCES", resources],
          ["COMPARISONS", comparisons],
        ].map(([title, items]) => (
          <div key={title}>
            <h6 style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: 24, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--primary)" }}>
              {title}
            </h6>
            <ul style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {items.map((item) => (
                <li
                  key={item}
                  style={linkStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-copper)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(43,43,43,0.6)")}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container footer-bottom" style={{ paddingTop: 32, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <p style={{ fontSize: "0.625rem", fontWeight: 700, color: "rgba(43,43,43,0.4)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            © 2025 ACQARLABS L.L.C-FZ. All rights reserved.
          </p>
          <p style={{ fontSize: "0.5625rem", color: "rgba(43,43,43,0.3)", textTransform: "uppercase", marginTop: 2 }}>
            TruValu™ is a registered trademark.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
          {["Legal links", "Terms", "Privacy", "Cookies", "Security"].map((link) => (
            <a
              key={link}
              href="#"
              style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                color: "rgba(43,43,43,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(43,43,43,0.4)")}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ── APP ── */
export default function App() {
  return (
    <>
      <style>{styles}</style>
      <div style={{ background: "#fff", color: "var(--primary)", fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
        <Header />
        <Hero />
        <HowItWorks />

        {/* ✅ ADDED: moving testimonials strip (new list) */}
        <MovingTestimonials />

        {/* Existing section stays (your original testimonials block) */}
        <Testimonials />

        <CTASection />
        <Footer />
      </div>
    </>
  );
}
