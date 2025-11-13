# GWS 설문 LLM 분석 시스템 가이드

## 📋 개요

이 시스템은 GWS Enterprise → Starter 전환 검토 설문 결과를 OpenAI GPT-4를 활용하여 자동으로 분석하고 보고서를 생성합니다.

## 🎯 주요 기능

### 1. 데이터베이스 구조
- **메타데이터 테이블** (`gws_survey_metadata`): 설문 질문 및 선택지 정보
- **분석 뷰 4개**:
  - `gws_survey_summary`: 전체 통계
  - `gws_advanced_features_analysis`: 고급 기능 사용 분석
  - `gws_migration_risk_analysis`: 개별 위험도 평가
  - `gws_llm_analysis_input`: 자연어 형태의 응답 데이터

### 2. 자동 분석 기능
- **종합 분석**: 전체 응답 데이터 기반 인사이트
- **전환 가능성 평가**: Starter 전환 가능 후보자 식별
- **리스크 분석**: 전환 시 위험도 평가
- **비용 절감 계산**: 전환 시 예상 절감액 산출
- **우려사항 분석**: 개별 응답자 주관식 답변 분석

### 3. 보고서 생성
- Markdown 형식 전문 보고서
- 실행 가능한 권장사항 포함
- 상세 통계 및 개별 위험도 데이터

## 🚀 사용 방법

### 1. 환경 설정

#### 필수 패키지 설치
```bash
npm install openai
```

#### 환경 변수 설정
`.env.local` 파일에 다음 내용 확인:
```env
REACT_APP_SUPABASE_URL=https://adschpldzwzpzxagxzdw.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
OPENAI_API_KEY=sk-proj-... # OpenAI API 키
```

**⚠️ 보안 주의**: OpenAI API 키는 외부에 노출되지 않도록 관리하세요.

### 2. 데이터베이스 마이그레이션

#### Supabase 대시보드에서 실행
```sql
-- scripts/alter_gws_survey_table.sql 파일 내용 복사하여 실행
```

이 스크립트는 다음을 수행합니다:
- 기존 테이블 구조 변경
- 메타데이터 테이블 생성
- 분석용 뷰 4개 생성
- 위험도 계산 함수 생성

### 3. 분석 실행

#### 기본 실행 (전체 분석)
```bash
node scripts/analyze_gws_survey.js
```

#### 요약만 생성 (개별 분석 제외)
```bash
node scripts/analyze_gws_survey.js --summary-only
```

#### 출력 파일명 지정
```bash
node scripts/analyze_gws_survey.js --output my_report.md
```

### 4. 보고서 확인

생성된 보고서 위치:
```
claudedocs/gws_analysis_report.md
```

## 📊 보고서 구성

### 1. 핵심 요약
- 총 응답자 수
- Starter 전환 가능 인원
- 예상 비용 절감액

### 2. 주요 발견사항
- 계정 유형 인식도
- 저장공간 사용 패턴
- 고급 기능 의존도
- Enterprise 필요성 분포

### 3. Starter 전환 가능성 분석
- 전환 가능 후보자 특징
- 비용 절감 효과
- 권장 전환 대상

### 4. Enterprise 유지 필요 분석
- 유지 필요 인원 및 근거
- 핵심 기능 의존도
- 업무 차질 위험도

### 5. 리스크 및 주의사항
- 전환 시 발생 가능한 문제
- 사용자 저항 예상 지점
- 완화 방안

### 6. 실행 권장사항
- 단계별 실행 계획
- 우선순위 제안
- 추가 검토 필요 사항

### 7. 개별 우려사항 분석
- 공통 패턴 식별
- 카테고리별 분류
- 해결 방안 제안

### 8. 상세 통계 데이터
- 응답 분포 테이블
- 고급 기능 사용 현황
- 개별 위험도 점수

## 🔍 데이터베이스 뷰 설명

### 1. gws_survey_summary
전체 응답 통계를 한눈에 볼 수 있는 뷰

**주요 컬럼**:
- `total_responses`: 총 응답 수
- `starter_migration_candidates`: Starter 전환 가능 인원
- `enterprise_retention_needed`: Enterprise 유지 필요 인원

**사용 예시**:
```sql
SELECT * FROM gws_survey_summary;
```

### 2. gws_advanced_features_analysis
고급 기능별 사용률 분석

**주요 컬럼**:
- `feature`: 기능명
- `usage_count`: 사용 인원
- `usage_percentage`: 사용률 (%)

**사용 예시**:
```sql
SELECT * FROM gws_advanced_features_analysis
ORDER BY usage_percentage DESC;
```

### 3. gws_migration_risk_analysis
개별 사용자별 전환 위험도 평가

**주요 컬럼**:
- `user_email`: 사용자 이메일
- `risk_score`: 위험도 점수 (0-100)
- `migration_recommendation`: 전환 권장사항
  - `HIGH_RISK`: 전환 고위험
  - `MEDIUM_RISK`: 전환 중위험
  - `SAFE_TO_MIGRATE`: 전환 안전
  - `REVIEW_NEEDED`: 추가 검토 필요

**위험도 점수 계산 로직**:
- Enterprise 필수: +40점
- 저장공간 자주 부족: +25점
- 100GB+ 파일 사용: +20점
- 고급 기능 다수 사용: +15점

**사용 예시**:
```sql
-- 고위험 사용자 조회
SELECT user_email, risk_score, enterprise_necessity, storage_shortage
FROM gws_migration_risk_analysis
WHERE migration_recommendation = 'HIGH_RISK'
ORDER BY risk_score DESC;

-- 안전하게 전환 가능한 사용자
SELECT user_email, risk_score
FROM gws_migration_risk_analysis
WHERE migration_recommendation = 'SAFE_TO_MIGRATE'
ORDER BY user_email;
```

### 4. gws_llm_analysis_input
LLM 분석을 위한 자연어 형태의 응답 데이터

**주요 컬럼**:
- `user_email`: 사용자 이메일
- `natural_language_response`: 자연어로 변환된 응답

**형식 예시**:
```
응답자: user@treenod.com
제출일: 2025-01-13 14:30

[설문 응답]
Q1. 계정 유형 인식: Enterprise 계정임을 알고 있음
Q2. 저장공간 부족 경험: 가끔 부족함
Q3. 고급 기능 사용: 파일 버전 관리 / 기록 복원 기능
Q4. Meet 사용 빈도: 주 2-3회 사용
Q5. 100GB+ 파일: 100GB+ 파일 사용 안함
Q6. Enterprise 필요성: 있으면 좋지만 없어도 괜찮음
Q7. 전환 우려사항: 특이사항 없음
```

## 💡 활용 팁

### 1. 정기 분석
설문 응답이 일정 수준 이상 수집되면 분석 실행:
```bash
# 응답 수 확인
psql -c "SELECT COUNT(*) FROM gws_survey_responses;"

# 30개 이상이면 분석 실행
node scripts/analyze_gws_survey.js
```

### 2. 특정 그룹 분석
SQL 뷰를 활용한 커스텀 분석:
```sql
-- Meet을 많이 쓰는 사람 중 전환 가능한 사람
SELECT user_email, meet_frequency, enterprise_necessity
FROM gws_migration_risk_analysis
WHERE meet_frequency IN ('daily', '2-3times_weekly')
  AND migration_recommendation = 'SAFE_TO_MIGRATE';

-- 저장공간은 괜찮은데 Enterprise가 필요한 사람
SELECT user_email, storage_shortage, advanced_features
FROM gws_migration_risk_analysis
WHERE storage_shortage = 'never'
  AND enterprise_necessity = 'essential';
```

### 3. 비용 계산
```sql
-- 전환 시 예상 월간/연간 절감액
SELECT
  COUNT(*) FILTER (WHERE migration_recommendation = 'SAFE_TO_MIGRATE') as safe_count,
  COUNT(*) FILTER (WHERE migration_recommendation = 'SAFE_TO_MIGRATE') * 20000 as monthly_savings_krw,
  COUNT(*) FILTER (WHERE migration_recommendation = 'SAFE_TO_MIGRATE') * 20000 * 12 as yearly_savings_krw
FROM gws_migration_risk_analysis;
```

## 🔧 커스터마이징

### 위험도 점수 조정
`scripts/alter_gws_survey_table.sql`의 `calculate_migration_safety_score` 함수 수정:

```sql
-- 예: Enterprise 필수의 가중치를 70 → 80으로 변경
WHEN 'essential' THEN 80  -- 기존: 70
```

### GPT 모델 변경
`scripts/analyze_gws_survey.js`에서 모델 변경:

```javascript
model: 'gpt-4o',  // gpt-4, gpt-3.5-turbo 등으로 변경 가능
temperature: 0.3,  // 0-1 사이 값 (낮을수록 일관적)
max_tokens: 3000   // 응답 최대 길이
```

### 프롬프트 수정
`generateComprehensiveReport` 함수의 `prompt` 변수 수정

## 📈 데이터 흐름

```
설문 응답 (GWSSurvey.tsx)
    ↓
Supabase 저장 (gws_survey_responses)
    ↓
메타데이터 + 뷰 생성 (SQL)
    ↓
분석 스크립트 실행 (analyze_gws_survey.js)
    ↓
데이터 수집 (Supabase Views)
    ↓
OpenAI GPT-4 분석
    ↓
Markdown 보고서 생성 (claudedocs/)
```

## ⚠️ 주의사항

### OpenAI API 비용
- GPT-4o 사용 시 응답당 약 $0.01-0.05
- 월 예산 설정 권장: https://platform.openai.com/account/billing/limits

### 데이터 프라이버시
- 개인 식별 정보가 OpenAI에 전송됨
- 민감한 우려사항은 마스킹 처리 고려
- OpenAI의 데이터 처리 정책 확인 필요

### API 키 보안
- `.env.local` 파일을 git에 커밋하지 마세요
- 환경 변수로 관리하거나 비밀 관리 시스템 사용

## 🐛 문제 해결

### 1. "OPENAI_API_KEY가 설정되지 않았습니다"
```bash
# .env.local 파일 확인
cat .env.local | grep OPENAI_API_KEY

# 없으면 추가
echo "OPENAI_API_KEY=sk-proj-..." >> .env.local
```

### 2. "응답 데이터가 없습니다"
```sql
-- Supabase에서 데이터 확인
SELECT COUNT(*) FROM gws_survey_responses;

-- 없으면 테스트 데이터 입력 또는 설문 응답 수집
```

### 3. "뷰를 찾을 수 없습니다"
```sql
-- SQL 마이그레이션 재실행
-- scripts/alter_gws_survey_table.sql 전체 실행
```

### 4. OpenAI API 에러
```bash
# API 키 유효성 확인
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# 429 에러: Rate limit 초과 - 잠시 후 재시도
# 401 에러: 유효하지 않은 API 키
# 500 에러: OpenAI 서버 문제 - 나중에 재시도
```

## 📞 지원

문제 발생 시:
1. 에러 메시지 전체 복사
2. 실행 환경 확인 (Node 버전, OS 등)
3. 개발팀에 문의

---

**작성일**: 2025-01-13
**버전**: 1.0.0
**문의**: 개발팀
