import React, { useState, useEffect } from 'react';
import { Star, Award, Users, MapPin, Mail, AlertCircle, Info } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import Table, { TableHeader } from '../../components/Table';
import Stars from '../../components/Stars';

interface Rater {
  userId: number;
  userName: string;
  userEmail: string;
  userAddress: string;
  rating: number;
  ratedAt: string;
}

interface StoreOwnerStats {
  storeId: number;
  storeName: string;
  storeAddress: string;
  storeEmail: string;
  averageRating: number;
  totalRatings: number;
  raters: Rater[];
}

const StoreOwnerDashboard: React.FC = () => {
  const [stats, setStats] = useState<StoreOwnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  // Sorting State
  const [sortBy, setSortBy] = useState('userName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchStats = async () => {
    setLoading(true);
    setErrors([]);
    const response = await apiRequest<StoreOwnerStats>('/store/stats');
    setLoading(false);

    if (response.success && response.data) {
      setStats(response.data);
    } else {
      setErrors(response.errors || ['Failed to retrieve store stats.']);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  // Perform local sorting on loaded raters list
  const getSortedRaters = () => {
    if (!stats) return [];
    
    return [...stats.raters].sort((a: any, b: any) => {
      const order = sortOrder === 'desc' ? -1 : 1;
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return -1 * order;
      if (valA > valB) return 1 * order;
      return 0;
    });
  };

  const tableHeaders: TableHeader[] = [
    { key: 'userName', label: 'User Name', sortable: true },
    { key: 'userEmail', label: 'Email Address', sortable: true },
    { key: 'userAddress', label: 'Address', sortable: true },
    { key: 'rating', label: 'Submitted Rating', sortable: true },
    { key: 'ratedAt', label: 'Rating Date', sortable: false },
  ];

  const sortedRaters = getSortedRaters();

  return (
    <div className="container animate-fade">
      {/* Top Banner Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Store Owner Portal</h1>
          <p>Analyze performance metrics, average ratings, and browse your raters list.</p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <div>{errors.join(' | ')}</div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p>Loading shop stats...</p>
        </div>
      ) : stats ? (
        <div className="animate-fade">
          {/* Main Info Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '32px' }} className="admin-grid">
            
            {/* Left Block: Store Details card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '22px', marginBottom: '20px', color: 'var(--text-main)' }}>Store Profile Details</h2>
              
              <div className="store-details-group">
                <div className="store-details-label">Store / Shop Name</div>
                <div className="store-details-val" style={{ fontWeight: 700, fontSize: '18px', color: 'var(--primary)' }}>
                  {stats.storeName}
                </div>
              </div>

              <div className="store-details-group">
                <div className="store-details-label">Registered Shop Location</div>
                <div className="store-details-val" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                  <MapPin size={14} color="var(--primary)" />
                  <span>{stats.storeAddress}</span>
                </div>
              </div>

              <div className="store-details-group" style={{ marginBottom: 0 }}>
                <div className="store-details-label">Owner Contact Email</div>
                <div className="store-details-val" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                  <Mail size={14} color="var(--primary)" />
                  <span>{stats.storeEmail}</span>
                </div>
              </div>
            </div>

            {/* Right Block: Stats counters cards */}
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '20px' }}>
              <div className="card stat-card" style={{ padding: '20px 24px' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Average Store Rating</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '6px' }}>
                    <h2 className="stat-number" style={{ fontSize: '32px' }}>
                      {stats.averageRating > 0 ? stats.averageRating.toFixed(2) : 'No Ratings'}
                    </h2>
                    {stats.averageRating > 0 && <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>out of 5</span>}
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <Stars rating={Math.round(stats.averageRating)} size={16} />
                  </div>
                </div>
                <div className="stat-icon-wrapper" style={{ background: 'hsla(48, 96%, 53%, 0.15)', color: 'var(--accent-gold)' }}>
                  <Award size={26} />
                </div>
              </div>

              <div className="card stat-card" style={{ padding: '20px 24px' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Submissions</p>
                  <h2 className="stat-number" style={{ fontSize: '32px', marginTop: '6px' }}>{stats.totalRatings}</h2>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Submitters from platform users</p>
                </div>
                <div className="stat-icon-wrapper">
                  <Users size={26} />
                </div>
              </div>
            </div>

          </div>

          {/* Raters list section */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px' }}>Users Who Rated Your Store</h2>
            <span className="user-badge" style={{ fontSize: '11px' }}>{stats.raters.length} Record{stats.raters.length === 1 ? '' : 's'}</span>
          </div>

          <Table
            headers={tableHeaders}
            data={sortedRaters}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            emptyMessage="No users have submitted ratings for your store yet."
            renderRow={(rater: Rater) => (
              <tr key={rater.userId}>
                <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{rater.userName}</td>
                <td>{rater.userEmail}</td>
                <td style={{ fontSize: '13px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {rater.userAddress}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Stars rating={rater.rating} size={14} />
                    <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-main)' }}>{rater.rating}</span>
                  </div>
                </td>
                <td style={{ fontSize: '13px' }}>
                  {new Date(rater.ratedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
            )}
          />
        </div>
      ) : (
        <div className="card empty-state">
          <Info size={48} className="empty-state-icon" />
          <p>No store profile data found associated with this account.</p>
        </div>
      )}
    </div>
  );
};

export default StoreOwnerDashboard;
