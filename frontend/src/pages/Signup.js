import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiChevronRight } from 'react-icons/fi';

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  delay: Math.random() * 5,
  duration: 4 + Math.random() * 6,
}));

const getStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score;
};

const strengthConfig = [
  { label: '', color: 'bg-gray-700' },
  { label: 'Weak', color: 'bg-red-500' },
  { label: 'Fair', color: 'bg-orange-500' },
  { label: 'Good', color: 'bg-yellow-500' },
  { label: 'Strong', color: 'bg-lime-500' },
  { label: 'Very strong', color: 'bg-emerald-400' },
];

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const strength = useMemo(() => getStrength(password), [password]);

  const validate = () => {
    const errs = {};
    if (password.length < 6) errs.password = 'At least 6 characters';
    if (password !== confirm) errs.confirm = 'Passwords do not match';
    if (!name.trim()) errs.name = 'Name is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      await signup(name, email, password);
      setSuccess(true);
      setTimeout(() => navigate('/resume'), 600);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-900 via-[#0f0a1a] to-gray-900">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDuration: '5s' }} />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDuration: '7s', animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse-soft" style={{ animationDuration: '8s', animationDelay: '2s' }} />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-white/10 dark:bg-[#1a1428]/60 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-purple-500/10 border border-white/10 dark:border-purple-500/10">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-500/30 ring-2 ring-white/10">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-white">Create account</h1>
            <p className="text-gray-400 mt-1 text-sm">Start your interview journey</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Full Name */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
                <div className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-sm transition-all duration-300 group-focus-within:border-purple-500/50 group-focus-within:bg-white/10 group-focus-within:shadow-lg group-focus-within:shadow-purple-500/10">
                  <FiUser className="w-5 h-5 text-gray-400 ml-3.5 shrink-0 group-focus-within:text-purple-400 transition-colors duration-300" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required
                    className="w-full bg-transparent py-3.5 pr-4 text-white placeholder-gray-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
              {fieldErrors.name && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.name}</motion.p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
                <div className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-sm transition-all duration-300 group-focus-within:border-purple-500/50 group-focus-within:bg-white/10 group-focus-within:shadow-lg group-focus-within:shadow-purple-500/10">
                  <FiMail className="w-5 h-5 text-gray-400 ml-3.5 shrink-0 group-focus-within:text-purple-400 transition-colors duration-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full bg-transparent py-3.5 pr-4 text-white placeholder-gray-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </motion.div>

            {/* Password */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
                <div className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-sm transition-all duration-300 group-focus-within:border-purple-500/50 group-focus-within:bg-white/10 group-focus-within:shadow-lg group-focus-within:shadow-purple-500/10">
                  <FiLock className="w-5 h-5 text-gray-400 ml-3.5 shrink-0 group-focus-within:text-purple-400 transition-colors duration-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full bg-transparent py-3.5 pr-10 text-white placeholder-gray-500 focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ width: 0 }}
                      animate={{ width: i <= strength ? '100%' : 0 }}
                      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= strength ? strengthConfig[strength].color : 'bg-gray-700'}`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1 min-w-[5rem]">{strengthConfig[strength].label}</span>
                </div>
              )}
              {fieldErrors.password && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.password}</motion.p>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
                <div className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-sm transition-all duration-300 group-focus-within:border-purple-500/50 group-focus-within:bg-white/10 group-focus-within:shadow-lg group-focus-within:shadow-purple-500/10">
                  <FiLock className="w-5 h-5 text-gray-400 ml-3.5 shrink-0 group-focus-within:text-purple-400 transition-colors duration-300" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    className="w-full bg-transparent py-3.5 pr-10 text-white placeholder-gray-500 focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {fieldErrors.confirm && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-1 ml-1">{fieldErrors.confirm}</motion.p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 h-12 rounded-xl text-sm font-semibold"
              >
                {success ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                    <FiChevronRight className="w-4 h-4" /> Account Created
                  </motion.span>
                ) : loading ? (
                  <span className="flex items-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create Account <FiChevronRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-6 text-center text-sm text-gray-500"
          >
            Already have an account?{' '}
            <Link to="/login" className="text-purple-400 font-medium hover:text-purple-300 transition-colors">
              Sign in
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
