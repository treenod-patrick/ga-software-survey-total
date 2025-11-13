import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'glass';
}

const variants = {
  default: 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600',
  filled: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700',
  glass: 'bg-white/10 dark:bg-gray-800/10 backdrop-blur-md border-white/20 dark:border-gray-700/30'
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, variant = 'default', className, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full"
      >
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className={cn(
              "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200",
              isFocused ? "text-primary-500" : "text-gray-400 dark:text-gray-500"
            )}>
              <span aria-hidden="true">{icon}</span>
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={cn(
              'w-full rounded-xl border px-4 py-3 text-gray-900 dark:text-white placeholder-secondary-500 dark:placeholder-secondary-400 transition-all duration-300',
              variants[variant],
              'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none',
              'hover:border-primary-400 dark:hover:border-primary-600',
              'disabled:bg-gray-100 dark:disabled:bg-secondary-800 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 dark:disabled:border-secondary-700',
              icon && 'pl-11',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            {...props}
          />

          {/* Focus glow effect */}
          <div className={cn(
            "absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300",
            isFocused && !error ? "opacity-100" : "opacity-0"
          )}>
            <div className="absolute inset-0 rounded-xl bg-primary-500/5" />
          </div>
        </div>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

Input.displayName = 'Input';
