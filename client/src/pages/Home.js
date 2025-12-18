import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Chatbot from '../components/Chatbot';
import VideoPlayer from '../components/VideoPlayer';
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
          params: { page: 'home', isActive: true },
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
        const response = await api.get('/offers');
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
              backgroundImage: `url(${heroMedia.url})`,
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
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-coffee-darker/80 via-coffee-dark/60 to-coffee-darker/80 z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-20 text-center px-4 max-w-5xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <img
              src={heroLogo}
              alt="Rabuste Coffee logo"
              className="h-20 md:h-24 object-contain drop-shadow-lg"
            />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-display font-bold text-coffee-amber mb-6"
          >
            Bold Robusta.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl md:text-4xl font-display text-coffee-cream mb-4"
          >
            Coffee × Art × Technology
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-coffee-light max-w-2xl mx-auto mb-12"
          >
            Experience the finest Robusta coffee in a cozy space where bold flavors meet creative art and innovative technology.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              to="/coffee"
              className="bg-coffee-amber text-coffee-darker px-8 py-4 rounded-lg font-semibold hover:bg-coffee-gold transition-colors shadow-lg"
            >
              Explore Coffee
            </Link>
            <Link
              to="/art"
              className="bg-transparent border-2 border-coffee-amber text-coffee-amber px-8 py-4 rounded-lg font-semibold hover:bg-coffee-amber hover:text-coffee-darker transition-colors"
            >
              View Art Gallery
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Daily Offers */}
      {offers.length > 0 && (
        <section className="py-10 px-4 bg-coffee-brown/20 border-y border-coffee-brown/40">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-6 text-center"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-coffee-light/70 mb-2">
                Today at Rabuste
              </p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-coffee-amber">
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
                <div
                  key={offer._id}
                  className="relative rounded-xl bg-gradient-to-br from-coffee-darker/80 via-coffee-brown/60 to-coffee-darker/80 border border-coffee-brown/60 shadow-lg px-5 py-4 flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      {offer.badgeText && (
                        <span className="inline-block text-[10px] font-semibold px-2 py-1 rounded-full bg-coffee-amber/15 text-coffee-amber tracking-[0.18em] uppercase mb-2">
                          {offer.badgeText}
                        </span>
                      )}
                      <h3 className="text-lg md:text-xl font-display font-semibold text-coffee-amber leading-snug">
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
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Story Sections */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-coffee-amber mb-6">
            Our Story
          </h2>
          <p className="text-xl text-coffee-light max-w-3xl mx-auto">
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
              <h3 className="text-3xl font-display font-bold text-coffee-amber mb-4">
                Bold Coffee, Cozy Space
              </h3>
              <p className="text-coffee-light text-lg mb-4">
                We've made a deliberate choice to serve only Robusta coffee—the boldest, most full-bodied coffee experience available. Our grab-and-go concept brings premium quality to your daily routine.
              </p>
              <p className="text-coffee-light text-lg">
                Step into our cozy space where every cup tells a story of strength, character, and uncompromising flavor.
              </p>
            </div>
            <div className="bg-coffee-brown/30 rounded-lg overflow-hidden aspect-square">
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
                  src={brewingMedia.url} 
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
                  src={artStoryMedia.url}
                  alt="Art gallery at Rabuste Coffee"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl">🎨</span>
              )}
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-display font-bold text-coffee-amber mb-4">
                Micro Art Gallery
              </h3>
              <p className="text-coffee-light text-lg mb-4">
                Our café doubles as a micro art gallery, showcasing fine art from talented artists. Each piece tells a story, creating an immersive cultural experience alongside your coffee.
              </p>
              <Link
                to="/art"
                className="inline-block text-coffee-amber font-semibold hover:underline"
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
            <div>
              <h3 className="text-3xl font-display font-bold text-coffee-amber mb-4">
                Workshops & Community
              </h3>
              <p className="text-coffee-light text-lg mb-4">
                Join us for coffee workshops, art & creativity sessions, and community events. Learn the art of brewing, explore your creativity, and connect with like-minded enthusiasts.
              </p>
              <Link
                to="/workshops"
                className="inline-block text-coffee-amber font-semibold hover:underline"
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
                  src={workshopStoryMedia.url}
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
                  src={franchiseStoryMedia.url}
                  alt="Rabuste Coffee franchise"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl">🚀</span>
              )}
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-display font-bold text-coffee-amber mb-4">
                Join the Movement
              </h3>
              <p className="text-coffee-light text-lg mb-4">
                Ready to bring the Rabuste Coffee experience to your community? Explore our franchise opportunities and become part of a bold, scalable café concept.
              </p>
              <Link
                to="/franchise"
                className="inline-block bg-coffee-amber text-coffee-darker px-6 py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors"
              >
                Franchise Opportunity →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-coffee-brown/20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-coffee-amber mb-6">
            Ready to Experience Bold Robusta?
          </h2>
          <p className="text-xl text-coffee-light mb-8">
            Discover our menu, explore our art gallery, or join our workshops.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/coffee"
              className="bg-coffee-amber text-coffee-darker px-8 py-4 rounded-lg font-semibold hover:bg-coffee-gold transition-colors"
            >
              Coffee Menu
            </Link>
            <Link
              to="/art"
              className="bg-coffee-brown text-coffee-cream px-8 py-4 rounded-lg font-semibold hover:bg-coffee-medium transition-colors"
            >
              Art Gallery
            </Link>
            <Link
              to="/workshops"
              className="bg-coffee-brown text-coffee-cream px-8 py-4 rounded-lg font-semibold hover:bg-coffee-medium transition-colors"
            >
              Workshops
            </Link>
          </div>
        </motion.div>
      </section>

      <Chatbot />
    </div>
  );
};

export default Home;

