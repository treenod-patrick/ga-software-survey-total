/**
 * 소프트웨어 설문 LLM 분석 Edge Function
 * 로컬 LLM (qwen2.5-32b) 또는 OpenAI GPT-4o를 사용하여 소프트웨어 사용 현황 및 라이선스 최적화 분석 수행
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, user-email',
};

// 환경 변수
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const LOCAL_LLM_ENDPOINT = Deno.env.get('LOCAL_LLM_ENDPOINT') || 'http://192.168.219.109:8000/v1';
const LOCAL_LLM_API_KEY = Deno.env.get('LOCAL_LLM_API_KEY') || 'sk-ZPvn3bYVa7GN3fbol9ctl5CwwMifK5iuRzoFvcsOwcSKl5gkYEgZ_r5_lsAqClIq';
const LOCAL_LLM_MODEL = Deno.env.get('LOCAL_LLM_MODEL') || 'qwen2.5-32b';
const USE_LOCAL_LLM = Deno.env.get('USE_LOCAL_LLM') === 'true';

// Supabase Edge Function에서 자동으로 제공되는 환경 변수 사용
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://adschpldrzwzpzxagxzdw.supabase.co';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');

// 타입 정의
interface SoftwareUsageData {
  software_name: string;
  total_users: number;
  frequency_breakdown: {
    daily: number;
    weekly: number;
    monthly: number;
    rarely: number;
    unknown: number;
  };
  assigned_count: number;
  response_rate: number;
}

interface SurveyStats {
  total_respondents: number;
  total_assigned: number;
  participation_rate: number;
  total_software_types: number;
  avg_software_per_user: number;
  software_usage: SoftwareUsageData[];
}

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

/**
 * 프롬프트 생성 함수
 */
function buildSoftwarePrompt(stats: SurveyStats): string {
  // 소프트웨어별 사용 현황 포맷팅
  const softwareList = stats.software_usage
    .map((sw, index) => {
      const totalFrequent = sw.frequency_breakdown.daily + sw.frequency_breakdown.weekly;
      const totalRare = sw.frequency_breakdown.monthly + sw.frequency_breakdown.rarely;
      const unusedRate = sw.assigned_count > 0
        ? (((sw.assigned_count - sw.total_users) / sw.assigned_count) * 100).toFixed(1)
        : '0.0';

      return `${index + 1}. **${sw.software_name}**
   - 전체 사용자: ${sw.total_users}명 (할당: ${sw.assigned_count}명, 미사용: ${unusedRate}%)
   - 빈도 분포:
     - 매일 사용: ${sw.frequency_breakdown.daily}명
     - 주 2-3회: ${sw.frequency_breakdown.weekly}명
     - 월 2-3회: ${sw.frequency_breakdown.monthly}명
     - 거의 사용 안함: ${sw.frequency_breakdown.rarely}명
     - 알 수 없음: ${sw.frequency_breakdown.unknown}명
   - 고빈도 사용자 비율: ${sw.total_users > 0 ? ((totalFrequent / sw.total_users) * 100).toFixed(1) : 0}%
   - 저빈도 사용자 비율: ${sw.total_users > 0 ? ((totalRare / sw.total_users) * 100).toFixed(1) : 0}%`;
    })
    .join('\n\n');

  return `당신은 Treenod 총무팀의 소프트웨어 라이선스 최적화 컨설턴트입니다.

<context>
전제 조건:
- 모든 소프트웨어는 유료 라이선스이며, 사용하지 않으면 비용 낭비입니다
- "거의 사용 안함" 또는 "월 2-3회" 응답자는 라이선스 재배치 대상입니다
- 라이선스가 할당되었지만 설문에 응답하지 않은 사용자는 미사용 가능성이 높습니다
- 중복 기능을 가진 소프트웨어가 있다면 통합을 검토해야 합니다

설문 통계:
- 총 응답자 수: ${stats.total_respondents}명
- 총 라이선스 할당 대상자: ${stats.total_assigned}명
- 설문 참여율: ${stats.participation_rate.toFixed(1)}%
- 조사 소프트웨어 종류: ${stats.total_software_types}개
- 1인당 평균 소프트웨어 사용: ${stats.avg_software_per_user.toFixed(1)}개

소프트웨어별 상세 현황:
${softwareList}
</context>

<output_format>
<mandatory>
반드시 유효한 JSON 형식으로만 응답하세요.
절대로 JSON 외의 다른 텍스트를 포함하지 마세요.
</mandatory>

<json_schema>
{
  "summary": ["요약 문장 1", "요약 문장 2", "요약 문장 3", "요약 문장 4"],
  "optimizationTable": [
    {
      "software": "소프트웨어명",
      "currentUsers": 숫자,
      "highFreqUsers": 숫자,
      "lowFreqUsers": 숫자,
      "suggestion": "구체적 최적화 제안",
      "savings": "high" | "medium" | "low"
    }
  ],
  "insights": ["인사이트 1", "인사이트 2", "인사이트 3"],
  "integrationGroups": [
    {
      "title": "통합 대상 그룹: 소프트웨어 A, B",
      "suggestion": "어떤 소프트웨어로 통합할지",
      "reason": "통합이 필요한 이유",
      "effect": "기대 효과"
    }
  ],
  "actionPlans": [
    {
      "title": "액션 플랜 제목",
      "content": "2-3문장으로 구체적 설명",
      "targetSoftware": "대상 소프트웨어명",
      "expectedEffect": "기대 효과",
      "priority": "high" | "medium" | "low"
    }
  ]
}
</json_schema>

<requirements>
1. summary: 전체 소프트웨어 사용 현황을 3-5개 문장으로 요약
2. optimizationTable: 모든 주요 소프트웨어에 대한 최적화 제안 (최소 5개)
3. insights: 데이터에서 발견한 핵심 인사이트 3개
4. integrationGroups: 중복 기능 소프트웨어 통합 검토 (발견되는 경우만, 없으면 빈 배열)
5. actionPlans: 실행 가능한 액션 플랜 3-5개
</requirements>

<style_guide>
- 모든 내용은 한국어로 작성
- 구체적인 숫자와 데이터 활용
- 실무형 보고서 스타일
- 각 문장은 명확하고 간결하게
</style_guide>
</output_format>

반드시 유효한 JSON만 출력하세요. 다른 텍스트는 절대 포함하지 마세요.`;
}

/**
 * LLM API 호출 (로컬 또는 OpenAI)
 */
async function callLLM(prompt: string): Promise<{ analysis: StructuredAnalysis; tokenUsage: number; model: string }> {
  const startTime = Date.now();

  let apiUrl: string;
  let apiKey: string;
  let modelName: string;

  if (USE_LOCAL_LLM) {
    // 로컬 LLM 사용
    apiUrl = `${LOCAL_LLM_ENDPOINT}/chat/completions`;
    apiKey = LOCAL_LLM_API_KEY;
    modelName = LOCAL_LLM_MODEL;
    console.log(`🤖 로컬 LLM 사용 (${modelName})`);
  } else {
    // OpenAI 사용
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
    }
    apiUrl = 'https://api.openai.com/v1/chat/completions';
    apiKey = OPENAI_API_KEY;
    modelName = 'gpt-4o';
    console.log('🤖 OpenAI GPT-4o 사용');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: '당신은 Treenod 총무팀의 소프트웨어 라이선스 최적화 컨설턴트입니다. 데이터를 정확히 분석하고, 실행 가능한 비용 절감 전략을 제안합니다. 반드시 유효한 JSON 형식으로만 응답하세요.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LLM API 오류: ${response.status} - ${error}`);
  }

  const result = await response.json();
  const executionTime = Date.now() - startTime;

  console.log(`✅ LLM 분석 완료 (${executionTime}ms, ${result.usage?.total_tokens || 'N/A'} tokens)`);

  // JSON 파싱
  const content = result.choices[0].message.content.trim();
  let analysis: StructuredAnalysis;

  try {
    // JSON 코드 블록 제거 (```json ... ``` 형식인 경우)
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    analysis = JSON.parse(jsonString);
  } catch (parseError) {
    console.error('JSON 파싱 실패:', content);
    throw new Error(`LLM 응답 JSON 파싱 실패: ${parseError.message}`);
  }

  return {
    analysis,
    tokenUsage: result.usage?.total_tokens || 0,
    model: modelName,
  };
}

/**
 * 한 줄 요약 추출
 */
function extractOneLiner(analysis: StructuredAnalysis): string {
  if (analysis.summary && analysis.summary.length > 0) {
    return analysis.summary[0];
  }
  return '소프트웨어 라이선스 최적화 분석 결과를 확인하세요.';
}

/**
 * 메인 핸들러
 */
serve(async (req) => {
  // CORS Preflight 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== Edge Function 시작 ===');
    console.log('USE_LOCAL_LLM:', USE_LOCAL_LLM);
    if (USE_LOCAL_LLM) {
      console.log('LOCAL_LLM_ENDPOINT:', LOCAL_LLM_ENDPOINT);
      console.log('LOCAL_LLM_MODEL:', LOCAL_LLM_MODEL);
    } else {
      console.log('OPENAI_API_KEY 존재:', !!OPENAI_API_KEY);
    }
    console.log('SUPABASE_URL 존재:', !!SUPABASE_URL);
    console.log('SUPABASE_SERVICE_KEY 존재:', !!SUPABASE_SERVICE_KEY);

    // 환경 변수 확인
    if (!USE_LOCAL_LLM && !OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY 없음 (로컬 LLM도 비활성화됨)');
      throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다. USE_LOCAL_LLM=true를 설정하여 로컬 LLM을 사용하세요.');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('❌ Supabase 환경 변수 없음');
      throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
    }

    // Supabase 클라이언트 생성
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log('🔍 소프트웨어 설문 분석 시작...');

    // 1. 설문 응답 데이터 조회
    console.log('📊 설문 응답 데이터 조회 중...');
    const { data: surveyResponses, error: surveyError } = await supabase
      .from('software_survey_responses')
      .select('*');

    if (surveyError) {
      console.error('❌ 설문 응답 조회 실패:', surveyError);
      throw new Error(`설문 응답 조회 실패: ${surveyError.message}`);
    }

    console.log(`✅ 설문 응답 조회 완료 (${surveyResponses?.length || 0}명)`);

    // 2. 소프트웨어 할당 데이터 조회
    const { data: assignments, error: assignError } = await supabase
      .from('software_assignments')
      .select('user_email')
      .eq('is_active', true);

    if (assignError) {
      throw new Error(`소프트웨어 할당 조회 실패: ${assignError.message}`);
    }

    const assignedEmails = Array.from(new Set(
      assignments.map((a: any) => a.user_email.toLowerCase())
    ));

    console.log(`✅ 소프트웨어 할당 조회 완료 (${assignedEmails.length}명)`);

    // 3. 소프트웨어별 사용 현황 집계
    console.log('📈 소프트웨어 사용 현황 집계 중...');
    const softwareUsageMap: Map<string, {
      users: Set<string>;
      daily: number;
      weekly: number;
      monthly: number;
      rarely: number;
      unknown: number;
    }> = new Map();

    let totalSoftwareCount = 0;

    console.log(`응답 데이터 처리 시작 (${surveyResponses.length}개)`);
    surveyResponses.forEach((response, idx) => {
      console.log(`[${idx + 1}/${surveyResponses.length}] 처리 중: ${response.user_email}`);
      if (response.category_responses && Array.isArray(response.category_responses)) {
        response.category_responses.forEach((categoryResponse: any) => {
          if (categoryResponse.products && Array.isArray(categoryResponse.products)) {
            categoryResponse.products.forEach((productName: string) => {
              // usageInfo에서 빈도 정보 가져오기
              const usageInfo = categoryResponse.usageInfo?.[productName];
              const frequency = usageInfo?.frequency || 'unknown';

              if (!productName) return;

              totalSoftwareCount++;

              if (!softwareUsageMap.has(productName)) {
                softwareUsageMap.set(productName, {
                  users: new Set(),
                  daily: 0,
                  weekly: 0,
                  monthly: 0,
                  rarely: 0,
                  unknown: 0,
                });
              }

              const usage = softwareUsageMap.get(productName)!;
              usage.users.add(response.user_email.toLowerCase());

              switch (frequency) {
                case 'daily':
                  usage.daily++;
                  break;
                case 'weekly':
                  usage.weekly++;
                  break;
                case 'monthly':
                  usage.monthly++;
                  break;
                case 'rarely':
                  usage.rarely++;
                  break;
                default:
                  usage.unknown++;
              }
            });
          }
        });
      }
    });

    // 4. 소프트웨어별 데이터 변환
    const softwareUsage: SoftwareUsageData[] = Array.from(softwareUsageMap.entries())
      .map(([name, data]) => ({
        software_name: name,
        total_users: data.users.size,
        frequency_breakdown: {
          daily: data.daily,
          weekly: data.weekly,
          monthly: data.monthly,
          rarely: data.rarely,
          unknown: data.unknown,
        },
        assigned_count: 0, // 추후 확장 가능
        response_rate: 0,
      }))
      .sort((a, b) => b.total_users - a.total_users);

    const stats: SurveyStats = {
      total_respondents: surveyResponses.length,
      total_assigned: assignedEmails.length,
      participation_rate: (surveyResponses.length / assignedEmails.length) * 100,
      total_software_types: softwareUsage.length,
      avg_software_per_user: surveyResponses.length > 0
        ? totalSoftwareCount / surveyResponses.length
        : 0,
      software_usage: softwareUsage,
    };

    console.log(`✅ 소프트웨어 사용 현황 집계 완료 (${stats.total_software_types}개)`);

    // 5. 프롬프트 생성
    const prompt = buildSoftwarePrompt(stats);
    console.log('📝 프롬프트 생성 완료');

    // 6. LLM API 호출 (로컬 또는 OpenAI)
    console.log('🤖 LLM 분석 시작...');
    const { analysis, tokenUsage, model } = await callLLM(prompt);

    // 7. 한 줄 요약 추출
    const oneLiner = extractOneLiner(analysis);

    // 8. 분석 결과 저장
    const { data: savedAnalysis, error: insertError } = await supabase
      .from('software_llm_analysis_history')
      .insert({
        analysis_type: 'comprehensive',
        survey_stats: stats,
        llm_structured_data: analysis,
        llm_raw_markdown: null, // 더 이상 마크다운 사용 안함
        summary_one_liner: oneLiner,
        total_respondents: stats.total_respondents,
        total_software_types: stats.total_software_types,
        avg_software_per_user: stats.avg_software_per_user,
        token_usage: tokenUsage,
        model: model,
        created_by: req.headers.get('user-email') || 'system',
      })
      .select()
      .single();

    if (insertError) {
      console.error('⚠️ 분석 결과 저장 실패:', insertError.message);
      // 저장 실패해도 분석 결과는 반환
    } else {
      console.log('✅ 분석 결과 저장 완료 (ID:', savedAnalysis.id, ')');
    }

    // 9. 응답 반환
    return new Response(
      JSON.stringify({
        success: true,
        data: savedAnalysis || {
          llm_structured_data: analysis,
          llm_raw_markdown: null,
          summary_one_liner: oneLiner,
          total_respondents: stats.total_respondents,
          total_software_types: stats.total_software_types,
          avg_software_per_user: stats.avg_software_per_user,
          token_usage: tokenUsage,
          model: model,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ 소프트웨어 설문 분석 실패:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '알 수 없는 오류가 발생했습니다.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
