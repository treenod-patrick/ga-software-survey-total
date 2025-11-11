import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  gradient = false,
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      onClick={onClick}
      className={cn(
        'rounded-xl shadow-lg backdrop-blur-sm border border-gray-200/20 dark:border-gray-700/30',
        gradient
          ? 'bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-900/90'
          : 'bg-white/90 dark:bg-gray-800/90',
        hover && 'cursor-pointer transition-all duration-300',
        'dark:shadow-gray-900/20',
        className
      )}
    >
      {children}
    </motion.div>
  );
};
