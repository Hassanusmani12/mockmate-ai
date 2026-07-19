import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Input = ({ label, type = 'text', icon: Icon, error, className = '', ...props }) => {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value && props.value.length > 0;

  return (
    <div className={`relative ${className}`}>
      <div className={`
        relative flex items-center gap-3 rounded-xl border transition-all duration-300
        ${focused
          ? 'border-purple-500 shadow-lg shadow-purple-500/10'
          : error
            ? 'border-red-500'
            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
        }
        bg-white dark:bg-surface-dark-50
      `}>
        {Icon && (
          <div className="flex items-center shrink-0 pl-3 pointer-events-none">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full bg-transparent py-3 text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none text-sm
            ${Icon ? 'pr-4 pl-0' : 'px-4'}
          `}
          {...props}
        />
        {label && (
          <motion.label
            animate={{
              y: focused || hasValue ? -28 : 0,
              scale: focused || hasValue ? 0.85 : 1,
              color: focused ? '#7c3aed' : hasValue ? '#9ca3af' : '#9ca3af',
            }}
            className={`
              absolute pointer-events-none text-sm
              ${Icon ? 'left-11' : 'left-4'}
              ${focused || hasValue ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}
            `}
          >
            {label}
          </motion.label>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs mt-1 ml-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
