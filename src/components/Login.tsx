import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, BarChart3, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { TreenodLogo } from './common/TreenodLogo';

const Login: React.FC = () => {
  const { user, signInWithGoogle, loading } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">로그인 상태를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-clean dark:bg-secondary-900 relative flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* 다크모드 토글 버튼 */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-lg"
      >
        {isDarkMode ? (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </motion.button>

      <div className="relative max-w-md w-full space-y-10">
        {/* 로고 및 제목 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-10">
            <TreenodLogo size="xl" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-4 tracking-tight">
              소프트웨어 <span className="text-primary-600 dark:text-primary-500">설문조사</span>
            </h1>
            <p className="text-lg text-secondary-600 dark:text-secondary-400">
              효율적인 라이선스 관리를 위한 <span className="text-primary-600 dark:text-primary-500 font-semibold">사용 현황 조사</span>
            </p>
          </motion.div>
        </motion.div>

        {/* 메인 로그인 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="p-12" variant="elevated">
            <div className="space-y-8">
              {/* 특징 소개 */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center space-x-4 text-secondary-900 dark:text-white"
                >
                  <div className="w-12 h-12 bg-accent-600 rounded-xl flex items-center justify-center shadow-md">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-semibold">실시간 사용 현황 분석</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center space-x-4 text-secondary-900 dark:text-white"
                >
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-md">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-semibold">맞춤 소프트웨어 관리</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center space-x-4 text-secondary-900 dark:text-white"
                >
                  <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-md">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-semibold">개인별 할당 소프트웨어 관리</span>
                </motion.div>
              </div>

              {/* 구분선 */}
              <div className="border-t border-secondary-200 dark:border-secondary-700"></div>

              {/* 로그인 버튼 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.3 }}
              >
                <Button
                  onClick={() => signInWithGoogle()}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google 계정으로 로그인
                </Button>
              </motion.div>

              {/* 안내 문구 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-center"
              >
                <p className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">
                  회사 계정으로 로그인해주세요
                  <br />
                  할당받은 소프트웨어 정보가 <span className="text-primary-600 dark:text-primary-500 font-semibold">자동으로 불러와</span>집니다
                </p>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* 하단 정보 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            설문 완료까지 약 <span className="text-primary-600 dark:text-primary-500 font-semibold">2-3분</span> 소요됩니다
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
