# Supabase 설정 가이드

## 1. 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가하세요:

```env
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

Supabase 프로젝트 설정에서 이 값들을 찾을 수 있습니다:
- Project Settings > API > Project URL
- Project Settings > API > anon/public key
- Project Settings > API > service_role key (관리자 작업용)

## 2. 테이블 생성

Supabase Dashboard의 SQL Editor에서 `create_tables.sql` 파일의 내용을 실행하세요.

또는:

```bash
# Supabase CLI 사용
supabase db push
```

## 3. 데이터 삽입

환경 변수를 설정한 후, 다음 명령어를 실행하세요:

```bash
node scripts/setup_supabase_tables.js
```

이 스크립트는:
- GWS_Enterprise.csv에서 88명의 사용자 데이터를 읽어 `gws_assignments` 테이블에 삽입
- licenses.csv에서 59건의 라이선스 할당 데이터를 읽어 `software_assignments` 테이블에 삽입
- Jetbrain All Products Pack 사용자 13명을 특별 처리

## 4. 데이터 확인

Supabase Dashboard의 Table Editor에서 다음을 확인하세요:

### gws_assignments 테이블
- 총 88개의 레코드
- 각 레코드는 이메일과 활성 상태를 포함

### software_assignments 테이블
- 총 59개의 레코드
- 카테고리별:
  - Jetbrain: 33건 (All Products Pack 13명 포함)
  - Autodesk: 9건
  - Shutterstock: 4건
  - spine: 13건

## 5. Row Level Security (RLS)

테이블에 RLS가 활성화되어 있습니다:
- 사용자는 자신의 할당 정보만 조회 가능
- 사용자는 자신의 설문 응답만 작성 및 조회 가능
- Service role(관리자)은 모든 데이터에 접근 가능

## 트러블슈팅

### 환경 변수가 로드되지 않는 경우
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 개발 서버를 재시작 (`npm start`)

### 테이블 생성 실패
- Supabase 프로젝트가 활성화되어 있는지 확인
- SQL Editor에서 직접 실행해보세요

### 데이터 삽입 실패
- `SUPABASE_SERVICE_KEY`가 올바르게 설정되었는지 확인
- CSV 파일이 프로젝트 루트에 있는지 확인
