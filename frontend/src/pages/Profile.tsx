import React, { useState } from 'react';
import { Lock, AlertCircle, CheckCircle, Check, X, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../utils/api';

interface ProfileProps {
  onNavigate: (path: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Live password checks
  const hasMinLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasSpecialChar;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const isFormValid = isPasswordValid && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess('');

    if (!isFormValid) {
      const errs = [];
      if (!isPasswordValid) errs.push('New password does not meet complexity requirements.');
      if (!passwordsMatch) errs.push('Passwords do not match.');
      setErrors(errs);
      return;
    }

    setLoading(true);
    const response = await apiRequest('/auth/password', {
      method: 'PUT',
      body: { newPassword },
    });
    setLoading(false);

    if (response.success) {
      setSuccess('Your password has been successfully updated!');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setErrors(response.errors || ['Failed to update password.']);
    }
  };

  return (
    <div className="container animate-fade" style={{ maxWidth: '600px', padding: '40px 20px' }}>
      <button 
        onClick={() => onNavigate('dashboard')}
        className="btn btn-secondary"
        style={{ marginBottom: '24px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </button>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <Lock size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '22px' }}>Security Settings</h2>
            <p style={{ fontSize: '14px' }}>Update your account password</p>
          </div>
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

        {success && (
          <div className="alert alert-success">
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <div>{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                className={`form-input ${newPassword && !isPasswordValid ? 'form-input-error' : ''}`}
                style={{ paddingLeft: 48 }}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            {/* Password checklist */}
            {newPassword && (
              <div className="pw-requirements animate-fade" style={{ marginTop: '12px' }}>
                <p className="pw-requirements-title">New Password Requirements:</p>
                
                <div className="pw-requirement-item">
                  {hasMinLength ? (
                    <Check size={12} className="pw-requirement-valid" />
                  ) : (
                    <X size={12} style={{ color: 'var(--error)' }} />
                  )}
                  <span style={{ color: hasMinLength ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    8 to 16 characters ({newPassword.length})
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
                    At least one special character (@, #, !, %, etc.)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                className={`form-input ${confirmPassword && !passwordsMatch ? 'form-input-error' : ''}`}
                style={{ paddingLeft: 48 }}
                placeholder="Retype new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="form-error-msg">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            disabled={loading || !isFormValid}
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
