import React from 'react';

const colors = {
  green: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400',
};

const Badge = ({ children, color = 'purple', className = '' }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
    {children}
  </span>
);

export default Badge;
