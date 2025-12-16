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
      setError('Unable to generate recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-coffee-brown/20 rounded-lg p-8">
      <h2 className="text-3xl font-display font-bold text-coffee-amber mb-6 text-center">
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
            <h3 className="text-2xl font-display font-bold text-coffee-amber mb-4">
              Your Perfect Brew
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-semibold text-coffee-cream mb-2">
                  {recommendation.recommendation}
                </h4>
                <span className="inline-block bg-coffee-amber/30 text-coffee-amber px-3 py-1 rounded-full text-sm font-medium">
                  {recommendation.strength}
                </span>
              </div>
              <p className="text-coffee-light leading-relaxed">
                {recommendation.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CoffeeDiscovery;

