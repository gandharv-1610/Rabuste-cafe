import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const OTPModal = ({ isOpen, onClose, email, onVerify, type = 'workshop' }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(600);
      setOtp(['', '', '', '', '', '']);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, timeLeft]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onVerify(otpString);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      // This will be handled by parent component
      await onVerify(null, true); // Resend flag
      setTimeLeft(600);
      setOtp(['', '', '', '', '', '']);
      setError('');
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-coffee-darker border-2 border-coffee-brown rounded-lg p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-display font-bold text-coffee-amber mb-4">
          Verify Your Email
        </h2>
        <p className="text-coffee-light mb-2">
          We've sent a 6-digit OTP to <strong className="text-coffee-amber">{email}</strong>
        </p>
        <p className="text-coffee-light text-sm mb-6">
          Please enter the code below:
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 bg-coffee-brown/40 border-2 border-coffee-brown text-coffee-cream text-center text-2xl font-bold rounded-lg focus:outline-none focus:border-coffee-amber"
            />
          ))}
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="text-center mb-6">
          <p className="text-coffee-light text-sm mb-2">
            {timeLeft > 0 ? (
              <>Time remaining: <span className="text-coffee-amber font-semibold">{minutes}:{seconds.toString().padStart(2, '0')}</span></>
            ) : (
              <span className="text-red-400">OTP expired</span>
            )}
          </p>
          {timeLeft === 0 && (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-coffee-amber hover:underline text-sm"
            >
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6 || timeLeft === 0}
            className="flex-1 bg-coffee-amber text-coffee-darker py-3 rounded-lg font-semibold hover:bg-coffee-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-coffee-brown/40 text-coffee-cream py-3 rounded-lg font-semibold hover:bg-coffee-brown/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OTPModal;

