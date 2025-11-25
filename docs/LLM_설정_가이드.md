# LLM 모델 전환 가이드

## 개요

소프트웨어 LLM 분석 기능은 **OpenAI GPT-4o** 또는 **로컬 LLM (qwen2.5-32b)**을 선택하여 사용할 수 있습니다.

---

## 📋 지원 모델

| 모델 | 엔드포인트 | 특징 |
|------|----------|------|
| **OpenAI GPT-4o** | `https://api.openai.com/v1` | 기본 설정, 고품질 분석, 인터넷 연결 필요 |
| **로컬 LLM (qwen2.5-32b)** | `http://192.168.219.109:8000/v1` | 비용 절감, 로컬 서버 필요, 오프라인 가능 |

---

## ⚙️ 로컬 LLM 사용 설정 방법

### 1단계: 로컬 LLM 서버 확인

먼저 로컬 LLM 서버가 실행 중인지 확인하세요:

```bash
# Windows PowerShell 또는 CMD
ping 192.168.219.109

# 연결 테스트 스크립트 실행
node scripts/test_local_llm.js
```

**예상 출력 (서버 정상):**
```
✅ 연결 성공!
⏱️  응답 시간: 1234 ms
💬 LLM 응답:
---
안녕하세요, 저는 AI 어시스턴트입니다...
---
```

**서버가 꺼져있는 경우:**
```
❌ 테스트 실패: fetch failed
가능한 원인:
- 서버가 실행 중이 아닙니다
- 네트워크 연결 문제
```

### 2단계: Supabase Edge Function 환경 변수 설정

Supabase 대시보드에서 환경 변수를 설정합니다.

**방법 1: Supabase CLI 사용**

```bash
# Supabase CLI 설치 (처음 한 번만)
npm install -g supabase

# 프로젝트 연결
npx supabase login
npx supabase link --project-ref adschpldzwzpzxagxzdw

# 환경 변수 설정
npx supabase secrets set USE_LOCAL_LLM=true
npx supabase secrets set LOCAL_LLM_ENDPOINT=http://192.168.219.109:8000/v1
npx supabase secrets set LOCAL_LLM_API_KEY=sk-ZPvn3bYVa7GN3fbol9ctl5CwwMifK5iuRzoFvcsOwcSKl5gkYEgZ_r5_lsAqClIq
npx supabase secrets set LOCAL_LLM_MODEL=qwen2.5-32b
```

**방법 2: Supabase 웹 대시보드 사용**

1. [Supabase 대시보드](https://supabase.com/dashboard/project/adschpldzwzpzxagxzdw/settings/functions) 접속
2. **Settings → Edge Functions → Environment Variables** 메뉴
3. 다음 변수 추가:
   - `USE_LOCAL_LLM` = `true`
   - `LOCAL_LLM_ENDPOINT` = `http://192.168.219.109:8000/v1`
   - `LOCAL_LLM_API_KEY` = `sk-ZPvn3bYVa7GN3fbol9ctl5CwwMifK5iuRzoFvcsOwcSKl5gkYEgZ_r5_lsAqClIq`
   - `LOCAL_LLM_MODEL` = `qwen2.5-32b`

### 3단계: Edge Function 재배포

환경 변수 설정 후 Edge Function을 재배포합니다:

```bash
# 로컬에서 재배포
npx supabase functions deploy software-analyze
```

**예상 출력:**
```
✅ Deployed Function software-analyze on project adschpldzwzpzxagxzdw
```

### 4단계: 동작 확인

1. 브라우저에서 대시보드 접속
2. **소프트웨어 LLM 분석** 탭으로 이동
3. **"다시 분석"** 버튼 클릭
4. 분석 완료 후 "분석 모델" 확인:
   - 로컬 LLM 사용: **qwen2.5-32b** 표시
   - OpenAI 사용: **gpt-4o** 표시

---

## 🔄 OpenAI로 다시 전환

로컬 LLM에서 OpenAI로 다시 전환하려면:

```bash
# 로컬 LLM 비활성화
npx supabase secrets set USE_LOCAL_LLM=false

# Edge Function 재배포
npx supabase functions deploy software-analyze
```

또는 Supabase 대시보드에서:
- `USE_LOCAL_LLM` 값을 `false`로 변경
- Edge Function 재배포

---

## 🐛 문제 해결

### 문제 1: "fetch failed" 에러

**원인:**
- 로컬 LLM 서버가 실행 중이 아님
- 네트워크 연결 문제
- 방화벽 차단

**해결 방법:**
```bash
# 1. IP 연결 확인
ping 192.168.219.109

# 2. 포트 확인 (8000번 포트 열려있는지)
netstat -an | findstr 8000

# 3. 서버 프로세스 확인
# (서버 관리자에게 문의)
```

### 문제 2: "JSON 파싱 실패" 에러

**원인:**
- 로컬 LLM이 JSON 형식을 정확히 반환하지 못함
- 프롬프트 튜닝 필요

**해결 방법:**
1. Edge Function 로그 확인:
   ```bash
   npx supabase functions logs software-analyze
   ```
2. 로그에서 "JSON 파싱 실패:" 부분 확인
3. 필요시 OpenAI로 전환

### 문제 3: 분석 속도가 너무 느림

**원인:**
- 로컬 LLM 서버의 성능 문제
- 네트워크 지연

**비교 (예상):**
- OpenAI GPT-4o: 10-30초
- 로컬 LLM qwen2.5-32b: 30-60초 (서버 성능에 따라 다름)

**해결 방법:**
- 더 나은 성능이 필요하면 OpenAI 사용
- 로컬 LLM 서버 성능 업그레이드

---

## 💡 추가 설정 옵션

### 커스텀 엔드포인트 사용

다른 로컬 LLM 서버를 사용하려면:

```bash
# 예: 다른 IP 주소 사용
npx supabase secrets set LOCAL_LLM_ENDPOINT=http://192.168.1.100:8000/v1

# 예: 다른 모델 사용
npx supabase secrets set LOCAL_LLM_MODEL=llama-3-70b
```

### 타임아웃 조정

느린 서버의 경우 Edge Function 코드에서 타임아웃을 조정할 수 있습니다.

---

## 📊 비용 비교

| 항목 | OpenAI GPT-4o | 로컬 LLM |
|------|--------------|----------|
| 초기 비용 | $0 | 서버 구축 비용 |
| 분석당 비용 | ~$0.02-0.05 | ~$0 |
| 월 100회 분석 | ~$2-5 | ~$0 |
| 연간 비용 | ~$24-60 | 서버 유지비 |

**권장 사항:**
- **소규모/테스트**: OpenAI 사용 (간편함)
- **대규모/반복**: 로컬 LLM 사용 (비용 절감)

---

## 📝 환경 변수 전체 목록

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `USE_LOCAL_LLM` | `false` | `true`로 설정 시 로컬 LLM 사용 |
| `LOCAL_LLM_ENDPOINT` | `http://192.168.219.109:8000/v1` | 로컬 LLM API 엔드포인트 |
| `LOCAL_LLM_API_KEY` | (기본값 있음) | 로컬 LLM API 키 |
| `LOCAL_LLM_MODEL` | `qwen2.5-32b` | 사용할 로컬 모델명 |
| `OPENAI_API_KEY` | (필수, 환경변수 설정 필요) | OpenAI API 키 (OpenAI 사용 시) |

---

## 🎯 현재 상태

**현재 설정:**
- ✅ 코드 수정 완료 (로컬 LLM 지원 추가됨)
- ⚠️ 로컬 LLM 서버 연결 불가 (현재 `192.168.219.109:8000` 서버가 꺼져있음)
- ✅ OpenAI GPT-4o는 정상 작동 (기본값)

**다음 단계:**
1. 로컬 LLM 서버 실행 확인
2. Supabase 환경 변수 설정 (`USE_LOCAL_LLM=true`)
3. Edge Function 재배포
4. 대시보드에서 테스트

---

## 📞 문의

문제가 해결되지 않으면:
1. Supabase Edge Function 로그 확인: `npx supabase functions logs software-analyze`
2. 로컬 LLM 서버 관리자에게 서버 상태 확인 요청
3. 필요시 OpenAI로 폴백 사용
