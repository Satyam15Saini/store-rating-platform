import React, { useState, useEffect } from 'react';
import { Users, Store as StoreIcon, Star, Plus, Shield, MapPin, Mail, Search, AlertCircle, Info, Lock, Check, X } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import Table, { TableHeader } from '../../components/Table';
import Modal from '../../components/Modal';
import Stars from '../../components/Stars';

interface Stats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

interface StoreItem {
  id: number;
  name: string;
  email: string;
  address: string;
  rating: number;
  totalRatings: number;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  address: string;
  role: 'ADMIN' | 'USER' | 'STORE_OWNER';
}

interface SelectedUserDetail {
  id: number;
  name: string;
  email: string;
  address: string;
  role: string;
  rating: number | null;
  storeName: string | null;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  // Tab State
  const [activeTab, setActiveTab] = useState<'stores' | 'users'>('stores');

  // Filters State
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterAddress, setFilterAddress] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Sorting State
  const [storesSortBy, setStoresSortBy] = useState('name');
  const [storesSortOrder, setStoresSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [usersSortBy, setUsersSortBy] = useState('name');
  const [usersSortOrder, setUsersSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal States
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Add User Form State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<'ADMIN' | 'USER'>('USER');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Add Store Form State
  const [storeName, setStoreName] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePassword, setStorePassword] = useState('');

  // User Detail Inspector State
  const [selectedUser, setSelectedUser] = useState<SelectedUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setErrors([]);
    try {
      const statsRes = await apiRequest<Stats>('/admin/stats');
      const storesRes = await apiRequest<StoreItem[]>('/admin/stores');
      const usersRes = await apiRequest<UserItem[]>('/admin/users');

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (storesRes.success && storesRes.data) setStores(storesRes.data);
      if (usersRes.success && usersRes.data) setUsers(usersRes.data);

      if (!statsRes.success) setErrors(prev => [...prev, ...(statsRes.errors || [])]);
      if (!storesRes.success) setErrors(prev => [...prev, ...(storesRes.errors || [])]);
      if (!usersRes.success) setErrors(prev => [...prev, ...(usersRes.errors || [])]);
    } catch (e) {
      setErrors(['An error occurred while connecting to the backend services.']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Form password validators
  const validatePwd = (pwd: string) => {
    const minL = pwd.length >= 8 && pwd.length <= 16;
    const upper = /[A-Z]/.test(pwd);
    const spec = /[^a-zA-Z0-9]/.test(pwd);
    return minL && upper && spec;
  };

  // Add User Submission
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setFormSuccess('');

    if (userName.trim().length < 20 || userName.trim().length > 60) {
      setFormErrors(['Name must be between 20 and 60 characters.']);
      return;
    }
    if (!validatePwd(userPassword)) {
      setFormErrors(['Password does not meet complexity requirements.']);
      return;
    }
    if (userAddress.trim().length === 0 || userAddress.trim().length > 400) {
      setFormErrors(['Address is required (max 400 characters).']);
      return;
    }

    setFormLoading(true);
    const response = await apiRequest('/admin/users', {
      method: 'POST',
      body: {
        name: userName.trim(),
        email: userEmail.trim(),
        password: userPassword,
        address: userAddress.trim(),
        role: userRole,
      },
    });
    setFormLoading(false);

    if (response.success) {
      setFormSuccess('User account registered successfully!');
      setUserName('');
      setUserEmail('');
      setUserAddress('');
      setUserPassword('');
      // Refetch
      fetchData();
    } else {
      setFormErrors(response.errors || ['Failed to register user.']);
    }
  };

  // Add Store Submission
  const handleAddStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);
    setFormSuccess('');

    if (storeName.trim().length < 20 || storeName.trim().length > 60) {
      setFormErrors(['Store name must be between 20 and 60 characters.']);
      return;
    }
    if (!validatePwd(storePassword)) {
      setFormErrors(['Owner password does not meet complexity requirements.']);
      return;
    }
    if (storeAddress.trim().length === 0 || storeAddress.trim().length > 400) {
      setFormErrors(['Store address is required (max 400 characters).']);
      return;
    }

    setFormLoading(true);
    const response = await apiRequest('/admin/stores', {
      method: 'POST',
      body: {
        name: storeName.trim(),
        email: storeEmail.trim(),
        password: storePassword,
        address: storeAddress.trim(),
      },
    });
    setFormLoading(false);

    if (response.success) {
      setFormSuccess('Store and Store Owner created successfully!');
      setStoreName('');
      setStoreEmail('');
      setStoreAddress('');
      setStorePassword('');
      // Refetch
      fetchData();
    } else {
      setFormErrors(response.errors || ['Failed to register store.']);
    }
  };

  // View User Profile Details
  const handleInspectUser = async (id: number) => {
    setIsDetailOpen(true);
    setDetailLoading(true);
    setSelectedUser(null);
    
    const response = await apiRequest<SelectedUserDetail>(`/admin/users/${id}`);
    setDetailLoading(false);

    if (response.success && response.data) {
      setSelectedUser(response.data);
    } else {
      setIsDetailOpen(false);
      alert(response.errors?.join('\n') || 'Failed to fetch user details.');
    }
  };

  // Filter lists in memory for maximum fluid response
  const filteredStores = stores.filter((store) => {
    return (
      store.name.toLowerCase().includes(filterName.toLowerCase()) &&
      store.email.toLowerCase().includes(filterEmail.toLowerCase()) &&
      store.address.toLowerCase().includes(filterAddress.toLowerCase())
    );
  });

  const filteredUsers = users.filter((user) => {
    const matchesName = user.name.toLowerCase().includes(filterName.toLowerCase());
    const matchesEmail = user.email.toLowerCase().includes(filterEmail.toLowerCase());
    const matchesAddress = user.address.toLowerCase().includes(filterAddress.toLowerCase());
    const matchesRole = filterRole === '' || user.role === filterRole;
    return matchesName && matchesEmail && matchesAddress && matchesRole;
  });

  // Table Sorting logic (Local)
  const handleStoresSort = (key: string) => {
    if (storesSortBy === key) {
      setStoresSortOrder(storesSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setStoresSortBy(key);
      setStoresSortOrder('asc');
    }
  };

  const handleUsersSort = (key: string) => {
    if (usersSortBy === key) {
      setUsersSortOrder(usersSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setUsersSortBy(key);
      setUsersSortOrder('asc');
    }
  };

  const sortedStores = [...filteredStores].sort((a: any, b: any) => {
    const order = storesSortOrder === 'desc' ? -1 : 1;
    let valA = a[storesSortBy];
    let valB = b[storesSortBy];

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    
    if (valA < valB) return -1 * order;
    if (valA > valB) return 1 * order;
    return 0;
  });

  const sortedUsers = [...filteredUsers].sort((a: any, b: any) => {
    const order = usersSortOrder === 'desc' ? -1 : 1;
    let valA = a[usersSortBy];
    let valB = b[usersSortBy];

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return -1 * order;
    if (valA > valB) return 1 * order;
    return 0;
  });

  // Table Header Setup
  const storeHeaders: TableHeader[] = [
    { key: 'name', label: 'Store Name', sortable: true },
    { key: 'email', label: 'Login Email', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'rating', label: 'Average Rating', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  const userHeaders: TableHeader[] = [
    { key: 'name', label: 'User Name', sortable: true },
    { key: 'email', label: 'Email Address', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  // Forms dynamic validation helpers for checking inline
  const liveUserNameValid = userName.trim().length >= 20 && userName.trim().length <= 60;
  const liveUserAddressValid = userAddress.trim().length > 0 && userAddress.trim().length <= 400;
  const liveUserPwdValid = validatePwd(userPassword);

  const liveStoreNameValid = storeName.trim().length >= 20 && storeName.trim().length <= 60;
  const liveStoreAddressValid = storeAddress.trim().length > 0 && storeAddress.trim().length <= 400;
  const liveStorePwdValid = validatePwd(storePassword);

  return (
    <div className="container animate-fade">
      {/* Dashboard Top bar */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>System Administration Dashboard</h1>
          <p>Manage registered stores, platform users, and track stats.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setIsAddUserOpen(true);
              setFormErrors([]);
              setFormSuccess('');
            }}
          >
            <Plus size={18} />
            <span>Add User</span>
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={() => {
              setIsAddStoreOpen(true);
              setFormErrors([]);
              setFormSuccess('');
            }}
          >
            <Plus size={18} />
            <span>Add Store</span>
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <div>{errors.join(' | ')}</div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</p>
            <h2 className="stat-number">{loading ? '...' : stats.totalUsers}</h2>
          </div>
          <div className="stat-icon-wrapper">
            <Users size={28} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Stores</p>
            <h2 className="stat-number">{loading ? '...' : stats.totalStores}</h2>
          </div>
          <div className="stat-icon-wrapper">
            <StoreIcon size={28} />
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted Ratings</p>
            <h2 className="stat-number">{loading ? '...' : stats.totalRatings}</h2>
          </div>
          <div className="stat-icon-wrapper" style={{ background: 'hsla(48, 96%, 53%, 0.15)', color: 'var(--accent-gold)' }}>
            <Star size={28} />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card filters-bar animate-fade">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={18} color="var(--text-muted)" />
          <span className="filters-title">Filter Results</span>
        </div>
        
        <div className="filter-input-wrapper">
          <input
            type="text"
            className="filter-input"
            placeholder="Search by Name..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />
        </div>

        <div className="filter-input-wrapper">
          <input
            type="text"
            className="filter-input"
            placeholder="Search by Email..."
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
          />
        </div>

        <div className="filter-input-wrapper">
          <input
            type="text"
            className="filter-input"
            placeholder="Search by Address..."
            value={filterAddress}
            onChange={(e) => setFilterAddress(e.target.value)}
          />
        </div>

        {activeTab === 'users' && (
          <div className="filter-input-wrapper" style={{ maxWidth: '160px' }}>
            <select
              className="filter-input"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
              <option value="STORE_OWNER">STORE OWNER</option>
            </select>
          </div>
        )}
      </div>

      {/* Listings Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('stores');
            setFilterRole('');
          }}
        >
          Registered Stores ({filteredStores.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Normal & Admin Users ({filteredUsers.length})
        </button>
      </div>

      {/* Data tables rendering */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p>Loading database records...</p>
        </div>
      ) : activeTab === 'stores' ? (
        <Table
          headers={storeHeaders}
          data={sortedStores}
          sortBy={storesSortBy}
          sortOrder={storesSortOrder}
          onSort={handleStoresSort}
          emptyMessage="No registered stores match your search criteria."
          renderRow={(store: StoreItem) => (
            <tr key={store.id}>
              <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{store.name}</td>
              <td>{store.email}</td>
              <td style={{ fontSize: '13px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {store.address}
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Stars rating={Math.round(store.rating)} size={16} />
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                    {store.rating > 0 ? store.rating.toFixed(1) : 'No Ratings'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    ({store.totalRatings} user{store.totalRatings === 1 ? '' : 's'})
                  </span>
                </div>
              </td>
              <td>
                <button
                  onClick={() => handleInspectUser(store.id)} // Will pull store owner details since store ID links to Owner detail indirectly or we fetch user profile
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Info size={12} />
                  <span>Inspect Owner</span>
                </button>
              </td>
            </tr>
          )}
        />
      ) : (
        <Table
          headers={userHeaders}
          data={sortedUsers}
          sortBy={usersSortBy}
          sortOrder={usersSortOrder}
          onSort={handleUsersSort}
          emptyMessage="No platform users match your search criteria."
          renderRow={(user: UserItem) => (
            <tr key={user.id}>
              <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</td>
              <td>{user.email}</td>
              <td style={{ fontSize: '13px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.address}
              </td>
              <td>
                <span className="user-badge" style={{ fontSize: '10px' }}>
                  {user.role}
                </span>
              </td>
              <td>
                <button
                  onClick={() => handleInspectUser(user.id)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Info size={12} />
                  <span>Inspect Details</span>
                </button>
              </td>
            </tr>
          )}
        />
      )}

      {/* ==================== ADD USER MODAL ==================== */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} title="Register New User Account">
        {formSuccess && (
          <div className="alert alert-success animate-fade">
            <Check size={18} />
            <div>{formSuccess}</div>
          </div>
        )}
        
        {formErrors.length > 0 && (
          <div className="alert alert-error animate-fade">
            <AlertCircle size={18} />
            <div>
              {formErrors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleAddUserSubmit}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="form-label">Full Name</label>
              <span style={{ fontSize: '11px', color: liveUserNameValid ? 'var(--success)' : 'var(--text-muted)' }}>
                {userName.trim().length} / 20-60
              </span>
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="Min 20 characters, e.g. Alexander Montgomery User"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="user.email@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Home Address</label>
            <textarea
              className="form-input"
              style={{ minHeight: '60px', resize: 'vertical' }}
              placeholder="Enter complete home address (max 400 chars)"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <select
              className="form-input"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              style={{ cursor: 'pointer' }}
            >
              <option value="USER">Normal User (USER)</option>
              <option value="ADMIN">System Admin (ADMIN)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Create strong account password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              required
            />
            {userPassword && (
              <div className="pw-requirements animate-fade" style={{ marginTop: '10px' }}>
                <div className="pw-requirement-item">
                  {userPassword.length >= 8 && userPassword.length <= 16 ? <Check size={12} className="pw-requirement-valid" /> : <X size={12} style={{ color: 'var(--error)' }} />}
                  <span>8 to 16 characters</span>
                </div>
                <div className="pw-requirement-item">
                  {/[A-Z]/.test(userPassword) ? <Check size={12} className="pw-requirement-valid" /> : <X size={12} style={{ color: 'var(--error)' }} />}
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className="pw-requirement-item">
                  {/[^a-zA-Z0-9]/.test(userPassword) ? <Check size={12} className="pw-requirement-valid" /> : <X size={12} style={{ color: 'var(--error)' }} />}
                  <span>At least one special character</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={formLoading || !liveUserNameValid || !liveUserAddressValid || !liveUserPwdValid}
          >
            {formLoading ? 'Creating User Account...' : 'Register User Account'}
          </button>
        </form>
      </Modal>

      {/* ==================== ADD STORE MODAL ==================== */}
      <Modal isOpen={isAddStoreOpen} onClose={() => setIsAddStoreOpen(false)} title="Register New Store & Owner">
        {formSuccess && (
          <div className="alert alert-success animate-fade">
            <Check size={18} />
            <div>{formSuccess}</div>
          </div>
        )}

        {formErrors.length > 0 && (
          <div className="alert alert-error animate-fade">
            <AlertCircle size={18} />
            <div>
              {formErrors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleAddStoreSubmit}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="form-label">Store / Shop Name</label>
              <span style={{ fontSize: '11px', color: liveStoreNameValid ? 'var(--success)' : 'var(--text-muted)' }}>
                {storeName.trim().length} / 20-60
              </span>
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="Min 20 characters, e.g. Alexander Montgomery Store"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Store Owner Login Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="store.owner@example.com"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Store Address</label>
            <textarea
              className="form-input"
              style={{ minHeight: '60px', resize: 'vertical' }}
              placeholder="Complete store location details (max 400 chars)"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Owner Portal Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Password for owner to log in"
              value={storePassword}
              onChange={(e) => setStorePassword(e.target.value)}
              required
            />
            {storePassword && (
              <div className="pw-requirements animate-fade" style={{ marginTop: '10px' }}>
                <div className="pw-requirement-item">
                  {storePassword.length >= 8 && storePassword.length <= 16 ? <Check size={12} className="pw-requirement-valid" /> : <X size={12} style={{ color: 'var(--error)' }} />}
                  <span>8 to 16 characters</span>
                </div>
                <div className="pw-requirement-item">
                  {/[A-Z]/.test(storePassword) ? <Check size={12} className="pw-requirement-valid" /> : <X size={12} style={{ color: 'var(--error)' }} />}
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className="pw-requirement-item">
                  {/[^a-zA-Z0-9]/.test(storePassword) ? <Check size={12} className="pw-requirement-valid" /> : <X size={12} style={{ color: 'var(--error)' }} />}
                  <span>At least one special character</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={formLoading || !liveStoreNameValid || !liveStoreAddressValid || !liveStorePwdValid}
          >
            {formLoading ? 'Creating Store & Owner...' : 'Create Store & Owner'}
          </button>
        </form>
      </Modal>

      {/* ==================== INSPECT PROFILE MODAL ==================== */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Inspector Profile Details">
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <p>Loading Profile Details...</p>
          </div>
        ) : selectedUser ? (
          <div className="animate-fade">
            <div className="store-details-group">
              <div className="store-details-label">Registered Name</div>
              <div className="store-details-val" style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '18px' }}>
                {selectedUser.name}
              </div>
            </div>

            <div className="store-details-group">
              <div className="store-details-label">Email Address</div>
              <div className="store-details-val">{selectedUser.email}</div>
            </div>

            <div className="store-details-group">
              <div className="store-details-label">Profile Role</div>
              <div className="store-details-val">
                <span className="user-badge">{selectedUser.role}</span>
              </div>
            </div>

            <div className="store-details-group">
              <div className="store-details-label">Registered Address</div>
              <div className="store-details-val" style={{ fontSize: '14px', lineHeight: 1.6 }}>
                {selectedUser.address}
              </div>
            </div>

            {selectedUser.role === 'STORE_OWNER' && (
              <div className="store-card-divider"></div>
            )}

            {selectedUser.role === 'STORE_OWNER' && (
              <div className="store-details-group" style={{ background: 'hsla(217, 33%, 12%, 0.4)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div className="store-details-label">Associated Store</div>
                <div className="store-details-val" style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                  {selectedUser.storeName || 'N/A'}
                </div>
                
                <div className="store-details-label">Overall Store Rating</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <Stars rating={Math.round(selectedUser.rating || 0)} size={16} />
                  <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-main)' }}>
                    {selectedUser.rating !== null && selectedUser.rating > 0 ? selectedUser.rating.toFixed(2) : 'No Ratings'}
                  </span>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setIsDetailOpen(false)}>
                Close Panel
              </button>
            </div>
          </div>
        ) : (
          <p>No user selected.</p>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
