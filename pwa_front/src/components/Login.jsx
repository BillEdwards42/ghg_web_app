import React, { useState } from 'react';
import { apiClient } from '../utils/api';

function Login({ onLogin }) {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!account.trim() || !password.trim()) {
      setError('請輸入帳號密碼');
      return;
    }

    setLoading(true);

    // GitHub Pages POC Bypass (Static Host doesn't have our Node backend)
    if (window.location.hostname.includes('github.io')) {
      alert("⚠️ [POC Demo Mode] GitHub Pages 無法連線至本地 Node 後端。已啟用模擬登入！");
      setLoading(false);
      onLogin();
      return;
    }

    try {
      // 呼叫我們的模組化後端認證端點 (rick_auth)
      const response = await apiClient.post('/rick_auth', { account, password });

      if (response.data.success) {
        setLoading(false);
        onLogin();
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || '登入失敗，請稍後再試');
    }
  };

  const logoUrl = `${import.meta.env.BASE_URL}assets/lndata_logo_en.png`;

  return (
    <div id="login-screen">
      <form className="login-card" onSubmit={handleSubmit} autoComplete="off">
        <img className="logo" src={logoUrl} alt="Ln{Carbon} Logo" />
        <h1>Ln{Carbon}</h1>

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
