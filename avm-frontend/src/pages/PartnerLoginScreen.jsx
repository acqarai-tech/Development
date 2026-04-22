// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../lib/supabase';

// export default function PartnerLoginScreen() {
//   const navigate = useNavigate();
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error,    setError]    = useState('');
//   const [loading,  setLoading]  = useState(false);

//   const handleLogin = async () => {
//     setError('');
//     if (!username.trim() || !password.trim()) {
//       setError('Please enter username and password.');
//       return;
//     }
//     setLoading(true);

//     const { data, error: dbError } = await supabase
//       .from('discount_codes')
//       .select('*')
//       .eq('username', username.trim())
//       .eq('password', password.trim())
//       .maybeSingle();

//     if (dbError || !data) {
//       setError('Invalid username or password. Please try again.');
//       setLoading(false);
//       return;
//     }

//     // Save partner session
//     sessionStorage.setItem('partner_code',     data.code);
//     sessionStorage.setItem('partner_username', data.username);
//     sessionStorage.setItem('partner_id',       data.id);

//     navigate('/partner-dashboard');
//     setLoading(false);
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') handleLogin();
//   };

//   return (
//     <div style={{
//       minHeight:'100vh', background:'#F3F3F4',
//       display:'flex', alignItems:'center', justifyContent:'center',
//       padding:16, fontFamily:"'Inter', system-ui, sans-serif",
//     }}>
//       <div style={{
//         background:'#fff', borderRadius:20, padding:'40px 32px',
//         width:'100%', maxWidth:400,
//         boxShadow:'0 4px 32px rgba(0,0,0,0.10)',
//       }}>
//         {/* Logo */}
//         <div style={{ textAlign:'center', marginBottom:32 }}>
//           <div style={{ fontSize:26, fontWeight:900, letterSpacing:'-0.04em', marginBottom:8 }}>
//             <span style={{ color:'#C8832A' }}>ACQ</span>
//             <span style={{ color:'#111' }}>AR</span>
//           </div>
//           <h1 style={{ fontSize:18, fontWeight:800, color:'#0F0F0F', marginBottom:4 }}>Partner Login</h1>
//           <p style={{ fontSize:13, color:'#6B6B6B' }}>Sign in to see your referral stats</p>
//         </div>

//         {/* Username */}
//         <div style={{ marginBottom:14 }}>
//           <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#6B6B6B', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>
//             Username
//           </label>
//           <input
//             type="text"
//             placeholder="Enter your username"
//             value={username}
//             onChange={e => setUsername(e.target.value)}
//             onKeyDown={handleKeyDown}
//             style={{ width:'100%', padding:'13px 15px', borderRadius:10, border:'1px solid #E9E9EA', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
//           />
//         </div>

//         {/* Password */}
//         <div style={{ marginBottom:20 }}>
//           <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#6B6B6B', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>
//             Password
//           </label>
//           <input
//             type="password"
//             placeholder="Enter your password"
//             value={password}
//             onChange={e => setPassword(e.target.value)}
//             onKeyDown={handleKeyDown}
//             style={{ width:'100%', padding:'13px 15px', borderRadius:10, border:'1px solid #E9E9EA', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
//           />
//         </div>

//         {/* Error */}
//         {error && (
//           <div style={{ marginBottom:16, padding:'10px 14px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, color:'#DC2626', fontSize:13, fontWeight:700 }}>
//             ⚠️ {error}
//           </div>
//         )}

//         {/* Button */}
//         <button
//           onClick={handleLogin}
//           disabled={loading}
//           style={{
//             width:'100%', padding:'14px',
//             background: loading ? '#ccc' : '#C8832A',
//             color:'#fff', border:'none', borderRadius:10,
//             fontWeight:800, fontSize:15, cursor: loading ? 'not-allowed' : 'pointer',
//             fontFamily:'inherit',
//           }}
//         >
//           {loading ? 'Logging in...' : 'Login →'}
//         </button>
//       </div>
//     </div>
//   );
// }












import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function PartnerLoginScreen() {
  const navigate = useNavigate();
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password.');
      return;
    }
    setLoading(true);

    const { data, error: dbError } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('username', username.trim())
      .eq('password', password.trim())
      .maybeSingle();

    if (dbError || !data) {
      setError('Invalid username or password. Please try again.');
      setLoading(false);
      return;
    }

    sessionStorage.setItem('partner_code',     data.code);
    sessionStorage.setItem('partner_username', data.username);
    sessionStorage.setItem('partner_id',       data.id);

    navigate('/partner-dashboard');
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* ── Left side — branding ── */}
      <div style={{
  flex: '0 0 38%',
  background: 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        minWidth: 0,
      }} className="login-left">
        <div style={{ textAlign: 'center', maxWidth: 340 }}>

          {/* Logo */}
          <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.05em', marginBottom: 12 }}>
            <span style={{ color: '#C8832A' }}>ACQ</span>
            <span style={{ color: '#fff' }}>AR</span>
          </div>

          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, fontWeight: 500, marginBottom: 48 }}>
            Partner Dashboard
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              'Track your referral signups',
              'See total revenue generated',
              'Monitor your discount code',
            ].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(200,131,42,0.15)',
                  border: '1.5px solid #C8832A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ color: '#C8832A', fontSize: 11, fontWeight: 900 }}>✓</span>
                </div>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right side — login form ── */}
      <div style={{
  flex: 1,
  display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        background: '#fff',
        boxSizing: 'border-box',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Mobile logo — only shows on small screens */}
          <div className="mobile-logo" style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em' }}>
              <span style={{ color: '#C8832A' }}>ACQ</span>
              <span style={{ color: '#111' }}>AR</span>
            </div>
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F0F0F', marginBottom: 6, letterSpacing: '-0.03em' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 32, lineHeight: 1.5 }}>
            Sign in to your partner account to view your stats.
          </p>

          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', fontSize: 10, fontWeight: 700,
              color: '#6B6B6B', textTransform: 'uppercase',
              letterSpacing: '0.1em', marginBottom: 7,
            }}>
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%', padding: '14px 16px',
                borderRadius: 10, border: '1.5px solid #E9E9EA',
                fontSize: 14, outline: 'none',
                boxSizing: 'border-box', fontFamily: 'inherit',
                background: '#F9F9F9', transition: 'border 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#C8832A'}
              onBlur={e => e.target.style.borderColor = '#E9E9EA'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block', fontSize: 10, fontWeight: 700,
              color: '#6B6B6B', textTransform: 'uppercase',
              letterSpacing: '0.1em', marginBottom: 7,
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%', padding: '14px 52px 14px 16px',
                  borderRadius: 10, border: '1.5px solid #E9E9EA',
                  fontSize: 14, outline: 'none',
                  boxSizing: 'border-box', fontFamily: 'inherit',
                  background: '#F9F9F9', transition: 'border 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#C8832A'}
                onBlur={e => e.target.style.borderColor = '#E9E9EA'}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                type="button"
                style={{
                  position: 'absolute', right: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: '#9A9A9A',
                  fontSize: 10, fontWeight: 800,
                  padding: 0, fontFamily: 'inherit',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 16, padding: '11px 14px',
              background: '#FEF2F2', border: '1px solid #FECACA',
              borderRadius: 8, color: '#DC2626',
              fontSize: 13, fontWeight: 700,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '15px',
              background: loading ? '#ccc' : '#C8832A',
              color: '#fff', border: 'none', borderRadius: 10,
              fontWeight: 800, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(200,131,42,0.3)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 640px) {
          .login-left  { display: none !important; }
          .mobile-logo { display: block !important; }
        }
        @media (min-width: 641px) {
          .mobile-logo { display: none !important; }
        }
      `}</style>

    </div>
  );
}
