# GWS 설문 LLM 분석 시스템 - 완성 요약

**작성일**: 2025-01-13
**목적**: Enterprise 권한 사용자 대상 Starter 전환 검토 설문 및 AI 자동 분석

---

## 🎯 시스템 개요

Google Workspace Enterprise 사용자를 대상으로 Starter 플랜 전환 가능성을 조사하고, OpenAI GPT-4를 활용하여 자동으로 분석 보고서를 생성하는 시스템입니다.

### 핵심 기능
1. ✅ **설문 시스템**: Enterprise 사용자 대상 7개 질문 + 확인 체크박스
2. ✅ **데이터베이스**: LLM 분석 최적화된 구조 (메타데이터, 뷰, 함수)
3. ✅ **자동 분석**: OpenAI GPT-4 기반 종합 보고서 생성
4. ✅ **위험도 평가**: 개별 사용자 전환 위험도 자동 계산
5. ✅ **비용 절감 계산**: 예상 절감액 자동 산출

---

## 📋 설문 구조

### 질문 목록
| 번호 | 질문 | 유형 | DB 컬럼 |
|------|------|------|---------|
| Q1 | 계정 유형 인식 | 단일선택 | `account_type` |
| Q2 | 저장공간 부족 경험 | 단일선택 | `storage_shortage` |
| Q3 | 고급 기능 사용 (최근 3개월) | 복수선택 | `advanced_features` |
| Q4 | Google Meet 사용 빈도 | 단일선택 | `meet_frequency` |
| Q5 | 100GB+ 파일 다루는지 | 단일선택 | `large_files` |
| Q6 | Enterprise 필요성 | 단일선택 | `enterprise_necessity` |
| Q7 | 전환 우려사항 | 주관식 | `migration_concerns` |
| Q8 | 확인 체크박스 | 체크박스 | (제출 조건만) |

### 선택지 값 (표준화)
- **계정 유형**: `enterprise`, `starter`, `unknown`
- **저장공간**: `frequent`, `sometimes`, `never`, `unknown`
- **Meet 빈도**: `daily`, `2-3times_weekly`, `weekly_or_less`, `rarely`
- **대용량 파일**: `yes`, `no`, `unknown`
- **Enterprise 필요성**: `essential`, `nice_to_have`, `not_needed`, `unknown`

---

## 🗄️ 데이터베이스 구조

### 1. 메인 테이블: `gws_survey_responses`
```sql
- id                    -- 응답 ID
- user_email            -- 응답자 이메일
- account_type          -- Q1
- storage_shortage      -- Q2
- advanced_features     -- Q3 (배열)
- meet_frequency        -- Q4
- large_files           -- Q5
- enterprise_necessity  -- Q6
- migration_concerns    -- Q7
- submitted_at          -- 제출 시각
```

**제약조건**: 각 컬럼에 CHECK 제약으로 표준화된 값만 허용

### 2. 메타데이터 테이블: `gws_survey_metadata`
설문 질문, 선택지, 분석 카테고리 정보 저장
- LLM이 설문 구조를 이해하는 데 활용
- 질문 변경 시 히스토리 관리 가능

### 3. 분석 뷰 (4개)

#### `gws_survey_summary`
전체 통계 한눈에 보기
```sql
SELECT
  total_responses,                  -- 총 응답 수
  starter_migration_candidates,     -- Starter 전환 가능 인원
  enterprise_retention_needed,      -- Enterprise 유지 필요 인원
  first_response_at,                -- 첫 응답 시각
  last_response_at                  -- 마지막 응답 시각
FROM gws_survey_summary;
```

#### `gws_advanced_features_analysis`
고급 기능 사용률 분석
```sql
SELECT feature, usage_count, usage_percentage
FROM gws_advanced_features_analysis
ORDER BY usage_percentage DESC;
```

#### `gws_migration_risk_analysis`
개별 사용자 위험도 평가
```sql
SELECT
  user_email,
  risk_score,                       -- 0-100 점수
  migration_recommendation          -- HIGH_RISK, MEDIUM_RISK, SAFE_TO_MIGRATE, REVIEW_NEEDED
FROM gws_migration_risk_analysis
ORDER BY risk_score DESC;
```

**위험도 점수 계산 로직**:
- Enterprise 필수 → +40점
- 저장공간 자주 부족 → +25점
- 100GB+ 파일 사용 → +20점
- 고급 기능 3개 이상 → +15점

#### `gws_llm_analysis_input`
LLM 분석용 자연어 데이터
```sql
SELECT
  user_email,
  natural_language_response         -- "응답자: xxx, Q1: ..., Q2: ..." 형태
FROM gws_llm_analysis_input;
```

### 4. 헬퍼 함수: `calculate_migration_safety_score()`
전환 안전도 점수 계산 (0-100, 높을수록 안전)

---

## 🤖 LLM 분석 시스템

### OpenAI GPT-4 활용
- **모델**: `gpt-4o`
- **Temperature**: 0.3 (일관성 우선)
- **Max Tokens**: 3,000 (종합 분석) / 2,000 (개별 분석)

### 분석 프로세스
1. **데이터 수집**: Supabase 뷰에서 통계/위험도/자연어 데이터 조회
2. **프롬프트 생성**: 메타데이터 + 통계 + 위험도 분석 결과 포함
3. **GPT-4 분석**: 종합 분석 보고서 생성
4. **우려사항 분석**: 주관식 응답 패턴 분석 및 해결 방안 제시
5. **보고서 저장**: Markdown 형식으로 `claudedocs/` 저장

### 생성되는 보고서 구성
1. **핵심 요약**: 3-5줄 요약 + 주요 숫자
2. **주요 발견사항**: 계정 인식도, 사용 패턴, 필요성 분포
3. **Starter 전환 가능성 분석**: 후보자 수, 절감액, 전환 권장 대상
4. **Enterprise 유지 필요 분석**: 유지 필요 인원 및 근거
5. **리스크 및 주의사항**: 발생 가능 문제, 완화 방안
6. **실행 권장사항**: 단계별 계획, 우선순위
7. **개별 우려사항 분석**: 공통 패턴, 카테고리별 분류, 해결책
8. **상세 통계 데이터**: 테이블 형태의 원본 데이터

---

## 🚀 사용 방법

### 1단계: 데이터베이스 마이그레이션
```bash
# Supabase 대시보드 접속
# https://supabase.com/dashboard/project/adschpldzwzpzxagxzdw/editor

# SQL Editor에서 실행
scripts/alter_gws_survey_table.sql
```

**수행 작업**:
- ✅ 기존 컬럼 삭제/변경
- ✅ 새 컬럼 추가 (제약조건 포함)
- ✅ 인덱스 생성 (분석 성능 최적화)
- ✅ 메타데이터 테이블 + 데이터 삽입
- ✅ 분석 뷰 4개 생성
- ✅ 위험도 계산 함수 생성

### 2단계: 패키지 설치
```bash
npm install openai
```

### 3단계: 환경 변수 설정
`.env.local` 파일 확인:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4단계: 설문 응답 수집
사용자들이 `/gws-survey` 페이지에서 설문 응답

### 5단계: 분석 실행
```bash
# 전체 분석 (종합 + 개별 우려사항)
node scripts/analyze_gws_survey.js

# 요약만 (빠른 분석)
node scripts/analyze_gws_survey.js --summary-only

# 출력 파일명 지정
node scripts/analyze_gws_survey.js --output report_20250113.md
```

### 6단계: 보고서 확인
```bash
# 생성된 보고서 열기
claudedocs/gws_analysis_report.md
```

---

## 📊 실전 예시

### 시나리오: 87명 Enterprise 사용자 조사

**설문 결과**:
- 총 응답: 50명
- Starter 전환 가능: 22명 (44%)
- Enterprise 유지 필요: 18명 (36%)
- 추가 검토 필요: 10명 (20%)

**분석 보고서 생성**:
```bash
node scripts/analyze_gws_survey.js
```

**생성된 인사이트**:
1. **비용 절감**: 월 ₩440,000 (연 ₩5,280,000)
2. **전환 권장**: Meet 사용 빈도 낮고, 저장공간 부족 없는 사용자
3. **유지 권장**: 100GB+ 파일 다루거나, Meet 녹화 기능 필수
4. **주요 우려**: 저장공간 축소, 기능 제약

**실행 계획**:
1. 안전 그룹 22명에게 Starter 전환 안내
2. 검토 그룹 10명과 개별 상담
3. 유지 그룹 18명은 현행 유지
4. 3개월 후 재평가

---

## 📁 파일 구조

```
D:\development\Software survey\
├── src\
│   ├── components\
│   │   └── GWSSurvey.tsx                    # 설문 컴포넌트 (수정됨)
│   ├── lib\
│   │   └── gwsData.ts                       # 데이터 레이어 (수정됨)
│   └── types\
│       └── survey.ts                        # 타입 정의
├── scripts\
│   ├── alter_gws_survey_table.sql           # ⭐ DB 마이그레이션 SQL
│   ├── analyze_gws_survey.js                # ⭐ LLM 분석 스크립트
│   ├── README_GWS_MIGRATION.md              # 마이그레이션 가이드
│   └── README_LLM_ANALYSIS.md               # ⭐ LLM 분석 사용법
├── claudedocs\
│   ├── GWS_LLM_ANALYSIS_SYSTEM.md           # 이 문서
│   └── gws_analysis_report.md               # 생성된 분석 보고서 (실행 후)
├── .env.local                               # 환경 변수 (OPENAI_API_KEY 추가됨)
└── package.json                             # openai 패키지 추가됨
```

---

## 🔍 주요 쿼리 예시

### 전환 가능 후보자 조회
```sql
SELECT user_email, enterprise_necessity, storage_shortage, large_files
FROM gws_migration_risk_analysis
WHERE migration_recommendation = 'SAFE_TO_MIGRATE'
ORDER BY user_email;
```

### 고위험 사용자 조회
```sql
SELECT user_email, risk_score, enterprise_necessity, advanced_features
FROM gws_migration_risk_analysis
WHERE migration_recommendation = 'HIGH_RISK'
ORDER BY risk_score DESC
LIMIT 10;
```

### 비용 절감액 계산
```sql
SELECT
  COUNT(*) FILTER (WHERE migration_recommendation = 'SAFE_TO_MIGRATE') as candidates,
  COUNT(*) FILTER (WHERE migration_recommendation = 'SAFE_TO_MIGRATE') * 20000 as monthly_krw,
  COUNT(*) FILTER (WHERE migration_recommendation = 'SAFE_TO_MIGRATE') * 240000 as yearly_krw
FROM gws_migration_risk_analysis;
```

### 고급 기능 의존도 분석
```sql
SELECT feature, usage_count, usage_percentage
FROM gws_advanced_features_analysis
WHERE usage_percentage > 30
ORDER BY usage_percentage DESC;
```

---

## ⚙️ 시스템 장점

### 1. LLM 분석 최적화
- ✅ 메타데이터 테이블로 LLM이 설문 구조 이해
- ✅ 자연어 변환 뷰로 GPT-4 입력 최적화
- ✅ 통계 뷰로 사전 집계 (API 비용 절감)
- ✅ 표준화된 선택지 값 (CHECK 제약)

### 2. 분석 정확도
- ✅ 위험도 점수 알고리즘 (객관적 평가)
- ✅ 4가지 권장 등급 (HIGH_RISK ~ SAFE_TO_MIGRATE)
- ✅ 다중 기준 평가 (필요성 + 사용량 + 기술적 요구)
- ✅ GPT-4의 종합적 인사이트

### 3. 유지보수성
- ✅ 메타데이터로 질문 변경 히스토리 관리
- ✅ 뷰 기반 분석 (테이블 변경 영향 최소화)
- ✅ 함수로 로직 캡슐화
- ✅ 명확한 문서화

### 4. 확장성
- ✅ 다른 설문에도 동일 패턴 적용 가능
- ✅ 분석 로직 커스터마이징 용이
- ✅ 추가 뷰/함수 생성으로 기능 확장
- ✅ GPT 모델 교체 가능

---

## ⚠️ 주의사항

### OpenAI API 비용
- **예상 비용**: 응답 50개 기준 $0.50 ~ $2.00
- **최적화**: `--summary-only` 옵션으로 비용 절감
- **모니터링**: https://platform.openai.com/usage

### 데이터 프라이버시
- 개인 이메일이 OpenAI에 전송됨
- 민감한 우려사항 내용도 분석됨
- 필요 시 익명화 처리 고려

### API 키 보안
- ⚠️ `.env.local` 파일을 git에 커밋하지 마세요
- ⚠️ API 키를 코드에 하드코딩하지 마세요
- ✅ 환경 변수 또는 비밀 관리 시스템 사용

---

## 🎓 학습 포인트

이 시스템을 통해 배울 수 있는 것:

1. **LLM 친화적 데이터 설계**
   - 메타데이터 테이블 활용
   - 자연어 변환 뷰
   - 구조화된 프롬프트

2. **분석 자동화**
   - SQL 뷰를 통한 사전 집계
   - GPT-4 API 활용
   - Markdown 보고서 생성

3. **의사결정 지원**
   - 위험도 점수 알고리즘
   - 다차원 분석
   - 실행 가능한 권장사항

4. **확장 가능한 설계**
   - 메타데이터 기반 구조
   - 뷰/함수 분리
   - 문서화

---

## 📞 다음 단계

### 즉시 실행
1. ✅ `npm install openai`
2. ✅ Supabase에서 `alter_gws_survey_table.sql` 실행
3. ✅ 사용자들에게 설문 안내
4. ⏳ 응답 수집 (30개 이상 권장)
5. ⏳ `node scripts/analyze_gws_survey.js` 실행
6. ⏳ 보고서 검토 및 실행 계획 수립

### 추후 개선
- [ ] 정기 자동 분석 (cron job)
- [ ] 대시보드 시각화
- [ ] 이메일 자동 발송
- [ ] 다국어 지원

---

**시스템 버전**: 1.0.0
**최종 업데이트**: 2025-01-13
**제작**: Claude Code (Anthropic) + Developer
**라이선스**: Internal Use Only

---

**🎉 시스템 구축 완료!**

모든 구성 요소가 LLM 분석을 위해 최적화되었습니다.
설문 응답 수집 후 바로 분석을 실행할 수 있습니다.
