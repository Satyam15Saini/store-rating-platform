import React from 'react';
import { LogOut, Store, Shield, User, Key, Star } from 'lucide-react';
import { UserSession } from '../utils/auth';

interface NavbarProps {
  user: UserSession;
  onLogout: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, currentPath, onNavigate }) => {
  const getRoleIcon = () => {
    switch (user.role) {
      case 'ADMIN':
        return <Shield size={16} />;
      case 'STORE_OWNER':
        return <Store size={16} />;
      default:
        return <User size={16} />;
    }
  };

  return (
    <nav className="navbar animate-fade">
      <div className="navbar-container">
        <a 
          href="#dashboard" 
          className="navbar-logo" 
          onClick={(e) => {
            e.preventDefault();
            onNavigate('dashboard');
          }}
        >
          <Star size={24} fill="var(--primary)" color="var(--primary)" />
          <span>StoreStar</span>
        </a>

        <div className="navbar-user">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="user-badge">
            {getRoleIcon()}
            {user.role.replace('_', ' ')}
          </span>
          
          <span style={{ fontSize: '14px', fontWeight: 600 }}>
            {user.name}
          </span>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>

          <button
            onClick={() => onNavigate('profile')}
            className={`btn btn-secondary ${currentPath === 'profile' ? 'active' : ''}`}
            style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Update Password"
          >
            <Key size={14} />
            <span>Settings</span>
          </button>

          <button
            onClick={onLogout}
            className="btn btn-danger"
            style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
