import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  variant?: 'default' | 'elevated' | 'flat';
  onClick?: () => void;
}

const variants = {
  default: 'bg-white dark:bg-gray-800 shadow-soft border border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700',
  flat: 'bg-gray-50 dark:bg-gray-900 shadow-none border border-gray-200 dark:border-gray-800'
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  gradient = false,
  variant = 'default',
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={hover ? {
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 }
      } : undefined}
      style={hover ? { willChange: 'transform' } : undefined}
      onClick={onClick}
      className={cn(
        'rounded-xl transition-all duration-200',
        gradient
          ? 'bg-gradient-subtle dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-soft'
          : variants[variant],
        hover && 'cursor-pointer hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-500',
        className
      )}
    >
      {children}
    </motion.div>
  );
};
