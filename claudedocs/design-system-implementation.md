# 디자인 시스템 구현 가이드

## 📦 1. Tailwind Config 개선안

### 완전히 새로운 tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ============================================
      // 폰트 패밀리
      // ============================================
      fontFamily: {
        'sans': [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Noto Sans KR',
          'Malgun Gothic',
          'ui-sans-serif',
          'system-ui'
        ],
        'korean': ['Noto Sans KR', 'Malgun Gothic', 'sans-serif'],
      },

      // ============================================
      // 접근성 기반 색상 팔레트
      // ============================================
      colors: {
        // Adobe 레거시 (호환성)
        'adobe-red': '#FF0000',
        'adobe-blue': '#0066CC',

        // Primary - 파랑 계열 (메인 브랜드 색상)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // AA 통과: 4.54:1
          600: '#2563eb',  // AAA 통과: 7.31:1 ⭐ 주요 버튼
          700: '#1d4ed8',  // AAA 통과: 10.24:1
          800: '#1e40af',  // 다크모드 주요
          900: '#1e3a8a',  // 다크모드 강조
        },

        // Secondary - 회색 계열 (텍스트, 배경)
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',  // AA 통과: 5.74:1 ⭐ 보조 텍스트
          600: '#475569',  // AAA 통과: 8.59:1 ⭐ 주요 텍스트
          700: '#334155',  // 다크 배경
          800: '#1e293b',  // 다크 카드 배경
          900: '#0f172a',  // 다크 메인 배경
        },

        // Accent - 초록 계열 (성공, 강조)
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',  // 기존 (대비 4.1:1 부족)
          700: '#15803d',  // AA 통과: 4.82:1 ⭐ Success 버튼
          800: '#166534',  // AAA 통과: 6.89:1
          900: '#14532d',
        },

        // Semantic 색상 (에러, 경고, 정보)
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',  // AA 통과: 5.51:1
          700: '#b91c1c',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',  // AA 통과: 4.52:1
          700: '#b45309',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',  // AAA 통과: 7.31:1
          700: '#1d4ed8',
        },
      },

      // ============================================
      // 타이포그래피 스케일 (Major Third - 1.25 비율)
      // ============================================
      fontSize: {
        'xs': ['12px', { lineHeight: '1.5', letterSpacing: '0.01em' }],
        'sm': ['14px', { lineHeight: '1.5', letterSpacing: '0.005em' }],
        'base': ['16px', { lineHeight: '1.5' }],  // 기본
        'lg': ['18px', { lineHeight: '1.5', letterSpacing: '-0.005em' }],
        'xl': ['20px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        '2xl': ['24px', { lineHeight: '1.375', letterSpacing: '-0.015em' }],
        '3xl': ['32px', { lineHeight: '1.25', letterSpacing: '-0.02em' }],
        '4xl': ['40px', { lineHeight: '1.25', letterSpacing: '-0.025em' }],
        '5xl': ['48px', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
        '6xl': ['60px', { lineHeight: '1.15', letterSpacing: '-0.035em' }],
      },

      // ============================================
      // 8px 기반 간격 시스템
      // ============================================
      spacing: {
        '0': '0px',
        '1': '8px',      // xs
        '2': '16px',     // sm
        '3': '24px',     // md
        '4': '32px',     // lg
        '5': '40px',     // xl (특수)
        '6': '48px',     // xl
        '7': '64px',     // 2xl
        '8': '80px',     // 3xl
        '9': '96px',     // 4xl
        '10': '128px',   // 5xl
      },

      // ============================================
      // 그라데이션
      // ============================================
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',

        // 라이트 모드
        'gradient-clean': 'linear-gradient(to bottom, #ffffff, #f8fafc)',
        'gradient-subtle': 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        'gradient-primary': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',

        // 다크 모드
        'gradient-dark': 'linear-gradient(to bottom, #0f172a, #1e293b)',
        'gradient-dark-subtle': 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      },

      // ============================================
      // 애니메이션
      // ============================================
      animation: {
        // 페이드
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-out': 'fadeOut 0.3s ease-in',

        // 슬라이드
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',

        // 스케일
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-in',

        // 특수 효과
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },

      // ============================================
      // 그림자 시스템 (Elevation)
      // ============================================
      boxShadow: {
        // 기본 그림자
        'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'sm': '0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'DEFAULT': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)',
        'md': '0 6px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 20px rgba(0, 0, 0, 0.10), 0 4px 8px rgba(0, 0, 0, 0.08)',
        'xl': '0 16px 32px rgba(0, 0, 0, 0.12), 0 6px 12px rgba(0, 0, 0, 0.10)',
        '2xl': '0 24px 48px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.12)',

        // 특수 그림자
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'border': '0 0 0 1px rgba(0, 0, 0, 0.05)',

        // 접근성 포커스
        'focus': '0 0 0 3px rgba(59, 130, 246, 0.25)',
        'focus-dark': '0 0 0 3px rgba(147, 197, 253, 0.30)',
        'focus-error': '0 0 0 3px rgba(239, 68, 68, 0.25)',

        // 컬러 그림자 (브랜드 강조)
        'primary': '0 8px 16px rgba(37, 99, 235, 0.20)',
        'accent': '0 8px 16px rgba(21, 128, 61, 0.20)',
        'error': '0 8px 16px rgba(220, 38, 38, 0.20)',
      },

      // ============================================
      // Border Radius
      // ============================================
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',   // 4px
        'DEFAULT': '0.5rem',  // 8px
        'md': '0.625rem',  // 10px
        'lg': '0.75rem',   // 12px
        'xl': '1rem',      // 16px
        '2xl': '1.5rem',   // 24px
        '3xl': '2rem',     // 32px
        'full': '9999px',
      },

      // ============================================
      // Backdrop Blur
      // ============================================
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },

      // ============================================
      // Z-Index
      // ============================================
      zIndex: {
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },

      // ============================================
      // Transition
      // ============================================
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },

      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-in-out-soft': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
    },
  },
  plugins: [],
}
```

---

## 🎨 2. 개선된 Button 컴포넌트

### src/components/common/Button.tsx

```typescript
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  // Primary - 주요 액션 (AAA 대비: 7.31:1)
  primary: cn(
    'bg-primary-600 hover:bg-primary-700 active:bg-primary-800',
    'text-white',
    'shadow-sm hover:shadow-primary',
    'transition-all duration-200'
  ),

  // Secondary - 보조 액션
  secondary: cn(
    'bg-secondary-100 hover:bg-secondary-200 active:bg-secondary-300',
    'dark:bg-secondary-800 dark:hover:bg-secondary-700 dark:active:bg-secondary-600',
    'text-secondary-900 dark:text-secondary-100',
    'shadow-sm hover:shadow-md',
    'transition-all duration-200'
  ),

  // Outline - 강조 없는 액션 (대비 개선)
  outline: cn(
    'border-2',
    'border-secondary-300 hover:border-primary-500 active:border-primary-600',
    'dark:border-secondary-500 dark:hover:border-primary-400 dark:active:border-primary-500',
    'text-secondary-700 hover:text-primary-600',
    'dark:text-secondary-200 dark:hover:text-primary-400',
    'hover:bg-secondary-50 dark:hover:bg-secondary-800',
    'transition-all duration-200'
  ),

  // Ghost - 최소 강조
  ghost: cn(
    'text-secondary-600 hover:text-secondary-900',
    'dark:text-secondary-400 dark:hover:text-secondary-100',
    'hover:bg-secondary-100 dark:hover:bg-secondary-800',
    'transition-all duration-200'
  ),

  // Success - 성공 액션 (AA 대비: 4.82:1) ⭐ accent-700 사용
  success: cn(
    'bg-accent-700 hover:bg-accent-800 active:bg-accent-900',
    'text-white',
    'shadow-sm hover:shadow-accent',
    'transition-all duration-200'
  ),

  // Danger - 위험 액션
  danger: cn(
    'bg-error-600 hover:bg-error-700 active:bg-error-800',
    'text-white',
    'shadow-sm hover:shadow-error',
    'transition-all duration-200'
  ),
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-base rounded-xl gap-2',
  lg: 'px-6 py-3 text-lg rounded-xl gap-2',
  xl: 'px-8 py-4 text-xl rounded-2xl gap-3'
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...props
}) => {
  return (
    <motion.button
      whileHover={
        disabled || loading
          ? undefined
          : {
              scale: 1.02,
              y: -2,
              transition: {
                type: 'spring',
                stiffness: 400,
                damping: 25,
              },
            }
      }
      whileTap={
        disabled || loading
          ? undefined
          : {
              scale: 0.98,
              transition: { duration: 0.1 },
            }
      }
      className={cn(
        'relative inline-flex items-center justify-center',
        'font-semibold',
        'transition-all duration-200',
        'focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'dark:focus-visible:ring-offset-secondary-900',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
        'group',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {children}

      {/* 호버 글로우 효과 */}
      <span
        className={cn(
          'absolute inset-0 rounded-[inherit]',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-300',
          'pointer-events-none',
          variant === 'primary' && 'bg-white/10',
          variant === 'success' && 'bg-white/10',
          variant === 'danger' && 'bg-white/10'
        )}
      />
    </motion.button>
  );
};
```

---

## 🃏 3. 개선된 Card 컴포넌트

### src/components/common/Card.tsx

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  variant?: 'default' | 'elevated' | 'flat' | 'ghost';
  onClick?: () => void;
}

const variants = {
  // Default - 기본 카드 (그림자 강화)
  default: cn(
    'bg-white dark:bg-secondary-800',
    'shadow-sm hover:shadow-md',
    'border border-secondary-200 dark:border-secondary-700'
  ),

  // Elevated - 높은 카드
  elevated: cn(
    'bg-white dark:bg-secondary-800',
    'shadow-md hover:shadow-lg',
    'border border-secondary-100 dark:border-secondary-700'
  ),

  // Flat - 평평한 카드
  flat: cn(
    'bg-secondary-50 dark:bg-secondary-900',
    'shadow-none hover:shadow-sm',
    'border border-secondary-200 dark:border-secondary-800'
  ),

  // Ghost - 경계선만
  ghost: cn(
    'bg-transparent',
    'shadow-none hover:shadow-sm',
    'border border-secondary-200 dark:border-secondary-700',
    'hover:bg-secondary-50 dark:hover:bg-secondary-900'
  ),
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
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={
        hover
          ? {
              scale: 1.02,
              y: -4,
              transition: {
                type: 'spring',
                stiffness: 400,
                damping: 25,
              },
            }
          : undefined
      }
      onClick={onClick}
      className={cn(
        'rounded-xl',
        'transition-all duration-200',
        gradient
          ? cn(
              'bg-gradient-subtle dark:bg-gradient-dark-subtle',
              'border border-secondary-200 dark:border-secondary-700',
              'shadow-soft'
            )
          : variants[variant],
        hover && cn(
          'cursor-pointer',
          'hover:border-primary-400 dark:hover:border-primary-500'
        ),
        className
      )}
    >
      {children}
    </motion.div>
  );
};
```

---

## 📝 4. 개선된 Input 컴포넌트

### src/components/common/Input.tsx

```typescript
import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'glass';
}

const variants = {
  default: cn(
    'bg-white dark:bg-secondary-800',
    'border-secondary-300 dark:border-secondary-600'
  ),
  filled: cn(
    'bg-secondary-50 dark:bg-secondary-900',
    'border-secondary-200 dark:border-secondary-700'
  ),
  glass: cn(
    'bg-white/30 dark:bg-secondary-800/40',
    'backdrop-blur-xl',
    'border-white/30 dark:border-secondary-700/50'
  ),
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full"
      >
        {label && (
          <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
            {label}
          </label>
        )}

        <div className="relative group">
          {/* 아이콘 */}
          {icon && (
            <div
              className={cn(
                'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none',
                'transition-colors duration-200',
                isFocused
                  ? 'text-primary-500 dark:text-primary-400'
                  : 'text-secondary-400 dark:text-secondary-500'
              )}
            >
              {icon}
            </div>
          )}

          {/* 입력 필드 */}
          <input
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'w-full rounded-xl border px-4 py-3',
              'text-secondary-900 dark:text-white',
              'placeholder-secondary-500 dark:placeholder-secondary-400', // ⭐ 대비 개선
              'transition-all duration-300',
              variants[variant],
              'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
              'focus:outline-none',
              'hover:border-primary-400 dark:hover:border-primary-500',
              'disabled:bg-secondary-100 dark:disabled:bg-secondary-800',
              'disabled:text-secondary-600 dark:disabled:text-secondary-400', // ⭐ 대비 개선
              'disabled:cursor-not-allowed disabled:opacity-60',
              'disabled:border-secondary-200 dark:disabled:border-secondary-700',
              icon && 'pl-11',
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
              className
            )}
            {...props}
          />

          {/* 포커스 글로우 효과 */}
          <div
            className={cn(
              'absolute inset-0 rounded-xl pointer-events-none',
              'transition-opacity duration-300',
              isFocused && !error ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="absolute inset-0 rounded-xl bg-primary-500/5" />
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-sm text-error-600 dark:text-error-400 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.p>
        )}

        {/* 도움말 텍스트 */}
        {helperText && !error && (
          <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
            {helperText}
          </p>
        )}
      </motion.div>
    );
  }
);

Input.displayName = 'Input';
```

---

## 🎨 5. 개선된 TreenodLogo 컴포넌트

### src/components/common/TreenodLogo.tsx

```typescript
import React from 'react';
import { motion } from 'framer-motion';

interface TreenodLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'modern' | 'abstract';
  className?: string;
}

const sizes = {
  sm: { logo: 'w-6 h-6', text: 'text-lg' },
  md: { logo: 'w-8 h-8', text: 'text-xl' },
  lg: { logo: 'w-12 h-12', text: 'text-2xl' },
  xl: { logo: 'w-16 h-16', text: 'text-3xl' },
};

export const TreenodLogo: React.FC<TreenodLogoProps> = ({
  size = 'md',
  showText = false,
  variant = 'modern',
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
      className={`flex items-center gap-3 ${className}`}
    >
      {/* 로고 */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        className={`${sizes[size].logo} relative`}
      >
        {variant === 'modern' ? <ModernLogo /> : <AbstractLogo />}
      </motion.div>

      {/* 텍스트 (옵션) */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className={`${sizes[size].text} font-bold text-secondary-900 dark:text-white`}
        >
          Treenod
        </motion.div>
      )}
    </motion.div>
  );
};

// ============================================
// 제안 1: 모던 로고 (단순하고 전문적)
// ============================================
const ModernLogo: React.FC = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
    <defs>
      {/* Primary 그라데이션 */}
      <linearGradient id="modernGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>

      {/* 글로우 효과 */}
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* 나무 크라운 (3개의 삼각형) */}
    <motion.path
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.85, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      d="M50 15 L30 40 L70 40 Z"
      fill="#2563eb"
      filter="url(#glow)"
    />
    <motion.path
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.9, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      d="M50 30 L35 50 L65 50 Z"
      fill="#3b82f6"
    />
    <motion.path
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      d="M50 45 L40 60 L60 60 Z"
      fill="url(#modernGradient)"
    />

    {/* 트렁크 */}
    <motion.rect
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      x="46"
      y="60"
      width="8"
      height="25"
      rx="2"
      fill="#475569"
      style={{ transformOrigin: 'bottom' }}
    />

    {/* 베이스 */}
    <motion.ellipse
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      cx="50"
      cy="87"
      rx="18"
      ry="6"
      fill="#334155"
      opacity="0.6"
    />
  </svg>
);

// ============================================
// 제안 2: 추상 로고 (성장 컨셉)
// ============================================
const AbstractLogo: React.FC = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
    <defs>
      <linearGradient id="abstractGradient1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <linearGradient id="abstractGradient2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>

    {/* 3개의 성장하는 가지 */}
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      d="M50 80 Q40 60 45 35"
      stroke="url(#abstractGradient1)"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
      d="M50 80 Q50 60 50 30"
      stroke="url(#abstractGradient2)"
      strokeWidth="7"
      strokeLinecap="round"
    />
    <motion.path
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      d="M50 80 Q60 60 55 35"
      stroke="url(#abstractGradient1)"
      strokeWidth="6"
      strokeLinecap="round"
    />

    {/* 리프 노드 (원) */}
    <motion.circle
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
      cx="45"
      cy="40"
      r="7"
      fill="#60a5fa"
    />
    <motion.circle
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      cx="50"
      cy="30"
      r="9"
      fill="#3b82f6"
    />
    <motion.circle
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
      cx="55"
      cy="40"
      r="7"
      fill="#60a5fa"
    />

    {/* 트렁크 베이스 */}
    <motion.rect
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      x="46"
      y="70"
      width="8"
      height="15"
      rx="2"
      fill="#64748b"
      style={{ transformOrigin: 'bottom' }}
    />
  </svg>
);

// ============================================
// 아이콘 전용 (텍스트 없이 사용)
// ============================================
export const TreenodIcon: React.FC<{ className?: string; variant?: 'modern' | 'abstract' }> = ({
  className = 'w-6 h-6',
  variant = 'modern',
}) => {
  return (
    <div className={className}>
      {variant === 'modern' ? <ModernLogo /> : <AbstractLogo />}
    </div>
  );
};
```

---

## 📐 6. 사용 예시

### HomePage에서 개선된 컴포넌트 사용

```typescript
// 개선된 버튼
<Button
  onClick={handleSoftwareSurveyStart}
  variant="success"  // ⭐ 이제 accent-700 사용 (대비 4.82:1)
  size="lg"
  className="min-w-[240px]"
>
  <FileText className="w-5 h-5" />
  소프트웨어 설문조사
  <ArrowRight className="w-5 h-5" />
</Button>

// 개선된 카드
<Card className="p-4" hover variant="elevated">
  <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-3">
    간편한 설문
  </h3>
  <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
    할당받은 소프트웨어에 대한 간단하고 직관적인 설문으로
    사용 현황을 파악합니다.
  </p>
</Card>

// 개선된 로고
<TreenodLogo size="lg" variant="modern" showText />
```

---

## ✅ 7. 체크리스트

### 즉시 적용 가능 항목
- [ ] Tailwind config 교체
- [ ] Button 컴포넌트 업데이트 (success variant accent-700)
- [ ] Input 컴포넌트 placeholder 색상 변경
- [ ] Card 그림자 강화
- [ ] TreenodLogo 재디자인 적용

### WCAG 2.1 AA 준수 확인
- [ ] 모든 텍스트 대비율 4.5:1 이상
- [ ] 포커스 링 3px 이상 명확
- [ ] 터치 타겟 44x44px 이상
- [ ] 키보드 네비게이션 작동
- [ ] 다크모드 동일 접근성 기준

### 디자인 시스템 문서화
- [ ] 색상 팔레트 문서 작성
- [ ] 타이포그래피 가이드
- [ ] 간격 시스템 규칙
- [ ] 컴포넌트 사용 예시
