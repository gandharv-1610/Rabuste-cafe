import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const GoogleReviewsSlider = ({ placeId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [imageLoadStates, setImageLoadStates] = useState({}); // Track: 'loading' | 'loaded' | 'error'
  const scriptLoadedRef = useRef(false);

  // Default Place ID - can be overridden via prop or env
  const PLACE_ID = placeId || process.env.REACT_APP_GOOGLE_PLACE_ID || '';
  const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!API_KEY) {
      setError('Google Maps API key is not configured');
      setLoading(false);
      return;
    }

    if (!PLACE_ID) {
      setError('Google Place ID is not configured. Please set REACT_APP_GOOGLE_PLACE_ID in your .env file');
      setLoading(false);
      return;
    }

    // Load Google Maps JavaScript API script
    const loadGoogleMapsScript = () => {
      if (scriptLoadedRef.current) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          scriptLoadedRef.current = true;
          if (window.google && window.google.maps && window.google.maps.places) {
            setGoogleLoaded(true);
            resolve();
            return;
          }
          // Wait for script to load
          existingScript.addEventListener('load', () => {
            scriptLoadedRef.current = true;
            setGoogleLoaded(true);
            resolve();
          });
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          scriptLoadedRef.current = true;
          setGoogleLoaded(true);
          resolve();
        };
        script.onerror = () => {
          reject(new Error('Failed to load Google Maps script'));
        };
        document.head.appendChild(script);
      });
    };

    // Fetch reviews using Places API
    const fetchReviews = async () => {
      try {
        await loadGoogleMapsScript();

        // Wait for Google Maps API to be fully loaded
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          // Retry after a short delay
          setTimeout(() => {
            if (window.google && window.google.maps && window.google.maps.places) {
              fetchReviews();
            } else {
              setError('Google Maps Places API failed to load');
              setLoading(false);
            }
          }, 500);
          return;
        }

        // Use the new Places API (PlacesService)
        const service = new window.google.maps.places.PlacesService(
          document.createElement('div')
        );

        // Use Place Details request
        const request = {
          placeId: PLACE_ID,
          fields: ['reviews', 'rating', 'user_ratings_total', 'name'],
        };

        service.getDetails(request, (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const placeReviews = place.reviews || [];
            // Debug: Log reviews to see what data we're getting
            console.log('Google Reviews Data:', placeReviews);
            placeReviews.forEach((review, idx) => {
              console.log(`Review ${idx}:`, {
                author_name: review.author_name,
                profile_photo_url: review.profile_photo_url,
                author_url: review.author_url,
                rating: review.rating
              });
            });
            // Limit to top 5-6 reviews
            const topReviews = placeReviews.slice(0, 6);
            setReviews(topReviews);
            setLoading(false);
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            setError('No reviews found for this place');
            setLoading(false);
          } else {
            setError(`Failed to fetch reviews: ${status}`);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error('Error fetching Google reviews:', err);
        setError('Failed to load reviews. Please try again later.');
        setLoading(false);
      }
    };

    fetchReviews();
  }, [API_KEY, PLACE_ID]);

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-coffee-amber">
          ⭐
        </span>
      );
    }
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-coffee-amber">
          ⭐
        </span>
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-coffee-light/30">
          ⭐
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <section className="py-20 px-4 bg-coffee-darker/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-amber"></div>
            <p className="mt-4 text-coffee-light">Loading reviews...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-4 bg-coffee-darker/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-coffee-light">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-coffee-darker/50 border-y border-coffee-brown/40">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-coffee-light/70 mb-2">
            Customer Feedback
          </p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-coffee-amber mb-4">
            What Our Customers Say 
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            speed={600}
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={true}
            loop={reviews.length > 3}
            className="google-reviews-swiper"
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={index}>
                <div className="bg-gradient-to-br from-coffee-darker/90 via-coffee-brown/60 to-coffee-darker/90 border border-coffee-brown/60 rounded-xl p-6 h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow">
                  {/* Rating */}
                  <div className="mb-4">
                    <div className="flex items-center gap-1 mb-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm text-coffee-light/80">
                      {formatDate(review.time)}
                    </p>
                  </div>

                  {/* Review Text */}
                  <p className="text-coffee-light mb-6 flex-grow line-clamp-6">
                    {review.text}
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-3 pt-4 border-t border-coffee-brown/40">
                    {review.profile_photo_url && imageLoadStates[review.profile_photo_url] !== 'error' ? (
                      <img
                        key={`img-${review.profile_photo_url}`}
                        src={review.profile_photo_url}
                        alt={review.author_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-coffee-amber/30"
                        loading="lazy"
                        onError={(e) => {
                          // Only mark as error once
                          if (imageLoadStates[review.profile_photo_url] !== 'error') {
                            console.warn('Failed to load profile photo:', {
                              url: review.profile_photo_url,
                              author: review.author_name
                            });
                            setImageLoadStates(prev => ({
                              ...prev,
                              [review.profile_photo_url]: 'error'
                            }));
                          }
                        }}
                        onLoad={() => {
                          // Mark as successfully loaded - this prevents fallback
                          setImageLoadStates(prev => ({
                            ...prev,
                            [review.profile_photo_url]: 'loaded'
                          }));
                        }}
                      />
                    ) : null}
                    {/* Show fallback only if no photo URL OR if image failed to load */}
                    {(!review.profile_photo_url || imageLoadStates[review.profile_photo_url] === 'error') && (
                      <div className="w-12 h-12 rounded-full bg-coffee-brown/50 flex items-center justify-center border-2 border-coffee-amber/30">
                        <span className="text-coffee-amber text-xl font-semibold">
                          {review.author_name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <a
                        href={review.author_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-coffee-amber font-semibold hover:text-coffee-gold transition-colors block"
                      >
                        {review.author_name}
                      </a>
                      <p className="text-xs text-coffee-light/60">Google Reviewer</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Attribution */}
          <div className="mt-8 text-center">
            <p className="text-xs text-coffee-light/60">
              Reviews powered by{' '}
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coffee-amber hover:text-coffee-gold transition-colors"
              >
                Google
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`
        .google-reviews-swiper .swiper-button-next,
        .google-reviews-swiper .swiper-button-prev {
          color: #FF6F00 !important;
          transition: opacity 0.2s ease;
        }
        .google-reviews-swiper .swiper-pagination-bullet-active {
          background-color: #FF6F00 !important;
        }
        .google-reviews-swiper .swiper-pagination-bullet {
          background-color: #BCAAA4 !important;
        }
        .google-reviews-swiper .swiper-slide {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </section>
  );
};

export default GoogleReviewsSlider;

