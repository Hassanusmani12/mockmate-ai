import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useInterviewMode } from '../context/InterviewModeContext';
import { useSpeechToText } from '../hooks/useSpeech';
import { Button, SkeletonChat } from '../components/ui';
import MarkdownContent from '../components/Markdown';
import {
  FiSend, FiMic, FiStopCircle, FiChevronRight, FiChevronLeft,
  FiBookOpen, FiRefreshCw, FiZap, FiEye, FiCheckCircle,
  FiClock, FiBarChart2, FiArrowDown,
  FiMessageSquare,
} from 'react-icons/fi';

const topics = [
  'Node.js', 'Express', 'REST API', 'Authentication', 'JWT',
  'MongoDB', 'SQL', 'Redis', 'Caching', 'Security', 'Error Handling',
];

const totalTopics = topics.length;

const ReadyModal = ({ open, onClose, onConfirm }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#1a1428] rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-200 dark:border-purple-500/10"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <FiZap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white mb-2">Ready for Mock Interview?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              You have completed enough practice.<br />Start your real interview now?
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500" onClick={onConfirm}>
              Start Mock Interview
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const LearningMode = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role || 'Software Developer';
  const company = location.state?.company || '';
  const experienceLevel = location.state?.experienceLevel || 'mid';
  const language = location.state?.language || 'English';

  const { mode: activeMode, setMode } = useInterviewMode();

  const [sessionId, setSessionId] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [started, setStarted] = useState(false);
  const [topicIndex, setTopicIndex] = useState(0);
  const [showReadyModal, setShowReadyModal] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const { listening, transcript, setTranscript, startListening, stopListening } = useSpeechToText();

  useEffect(() => { setInput(transcript); }, [transcript]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatLog, thinking]);

  const handleScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setShowScrollBtn(!atBottom);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    inputRef.current?.focus();
  };

  const start = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/learning/start', { role, company, experienceLevel });
      setSessionId(data.sessionId);
      setStarted(true);
      setTopicIndex(1);
      setChatLog([{ role: 'ai', text: data.firstMessage }]);
    } catch { alert('Failed to start learning session'); }
    setLoading(false);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || thinking || !sessionId) return;
    const msg = text;
    setInput('');
    setTranscript('');
    setChatLog((prev) => [...prev, { role: 'user', text: msg }]);
    setThinking(true);
    try {
      const { data } = await api.post('/learning/message', { sessionId, message: msg, language });
      setChatLog((prev) => [...prev, { role: 'ai', text: data.reply }]);
    } catch {
      setChatLog((prev) => [...prev, { role: 'ai', text: 'Failed to get response. Please try again.', isError: true }]);
    }
    setThinking(false);
  };

  const handleAction = async (endpoint, increment = 0) => {
    if (thinking || !sessionId) return;
    if (endpoint === 'message') {
      sendMessage('Let me review the previous topic again.');
      if (increment) setTopicIndex((i) => Math.max(1, i + increment));
      return;
    }
    setThinking(true);
    if (increment) setTopicIndex((i) => Math.max(1, Math.min(totalTopics, i + increment)));
    try {
      const { data } = await api.post(`/learning/${endpoint}`, { sessionId, language });
      setChatLog((prev) => [...prev, { role: 'ai', text: data.reply }]);
    } catch {
      setChatLog((prev) => [...prev, { role: 'ai', text: 'Failed to process request.', isError: true }]);
    }
    setThinking(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  const handleReadyConfirm = () => {
    setShowReadyModal(false);
    setMode('mock');
    navigate('/interview', {
      state: { role, company, experienceLevel, difficulty: 'medium', language: 'English', autoStart: true, mode: 'mock' },
    });
  };

  if (loading && !started) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <SkeletonChat />
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/30">
            <FiBookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-2">Learning Mode</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Role: <span className="font-medium text-gray-900 dark:text-white">{role}</span>
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {topics.map((t, i) => (
              <span key={t} className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-500/20">
                {i + 1}. {t}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-400 mb-8">Learn at your own pace. Ask questions. No pressure.</p>
          <Button
            onClick={start}
            size="xl"
            className="px-10 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 shadow-lg shadow-emerald-500/25"
          >
            <FiChevronRight className="w-5 h-5" />
            Start Learning
          </Button>
        </motion.div>
      </div>
    );
  }

  const currentTopic = topicIndex > 0 && topicIndex <= totalTopics ? topics[topicIndex - 1] : '';
  const progressPct = Math.round((topicIndex / totalTopics) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 flex flex-col h-[calc(100vh-6rem)]">
      {/* Lesson Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4 mb-4 shrink-0"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <FiBookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">{role}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Topic {topicIndex} of {totalTopics}
                {currentTopic ? <span className="text-emerald-600 dark:text-emerald-400 font-medium"> · {currentTopic}</span> : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <FiBarChart2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{progressPct}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiClock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">~15 min</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium capitalize text-[11px]">
              {experienceLevel}
            </span>
          </div>
        </div>
        <div className="mt-3 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-custom space-y-3 pr-1 mb-3"
      >
        {chatLog.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-500/20'
                : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/20'
            }`}>
              {msg.role === 'user' ? 'U' : 'AI'}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.role === 'ai' && !msg.isError && (
                <div className="text-[11px] text-gray-400 dark:text-gray-500 mb-1 font-medium flex items-center gap-1.5">
                  <FiZap className="w-3 h-3 text-purple-500" />
                  Tutor
                </div>
              )}

              <div className={`rounded-2xl px-5 py-3.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-tr-sm shadow-md shadow-emerald-500/15'
                  : msg.isError
                    ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-gray-900 dark:text-white rounded-tl-sm'
                    : 'bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 text-gray-900 dark:text-white rounded-tl-sm shadow-sm'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                ) : msg.isError ? (
                  <p className="text-sm">{msg.text}</p>
                ) : (
                  <MarkdownContent content={msg.text} accent="emerald" />
                )}
              </div>

              {/* Timestamp */}
              <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1 px-1">
                {msg.role === 'user' ? 'You' : 'Tutor'} · just now
              </p>

              {/* Quick Actions after AI messages */}
              {msg.role === 'ai' && !msg.isError && i === chatLog.length - 1 && !thinking && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex flex-wrap gap-1.5 mt-3"
                >
                  <button
                    onClick={() => { handleAction('next-topic', 1); }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all duration-200"
                  >
                    <FiChevronRight className="w-3 h-3" /> Next Topic
                  </button>
                  <button
                    onClick={() => { handleAction('repeat'); }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all duration-200"
                  >
                    <FiRefreshCw className="w-3 h-3" /> Repeat Topic
                  </button>
                  <button
                    onClick={() => { handleAction('message', -1); }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all duration-200"
                  >
                    <FiChevronLeft className="w-3 h-3" /> Previous Topic
                  </button>
                  <button
                    onClick={() => { handleAction('hint'); }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-medium border border-purple-200 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all duration-200"
                  >
                    <FiEye className="w-3 h-3" /> Hint
                  </button>
                </motion.div>
              )}

              {/* Practice Card visual separator */}
              {msg.role === 'ai' && !msg.isError && msg.text.toLowerCase().includes('practice') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-500/5 dark:to-green-500/5 border border-emerald-200 dark:border-emerald-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FiMessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Practice</span>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Try to answer the question above. Type your response below.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Thinking indicator */}
        {thinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-purple-500/20 shrink-0">
              AI
            </div>
            <div className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            className="self-center mb-2 p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow text-gray-500 dark:text-gray-400"
          >
            <FiArrowDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sticky Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-3 mb-3 shrink-0"
      >
        <div className="flex items-center justify-center flex-wrap gap-2">
          <button
            onClick={scrollToBottom}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <FiArrowDown className="w-3.5 h-3.5" /> Continue
          </button>
          <button
            onClick={() => { handleAction('message', -1); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium border border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all duration-200"
          >
            <FiChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>
          <button
            onClick={() => { handleAction('next-topic', 1); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all duration-200"
          >
            <FiChevronRight className="w-3.5 h-3.5" /> Next
          </button>
          <button
            onClick={() => { handleAction('repeat'); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all duration-200"
          >
            <FiRefreshCw className="w-3.5 h-3.5" /> Repeat
          </button>
          <button
            onClick={() => { handleAction('hint'); }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-medium border border-purple-200 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all duration-200"
          >
            <FiEye className="w-3.5 h-3.5" /> Hint
          </button>
          <button
            onClick={() => setShowReadyModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 hover:from-emerald-400 hover:to-green-500 transition-all duration-200"
          >
            <FiCheckCircle className="w-3.5 h-3.5" /> Ready for Mock Interview
          </button>
        </div>
      </motion.div>

      {/* Composer */}
      <div className="glass rounded-2xl p-3 shrink-0 border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-900/5 pb-6 md:pb-8">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(e); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question, answer the practice, or say 'I don't know'..."
              rows={1}
              maxLength={1024}
              className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none text-sm px-2 py-1.5 pr-24 scrollbar-custom min-h-[44px] max-h-40"
              disabled={thinking}
            />
            <div className="absolute right-2 bottom-1.5 text-[10px] text-gray-400 font-medium tabular-nums">
              {input.length}/1024
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={listening ? stopListening : startListening}
              disabled={thinking}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                listening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title={listening ? 'Stop recording' : 'Start voice input'}
            >
              {listening ? <FiStopCircle className="w-4 h-4" /> : <FiMic className="w-4 h-4" />}
            </button>
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || thinking}
              size="md"
              className="shrink-0 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 shadow-md shadow-emerald-500/20"
            >
              <FiSend className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500 px-1 mt-1.5">
          <span>Enter to send · Shift+Enter for new line</span>
        </div>
      </div>

      {/* Ready Modal */}
      <ReadyModal
        open={showReadyModal}
        onClose={() => setShowReadyModal(false)}
        onConfirm={handleReadyConfirm}
      />
    </div>
  );
};

export default LearningMode;
