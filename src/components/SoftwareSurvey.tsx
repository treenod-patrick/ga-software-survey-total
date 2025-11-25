import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getOrganizedSoftwareAssignments,
  submitSoftwareSurvey,
  hasSubmittedSoftwareSurvey,
  getUserSoftwareCategories
} from '../lib/softwareData';
import { Header } from './common/Header';
import { Card } from './common/Card';
import { Button } from './common/Button';

interface CategoryData {
  products: string[];
  hasAllProductsPack: boolean;
}

interface ProductUsage {
  frequency: string;
  satisfaction?: number; // 사용 안함 (기존 데이터 호환성 유지)
  features: string[];
  returnIntention?: boolean; // "거의 사용 안함" 선택 시 반납 의사
}

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: '매일 사용' },
  { value: 'weekly', label: '주 2-3회' },
  { value: 'monthly', label: '월 2-3회' },
  { value: 'rarely', label: '거의 사용 안함' }
];

const SoftwareSurvey: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Loading and access states
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Software data
  const [categories, setCategories] = useState<{ [key: string]: CategoryData }>({});
  const [activeCategory, setActiveCategory] = useState<string>('');

  // Form states
  const [selectedProducts, setSelectedProducts] = useState<{ [category: string]: string[] }>({});
  const [productUsageData, setProductUsageData] = useState<{
    [category: string]: { [product: string]: ProductUsage };
  }>({});
  const [generalComments, setGeneralComments] = useState('');

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Return intention modal states
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnModalContext, setReturnModalContext] = useState<{
    category: string;
    product: string;
  } | null>(null);

  useEffect(() => {
    const loadSoftwareData = async () => {
      if (!user?.email) {
        navigate('/login');
        return;
      }

      try {
        const [assignments, submitted, userCategories] = await Promise.all([
          getOrganizedSoftwareAssignments(user.email),
          hasSubmittedSoftwareSurvey(user.email),
          getUserSoftwareCategories(user.email)
        ]);

        setCategories(assignments.categories);
        setAlreadySubmitted(submitted);
        setHasAccess(userCategories.length > 0);

        // Set first category as active
        const firstCategory = Object.keys(assignments.categories)[0];
        if (firstCategory) {
          setActiveCategory(firstCategory);
        }

        // Initialize selected products for All Products Pack users
        const initialSelected: { [category: string]: string[] } = {};
        Object.entries(assignments.categories).forEach(([category, data]) => {
          if (!data.hasAllProductsPack) {
            // For non-All Products Pack users, pre-select assigned products
            initialSelected[category] = data.products;
          } else {
            // For All Products Pack users, start with empty selection
            initialSelected[category] = [];
          }
        });
        setSelectedProducts(initialSelected);
      } catch (err) {
        console.error('Error loading software data:', err);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadSoftwareData();
  }, [user, navigate]);

  const handleProductToggle = (category: string, product: string) => {
    setSelectedProducts(prev => ({
      ...prev,
      [category]: prev[category]?.includes(product)
        ? prev[category].filter(p => p !== product)
        : [...(prev[category] || []), product]
    }));
  };

  const handleProductUsageChange = (
    category: string,
    product: string,
    field: keyof ProductUsage,
    value: string | number | string[]
  ) => {
    // "거의 사용 안함" 선택 시 반납 의사 확인 모달 표시
    if (field === 'frequency' && value === 'rarely') {
      setReturnModalContext({ category, product });
      setShowReturnModal(true);
      return;
    }

    setProductUsageData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [product]: {
          ...prev[category]?.[product],
          [field]: value
        } as ProductUsage
      }
    }));
  };

  // 반납 의사 확인 후 처리
  const handleReturnIntention = (willReturn: boolean) => {
    if (!returnModalContext) return;

    const { category, product } = returnModalContext;

    setProductUsageData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [product]: {
          ...prev[category]?.[product],
          frequency: 'rarely',
          returnIntention: willReturn
        } as ProductUsage
      }
    }));

    setShowReturnModal(false);
    setReturnModalContext(null);
  };

  // 모달 취소 시 (빈도 선택 취소)
  const handleReturnModalCancel = () => {
    setShowReturnModal(false);
    setReturnModalContext(null);
  };

  // 폼 검증: 모든 카테고리의 필수값이 입력되었는지 확인
  const isFormValid = () => {
    const categoryList = Object.keys(categories);

    // 디버깅: 검증 시작
    console.log('🔍 폼 검증 시작');
    console.log('categories:', categoryList);
    console.log('selectedProducts:', selectedProducts);
    console.log('productUsageData:', productUsageData);

    // 카테고리가 없으면 유효하지 않음
    if (categoryList.length === 0) {
      console.log('❌ 카테고리가 없습니다');
      return false;
    }

    for (const category of categoryList) {
      const selected = selectedProducts[category] || [];
      const categoryData = categories[category];

      console.log(`\n📂 카테고리: ${category}`);
      console.log(`  선택된 제품: ${selected.length}개`, selected);
      console.log(`  All Products Pack: ${categoryData.hasAllProductsPack}`);

      // All Products Pack 사용자는 최소 1개 선택 필수
      if (categoryData.hasAllProductsPack && selected.length === 0) {
        console.log(`  ❌ All Products Pack 사용자인데 제품 미선택`);
        return false;
      }

      // 일반 사용자도 선택된 제품이 없으면 안됨
      if (!categoryData.hasAllProductsPack && selected.length === 0) {
        console.log(`  ❌ 일반 사용자인데 제품 미선택`);
        return false;
      }

      // 선택된 각 제품의 필수 입력값 검증
      for (const product of selected) {
        const usage = productUsageData[category]?.[product];

        console.log(`  🔹 제품: ${product}`);
        console.log(`    사용 정보:`, usage);

        // frequency는 필수
        if (!usage?.frequency) {
          console.log(`    ❌ frequency 미입력`);
          return false;
        }
        console.log(`    ✅ frequency: ${usage.frequency}`);
      }

      console.log(`  ✅ ${category} 카테고리 검증 통과`);
    }

    console.log('\n✅ 전체 폼 검증 통과');
    return true;
  };

  // 미완료 카테고리 목록 반환
  const getIncompleteTabs = (): string[] => {
    const incomplete: string[] = [];
    const categoryList = Object.keys(categories);

    for (const category of categoryList) {
      const selected = selectedProducts[category] || [];
      const categoryData = categories[category];

      // 제품 미선택
      if (selected.length === 0) {
        incomplete.push(category);
        continue;
      }

      // 선택된 제품의 필수값 미입력
      for (const product of selected) {
        const usage = productUsageData[category]?.[product];
        if (!usage?.frequency) {
          incomplete.push(category);
          break;
        }
      }
    }

    return incomplete;
  };

  // 미완료 제품 상세 정보 반환
  const getIncompleteDetails = (): string[] => {
    const details: string[] = [];
    const categoryList = Object.keys(categories);

    for (const category of categoryList) {
      const selected = selectedProducts[category] || [];

      // 제품 미선택
      if (selected.length === 0) {
        details.push(`[${category}] 제품 미선택`);
        continue;
      }

      // 선택된 제품의 필수값 미입력
      for (const product of selected) {
        const usage = productUsageData[category]?.[product];
        if (!usage?.frequency) {
          details.push(`[${category}] ${product}`);
        }
      }
    }

    return details;
  };

  // 특정 카테고리의 완료 상태 확인
  const isCategoryComplete = (category: string): boolean => {
    const selected = selectedProducts[category] || [];
    const categoryData = categories[category];

    // 제품 미선택
    if (selected.length === 0) {
      return false;
    }

    // 선택된 제품의 필수값 검증
    for (const product of selected) {
      const usage = productUsageData[category]?.[product];
      if (!usage?.frequency) {
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email) return;

    // 폼 검증
    if (!isFormValid()) {
      const incompleteTabs = getIncompleteTabs();
      setError(
        `다음 카테고리의 설문을 완료해주세요: ${incompleteTabs.join(', ')}. ` +
        `모든 제품의 사용 빈도를 선택해야 합니다.`
      );
      // 첫 번째 미완료 탭으로 이동
      if (incompleteTabs.length > 0) {
        setActiveCategory(incompleteTabs[0]);
      }
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Build response data
      const responses = Object.entries(selectedProducts).map(([category, products]) => ({
        category,
        products,
        usageInfo: productUsageData[category] || {},
        comments: generalComments
      }));

      // 제출 데이터 확인 (디버깅용)
      console.log('📝 제출 데이터 확인:');
      console.log('사용자:', user.email);
      console.log('응답 데이터:', JSON.stringify(responses, null, 2));

      // returnIntention 필드 확인
      responses.forEach((response, idx) => {
        console.log(`\n카테고리 ${idx + 1}: ${response.category}`);
        Object.entries(response.usageInfo || {}).forEach(([product, info]) => {
          if (info.returnIntention !== undefined) {
            console.log(`  ✅ ${product} - returnIntention: ${info.returnIntention}`);
          }
        });
      });

      await submitSoftwareSurvey(user.email, responses);
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
        <Header title="소프트웨어 라이선스 설문조사" />
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
        <Header title="소프트웨어 라이선스 설문조사" />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center p-12">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              접근 권한이 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              소프트웨어 설문조사에 대한 권한이 없습니다.
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
        <Header title="소프트웨어 라이선스 설문조사" />
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
                소프트웨어 사용 현황 설문조사가 성공적으로 제출되었습니다.
              </p>
              <Button onClick={() => navigate('/')}>홈으로 돌아가기</Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const categoryList = Object.keys(categories);
  const currentCategoryData = categories[activeCategory];

  // Survey form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header title="소프트웨어 라이선스 설문조사" />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
              소프트웨어 사용 현황 조사
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              할당된 소프트웨어의 사용 현황을 파악하기 위한 설문조사입니다.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Category Tabs */}
              {categoryList.length > 1 && (
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                  {categoryList.map((category) => {
                    const isComplete = isCategoryComplete(category);
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
                          activeCategory === category
                            ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                      >
                        {category}
                        {categories[category].hasAllProductsPack && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded">
                            All Products
                          </span>
                        )}
                        {!isComplete && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Products Section */}
              {currentCategoryData && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {activeCategory} 제품
                    </h2>
                  </div>

                  {currentCategoryData.hasAllProductsPack && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        💎 All Products Pack 사용자입니다. 사용하는 제품을 선택해주세요.
                      </p>
                    </div>
                  )}

                  {/* Product Selection */}
                  <div className="space-y-3">
                    {currentCategoryData.products.map((product) => {
                      const isSelected = selectedProducts[activeCategory]?.includes(product);
                      const canSelect = currentCategoryData.hasAllProductsPack;

                      return (
                        <div
                          key={product}
                          className={`p-4 border rounded-lg transition-colors ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                canSelect && handleProductToggle(activeCategory, product)
                              }
                              disabled={!canSelect}
                              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <span className="font-medium text-gray-800 dark:text-white">
                                {product}
                              </span>

                              {/* Usage details for selected products */}
                              {isSelected && (
                                <div className="mt-4 space-y-4 pl-4 border-l-2 border-blue-300 dark:border-blue-700">
                                  {/* Frequency */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      사용 빈도
                                    </label>
                                    <select
                                      value={
                                        productUsageData[activeCategory]?.[product]?.frequency || ''
                                      }
                                      onChange={(e) =>
                                        handleProductUsageChange(
                                          activeCategory,
                                          product,
                                          'frequency',
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    >
                                      <option value="">선택해주세요</option>
                                      {FREQUENCY_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Return Intention - 반납 의사 표시 */}
                                  {productUsageData[activeCategory]?.[product]?.frequency === 'rarely' &&
                                   productUsageData[activeCategory]?.[product]?.returnIntention !== undefined && (
                                    <div className="pt-2">
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        반납 의사
                                      </label>
                                      <div className="flex items-center gap-2">
                                        {productUsageData[activeCategory]?.[product]?.returnIntention === true ? (
                                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-300 dark:border-orange-700">
                                            ✓ 반납 예정
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-300 dark:border-green-700">
                                            ✗ 유지
                                          </span>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setReturnModalContext({ category: activeCategory, product });
                                            setShowReturnModal(true);
                                          }}
                                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                          변경
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* General Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  추가 의견 (선택사항)
                </label>
                <textarea
                  value={generalComments}
                  onChange={(e) => setGeneralComments(e.target.value)}
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

              {/* Submit buttons */}
              <div className="space-y-3">
                {/* 경고 메시지 - 제출 불가 사유 */}
                {!isFormValid() && !isSubmitting && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                          선택된 제품의 사용 빈도를 입력해야 제출할 수 있습니다
                        </p>
                        {getIncompleteDetails().length > 0 && (
                          <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                            {getIncompleteDetails().map((detail, idx) => (
                              <li key={idx}>• {detail}: 사용 빈도 미입력</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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
                    disabled={!isFormValid() || isSubmitting}
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
              </div>
            </form>
          </Card>

          {/* 반납 의사 확인 모달 */}
          {showReturnModal && returnModalContext && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
              >
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    💡 라이선스 반납 의사 확인
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <strong>{returnModalContext.product}</strong>를 거의 사용하지 않으신다고 하셨습니다.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    해당 라이선스를 반납하시겠습니까?
                  </p>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleReturnModalCancel}
                      className="flex-1"
                    >
                      취소
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReturnIntention(false)}
                      className="flex-1 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300"
                    >
                      아니요, 유지
                    </Button>
                    <Button
                      onClick={() => handleReturnIntention(true)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      예, 반납
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SoftwareSurvey;
