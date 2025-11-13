# Supabase 설정 가이드

## DNS_PROBE_FINISHED_NXDOMAIN 에러 해결

### 1. Supabase 대시보드 접속
https://supabase.com/dashboard/project/adschpldrzwzpzxagxzdw/auth/url-configuration

### 2. URL Configuration 설정

#### Site URL
```
http://localhost:3000
```

#### Redirect URLs (각 줄에 하나씩 추가)
```
http://localhost:3000/**
http://localhost:3000/survey
http://localhost:3000/gws-survey
http://localhost:3000/software-survey
https://ga-software-survey-total.vercel.app/**
https://ga-software-survey-total.vercel.app/survey
https://ga-software-survey-total.vercel.app/gws-survey
https://ga-software-survey-total.vercel.app/software-survey
```

### 3. Google OAuth Provider 설정

#### Google Cloud Console OAuth 클라이언트 정보
**Client ID:**
```
YOUR_GOOGLE_CLIENT_ID_HERE
```

**Client Secret:**
```
YOUR_GOOGLE_CLIENT_SECRET_HERE
```

#### Google Cloud Console 설정 완료 사항
https://console.cloud.google.com/apis/credentials

**✅ Authorized redirect URIs (설정 완료):**
```
https://adschpldrzwzpzxagxzdw.supabase.co/auth/v1/callback
```

**✅ Authorized JavaScript origins (설정 완료):**
```
http://localhost:3000
https://ga-software-survey-total.vercel.app
```

#### Supabase에서 Google Provider 활성화
1. https://supabase.com/dashboard/project/adschpldrzwzpzxagxzdw/auth/providers 접속
2. Google Provider 찾기
3. Enabled 체크
4. 위의 Client ID와 Client Secret 입력
5. 저장

### 4. 저장 후 테스트
- 모든 설정을 저장
- 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
- 페이지 새로고침 (Ctrl+F5)
- "설문 시작하기" 버튼 클릭 테스트

### 5. 문제가 계속되면
- 브라우저 개발자 도구 (F12) → Console 탭에서 에러 확인
- Network 탭에서 실패한 요청 확인
- 해당 정보를 공유해주세요
