import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../assets/logo.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../utils/api';

const LOGIN_STATE_KEY = 'loginFormState';

const getInitialLoginState = () => {
  try {
    const saved = sessionStorage.getItem(LOGIN_STATE_KEY);
    if (!saved) return { username: '', password: '', error: '' };
    const parsed = JSON.parse(saved);
    return {
      username: parsed.username || '',
      password: parsed.password || '',
      error: parsed.error || ''
    };
  } catch {
    return { username: '', password: '', error: '' };
  }
};

const saveLoginState = (state) => {
  sessionStorage.setItem(LOGIN_STATE_KEY, JSON.stringify(state));
};

const clearLoginState = () => {
  sessionStorage.removeItem(LOGIN_STATE_KEY);
};

const LoginPage = () => {
  const initialState = getInitialLoginState();
  const [passwordShown, setPasswordShown] = useState(false);
  const [username, setUsername] = useState(initialState.username);
  const [password, setPassword] = useState(initialState.password);
  const [error, setError] = useState(initialState.error);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setPasswordShown(!passwordShown);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    saveLoginState({ username, password, error: '' });

    if (!username || !password) {
      const message = 'Please enter both username and password.';
      setError(message);
      saveLoginState({ username, password, error: message });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('admin', JSON.stringify(res.data.admin));
      clearLoginState();
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      saveLoginState({ username, password, error: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <img src={logo} alt="KDU Logo" className="login-logo-header" />
        <h2>General Sir John Kotelawala Defence University</h2>
        <p>Department of Software Engineering</p>
      </div>
      <div className="login-box">
        <h3>Admin Login</h3>
        <p className="login-prompt">Enter your credentials to access the system</p>
        {error && <p className="login-error" style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                const nextUsername = e.target.value;
                setUsername(nextUsername);
                saveLoginState({ username: nextUsername, password, error });
              }}
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={passwordShown ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  const nextPassword = e.target.value;
                  setPassword(nextPassword);
                  saveLoginState({ username, password: nextPassword, error });
                }}
                required
              />
              <span onClick={togglePasswordVisibility} className="password-icon">
                {passwordShown ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <button type="submit" className="sign-in-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
