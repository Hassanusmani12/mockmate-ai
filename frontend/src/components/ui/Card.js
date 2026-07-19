import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', glass = true, hover = true, padding = true, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        ${glass ? 'glass-card' : 'bg-white dark:bg-surface-dark-50 rounded-2xl'}
        ${padding ? 'p-6' : ''}
        ${hover ? 'hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between mb-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>{children}</h3>
);

export default Card;
