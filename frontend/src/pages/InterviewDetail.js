import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { Button, Card, CardHeader, CardTitle, Badge, ProgressRing, SkeletonChat } from '../components/ui';
import { FiArrowLeft, FiCheckCircle, FiAlertCircle, FiZap, FiUser, FiMessageSquare } from 'react-icons/fi';

const InterviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/interview/${id}`)
      .then(({ data }) => setData(data))
      .catch(() => navigate('/dashboard'));
  }, [id, navigate]);

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto">
        <SkeletonChat />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="group">
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Button>
      </motion.div>

      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <ProgressRing percentage={data.overallScore} size={100} strokeWidth={8} />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">{data.role}</h1>
              <p className="text-gray-500 dark:text-gray-400">
                {new Date(data.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                })}
              </p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <Badge color={data.overallScore >= 70 ? 'green' : data.overallScore >= 40 ? 'yellow' : 'red'}>
                  {data.overallScore >= 70 ? 'Passed' : data.overallScore >= 40 ? 'Needs Improvement' : 'Failed'}
                </Badge>
                <Badge color="purple">{data.questions?.length} Questions</Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Questions Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <CardHeader>
          <CardTitle>Questions & Answers</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {data.questions?.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${
                    q.score >= 70 ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' :
                    q.score >= 40 ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                    q.score !== null ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <FiMessageSquare className="w-4 h-4 text-purple-500" />
                        {q.question}
                      </p>
                    </div>
                    <div className="flex items-start gap-2 ml-6">
                      <FiUser className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">{q.answer || 'No answer provided'}</p>
                    </div>
                    {q.score !== null && (
                      <div className="ml-6 flex items-center gap-3">
                        <span className={`text-lg font-bold font-display ${
                          q.score >= 70 ? 'text-green-500' :
                          q.score >= 40 ? 'text-amber-500' :
                          'text-red-500'
                        }`}>
                          {q.score}/100
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{q.feedback}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Report Sections */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Strengths', icon: FiCheckCircle, items: data.strengths, color: 'green', border: 'border-green-200 dark:border-green-500/20', bg: 'bg-green-50 dark:bg-green-500/5', textColor: 'text-green-600 dark:text-green-400' },
          { label: 'Weaknesses', icon: FiAlertCircle, items: data.weaknesses, color: 'amber', border: 'border-amber-200 dark:border-amber-500/20', bg: 'bg-amber-50 dark:bg-amber-500/5', textColor: 'text-amber-600 dark:text-amber-400' },
          { label: 'Suggestions', icon: FiZap, items: data.suggestions, color: 'purple', border: 'border-purple-200 dark:border-purple-500/20', bg: 'bg-purple-50 dark:bg-purple-500/5', textColor: 'text-purple-600 dark:text-purple-400' },
        ].map((section) => (
          <motion.div
            key={section.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`border ${section.border} ${section.bg}`}>
              <div className="flex items-center gap-2 mb-3">
                <section.icon className={`w-5 h-5 ${section.textColor}`} />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{section.label}</h3>
              </div>
              {section.items?.length > 0 ? (
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        section.color === 'green' ? 'bg-green-500' :
                        section.color === 'amber' ? 'bg-amber-500' : 'bg-purple-500'
                      }`} />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No items</p>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InterviewDetail;
