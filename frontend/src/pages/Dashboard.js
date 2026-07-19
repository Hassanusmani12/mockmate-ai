import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRefresh } from '../context/RefreshContext';
import api from '../api/axios';
import { Button, SkeletonCard, ProgressRing } from '../components/ui';
import { FiPlus, FiClock, FiStar, FiTarget, FiArrowRight, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const Dashboard = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { key } = useRefresh();

  useEffect(() => {
    setLoading(true);
    api.get('/interview/history')
      .then(({ data }) => setInterviews(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [key]);

  const completedCount = interviews.length;
  const avgScore = completedCount ? Math.round(interviews.reduce((a, i) => a + (i.overallScore || 0), 0) / completedCount) : 0;
  const highScore = Math.max(...interviews.map((i) => i.overallScore || 0), 0);
  const recentInterviews = interviews.slice(0, 5);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const stats = [
    { label: 'Interviews', value: completedCount, icon: FiClock, color: 'from-blue-500 to-cyan-500', ringColor: 'text-blue-500' },
    { label: 'Average Score', value: `${avgScore}%`, icon: FiStar, color: 'from-orange-500 to-amber-500', ringColor: 'text-orange-500' },
    { label: 'Best Score', value: `${highScore}%`, icon: FiTarget, color: 'from-emerald-500 to-green-500', ringColor: 'text-emerald-500' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="relative overflow-hidden rounded-2xl p-8 sm:p-10 max-w-3xl mx-auto bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-[#1e1e38] dark:to-[#111122] before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.1)_0%,transparent_70%)] dark:before:bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.2)_0%,transparent_70%)] before:pointer-events-none ring-1 ring-purple-500/20 shadow-[0_0_60px_rgba(168,85,247,0.1)]">
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4 ring-1 ring-purple-500/30">
              <FiTrendingUp className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 dark:text-white mb-2">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">{firstName}</span>
              {interviews.length > 0 ? ', ready to improve?' : ''}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {interviews.length > 0
                ? `You've completed ${completedCount} interview${completedCount !== 1 ? 's' : ''}. Keep practicing to sharpen your skills.`
                : 'Start your first mock interview to see results here.'}
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/resume')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:scale-105 transition-all duration-300"
            >
              <FiPlus className="w-4 h-4" />
              {interviews.length > 0 ? 'New Interview' : 'Start First Interview'}
              <FiArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats with Progress Rings */}
      {completedCount > 0 && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto w-full">
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <div className="glass rounded-2xl p-6 text-center hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
                <div className="flex justify-center mb-3">
                  <ProgressRing
                    percentage={typeof s.value === 'string' ? parseInt(s.value) : Math.min(s.value * 10, 100)}
                    size={72}
                    strokeWidth={6}
                    className={s.ringColor}
                  />
                </div>
                <p className="text-xl sm:text-2xl font-bold font-display text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Recent Interviews */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="max-w-3xl mx-auto w-full">
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
        ) : interviews.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-500/10 flex items-center justify-center mx-auto mb-4">
              <FiTarget className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No interviews yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-0">Complete your first interview to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold font-display text-gray-900 dark:text-white">Recent Interviews</h2>
              {interviews.length > 3 && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
                  View All <FiArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
            {recentInterviews.map((iv, i) => (
              <motion.div
                key={iv._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div
                  onClick={() => navigate(`/interview/${iv._id}`)}
                  className="glass rounded-2xl p-4 px-6 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      iv.overallScore >= 80 ? 'bg-emerald-100 dark:bg-emerald-500/10' :
                      iv.overallScore >= 50 ? 'bg-orange-100 dark:bg-orange-500/10' : 'bg-rose-100 dark:bg-rose-500/10'
                    }`}>
                      <FiBarChart2 className={`w-5 h-5 ${
                        iv.overallScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                        iv.overallScore >= 50 ? 'text-orange-600 dark:text-orange-400' : 'text-rose-600 dark:text-rose-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{iv.role}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(iv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold font-display ${
                      iv.overallScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                      iv.overallScore >= 50 ? 'text-orange-600 dark:text-orange-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>{iv.overallScore}</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      iv.overallScore >= 80 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                      iv.overallScore >= 50 ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400' :
                      'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
                    }`}>
                      {iv.overallScore >= 80 ? 'Great' : iv.overallScore >= 50 ? 'Good' : 'Needs Work'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
