# GWS LLM 분석 대시보드 배포 가이드

## 📋 개요

관리자 대시보드에 GWS 설문 결과를 LLM으로 분석하여 표시하는 기능을 추가했습니다.
- **OpenAI GPT-4o** 기반 구매 전략 분석
- **백엔드 API** 방식으로 안전한 키 관리
- **섹션별 카드 UI**로 구조화된 분석 결과 표시

## 🎯 핵심 기능

### 1. 데이터 구조
- **2024년 기준값**: 계약 확정 좌석 수 (treenod.com/treetive.com)
- **2025년 설문 집계**: 설문 응답 기반 에디션별 희망 좌석 수
- **LLM 분석**: OpenAI GPT-4o가 생성한 구매 전략 보고서

### 2. 분석 내용
1. **단가 및 금액 비교**: 2024 vs 2025 에디션별 좌석 수 및 비용
2. **PDL 규칙 변화**: 할인율 변경에 따른 영향 분석
3. **구매 전략 제안**: 실행 가능한 3~5개 전략

### 3. UI 구성
- 요약 카드 (한 줄 요약 + 주요 지표)
- 좌석 수 비교 차트 (Recharts)
- 섹션별 카드 (단가 비교, PDL 인사이트)
- Accordion 형식 전략 제안
- 원본 Markdown 전체 보기

---

## 🚀 배포 단계

### Phase 1: 데이터베이스 설정

#### 1.1 Supabase SQL Editor에서 SQL 실행

```bash
# 1. 2024년 기준값 테이블 생성
scripts/create_gws_baseline.sql

# 2. 2025년 설문 집계 뷰 생성
scripts/create_gws_2025_aggregation.sql

# 3. LLM 분석 히스토리 테이블 생성
scripts/create_gws_llm_analysis_table.sql
```

#### 1.2 RLS 정책 확인

`gws_llm_analysis_history` 테이블에 RLS가 자동 적용됩니다:
- 관리자만 조회/삽입 가능
- 관리자 이메일: `jonghyun@treenod.com`, `seungam@treenod.com`, `minho03@treenod.com`

---

### Phase 2: Edge Function 배포

#### 2.1 Supabase CLI 설치 (처음만)

```bash
npm install -g supabase
```

#### 2.2 Supabase 프로젝트 연결

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

프로젝트 Ref는 Supabase 대시보드 URL에서 확인:
`https://supabase.com/dashboard/project/<project-ref>`

#### 2.3 환경 변수 설정

Supabase 대시보드에서 환경 변수 설정:
1. **Settings** → **Edge Functions** → **Manage secrets**
2. 다음 변수 추가:
   - `OPENAI_API_KEY`: OpenAI API 키
   - `SUPABASE_URL`: Supabase URL (자동 설정됨)
   - `SUPABASE_SERVICE_KEY`: Service Role Key (자동 설정됨)

#### 2.4 Edge Function 배포

```bash
cd "d:/development/Software survey"
supabase functions deploy gws-analyze
```

배포 성공 시 함수 URL이 표시됩니다:
```
Deployed Function gws-analyze at:
https://<project-ref>.supabase.co/functions/v1/gws-analyze
```

#### 2.5 배포 확인

```bash
# Edge Function 목록 확인
supabase functions list

# 로그 확인
supabase functions logs gws-analyze
```

---

### Phase 3: 프론트엔드 빌드 및 배포

#### 3.1 의존성 패키지 설치 확인

```bash
npm install react-markdown remark-gfm
```

#### 3.2 로컬 테스트

```bash
npm start
```

브라우저에서 확인:
1. 관리자 계정으로 로그인
2. 대시보드 → **GWS LLM 분석** 탭 클릭
3. "분석 시작" 또는 "다시 분석" 버튼 클릭
4. 분석 결과 확인

#### 3.3 프로덕션 빌드

```bash
npm run build
```

#### 3.4 Vercel 배포 (기존 방식)

```bash
vercel --prod
```

또는 Git push 시 자동 배포 (Vercel 연동 설정된 경우)

---

## 🧪 테스트 체크리스트

### 데이터베이스 테스트

```sql
-- 1. 2024년 기준값 확인
SELECT * FROM gws_license_baseline_2024;

-- 예상 결과: 3개 row (Starter 200석, Enterprise 100석, Standard 19석)

-- 2. 2025년 설문 집계 확인
SELECT * FROM gws_2025_edition_aggregation;

-- 예상 결과: 에디션별 희망 좌석 수 집계

-- 3. 사용자별 추천 확인
SELECT user_email, recommended_edition, recommendation_reason
FROM gws_2025_user_recommendations
LIMIT 10;
```

### Edge Function 테스트

```bash
# curl로 직접 호출 (관리자 이메일 필요)
curl -X POST \
  'https://<project-ref>.supabase.co/functions/v1/gws-analyze' \
  -H 'Authorization: Bearer <your-anon-key>' \
  -H 'user-email: jonghyun@treenod.com'
```

### 프론트엔드 테스트

1. **접근 권한 확인**
   - ✅ 관리자만 대시보드 접근 가능
   - ❌ 일반 사용자는 리디렉션

2. **분석 실행 테스트**
   - ✅ "분석 시작" 버튼 클릭 → 로딩 상태 표시
   - ✅ 5-30초 후 분석 결과 표시
   - ✅ 에러 발생 시 에러 메시지 표시

3. **UI 표시 테스트**
   - ✅ 요약 카드에 한 줄 요약 표시
   - ✅ 주요 지표 4개 표시 (2024/2025 좌석, 금액)
   - ✅ 좌석 수 비교 차트 렌더링
   - ✅ 단가 비교 표 Markdown 렌더링
   - ✅ PDL 인사이트 불릿 포인트 표시
   - ✅ 전략 Accordion 동작 (펼치기/접기)
   - ✅ 원본 Markdown 전체 보기 토글

4. **캐싱 테스트**
   - ✅ 페이지 로드 시 최신 분석 결과 자동 로드
   - ✅ "다시 분석" 버튼으로 새 분석 생성
   - ✅ 분석 시각 표시

---

## 🐛 트러블슈팅

### 문제 1: Edge Function 배포 실패

**증상**: `supabase functions deploy` 실패

**해결 방법**:
```bash
# Supabase CLI 최신 버전 확인
supabase --version

# 재로그인
supabase logout
supabase login

# 프로젝트 재연결
supabase link --project-ref <your-project-ref>
```

### 문제 2: OpenAI API 키 오류

**증상**: "OPENAI_API_KEY 환경 변수가 설정되지 않았습니다."

**해결 방법**:
1. Supabase 대시보드 → Settings → Edge Functions → Manage secrets
2. `OPENAI_API_KEY` 확인 및 재설정
3. Edge Function 재배포

### 문제 3: 분석 결과 없음

**증상**: "아직 분석 결과가 없습니다" 메시지 계속 표시

**원인**:
- 설문 응답이 없음
- RLS 정책으로 데이터 조회 불가
- Edge Function 실행 실패

**해결 방법**:
```sql
-- 1. 설문 응답 확인
SELECT COUNT(*) FROM gws_survey_responses;

-- 2. 분석 히스토리 확인
SELECT * FROM gws_llm_analysis_history ORDER BY created_at DESC LIMIT 1;

-- 3. RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'gws_llm_analysis_history';
```

### 문제 4: 차트 렌더링 오류

**증상**: 차트가 표시되지 않음

**해결 방법**:
1. 브라우저 콘솔 확인
2. Recharts 패키지 재설치:
   ```bash
   npm uninstall recharts
   npm install recharts@^3.4.1
   ```

### 문제 5: Markdown 파싱 오류

**증상**: 전략 섹션이 비어있거나 파싱되지 않음

**해결 방법**:
1. 원본 Markdown 확인 (전체 보기 버튼)
2. 프롬프트 형식이 예상과 다를 경우, `src/utils/markdownParser.ts`의 정규식 수정
3. LLM 응답 형식 변경 시 `parseStrategies` 함수 업데이트

---

## 📊 비용 예상

### OpenAI API 비용
- **모델**: GPT-4o
- **예상 토큰 사용량**: 3,000 ~ 5,000 tokens per 분석
- **비용**: 약 $0.05 ~ $0.10 per 분석
- **월간 예상 (20회 분석)**: $1 ~ $2

### Supabase 비용
- **Edge Function 실행**: Free tier 포함 (월 500,000 requests)
- **데이터베이스 저장**: 분석 히스토리 약 50KB per row
- **월간 저장 (20개 분석)**: 약 1MB (무료 범위 내)

---

## 🔒 보안 고려사항

### 1. API 키 보안
- ✅ OpenAI API 키는 백엔드(Edge Function)에만 존재
- ✅ 프론트엔드에서 절대 접근 불가
- ✅ 환경 변수로 관리

### 2. 접근 제어
- ✅ RLS 정책으로 관리자만 분석 결과 조회 가능
- ✅ AdminRoute 컴포넌트로 대시보드 접근 제한
- ✅ Edge Function에서 user-email 헤더 검증 (선택)

### 3. 데이터 보호
- ✅ 설문 응답 개인 정보는 집계 형태로만 LLM에 전달
- ✅ 분석 히스토리에 raw 데이터 저장하지 않음
- ✅ 30일 이상 된 분석 자동 삭제 가능 (cleanup 함수)

---

## 📚 추가 개선 사항

### 단기 (1-2주)
- [ ] 분석 유형 선택 기능 (종합, 전환 중심, 위험 중심, 비용 중심)
- [ ] 분석 히스토리 목록 보기
- [ ] PDF 다운로드 기능

### 중기 (1-2개월)
- [ ] 설문 응답 실시간 업데이트 시 자동 재분석
- [ ] 사용자별 맞춤 분석 (Enterprise 유지 vs 다운그레이드)
- [ ] 비용 시뮬레이션 도구

### 장기 (3개월+)
- [ ] 다른 설문(소프트웨어)에도 LLM 분석 적용
- [ ] 시계열 분석 (월별 비용 추이)
- [ ] AI 챗봇 형식 질의응답

---

## 📞 지원 및 문의

- **기술 문의**: 개발팀 Slack #tech-support
- **버그 리포트**: GitHub Issues
- **기능 제안**: Notion 개선 제안 페이지

---

## ✅ 배포 완료 확인

모든 단계 완료 후 다음 사항 최종 확인:

- [ ] SQL 스크립트 3개 모두 실행 완료
- [ ] Edge Function 배포 성공 및 로그 확인
- [ ] 프론트엔드 빌드 및 배포 완료
- [ ] 관리자 계정으로 대시보드 접근 가능
- [ ] "GWS LLM 분석" 탭에서 분석 실행 및 결과 확인
- [ ] 모든 UI 요소 정상 렌더링
- [ ] 에러 없이 동작

**배포 완료 날짜**: ___________
**배포자**: ___________
**확인자**: ___________
