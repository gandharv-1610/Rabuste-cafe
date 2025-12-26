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
    <div className="bg-gradient-to-br from-coffee-brown/30 via-coffee-brown/20 to-coffee-dark/20 rounded-2xl p-6 md:p-8 border border-coffee-amber/20 shadow-xl shadow-coffee-darkest/30 backdrop-blur-sm">
      {/* Compact Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <svg className="w-6 h-6 text-coffee-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-coffee-amber">
            AI Coffee Discovery
          </h2>
        </div>
        <p className="text-sm md:text-base text-coffee-light/80">
          Find your perfect Robusta brew in seconds
        </p>
      </div>

      {/* Compact Form Grid */}
      <div className="max-w-3xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4 mb-5">
          <div className="select-wrapper relative">
            <label className="block text-xs font-semibold text-coffee-amber/90 mb-1.5 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Your Mood
            </label>
            <div className="relative">
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-gradient-to-br from-coffee-brown/90 to-coffee-dark/90 border-2 border-coffee-amber/30 text-coffee-cream rounded-2xl px-4 py-3.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-coffee-amber/60 focus:border-coffee-amber transition-all duration-300 shadow-lg hover:shadow-xl hover:border-coffee-amber/50 hover:bg-gradient-to-br hover:from-coffee-brown hover:to-coffee-dark appearance-none cursor-pointer backdrop-blur-sm"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FF8C00' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1rem',
                  backgroundColor: 'rgba(90, 68, 50, 0.9)'
                }}
              >
                <option value="" style={{ backgroundColor: '#1A0F0A', color: '#D7CCC8' }}>Select mood</option>
                <option value="Relaxed" style={{ backgroundColor: '#1A0F0A', color: '#EFEBE9' }}>😌 Relaxed</option>
                <option value="Focused" style={{ backgroundColor: '#1A0F0A', color: '#EFEBE9' }}>🎯 Focused</option>
                <option value="Energetic" style={{ backgroundColor: '#1A0F0A', color: '#EFEBE9' }}>⚡ Energetic</option>
                <option value="Stressed" style={{ backgroundColor: '#1A0F0A', color: '#EFEBE9' }}>😰 Stressed</option>
                <option value="Happy" style={{ backgroundColor: '#1A0F0A', color: '#EFEBE9' }}>😊 Happy</option>
                <option value="Tired" style={{ backgroundColor: '#1A0F0A', color: '#EFEBE9' }}>😴 Tired</option>
                <option value="Creative" style={{ backgroundColor: '#1A0F0A', color: '#EFEBE9' }}>✨ Creative</option>
              </select>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-coffee-amber/5 to-transparent pointer-events-none"></div>
            </div>
          </div>

          <div className="select-wrapper relative">
            <label className="block text-xs font-semibold text-coffee-amber/90 mb-1.5 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Time of Day
            </label>
            <div className="relative">
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full bg-gradient-to-br from-coffee-brown/90 to-coffee-dark/90 border-2 border-coffee-amber/30 text-coffee-cream rounded-2xl px-4 py-3.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-coffee-amber/60 focus:border-coffee-amber transition-all duration-300 shadow-lg hover:shadow-xl hover:border-coffee-amber/50 hover:bg-gradient-to-br hover:from-coffee-brown hover:to-coffee-dark appearance-none cursor-pointer backdrop-blur-sm"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FF8C00' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1rem',
                  backgroundColor: 'rgba(90, 68, 50, 0.9)'
                }}
              >
                <option value="" style={{ backgroundColor: '#1A0F0A', color: '#D7CCC8' }}>Select time</option>
                <option value="Early Morning (6-9 AM)" style={{ backgroundColor: '#1A0F0A', color: '#EFEBE9' }}>🌅 Early Morning</option>
                <option value="Morning (9 AM-12 PM)" style={{ backgroundColor: '#1A0F0A', color: '#EFEBE9' }}>☀️ Morning</option>
                <option value="Afternoon (12-5 PM)" style={{ backgroundColor: '#1A0F0A', color: '#EFEBE9' }}>🌤️ Afternoon</option>
                <option value="Evening (5-9 PM)" style={{ backgroundColor: '#1A0F0A', color: '#EFEBE9' }}>🌆 Evening</option>
                <option value="Night (9 PM+)" style={{ backgroundColor: '#1A0F0A', color: '#EFEBE9' }}>🌙 Night</option>
              </select>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-coffee-amber/5 to-transparent pointer-events-none"></div>
            </div>
          </div>

          <div className="select-wrapper relative">
            <label className="block text-xs font-semibold text-coffee-amber/90 mb-1.5 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Energy Level
            </label>
            <div className="relative">
              <select
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value)}
                className="w-full bg-gradient-to-br from-coffee-brown/90 to-coffee-dark/90 border-2 border-coffee-amber/30 text-coffee-cream rounded-2xl px-4 py-3.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-coffee-amber/60 focus:border-coffee-amber transition-all duration-300 shadow-lg hover:shadow-xl hover:border-coffee-amber/50 hover:bg-gradient-to-br hover:from-coffee-brown hover:to-coffee-dark appearance-none cursor-pointer backdrop-blur-sm"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23FF8C00' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1rem',
                  backgroundColor: 'rgba(90, 68, 50, 0.9)'
                }}
              >
                <option value="" style={{ backgroundColor: '#1A0F0A', color: '#D7CCC8' }}>Select energy</option>
                <option value="Low - Need a boost" style={{ backgroundColor: '#1A0F0A', color: '#EFEBE9' }}>🔋 Low</option>
                <option value="Moderate - Steady state" style={{ backgroundColor: '#1A0F0A', color: '#EFEBE9' }}>⚡ Moderate</option>
                <option value="High - Already energized" style={{ backgroundColor: '#1A0F0A', color: '#EFEBE9' }}>🔥 High</option>
              </select>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-coffee-amber/5 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </motion.div>
        )}

        <button
          onClick={handleDiscover}
          disabled={loading}
          className="w-full bg-gradient-to-r from-coffee-amber to-coffee-gold text-coffee-darker py-3 rounded-lg font-bold text-sm md:text-base hover:from-coffee-gold hover:to-coffee-amber transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-coffee-amber/20 hover:shadow-coffee-amber/30 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Discovering...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Discover My Coffee</span>
            </>
          )}
        </button>

        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-5 bg-gradient-to-br from-coffee-amber/25 via-coffee-gold/20 to-coffee-amber/15 rounded-xl p-5 md:p-6 border-2 border-coffee-amber/40 shadow-xl shadow-coffee-amber/10"
          >
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-coffee-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <h3 className="text-xl md:text-2xl font-heading font-bold text-coffee-amber">
                Your Perfect Brew
              </h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              {recommendation.image && (
                <div className="flex-shrink-0">
                  <img 
                    src={recommendation.image} 
                    alt={recommendation.recommendation || recommendation.itemName}
                    className="w-full md:w-28 h-28 object-cover rounded-xl shadow-lg border-2 border-coffee-amber/30"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <h4 className="text-lg md:text-xl font-heading font-bold text-coffee-cream">
                    {recommendation.recommendation || recommendation.itemName}
                  </h4>
                  {recommendation.isBestseller && (
                    <span className="text-xs bg-coffee-gold text-coffee-darker px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                      <span>⭐</span>
                      <span>BESTSELLER</span>
                    </span>
                  )}
                  {recommendation.strength && (
                    <span className="inline-block bg-coffee-amber/40 text-coffee-amber px-2.5 py-1 rounded-full text-xs font-semibold">
                      {recommendation.strength}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                  {(recommendation.priceBlend && parseFloat(recommendation.priceBlend) > 0) && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-coffee-light/80">Blend:</span>
                      <span className="font-bold text-coffee-gold">₹{parseFloat(recommendation.priceBlend).toFixed(2)}</span>
                    </div>
                  )}
                  {(recommendation.priceRobustaSpecial && parseFloat(recommendation.priceRobustaSpecial) > 0) && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-coffee-light/80">Robusta:</span>
                      <span className="font-bold text-coffee-gold">₹{parseFloat(recommendation.priceRobustaSpecial).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {recommendation.description && (
                  <p className="text-coffee-light/90 text-sm mb-2 line-clamp-2">
                    {recommendation.description}
                  </p>
                )}
                
                {recommendation.flavorNotes && recommendation.flavorNotes.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {recommendation.flavorNotes.map((note, idx) => (
                        <span key={idx} className="text-xs bg-coffee-brown/40 text-coffee-cream px-2 py-0.5 rounded-full">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {recommendation.explanation && (
              <div className="mt-4 pt-4 border-t border-coffee-amber/20">
                <p className="text-coffee-light/80 text-sm leading-relaxed">
                  {recommendation.explanation}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CoffeeDiscovery;

