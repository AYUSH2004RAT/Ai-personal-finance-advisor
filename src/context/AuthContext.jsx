import { createContext, useContext, useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      apiGet('/api/auth/me')
        .then(data => { setUser(data); setLoading(false); })
        .catch(() => { logout(); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, []);

  function saveAuth(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email, monthlyIncome: data.monthlyIncome }));
    setToken(data.token);
    setUser({ _id: data._id, name: data.name, email: data.email, monthlyIncome: data.monthlyIncome });
  }

  async function login(email, password) {
    const data = await apiPost('/api/auth/login', { email, password });
    saveAuth(data);
    return data;
  }

  async function register(name, email, password) {
    const data = await apiPost('/api/auth/register', { name, email, password });
    saveAuth(data);
    return data;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  async function updateIncome(amount) {
    const data = await apiPut('/api/auth/profile/income', { amount });
    setUser(prev => ({ ...prev, monthlyIncome: data.monthlyIncome }));
    return data;
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateIncome }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
