import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, AlertCircle, PlusCircle, Pencil, Info, Check } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import Stars from '../../components/Stars';
import Modal from '../../components/Modal';

interface StoreItem {
  id: number;
  name: string;
  address: string;
  overallRating: number;
  userRating: number | null;
  totalRatings: number;
}

const UserDashboard: React.FC = () => {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  // Search/Filter State
  const [searchTerm, setSearchTerm] = useState('');

  // Rating Modal State
  const [isRateOpen, setIsRateOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreItem | null>(null);
  const [inputRating, setInputRating] = useState<number>(5);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState<string[]>([]);
  const [rateSuccess, setRateSuccess] = useState('');

  const fetchStores = async () => {
    setLoading(true);
    setErrors([]);
    const response = await apiRequest<StoreItem[]>('/user/stores');
    setLoading(false);

    if (response.success && response.data) {
      setStores(response.data);
    } else {
      setErrors(response.errors || ['Failed to load store listings.']);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleOpenRateModal = (store: StoreItem) => {
    setSelectedStore(store);
    setInputRating(store.userRating || 5);
    setRateError([]);
    setRateSuccess('');
    setIsRateOpen(true);
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;

    setRateError([]);
    setRateSuccess('');
    setRateLoading(true);

    const response = await apiRequest('/user/rate', {
      method: 'POST',
      body: {
        storeId: selectedStore.id,
        rating: inputRating,
      },
    });

    setRateLoading(false);

    if (response.success) {
      setRateSuccess('Rating submitted successfully!');
      // Instantly refetch store list to update the visual average and user badge
      await fetchStores();
      
      // Auto-close modal after a brief duration
      setTimeout(() => {
        setIsRateOpen(false);
      }, 1000);
    } else {
      setRateError(response.errors || ['Failed to submit rating.']);
    }
  };

  // Live filter matching search term in name and address
  const filteredStores = stores.filter((store) => {
    const term = searchTerm.toLowerCase();
    return (
      store.name.toLowerCase().includes(term) ||
      store.address.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container animate-fade">
      {/* Top Welcome Title */}
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Find & Rate Stores</h1>
          <p>Browse through registered stores, search locations, and cast your star ratings.</p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <div>{errors.join(' | ')}</div>
        </div>
      )}

      {/* Modern Search Row */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '32px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Search size={20} />
          </span>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 52 }}
            placeholder="Search stores by Name, Location, or Address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Stores */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p>Loading stores list...</p>
        </div>
      ) : filteredStores.length > 0 ? (
        <div className="store-grid">
          {filteredStores.map((store) => {
            const hasUserRated = store.userRating !== null;

            return (
              <div key={store.id} className="card store-card animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Store Header */}
                <div className="store-card-header">
                  <h3 className="store-card-title">{store.name}</h3>
                  {hasUserRated && (
                    <span className="user-rating-badge animate-fade">
                      Rated {store.userRating} ★
                    </span>
                  )}
                </div>

                {/* Location Address */}
                <div className="store-card-address">
                  <MapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span>{store.address}</span>
                </div>

                {/* Vertical Divider */}
                <div className="store-card-divider" style={{ marginTop: 'auto' }}></div>

                {/* Star rating summary & actions */}
                <div className="store-card-rating-section">
                  <div>
                    <span className="rating-label">Overall Rating</span>
                    <div className="rating-value">
                      <Star size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
                      <span>{store.overallRating > 0 ? store.overallRating.toFixed(1) : 'No Ratings'}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>
                        ({store.totalRatings} user{store.totalRatings === 1 ? '' : 's'})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenRateModal(store)}
                    className={`btn ${hasUserRated ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {hasUserRated ? (
                      <>
                        <Pencil size={13} />
                        <span>Modify Rating</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle size={13} />
                        <span>Submit Rating</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card empty-state animate-fade">
          <Info size={48} className="empty-state-icon" />
          <h3>No Stores Found</h3>
          <p style={{ marginTop: '6px' }}>Try modifying your search term or check back later once stores are added.</p>
        </div>
      )}

      {/* ==================== SUBMIT/MODIFY RATING MODAL ==================== */}
      <Modal 
        isOpen={isRateOpen} 
        onClose={() => setIsRateOpen(false)} 
        title={selectedStore?.userRating ? `Modify Rating for ${selectedStore.name}` : `Rate ${selectedStore?.name}`}
      >
        {rateSuccess && (
          <div className="alert alert-success animate-fade">
            <Check size={18} />
            <div>{rateSuccess}</div>
          </div>
        )}

        {rateError.length > 0 && (
          <div className="alert alert-error animate-fade">
            <AlertCircle size={18} />
            <div>{rateError.join('\n')}</div>
          </div>
        )}

        {selectedStore && (
          <form onSubmit={handleRateSubmit}>
            <div className="store-details-group" style={{ marginBottom: '24px' }}>
              <div className="store-details-label">Store Location</div>
              <div className="store-details-val" style={{ fontSize: '13.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <MapPin size={12} color="var(--primary)" />
                <span>{selectedStore.address}</span>
              </div>
            </div>

            <div style={{ background: 'hsla(217, 33%, 12%, 0.4)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
              <div className="store-details-label" style={{ marginBottom: '12px' }}>
                Select rating score (1 to 5 stars)
              </div>
              <Stars 
                rating={inputRating} 
                interactive={true} 
                onRatingChange={setInputRating} 
                size={36} 
              />
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '12px' }}>
                {inputRating} Star{inputRating === 1 ? '' : 's'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsRateOpen(false)}
                style={{ flex: 1 }}
                disabled={rateLoading}
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 2 }}
                disabled={rateLoading}
              >
                {rateLoading ? 'Submitting Rating...' : selectedStore.userRating ? 'Update Star Rating' : 'Submit Star Rating'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default UserDashboard;
