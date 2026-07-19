import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui';
import { FiArrowRight, FiFileText, FiMic, FiBarChart2 } from 'react-icons/fi';

const features = [
  {
    icon: FiFileText,
    title: 'AI-Generated Questions',
    desc: 'Personalized questions tailored to your resume and target role. Every interview is unique.',
  },
  {
    icon: FiMic,
    title: 'Voice & Text Answers',
    desc: 'Practice speaking with browser-native speech recognition or type your responses. Your choice.',
  },
  {
    icon: FiBarChart2,
    title: 'Smart Evaluation',
    desc: 'Get scored on each answer with detailed AI feedback. Track your improvement over time.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const featureItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Hero — centered glass card */}
      <section className="relative px-4 pt-16 sm:pt-20 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/5 via-transparent to-pink-600/5" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-500/5 rounded-full blur-[96px]" />

        <div className="relative max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 sm:p-12 text-center shadow-2xl shadow-purple-500/5"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-sm text-purple-700 dark:text-purple-300 mb-6">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse-soft" />
              AI-Powered Mock Interviews
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display text-gray-900 dark:text-white leading-tight mb-4">
              Ace Your Next
              <br />
              <span className="gradient-text">Technical Interview</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
              Practice with AI-generated questions tailored to your resume.
              Get instant feedback and track your progress.
            </p>

            <div className="flex flex-col items-center gap-3">
              <Link to="/signup">
                <Button size="xl" className="w-full sm:w-auto px-10">
                  Start Free Practice
                  <FiArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link
                to="/login"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Already have an account? <span className="font-medium underline underline-offset-2">Sign In</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Three Feature Cards */}
      <section className="px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 dark:text-white mb-3">
              Everything you need to prepare
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              From AI question generation to detailed performance analytics
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="grid md:grid-cols-3 gap-6"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={featureItem}>
                <div className="glass-card p-8 text-center h-full hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:from-purple-600/20 group-hover:to-pink-600/20 transition-all duration-300">
                    <f.icon className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold font-display text-gray-900 dark:text-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto text-center"
        >
          <div className="glass-card p-10 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-pink-600/5" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-gray-900 dark:text-white mb-3">
                Ready to practice?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-7 max-w-sm mx-auto">
                Join MockMate AI and start preparing for your dream job today
              </p>
              <Link to="/signup">
                <Button size="lg" className="px-8">
                  Get Started Free
                  <FiArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-4 pb-8 text-center text-sm text-gray-400">
        <p>MockMate AI — Built with React, Tailwind CSS &amp; OpenRouter AI</p>
      </footer>
    </div>
  );
};

export default Landing;
