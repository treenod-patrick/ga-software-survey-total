import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, BarChart3, Users, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { TreenodLogo } from './common/TreenodLogo';
import { Modal } from './common/Modal';

const ADMIN_EMAILS = [
  'admin@example.com',
  // Add admin emails here
];

const HomePage: React.FC = () => {
  const { user, signInWithGoogle, loading } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showAdminModal, setShowAdminModal] = useState(false);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email || '');

  const handleGWSSurveyStart = () => {
    if (!user) {
      signInWithGoogle('/gws-survey');
    } else {
      navigate('/gws-survey');
    }
  };

  const handleSoftwareSurveyStart = () => {
    if (!user) {
      signInWithGoogle('/software-survey');
    } else {
      navigate('/software-survey');
    }
  };

  const handleDashboardAccess = () => {
    if (!user) {
      signInWithGoogle();
    } else if (isAdmin) {
      navigate('/dashboard');
    } else {
      setShowAdminModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-clean dark:bg-secondary-900">
      {/* 헤더 */}
      <header className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <TreenodLogo size="lg" />
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              {user && (
                <div className="flex items-center space-x-2">
                  <img
                    src={user.user_metadata?.avatar_url || '/default-avatar.png'}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 메인 히어로 섹션 */}
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-bold text-secondary-900 dark:text-white mb-6 tracking-tight leading-tight"
            >
              소프트웨어
              <br />
              <span className="text-primary-600 dark:text-primary-500">
                사용 현황 설문
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-secondary-600 dark:text-secondary-400 mb-10 leading-relaxed"
            >
              소프트웨어 사용 현황을 조사하여
              <br />
              더 효율적인 라이선스 관리와 업무 환경을 제공합니다.
            </motion.p>

            {!user ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Button
                  onClick={() => signInWithGoogle()}
                  variant="primary"
                  size="lg"
                  className="min-w-[200px]"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  설문 시작하기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  onClick={handleDashboardAccess}
                  variant="outline"
                  size="lg"
                  className="min-w-[200px]"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  대시보드 접속
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    onClick={handleGWSSurveyStart}
                    variant="primary"
                    size="lg"
                    className="min-w-[240px]"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    GWS 설문조사
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <Button
                    onClick={handleSoftwareSurveyStart}
                    variant="success"
                    size="lg"
                    className="min-w-[240px]"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    소프트웨어 설문조사
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleDashboardAccess}
                    variant="outline"
                    size="lg"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    대시보드 접속
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* 특징 섹션 */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="p-10 text-center h-full" hover variant="elevated">
              <motion.div
                className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <FileText className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
                간편한 설문
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">
                할당받은 소프트웨어에 대한 간단하고 직관적인 설문으로
                사용 현황을 파악합니다.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="p-10 text-center h-full" hover variant="elevated">
              <motion.div
                className="w-20 h-20 bg-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <BarChart3 className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
                실시간 분석
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">
                수집된 데이터를 바탕으로 실시간 대시보드를 통해
                소프트웨어 사용 현황을 분석합니다.
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card className="p-10 text-center h-full" hover variant="elevated">
              <motion.div
                className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Users className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
                효율적 관리
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">
                사용자별 소프트웨어 할당 현황을 체계적으로 관리하고
                최적화된 라이선스 배분을 지원합니다.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* 관리자 접근 불가 모달 */}
      <Modal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title="접근 권한 제한"
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            관리자만 접근 가능합니다
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            대시보드는 관리자 권한이 있는 사용자만 접근할 수 있습니다.
            <br />
            접근 권한이 필요하시면 관리자에게 문의해주세요.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => setShowAdminModal(false)}
              variant="outline"
            >
              닫기
            </Button>
          </div>
        </div>
      </Modal>

      {/* 푸터 */}
      <footer className="relative bg-secondary-100 dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-secondary-600 dark:text-secondary-400">
            <p className="mb-2 font-semibold text-secondary-900 dark:text-white">© 2025 Software Survey. All rights reserved.</p>
            <p className="text-sm">
              소프트웨어 사용 현황 조사를 통해 <span className="text-primary-600 dark:text-primary-500 font-medium">더 나은 업무 환경</span>을 만들어갑니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
