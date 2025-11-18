/**
 * GWS LLM 분석 Edge Function
 * OpenAI GPT-4o를 사용하여 GWS 구매 전략 분석 수행
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
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY');

// 타입 정의
interface Baseline2024 {
  domain: string;
  edition: string;
  seats: number;
  unit_price_krw: number;
}

interface Survey2025 {
  starter_seats: number;
  standard_seats: number;
  enterprise_seats: number;
  total_respondents: number;
  essential_count: number;
  storage_shortage_count: number;
  large_files_count: number;
  downgrade_possible_count: number;
  meet_high_frequency_count: number;
  avg_advanced_features_count: number;
}

/**
 * 프롬프트 생성 함수
 */
function buildGWSPrompt(baseline2024: Baseline2024[], survey2025: Survey2025): string {
  // 2024 데이터 포맷팅
  const baseline2024Map = baseline2024.reduce((acc, item) => {
    acc[item.edition] = item.seats;
    return acc;
  }, {} as Record<string, number>);

  const starter2024 = baseline2024Map['Business Starter'] || 0;
  const standard2024 = baseline2024Map['Business Standard'] || 0;
  const enterprise2024 = baseline2024Map['Enterprise Standard'] || 0;

  return `당신은 Treenod 총무팀의 Google Workspace 구매 전략 컨설턴트입니다.
아래에 ① 2024년 계약 단가 정보, ② 2025년 견적 단가 정보, ③ 설문/대시보드에서 집계된 좌석 수 정보가 주어집니다.

중요한 전제는 다음과 같습니다.

- [매우 중요] 2024·2025 계약서에 적힌 "수량/총금액"은 모두 **무시**하고,
  아래에 정리된 **단가(가격) 정보만** 사용해 주세요.
- "실제 수량(몇 석인지)"은 전부 ③번 설문 결과에서만 가져와서 계산해야 합니다.
- 우리 회사는 2024년에는 전체 300석 이상을 계약해서 **PDL 규칙이 적용**되었고,
  2025년에는 300석 미만으로 진행하면 **PDL 규칙이 더 이상 적용되지 않습니다.**
- 즉, 2024년 단가는 "PDL 할인까지 반영된 단가", 2025년 단가는 "PDL 없이 7.5%만 할인된 단가"로 이해하면 됩니다.

--------------------------------
[① 2024년 Google Workspace 계약 단가 (수량은 무시)]

환율: 1달러 = 1,426.8원 (고정 적용 환율)

- Business Starter
  - 소비자가(USD): $72
  - 견적단가(USD): $64.80 (할인율: 10%)
  - 1석당 원화 단가: 92,457원

- Enterprise Standard
  - 소비자가(USD): $276.00
  - 견적단가(USD): $237.36 (할인율: 14%)
  - 1석당 원화 단가: 338,665원

- Business Standard
  - 소비자가(USD): $144.00
  - 견적단가(USD): $129.60 (할인율: 10%)
  - 1석당 원화 단가: 184,913원

※ 2024년에는 전체 300석 이상이라 PDL 규칙이 적용되었고,
  위 견적단가는 PDL 할인까지 반영된 최종 단가입니다.

--------------------------------
[② 2025년 Google Workspace 견적 단가 (수량은 무시)]

- Business Starter
  - 소비자 단가(USD): $84
  - 견적 단가(USD): $77.7 (할인율: 7.5%)
  - 1석당 원화 단가: 108,780원

- Enterprise Standard
  - 소비자 단가(USD): $324
  - 견적 단가(USD): $299.7 (할인율: 7.5%)
  - 1석당 원화 단가: 419,580원

- Business Standard
  - 소비자 단가(USD): $168
  - 견적 단가(USD): $155.4 (할인율: 7.5%)
  - 1석당 원화 단가: 217,560원

※ 2025년에는 기본적으로 PDL 미적용 가정이며,
  위 견적단가는 "7.5% 일반 할인"만 반영된 단가입니다.

--------------------------------
[③ 설문/대시보드에서 넘어온 좌석 수 데이터]

[SURVEY_DATA]
- 2024 실제 사용 좌석 (계약 기준):
  - Business Starter: ${starter2024}석 (treenod.com)
  - Business Standard: ${standard2024}석 (treetive.com)
  - Enterprise Standard: ${enterprise2024}석 (treenod.com)

- 2025 설문 기반 예상 좌석 수:
  - Business Starter: ${survey2025.starter_seats}석
  - Business Standard: ${survey2025.standard_seats}석
  - Enterprise Standard: ${survey2025.enterprise_seats}석

- 2025 설문 요약 통계:
  - 총 응답자 수: ${survey2025.total_respondents}명
  - "Enterprise 반드시 필요" 응답자: ${survey2025.essential_count}명
  - "저장공간 부족 자주 경험" 응답자: ${survey2025.storage_shortage_count}명
  - "대용량 파일 사용" 응답자: ${survey2025.large_files_count}명
  - "Starter/Standard로 내려도 무방" 응답자: ${survey2025.downgrade_possible_count}명
  - "Meet 고빈도 사용자" 응답자: ${survey2025.meet_high_frequency_count}명
  - 평균 고급 기능 사용 개수: ${survey2025.avg_advanced_features_count}개
[SURVEY_DATA_END]

--------------------------------
[당신이 해야 할 분석]

아래 3단계로 결과를 정리해 주세요.
최종 출력은 모두 **한국어**로 작성하고,
대시보드 카드에 그대로 쓸 수 있도록 깔끔한 마크다운 형식으로 작성해 주세요.

1) 단가 + 수량 기반 금액 비교 요약

- 위 ①, ②의 "1석당 단가"와 ③ 설문에서 받은 "좌석 수"를 곱해서:
  - 2024년 총 좌석 수 / 2025년 총 좌석 수
  - 2024년 vs 2025년 에디션별 좌석 수
  - 2024년 vs 2025년 에디션별 총금액(원화)
  - 2024년 vs 2025년 전체 총금액(원화)
- 아래 두 개의 마크다운 표를 만들어 주세요.

  ① 에디션별 비교 표
  | 구분 | 에디션 | 2024 수량 | 2025 수량 | 증감(석) | 2024 총금액(원) | 2025 총금액(원) | 증감(원) |
  |------|--------|-----------|-----------|----------|-----------------|-----------------|----------|

  ② 전체 합계 비교 표
  | 구분 | 총 좌석 수 | 총금액(원) | 1석당 평균 단가(원) |
  |------|------------|------------|----------------------|
  | 2024 |            |            |                      |
  | 2025 |            |            |                      |

- 표 아래에 한 줄로 핵심 요약을 적어 주세요.
  예: "총 좌석 수는 24년 대비 25년에 ○○석 감소(-XX%), 총금액은 △△원 감소(-YY%) 했지만, 1석당 평균 단가는 ZZ% 상승했습니다."

2) PDL 규칙 변화 관점 인사이트

- 2024년: 300석 이상 + PDL 적용(Starter/Standard 10%, Enterprise 14% 할인 단가 사용)
- 2025년: 300석 미만 가정 + PDL 미적용(모든 에디션 7.5% 할인 단가 사용)
- 이 정보를 바탕으로:
  - 에디션별 1석당 단가가 24→25년 어떻게 변했는지(원/석 기준, % 변화)
  - "좌석을 줄여서 절약되는 금액" vs "PDL 할인 손실로 올라간 단가" 중 어느 효과가 더 큰지
  - Business Starter/Standard/Enterprise 각각에서 "업/다운그레이드 여지"가 있는지
- 위 내용을 글머리표로 3~5개 정도 요약해 주세요.

3) 구매 전략 제안 (실행 가능한 액션 위주)

- Treenod 총무팀이 경영진에게 보고할 수 있는 수준의 **실행 전략**을 3~5개 제안해 주세요.
- 각 전략은 아래 형식으로 작성해 주세요.

  - 전략 1: (제목 한 줄)
    - 내용: (2~3문장으로 구체적인 설명)
    - 기대 효과: (비용 절감/운영 단순화/유연성 확보 등)

  - 전략 2: (제목 한 줄)
    - 내용: ...
    - 기대 효과: ...

- 전략에는 다음 내용이 자연스럽게 포함되면 좋습니다.
  - 필수 인원만 Enterprise Standard를 유지하고, 가능한 인원은 Business Standard/Starter로 내리는 방안
  - "총 좌석 수를 일부러 300석 이상으로 유지해 PDL을 다시 적용받는 전략" vs "과감히 줄이고 7.5% 할인만 받는 전략"을 비교하는 기준
  - treetive.com 계정을 4석 수준으로 최소 유지할 때의 장단점(운영 복잡도 vs 비용 등)

--------------------------------
[작성 스타일]

- 전체 답변은 한국어로 작성
- 말투는 컨설팅 보고서처럼 너무 딱딱하지 말고,
  "총무팀 담당자가 팀장/임원에게 올리는 실무형 요약 보고" 느낌으로
- 표 + 핵심 불릿 + 전략 위주로 간결하게 정리`;
}

/**
 * OpenAI API 호출
 */
async function callOpenAI(prompt: string): Promise<{ content: string; tokenUsage: number }> {
  const startTime = Date.now();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '당신은 Treenod 총무팀의 Google Workspace 구매 전략 컨설턴트입니다. 데이터를 정확히 분석하고, 실행 가능한 전략을 제안합니다.',
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
    throw new Error(`OpenAI API 오류: ${response.status} - ${error}`);
  }

  const result = await response.json();
  const executionTime = Date.now() - startTime;

  console.log(`✅ OpenAI 분석 완료 (${executionTime}ms, ${result.usage.total_tokens} tokens)`);

  return {
    content: result.choices[0].message.content,
    tokenUsage: result.usage.total_tokens,
  };
}

/**
 * 한 줄 요약 추출
 */
function extractOneLiner(markdown: string): string {
  const match = markdown.match(/총 좌석 수는.*?[\.]/s);
  return match ? match[0] : '분석 결과를 확인하세요.';
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
    // 환경 변수 확인
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
    }

    // Supabase 클라이언트 생성
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log('🔍 GWS 분석 시작...');

    // 1. 2024년 기준값 조회
    const { data: baseline2024, error: baselineError } = await supabase
      .from('gws_license_baseline_2024')
      .select('*')
      .order('domain, edition');

    if (baselineError) {
      throw new Error(`2024 기준값 조회 실패: ${baselineError.message}`);
    }

    console.log(`✅ 2024 기준값 조회 완료 (${baseline2024.length}개)`);

    // 2. 2025년 설문 집계 조회
    const { data: survey2025, error: surveyError } = await supabase
      .from('gws_2025_edition_aggregation')
      .select('*')
      .single();

    if (surveyError) {
      throw new Error(`2025 설문 집계 조회 실패: ${surveyError.message}`);
    }

    console.log(`✅ 2025 설문 집계 조회 완료 (응답자 ${survey2025.total_respondents}명)`);

    // 3. 프롬프트 생성
    const prompt = buildGWSPrompt(baseline2024, survey2025);
    console.log('📝 프롬프트 생성 완료');

    // 4. OpenAI API 호출
    console.log('🤖 OpenAI GPT-4o 분석 시작...');
    const { content: analysisMarkdown, tokenUsage } = await callOpenAI(prompt);

    // 5. 한 줄 요약 추출
    const oneLiner = extractOneLiner(analysisMarkdown);

    // 6. 금액 계산 (요약용)
    const totalSeats2024 = baseline2024.reduce((sum, item) => sum + item.seats, 0);
    const totalSeats2025 = survey2025.starter_seats + survey2025.standard_seats + survey2025.enterprise_seats;

    const totalAmount2024 = baseline2024.reduce((sum, item) => sum + (item.seats * item.unit_price_krw), 0);

    // 2025년 단가
    const prices2025 = {
      'Business Starter': 108780,
      'Business Standard': 217560,
      'Enterprise Standard': 419580,
    };

    const totalAmount2025 =
      survey2025.starter_seats * prices2025['Business Starter'] +
      survey2025.standard_seats * prices2025['Business Standard'] +
      survey2025.enterprise_seats * prices2025['Enterprise Standard'];

    const costDifference = totalAmount2025 - totalAmount2024;
    const costDifferencePercent = ((costDifference / totalAmount2024) * 100).toFixed(2);

    // 7. 분석 결과 저장
    const { data: savedAnalysis, error: insertError } = await supabase
      .from('gws_llm_analysis_history')
      .insert({
        analysis_type: 'comprehensive',
        baseline_2024: baseline2024,
        survey_2025: survey2025,
        llm_raw_markdown: analysisMarkdown,
        summary_one_liner: oneLiner,
        total_seats_2024: totalSeats2024,
        total_seats_2025: totalSeats2025,
        total_amount_2024: totalAmount2024,
        total_amount_2025: totalAmount2025,
        cost_difference: costDifference,
        cost_difference_percent: parseFloat(costDifferencePercent),
        token_usage: tokenUsage,
        model: 'gpt-4o',
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

    // 8. 응답 반환
    return new Response(
      JSON.stringify({
        success: true,
        data: savedAnalysis || {
          llm_raw_markdown: analysisMarkdown,
          summary_one_liner: oneLiner,
          total_seats_2024: totalSeats2024,
          total_seats_2025: totalSeats2025,
          total_amount_2024: totalAmount2024,
          total_amount_2025: totalAmount2025,
          cost_difference: costDifference,
          cost_difference_percent: parseFloat(costDifferencePercent),
          token_usage: tokenUsage,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ GWS 분석 실패:', error);

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
