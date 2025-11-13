import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SurveyResponse {
  id: string;
  user_email: string;
  survey_type: 'gws' | 'software';
  software_usage?: any;
  gws_satisfaction?: number;
  gws_feedback?: string;
  created_at: string;
}

interface Stats {
  totalResponses: number;
  gwsResponses: number;
  softwareResponses: number;
  avgGwsSatisfaction: number;
  softwareUsageStats: { name: string; count: number }[];
  responsesByDate: { date: string; count: number }[];
  userParticipation: { email: string; count: number }[];
}

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'gws' | 'software' | 'raw'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 모든 설문 응답 가져오기
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const surveyResponses = data || [];
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
        const date = new Date(r.created_at).toLocaleDateString('ko-KR');
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

      setStats({
        totalResponses: surveyResponses.length,
        gwsResponses: gwsResponses.length,
        softwareResponses: softwareResponses.length,
        avgGwsSatisfaction,
        softwareUsageStats,
        responsesByDate,
        userParticipation
      });

    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
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
            {['overview', 'gws', 'software', 'raw'].map(tab => (
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
            {/* 주요 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">전체 응답</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalResponses}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">GWS 설문</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.gwsResponses}</p>
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
                        { name: 'GWS', value: stats.gwsResponses },
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
                      {[0, 1].map((entry, index) => (
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
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">소프트웨어 사용 현황</h3>
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

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">상세 사용 통계</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        소프트웨어
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        사용자 수
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        비율
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.softwareUsageStats.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.count}명
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {((item.count / stats.softwareResponses) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gws' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">GWS 만족도 분포</h3>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">GWS 피드백</h3>
              <div className="space-y-3">
                {responses
                  .filter(r => r.survey_type === 'gws' && r.gws_feedback)
                  .slice(0, 10)
                  .map((response) => (
                    <div key={response.id} className="border-l-4 border-blue-400 pl-4 py-2">
                      <p className="text-sm text-gray-600">{response.gws_feedback}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {response.user_email} - 만족도: {response.gws_satisfaction}점 - {new Date(response.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
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
                        {new Date(response.created_at).toLocaleString('ko-KR')}
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