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
  const [imageLoadStates, setImageLoadStates] = useState({}); // Track: 'loading' | 'loaded' | 'error'
  const scriptLoadedRef = useRef(false);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 10;

  // Default Place ID - can be overridden via prop or env
  const PLACE_ID = placeId || process.env.REACT_APP_GOOGLE_PLACE_ID || '';
  const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    // Reset states
    setLoading(true);
    setError(null);
    setReviews([]);
    retryCountRef.current = 0;
    
    // Debug logging
    console.log('GoogleReviewsSlider: Component mounted', {
      hasAPIKey: !!API_KEY,
      apiKeyLength: API_KEY?.length,
      hasPlaceId: !!PLACE_ID,
      placeId: PLACE_ID
    });
    
    if (!API_KEY) {
      console.error('GoogleReviewsSlider: API_KEY is missing');
      setError('Google Maps API key is not configured');
      setLoading(false);
      return;
    }

    if (!PLACE_ID) {
      console.error('GoogleReviewsSlider: PLACE_ID is missing');
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
            resolve();
            return;
          }
          // Wait for script to load
          existingScript.addEventListener('load', () => {
            scriptLoadedRef.current = true;
            resolve();
          });
          existingScript.addEventListener('error', () => {
            reject(new Error('Failed to load Google Maps script'));
          });
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          scriptLoadedRef.current = true;
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

        // Wait for Google Maps API to be fully loaded with retry limit
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current += 1;
            // Retry after a short delay
            setTimeout(() => {
              fetchReviews(); // Continue retrying up to MAX_RETRIES
            }, 500);
            return;
          } else {
            setError('Google Maps Places API failed to load after multiple attempts');
            setLoading(false);
            return;
          }
        }
        
        // Reset retry count on successful load
        retryCountRef.current = 0;

        // Create a map element for PlacesService (it requires a Map instance)
        const mapDiv = document.createElement('div');
        const map = new window.google.maps.Map(mapDiv, {
          center: { lat: 0, lng: 0 },
          zoom: 1,
        });

        // Use the new Places API (PlacesService)
        const service = new window.google.maps.places.PlacesService(map);

        // Use Place Details request
        // Note: 'reviews' field includes profile_photo_url automatically when available
        const request = {
          placeId: PLACE_ID,
          fields: ['reviews', 'rating', 'user_ratings_total', 'name', 'formatted_address'],
        };

        console.log('GoogleReviewsSlider: Making Places API request with:', request);
        
        service.getDetails(request, (place, status) => {
          console.log('GoogleReviewsSlider: Places API callback received', { status, hasPlace: !!place });
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const placeReviews = place.reviews || [];
            // Debug: Log reviews to see what data we're getting
            console.log('GoogleReviewsSlider: Place details received', {
              reviewCount: placeReviews.length,
              placeName: place.name,
              rating: place.rating,
              totalRatings: place.user_ratings_total
            });
            console.log('GoogleReviewsSlider: Reviews array:', placeReviews);
            
            if (placeReviews.length > 0) {
              placeReviews.forEach((review, idx) => {
                console.log(`GoogleReviewsSlider: Review ${idx}:`, {
                  author_name: review.author_name,
                  rating: review.rating,
                  time: review.time,
                  text_length: review.text?.length,
                  has_photo: !!review.profile_photo_url,
                  profile_photo_url: review.profile_photo_url
                });
              });
              // Limit to top 5-6 reviews and ensure profile_photo_url is available
              const topReviews = placeReviews.slice(0, 6).map(review => {
                // Log if profile photo URL exists but might be restricted
                if (review.profile_photo_url) {
                  console.log(`Profile photo URL for ${review.author_name}:`, review.profile_photo_url);
                }
                return review;
              });
              console.log('GoogleReviewsSlider: Setting reviews state with', topReviews.length, 'reviews');
              setReviews(topReviews);
            } else {
              console.warn('GoogleReviewsSlider: No reviews found in place details. Place data:', place);
              setReviews([]);
            }
            setLoading(false);
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            console.warn('GoogleReviewsSlider: Place not found or has no reviews. Status:', status);
            setReviews([]);
            setLoading(false);
          } else {
            console.error('GoogleReviewsSlider: Places API error. Status:', status);
            const statusText = Object.keys(window.google.maps.places.PlacesServiceStatus).find(
              key => window.google.maps.places.PlacesServiceStatus[key] === status
            );
            setError(`Failed to fetch reviews: ${statusText || status}`);
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
    
    // Cleanup function to prevent memory leaks
    return () => {
      retryCountRef.current = 0;
    };
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

  // Debug: Log current state
  console.log('GoogleReviewsSlider: Render state', { 
    loading, 
    error, 
    reviewsCount: reviews.length,
    hasReviews: reviews.length > 0
  });

  if (reviews.length === 0 && !loading && !error) {
    // Don't show anything if no reviews found (component returns null)
    console.log('GoogleReviewsSlider: Returning null - no reviews, not loading, no error');
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
            loop={reviews.length >= 3}
            className="google-reviews-swiper"
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={`review-${review.author_name}-${review.time || index}`}>
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
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Only mark as error once
                          if (imageLoadStates[review.profile_photo_url] !== 'error') {
                            console.warn('Failed to load profile photo:', {
                              url: review.profile_photo_url,
                              author: review.author_name,
                              error: 'Image failed to load - may be blocked by CORS or unavailable'
                            });
                            setImageLoadStates(prev => ({
                              ...prev,
                              [review.profile_photo_url]: 'error'
                            }));
                            // Hide the broken image
                            e.target.style.display = 'none';
                          }
                        }}
                        onLoad={() => {
                          // Mark as successfully loaded - this prevents fallback
                          console.log('Profile photo loaded successfully:', review.author_name);
                          setImageLoadStates(prev => ({
                            ...prev,
                            [review.profile_photo_url]: 'loaded'
                          }));
                        }}
                      />
                    ) : null}
                    {/* Show fallback only if no photo URL OR if image failed to load */}
                    {(!review.profile_photo_url || imageLoadStates[review.profile_photo_url] === 'error') && (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coffee-brown/60 to-coffee-amber/20 flex items-center justify-center border-2 border-coffee-amber/30 shadow-sm">
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


