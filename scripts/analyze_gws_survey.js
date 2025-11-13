/**
 * GWS 설문 분석 스크립트 (OpenAI GPT-4 활용)
 *
 * 기능:
 * 1. Supabase에서 설문 데이터 수집
 * 2. OpenAI GPT-4로 종합 분석 보고서 생성
 * 3. Markdown 형식으로 보고서 저장
 *
 * 사용법:
 * node scripts/analyze_gws_survey.js [옵션]
 *
 * 옵션:
 * --summary-only    요약 보고서만 생성 (개별 분석 제외)
 * --output [파일명] 출력 파일 지정 (기본: gws_analysis_report.md)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// ============================================================================
// 환경 변수 확인
// ============================================================================
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('   .env.local 파일에 REACT_APP_SUPABASE_URL과 SUPABASE_SERVICE_KEY를 설정하세요.');
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
  console.error('   .env.local 파일에 OPENAI_API_KEY를 추가하세요.');
  process.exit(1);
}

// ============================================================================
// 클라이언트 초기화
// ============================================================================
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ============================================================================
// 명령줄 인자 처리
// ============================================================================
const args = process.argv.slice(2);
const summaryOnly = args.includes('--summary-only');
const outputIndex = args.indexOf('--output');
const outputFile = outputIndex !== -1 && args[outputIndex + 1]
  ? args[outputIndex + 1]
  : 'gws_analysis_report.md';

// ============================================================================
// 데이터 수집 함수
// ============================================================================

/**
 * 설문 응답 통계 조회
 */
async function getSurveySummary() {
  const { data, error } = await supabase
    .from('gws_survey_summary')
    .select('*')
    .single();

  if (error) {
    console.error('통계 조회 실패:', error);
    return null;
  }

  return data;
}

/**
 * 고급 기능 사용 분석 조회
 */
async function getAdvancedFeaturesAnalysis() {
  const { data, error } = await supabase
    .from('gws_advanced_features_analysis')
    .select('*');

  if (error) {
    console.error('고급 기능 분석 조회 실패:', error);
    return [];
  }

  return data;
}

/**
 * 전환 위험도 분석 조회
 */
async function getMigrationRiskAnalysis() {
  const { data, error } = await supabase
    .from('gws_migration_risk_analysis')
    .select('*');

  if (error) {
    console.error('위험도 분석 조회 실패:', error);
    return [];
  }

  return data;
}

/**
 * LLM 분석용 자연어 데이터 조회
 */
async function getLLMAnalysisInput() {
  const { data, error } = await supabase
    .from('gws_llm_analysis_input')
    .select('*');

  if (error) {
    console.error('LLM 입력 데이터 조회 실패:', error);
    return [];
  }

  return data;
}

/**
 * 설문 메타데이터 조회
 */
async function getSurveyMetadata() {
  const { data, error } = await supabase
    .from('gws_survey_metadata')
    .select('*')
    .order('question_id');

  if (error) {
    console.error('메타데이터 조회 실패:', error);
    return [];
  }

  return data;
}

// ============================================================================
// OpenAI 분석 함수
// ============================================================================

/**
 * 종합 분석 보고서 생성
 */
async function generateComprehensiveReport(summary, features, risks, metadata) {
  const prompt = `
# GWS Enterprise → Starter 전환 검토 설문 분석 요청

당신은 Google Workspace 관리 전문가입니다. 아래 설문 결과를 분석하여 총무팀이 의사결정에 활용할 수 있는 종합 보고서를 작성해주세요.

## 설문 개요
${JSON.stringify(metadata, null, 2)}

## 응답 통계
${JSON.stringify(summary, null, 2)}

## 고급 기능 사용 현황
${JSON.stringify(features, null, 2)}

## 전환 위험도 분석 (상위 10명)
${JSON.stringify(risks.slice(0, 10), null, 2)}

## 분석 요청사항

다음 형식으로 한국어로 작성해주세요:

1. **핵심 요약** (3-5줄)
   - 전체 응답자 수, 주요 발견사항, 권장사항 요약

2. **주요 발견사항**
   - 계정 유형 인식도
   - 저장공간 부족 경험
   - 고급 기능 사용 패턴
   - Enterprise 필요성 인식

3. **Starter 전환 가능성 분석**
   - 전환 가능 후보자 수 및 비율
   - 전환 시 예상 절감 비용 (1인당 월 ₩20,000 절감 가정)
   - 전환 권장 대상 특징

4. **Enterprise 유지 필요 분석**
   - 유지 필요 인원 및 근거
   - 핵심 기능 의존도
   - 업무 차질 위험도

5. **리스크 및 주의사항**
   - 전환 시 발생 가능한 문제
   - 사용자 저항 예상 지점
   - 완화 방안

6. **실행 권장사항**
   - 단계별 실행 계획
   - 우선순위 제안
   - 추가 검토 필요 사항

형식: Markdown, 전문적이고 객관적인 톤, 구체적인 숫자와 근거 포함
`;

  try {
    console.log('🤖 OpenAI GPT-4로 종합 분석 중...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '당신은 Google Workspace 관리 및 비용 최적화 전문가입니다. 데이터 기반으로 객관적이고 실행 가능한 분석을 제공합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API 호출 실패:', error);
    return null;
  }
}

/**
 * 개별 응답자 분석 (주관식 우려사항 중심)
 */
async function analyzeIndividualConcerns(llmData) {
  // 우려사항이 있는 응답만 필터링
  const withConcerns = llmData.filter(item =>
    item.natural_language_response.includes('전환 우려사항:') &&
    !item.natural_language_response.includes('특이사항 없음')
  );

  if (withConcerns.length === 0) {
    return '## 개별 우려사항 분석\n\n특별한 우려사항을 제출한 응답이 없습니다.\n';
  }

  const prompt = `
아래는 GWS Enterprise → Starter 전환에 대한 사용자들의 우려사항입니다.
이를 분석하여 공통 패턴, 핵심 이슈, 해결 방안을 제시해주세요.

${withConcerns.map(item => item.natural_language_response).join('\n\n---\n\n')}

다음 형식으로 한국어로 작성:

1. **공통 우려사항 패턴**
   - 가장 많이 언급된 이슈들

2. **카테고리별 분류**
   - 저장공간 관련
   - 기능 제약 관련
   - 데이터 마이그레이션 관련
   - 기타

3. **해결 방안 제안**
   - 각 우려사항에 대한 대응 방법
   - 사전 안내 필요 사항

형식: Markdown, 간결하고 명확하게
`;

  try {
    console.log('🤖 개별 우려사항 분석 중...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '당신은 사용자 피드백 분석 전문가입니다. 우려사항을 구조화하여 실행 가능한 해결책을 제시합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    return '## 개별 우려사항 분석\n\n' + completion.choices[0].message.content;
  } catch (error) {
    console.error('개별 분석 실패:', error);
    return '## 개별 우려사항 분석\n\n분석 중 오류가 발생했습니다.\n';
  }
}

// ============================================================================
// 보고서 생성 함수
// ============================================================================

/**
 * Markdown 보고서 생성 및 저장
 */
async function generateReport() {
  console.log('📊 GWS 설문 데이터 수집 중...\n');

  // 데이터 수집
  const summary = await getSurveySummary();
  const features = await getAdvancedFeaturesAnalysis();
  const risks = await getMigrationRiskAnalysis();
  const llmData = await getLLMAnalysisInput();
  const metadata = await getSurveyMetadata();

  if (!summary) {
    console.error('❌ 설문 응답 데이터가 없습니다.');
    process.exit(1);
  }

  console.log(`✅ 총 ${summary.total_responses}개 응답 수집 완료\n`);

  // 보고서 헤더
  let report = `# GWS Enterprise → Starter 전환 검토 분석 보고서

**생성 일시**: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
**총 응답 수**: ${summary.total_responses}명
**분석 도구**: OpenAI GPT-4o

---

`;

  // GPT-4로 종합 분석
  const comprehensiveAnalysis = await generateComprehensiveReport(
    summary,
    features,
    risks,
    metadata
  );

  if (comprehensiveAnalysis) {
    report += comprehensiveAnalysis + '\n\n---\n\n';
  }

  // 개별 우려사항 분석 (옵션)
  if (!summaryOnly && llmData.length > 0) {
    const concernsAnalysis = await analyzeIndividualConcerns(llmData);
    report += concernsAnalysis + '\n\n---\n\n';
  }

  // 상세 통계 (원본 데이터)
  report += `## 상세 통계 데이터

### 전체 응답 분포

| 항목 | 응답 수 | 비율 |
|------|---------|------|
| 총 응답자 | ${summary.total_responses} | 100% |
| Enterprise 인지 | ${summary.knows_enterprise} | ${((summary.knows_enterprise / summary.total_responses) * 100).toFixed(1)}% |
| Starter 인지 | ${summary.knows_starter} | ${((summary.knows_starter / summary.total_responses) * 100).toFixed(1)}% |
| 계정 유형 모름 | ${summary.unknown_account} | ${((summary.unknown_account / summary.total_responses) * 100).toFixed(1)}% |

### Enterprise 필요성 분포

| 필요성 | 응답 수 | 비율 |
|--------|---------|------|
| 반드시 필요 | ${summary.necessity_essential} | ${((summary.necessity_essential / summary.total_responses) * 100).toFixed(1)}% |
| 있으면 좋음 | ${summary.necessity_nice} | ${((summary.necessity_nice / summary.total_responses) * 100).toFixed(1)}% |
| 필요 없음 | ${summary.necessity_not_needed} | ${((summary.necessity_not_needed / summary.total_responses) * 100).toFixed(1)}% |
| 잘 모르겠음 | ${summary.necessity_unknown} | ${((summary.necessity_unknown / summary.total_responses) * 100).toFixed(1)}% |

### 전환 가능성 판정

| 분류 | 인원 | 비율 |
|------|------|------|
| 🟢 Starter 전환 가능 후보 | ${summary.starter_migration_candidates} | ${((summary.starter_migration_candidates / summary.total_responses) * 100).toFixed(1)}% |
| 🔴 Enterprise 유지 필요 | ${summary.enterprise_retention_needed} | ${((summary.enterprise_retention_needed / summary.total_responses) * 100).toFixed(1)}% |

### 고급 기능 사용 현황

| 기능 | 사용 인원 | 사용률 |
|------|-----------|--------|
${features.map(f => `| ${f.feature} | ${f.usage_count}명 | ${f.usage_percentage}% |`).join('\n')}

---

## 부록: 개별 위험도 분석 (상위 20명)

| 이메일 | 위험도 점수 | 판정 | Enterprise 필요성 | 저장공간 | 대용량 파일 |
|--------|-------------|------|------------------|----------|-------------|
${risks.slice(0, 20).map(r =>
  `| ${r.user_email} | ${r.risk_score} | ${r.migration_recommendation} | ${r.enterprise_necessity} | ${r.storage_shortage} | ${r.large_files} |`
).join('\n')}

---

**보고서 끝**

*이 보고서는 OpenAI GPT-4o를 활용하여 자동 생성되었습니다.*
*최종 의사결정 전 개별 사용자와 추가 협의가 필요할 수 있습니다.*
`;

  // 파일 저장
  const outputPath = path.join(__dirname, '..', 'claudedocs', outputFile);
  fs.writeFileSync(outputPath, report, 'utf-8');

  console.log(`\n✅ 분석 보고서 생성 완료!`);
  console.log(`📄 파일 위치: ${outputPath}\n`);

  // 요약 출력
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 핵심 요약');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`총 응답: ${summary.total_responses}명`);
  console.log(`Starter 전환 가능: ${summary.starter_migration_candidates}명 (${((summary.starter_migration_candidates / summary.total_responses) * 100).toFixed(1)}%)`);
  console.log(`Enterprise 유지 필요: ${summary.enterprise_retention_needed}명 (${((summary.enterprise_retention_needed / summary.total_responses) * 100).toFixed(1)}%)`);
  console.log(`예상 월간 절감액: ₩${(summary.starter_migration_candidates * 20000).toLocaleString()}`);
  console.log(`예상 연간 절감액: ₩${(summary.starter_migration_candidates * 20000 * 12).toLocaleString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// ============================================================================
// 실행
// ============================================================================

generateReport().catch(error => {
  console.error('❌ 보고서 생성 실패:', error);
  process.exit(1);
});
