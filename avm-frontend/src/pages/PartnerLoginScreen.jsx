import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function PartnerLoginScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

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

    // Save partner session
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
      minHeight:'100vh', background:'#F3F3F4',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:16, fontFamily:"'Inter', system-ui, sans-serif",
    }}>
      <div style={{
        background:'#fff', borderRadius:20, padding:'40px 32px',
        width:'100%', maxWidth:400,
        boxShadow:'0 4px 32px rgba(0,0,0,0.10)',
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:26, fontWeight:900, letterSpacing:'-0.04em', marginBottom:8 }}>
            <span style={{ color:'#C8832A' }}>ACQ</span>
            <span style={{ color:'#111' }}>AR</span>
          </div>
          <h1 style={{ fontSize:18, fontWeight:800, color:'#0F0F0F', marginBottom:4 }}>Partner Login</h1>
          <p style={{ fontSize:13, color:'#6B6B6B' }}>Sign in to see your referral stats</p>
        </div>

        {/* Username */}
        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#6B6B6B', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>
            Username
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ width:'100%', padding:'13px 15px', borderRadius:10, border:'1px solid #E9E9EA', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, color:'#6B6B6B', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ width:'100%', padding:'13px 15px', borderRadius:10, border:'1px solid #E9E9EA', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom:16, padding:'10px 14px', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:8, color:'#DC2626', fontSize:13, fontWeight:700 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width:'100%', padding:'14px',
            background: loading ? '#ccc' : '#C8832A',
            color:'#fff', border:'none', borderRadius:10,
            fontWeight:800, fontSize:15, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily:'inherit',
          }}
        >
          {loading ? 'Logging in...' : 'Login →'}
        </button>
      </div>
    </div>
  );
}
