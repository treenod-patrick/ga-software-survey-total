# Supabase 환경 설정

**프로젝트**: Software Survey System
**작성일**: 2025-01-10

> ⚠️ **개발용 설정**: 이 파일은 개발 중 참조용입니다. 프로덕션 배포 시 보안 처리 필요.

---

## 🔑 Supabase 환경 변수

### .env.local 설정값

```env
REACT_APP_SUPABASE_URL=https://adschpldrzwzpzxagxzdw.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkenJ3enB6eGFneHpkdyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzU0ODc5ODM1LCJleHAiOjIwNzA0NTU4MzV9.194t856wAwJ98C9uP09sd7e63EyRb4v33OnL4vCxaoA
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI
```

---

## 📋 키 정보

### Supabase URL
```
https://adschpldrzwzpzxagxzdw.supabase.co
```
- **용도**: Supabase 프로젝트 엔드포인트
- **사용처**: 클라이언트/서버 모두

### Anon Key (Public)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkenJ3enB6eGFneHpkdyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzU0ODc5ODM1LCJleHAiOjIwNzA0NTU4MzV9.194t856wAwJ98C9uP09sd7e63EyRb4v33OnL4vCxaoA
```
- **용도**: 클라이언트 사이드 인증 (브라우저)
- **권한**: 제한된 읽기/쓰기 (RLS 정책 적용)
- **만료**: 2070-04-55 (장기)
- **사용처**: React 앱 (`src/lib/supabase.ts`)

### Service Role Key (Private)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI
```
- **용도**: 서버 사이드 관리 작업
- **권한**: 전체 접근 권한 (RLS 우회)
- **만료**: 2070-04-55 (장기)
- **사용처**: 관리자 스크립트, 백엔드 API

---

## 🔧 사용 방법

### 1. 새로운 환경에서 설정

```bash
# .env.local 파일 생성
cp .env.local.template .env.local

# 아래 내용 복사
cat > .env.local << 'EOF'
REACT_APP_SUPABASE_URL=https://adschpldrzwzpzxagxzdw.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkenJ3enB6eGFneHpkdyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzU0ODc5ODM1LCJleHAiOjIwNzA0NTU4MzV9.194t856wAwJ98C9uP09sd7e63EyRb4v33OnL4vCxaoA
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI
EOF
```

### 2. Node.js 스크립트에서 사용

```javascript
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
```

### 3. React 앱에서 사용

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 🗄️ 데이터베이스 정보

### 프로젝트 ID
```
adschpldrzwzpzxagxzdw
```

### 데이터베이스 지역
```
Northeast Asia (Seoul)
```

### 테이블 목록
1. `gws_assignments` - GWS 사용자 할당 (87명)
2. `software_assignments` - 소프트웨어 라이선스 (59건)
3. `gws_survey_responses` - GWS 설문 응답
4. `software_survey_responses` - 소프트웨어 설문 응답

---

## 🔐 보안 참고사항

### 개발 단계 (현재)
- ✅ .env.local 파일에 키 저장
- ✅ .gitignore에 .env.local 추가됨
- ✅ claudedocs/에 백업용 MD 파일 저장

### 프로덕션 배포 시 (나중에 처리)
- [ ] 환경 변수를 서버 환경에 안전하게 설정
- [ ] Service Role Key는 서버 사이드에만 사용
- [ ] Anon Key는 클라이언트에 노출 가능 (RLS로 보호됨)
- [ ] 키 로테이션 계획 수립
- [ ] 접근 로그 모니터링

---

## 🌐 Supabase 대시보드

### 접속 URL
```
https://supabase.com/dashboard/project/adschpldrzwzpzxagxzdw
```

### 주요 메뉴
- **Table Editor**: 데이터 직접 편집
- **SQL Editor**: SQL 쿼리 실행
- **Database**: 스키마 및 RLS 정책 관리
- **Authentication**: 사용자 인증 관리
- **API**: API 문서 및 키 관리

---

## 📊 API 엔드포인트

### REST API
```
https://adschpldrzwzpzxagxzdw.supabase.co/rest/v1/
```

### Auth API
```
https://adschpldrzwzpzxagxzdw.supabase.co/auth/v1/
```

### Storage API
```
https://adschpldrzwzpzxagxzdw.supabase.co/storage/v1/
```

---

## 🔄 키 재생성 방법 (필요 시)

1. Supabase 대시보드 접속
2. Settings → API 메뉴
3. "Project API keys" 섹션
4. "Generate new anon key" 또는 "Reset service_role key"
5. 새로운 키를 .env.local 및 이 문서에 업데이트

---

**마지막 업데이트**: 2025-01-10
**다음 검토 예정**: 프로덕션 배포 전
