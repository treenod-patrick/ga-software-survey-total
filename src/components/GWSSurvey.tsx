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

const ADVANCED_FEATURES = [
  '5TB 이상 대용량 저장소 사용',
  '파일 버전 관리 / 기록 복원 기능',
  '고급 보안 설정(2단계 인증 예외, S/MIME, Vault 등)',
  '구글 밋(Google Meet) 녹화 기능',
  '외부 사용자와 대용량 파일 공유',
  '없음 / 잘 모르겠음'
];

const GWSSurvey: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Loading and access states
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Form states
  const [accountType, setAccountType] = useState('');
  const [storageShortage, setStorageShortage] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [meetFrequency, setMeetFrequency] = useState('');
  const [largeFiles, setLargeFiles] = useState('');
  const [enterpriseNecessity, setEnterpriseNecessity] = useState('');
  const [migrationConcerns, setMigrationConcerns] = useState('');
  const [confirmation, setConfirmation] = useState(false);

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
    if (!confirmation) {
      setError('확인 사항에 체크해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitGWSSurvey(user.email, {
        accountType,
        storageShortage,
        advancedFeatures: selectedFeatures,
        meetFrequency,
        largeFiles,
        enterpriseNecessity,
        migrationConcerns
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
              GWS Enterprise → Starter 전환 검토 설문조사
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Google Workspace 계정 최적화를 위해 Enterprise 사용 현황을 확인하고자 합니다. 솔직하게 답변 부탁드립니다.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question 1: Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  1. 현재 본인이 사용하는 구글 계정 유형을 알고 계신가요? <span className="text-red-500">*</span>
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택해주세요</option>
                  <option value="enterprise">Enterprise 계정(고급 기능 포함)</option>
                  <option value="starter">Starter 계정(기본 기능만 사용)</option>
                  <option value="unknown">잘 모르겠습니다</option>
                </select>
              </div>

              {/* Question 2: Storage Shortage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  2. 평소 Google Drive 저장 공간이 부족하다고 느낀 적이 있나요? <span className="text-red-500">*</span>
                </label>
                <select
                  value={storageShortage}
                  onChange={(e) => setStorageShortage(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택해주세요</option>
                  <option value="frequent">자주 있다 (용량 경고 또는 업로드 제한 경험)</option>
                  <option value="sometimes">가끔 있다</option>
                  <option value="never">없다</option>
                  <option value="unknown">잘 모르겠다</option>
                </select>
              </div>

              {/* Question 3: Advanced Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  3. 아래 기능 중 최근 3개월 내에 실제 사용한 항목을 모두 선택해주세요. (복수 선택 가능)
                </label>
                <div className="space-y-2">
                  {ADVANCED_FEATURES.map((feature) => (
                    <label
                      key={feature}
                      className="flex items-start space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feature)}
                        onChange={() => handleFeatureToggle(feature)}
                        className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 4: Meet Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  4. Google Meet 사용 빈도는 어느 정도인가요? <span className="text-red-500">*</span>
                </label>
                <select
                  value={meetFrequency}
                  onChange={(e) => setMeetFrequency(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택해주세요</option>
                  <option value="daily">매일</option>
                  <option value="2-3times_weekly">주 2~3회</option>
                  <option value="weekly_or_less">주 1회 이하</option>
                  <option value="rarely">거의 사용하지 않음</option>
                </select>
              </div>

              {/* Question 5: Large Files */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  5. Google Drive 내에서 1개 파일 용량이 100GB 이상인 데이터를 다루시나요? <span className="text-red-500">*</span>
                </label>
                <select
                  value={largeFiles}
                  onChange={(e) => setLargeFiles(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택해주세요</option>
                  <option value="yes">예</option>
                  <option value="no">아니요</option>
                  <option value="unknown">모르겠다</option>
                </select>
              </div>

              {/* Question 6: Enterprise Necessity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  6. 업무 수행 시 Enterprise 계정의 고급 기능이 꼭 필요하다고 생각하시나요? <span className="text-red-500">*</span>
                </label>
                <select
                  value={enterpriseNecessity}
                  onChange={(e) => setEnterpriseNecessity(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택해주세요</option>
                  <option value="essential">반드시 필요하다 (다운그레이드 시 업무 차질 예상)</option>
                  <option value="nice_to_have">있으면 좋지만, 없어도 큰 문제는 없다</option>
                  <option value="not_needed">필요하지 않다 (Starter로 전환 가능)</option>
                  <option value="unknown">잘 모르겠다</option>
                </select>
              </div>

              {/* Question 7: Migration Concerns */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  7. 계정 전환 시 추가 확인이 필요하거나 우려되는 부분이 있다면 자유롭게 적어주세요.
                </label>
                <textarea
                  value={migrationConcerns}
                  onChange={(e) => setMigrationConcerns(e.target.value)}
                  rows={4}
                  placeholder="우려사항이나 확인이 필요한 내용을 작성해주세요"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Question 8: Confirmation */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmation}
                    onChange={(e) => setConfirmation(e.target.checked)}
                    required
                    className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-red-500">*</span> 총무팀이 제출된 내용을 기반으로 Starter 전환 가능성 검토 및 개별 안내를 드릴 예정입니다. 확인하였으며, 검토 후 안내받겠습니다.
                  </span>
                </label>
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
