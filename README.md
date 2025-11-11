# Software Survey System

소프트웨어 사용 현황 설문 시스템

## 주요 기능

- **Google OAuth 로그인**: 사용자 인증
- **단계별 설문**: 기본 정보 → 소프트웨어 사용 현황 → 추가 의견
- **실시간 대시보드**: 설문 결과 통계 및 분석 (관리자 전용)
- **다크 모드**: 라이트/다크 테마 지원
- **반응형 디자인**: 모바일, 태블릿, 데스크탑 지원

## 기술 스택

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (Database + Authentication)
- **인증**: Google OAuth
- **애니메이션**: Framer Motion
- **아이콘**: Lucide React
- **라우팅**: React Router v6

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행

```bash
npm start
```

브라우저가 자동으로 열리며 http://localhost:3000 에서 앱을 확인할 수 있습니다.

### 4. 프로덕션 빌드

```bash
npm run build
```

## 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── common/         # 공통 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Header.tsx
│   │   └── TreenodLogo.tsx
│   ├── HomePage.tsx    # 홈페이지
│   ├── Login.tsx       # 로그인 페이지
│   ├── Survey.tsx      # 설문 폼
│   └── ProtectedRoute.tsx  # 인증 라우트
├── contexts/           # React Context
│   ├── AuthContext.tsx # 인증 상태 관리
│   └── ThemeContext.tsx # 테마 관리
├── lib/               # 유틸리티
│   ├── supabase.ts    # Supabase 클라이언트 설정
│   ├── utils.ts       # 공통 유틸리티
│   └── userSoftware.ts # 사용자 소프트웨어 관리
└── App.tsx           # 메인 앱 컴포넌트
```

## Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Database에서 필요한 테이블 생성
3. Authentication > Providers > Google 설정

## 관리자 설정

관리자 이메일을 설정하려면 다음 파일을 수정하세요:

- `src/components/HomePage.tsx` - ADMIN_EMAILS 배열
- `src/components/ProtectedRoute.tsx` - ADMIN_EMAILS 배열

## 라이선스

MIT License
