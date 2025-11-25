# ngrok을 통한 로컬 LLM 연결 가이드

## 🎯 왜 ngrok이 필요한가?

**문제:**
- Supabase Edge Function은 **클라우드**에서 실행됩니다
- 로컬 LLM은 `192.168.219.109:8000` (로컬 네트워크)에 있습니다
- 클라우드에서 로컬 네트워크에 직접 접근 불가 ❌

**해결:**
- ngrok이 **공개 터널**을 생성합니다
- `https://abc123.ngrok.io` → `localhost:8000`
- 클라우드에서 공개 URL로 로컬 서버 접근 가능 ✅

---

## 📋 전체 설정 순서

### 1단계: LLM 서버 실행 확인 (LLM 서버 PC)

```bash
# 포트 8000이 열려있는지 확인
netstat -ano | findstr :8000

# 로컬에서 테스트
curl http://localhost:8000/v1/models
```

### 2단계: ngrok 설치 및 실행 (LLM 서버 PC)

**ngrok 설치:**
1. https://ngrok.com/download 접속
2. 운영체제에 맞는 버전 다운로드
3. 압축 해제 후 실행

**ngrok 실행:**
```bash
# 포트 8000을 외부에 노출
ngrok http 8000
```

**실행 결과:**
```
ngrok

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        Asia Pacific (ap)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123xyz.ngrok.io -> http://localhost:8000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**중요**: `https://abc123xyz.ngrok.io` 부분을 복사하세요!

**⚠️ ngrok 창을 닫지 마세요!** 창을 닫으면 터널이 끊어집니다.

### 3단계: ngrok URL 테스트 (개발 PC)

**테스트 스크립트 수정:**

`scripts/test_ngrok_llm.js` 파일을 열어서:

```javascript
// ⚠️ 여기를 수정하세요!
const NGROK_URL = 'https://YOUR_NGROK_URL.ngrok.io'; // ngrok에서 복사한 URL 붙여넣기

// 예시:
const NGROK_URL = 'https://abc123xyz.ngrok.io';
```

**테스트 실행:**

```bash
node scripts/test_ngrok_llm.js
```

**예상 출력 (성공):**
```
✅ 연결 성공!
⏱️  응답 시간: 1234 ms

💬 LLM 응답:
---
안녕하세요! 저는 AI 어시스턴트입니다...
---

✅ 모든 테스트 통과!
✅ ngrok을 통한 LLM 연결이 정상적으로 작동합니다.
```

### 4단계: Supabase 환경 변수 설정

**Supabase CLI 사용:**

```bash
# ngrok URL로 설정 (⚠️ ngrok URL을 실제 URL로 변경하세요!)
npx supabase secrets set USE_LOCAL_LLM=true
npx supabase secrets set LOCAL_LLM_ENDPOINT=https://abc123xyz.ngrok.io/v1
npx supabase secrets set LOCAL_LLM_API_KEY=sk-ZPvn3bYVa7GN3fbol9ctl5CwwMifK5iuRzoFvcsOwcSKl5gkYEgZ_r5_lsAqClIq
npx supabase secrets set LOCAL_LLM_MODEL=qwen2.5-32b
```

**또는 Supabase 대시보드:**

1. https://supabase.com/dashboard/project/adschpldzwzpzxagxzdw/settings/functions
2. **Edge Functions → Environment Variables**
3. 다음 변수 추가:
   - `USE_LOCAL_LLM` = `true`
   - `LOCAL_LLM_ENDPOINT` = `https://abc123xyz.ngrok.io/v1` (⚠️ 실제 ngrok URL 사용)
   - `LOCAL_LLM_API_KEY` = `sk-ZPvn3bYVa7GN3fbol9ctl5CwwMifK5iuRzoFvcsOwcSKl5gkYEgZ_r5_lsAqClIq`
   - `LOCAL_LLM_MODEL` = `qwen2.5-32b`

### 5단계: Edge Function 재배포

```bash
npx supabase functions deploy software-analyze
```

### 6단계: 대시보드에서 테스트

1. 브라우저에서 대시보드 접속
2. **소프트웨어 LLM 분석** 탭
3. **"다시 분석"** 버튼 클릭
4. 분석 완료 후 하단 "분석 모델" 확인
   - ✅ **qwen2.5-32b** 표시되면 성공!
   - ❌ **gpt-4o** 표시되면 설정 재확인

---

## ⚠️ 중요 사항

### ngrok URL은 변경됩니다!

**무료 ngrok:**
- ngrok을 재시작할 때마다 URL이 바뀝니다
- 예: `https://abc123.ngrok.io` → `https://xyz789.ngrok.io`
- **해결**: URL이 바뀔 때마다 Supabase 환경 변수 업데이트 필요

**유료 ngrok (권장):**
- 고정 도메인 사용 가능: `https://your-domain.ngrok.io`
- URL이 바뀌지 않음
- 가격: $8/월 (Basic)

### ngrok을 계속 실행 상태로 유지

**문제:**
- ngrok 창을 닫으면 터널이 끊어짐
- LLM 분석이 실패함

**해결 방법:**

**Windows - 백그라운드 실행:**
```bash
# 새 터미널 창에서 실행
start /B ngrok http 8000

# 또는 서비스로 등록
# ngrok documentation 참고
```

**Linux/Mac - screen 사용:**
```bash
# screen 세션 시작
screen -S ngrok

# ngrok 실행
ngrok http 8000

# Ctrl+A, D로 세션에서 빠져나오기 (백그라운드 실행)

# 다시 연결
screen -r ngrok
```

---

## 💰 비용 비교

### 무료 ngrok

**장점:**
- 비용 없음
- 간단한 테스트에 적합

**단점:**
- URL이 매번 바뀜
- 연결 제한 있음
- 세션 타임아웃

### 유료 ngrok ($8/월)

**장점:**
- 고정 도메인: `https://your-name.ngrok.io`
- 무제한 연결
- 세션 지속

**단점:**
- 월 $8 비용

### 대안: VPS + 포트포워딩

**무료 방법:**
- Oracle Cloud Free Tier VPS (평생 무료)
- VPS에 LLM 서버 설치
- 고정 IP 사용

**복잡도:**
- 설정이 복잡함
- 서버 관리 필요

---

## 🐛 문제 해결

### 문제 1: "Session Status: offline"

**원인:**
- ngrok 계정 인증 안됨

**해결:**
```bash
# ngrok 계정에서 authtoken 가져오기
# https://dashboard.ngrok.com/get-started/your-authtoken

# authtoken 설정
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### 문제 2: "ERR_NGROK_3200"

**원인:**
- 무료 ngrok 연결 제한 초과

**해결:**
- 잠시 대기 후 재시도
- 유료 플랜 고려

### 문제 3: "Tunnel not found"

**원인:**
- ngrok URL이 잘못됨
- ngrok이 종료됨

**해결:**
```bash
# ngrok 상태 확인
# 브라우저에서: http://127.0.0.1:4040

# ngrok 재시작
ngrok http 8000
```

### 문제 4: Supabase에서 여전히 gpt-4o 사용

**원인:**
- 환경 변수 설정 안됨
- Edge Function 재배포 안됨

**확인:**
```bash
# 환경 변수 확인
npx supabase secrets list

# Edge Function 재배포
npx supabase functions deploy software-analyze

# 로그 확인
npx supabase functions logs software-analyze --tail
```

---

## 📊 성능 비교

### 직접 연결 (로컬 네트워크)
- 응답 시간: ~500-1000ms
- 안정성: ⭐⭐⭐⭐⭐
- **하지만 클라우드에서 접근 불가 ❌**

### ngrok 터널
- 응답 시간: ~1000-3000ms (추가 지연)
- 안정성: ⭐⭐⭐⭐ (ngrok 서버 경유)
- **클라우드에서 접근 가능 ✅**

### OpenAI
- 응답 시간: ~2000-5000ms
- 안정성: ⭐⭐⭐⭐⭐
- **비용 발생 💰**

---

## 🎯 권장 사항

### 개발/테스트 단계
- **무료 ngrok** 사용
- URL 변경될 때마다 환경 변수 업데이트

### 프로덕션
- **유료 ngrok** ($8/월) 또는
- **VPS에 LLM 배포** (고정 IP) 또는
- **OpenAI 사용** (안정성 우선)

---

## 📝 체크리스트

- [ ] LLM 서버 실행 중 (`netstat -ano | findstr :8000`)
- [ ] ngrok 실행 중 (`ngrok http 8000`)
- [ ] ngrok URL 복사 (`https://abc123.ngrok.io`)
- [ ] 테스트 스크립트 URL 수정 (`test_ngrok_llm.js`)
- [ ] 테스트 성공 (`node scripts/test_ngrok_llm.js`)
- [ ] Supabase 환경 변수 설정 (`LOCAL_LLM_ENDPOINT`)
- [ ] Edge Function 재배포
- [ ] 대시보드 테스트 (모델: qwen2.5-32b 확인)

---

## 🔗 유용한 링크

- ngrok 다운로드: https://ngrok.com/download
- ngrok 대시보드: https://dashboard.ngrok.com
- Supabase 프로젝트: https://supabase.com/dashboard/project/adschpldzwzpzxagxzdw
- ngrok 문서: https://ngrok.com/docs

---

**ngrok을 사용하면 로컬 LLM을 클라우드에서 사용할 수 있습니다!** 🚀
