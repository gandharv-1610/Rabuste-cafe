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
      setError('Google Maps API key is not configured. Please add REACT_APP_GOOGLE_MAPS_API_KEY to client/.env file. Get your key from: https://console.cloud.google.com/');
      setLoading(false);
      return;
    }

    if (!PLACE_ID) {
      console.error('GoogleReviewsSlider: PLACE_ID is missing');
      setError('Google Place ID is not configured. Please set REACT_APP_GOOGLE_PLACE_ID in client/.env file. Get your Place ID from: https://developers.google.com/maps/documentation/places/web-service/place-id');
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
            
            // Provide helpful error messages
            let errorMsg = `Failed to fetch reviews: ${statusText || status}`;
            if (status === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
              errorMsg = 'Places API request denied. Please check: 1) Places API is enabled in Google Cloud Console, 2) API key has Places API access, 3) Billing is enabled.';
            } else if (status === window.google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
              errorMsg = 'Invalid Place ID. Please verify REACT_APP_GOOGLE_PLACE_ID in client/.env file is correct.';
            } else if (status === window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
              errorMsg = 'Places API quota exceeded. Please check your Google Cloud Console for usage limits.';
            }
            
            setError(errorMsg);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error('Error fetching Google reviews:', err);
        let errorMsg = 'Failed to load reviews. ';
        if (err.message?.includes('script') || err.message?.includes('load')) {
          errorMsg += 'Failed to load Google Maps script. Please check: 1) API key is correct, 2) Maps JavaScript API is enabled, 3) No network/CORS issues.';
        } else if (err.message?.includes('API')) {
          errorMsg += 'API error. Please verify your Google Maps API key and ensure Places API is enabled in Google Cloud Console.';
        } else {
          errorMsg += 'Please check your browser console for details and verify your API configuration.';
        }
        setError(errorMsg);
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

  // Render star rating with enhanced styling
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-coffee-amber drop-shadow-[0_0_4px_rgba(255,111,0,0.4)] text-lg md:text-xl">
          ⭐
        </span>
      );
    }
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-coffee-amber/70 drop-shadow-[0_0_4px_rgba(255,111,0,0.3)] text-lg md:text-xl">
          ⭐
        </span>
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-coffee-light/20 text-lg md:text-xl">
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
            spaceBetween={20}
            slidesPerView={1}
            speed={300}
            touchRatio={1}
            threshold={10}
            resistance={true}
            resistanceRatio={0.85}
            breakpoints={{
              640: {
                spaceBetween: 24,
                slidesPerView: 1,
              },
              768: {
                spaceBetween: 28,
                slidesPerView: 2,
              },
              1024: {
                spaceBetween: 32,
                slidesPerView: 3,
              },
            }}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
              hideOnClick: false,
            }}
            touchEventsTarget="container"
            allowTouchMove={true}
            loop={reviews.length >= 3}
            className="google-reviews-swiper"
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={`review-${review.author_name}-${review.time || index}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group h-full"
                >
                  {/* Enhanced Card with gradient background and glow effect */}
                  <div className="relative bg-gradient-to-br from-coffee-darker/95 via-coffee-brown/70 to-coffee-dark/95 border-2 border-coffee-amber/30 rounded-2xl p-6 md:p-7 h-full flex flex-col shadow-xl hover:shadow-[0_20px_50px_rgba(255,111,0,0.15)] hover:border-coffee-amber/50 transition-all duration-500 overflow-hidden backdrop-blur-sm">
                    {/* Animated gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-coffee-amber/5 via-transparent to-coffee-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    
                    {/* Subtle glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-coffee-amber/20 via-coffee-gold/20 to-coffee-amber/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"></div>
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Rating Section - Enhanced */}
                      <div className="mb-5">
                        <div className="flex items-center gap-1.5 mb-3">
                          {renderStars(review.rating)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-coffee-light/70">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(review.time)}</span>
                        </div>
                      </div>

                      {/* Review Text - Enhanced typography */}
                      <div className="mb-6 flex-grow">
                        <p className="text-coffee-light/90 leading-relaxed text-sm md:text-base line-clamp-6 font-light">
                          "{review.text}"
                        </p>
                      </div>

                      {/* Author Info - Enhanced */}
                      <div className="flex items-center gap-4 pt-5 border-t border-coffee-amber/20 group-hover:border-coffee-amber/40 transition-colors duration-300">
                        {review.profile_photo_url && imageLoadStates[review.profile_photo_url] !== 'error' ? (
                          <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-coffee-amber/40 to-coffee-gold/40 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
                            <img
                              key={`img-${review.profile_photo_url}`}
                              src={review.profile_photo_url}
                              alt={review.author_name}
                              className="relative w-14 h-14 rounded-full object-cover border-2 border-coffee-amber/40 shadow-lg group-hover:border-coffee-amber/60 group-hover:scale-105 transition-all duration-300"
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
                          </div>
                        ) : null}
                        {/* Show fallback only if no photo URL OR if image failed to load */}
                        {(!review.profile_photo_url || imageLoadStates[review.profile_photo_url] === 'error') && (
                          <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-coffee-amber/40 to-coffee-gold/40 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></div>
                            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-coffee-amber/40 via-coffee-gold/30 to-coffee-brown/50 flex items-center justify-center border-2 border-coffee-amber/40 shadow-lg group-hover:border-coffee-amber/60 group-hover:scale-105 transition-all duration-300">
                              <span className="text-coffee-darker text-xl font-bold">
                                {review.author_name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <a
                            href={review.author_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-coffee-amber font-bold text-base hover:text-coffee-gold transition-colors block truncate group-hover:translate-x-1 transition-transform duration-300"
                          >
                            {review.author_name}
                          </a>
                          <div className="flex items-center gap-1.5 mt-1">
                            <svg className="w-3.5 h-3.5 text-coffee-gold" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-xs text-coffee-light/60 font-medium">Verified Google Reviewer</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
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
          background: rgba(255, 111, 0, 0.1);
          backdrop-filter: blur(10px);
          width: 44px !important;
          height: 44px !important;
          border-radius: 50%;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(255, 111, 0, 0.2);
        }
        .google-reviews-swiper .swiper-button-next:hover,
        .google-reviews-swiper .swiper-button-prev:hover {
          background: rgba(255, 111, 0, 0.2);
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(255, 111, 0, 0.3);
        }
        .google-reviews-swiper .swiper-button-next::after,
        .google-reviews-swiper .swiper-button-prev::after {
          font-size: 18px !important;
          font-weight: bold;
        }
        /* Hide navigation arrows on mobile/small screens */
        @media (max-width: 768px) {
          .google-reviews-swiper .swiper-button-next,
          .google-reviews-swiper .swiper-button-prev {
            display: none !important;
          }
        }
        .google-reviews-swiper .swiper-pagination {
          bottom: -10px !important;
        }
        .google-reviews-swiper .swiper-pagination-bullet {
          width: 10px !important;
          height: 10px !important;
          background-color: rgba(188, 170, 164, 0.5) !important;
          opacity: 1 !important;
          transition: all 0.3s ease !important;
          margin: 0 4px !important;
        }
        .google-reviews-swiper .swiper-pagination-bullet-active {
          background-color: #FF6F00 !important;
          width: 24px !important;
          border-radius: 5px !important;
          box-shadow: 0 2px 8px rgba(255, 111, 0, 0.4);
        }
        .google-reviews-swiper .swiper-slide {
          transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          height: auto;
        }
        /* Enable touch/swipe on mobile */
        .google-reviews-swiper {
          touch-action: pan-y;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
          padding-bottom: 40px;
        }
        /* Smooth slide transitions */
        .google-reviews-swiper .swiper-wrapper {
          transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </section>
  );
};

export default GoogleReviewsSlider;


