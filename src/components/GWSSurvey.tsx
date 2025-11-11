import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isUserAssignedToGWS, submitGWSSurvey, hasSubmittedGWSSurvey } from '../lib/gwsData';
import { Header } from './common/Header';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Input } from './common/Input';

const GWS_FEATURES = [
  'Gmail',
  'Google Calendar',
  'Google Drive',
  'Google Docs',
  'Google Sheets',
  'Google Slides',
  'Google Meet',
  'Google Chat',
  'Google Forms',
  'Google Sites'
];

const GWSSurvey: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Loading and access states
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Form states
  const [department, setDepartment] = useState('');
  const [nickname, setNickname] = useState('');
  const [usageFrequency, setUsageFrequency] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [satisfaction, setSatisfaction] = useState(5);
  const [comments, setComments] = useState('');

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.email) {
        navigate('/login');
        return;
      }

      try {
        const [assigned, submitted] = await Promise.all([
          isUserAssignedToGWS(user.email),
          hasSubmittedGWSSurvey(user.email)
        ]);

        setHasAccess(assigned);
        setAlreadySubmitted(submitted);
      } catch (err) {
        console.error('Error checking GWS access:', err);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user, navigate]);

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await submitGWSSurvey(user.email, {
        department,
        nickname,
        usageFrequency,
        features: selectedFeatures,
        satisfaction,
        comments
      });

      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting survey:', err);
      setError('설문 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header title="GWS Enterprise 설문조사" />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // No access state
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header title="GWS Enterprise 설문조사" />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center p-12">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              접근 권한이 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              GWS Enterprise 설문조사에 대한 권한이 없습니다.
            </p>
            <Button onClick={() => navigate('/')}>홈으로 돌아가기</Button>
          </Card>
        </div>
      </div>
    );
  }

  // Already submitted state
  if (alreadySubmitted || isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header title="GWS Enterprise 설문조사" />
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="text-center p-12">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                설문 제출 완료!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                GWS Enterprise 설문조사가 성공적으로 제출되었습니다.
              </p>
              <Button onClick={() => navigate('/')}>홈으로 돌아가기</Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Survey form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header title="GWS Enterprise 설문조사" />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
              GWS Enterprise 사용 현황 조사
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Google Workspace Enterprise 사용 현황을 파악하기 위한 설문조사입니다.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Department */}
              <div>
                <Input
                  label="부서"
                  type="text"
                  value={department}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepartment(e.target.value)}
                  placeholder="예: 개발팀"
                  required
                />
              </div>

              {/* Nickname */}
              <div>
                <Input
                  label="닉네임"
                  type="text"
                  value={nickname}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
                  placeholder="예: 홍길동"
                  required
                />
              </div>

              {/* Usage Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  사용 빈도 <span className="text-red-500">*</span>
                </label>
                <select
                  value={usageFrequency}
                  onChange={(e) => setUsageFrequency(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택해주세요</option>
                  <option value="daily">매일 사용</option>
                  <option value="weekly">주 2-3회</option>
                  <option value="monthly">월 2-3회</option>
                  <option value="rarely">거의 사용 안함</option>
                </select>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  주로 사용하는 기능 (복수 선택 가능)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {GWS_FEATURES.map((feature) => (
                    <label
                      key={feature}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Satisfaction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  만족도: {satisfaction}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={satisfaction}
                  onChange={(e) => setSatisfaction(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>매우 불만족</span>
                  <span>매우 만족</span>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  추가 의견 (선택사항)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  placeholder="개선사항이나 추가 의견을 자유롭게 작성해주세요"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      제출 중...
                    </>
                  ) : (
                    '설문 제출'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default GWSSurvey;
