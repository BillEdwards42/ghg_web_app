import React, { useState } from 'react';

function Login({ onLogin }) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!account.trim() || !password.trim()) {
      setError('請輸入帳號密碼');
      return;
    }

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 800);
  };

  const logoUrl = `${import.meta.env.BASE_URL}assets/lndata_logo_en.png`;

  return (
    <div id="login-screen">
      <form className="login-card" onSubmit={handleSubmit} autoComplete="off">
        <img className="logo" src={logoUrl} alt="GHG Logo" />
        <h1>GHG 數據採集</h1>

        <div className="input-group">
          <label htmlFor="input-account">帳號</label>
          <input 
            type="text" 
            id="input-account" 
            placeholder="請輸入帳號"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="input-password">密碼</label>
          <input 
            type="password" 
            id="input-password" 
            placeholder="請輸入密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="login-error">{error}</div>

        <button 
          type="submit" 
          className={`btn-primary ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? '登入中…' : '登入'}
        </button>
      </form>
    </div>
  );
}

export default Login;
