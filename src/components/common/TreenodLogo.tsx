import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface TreenodLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { logo: 'h-4', text: 'text-lg' },
  md: { logo: 'h-6', text: 'text-xl' },
  lg: { logo: 'h-8', text: 'text-2xl' },
  xl: { logo: 'h-10', text: 'text-3xl' }
};

export const TreenodLogo: React.FC<TreenodLogoProps> = ({
  size = 'md',
  showText = false,
  className = ''
}) => {
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
      className={`flex items-center space-x-3 ${className}`}
    >
      {/* Treenod Logo Image */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className={`${sizes[size].logo} relative`}
      >
        <img
          src={isDarkMode ? '/treenod-logo-dark.png' : '/treenod-logo-light.png'}
          alt="Treenod Logo"
          className={`${sizes[size].logo} object-contain`}
        />
      </motion.div>

      {showText && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`${sizes[size].text} font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent`}
        >
          Treenod
        </motion.span>
      )}
    </motion.div>
  );
};

// Simplified icon version for small uses
export const TreenodIcon: React.FC<{ className?: string }> = ({ className = "h-8" }) => {
  const { isDarkMode } = useTheme();

  return (
    <img
      src={isDarkMode ? '/treenod-logo-dark.png' : '/treenod-logo-light.png'}
      alt="Treenod Icon"
      className={`${className} object-contain`}
    />
  );
};
