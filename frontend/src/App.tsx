import React, { useState, useEffect } from 'react';
import { getAuthUser, clearAuthSession, UserSession } from './utils/auth';

// Public pages
import Login from './pages/Login';
import Register from './pages/Register';

// Authenticated pages
import AdminDashboard from './pages/admin/Dashboard';
import UserDashboard from './pages/user/Dashboard';
import StoreOwnerDashboard from './pages/store/Dashboard';
import Profile from './pages/Profile';

// Shared layout components
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('login');
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const activeUser = getAuthUser();
    if (activeUser) {
      setUser(activeUser);
      setCurrentPath('dashboard');
    } else {
      setCurrentPath('login');
    }
    setInitializing(false);
  }, []);

  const handleLoginSuccess = (loggedInUser: UserSession) => {
    setUser(loggedInUser);
    setCurrentPath('dashboard');
  };

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    setCurrentPath('login');
  };

  if (initializing) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Initializing Application...</p>
      </div>
    );
  }

  // Unauthenticated routing layout
  if (!user) {
    if (currentPath === 'register') {
      return (
        <Register 
          onRegisterSuccess={handleLoginSuccess} 
          onNavigate={setCurrentPath} 
        />
      );
    }
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        onNavigate={setCurrentPath} 
      />
    );
  }

  // Authenticated layout shell
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        currentPath={currentPath}
        onNavigate={setCurrentPath}
      />
      
      <main style={{ flex: 1, paddingBottom: '40px' }} className="animate-fade">
        {currentPath === 'profile' && (
          <Profile onNavigate={setCurrentPath} />
        )}
        
        {currentPath === 'dashboard' && (
          <>
            {user.role === 'ADMIN' && <AdminDashboard />}
            {user.role === 'USER' && <UserDashboard />}
            {user.role === 'STORE_OWNER' && <StoreOwnerDashboard />}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
