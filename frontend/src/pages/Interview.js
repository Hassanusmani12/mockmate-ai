import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { useInterviewMode } from '../context/InterviewModeContext';
import { useSpeechToText, speakText } from '../hooks/useSpeech';
import { Button, ProgressRing, Badge, SkeletonChat } from '../components/ui';
import MarkdownContent from '../components/Markdown';
import { FiSend, FiMic, FiStopCircle, FiVolume2, FiChevronRight, FiClock, FiX, FiTrendingUp, FiAlertTriangle, FiZap, FiStar } from 'react-icons/fi';

const SubScoreBar = ({ label, value, color }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-white">{value}/100</span>
    </div>
    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  </div>
);

const ReportModal = ({ report, role, onClose, onDashboard, onNew }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white dark:bg-[#1a1428] rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-200 dark:border-purple-500/10 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold font-display text-gray-900 dark:text-white">Interview Report</h2>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-all">
          <FiX className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center mb-6">
        <div className="relative inline-flex mb-3">
          <ProgressRing percentage={report.overallScore || 0} size={120} strokeWidth={8} />
          <div className="absolute inset-0 flex items-center justify-center">
            <FiStar className={`w-6 h-6 ${report.overallScore >= 80 ? 'text-emerald-500' : report.overallScore >= 50 ? 'text-amber-500' : 'text-red-500'}`} />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.overallScore || 0}/100</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Role: {role}</p>
        <Badge color="purple" className="mt-1">Mock Interview</Badge>
      </div>

      <div className="space-y-3 mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Detailed Scores</p>
        {[
          { label: 'Technical Skills', value: report.technicalScore || report.overallScore, color: 'bg-purple-500' },
          { label: 'Communication', value: report.communicationScore || report.overallScore, color: 'bg-blue-500' },
          { label: 'Confidence', value: report.confidenceScore || report.overallScore, color: 'bg-emerald-500' },
          { label: 'Problem Solving', value: report.problemSolvingScore || report.overallScore, color: 'bg-orange-500' },
        ].map((s) => <SubScoreBar key={s.label} {...s} />)}
      </div>

      {report.strengths?.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2"><FiTrendingUp className="w-4 h-4 text-emerald-500" /><h4 className="text-sm font-semibold text-gray-900 dark:text-white">Strengths</h4></div>
          <ul className="space-y-1">
            {report.strengths.map((s, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2 pl-1">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {report.weaknesses?.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2"><FiAlertTriangle className="w-4 h-4 text-orange-500" /><h4 className="text-sm font-semibold text-gray-900 dark:text-white">Areas for Improvement</h4></div>
          <ul className="space-y-1">
            {report.weaknesses.map((s, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2 pl-1">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {report.suggestions?.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2"><FiZap className="w-4 h-4 text-purple-500" /><h4 className="text-sm font-semibold text-gray-900 dark:text-white">Recommended Topics</h4></div>
          <ul className="space-y-1">
            {report.suggestions.map((s, i) => (
              <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2 pl-1">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onDashboard}>Dashboard</Button>
        <Button className="flex-1" onClick={onNew}>New Interview</Button>
      </div>
    </motion.div>
  </motion.div>
);

const Interview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role || 'Software Developer';
  const company = location.state?.company || '';
  const experienceLevel = location.state?.experienceLevel || 'mid';
  const difficulty = location.state?.difficulty || 'medium';
  const language = location.state?.language || 'English';
  const { mode } = useInterviewMode();

  useEffect(() => {
    if (mode === 'learning' && !location.state?.autoStart) {
      navigate('/learning', { replace: true, state: { role, company, experienceLevel, difficulty, language } });
    }
  }, []);
  useEffect(() => {
    if (location.state?.autoStart && !started) {
      startInterview();
    }
  }, []);

  const [interviewId, setInterviewId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(!!location.state?.autoStart);
  const [thinking, setThinking] = useState(false);
  const [done, setDone] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const [started, setStarted] = useState(false);
  const chatEndRef = useRef(null);

  const { listening, transcript, setTranscript, startListening, stopListening } = useSpeechToText();

  useEffect(() => { setAnswer(transcript); }, [transcript]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatLog, thinking]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/interview/generate', {
        role, company, experienceLevel, difficulty, language,
      });
      setInterviewId(data.interviewId);
      setQuestions(data.questions);
      setStarted(true);
      const firstQ = data.questions[0].question;
      setChatLog([{ role: 'ai', text: firstQ }]);
      speakText(firstQ);
    } catch { alert('Failed to generate questions'); }
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim() || loading) return;
    const userAnswer = answer;
    setAnswer('');
    setTranscript('');
    setChatLog((prev) => [...prev, { role: 'user', text: userAnswer }]);
    setThinking(true);
    try {
      const { data } = await api.post('/interview/answer', {
        interviewId, questionIndex: current, answer: userAnswer,
      });
      setFeedback(data);
      setChatLog((prev) => [...prev, {
        role: 'ai',
        text: `Score: ${data.score}/100 — ${data.feedback}`,
        isFeedback: true,
      }]);
    } catch {
      setChatLog((prev) => [...prev, { role: 'ai', text: 'Failed to evaluate answer. Please try again.', isError: true }]);
    }
    setThinking(false);
  };

  const nextQuestion = () => {
    if (current + 1 < questions.length) {
      const next = current + 1;
      setCurrent(next);
      setFeedback(null);
      setAnswer('');
      setTranscript('');
      const nextQ = questions[next].question;
      setChatLog((prev) => [...prev, { role: 'ai', text: nextQ }]);
      speakText(nextQ);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    setThinking(true);
    try {
      const { data } = await api.post('/interview/finish', { interviewId });
      setReport(data);
      setDone(true);
      setShowReport(true);
    } catch { alert('Failed to generate report'); }
    setThinking(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (feedback) nextQuestion();
      else submitAnswer();
    }
  };

  const autoResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  if (mode === 'learning') return null;

  if (loading && !started) {
    return (
      <div className="max-w-4xl mx-auto px-4"><SkeletonChat /></div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-purple-500/30">
            <FiZap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white mb-2">Mock Interview</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">Role: <span className="font-medium text-gray-900 dark:text-white">{role}</span></p>
          <Badge color="purple" className="mb-4">Mock Interview</Badge>
          <p className="text-sm text-gray-400 mb-8">5 questions · AI-evaluated · Voice or text answers</p>
          <Button onClick={startInterview} size="xl" className="px-10 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25">
            <FiChevronRight className="w-5 h-5" />Start Exam
          </Button>
        </motion.div>
      </div>
    );
  }

  const progress = ((current + (feedback ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="max-w-5xl mx-auto px-4 flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 mb-4 shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
              <FiZap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">{role}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Question {current + 1} of {questions.length}
                <span className="text-purple-600 dark:text-purple-400 font-medium ml-1">· Exam</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <FiClock className="w-3.5 h-3.5" />
            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto scrollbar-custom space-y-4 pr-1 mb-4">
        {chatLog.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-purple-500/20'
                : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/20'
            }`}>
              {msg.role === 'user' ? 'U' : 'AI'}
            </div>
            <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.role === 'ai' && !msg.isError && !msg.isFeedback && (
                <div className="text-[11px] text-gray-400 dark:text-gray-500 mb-1 font-medium flex items-center gap-1.5">
                  <FiZap className="w-3 h-3 text-purple-500" />Question {current + 1}
                </div>
              )}
              <div className={`rounded-2xl px-5 py-3.5 leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-tr-sm shadow-md shadow-purple-500/15'
                  : msg.isFeedback
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-gray-900 dark:text-white rounded-tl-sm shadow-sm'
                    : msg.isError
                      ? 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-gray-900 dark:text-white rounded-tl-sm'
                      : 'bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 text-gray-900 dark:text-white rounded-tl-sm shadow-sm'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                ) : msg.isFeedback || msg.isError ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <MarkdownContent content={msg.text} />
                )}
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1 px-1">
                {msg.role === 'user' ? 'You' : 'Interviewer'} · Q{msg.role === 'ai' && !msg.isFeedback ? current + 1 : ''}
              </p>
            </div>
          </motion.div>
        ))}

        {thinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-indigo-500/20 shrink-0">AI</div>
            <div className="bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/50 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="glass rounded-2xl p-3 shrink-0 border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-900/5 pb-6 md:pb-8">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); autoResize(e); }}
              onKeyDown={handleKeyDown}
              placeholder={feedback ? "Press Next or Finish to continue..." : "Type your answer..."}
              rows={1}
              maxLength={512}
              className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none text-sm px-2 py-1.5 pr-24 scrollbar-custom min-h-[44px] max-h-40"
              disabled={thinking || !!feedback}
            />
            <div className="absolute right-2 bottom-1.5 text-[10px] text-gray-400 font-medium tabular-nums">{answer.length}/512</div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={listening ? stopListening : startListening}
              disabled={thinking}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                listening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title={listening ? 'Stop recording' : 'Start voice input'}
            >
              {listening ? <FiStopCircle className="w-4 h-4" /> : <FiMic className="w-4 h-4" />}
            </button>
            {feedback ? (
              <Button onClick={nextQuestion} size="md" className="shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20">
                {current + 1 < questions.length ? 'Next' : 'Finish'}
                <FiChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={submitAnswer} disabled={!answer.trim() || thinking} size="md" className="shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20">
                <FiSend className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500 px-1 mt-1.5">
          <span>Enter to send · Shift+Enter for new line</span>
          <button onClick={() => speakText(questions[current]?.question)} className="hover:text-purple-500 transition-colors flex items-center gap-1">
            <FiVolume2 className="w-3 h-3" /> Read aloud
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showReport && report && (
          <ReportModal
            report={report}
            role={role}
            onClose={() => setShowReport(false)}
            onDashboard={() => navigate('/dashboard')}
            onNew={() => navigate('/resume')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Interview;
