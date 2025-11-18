# GWS LLM 분석 시스템 체크리스트

## ✅ 필요한 구성 요소

### 1. Supabase 테이블 및 뷰
```sql
-- 다음 테이블/뷰가 존재해야 합니다:

1️⃣ gws_license_baseline_2024
   - 2024년 계약 기준 데이터
   - scripts/create_gws_baseline.sql로 생성

2️⃣ gws_survey_responses  
   - 설문 응답 데이터
   - 사용자가 설문을 제출하면 자동 저장

3️⃣ gws_2025_edition_aggregation (VIEW)
   - 설문 응답 집계 뷰
   - scripts/create_gws_2025_aggregation.sql로 생성

4️⃣ gws_llm_analysis_history
   - LLM 분석 결과 저장
   - scripts/create_gws_llm_analysis_table.sql로 생성
```

### 2. Supabase Edge Function
```bash
# gws-analyze Edge Function 배포 필요
supabase/functions/gws-analyze/index.ts

# 배포 명령:
supabase functions deploy gws-analyze

# 필요한 환경 변수 (Supabase Dashboard에서 설정):
- OPENAI_API_KEY: OpenAI API 키
- SUPABASE_URL: 자동 설정됨  
- SUPABASE_SERVICE_KEY: 자동 설정됨
```

### 3. 프론트엔드 컴포넌트
```
✅ src/components/GWSLLMAnalysis.tsx
✅ src/utils/markdownParser.ts
✅ src/components/common/Accordion.tsx
```

## 🔍 확인 방법

### A. Supabase Dashboard에서 확인
1. https://supabase.com/dashboard/project/adschpldrzwzpzxagxzdw
2. Table Editor에서 테이블 존재 확인:
   - gws_license_baseline_2024
   - gws_survey_responses
   - gws_llm_analysis_history
   
3. SQL Editor에서 뷰 확인:
```sql
SELECT * FROM gws_2025_edition_aggregation LIMIT 1;
```

### B. Edge Functions 상태 확인
1. Dashboard → Edge Functions
2. `gws-analyze` 함수가 배포되어 있는지 확인
3. Environment Variables에 OPENAI_API_KEY 설정되어 있는지 확인

### C. 프론트엔드에서 테스트
1. https://ga-software-survey-total.vercel.app/dashboard
2. 로그인 후 "GWS LLM 분석" 탭 클릭
3. "LLM 분석 실행" 버튼 클릭
4. 에러 없이 분석 결과가 표시되는지 확인

## ⚠️ 자주 발생하는 문제

### 문제 1: "아직 분석 결과가 없습니다"
**원인**: gws_llm_analysis_history 테이블이 비어있음  
**해결**: "LLM 분석 실행" 버튼 클릭해서 분석 실행

### 문제 2: "분석 실패" 에러
**원인 1**: Edge Function이 배포되지 않음  
**해결**: `supabase functions deploy gws-analyze`

**원인 2**: OPENAI_API_KEY 미설정  
**해결**: Supabase Dashboard → Settings → Edge Functions → Environment Variables

**원인 3**: 설문 응답이 없음  
**해결**: GWS 설문을 먼저 제출해야 함

### 문제 3: "테이블이 존재하지 않음" 에러
**원인**: SQL 스크립트 미실행  
**해결**: 
```sql
-- Supabase SQL Editor에서 순서대로 실행:
1. scripts/create_gws_baseline.sql
2. scripts/create_gws_llm_analysis_table.sql  
3. scripts/create_gws_2025_aggregation.sql
```

## 📋 배포 순서 (처음 설정 시)

```bash
# 1. SQL 스크립트 실행 (Supabase Dashboard SQL Editor)
#    - create_gws_baseline.sql
#    - create_gws_llm_analysis_table.sql
#    - create_gws_2025_aggregation.sql

# 2. Edge Function 배포
cd "d:\development\Software survey"
supabase functions deploy gws-analyze

# 3. Environment Variables 설정 (Supabase Dashboard)
#    OPENAI_API_KEY = sk-xxx...

# 4. 설문 제출 (최소 1개 이상)
#    https://ga-software-survey-total.vercel.app/gws-survey

# 5. LLM 분석 실행
#    Dashboard → GWS LLM 분석 탭 → "LLM 분석 실행"
```

## 🎯 현재 상태 확인 명령

Supabase SQL Editor에서 실행:
```sql
-- 1. 기준 데이터 확인
SELECT * FROM gws_license_baseline_2024;

-- 2. 설문 응답 확인
SELECT COUNT(*) as 응답수 FROM gws_survey_responses;

-- 3. 집계 뷰 확인
SELECT * FROM gws_2025_edition_aggregation;

-- 4. 분석 이력 확인
SELECT 
  id, 
  created_at, 
  created_by, 
  model,
  token_usage,
  LEFT(summary_one_liner, 100) as 요약
FROM gws_llm_analysis_history 
ORDER BY created_at DESC 
LIMIT 5;
```
