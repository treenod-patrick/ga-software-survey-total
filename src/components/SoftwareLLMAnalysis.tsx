import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, FileText, Package, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './common/Card';
import { Button } from './common/Button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StructuredAnalysis {
  summary: string[];
  optimizationTable: {
    software: string;
    currentUsers: number;
    highFreqUsers: number;
    lowFreqUsers: number;
    suggestion: string;
    savings: 'high' | 'medium' | 'low';
  }[];
  insights: string[];
  integrationGroups: {
    title: string;
    suggestion: string;
    reason: string;
    effect: string;
  }[];
  actionPlans: {
    title: string;
    content: string;
    targetSoftware: string;
    expectedEffect: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

interface AnalysisData {
  id: number;
  llm_structured_data: StructuredAnalysis | null;
  llm_raw_markdown: string | null;
  summary_one_liner: string;
  survey_stats: any;
  total_respondents: number;
  total_software_types: number;
  avg_software_per_user: number;
  created_at: string;
  created_by: string;
  token_usage: number;
  model: string;
}

export const SoftwareLLMAnalysis: React.FC = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFullMarkdown, setShowFullMarkdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 최신 분석 결과 로드
  useEffect(() => {
    loadLatestAnalysis();
  }, []);

  const loadLatestAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('software_llm_analysis_history')
        .select('*')
        .eq('analysis_type', 'comprehensive')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // 데이터 없음
          setAnalysis(null);
        } else {
          throw fetchError;
        }
      } else if (data) {
        setAnalysis(data);
      }
    } catch (err: any) {
      console.error('분석 결과 로드 실패:', err);
      setError('분석 결과를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      // Edge Function 호출
      const { data, error: invokeError } = await supabase.functions.invoke('software-analyze', {
        headers: {
          'user-email': user?.email || 'system',
        },
      });

      if (invokeError) {
        throw invokeError;
      }

      if (!data.success) {
        throw new Error(data.error || '분석 실패');
      }

      // 분석 완료 후 최신 결과 다시 로드
      await loadLatestAnalysis();
    } catch (err: any) {
      console.error('분석 실패:', err);
      setError(err.message || '분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // 분석 결과 없음
  if (!analysis && !isAnalyzing) {
    return (
      <Card className="text-center p-12">
        <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
          아직 분석 결과가 없습니다
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          LLM 분석을 실행하여 소프트웨어 라이선스 최적화 보고서를 생성하세요.
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        <Button onClick={handleAnalyze} disabled={isAnalyzing} variant="primary">
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              분석 중...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              분석 시작
            </>
          )}
        </Button>
      </Card>
    );
  }

  // 분석 중
  if (isAnalyzing) {
    return (
      <Card className="text-center p-12">
        <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
          LLM 분석 진행 중...
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          AI가 소프트웨어 사용 현황을 분석하고 있습니다. 잠시만 기다려주세요.
        </p>
      </Card>
    );
  }

  if (!analysis) return null;

  const structuredData = analysis.llm_structured_data;

  // 구조화된 데이터가 없으면 기존 마크다운 표시 (호환성)
  if (!structuredData) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                소프트웨어 라이선스 최적화 분석
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {analysis.summary_one_liner}
              </p>
            </div>
            <Button onClick={handleAnalyze} disabled={isAnalyzing} size="sm" variant="primary">
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 분석
                </>
              )}
            </Button>
          </div>
        </Card>
        {analysis.llm_raw_markdown && (
          <Card>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {analysis.llm_raw_markdown}
              </ReactMarkdown>
            </div>
          </Card>
        )}
      </div>
    );
  }

  const getSavingsColor = (savings: 'high' | 'medium' | 'low') => {
    switch (savings) {
      case 'high': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    }
  };

  const getPriorityLabel = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return '🔴 높음';
      case 'medium': return '🟡 중간';
      case 'low': return '🟢 낮음';
    }
  };

  const getSavingsLabel = (savings: 'high' | 'medium' | 'low') => {
    switch (savings) {
      case 'high': return '높음';
      case 'medium': return '중간';
      case 'low': return '낮음';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 카드 */}
      <Card>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
              소프트웨어 라이선스 최적화 분석
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {analysis.summary_one_liner}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">총 응답자</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {analysis.total_respondents}명
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">조사 소프트웨어</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {analysis.total_software_types}개
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">평균 사용 소프트웨어</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {analysis.avg_software_per_user.toFixed(1)}개/인
                </p>
              </div>
            </div>
          </div>

          <div className="ml-4 flex flex-col gap-2 items-end">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              마지막 분석: {new Date(analysis.created_at).toLocaleString('ko-KR')}
            </span>
            <Button onClick={handleAnalyze} disabled={isAnalyzing} size="sm" variant="primary">
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  다시 분석
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {/* 전체 요약 카드 */}
      <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          📋 전체 요약
        </h3>
        <div className="bg-white bg-opacity-20 rounded-lg p-4">
          <ul className="space-y-2">
            {structuredData.summary.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* 최적화 현황표 카드 */}
      <Card>
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
          <Package className="w-6 h-6 mr-2 text-purple-600" />
          🎯 소프트웨어별 라이선스 최적화 제안
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-purple-100 dark:bg-purple-900/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wider">
                  소프트웨어
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wider">
                  현재 사용자
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wider">
                  고빈도
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wider">
                  저빈도
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wider">
                  최적화 제안
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wider">
                  예상 절감
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {structuredData.optimizationTable.map((row, index) => (
                <tr key={index} className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {row.software}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {row.currentUsers}명
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {row.highFreqUsers}명
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {row.lowFreqUsers}명
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {row.suggestion}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSavingsColor(row.savings)}`}>
                      {getSavingsLabel(row.savings)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 핵심 인사이트 카드 */}
      <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          💡 핵심 인사이트
        </h3>
        <div className="bg-white bg-opacity-20 rounded-lg p-4">
          <ul className="space-y-3">
            {structuredData.insights.map((insight, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 font-bold">{index + 1}.</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* 중복 기능 소프트웨어 통합 검토 카드 */}
      {structuredData.integrationGroups.length > 0 && (
        <Card>
          <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
            🔄 중복 기능 소프트웨어 통합 검토
          </h3>
          <div className="space-y-4">
            {structuredData.integrationGroups.map((group, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                  {group.title}
                </h4>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong className="text-purple-600 dark:text-purple-400">통합 제안:</strong> {group.suggestion}</p>
                  <p><strong className="text-purple-600 dark:text-purple-400">이유:</strong> {group.reason}</p>
                  <p><strong className="text-purple-600 dark:text-purple-400">기대 효과:</strong> {group.effect}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 실행 가능한 액션 플랜 카드 */}
      <Card>
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          ✅ 실행 가능한 액션 플랜
        </h3>
        <div className="space-y-4">
          {structuredData.actionPlans.map((plan, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                  {plan.title}
                </h4>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(plan.priority)}`}>
                  {getPriorityLabel(plan.priority)}
                </span>
              </div>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong className="text-purple-600 dark:text-purple-400">내용:</strong> {plan.content}</p>
                <p><strong className="text-purple-600 dark:text-purple-400">대상 소프트웨어:</strong> {plan.targetSoftware}</p>
                <p><strong className="text-purple-600 dark:text-purple-400">기대 효과:</strong> {plan.expectedEffect}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 메타 정보 */}
      <Card className="bg-gray-50 dark:bg-gray-800">
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <p><strong>분석 모델:</strong> {analysis.model}</p>
          <p><strong>토큰 사용량:</strong> {analysis.token_usage.toLocaleString()} tokens</p>
          <p><strong>분석 실행자:</strong> {analysis.created_by}</p>
          <p><strong>분석 일시:</strong> {new Date(analysis.created_at).toLocaleString('ko-KR')}</p>
        </div>
      </Card>
    </div>
  );
};
