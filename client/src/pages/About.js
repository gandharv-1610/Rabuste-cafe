import React from 'react';
import { motion } from 'framer-motion';
import Chatbot from '../components/Chatbot';

const About = () => {
  return (
    <div className="pt-20 min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-coffee-darker to-coffee-dark">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-6xl font-display font-bold text-coffee-amber mb-6">
            About Rabuste Coffee
          </h1>
          <p className="text-xl text-coffee-light">
            A bold vision for specialty coffee, art, and community
          </p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-display font-bold text-coffee-amber mb-8 text-center">
            The Story Behind Robusta
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-coffee-light mb-6 leading-relaxed">
              Rabuste Coffee was born from a simple yet revolutionary idea: what if we celebrated Robusta coffee—the bold, full-bodied variety that's often overlooked in favor of its milder cousin?
            </p>
            <p className="text-lg text-coffee-light mb-6 leading-relaxed">
              We chose to focus exclusively on Robusta because we believe in its untapped potential. Robusta coffee offers a stronger, more intense flavor profile with a natural bitterness that coffee connoisseurs crave. It contains nearly twice the caffeine content of Arabica, making it perfect for those who want a true coffee experience.
            </p>
            <p className="text-lg text-coffee-light mb-6 leading-relaxed">
              Our mission is to change the narrative around Robusta coffee, showcasing it as a premium choice rather than a compromise. We source only the finest Robusta beans, carefully selected and expertly brewed to highlight their unique characteristics.
            </p>
          </div>
        </motion.div>

        {/* Philosophy Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-coffee-brown/20 rounded-lg p-8 md:p-12 mb-16"
        >
          <h2 className="text-4xl font-display font-bold text-coffee-amber mb-6">
            Our Café Philosophy
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-display font-semibold text-coffee-amber mb-4">
                Grab-and-Go Excellence
              </h3>
              <p className="text-coffee-light leading-relaxed">
                We believe premium coffee shouldn't require a long wait. Our grab-and-go model brings specialty Robusta coffee to your busy lifestyle without compromising on quality or flavor.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-display font-semibold text-coffee-amber mb-4">
                Cozy & Bold
              </h3>
              <p className="text-coffee-light leading-relaxed">
                Our space is designed to be warm and inviting—a perfect contrast to the boldness of our coffee. It's a place where you can pause, reflect, and enjoy a moment of strength and comfort.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-display font-semibold text-coffee-amber mb-4">
                Community First
              </h3>
              <p className="text-coffee-light leading-relaxed">
                Beyond coffee, we're building a community of bold thinkers, creative souls, and coffee enthusiasts who appreciate uncompromising quality and authentic experiences.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-display font-semibold text-coffee-amber mb-4">
                Art & Culture
              </h3>
              <p className="text-coffee-light leading-relaxed">
                We integrate fine art into our café experience, creating a cultural hub where coffee and creativity intersect. Each visit offers both a caffeine boost and an artistic discovery.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Cultural Inspiration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <h2 className="text-4xl font-display font-bold text-coffee-amber mb-6">
            Cultural & Creative Inspiration
          </h2>
          <p className="text-lg text-coffee-light max-w-3xl mx-auto leading-relaxed">
            Rabuste Coffee draws inspiration from the bold, unapologetic nature of Robusta coffee itself. We celebrate strength, character, and authenticity—values that resonate in both coffee culture and contemporary art. Our space is designed to be a canvas where coffee expertise meets artistic expression, creating a unique experience that stimulates both the palate and the mind.
          </p>
        </motion.div>
      </section>

      <Chatbot />
    </div>
  );
};

export default About;

