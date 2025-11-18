import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GWSLLMAnalysis } from './GWSLLMAnalysis';
import { TrendingDown, TrendingUp, DollarSign, AlertCircle, Users, UserCheck, UserX } from 'lucide-react';
import { getAllGWSUsers } from '../lib/gwsData';

interface SurveyResponse {
  id: string;
  user_email: string;
  survey_type: 'gws' | 'software';
  software_usage?: any;
  gws_satisfaction?: number;
  gws_feedback?: string;
  created_at?: string;
  timestamp?: string;
  submitted_at?: string;
}

interface GWSSurveyResponse {
  id: number;
  user_email: string;
  account_type?: string;
  storage_shortage?: string;
  advanced_features?: string[];
  meet_frequency?: string;
  large_files?: string;
  enterprise_necessity?: string;
  migration_concerns?: string;
  submitted_at: string;
}

interface Stats {
  totalResponses: number;
  gwsResponses: number;
  softwareResponses: number;
  avgGwsSatisfaction: number;
  softwareUsageStats: { name: string; count: number }[];
  responsesByDate: { date: string; count: number }[];
  userParticipation: { email: string; count: number }[];
  // 사용자별 소프트웨어 사용 현황
  userSoftwareDetails: {
    email: string;
    softwareList: string[];
    softwareCount: number;
    submittedAt: string;
  }[];
  // GWS 설문 통계
  gwsSurveyStats: {
    totalResponses: number;
    accountTypes: { type: string; count: number }[];
    storageShortage: { type: string; count: number }[];
    enterpriseNecessity: { type: string; count: number }[];
    meetFrequency: { type: string; count: number }[];
    largeFilesUsers: number;
    advancedFeaturesUsage: { feature: string; count: number }[];
  };
  // GWS 설문 참여 현황
  gwsParticipation: {
    total: number;
    participated: string[];
    notParticipated: string[];
    participationRate: number;
  };
  // 소프트웨어 설문 참여 현황
  softwareParticipation: {
    total: number;
    participated: string[];
    notParticipated: string[];
    participationRate: number;
  };
}

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'gws' | 'gws-llm' | 'software' | 'raw'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 병렬로 모든 데이터 가져오기
      const [
        { data: surveyData, error: surveyError },
        { data: gwsSurveyData, error: gwsSurveyError },
        { data: softwareSurveyData, error: softwareSurveyError },
        { data: softwareAssignmentsData, error: softwareAssignmentsError },
        gwsUsers
      ] = await Promise.all([
        supabase.from('survey_responses').select('*'),
        supabase.from('gws_survey_responses').select('*'),
        supabase.from('software_survey_responses').select('user_email'),
        supabase.from('software_assignments').select('user_email').eq('is_active', true),
        getAllGWSUsers()
      ]);

      if (surveyError) throw surveyError;
      if (gwsSurveyError && gwsSurveyError.code !== 'PGRST116') throw gwsSurveyError;
      if (softwareSurveyError && softwareSurveyError.code !== 'PGRST116') throw softwareSurveyError;
      if (softwareAssignmentsError && softwareAssignmentsError.code !== 'PGRST116') throw softwareAssignmentsError;

      const surveyResponses = surveyData || [];
      const gwsSurveyResponses = gwsSurveyData || [];
      const softwareSurveyResponses = softwareSurveyData || [];
      const softwareAssignments = softwareAssignmentsData || [];

      // 디버그: 실제 컬럼 확인
      if (surveyResponses.length > 0) {
        console.log('📊 survey_responses 테이블 컬럼:', Object.keys(surveyResponses[0]));
        console.log('📊 샘플 데이터:', surveyResponses[0]);
      }

      setResponses(surveyResponses);

      // 통계 계산
      const gwsResponses = surveyResponses.filter(r => r.survey_type === 'gws');
      const softwareResponses = surveyResponses.filter(r => r.survey_type === 'software');

      // GWS 평균 만족도
      const avgGwsSatisfaction = gwsResponses.length > 0
        ? gwsResponses.reduce((sum, r) => sum + (r.gws_satisfaction || 0), 0) / gwsResponses.length
        : 0;

      // 소프트웨어 사용 통계
      const softwareUsage: { [key: string]: number } = {};
      softwareResponses.forEach(r => {
        if (r.software_usage) {
          Object.keys(r.software_usage).forEach(software => {
            if (r.software_usage[software]) {
              softwareUsage[software] = (softwareUsage[software] || 0) + 1;
            }
          });
        }
      });

      const softwareUsageStats = Object.entries(softwareUsage)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      // 날짜별 응답 수
      const responsesByDateMap: { [key: string]: number } = {};
      surveyResponses.forEach(r => {
        // 타임스탬프 필드 찾기 (created_at, timestamp, submitted_at 등)
        const timestamp = r.created_at || r.timestamp || r.submitted_at || new Date().toISOString();
        const date = new Date(timestamp).toLocaleDateString('ko-KR');
        responsesByDateMap[date] = (responsesByDateMap[date] || 0) + 1;
      });

      const responsesByDate = Object.entries(responsesByDateMap)
        .map(([date, count]) => ({ date, count }))
        .slice(-7); // 최근 7일

      // 사용자별 참여 현황
      const userParticipationMap: { [key: string]: number } = {};
      surveyResponses.forEach(r => {
        userParticipationMap[r.user_email] = (userParticipationMap[r.user_email] || 0) + 1;
      });

      const userParticipation = Object.entries(userParticipationMap)
        .map(([email, count]) => ({ email, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // 상위 10명

      // 사용자별 소프트웨어 사용 상세 현황
      const userSoftwareDetails = softwareResponses.map(r => {
        const softwareList = r.software_usage
          ? Object.keys(r.software_usage).filter(software => r.software_usage[software])
          : [];

        // 타임스탬프 필드 찾기
        const timestamp = r.created_at || r.timestamp || r.submitted_at || new Date().toISOString();

        return {
          email: r.user_email,
          softwareList,
          softwareCount: softwareList.length,
          submittedAt: timestamp
        };
      }).sort((a, b) => b.softwareCount - a.softwareCount);

      // GWS 설문 통계 계산
      const accountTypesMap: { [key: string]: number } = {};
      const storageShortageMap: { [key: string]: number } = {};
      const enterpriseNecessityMap: { [key: string]: number } = {};
      const meetFrequencyMap: { [key: string]: number } = {};
      const advancedFeaturesMap: { [key: string]: number } = {};
      let largeFilesUsers = 0;

      gwsSurveyResponses.forEach((r: GWSSurveyResponse) => {
        if (r.account_type) accountTypesMap[r.account_type] = (accountTypesMap[r.account_type] || 0) + 1;
        if (r.storage_shortage) storageShortageMap[r.storage_shortage] = (storageShortageMap[r.storage_shortage] || 0) + 1;
        if (r.enterprise_necessity) enterpriseNecessityMap[r.enterprise_necessity] = (enterpriseNecessityMap[r.enterprise_necessity] || 0) + 1;
        if (r.meet_frequency) meetFrequencyMap[r.meet_frequency] = (meetFrequencyMap[r.meet_frequency] || 0) + 1;
        if (r.large_files === 'yes') largeFilesUsers++;

        if (r.advanced_features && Array.isArray(r.advanced_features)) {
          r.advanced_features.forEach(feature => {
            advancedFeaturesMap[feature] = (advancedFeaturesMap[feature] || 0) + 1;
          });
        }
      });

      const gwsSurveyStats = {
        totalResponses: gwsSurveyResponses.length,
        accountTypes: Object.entries(accountTypesMap).map(([type, count]) => ({ type, count })),
        storageShortage: Object.entries(storageShortageMap).map(([type, count]) => ({ type, count })),
        enterpriseNecessity: Object.entries(enterpriseNecessityMap).map(([type, count]) => ({ type, count })),
        meetFrequency: Object.entries(meetFrequencyMap).map(([type, count]) => ({ type, count })),
        largeFilesUsers,
        advancedFeaturesUsage: Object.entries(advancedFeaturesMap).map(([feature, count]) => ({ feature, count }))
      };

      // GWS 설문 참여 현황 계산
      const gwsAssignedEmails = gwsUsers.map(u => u.email.toLowerCase());
      const gwsParticipatedEmails = gwsSurveyResponses.map((r: GWSSurveyResponse) => r.user_email.toLowerCase());
      const gwsNotParticipated = gwsAssignedEmails.filter(email => !gwsParticipatedEmails.includes(email));

      const gwsParticipation = {
        total: gwsAssignedEmails.length,
        participated: gwsParticipatedEmails,
        notParticipated: gwsNotParticipated,
        participationRate: gwsAssignedEmails.length > 0
          ? (gwsParticipatedEmails.length / gwsAssignedEmails.length) * 100
          : 0
      };

      // 소프트웨어 설문 참여 현황 계산
      const softwareAssignedEmails = Array.from(new Set(
        softwareAssignments.map((a: any) => a.user_email.toLowerCase())
      ));
      const softwareParticipatedEmails = Array.from(new Set(
        softwareSurveyResponses.map((r: any) => r.user_email.toLowerCase())
      ));
      const softwareNotParticipated = softwareAssignedEmails.filter(
        email => !softwareParticipatedEmails.includes(email)
      );

      const softwareParticipation = {
        total: softwareAssignedEmails.length,
        participated: softwareParticipatedEmails,
        notParticipated: softwareNotParticipated,
        participationRate: softwareAssignedEmails.length > 0
          ? (softwareParticipatedEmails.length / softwareAssignedEmails.length) * 100
          : 0
      };

      setStats({
        totalResponses: surveyResponses.length,
        gwsResponses: gwsResponses.length,
        softwareResponses: softwareResponses.length,
        avgGwsSatisfaction,
        softwareUsageStats,
        responsesByDate,
        userParticipation,
        userSoftwareDetails,
        gwsSurveyStats,
        gwsParticipation,
        softwareParticipation
      });

    } catch (error: any) {
      console.error('대시보드 데이터 로드 실패:', error);
      console.error('에러 상세:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });

      const errorMessage = error?.message || '알 수 없는 에러가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">데이터 로드 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">데이터 로드 실패</h2>
          </div>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <p className="text-sm text-gray-600 mb-2">가능한 원인:</p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>데이터베이스 연결 문제</li>
              <li>테이블 권한 설정 오류</li>
              <li>네트워크 연결 문제</li>
            </ul>
          </div>
          <button
            onClick={fetchDashboardData}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            다시 시도
          </button>
          <button
            onClick={() => signOut()}
            className="w-full mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="text-sm text-gray-600">로그인: {user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'gws', 'gws-llm', 'software', 'raw'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'overview' && '전체 현황'}
                {tab === 'gws' && 'GWS 설문'}
                {tab === 'gws-llm' && 'GWS LLM 분석'}
                {tab === 'software' && '소프트웨어 설문'}
                {tab === 'raw' && '원본 데이터'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* 설문 참여 현황 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GWS 설문 참여 현황 */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-bold">GWS 설문 참여 현황</h3>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <Users className="w-4 h-4 mr-1" />
                      <p className="text-xs opacity-90">대상자</p>
                    </div>
                    <p className="text-2xl font-bold">{stats.gwsParticipation.total}</p>
                    <p className="text-xs opacity-75">명</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <UserCheck className="w-4 h-4 mr-1" />
                      <p className="text-xs opacity-90">참여</p>
                    </div>
                    <p className="text-2xl font-bold text-green-300">{stats.gwsParticipation.participated.length}</p>
                    <p className="text-xs opacity-75">명</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <UserX className="w-4 h-4 mr-1" />
                      <p className="text-xs opacity-90">미참여</p>
                    </div>
                    <p className="text-2xl font-bold text-red-300">{stats.gwsParticipation.notParticipated.length}</p>
                    <p className="text-xs opacity-75">명</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-90">참여율</span>
                    <span className="text-xl font-bold">{stats.gwsParticipation.participationRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-300 h-2 rounded-full transition-all"
                      style={{ width: `${stats.gwsParticipation.participationRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 소프트웨어 설문 참여 현황 */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-bold">소프트웨어 설문 참여 현황</h3>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <Users className="w-4 h-4 mr-1" />
                      <p className="text-xs opacity-90">대상자</p>
                    </div>
                    <p className="text-2xl font-bold">{stats.softwareParticipation.total}</p>
                    <p className="text-xs opacity-75">명</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <UserCheck className="w-4 h-4 mr-1" />
                      <p className="text-xs opacity-90">참여</p>
                    </div>
                    <p className="text-2xl font-bold text-green-300">{stats.softwareParticipation.participated.length}</p>
                    <p className="text-xs opacity-75">명</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <UserX className="w-4 h-4 mr-1" />
                      <p className="text-xs opacity-90">미참여</p>
                    </div>
                    <p className="text-2xl font-bold text-red-300">{stats.softwareParticipation.notParticipated.length}</p>
                    <p className="text-xs opacity-75">명</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-90">참여율</span>
                    <span className="text-xl font-bold">{stats.softwareParticipation.participationRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-300 h-2 rounded-full transition-all"
                      style={{ width: `${stats.softwareParticipation.participationRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 주요 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">전체 응답</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalResponses}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">GWS 설문 (구형)</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.gwsResponses}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">GWS 설문 (신규)</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.gwsSurveyStats.totalResponses}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">소프트웨어 설문</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.softwareResponses}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">GWS 평균 만족도</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.avgGwsSatisfaction.toFixed(1)}
                </p>
              </div>
            </div>

            {/* GWS 설문 요약 카드 */}
            {stats.gwsSurveyStats.totalResponses > 0 && (
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">📊 GWS Enterprise → Starter 전환 설문 요약</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm opacity-90 mb-1">Enterprise 필수</p>
                    <p className="text-2xl font-bold">
                      {stats.gwsSurveyStats.enterpriseNecessity.find(e => e.type === 'essential')?.count || 0}명
                    </p>
                    <p className="text-xs opacity-75">전체 응답자 중 {stats.gwsSurveyStats.totalResponses > 0 ? (((stats.gwsSurveyStats.enterpriseNecessity.find(e => e.type === 'essential')?.count || 0) / stats.gwsSurveyStats.totalResponses) * 100).toFixed(1) : 0}%</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm opacity-90 mb-1">Starter로 전환 가능</p>
                    <p className="text-2xl font-bold">
                      {stats.gwsSurveyStats.enterpriseNecessity.find(e => e.type === 'not_needed')?.count || 0}명
                    </p>
                    <p className="text-xs opacity-75">전체 응답자 중 {stats.gwsSurveyStats.totalResponses > 0 ? (((stats.gwsSurveyStats.enterpriseNecessity.find(e => e.type === 'not_needed')?.count || 0) / stats.gwsSurveyStats.totalResponses) * 100).toFixed(1) : 0}%</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm opacity-90 mb-1">대용량 파일 사용자</p>
                    <p className="text-2xl font-bold">{stats.gwsSurveyStats.largeFilesUsers}명</p>
                    <p className="text-xs opacity-75">전체 응답자 중 {stats.gwsSurveyStats.totalResponses > 0 ? ((stats.gwsSurveyStats.largeFilesUsers / stats.gwsSurveyStats.totalResponses) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>
                <p className="text-xs opacity-75 mt-4">
                  💡 상세 분석은 "GWS 설문" 및 "GWS LLM 분석" 탭에서 확인하세요
                </p>
              </div>
            )}

            {/* 차트 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 날짜별 응답 추이 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">날짜별 응답 추이</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.responsesByDate}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 설문 유형 비율 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">설문 유형 비율</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'GWS (구형)', value: stats.gwsResponses },
                        { name: 'GWS (신규)', value: stats.gwsSurveyStats.totalResponses },
                        { name: '소프트웨어', value: stats.softwareResponses }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'software' && stats && (
          <div className="space-y-6">
            {/* 참여 현황 테이블 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">소프트웨어 설문 참여 현황</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">전체 대상자</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.softwareParticipation.total}명</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">참여자</p>
                  <p className="text-3xl font-bold text-green-900">{stats.softwareParticipation.participated.length}명</p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.softwareParticipation.participationRate.toFixed(1)}% 참여
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">미참여자</p>
                  <p className="text-3xl font-bold text-red-900">{stats.softwareParticipation.notParticipated.length}명</p>
                  <p className="text-xs text-red-600 mt-1">
                    {(100 - stats.softwareParticipation.participationRate).toFixed(1)}% 미참여
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 참여자 목록 */}
                <div>
                  <h4 className="text-md font-medium text-green-700 mb-3 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2" />
                    참여자 ({stats.softwareParticipation.participated.length}명)
                  </h4>
                  <div className="bg-green-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {stats.softwareParticipation.participated.length > 0 ? (
                      <ul className="space-y-2">
                        {stats.softwareParticipation.participated.map((email, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-medium mr-2">
                              {idx + 1}
                            </span>
                            {email}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">참여자가 없습니다.</p>
                    )}
                  </div>
                </div>

                {/* 미참여자 목록 */}
                <div>
                  <h4 className="text-md font-medium text-red-700 mb-3 flex items-center">
                    <UserX className="w-5 h-5 mr-2" />
                    미참여자 ({stats.softwareParticipation.notParticipated.length}명)
                  </h4>
                  <div className="bg-red-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {stats.softwareParticipation.notParticipated.length > 0 ? (
                      <ul className="space-y-2">
                        {stats.softwareParticipation.notParticipated.map((email, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-red-200 text-red-800 flex items-center justify-center text-xs font-medium mr-2">
                              {idx + 1}
                            </span>
                            {email}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">모든 대상자가 참여했습니다! 🎉</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 주요 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">총 응답자</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.softwareResponses}명</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">조사 소프트웨어 수</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.softwareUsageStats.length}개</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">가장 많이 사용</h3>
                <p className="text-lg font-bold text-gray-900 mt-2">{stats.softwareUsageStats[0]?.name || '-'}</p>
                <p className="text-sm text-gray-500">{stats.softwareUsageStats[0]?.count || 0}명</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">평균 사용률</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.softwareUsageStats.length > 0
                    ? ((stats.softwareUsageStats.reduce((sum, s) => sum + s.count, 0) / (stats.softwareUsageStats.length * stats.softwareResponses)) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>

            {/* 전체 사용 현황 - 수평 바 차트 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">전체 소프트웨어 사용 현황</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stats.softwareUsageStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 사용률별 파이 차트 - 상위 10개 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">사용률 분포 (상위 10개)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={stats.softwareUsageStats.slice(0, 10)}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.softwareUsageStats.slice(0, 10).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 카테고리별 그리드 - 각 소프트웨어별 카드 */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">소프트웨어별 상세 통계</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stats.softwareUsageStats.map((software, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm truncate" title={software.name}>
                        {software.name}
                      </h4>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-2xl font-bold text-gray-900">{software.count}</span>
                        <span className="text-sm text-gray-500">명</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${(software.count / stats.softwareResponses) * 100}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        사용률: {((software.count / stats.softwareResponses) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 소프트웨어별 통계 테이블 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">소프트웨어별 사용 통계</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        순위
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        소프트웨어
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용자 수
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        비율
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        시각화
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.softwareUsageStats.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.count}명
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {((item.count / stats.softwareResponses) * 100).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${(item.count / stats.softwareResponses) * 100}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 사용자별 상세 사용 현황 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                사용자별 소프트웨어 사용 상세 현황
              </h3>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">총 응답자</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.userSoftwareDetails.length}명</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">평균 사용 소프트웨어</p>
                  <p className="text-2xl font-bold text-green-900">
                    {stats.userSoftwareDetails.length > 0
                      ? (stats.userSoftwareDetails.reduce((sum, u) => sum + u.softwareCount, 0) / stats.userSoftwareDetails.length).toFixed(1)
                      : 0}개
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">최대 사용 소프트웨어</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {stats.userSoftwareDetails.length > 0 ? Math.max(...stats.userSoftwareDetails.map(u => u.softwareCount)) : 0}개
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        순위
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용자 이메일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용 개수
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용 소프트웨어
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        제출일
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.userSoftwareDetails.map((user, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.softwareCount}개
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex flex-wrap gap-1">
                            {user.softwareList.map((software, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {software}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.submittedAt).toLocaleDateString('ko-KR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gws' && stats && (
          <div className="space-y-6">
            {/* 참여 현황 테이블 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">GWS 설문 참여 현황</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">전체 대상자</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.gwsParticipation.total}명</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">참여자</p>
                  <p className="text-3xl font-bold text-green-900">{stats.gwsParticipation.participated.length}명</p>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.gwsParticipation.participationRate.toFixed(1)}% 참여
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">미참여자</p>
                  <p className="text-3xl font-bold text-red-900">{stats.gwsParticipation.notParticipated.length}명</p>
                  <p className="text-xs text-red-600 mt-1">
                    {(100 - stats.gwsParticipation.participationRate).toFixed(1)}% 미참여
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 참여자 목록 */}
                <div>
                  <h4 className="text-md font-medium text-green-700 mb-3 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2" />
                    참여자 ({stats.gwsParticipation.participated.length}명)
                  </h4>
                  <div className="bg-green-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {stats.gwsParticipation.participated.length > 0 ? (
                      <ul className="space-y-2">
                        {stats.gwsParticipation.participated.map((email, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs font-medium mr-2">
                              {idx + 1}
                            </span>
                            {email}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">참여자가 없습니다.</p>
                    )}
                  </div>
                </div>

                {/* 미참여자 목록 */}
                <div>
                  <h4 className="text-md font-medium text-red-700 mb-3 flex items-center">
                    <UserX className="w-5 h-5 mr-2" />
                    미참여자 ({stats.gwsParticipation.notParticipated.length}명)
                  </h4>
                  <div className="bg-red-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {stats.gwsParticipation.notParticipated.length > 0 ? (
                      <ul className="space-y-2">
                        {stats.gwsParticipation.notParticipated.map((email, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-center">
                            <span className="w-6 h-6 rounded-full bg-red-200 text-red-800 flex items-center justify-center text-xs font-medium mr-2">
                              {idx + 1}
                            </span>
                            {email}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">모든 대상자가 참여했습니다! 🎉</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 비용 영향 분석 카드 */}
            {stats.gwsSurveyStats.totalResponses > 0 && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <DollarSign className="w-8 h-8 mr-3" />
                  <h3 className="text-2xl font-bold">비용 영향 분석 (설문 기반 예상)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm opacity-90 mb-1">2024년 기준</p>
                    <p className="text-2xl font-bold">₩{(319 * 92457 + 0 * 184913 + 0 * 338665).toLocaleString()}</p>
                    <p className="text-xs opacity-75 mt-1">총 319석 (Starter 200 + Enterprise 100 + Standard 19)</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm opacity-90 mb-1">2025년 예상 (설문 기반)</p>
                    <p className="text-2xl font-bold">₩{((stats.gwsSurveyStats.totalResponses || 0) * 108780).toLocaleString()}</p>
                    <p className="text-xs opacity-75 mt-1">응답자 기준 ({stats.gwsSurveyStats.totalResponses}명)</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm opacity-90 mb-1">변동 예상</p>
                    <div className="flex items-center">
                      {((stats.gwsSurveyStats.totalResponses || 0) * 108780) < (319 * 92457) ? (
                        <TrendingDown className="w-6 h-6 mr-2 text-green-300" />
                      ) : (
                        <TrendingUp className="w-6 h-6 mr-2 text-red-300" />
                      )}
                      <p className="text-2xl font-bold">
                        {(((((stats.gwsSurveyStats.totalResponses || 0) * 108780) - (319 * 92457)) / (319 * 92457)) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <p className="text-xs opacity-75 mt-1">
                      {((stats.gwsSurveyStats.totalResponses || 0) * 108780) < (319 * 92457) ? '절감' : '증가'} 예상
                    </p>
                  </div>
                </div>
                <p className="text-xs opacity-75 mt-4">
                  ⚠️ 설문 응답자 수 기반 예상치입니다. 정확한 분석은 "GWS LLM 분석" 탭에서 확인하세요.
                </p>
              </div>
            )}

            {/* 설문 응답 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Enterprise 필요성 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Enterprise 필요성</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.gwsSurveyStats.enterpriseNecessity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.gwsSurveyStats.enterpriseNecessity.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {stats.gwsSurveyStats.enterpriseNecessity.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.type === 'essential' ? '필수' : item.type === 'nice_to_have' ? '있으면 좋음' : item.type === 'not_needed' ? '불필요' : '모르겠음'}</span>
                      <span className="font-medium">{item.count}명</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 저장공간 부족 경험 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">저장공간 부족 경험</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.gwsSurveyStats.storageShortage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.gwsSurveyStats.storageShortage.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {stats.gwsSurveyStats.storageShortage.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.type === 'frequent' ? '자주 있다' : item.type === 'sometimes' ? '가끔 있다' : item.type === 'never' ? '없다' : '모르겠다'}</span>
                      <span className="font-medium">{item.count}명</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meet 사용 빈도 */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Google Meet 사용 빈도</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.gwsSurveyStats.meetFrequency}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.gwsSurveyStats.meetFrequency.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {stats.gwsSurveyStats.meetFrequency.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.type === 'daily' ? '매일' : item.type === '2-3times_weekly' ? '주 2-3회' : item.type === 'weekly_or_less' ? '주 1회 이하' : '거의 안 함'}</span>
                      <span className="font-medium">{item.count}명</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 고급 기능 사용 현황 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">고급 기능 사용 현황</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.gwsSurveyStats.advancedFeaturesUsage.sort((a, b) => b.count - a.count)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="feature" angle={-45} textAnchor="end" height={100} fontSize={11} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 기존 만족도/피드백 섹션 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">GWS 만족도 분포 (구형 설문)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[1, 2, 3, 4, 5].map(score => ({
                    score: `${score}점`,
                    count: responses.filter(r =>
                      r.survey_type === 'gws' && r.gws_satisfaction === score
                    ).length
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="score" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">GWS 피드백 (구형 설문)</h3>
              <div className="space-y-3">
                {responses
                  .filter(r => r.survey_type === 'gws' && r.gws_feedback)
                  .slice(0, 10)
                  .map((response) => (
                    <div key={response.id} className="border-l-4 border-blue-400 pl-4 py-2">
                      <p className="text-sm text-gray-600">{response.gws_feedback}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {response.user_email} - 만족도: {response.gws_satisfaction}점 - {new Date(response.created_at || response.timestamp || response.submitted_at || new Date()).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gws-llm' && (
          <GWSLLMAnalysis />
        )}

        {activeTab === 'raw' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                원본 데이터 (최근 50개)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      날짜
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상세
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {responses.slice(0, 50).map((response) => (
                    <tr key={response.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {response.user_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {response.survey_type === 'gws' ? 'GWS' : '소프트웨어'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(response.created_at || response.timestamp || response.submitted_at || new Date()).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {response.survey_type === 'gws'
                          ? `만족도: ${response.gws_satisfaction}점`
                          : `소프트웨어: ${Object.keys(response.software_usage || {}).filter(k => response.software_usage[k]).join(', ')}`
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;