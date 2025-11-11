import React from 'react';
import { motion } from 'framer-motion';

interface TreenodLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { logo: 'w-6 h-6', text: 'text-lg' },
  md: { logo: 'w-8 h-8', text: 'text-xl' },
  lg: { logo: 'w-12 h-12', text: 'text-2xl' },
  xl: { logo: 'w-16 h-16', text: 'text-3xl' }
};

export const TreenodLogo: React.FC<TreenodLogoProps> = ({
  size = 'md',
  showText = false,
  className = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
      className={`flex items-center space-x-3 ${className}`}
    >
      {/* 로고 SVG */}
      <motion.div
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className={`${sizes[size].logo} relative`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="leafGradient1" cx="0.3" cy="0.3">
              <stop offset="0%" stopColor="#1a5a47" />
              <stop offset="100%" stopColor="#0f3d32" />
            </radialGradient>
            <radialGradient id="leafGradient2" cx="0.3" cy="0.3">
              <stop offset="0%" stopColor="#20a085" />
              <stop offset="100%" stopColor="#1a5a47" />
            </radialGradient>
            <radialGradient id="leafGradient3" cx="0.3" cy="0.3">
              <stop offset="0%" stopColor="#7fb069" />
              <stop offset="100%" stopColor="#20a085" />
            </radialGradient>
            <radialGradient id="leafGradient4" cx="0.3" cy="0.3">
              <stop offset="0%" stopColor="#b8d4a6" />
              <stop offset="100%" stopColor="#7fb069" />
            </radialGradient>
            <linearGradient id="trunkGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="50%" stopColor="#A0522D" />
              <stop offset="100%" stopColor="#654321" />
            </linearGradient>
          </defs>

          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            cx="50"
            cy="25"
            r="15"
            fill="url(#leafGradient1)"
            className="drop-shadow-lg"
          />
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            cx="35"
            cy="35"
            r="12"
            fill="url(#leafGradient2)"
            className="drop-shadow-lg"
          />
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            cx="65"
            cy="35"
            r="12"
            fill="url(#leafGradient2)"
            className="drop-shadow-lg"
          />
          <motion.circle
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            cx="50"
            cy="45"
            r="18"
            fill="url(#leafGradient3)"
            className="drop-shadow-lg"
          />
          <motion.circle
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            cx="42"
            cy="40"
            r="8"
            fill="url(#leafGradient4)"
            className="drop-shadow-md"
          />
          <motion.rect
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            x="46"
            y="55"
            width="8"
            height="25"
            fill="url(#trunkGradient)"
            rx="4"
            className="drop-shadow-lg"
            style={{ transformOrigin: 'bottom' }}
          />
          <motion.ellipse
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            cx="50"
            cy="85"
            rx="20"
            ry="8"
            fill="#654321"
            className="drop-shadow-lg"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
};

export const TreenodIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="25" r="15" fill="#2D5A47" />
      <circle cx="35" cy="35" r="12" fill="#3A7058" />
      <circle cx="65" cy="35" r="12" fill="#3A7058" />
      <circle cx="50" cy="45" r="18" fill="#4A8B6B" />
      <rect x="46" y="55" width="8" height="25" fill="#8B4513" rx="4" />
      <ellipse cx="50" cy="85" rx="20" ry="8" fill="#5A3A28" />
    </svg>
  );
};
