import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Chatbot from '../components/Chatbot';
import VideoPlayer from '../components/VideoPlayer';
import GoogleReviewsSlider from '../components/GoogleReviewsSlider';
import api from '../api/axios';
import heroLogo from '../assets/rabuste-logo-horizontal.png';

const Home = () => {
  const [heroMedia, setHeroMedia] = React.useState(null);
  const [brewingMedia, setBrewingMedia] = React.useState(null);
  const [artStoryMedia, setArtStoryMedia] = React.useState(null);
  const [workshopStoryMedia, setWorkshopStoryMedia] = React.useState(null);
  const [franchiseStoryMedia, setFranchiseStoryMedia] = React.useState(null);
  const [offers, setOffers] = React.useState([]);

  React.useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await api.get('/site-media', {
          params: { page: 'home', isActive: true, _t: Date.now() }, // Cache busting
        });
        const entries = response.data || [];
        const hero = entries.find((m) => m.section === 'home_hero_background');
        const brewing = entries.find((m) => m.section === 'home_story_coffee');
        const artStory = entries.find((m) => m.section === 'home_story_art');
        const workshopStory = entries.find((m) => m.section === 'home_story_workshops');
        const franchiseStory = entries.find((m) => m.section === 'home_story_franchise');
        setHeroMedia(hero || null);
        setBrewingMedia(brewing || null);
        setArtStoryMedia(artStory || null);
        setWorkshopStoryMedia(workshopStory || null);
        setFranchiseStoryMedia(franchiseStory || null);
      } catch (error) {
        console.error('Error fetching home media:', error);
      }
    };

    fetchMedia();

    const fetchOffers = async () => {
      try {
        const response = await api.get('/offers', {
          params: { _t: Date.now() }, // Cache busting
        });
        const all = response.data || [];
        const now = new Date();

        const activeOffers = all.filter((offer) => {
          if (offer.isActive === false) return false;
          const start = offer.startDate ? new Date(offer.startDate) : null;
          const end = offer.endDate ? new Date(offer.endDate) : null;
          if (start && now < start) return false;
          if (end && now > end) return false;
          return true;
        });

        setOffers(activeOffers);
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    };

    fetchOffers();
  }, []);

  return (
    <div className="pt-20">
      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Background - from configurable Site Media */}
        {heroMedia && heroMedia.mediaType === 'video' ? (
          <VideoPlayer
            videoUrl={heroMedia.url}
            autoplay={true}
            muted={true}
            className="absolute inset-0 z-0"
          />
        ) : heroMedia ? (
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroMedia.url}?v=${heroMedia.updatedAt || Date.now()})`,
            }}
          ></div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-coffee-darker via-coffee-dark to-coffee-darker opacity-80"></div>
        )}
        
        {/* Pattern Overlay (if no video/image) */}
        {!heroMedia && (
          <div className="absolute inset-0" style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%235D4037" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
          }}></div>
        )}
        
        {/* Enhanced Gradient Overlay with Color Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-coffee-darkest/90 via-coffee-darker/75 to-coffee-dark/80 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-coffee-amber/5 via-transparent to-coffee-gold/5 z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center px-4 max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-coffee-amber/20 blur-2xl rounded-full"></div>
              <img
                src={heroLogo}
                alt="Rabuste Coffee logo"
                className="relative h-24 md:h-32 object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-heading font-bold mb-6 bg-gradient-to-r from-coffee-amber via-coffee-gold to-coffee-amber bg-clip-text text-transparent leading-tight"
          >
            Bold Robusta.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl md:text-4xl font-heading text-coffee-creamLight mb-6 font-medium"
          >
            Coffee × Art × Technology
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-coffee-light max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Experience the finest Robusta coffee in a cozy space where bold flavors meet creative art and innovative technology.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-5 justify-center"
          >
            <Link
              to="/coffee"
              className="group relative bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darkest px-10 py-4 rounded-xl font-semibold hover:from-coffee-amberLight hover:to-coffee-goldLight transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              <span className="relative z-10">Explore Coffee</span>
              <div className="absolute inset-0 bg-gradient-to-r from-coffee-gold to-coffee-amber rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/art"
              className="group relative bg-transparent border-2 border-coffee-amber/80 text-coffee-amber px-10 py-4 rounded-xl font-semibold hover:bg-coffee-amber/10 hover:border-coffee-amber transition-all duration-300 backdrop-blur-sm hover:scale-105 transform"
            >
              View Art Gallery
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Daily Offers */}
      {offers.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-b from-coffee-darkest via-coffee-darker to-coffee-darkest border-y border-coffee-amber/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-coffee-amber/5 via-transparent to-coffee-gold/5"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-10 text-center"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-coffee-gold/80 mb-3 font-semibold">
                Today at Rabuste
              </p>
              <h2 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-coffee-amber via-coffee-gold to-coffee-amber bg-clip-text text-transparent">
                Daily Offers & Specials
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            >
              {offers.slice(0, 6).map((offer) => (
                <motion.div
                  key={offer._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="relative rounded-2xl bg-gradient-to-br from-coffee-darker/95 via-coffee-brown/70 to-coffee-dark/90 border border-coffee-amber/30 shadow-xl hover:shadow-2xl hover:border-coffee-amber/50 px-6 py-5 flex flex-col h-full transition-all duration-300 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-coffee-amber/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      {offer.badgeText && (
                        <span className="inline-block text-[10px] font-semibold px-2 py-1 rounded-full bg-coffee-amber/15 text-coffee-amber tracking-[0.18em] uppercase mb-2">
                          {offer.badgeText}
                        </span>
                      )}
                      <h3 className="text-lg md:text-xl font-heading font-semibold text-coffee-amber leading-snug">
                        {offer.title}
                      </h3>
                      {offer.subtitle && (
                        <p className="text-xs text-coffee-light/80 mt-1">
                          {offer.subtitle}
                        </p>
                      )}
                    </div>
                    {offer.highlight && (
                      <span className="ml-2 text-[10px] px-2 py-1 rounded-full bg-green-500/15 text-green-400 font-semibold uppercase tracking-[0.16em]">
                        Featured
                      </span>
                    )}
                  </div>
                  {offer.discountValue > 0 && (
                    <p className="text-sm font-semibold text-coffee-amber mb-1">
                      {offer.discountUnit === 'percent'
                        ? `${offer.discountValue}% off`
                        : `Flat ₹${offer.discountValue} off`}
                    </p>
                  )}
                  {offer.description && (
                    <p className="text-xs text-coffee-light/90 mb-1 line-clamp-3">
                      {offer.description}
                    </p>
                  )}
                  {offer.terms && (
                    <p className="text-[11px] text-coffee-light/60 mb-2">
                      {offer.terms}
                    </p>
                  )}
                    <p className="mt-auto pt-1 text-[11px] text-coffee-light/60">
                      {offer.startDate
                        ? `From ${new Date(offer.startDate).toLocaleDateString()}`
                        : 'Starts today'}
                      {offer.endDate
                        ? ` • Until ${new Date(offer.endDate).toLocaleDateString()}`
                        : ''}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Story Sections */}
      <section className="py-24 px-4 max-w-7xl mx-auto relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-coffee-amber/3 to-transparent pointer-events-none"></div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20 relative z-10"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-coffee-gold/70 mb-4 font-semibold">
            Discover Our Journey
          </p>
          <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6 bg-gradient-to-r from-coffee-amber via-coffee-gold to-coffee-amber bg-clip-text text-transparent">
            Our Story
          </h2>
          <p className="text-xl md:text-2xl text-coffee-light max-w-3xl mx-auto leading-relaxed">
            Rabuste Coffee is more than a café—it's a bold statement about what coffee can be.
          </p>
        </motion.div>

        <div className="space-y-32">
          {/* Café Philosophy */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-12 items-center"

          >
            <div>
              <h3 className="text-3xl font-heading font-bold text-coffee-amber mb-4">
                Bold Coffee, Cozy Space
              </h3>
              <p className="text-coffee-light text-lg mb-4">
                We've made a deliberate choice to serve only Robusta coffee—the boldest, most full-bodied coffee experience available. Our grab-and-go concept brings premium quality to your daily routine.
              </p>
              <p className="text-coffee-light text-lg">
                Step into our cozy space where every cup tells a story of strength, character, and uncompromising flavor.
              </p>
            </div>
            <div className="bg-gradient-to-br from-coffee-brown/40 to-coffee-dark/60 rounded-2xl overflow-hidden aspect-square shadow-2xl border border-coffee-amber/20 group hover:border-coffee-amber/40 transition-all duration-300">
              {/* Brewing media from Site Media (image or video) */}
              {brewingMedia && brewingMedia.mediaType === 'video' ? (
                <VideoPlayer
                  videoUrl={brewingMedia.url}
                  autoplay={true}
                  muted={true}
                  className="w-full h-full"
                />
              ) : brewingMedia ? (
                <img 
                  src={`${brewingMedia.url}?v=${brewingMedia.updatedAt || Date.now()}`}
                  alt="Coffee brewing process" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-6xl">☕</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Art Gallery */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-12 items-center"

          >
            <div className="bg-coffee-brown/30 rounded-lg overflow-hidden aspect-square order-2 md:order-1 flex items-center justify-center">
              {artStoryMedia && artStoryMedia.mediaType === 'video' ? (
                <VideoPlayer
                  videoUrl={artStoryMedia.url}
                  autoplay={true}
                  muted={true}
                  className="w-full h-full"
                />
              ) : artStoryMedia ? (
                <img
                  src={`${artStoryMedia.url}?v=${artStoryMedia.updatedAt || Date.now()}`}
                  alt="Art gallery at Rabuste Coffee"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl">🎨</span>
              )}
            </div>
            <div className="order-1 md:order-2 relative z-10">
              <h3 className="text-3xl font-heading font-bold text-coffee-amber mb-4">
                Micro Art Gallery
              </h3>
              <p className="text-coffee-light text-lg mb-4">
                Our café doubles as a micro art gallery, showcasing fine art from talented artists. Each piece tells a story, creating an immersive cultural experience alongside your coffee.
              </p>
              <Link
                to="/art"
                className="inline-block text-coffee-amber font-semibold hover:underline cursor-pointer transition-colors hover:text-coffee-gold relative z-20 pointer-events-auto"
              >
                Explore Art Gallery →
              </Link>
            </div>
          </motion.div>

          {/* Workshops */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-12 items-center"

          >
            <div className="relative z-10">
              <h3 className="text-3xl font-heading font-bold text-coffee-amber mb-4">
                Workshops & Community
              </h3>
              <p className="text-coffee-light text-lg mb-4">
                Join us for coffee workshops, art & creativity sessions, and community events. Learn the art of brewing, explore your creativity, and connect with like-minded enthusiasts.
              </p>
              <Link
                to="/workshops"
                className="inline-block text-coffee-amber font-semibold hover:underline cursor-pointer transition-colors hover:text-coffee-gold relative z-20 pointer-events-auto"
              >
                View Workshops →
              </Link>
            </div>
            <div className="bg-coffee-brown/30 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
              {workshopStoryMedia && workshopStoryMedia.mediaType === 'video' ? (
                <VideoPlayer
                  videoUrl={workshopStoryMedia.url}
                  autoplay={true}
                  muted={true}
                  className="w-full h-full"
                />
              ) : workshopStoryMedia ? (
                <img
                  src={`${workshopStoryMedia.url}?v=${workshopStoryMedia.updatedAt || Date.now()}`}
                  alt="Workshops and community at Rabuste Coffee"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl">👥</span>
              )}
            </div>
          </motion.div>

          {/* Franchise */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-12 items-center"

          >
            <div className="bg-coffee-brown/30 rounded-lg overflow-hidden aspect-square flex items-center justify-center order-2 md:order-1">
              {franchiseStoryMedia && franchiseStoryMedia.mediaType === 'video' ? (
                <VideoPlayer
                  videoUrl={franchiseStoryMedia.url}
                  autoplay={true}
                  muted={true}
                  className="w-full h-full"
                />
              ) : franchiseStoryMedia ? (
                <img
                  src={`${franchiseStoryMedia.url}?v=${franchiseStoryMedia.updatedAt || Date.now()}`}
                  alt="Rabuste Coffee franchise"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl">🚀</span>
              )}
            </div>
            <div className="order-1 md:order-2 relative z-10">
              <h3 className="text-3xl font-heading font-bold text-coffee-amber mb-4">
                Join the Movement
              </h3>
              <p className="text-coffee-light text-lg mb-4">
                Ready to bring the Rabuste Coffee experience to your community? Explore our franchise opportunities and become part of a bold, scalable café concept.
              </p>
              <Link
                to="/franchise"
                className="inline-block text-coffee-amber font-semibold hover:underline cursor-pointer transition-colors hover:text-coffee-gold relative z-20 pointer-events-auto"
              >
                Franchise Opportunity →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-coffee-dark via-coffee-darker to-coffee-darkest relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-coffee-amber/10 via-coffee-gold/5 to-coffee-amber/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,111,0,0.1),transparent_70%)]"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-coffee-gold/80 mb-4 font-semibold">
            Join The Experience
          </p>
          <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6 bg-gradient-to-r from-coffee-amber via-coffee-gold to-coffee-amber bg-clip-text text-transparent">
            Ready to Experience Bold Robusta?
          </h2>
          <p className="text-xl md:text-2xl text-coffee-light mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover our menu, explore our art gallery, or join our workshops.
          </p>
          <div className="flex flex-wrap gap-5 justify-center">
            <Link
              to="/coffee"
              className="group relative bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darkest px-10 py-4 rounded-xl font-semibold hover:from-coffee-amberLight hover:to-coffee-goldLight transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              <span className="relative z-10">Coffee Menu</span>
            </Link>
            <Link
              to="/art"
              className="group relative bg-gradient-to-r from-coffee-brown to-coffee-medium text-coffee-creamLight px-10 py-4 rounded-xl font-semibold hover:from-coffee-medium hover:to-coffee-light transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              Art Gallery
            </Link>
            <Link
              to="/workshops"
              className="group relative bg-gradient-to-r from-coffee-brown to-coffee-medium text-coffee-creamLight px-10 py-4 rounded-xl font-semibold hover:from-coffee-medium hover:to-coffee-light transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              Workshops
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Google Reviews Section */}
      <GoogleReviewsSlider />

      {/* Contact & Location Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-coffee-darkest to-coffee-darker border-t border-coffee-amber/20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-coffee-amber/5 via-transparent to-coffee-gold/5"></div>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 relative z-10"
          >
            <p className="text-sm uppercase tracking-[0.3em] text-coffee-gold/80 mb-4 font-semibold">
              Find Us
            </p>
            <h2 className="text-5xl md:text-6xl font-heading font-bold mb-4 bg-gradient-to-r from-coffee-amber via-coffee-gold to-coffee-amber bg-clip-text text-transparent">
              Visit Us
            </h2>
            <p className="text-xl md:text-2xl text-coffee-light">
              Come experience bold Robusta coffee in our cozy space
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 relative z-10">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-br from-coffee-brown/30 to-coffee-dark/40 rounded-2xl p-8 border border-coffee-amber/20 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <h3 className="text-2xl font-heading font-bold text-coffee-amber mb-6">
                Contact & Location
              </h3>
              
              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    <svg
                      className="w-6 h-6 text-coffee-amber"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-coffee-amber mb-2">Address</h4>
                    <p className="text-coffee-light leading-relaxed">
                      RABUSTE, Dimpal Row House, 15,<br />
                      Gymkhana Rd, Piplod, Surat,<br />
                      Gujarat 395007
                    </p>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=RABUSTE,+Dimpal+Row+House,+15,+Gymkhana+Rd,+Piplod,+Surat,+Gujarat+395007"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-coffee-amber hover:text-coffee-gold transition-colors font-medium"
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    <svg
                      className="w-6 h-6 text-coffee-amber"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-coffee-amber mb-2">Follow Us</h4>
                    <a
                      href="https://www.instagram.com/rabuste.coffee/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-coffee-light hover:text-coffee-amber transition-colors"
                    >
                      <span>@rabuste.coffee</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    <svg
                      className="w-6 h-6 text-coffee-amber"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-coffee-amber mb-2">Opening Hours</h4>
                    <div className="text-coffee-light space-y-1">
                      <p>Monday - Sunday: 9:30 AM - 11:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Google Maps */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-br from-coffee-brown/30 to-coffee-dark/40 rounded-2xl overflow-hidden border border-coffee-amber/20 shadow-xl"
            >
              <div className="h-full min-h-[400px]">
                {process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? (
                  <iframe
                    title="Rabuste Coffee Location"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '400px' }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&q=RABUSTE,+Dimpal+Row+House,+15,+Gymkhana+Rd,+Piplod,+Surat,+Gujarat+395007`}
                  />
                ) : (
                  <div className="h-full min-h-[400px] flex items-center justify-center bg-coffee-brown/40">
                    <div className="text-center p-8">
                      <p className="text-coffee-light mb-4">
                        Map view requires Google Maps API key
                      </p>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=RABUSTE,+Dimpal+Row+House,+15,+Gymkhana+Rd,+Piplod,+Surat,+Gujarat+395007"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-coffee-amber text-coffee-darker px-6 py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors"
                      >
                        View on Google Maps
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Chatbot />
    </div>
  );
};

export default Home;





