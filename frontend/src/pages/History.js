import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Badge, SkeletonCard, Button } from '../components/ui';
import { useRefresh } from '../context/RefreshContext';
import { FiBarChart2, FiClock, FiSearch, FiTarget, FiTrash2, FiX } from 'react-icons/fi';

const History = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { triggerRefresh } = useRefresh();

  const fetchHistory = () => {
    setLoading(true);
    api.get('/interview/history')
      .then(({ data }) => setInterviews(data))
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const id = deleteId;
    setInterviews((prev) => prev.filter((iv) => iv._id !== id));
    setDeleteId(null);
    try {
      await api.delete(`/interview/${id}`);
      toast.success('Interview deleted successfully.');
      triggerRefresh();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete interview');
      fetchHistory();
    }
    setDeleting(false);
  };

  const filtered = interviews.filter((iv) =>
    iv.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 dark:text-white">Interview History</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Review all your past interviews</p>
      </motion.div>

      <div className="relative w-full">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#1a1428]/80 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-all duration-300"
        />
      </div>

      {loading ? (
        <div className="grid gap-4">{[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-500/10 flex items-center justify-center mx-auto mb-4">
            <FiTarget className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {search ? 'No matching interviews' : 'No interviews yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {search ? 'Try a different search term' : 'Complete your first interview to see it here'}
          </p>
          {!search && <Button onClick={() => navigate('/resume')} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20">Start Interview</Button>}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((iv, i) => (
            <motion.div
              key={iv._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="relative">
                <div
                  onClick={() => navigate(`/interview/${iv._id}`)}
                  className="glass rounded-2xl p-4 sm:px-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <FiBarChart2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white break-words">{iv.role}</h4>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                          <FiClock className="w-3 h-3 shrink-0" />
                          <span className="text-sm">{new Date(iv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className={`text-base sm:text-lg font-bold font-display ${
                        iv.overallScore >= 80 ? 'text-emerald-500' :
                        iv.overallScore >= 50 ? 'text-amber-500' : 'text-red-500'
                      }`}>{iv.overallScore}</span>
                      <Badge color={iv.overallScore >= 80 ? 'green' : iv.overallScore >= 50 ? 'yellow' : 'red'}>
                        {iv.overallScore >= 80 ? 'Great' : iv.overallScore >= 50 ? 'Good' : 'Needs Work'}
                      </Badge>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(iv._id); }}
                        className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 shadow-lg shrink-0"
                        title="Delete interview"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm backdrop-blur-xl bg-[#1a1428]/90 border border-red-500/20 rounded-2xl p-6 shadow-2xl shadow-red-500/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <FiTrash2 className="w-5 h-5 text-red-400" />
                </div>
                <button
                  onClick={() => setDeleteId(null)}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Delete interview?</h3>
              <p className="text-sm text-gray-400 mb-6">
                Are you sure you want to delete this interview? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-gray-700 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-sm font-medium text-white shadow-lg shadow-red-500/20 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;
