import React from 'react';
import { motion } from 'framer-motion';
import Chatbot from '../components/Chatbot';
import VideoPlayer from '../components/VideoPlayer';
import api from '../api/axios';

const WhyRobusta = () => {
  const [backgroundMedia, setBackgroundMedia] = React.useState(null);

  React.useEffect(() => {
    const fetchBackground = async () => {
      try {
        const response = await api.get('/site-media', {
          params: { page: 'why-robusta', _t: Date.now() },
        });
        const entries = response.data || [];
        const activeEntries = entries.filter((m) => m.isActive !== false);
        
        let background = activeEntries.find((m) => m.section === 'why_robusta_hero_background');
        
        if (!background && activeEntries.length > 0) {
          background = activeEntries[0];
        }
        
        if (background && background.url) {
          setBackgroundMedia(background);
        } else {
          setBackgroundMedia(null);
        }
      } catch (error) {
        console.error('Error fetching why robusta background:', error);
        setBackgroundMedia(null);
      }
    };

    fetchBackground();
  }, []);

  const features = [
    {
      icon: '💪',
      title: 'Extra Strength',
      shortDescription: 'Robusta contains nearly double the caffeine content of Arabica, providing a powerful energy boost and intense coffee experience.',
      detailedDescription: 'Robusta beans contain approximately 2.7% caffeine compared to Arabica\'s 1.5%, making them nearly twice as potent. This higher caffeine content provides a more significant energy boost and contributes to Robusta\'s characteristic bold, intense flavor.',
      benefits: ['2.7% caffeine content', 'Sustained energy release', 'Enhanced mental alertness'],
    },
    {
      icon: '🌿',
      title: 'Bold Flavor Profile',
      shortDescription: 'Rich, full-bodied taste with notes of dark chocolate, nuts, and a natural bitterness that coffee enthusiasts love.',
      detailedDescription: 'Robusta\'s flavor profile is distinctly bold and complex. It features deep, earthy notes with hints of dark chocolate, roasted nuts, and a characteristic bitterness. The low acidity makes it smooth and easy to drink, while the heavy body creates a rich, satisfying mouthfeel.',
      benefits: ['Low acidity', 'Heavy body', 'Complex flavor notes'],
    },
    {
      icon: '🌍',
      title: 'Hardy & Sustainable',
      shortDescription: 'Robusta plants are more resilient, require less maintenance, and produce higher yields, making them more sustainable for farming.',
      detailedDescription: 'Robusta coffee plants thrive at lower elevations (200-800 meters), resist common coffee diseases, and can withstand higher temperatures. These characteristics mean Robusta requires fewer pesticides and less intensive farming practices, making it more environmentally sustainable.',
      benefits: ['Disease resistant', 'Higher yields', 'Lower elevation growth'],
    },
    {
      icon: '☕',
      title: 'Perfect for Espresso',
      shortDescription: 'Robusta\'s bold characteristics make it ideal for espresso and creates excellent crema—the golden foam on top of a perfect shot.',
      detailedDescription: 'Robusta beans create a rich, thick crema—the golden-brown foam that crowns a perfect espresso shot. The crema traps aromatic compounds, enhancing the drinking experience. Robusta\'s low acidity and heavy body make it ideal for espresso blends, providing structure and depth.',
      benefits: ['Thick, stable crema', 'Rich espresso body', 'Blend complexity'],
    },
  ];

  const comparisonData = [
    { 
      feature: 'Caffeine Content', 
      robusta: { value: '2.7%', description: 'Nearly double the caffeine for a powerful boost' },
      arabica: { value: '1.5%', description: 'Milder caffeine content for a gentler experience' }
    },
    { 
      feature: 'Flavor Profile', 
      robusta: { value: 'Bold, Bitter, Full-bodied', description: 'Deep, earthy notes with chocolate and nutty undertones' },
      arabica: { value: 'Mild, Sweet, Smooth', description: 'Delicate, fruity notes with floral and wine-like characteristics' }
    },
    {
      feature: 'Growing Conditions',
      robusta: { value: '200-800m elevation', description: 'Thrives at lower elevations, more resilient to climate' },
      arabica: { value: '800-2000m elevation', description: 'Requires higher elevations and cooler temperatures' }
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
            Why Robusta?
          </motion.h1>
          <motion.p 
            className="text-xl text-coffee-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Understanding the bold choice behind our exclusive coffee selection
          </motion.p>
        </motion.div>
      </section>

      {/* What is Robusta Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="mb-20"
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-heading font-bold text-coffee-amber mb-8 text-center tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            What is Robusta Coffee?
          </motion.h2>
          <motion.div 
            className="modern-card p-8 md:p-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.p 
              className="text-lg text-coffee-light mb-6 leading-relaxed"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Robusta (Coffea canephora) is one of the two main species of coffee plants cultivated worldwide, alongside Arabica. While Arabica often gets the spotlight, Robusta brings its own exceptional qualities to the table that make it a premium choice for coffee enthusiasts.
            </motion.p>
            <motion.p 
              className="text-lg text-coffee-light mb-6 leading-relaxed"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              Grown primarily in Africa and Asia, Robusta coffee plants are known for their resilience. They thrive at lower elevations (200-800 meters), resist diseases better, and produce higher yields. But more importantly for coffee lovers, they produce beans with a distinctly bold and powerful flavor profile that stands out in every cup.
            </motion.p>
            <motion.p 
              className="text-lg text-coffee-light leading-relaxed"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              At Rabuste Coffee, we've dedicated ourselves to showcasing Robusta's unique characteristics, proving that this "underdog" coffee variety deserves recognition as a premium specialty coffee. Our expertise in Robusta allows us to extract the finest flavors and create an experience that celebrates strength, character, and authenticity.
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Visual Tree Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="mb-12"
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-heading font-bold text-coffee-amber mb-8 text-center tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Robusta vs. Arabica
          </motion.h2>
          
          <div className="coffee-tree">
            <motion.div
              className="tree-trunk"
              initial={{ height: 0, opacity: 0 }}
              whileInView={{ height: 120, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
            ></motion.div>
            
            <motion.div
              className="tree-branch left"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="tree-leaf mb-4">
                <h3 className="text-2xl font-heading font-bold text-coffee-amber mb-3">Robusta</h3>
                <p className="text-coffee-light text-sm mb-2">Coffea canephora</p>
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-coffee-amber">●</span>
                    <span className="text-sm text-coffee-light">2.7% Caffeine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-coffee-amber">●</span>
                    <span className="text-sm text-coffee-light">Bold, Full-bodied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-coffee-amber">●</span>
                    <span className="text-sm text-coffee-light">Low Elevation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-coffee-amber">●</span>
                    <span className="text-sm text-coffee-light">High Resilience</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              className="tree-branch right"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="tree-leaf mb-4">
                <h3 className="text-2xl font-heading font-bold text-coffee-light mb-3">Arabica</h3>
                <p className="text-coffee-light/70 text-sm mb-2">Coffea arabica</p>
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-coffee-light/50">●</span>
                    <span className="text-sm text-coffee-light/70">1.5% Caffeine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-coffee-light/50">●</span>
                    <span className="text-sm text-coffee-light/70">Mild, Smooth</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-coffee-light/50">●</span>
                    <span className="text-sm text-coffee-light/70">High Elevation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-coffee-light/50">●</span>
                    <span className="text-sm text-coffee-light/70">Delicate</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Detailed Comparison Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
          >
            {comparisonData.map((row, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="modern-card p-6"
              >
                <h4 className="text-lg font-heading font-semibold text-coffee-amber mb-4">
                  {row.feature}
                </h4>
                <div className="space-y-4">
                  <div className="border-l-4 border-coffee-amber pl-4">
                    <p className="text-sm font-semibold text-coffee-amber mb-1">Robusta</p>
                    <p className="text-sm text-coffee-light font-medium mb-2">{row.robusta.value}</p>
                    <p className="text-xs text-coffee-light/70">{row.robusta.description}</p>
                  </div>
                  <div className="border-l-4 border-coffee-light/30 pl-4">
                    <p className="text-sm font-semibold text-coffee-light/70 mb-1">Arabica</p>
                    <p className="text-sm text-coffee-light/80 font-medium mb-2">{row.arabica.value}</p>
                    <p className="text-xs text-coffee-light/60">{row.arabica.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Flip Cards for Features */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="mb-20"
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-heading font-bold text-coffee-amber mb-12 text-center tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Why Robusta Stands Out
          </motion.h2>
          <motion.p 
            className="text-center text-coffee-light mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Hover over each card to discover detailed insights about Robusta's unique characteristics
          </motion.p>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-2 gap-8"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flip-card"
                style={{ minHeight: '400px', height: '400px' }}
              >
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <div className="text-6xl mb-5">{feature.icon}</div>
                    <h3 className="text-2xl font-heading font-semibold text-coffee-amber mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-base text-coffee-light leading-relaxed mb-4">
                      {feature.shortDescription}
                    </p>
                    <div className="mt-auto text-sm text-coffee-amber/70">
                      Hover to learn more →
                    </div>
                  </div>
                  <div className="flip-card-back">
                    <div className="w-full">
                      <h3 className="text-2xl font-heading font-semibold text-coffee-amber mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-coffee-light leading-relaxed mb-4">
                        {feature.detailedDescription}
                      </p>
                    </div>
                    <div className="w-full mt-auto">
                      <p className="text-sm font-semibold text-coffee-amber mb-2">Key Benefits:</p>
                      <ul className="space-y-2 text-left">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i} className="text-sm text-coffee-light flex items-start gap-2">
                            <span className="text-coffee-amber mt-0.5">✓</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Why Rabuste Section */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="modern-card p-8 md:p-12 text-center"
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-heading font-bold text-coffee-amber mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Why Rabuste Serves Only Robusta
          </motion.h2>
          <motion.p 
            className="text-lg text-coffee-light max-w-3xl mx-auto leading-relaxed mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            We've made a conscious decision to focus exclusively on Robusta coffee because we believe in its unmatched potential. By dedicating ourselves to a single variety, we can master every aspect of Robusta brewing, from bean selection to extraction techniques.
          </motion.p>
          <motion.p 
            className="text-lg text-coffee-light max-w-3xl mx-auto leading-relaxed mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            This singular focus allows us to become true experts in Robusta coffee, offering you the finest expressions of this bold variety. Our baristas are trained specifically in Robusta preparation, understanding how to extract the perfect balance of strength, flavor, and crema.
          </motion.p>
          <motion.p 
            className="text-lg text-coffee-light max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            When you choose Rabuste, you're choosing a coffee experience that's unapologetically strong, authentically bold, and expertly crafted. We're not just serving coffee—we're championing a variety that deserves recognition and celebrating the bold choice to be different.
          </motion.p>
        </motion.div>
      </section>

      <Chatbot />
    </div>
  );
};

export default WhyRobusta;
