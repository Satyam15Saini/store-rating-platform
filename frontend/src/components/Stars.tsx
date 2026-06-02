import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarsProps {
  rating: number;
  maxStars?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: number;
}

const Stars: React.FC<StarsProps> = ({
  rating,
  maxStars = 5,
  interactive = false,
  onRatingChange,
  size = 20,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  return (
    <div 
      className={interactive ? 'stars-interactive' : 'stars-display'}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;

        return (
          <button
            key={index}
            type="button"
            className={interactive ? 'star-interactive-btn' : ''}
            disabled={!interactive}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: interactive ? 'pointer' : 'default' 
            }}
          >
            <Star
              size={size}
              strokeWidth={isFilled ? 0 : 2}
              fill={isFilled ? 'var(--accent-gold)' : 'none'}
              color={isFilled ? 'var(--accent-gold)' : 'var(--text-muted)'}
              style={{
                transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                animation: isFilled && interactive ? 'pulseStar 0.3s ease-out' : 'none'
              }}
            />
          </button>
        );
      })}
    </div>
  );
};

export default Stars;
