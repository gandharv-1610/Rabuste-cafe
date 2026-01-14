import React from 'react';
import { motion } from 'framer-motion';
import Chatbot from '../components/Chatbot';
import VideoPlayer from '../components/VideoPlayer';
import api from '../api/axios';

// SVG Icon Components
const GrabAndGoIcon = ({ className = "w-16 h-16" }) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CozyBoldIcon = ({ className = "w-16 h-16" }) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 21H21" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 21V11C5 7.13401 8.13401 4 12 4C15.866 4 19 7.13401 19 11V21" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21C12 21 8.5 17 8.5 14.5C8.5 12.567 10.067 11 12 11C13.933 11 15.5 12.567 15.5 14.5C15.5 17 12 21 12 21Z" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11V9" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CommunityFirstIcon = ({ className = "w-16 h-16" }) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArtCultureIcon = ({ className = "w-16 h-16" }) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="5" y="5" width="14" height="10" rx="1" stroke="#FF8C00" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M5 12L9 8L13 12L16 9L19 12" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 15L5 21" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 15L19 21" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2V5" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 15H20" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const About = () => {
  const [backgroundMedia, setBackgroundMedia] = React.useState(null);

  React.useEffect(() => {
    const fetchBackground = async () => {
      try {
        let response = await api.get('/site-media', {
          params: { page: 'about', _t: Date.now() },
        });
        let entries = response.data || [];
        
        if (entries.length === 0) {
          console.log('About page - No results with page filter, trying all entries...');
          response = await api.get('/site-media', {
            params: { _t: Date.now() },
          });
          const allEntries = response.data || [];
          entries = allEntries.filter((m) => 
            m.page && m.page.toLowerCase().trim() === 'about'
          );
          console.log('About page - Filtered entries from all:', entries);
        }
        
        const activeEntries = entries.filter((m) => m.isActive !== false);
        
        let background = activeEntries.find((m) => 
          m.section && m.section.trim() === 'about_hero_background'
        );
        
        if (!background && activeEntries.length > 0) {
          background = activeEntries[0];
        }
        
        if (background && background.url) {
          setBackgroundMedia(background);
        } else {
          setBackgroundMedia(null);
        }
      } catch (error) {
        console.error('Error fetching about background:', error);
        setBackgroundMedia(null);
      }
    };

    fetchBackground();
  }, []);

  const values = [
    {
      icon: <GrabAndGoIcon />,
      title: 'Grab-and-Go Excellence',
      description: 'We believe premium coffee shouldn\'t require a long wait. Our grab-and-go model brings specialty Robusta coffee to your busy lifestyle without compromising on quality or flavor.',
      details: 'Our streamlined service model ensures you get barista-quality coffee in minutes. Every cup is crafted with precision, using our signature Robusta beans that are ground fresh and brewed to perfection. Whether you\'re rushing to work or taking a quick break, we deliver excellence at speed.',
    },
    {
      icon: <CozyBoldIcon />,
      title: 'Cozy & Bold',
      description: 'Our space is designed to be warm and inviting—a perfect contrast to the boldness of our coffee. It\'s a place where you can pause, reflect, and enjoy a moment of strength and comfort.',
      details: 'Step into a space where modern minimalism meets cozy warmth. Our café features carefully curated lighting, comfortable seating, and art installations that create an atmosphere of both energy and tranquility. The bold flavors of our coffee are complemented by a space that invites you to stay, work, or simply be.',
    },
    {
      icon: <CommunityFirstIcon />,
      title: 'Community First',
      description: 'Beyond coffee, we\'re building a community of bold thinkers, creative souls, and coffee enthusiasts who appreciate uncompromising quality and authentic experiences.',
      details: 'Rabuste Coffee is more than a café—it\'s a gathering place for those who value authenticity and bold choices. We host regular events, support local artists, and create opportunities for meaningful connections. Our community includes entrepreneurs, artists, students, and anyone who appreciates the strength and character of Robusta coffee.',
    },
    {
      icon: <ArtCultureIcon />,
      title: 'Art & Culture',
      description: 'We integrate fine art into our café experience, creating a cultural hub where coffee and creativity intersect. Each visit offers both a caffeine boost and an artistic discovery.',
      details: 'Our walls feature rotating exhibitions from emerging and established artists, creating a dynamic gallery space. We believe that great coffee and great art both stimulate the senses and inspire conversation. Our art program includes monthly exhibitions, artist talks, and collaborative events that celebrate creativity in all its forms.',
    },
  ];

  const storyPoints = [
    {
      year: '2020',
      title: 'The Vision',
      content: 'Rabuste Coffee was born from a simple yet revolutionary idea: what if we celebrated Robusta coffee—the bold, full-bodied variety that\'s often overlooked in favor of its milder cousin? We saw untapped potential in this resilient bean.',
    },
    {
      year: '2021',
      title: 'The Mission',
      content: 'We chose to focus exclusively on Robusta because we believe in its unmatched potential. Robusta coffee offers a stronger, more intense flavor profile with a natural bitterness that coffee connoisseurs crave. It contains nearly twice the caffeine content of Arabica.',
    },
    {
      year: '2022',
      title: 'The Selection',
      content: 'Our mission is to change the narrative around Robusta coffee, showcasing it as a premium choice rather than a compromise. We source only the finest Robusta beans, carefully selected from sustainable farms in Africa and Asia.',
    },
    {
      year: '2023',
      title: 'The Craft',
      content: 'We\'ve mastered every aspect of Robusta brewing, from bean selection to extraction techniques. Our baristas are trained specifically in Robusta coffee preparation, ensuring every cup highlights the unique characteristics of this bold variety.',
    },
    {
      year: '2024',
      title: 'The Community',
      content: 'Today, Rabuste Coffee stands as a testament to bold choices and uncompromising quality. We\'ve built a community of coffee enthusiasts who appreciate strength, character, and authenticity—values that resonate in both coffee culture and contemporary art.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 min-h-[60vh] flex items-center justify-center overflow-hidden">
        {backgroundMedia && backgroundMedia.mediaType === 'video' ? (
          <VideoPlayer
            videoUrl={backgroundMedia.url}
            autoplay={true}
            muted={true}
            className="absolute inset-0 z-0"
          />
        ) : backgroundMedia && backgroundMedia.url ? (
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${backgroundMedia.url}${backgroundMedia.url.includes('?') ? '&' : '?'}v=${backgroundMedia.updatedAt || Date.now()})`,
            }}
          ></div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-coffee-darker to-coffee-dark"></div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-b from-coffee-darkest/90 via-coffee-darker/75 to-coffee-dark/80 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-coffee-amber/5 via-transparent to-coffee-gold/5 z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-4xl mx-auto text-center relative z-20"
        >
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-coffee-amber mb-4 md:mb-6 tracking-tight px-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            About Rabuste Coffee
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl text-coffee-light px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            A bold vision for specialty coffee, art, and community
          </motion.p>
        </motion.div>
      </section>

      {/* Story Timeline Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-coffee-amber mb-8 md:mb-12 text-center tracking-tight px-4">
            Our Journey
          </h2>
          
          <div className="relative px-2 sm:px-4 md:px-0">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-coffee-amber/50 via-coffee-amber/30 to-transparent transform -translate-x-1/2 pointer-events-none"></div>
            <div className="md:hidden absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-coffee-amber/50 via-coffee-amber/30 to-transparent pointer-events-none"></div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="space-y-8 md:space-y-12"
            >
              {storyPoints.map((point, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`relative flex md:items-center ${
                    idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Mobile: dot + card in row */}
                  <div className="flex md:hidden w-full items-start gap-4 pl-2">
                    <div className="relative flex-shrink-0 pt-2">
                      <div className="w-3 h-3 bg-coffee-amber rounded-full border-2 border-coffee-darker"></div>
                    </div>
                    <div className="flex-1">
                      <div className="modern-card p-4">
                        <h3 className="text-lg sm:text-xl font-heading font-semibold text-coffee-amber mb-1.5">
                          {point.title}
                        </h3>
                        <p className="text-sm sm:text-base text-coffee-light leading-relaxed">
                          {point.content}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop / tablet layout */}
                  <div className="hidden md:block absolute left-1/2 w-4 h-4 bg-coffee-amber rounded-full border-4 border-coffee-darker transform -translate-x-1/2 z-10"></div>
                  <div
                    className={`hidden md:block md:w-5/12 ${
                      idx % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                    }`}
                  >
                    <div className="modern-card p-6 md:p-8">
                      <h3 className="text-2xl font-heading font-semibold text-coffee-amber mb-3">
                        {point.title}
                      </h3>
                      <p className="text-base text-coffee-light leading-relaxed">
                        {point.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Philosophy Section with Modern Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-coffee-amber mb-8 md:mb-12 text-center tracking-tight px-4">
            Our Philosophy
          </h2>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-4 md:px-0"
          >
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="modern-card p-6 sm:p-8 group"
              >
                <div className="mb-4 flex justify-center transform group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-semibold text-coffee-amber mb-3 md:mb-4">
                  {value.title}
                </h3>
                <p className="text-sm sm:text-base text-coffee-light leading-relaxed mb-3 md:mb-4">
                  {value.description}
                </p>
                <div className="pt-3 md:pt-4 border-t border-coffee-brown/30">
                  <p className="text-xs sm:text-sm text-coffee-light/80 leading-relaxed">
                    {value.details}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Cultural Inspiration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="modern-card p-6 sm:p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-coffee-amber mb-4 md:mb-6 tracking-tight px-4">
            Cultural & Creative Inspiration
          </h2>
          <p className="text-base sm:text-lg text-coffee-light max-w-3xl mx-auto leading-relaxed mb-4 md:mb-6 px-4">
            Rabuste Coffee draws inspiration from the bold, unapologetic nature of Robusta coffee itself. We celebrate strength, character, and authenticity—values that resonate in both coffee culture and contemporary art.
          </p>
          <p className="text-base sm:text-lg text-coffee-light max-w-3xl mx-auto leading-relaxed px-4">
            Our space is designed to be a canvas where coffee expertise meets artistic expression, creating a unique experience that stimulates both the palate and the mind. Every element, from our bean selection to our art curation, reflects our commitment to uncompromising quality and creative innovation.
          </p>
        </motion.div>
      </section>

      <Chatbot />
    </div>
  );
};

export default About;
