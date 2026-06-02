import React, { useState } from 'react';
import { User, Mail, MapPin, Lock, UserPlus, AlertCircle, Check, X } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { setAuthSession, UserSession } from '../utils/auth';

interface RegisterProps {
  onRegisterSuccess: (user: UserSession) => void;
  onNavigate: (path: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Live validation checks
  const isNameLengthValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  
  const hasMinLength = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasSpecialChar;

  const isFormValid = isNameLengthValid && isAddressValid && isEmailValid && isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!isFormValid) {
      const errs = [];
      if (!isNameLengthValid) errs.push('Name must be between 20 and 60 characters.');
      if (!isEmailValid) errs.push('Please enter a valid email address.');
      if (!isAddressValid) errs.push('Address is required (max 400 characters).');
      if (!isPasswordValid) errs.push('Password does not meet the complexity requirements.');
      setErrors(errs);
      return;
    }

    setLoading(true);
    const response = await apiRequest<{ token: string; user: UserSession }>('/auth/register', {
      method: 'POST',
      body: {
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        password,
      },
    });
    setLoading(false);

    if (response.success && response.data) {
      const { token, user } = response.data;
      setAuthSession(token, user);
      onRegisterSuccess(user);
    } else {
      setErrors(response.errors || ['An error occurred during registration.']);
    }
  };

  return (
    <div className="auth-page animate-fade">
      <div className="card auth-card">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', padding: 12, borderRadius: 12, background: 'var(--primary-glow)', marginBottom: 12 }}>
            <UserPlus size={32} color="var(--primary)" />
          </div>
          <h2>Create Account</h2>
          <p>Register as a Normal User to start rating stores</p>
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
          {/* Name Field */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="form-label">Full Name</label>
              <span 
                style={{ 
                  fontSize: '11px', 
                  fontWeight: 600,
                  color: isNameLengthValid ? 'var(--success)' : 'var(--text-muted)' 
                }}
              >
                {name.trim().length} / 20-60 characters
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <User size={18} />
              </span>
              <input
                type="text"
                className={`form-input ${name && !isNameLengthValid ? 'form-input-error' : ''}`}
                style={{ paddingLeft: 48 }}
                placeholder="e.g. Normal User Account Holder"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            {name && !isNameLengthValid && (
              <p className="form-error-msg">
                Name is too short (current: {name.trim().length} chars. Must be at least 20).
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                className={`form-input ${email && !isEmailValid ? 'form-input-error' : ''}`}
                style={{ paddingLeft: 48 }}
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Address Field */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="form-label">Home Address</label>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {address.length} / 400 max
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '16px', color: 'var(--text-muted)' }}>
                <MapPin size={18} />
              </span>
              <textarea
                className={`form-input ${address.length > 400 ? 'form-input-error' : ''}`}
                style={{ paddingLeft: 48, minHeight: '80px', resize: 'vertical' }}
                placeholder="Enter your complete home address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                className={`form-input ${password && !isPasswordValid ? 'form-input-error' : ''}`}
                style={{ paddingLeft: 48 }}
                placeholder="Create strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Live Password Indicator */}
            {password && (
              <div className="pw-requirements animate-fade">
                <p className="pw-requirements-title">Password Requirements Checklist:</p>
                
                <div className="pw-requirement-item">
                  {hasMinLength ? (
                    <Check size={12} className="pw-requirement-valid" />
                  ) : (
                    <X size={12} style={{ color: 'var(--error)' }} />
                  )}
                  <span style={{ color: hasMinLength ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    8 to 16 characters ({password.length})
                  </span>
                </div>

                <div className="pw-requirement-item">
                  {hasUppercase ? (
                    <Check size={12} className="pw-requirement-valid" />
                  ) : (
                    <X size={12} style={{ color: 'var(--error)' }} />
                  )}
                  <span style={{ color: hasUppercase ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    At least one uppercase letter (A-Z)
                  </span>
                </div>

                <div className="pw-requirement-item">
                  {hasSpecialChar ? (
                    <Check size={12} className="pw-requirement-valid" />
                  ) : (
                    <X size={12} style={{ color: 'var(--error)' }} />
                  )}
                  <span style={{ color: hasSpecialChar ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    At least one special character (@, $, !, %, etc.)
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <a 
              href="#login" 
              className="auth-link"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('login');
              }}
            >
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
