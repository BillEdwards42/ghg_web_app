import React, { useState } from 'react';
import { apiClient, encodePassword, SYSTEM_ID, setAuthHeaders } from '../utils/api';

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

    try {
      // Step 1: Authentication
      const loginResponse = await apiClient.post('/session', { 
        username: account, 
        password: encodePassword(password),
        systemId: SYSTEM_ID
      });

      const token = loginResponse.data.token;
      if (!token) {
        throw new Error('未取得授權令牌');
      }

      // Important: Set the token in headers immediately before the next call
      setAuthHeaders(token);

      // Step 2: Fetch User Context (checkUserToken)
      // This validates the token and returns rootLegalEntities
      const contextResponse = await apiClient.get('/checkUserToken');
      const rootEntities = contextResponse.data.rootLegalEntities || [];

      setLoading(false);
      // Pass the token and entities to the parent App component
      onLogin(token, rootEntities);

    } catch (err) {
      setLoading(false);
      // Ensure headers are cleared if login fails
      setAuthHeaders(null);
      
      const errMsg = err.response?.data?.error || err.message || '登入失敗，請稍後再試';
      setError(errMsg);
      console.error('Login error:', err);
    }
  };

  const logoUrl = `${import.meta.env.BASE_URL}assets/lndata_logo_en.png`;

  return (
    <div id="login-screen">
      <form className="login-card" onSubmit={handleSubmit} autoComplete="off">
        <img className="logo" src={logoUrl} alt="Ln{Carbon} Logo" />
        <h1>{"Ln{Carbon}"}</h1>

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
