import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, Star } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { setAuthSession, UserSession } from '../utils/auth';

interface LoginProps {
  onLoginSuccess: (user: UserSession) => void;
  onNavigate: (path: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!email.trim() || !password) {
      setErrors(['Please enter both email and password.']);
      return;
    }

    setLoading(true);
    const response = await apiRequest<{ token: string; user: UserSession }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setLoading(false);

    if (response.success && response.data) {
      const { token, user } = response.data;
      setAuthSession(token, user);
      onLoginSuccess(user);
    } else {
      setErrors(response.errors || ['Invalid credentials.']);
    }
  };

  return (
    <div className="auth-page animate-fade">
      <div className="card auth-card">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: 12, borderRadius: 12, background: 'var(--primary-glow)', marginBottom: 12 }}>
            <Star size={32} fill="var(--primary)" color="var(--primary)" />
          </div>
          <h2>Welcome to StoreStar</h2>
          <p>Login to rate stores or manage the platform</p>
        </div>

        {errors.length > 0 && (
          <div className="alert alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              {errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: 48 }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 28 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: 48 }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? (
              <span>Signing In...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <a 
              href="#register" 
              className="auth-link"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('register');
              }}
            >
              Sign Up Now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
