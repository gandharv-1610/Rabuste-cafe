import React from 'react';
import { motion } from 'framer-motion';
import Chatbot from '../components/Chatbot';
import VideoPlayer from '../components/VideoPlayer';
import api from '../api/axios';

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
      icon: '⚡',
      title: 'Grab-and-Go Excellence',
      description: 'We believe premium coffee shouldn\'t require a long wait. Our grab-and-go model brings specialty Robusta coffee to your busy lifestyle without compromising on quality or flavor.',
      details: 'Our streamlined service model ensures you get barista-quality coffee in minutes. Every cup is crafted with precision, using our signature Robusta beans that are ground fresh and brewed to perfection. Whether you\'re rushing to work or taking a quick break, we deliver excellence at speed.',
    },
    {
      icon: '🏠',
      title: 'Cozy & Bold',
      description: 'Our space is designed to be warm and inviting—a perfect contrast to the boldness of our coffee. It\'s a place where you can pause, reflect, and enjoy a moment of strength and comfort.',
      details: 'Step into a space where modern minimalism meets cozy warmth. Our café features carefully curated lighting, comfortable seating, and art installations that create an atmosphere of both energy and tranquility. The bold flavors of our coffee are complemented by a space that invites you to stay, work, or simply be.',
    },
    {
      icon: '🤝',
      title: 'Community First',
      description: 'Beyond coffee, we\'re building a community of bold thinkers, creative souls, and coffee enthusiasts who appreciate uncompromising quality and authentic experiences.',
      details: 'Rabuste Coffee is more than a café—it\'s a gathering place for those who value authenticity and bold choices. We host regular events, support local artists, and create opportunities for meaningful connections. Our community includes entrepreneurs, artists, students, and anyone who appreciates the strength and character of Robusta coffee.',
    },
    {
      icon: '🎨',
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
            className="text-5xl md:text-6xl font-heading font-bold text-coffee-amber mb-6 tracking-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            About Rabuste Coffee
          </motion.h1>
          <motion.p 
            className="text-xl text-coffee-light"
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
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-coffee-amber mb-12 text-center tracking-tight">
            Our Journey
          </h2>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-coffee-amber/50 via-coffee-amber/30 to-transparent transform md:-translate-x-1/2"></div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="space-y-12"
            >
              {storyPoints.map((point, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="relative flex items-start md:items-center"
                  style={{
                    flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse',
                  }}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-coffee-amber rounded-full border-4 border-coffee-darker transform md:-translate-x-1/2 z-10"></div>
                  
                  {/* Content Card */}
                  <div className={`ml-16 md:ml-0 md:w-5/12 ${idx % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}>
                    <div className="modern-card p-6 md:p-8">
                      <h3 className="text-2xl font-heading font-semibold text-coffee-amber mb-3">
                        {point.title}
                      </h3>
                      <p className="text-coffee-light leading-relaxed">
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
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-coffee-amber mb-12 text-center tracking-tight">
            Our Philosophy
          </h2>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 gap-6"
          >
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="modern-card p-8 group"
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-heading font-semibold text-coffee-amber mb-4">
                  {value.title}
                </h3>
                <p className="text-coffee-light leading-relaxed mb-4">
                  {value.description}
                </p>
                <div className="pt-4 border-t border-coffee-brown/30">
                  <p className="text-sm text-coffee-light/80 leading-relaxed">
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
          className="modern-card p-8 md:p-12 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-coffee-amber mb-6 tracking-tight">
            Cultural & Creative Inspiration
          </h2>
          <p className="text-lg text-coffee-light max-w-3xl mx-auto leading-relaxed mb-6">
            Rabuste Coffee draws inspiration from the bold, unapologetic nature of Robusta coffee itself. We celebrate strength, character, and authenticity—values that resonate in both coffee culture and contemporary art.
          </p>
          <p className="text-lg text-coffee-light max-w-3xl mx-auto leading-relaxed">
            Our space is designed to be a canvas where coffee expertise meets artistic expression, creating a unique experience that stimulates both the palate and the mind. Every element, from our bean selection to our art curation, reflects our commitment to uncompromising quality and creative innovation.
          </p>
        </motion.div>
      </section>

      <Chatbot />
    </div>
  );
};

export default About;
