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
  satisfaction: number;
  features: string[];
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email) return;

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
      <Header />
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
                  {categoryList.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 font-medium transition-colors ${
                        activeCategory === category
                          ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                      }`}
                    >
                      {category}
                      {categories[category].hasAllProductsPack && (
                        <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded">
                          All Products
                        </span>
                      )}
                    </button>
                  ))}
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

                                  {/* Satisfaction */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                      만족도:{' '}
                                      {productUsageData[activeCategory]?.[product]?.satisfaction ||
                                        5}
                                      /10
                                    </label>
                                    <input
                                      type="range"
                                      min="1"
                                      max="10"
                                      value={
                                        productUsageData[activeCategory]?.[product]?.satisfaction ||
                                        5
                                      }
                                      onChange={(e) =>
                                        handleProductUsageChange(
                                          activeCategory,
                                          product,
                                          'satisfaction',
                                          Number(e.target.value)
                                        )
                                      }
                                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                    />
                                  </div>
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
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
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

export default SoftwareSurvey;
