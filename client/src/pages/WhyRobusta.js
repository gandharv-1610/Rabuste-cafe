import React from 'react';
import { motion } from 'framer-motion';
import Chatbot from '../components/Chatbot';
import VideoPlayer from '../components/VideoPlayer';
import api from '../api/axios';

// SVG Icon Components
const StrengthIcon = ({ className = "w-16 h-16" }) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" 
      stroke="#FF8C00" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"/>
  </svg>
);

const FlavorIcon = ({ className = "w-16 h-16" }) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" 
      stroke="#FF8C00" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"/>
    <path d="M7 10C7 10 9.5 9 12 12C14.5 15 17 14 17 14" 
      stroke="#FF8C00" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"/>
  </svg>
);

const SustainableIcon = ({ className = "w-16 h-16" }) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.8346 3.17594 17.3961 5.06586 19.2306" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 8V16" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 12C14.5 11.5 16 10 16 8C16 6.5 15 5.5 13.5 5.5C12.5 5.5 12 6.5 12 8Z" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 12C9.5 12.5 8 14 8 16C8 17.5 9 18.5 10.5 18.5C11.5 18.5 12 17.5 12 16Z" stroke="#FF8C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EspressoIcon = ({ className = "w-16 h-16" }) => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M20 40C20 55 30 75 50 75C70 75 80 55 80 40" stroke="#FF8C00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M80 45C88 45 90 50 90 55C90 60 88 65 80 65" stroke="#FF8C00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <ellipse cx="50" cy="40" rx="30" ry="8" stroke="#FF8C00" strokeWidth="3" fill="url(#coffeeGradient)"/>
    <path d="M45 30Q50 25 50 15Q50 5 55 10" stroke="#FF8C00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M50 25Q55 20 55 10Q55 0 60 5" stroke="#FF8C00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M55 20Q60 15 60 5Q60 -5 65 0" stroke="#FF8C00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <radialGradient id="coffeeGradient" cx="50" cy="40" r="30" fx="50" fy="40">
        <stop offset="0%" stopColor="#D97706"/>
        <stop offset="100%" stopColor="#B45309"/>
      </radialGradient>
    </defs>
  </svg>
);

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
      icon: <StrengthIcon />,
      title: 'Extra Strength',
      shortDescription: 'Robusta contains nearly double the caffeine content of Arabica, providing a powerful energy boost and intense coffee experience.',
      detailedDescription: 'Robusta beans contain approximately 2.7% caffeine compared to Arabica\'s 1.5%, making them nearly twice as potent. This higher caffeine content provides a more significant energy boost and contributes to Robusta\'s characteristic bold, intense flavor.',
      benefits: ['2.7% caffeine content', 'Sustained energy release', 'Enhanced mental alertness'],
    },
    {
      icon: <FlavorIcon />,
      title: 'Bold Flavor Profile',
      shortDescription: 'Rich, full-bodied taste with notes of dark chocolate, nuts, and a natural bitterness that coffee enthusiasts love.',
      detailedDescription: 'Robusta\'s flavor profile is distinctly bold and complex. It features deep, earthy notes with hints of dark chocolate, roasted nuts, and a characteristic bitterness. The low acidity makes it smooth and easy to drink, while the heavy body creates a rich, satisfying mouthfeel.',
      benefits: ['Low acidity', 'Heavy body', 'Complex flavor notes'],
    },
    {
      icon: <SustainableIcon />,
      title: 'Hardy & Sustainable',
      shortDescription: 'Robusta plants are more resilient, require less maintenance, and produce higher yields, making them more sustainable for farming.',
      detailedDescription: 'Robusta coffee plants thrive at lower elevations (200-800 meters), resist common coffee diseases, and can withstand higher temperatures. These characteristics mean Robusta requires fewer pesticides and less intensive farming practices, making it more environmentally sustainable.',
      benefits: ['Disease resistant', 'Higher yields', 'Lower elevation growth'],
    },
    {
      icon: <EspressoIcon />,
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
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-coffee-amber mb-4 md:mb-6 tracking-tight px-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Why Robusta?
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl text-coffee-light px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Understanding the bold choice behind our Robusta coffee promotion
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
            className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-coffee-amber mb-6 md:mb-8 text-center tracking-tight px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            What is Robusta Coffee?
          </motion.h2>
          <motion.div 
            className="modern-card p-6 sm:p-8 md:p-10 lg:p-12 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="px-4 sm:px-6 md:px-8">
              <motion.p 
                className="text-base sm:text-lg text-coffee-light mb-4 md:mb-6 leading-relaxed"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Robusta (Coffea canephora) is one of the two main species of coffee plants cultivated worldwide, alongside Arabica. While Arabica often gets the spotlight, Robusta brings its own exceptional qualities to the table that make it a premium choice for coffee enthusiasts.
              </motion.p>
              <motion.p 
                className="text-base sm:text-lg text-coffee-light mb-4 md:mb-6 leading-relaxed"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Grown primarily in Africa and Asia, Robusta coffee plants are known for their resilience. They thrive at lower elevations (200-800 meters), resist diseases better, and produce higher yields. But more importantly for coffee lovers, they produce beans with a distinctly bold and powerful flavor profile that stands out in every cup.
              </motion.p>
              <motion.p 
                className="text-base sm:text-lg text-coffee-light leading-relaxed"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                At Rabuste Coffee, we've dedicated ourselves to showcasing Robusta's unique characteristics, proving that this "underdog" coffee variety deserves recognition as a premium specialty coffee. Our expertise in Robusta allows us to extract the finest flavors and create an experience that celebrates strength, character, and authenticity.
              </motion.p>
            </div>
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
            className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-coffee-amber mb-6 md:mb-12 text-center tracking-tight px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Why Robusta Stands Out
          </motion.h2>
          <motion.p 
            className="text-center text-sm sm:text-base text-coffee-light mb-6 md:mb-8 max-w-2xl mx-auto px-4"
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
            className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 px-4 md:px-0"
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flip-card"
                style={{ minHeight: '350px', height: '350px' }}
              >
                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <div className="mb-5 flex justify-center">{feature.icon}</div>
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
          className="modern-card p-6 sm:p-8 md:p-12 text-center"
        >
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-coffee-amber mb-4 md:mb-6 tracking-tight px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Why Rabuste Promotes Robusta
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg text-coffee-light max-w-3xl mx-auto leading-relaxed mb-4 md:mb-6 px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            We've made a conscious decision to champion Robusta coffee because we believe in its unmatched potential. By dedicating ourselves to promoting this exceptional variety, we can showcase every aspect of Robusta's excellence, from bean selection to extraction techniques.
          </motion.p>
          <motion.p 
            className="text-base sm:text-lg text-coffee-light max-w-3xl mx-auto leading-relaxed mb-4 md:mb-6 px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Our commitment to Robusta allows us to become true advocates for this bold variety, offering you the finest expressions of its unique character. Our baristas are trained specifically in Robusta preparation, understanding how to extract the perfect balance of strength, flavor, and crema that makes Robusta special.
          </motion.p>
          <motion.p 
            className="text-base sm:text-lg text-coffee-light max-w-3xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            When you choose Rabuste, you're choosing a coffee experience that's unapologetically strong, authentically bold, and expertly crafted. We're not just serving coffee—we're promoting a variety that deserves recognition and celebrating the bold choice to champion something exceptional.
          </motion.p>
        </motion.div>
      </section>

      <Chatbot />
    </div>
  );
};

export default WhyRobusta;
