import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './common/Header';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Input } from './common/Input';

interface SoftwareUsage {
  softwareId: string;
  softwareName: string;
  isCurrentlyUsing: boolean;
  usageFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely' | 'never' | '';
  primaryUse: string;
}

const Survey: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentStep, setCurrentStep] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [softwareUsage, setSoftwareUsage] = useState<SoftwareUsage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [department, setDepartment] = useState('');
  const [nickname, setNickname] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // TODO: Implement submission to Supabase
      console.log('Submitting survey:', {
        department,
        nickname,
        softwareUsage,
        additionalComments
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('설문 제출 오류:', error);
      alert('설문 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Header title="설문 완료" />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-12 text-center" gradient>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-16 h-16 text-white" />
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                설문이 완료되었습니다!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                소중한 의견 감사합니다.
              </p>

              <Button
                onClick={() => navigate('/')}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                홈으로 돌아가기
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header title="소프트웨어 설문조사" showDashboardLink />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            1단계: 기본 정보
          </h2>

          <div className="space-y-6">
            <Input
              label="부서"
              placeholder="소속 부서를 입력해주세요"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />

            <Input
              label="이름 / 닉네임"
              placeholder="이름 또는 닉네임을 입력해주세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                추가 의견
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2.5 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                rows={4}
                placeholder="소프트웨어 사용과 관련하여 추가 의견이 있으시면 작성해주세요"
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                loading={submitting}
                disabled={!department || !nickname}
                className="bg-gradient-to-r from-green-500 to-green-600"
              >
                설문 제출
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Survey;
