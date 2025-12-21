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
        // First try without isActive filter (like Home page does)
        const response = await api.get('/site-media', {
          params: { page: 'why-robusta', _t: Date.now() },
        });
        const entries = response.data || [];
        
        // Filter for active entries on client side
        const activeEntries = entries.filter((m) => m.isActive !== false);
        
        console.log('Why Robusta page - All entries:', entries);
        console.log('Why Robusta page - Active entries:', activeEntries);
        
        // Try to find exact match first
        let background = activeEntries.find((m) => m.section === 'why_robusta_hero_background');
        
        // If not found, try any active entry for why-robusta page
        if (!background && activeEntries.length > 0) {
          background = activeEntries[0];
        }
        
        console.log('Why Robusta page - Selected background:', background);
        
        if (background && background.url) {
          setBackgroundMedia(background);
        } else {
          console.warn('Why Robusta page - No valid background found');
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
      description: 'Robusta contains nearly double the caffeine content of Arabica, providing a powerful energy boost and intense coffee experience.',
    },
    {
      icon: '🌿',
      title: 'Bold Flavor Profile',
      description: 'Rich, full-bodied taste with notes of dark chocolate, nuts, and a natural bitterness that coffee enthusiasts love.',
    },
    {
      icon: '🌍',
      title: 'Hardy & Sustainable',
      description: 'Robusta plants are more resilient, require less maintenance, and produce higher yields, making them more sustainable for farming.',
    },
    {
      icon: '☕',
      title: 'Perfect for Espresso',
      description: 'Robusta\'s bold characteristics make it ideal for espresso and creates excellent crema—the golden foam on top of a perfect shot.',
    },
  ];

  const comparisonData = [
    { feature: 'Caffeine Content', robusta: '2.7%', arabica: '1.5%' },
    { feature: 'Flavor', robusta: 'Bold, Bitter, Full-bodied', arabica: 'Mild, Sweet, Smooth' },
    { feature: 'Body', robusta: 'Heavy', arabica: 'Light to Medium' },
    { feature: 'Acidity', robusta: 'Low', arabica: 'High' },
  ];

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Media */}
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
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-coffee-darkest/90 via-coffee-darker/75 to-coffee-dark/80 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-coffee-amber/5 via-transparent to-coffee-gold/5 z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center relative z-20"
        >
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-coffee-amber mb-6">
            Why Robusta?
          </h1>
          <p className="text-xl text-coffee-light">
            Understanding the bold choice behind our exclusive coffee selection
          </p>
        </motion.div>
      </section>

      {/* What is Robusta Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-heading font-bold text-coffee-amber mb-8 text-center">
            What is Robusta Coffee?
          </h2>
          <div className="bg-coffee-brown/20 rounded-lg p-8 md:p-12">
            <p className="text-lg text-coffee-light mb-6 leading-relaxed">
              Robusta (Coffea canephora) is one of the two main species of coffee plants cultivated worldwide, alongside Arabica. While Arabica often gets the spotlight, Robusta brings its own exceptional qualities to the table.
            </p>
            <p className="text-lg text-coffee-light mb-6 leading-relaxed">
              Grown primarily in Africa and Asia, Robusta coffee plants are known for their resilience. They thrive at lower elevations, resist diseases better, and produce higher yields. But more importantly for coffee lovers, they produce beans with a distinctly bold and powerful flavor profile.
            </p>
            <p className="text-lg text-coffee-light leading-relaxed">
              At Rabuste Coffee, we've dedicated ourselves to showcasing Robusta's unique characteristics, proving that this "underdog" coffee variety deserves recognition as a premium specialty coffee.
            </p>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-heading font-bold text-coffee-amber mb-12 text-center">
            Why Robusta Stands Out
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-coffee-brown/20 rounded-lg p-6 hover:bg-coffee-brown/30 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-heading font-semibold text-coffee-amber mb-3">
                  {feature.title}
                </h3>
                <p className="text-coffee-light leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-heading font-bold text-coffee-amber mb-8 text-center">
            Robusta vs. Arabica
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-coffee-brown/20 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-coffee-brown/40">
                  <th className="p-4 text-left text-coffee-amber font-semibold">Feature</th>
                  <th className="p-4 text-left text-coffee-amber font-semibold">Robusta</th>
                  <th className="p-4 text-left text-coffee-amber font-semibold">Arabica</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="border-t border-coffee-brown/30">
                    <td className="p-4 text-coffee-cream font-medium">{row.feature}</td>
                    <td className="p-4 text-coffee-amber font-semibold">{row.robusta}</td>
                    <td className="p-4 text-coffee-light">{row.arabica}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Why Rabuste Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-gradient-to-r from-coffee-amber/20 to-coffee-gold/20 rounded-lg p-8 md:p-12 text-center"
        >
          <h2 className="text-4xl font-heading font-bold text-coffee-amber mb-6">
            Why Rabuste Serves Only Robusta
          </h2>
          <p className="text-lg text-coffee-light max-w-3xl mx-auto leading-relaxed mb-6">
            We've made a conscious decision to focus exclusively on Robusta coffee because we believe in its unmatched potential. By dedicating ourselves to a single variety, we can master every aspect of Robusta brewing, from bean selection to extraction techniques.
          </p>
          <p className="text-lg text-coffee-light max-w-3xl mx-auto leading-relaxed">
            This singular focus allows us to become true experts in Robusta coffee, offering you the finest expressions of this bold variety. When you choose Rabuste, you're choosing a coffee experience that's unapologetically strong, authentically bold, and expertly crafted.
          </p>
        </motion.div>
      </section>

      <Chatbot />
    </div>
  );
};

export default WhyRobusta;

