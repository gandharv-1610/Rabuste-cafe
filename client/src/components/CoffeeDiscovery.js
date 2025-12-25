import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const CoffeeDiscovery = () => {
  const [mood, setMood] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [energyLevel, setEnergyLevel] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDiscover = async () => {
    if (!mood || !timeOfDay || !energyLevel) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setRecommendation(null);

    try {
      const response = await api.post('/ai/coffee-discovery', {
        mood,
        timeOfDay,
        energyLevel,
      });
      setRecommendation(response.data);
    } catch (err) {
      console.error('Discovery error:', err);
      console.error('Error response:', err.response?.data);
      
      // Get detailed error message
      let errorMessage = 'Unable to generate recommendation. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Add helpful hints based on error
      if (errorMessage.includes('API key') || errorMessage.includes('Invalid')) {
        errorMessage += ' Please check your API key configuration.';
      } else if (errorMessage.includes('model') || errorMessage.includes('not found')) {
        errorMessage += ' The AI model may not be available. Please try again in a moment.';
      } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        errorMessage += ' Please wait a moment and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-coffee-brown/20 rounded-lg p-8">
      <h2 className="text-3xl font-heading font-bold text-coffee-amber mb-6 text-center">
        AI Coffee Discovery
      </h2>
      <p className="text-coffee-light text-center mb-8">
        Let our AI recommend the perfect Robusta brew based on your mood, time of day, and energy level
      </p>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-coffee-amber font-semibold mb-2">
            Your Mood
          </label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
          >
            <option value="">Select your mood</option>
            <option value="Relaxed">Relaxed</option>
            <option value="Focused">Focused</option>
            <option value="Energetic">Energetic</option>
            <option value="Stressed">Stressed</option>
            <option value="Happy">Happy</option>
            <option value="Tired">Tired</option>
            <option value="Creative">Creative</option>
          </select>
        </div>

        <div>
          <label className="block text-coffee-amber font-semibold mb-2">
            Time of Day
          </label>
          <select
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
            className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
          >
            <option value="">Select time of day</option>
            <option value="Early Morning (6-9 AM)">Early Morning (6-9 AM)</option>
            <option value="Morning (9 AM-12 PM)">Morning (9 AM-12 PM)</option>
            <option value="Afternoon (12-5 PM)">Afternoon (12-5 PM)</option>
            <option value="Evening (5-9 PM)">Evening (5-9 PM)</option>
            <option value="Night (9 PM+)">Night (9 PM+)</option>
          </select>
        </div>

        <div>
          <label className="block text-coffee-amber font-semibold mb-2">
            Energy Level
          </label>
          <select
            value={energyLevel}
            onChange={(e) => setEnergyLevel(e.target.value)}
            className="w-full bg-coffee-brown/40 border border-coffee-brown text-coffee-cream rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-coffee-amber"
          >
            <option value="">Select energy level</option>
            <option value="Low - Need a boost">Low - Need a boost</option>
            <option value="Moderate - Steady state">Moderate - Steady state</option>
            <option value="High - Already energized">High - Already energized</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">
            {error}
          </div>
        )}

        <button
          onClick={handleDiscover}
          disabled={loading}
          className="w-full bg-coffee-amber text-coffee-darker py-4 rounded-lg font-semibold hover:bg-coffee-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Discovering...' : 'Discover My Coffee'}
        </button>

        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-coffee-amber/20 to-coffee-gold/20 rounded-lg p-6 border-2 border-coffee-amber/30"
          >
            <h3 className="text-2xl font-heading font-bold text-coffee-amber mb-4">
              Your Perfect Brew
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {recommendation.image && (
                  <img 
                    src={recommendation.image} 
                    alt={recommendation.recommendation || recommendation.itemName}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg shadow-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-xl font-heading font-bold text-coffee-cream">
                      {recommendation.recommendation || recommendation.itemName}
                    </h4>
                    {recommendation.isBestseller && (
                      <span className="text-xs bg-coffee-gold text-coffee-darker px-2 py-1 rounded-full font-semibold">
                        ⭐ BESTSELLER
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="inline-block bg-coffee-amber/30 text-coffee-amber px-3 py-1 rounded-full text-sm font-medium">
                      {recommendation.strength}
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-coffee-light">Blend:</span>
                        {(recommendation.priceBlend && parseFloat(recommendation.priceBlend) > 0) ? (
                          <span className="text-lg font-semibold text-coffee-gold">
                            ₹{parseFloat(recommendation.priceBlend).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-coffee-light text-sm">N/A</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-coffee-light">Robusta Special:</span>
                        {(recommendation.priceRobustaSpecial && parseFloat(recommendation.priceRobustaSpecial) > 0) ? (
                          <span className="text-lg font-semibold text-coffee-gold">
                            ₹{parseFloat(recommendation.priceRobustaSpecial).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-coffee-light text-sm">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {recommendation.description && (
                    <p className="text-coffee-light text-sm mb-2">
                      {recommendation.description}
                    </p>
                  )}
                  {recommendation.flavorNotes && recommendation.flavorNotes.length > 0 && (
                    <div className="mb-2">
                      <span className="text-coffee-amber text-sm font-semibold">Flavor Notes: </span>
                      <span className="text-coffee-light text-sm">
                        {recommendation.flavorNotes.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-3 border-t border-coffee-amber/20">
                <p className="text-coffee-light leading-relaxed">
                  {recommendation.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CoffeeDiscovery;

