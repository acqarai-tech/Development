import React, { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    // Configure Tailwind with custom colors
    if (window.tailwind) {
      window.tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '#1e3a8a',
              secondary: '#1e293b',
              accent: '#3b82f6',
              successGreen: '#10b981',
              amber: '#f59e0b',
            },
            fontFamily: {
              display: ['Inter', 'system-ui', 'sans-serif'],
            },
          },
        },
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Tailwind CSS CDN */}
      <script src="https://cdn.tailwindcss.com"></script>
      
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <style>{`
        * {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
        }

        .gradient-text {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <span className="font-display text-2xl font-extrabold text-secondary">ACQAR</span>
            </a>
            
            <div className="hidden lg:flex items-center gap-8">
              <a href="#products" className="text-gray-600 hover:text-primary font-medium transition-colors">Products</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary font-medium transition-colors">How It Works</a>
              <a href="#faq" className="text-gray-600 hover:text-primary font-medium transition-colors">FAQ</a>
              <a href="/home" className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl">
                Try ValuCheck™
              </a>
            </div>

            <button className="lg:hidden p-2" aria-label="Menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              The Intelligence Layer for Dubai Real Estate
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-secondary mb-6 leading-tight">
              Transform Dubai <br />
              <span className="gradient-text">Real Estate Intelligence</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              AI-powered property valuations, DLD-integrated transaction tracking, and institutional-grade analytics. 
              Built for investors who demand precision.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/home" className="px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-blue-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                Get Started Free
              </a>
              <a href="#products" className="px-8 py-4 bg-white text-primary rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all shadow-xl border-2 border-primary">
                Explore Products
              </a>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="glass-panel rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold gradient-text mb-2">500K+</div>
              <div className="text-gray-600 font-medium">Properties Valued</div>
            </div>
            <div className="glass-panel rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold gradient-text mb-2">98.2%</div>
              <div className="text-gray-600 font-medium">Accuracy Rate</div>
            </div>
            <div className="glass-panel rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold gradient-text mb-2">50ms</div>
              <div className="text-gray-600 font-medium">Response Time</div>
            </div>
            <div className="glass-panel rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold gradient-text mb-2">DLD</div>
              <div className="text-gray-600 font-medium">Certified Data</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-secondary mb-4">
              Enterprise Product Suite
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed for professional real estate investors
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product Cards */}
            <div className="glass-panel rounded-2xl p-8 hover:shadow-2xl transition-all">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-2xl font-bold text-secondary mb-3">Property Passport™</h3>
              <p className="text-gray-600 mb-6">
                Complete property intelligence dashboard with DLD integration, ownership history, and blockchain verification.
              </p>
              <a href="/home" className="text-primary font-semibold hover:underline">Learn More →</a>
            </div>

            <div className="glass-panel rounded-2xl p-8 hover:shadow-2xl transition-all">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-2xl font-bold text-secondary mb-3">Wallet™</h3>
              <p className="text-gray-600 mb-6">
                Track all property expenses, ROI calculations, and automated financial reporting in one place.
              </p>
              <a href="/home" className="text-primary font-semibold hover:underline">Learn More →</a>
            </div>

            <div className="glass-panel rounded-2xl p-8 hover:shadow-2xl transition-all">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold text-secondary mb-3">Chauffeur™</h3>
              <p className="text-gray-600 mb-6">
                AI-powered transaction assistant that guides you through every step of property acquisition.
              </p>
              <a href="/home" className="text-primary font-semibold hover:underline">Learn More →</a>
            </div>

            <div className="glass-panel rounded-2xl p-8 hover:shadow-2xl transition-all">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-secondary mb-3">Scout™</h3>
              <p className="text-gray-600 mb-6">
                AI property hunter with rental management and tenant screening—complete property ecosystem.
              </p>
              <a href="/home" className="text-primary font-semibold hover:underline">Learn More →</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-panel rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-secondary mb-4">
              Ready to Transform Your Investment Strategy?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join hundreds of investors using ACQAR for smarter property decisions
            </p>
            <a href="/home" className="inline-block px-10 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-blue-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
              Start Free Valuation Now
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <a href="/" className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">A</span>
                </div>
                <span className="font-display text-2xl font-extrabold text-secondary">ACQAR</span>
              </a>
              <p className="text-sm text-gray-400 mb-6 max-w-xs leading-relaxed">
                The intelligence layer for Dubai real estate. Empowering investors with real-time data, AI-driven valuations, and transaction transparency.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all" aria-label="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-6">Products</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="/home" className="text-gray-400 hover:text-primary transition-colors">ValuCheck™</a></li>
                <li><a href="/home" className="text-gray-400 hover:text-primary transition-colors">DealLens™</a></li>
                <li><a href="/home" className="text-gray-400 hover:text-primary transition-colors">InvestIQ™</a></li>
                <li><a href="/home" className="text-gray-400 hover:text-primary transition-colors">Certifi™</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-6">Company</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="/home" className="text-gray-400 hover:text-primary transition-colors">About Us</a></li>
                <li><a href="/home" className="text-gray-400 hover:text-primary transition-colors">Case Studies</a></li>
                <li><a href="/home" className="text-gray-400 hover:text-primary transition-colors">Careers</a></li>
                <li><a href="/home" className="text-gray-400 hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-6">Resources</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="/home" className="text-gray-400 hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="/home" className="text-gray-400 hover:text-primary transition-colors">API Reference</a></li>
                <li><a href="/home" className="text-gray-400 hover:text-primary transition-colors">Support</a></li>
                <li><a href="/home" className="text-gray-400 hover:text-primary transition-colors">Legal</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-400">
            <p>© 2025 ACQAR Technologies FZE. All rights reserved.</p>
            <div className="flex items-center gap-8">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                System Status: Nominal
              </span>
              <span className="flex items-center gap-2">
                <span className="text-lg">🇦🇪</span>
                Made with precision in Dubai, UAE
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
