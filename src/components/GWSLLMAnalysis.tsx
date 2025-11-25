import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, FileText, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Accordion } from './common/Accordion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  parseAnalysisData,
  generateChartData,
  formatCurrency,
  formatNumber,
  formatPercent,
  ParsedAnalysis,
} from '../utils/markdownParser';

interface AnalysisData {
  id: number;
  llm_raw_markdown: string;
  llm_structured: any;
  summary_one_liner: string;
  baseline_2024: any[];
  survey_2025: any;
  total_seats_2024: number;
  total_seats_2025: number;
  total_amount_2024: number;
  total_amount_2025: number;
  cost_difference: number;
  cost_difference_percent: number;
  created_at: string;
  created_by: string;
  token_usage: number;
  model: string;
}

export const GWSLLMAnalysis: React.FC = () => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [parsedAnalysis, setParsedAnalysis] = useState<ParsedAnalysis | null>(null);
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
        .from('gws_llm_analysis_history')
        .select('*')
        .eq('analysis_type', 'comprehensive')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // 데이터 없음
          setAnalysis(null);
          setParsedAnalysis(null);
        } else {
          throw fetchError;
        }
      } else if (data) {
        setAnalysis(data);
        setParsedAnalysis(parseAnalysisData(data));
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
      const { data, error: invokeError } = await supabase.functions.invoke('gws-analyze', {
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
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
          LLM 분석을 실행하여 GWS 구매 전략 보고서를 생성하세요.
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        <Button onClick={handleAnalyze} disabled={isAnalyzing}>
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
        <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
          LLM 분석 진행 중...
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          AI가 설문 데이터를 분석하고 있습니다. 잠시만 기다려주세요.
        </p>
      </Card>
    );
  }

  if (!parsedAnalysis) return null;

  const chartData = generateChartData(analysis!.baseline_2024, analysis!.survey_2025);

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <Card>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
              GWS 구매 전략 분석
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {parsedAnalysis.oneLiner}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">2024 총 좌석</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analysis!.total_seats_2024)}석
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">2025 총 좌석</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(analysis!.total_seats_2025)}석
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">2024 총 금액</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(analysis!.total_amount_2024)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">2025 예상 금액</p>
                <p className={`text-xl font-bold ${analysis!.cost_difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(analysis!.total_amount_2025)}
                  {analysis!.cost_difference !== 0 && (
                    <span className="ml-1 text-sm">
                      {analysis!.cost_difference > 0 ? <TrendingUp className="inline w-4 h-4" /> : <TrendingDown className="inline w-4 h-4" />}
                      {formatPercent(analysis!.cost_difference_percent)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="ml-4 flex flex-col gap-2 items-end">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              마지막 분석: {new Date(parsedAnalysis.createdAt).toLocaleString('ko-KR')}
            </span>
            <Button onClick={handleAnalyze} disabled={isAnalyzing} size="sm">
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

      {/* 좌석 수 비교 차트 */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">좌석 수 비교</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="edition" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="2024" fill="#4F46E5" name="2024년" />
            <Bar dataKey="2025" fill="#10B981" name="2025년" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* 단가 비교 카드 */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">단가 및 금액 비교</h3>
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {parsedAnalysis.sections.priceComparison}
          </ReactMarkdown>
        </div>
      </Card>

      {/* PDL 인사이트 카드 */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">PDL 규칙 변화 인사이트</h3>
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {parsedAnalysis.sections.pdlInsights}
          </ReactMarkdown>
        </div>
      </Card>

      {/* 구매 전략 카드 */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">구매 전략 제안</h3>
        {parsedAnalysis.sections.strategies.length > 0 ? (
          <Accordion items={parsedAnalysis.sections.strategies} />
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            전략 정보를 파싱할 수 없습니다. 원본 보고서를 확인하세요.
          </p>
        )}
      </Card>

      {/* 원본 전체 보기 버튼 */}
      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => setShowFullMarkdown(!showFullMarkdown)}
        >
          <FileText className="w-4 h-4 mr-2" />
          {showFullMarkdown ? '원본 접기' : 'LLM 원본 분석 전체 보기'}
        </Button>
      </div>

      {/* 원본 Markdown */}
      {showFullMarkdown && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="bg-gray-50 dark:bg-gray-800">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {parsedAnalysis.rawMarkdown}
              </ReactMarkdown>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
