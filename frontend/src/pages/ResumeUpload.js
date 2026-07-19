import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useInterviewMode } from '../context/InterviewModeContext';
import { Button } from '../components/ui';
import { FiUpload, FiFile, FiCheck, FiX, FiBriefcase, FiArrowRight, FiZap, FiTarget, FiChevronLeft, FiBookOpen, FiAward } from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';

const steps = ['Interview Details', 'Choose Mode'];

const experienceLevels = [
  { value: 'junior', label: 'Junior', desc: '0-2 years experience' },
  { value: 'mid', label: 'Mid-Level', desc: '2-5 years experience' },
  { value: 'senior', label: 'Senior', desc: '5-8 years experience' },
  { value: 'lead', label: 'Lead / Architect', desc: '8+ years experience' },
];

const difficulties = [
  { value: 'easy', label: 'Easy', desc: 'Fundamental concepts' },
  { value: 'medium', label: 'Medium', desc: 'Applied problem solving' },
  { value: 'hard', label: 'Hard', desc: 'Complex system design' },
];

const languages = ['English', 'Urdu', 'Hindi', 'Arabic', 'Spanish'];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [difficulty, setDifficulty] = useState('medium');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [step, setStep] = useState(1);
  const inputRef = useRef();
  const navigate = useNavigate();
  const { mode, setMode } = useInterviewMode();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setMessage('');
    } else {
      setMessage('Please upload a PDF file');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('resume', file);
    try {
      await api.post('/resume/upload', formData);
      setMessage('Resume uploaded successfully!');
      setUploaded(true);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed');
    }
    setLoading(false);
  };

  const handleContinue = () => {
    if (!role.trim()) return;
    setStep(2);
  };

  const handleStart = (selectedMode) => {
    if (!role.trim()) return;
    setMode(selectedMode);
    navigate('/interview', {
      state: {
        role: role.trim(),
        company: company.trim(),
        experienceLevel,
        difficulty,
        language,
        mode: selectedMode,
      },
    });
  };

  const canContinue = role.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-all duration-300">
                <FiChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 dark:text-white">
              {step === 1 ? 'Prepare for Interview' : 'Choose Your Mode'}
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {step === 1 ? 'Set up your interview preferences to generate personalized questions' : 'Pick the experience that matches your goals'}
          </p>
          {/* Steps indicator */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  step === i + 1
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : step > i + 1
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}>
                  {step > i + 1 ? <FiCheck className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs font-medium ${step === i + 1 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`}>{s}</span>
                {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200 dark:bg-gray-700" />}
              </div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" {...fadeUp} className="space-y-6">
              {/* Drag & Drop Area */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
                  relative p-10 sm:p-14 rounded-3xl border-2 border-dashed cursor-pointer
                  transition-all duration-300 text-center group
                  ${dragOver
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/5'
                    : uploaded
                      ? 'border-green-400 bg-green-50 dark:bg-green-500/5'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 bg-white dark:bg-surface-dark-50'
                  }
                `}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => { setFile(e.target.files[0]); setMessage(''); setUploaded(false); }}
                  className="hidden"
                />
                {uploaded ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-500/10 inline-flex items-center justify-center">
                      <FiCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-green-600 dark:text-green-400 font-medium">Resume uploaded!</p>
                  </div>
                ) : file ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-500/10 inline-flex items-center justify-center">
                      <FiFile className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); setUploaded(false); }}
                      className="text-sm text-red-500 hover:text-red-600 inline-flex items-center gap-1 transition-all duration-300"
                    >
                      <FiX className="w-3 h-3" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 inline-flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-500/10 transition-all duration-300">
                      <FiUpload className="w-8 h-8 text-gray-400 group-hover:text-purple-500 transition-all duration-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Drop your resume here</p>
                      <p className="text-sm text-gray-500">or click to browse (PDF only)</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Upload Button */}
              {file && !uploaded && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Button onClick={handleUpload} loading={loading} className="w-full" size="lg">
                    <FiUpload className="w-4 h-4" />
                    {loading ? 'Uploading...' : 'Upload Resume'}
                  </Button>
                </motion.div>
              )}

              {message && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm transition-all duration-300 ${message.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}
                >
                  {message}
                </motion.p>
              )}

              {/* Target Role */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target Role</p>
                <div className="flex gap-0 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:border-purple-500 focus-within:shadow-lg focus-within:shadow-purple-500/10 transition-all duration-300">
                  <div className="w-24 bg-[#1a1a2e] flex items-center justify-center shrink-0">
                    <FiBriefcase className="w-5 h-5 text-purple-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Developer"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="flex-1 bg-white dark:bg-surface-dark-50 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Company (optional) */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company <span className="text-gray-400 normal-case">(optional)</span></p>
                <div className="flex gap-0 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 focus-within:border-purple-500 focus-within:shadow-lg focus-within:shadow-purple-500/10 transition-all duration-300">
                  <div className="w-24 bg-[#1a1a2e] flex items-center justify-center shrink-0">
                    <FaBuilding className="w-5 h-5 text-purple-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Google, Stripe, local startup"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="flex-1 bg-white dark:bg-surface-dark-50 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Experience Level</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {experienceLevels.map((el) => (
                    <button
                      key={el.value}
                      onClick={() => setExperienceLevel(el.value)}
                      className={`p-3 rounded-xl text-left border transition-all duration-200 ${
                        experienceLevel === el.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark-50 hover:border-purple-300 dark:hover:border-purple-600'
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{el.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{el.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Difficulty</p>
                <div className="flex gap-2">
                  {difficulties.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDifficulty(d.value)}
                      className={`flex-1 p-3 rounded-xl text-center border transition-all duration-200 ${
                        difficulty === d.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark-50 hover:border-purple-300 dark:hover:border-purple-600'
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{d.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{d.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interview Language</p>
                <div className="flex gap-2 flex-wrap">
                  {languages.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                        language === l
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-surface-dark-50 text-gray-600 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-600'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleContinue}
                disabled={!canContinue}
                className="w-full"
                size="lg"
              >
                Continue
                <FiArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" {...fadeUp} className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Role: <span className="font-medium text-gray-900 dark:text-white">{role}</span>
                {company && <> at <span className="font-medium text-gray-900 dark:text-white">{company}</span></>}
                {' · '}<span className="text-gray-600 dark:text-gray-300 capitalize">{experienceLevel}</span>
                {' · '}<span className="text-gray-600 dark:text-gray-300 capitalize">{difficulty}</span>
                {' · '}{language}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Learning Mode Card */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStart('learning')}
                  className="relative overflow-hidden rounded-2xl p-6 text-left border-2 transition-all duration-300 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-500/5 dark:to-green-500/5 border-emerald-200 dark:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/10 group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                      <FiBookOpen className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-1">
                      Learning Mode
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Learn concepts before taking the interview
                    </p>
                    <ul className="space-y-2">
                      {[
                        'Unlimited attempts',
                        'AI explains mistakes',
                        'AI gives hints',
                        'AI shows ideal answers',
                        'Retry same question',
                      ].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <FiCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold group-hover:bg-emerald-600 transition-all duration-300">
                        <FiZap className="w-4 h-4" />
                        Start Learning
                      </span>
                    </div>
                  </div>
                </motion.button>

                {/* Mock Interview Card */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStart('mock')}
                  className="relative overflow-hidden rounded-2xl p-6 text-left border-2 transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-500/5 dark:to-indigo-500/5 border-purple-200 dark:border-purple-500/20 hover:shadow-xl hover:shadow-purple-500/10 group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                      <FiTarget className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-1">
                      Mock Interview
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Real Interview Simulation
                    </p>
                    <ul className="space-y-2">
                      {[
                        'Timer',
                        'No hints',
                        'No retries',
                        'No ideal answers',
                        'Final score',
                      ].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <FiX className="w-4 h-4 text-red-400 shrink-0" />
                          <span className="text-gray-500 dark:text-gray-400">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-purple-500/30 group-hover:from-purple-500 group-hover:to-indigo-500 transition-all duration-300">
                        <FiAward className="w-4 h-4" />
                        Start Exam
                      </span>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResumeUpload;
