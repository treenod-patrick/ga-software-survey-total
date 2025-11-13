# GWS 설문 데이터베이스 마이그레이션 가이드

## 📋 개요
기존 GWS Enterprise 사용 현황 조사를 **Enterprise → Starter 전환 검토 설문**으로 변경합니다.

## ⚠️ 주의사항
**이 작업은 기존 설문 응답 데이터를 삭제합니다!**
- 기존 응답이 있다면 반드시 백업 후 진행하세요
- 프로덕션 환경에서는 신중하게 실행하세요

## 🔄 변경 내용

### 삭제되는 컬럼
- `department` (부서)
- `nickname` (닉네임)
- `usage_frequency` (사용 빈도)
- `satisfaction_rating` (만족도)

### 이름 변경되는 컬럼
- `features_used` → `advanced_features` (고급 기능 사용)
- `additional_comments` → `migration_concerns` (전환 우려사항)

### 추가되는 컬럼
- `account_type` - 계정 유형 인식
- `storage_shortage` - 저장공간 부족 경험
- `meet_frequency` - Google Meet 사용 빈도
- `large_files` - 100GB 이상 파일 다루는지
- `enterprise_necessity` - Enterprise 기능 필요성

## 📝 실행 방법

### 방법 1: Supabase 대시보드에서 실행 (권장)

1. **Supabase 대시보드 접속**
   ```
   https://supabase.com/dashboard/project/adschpldrzwzpzxagxzdw/editor
   ```

2. **SQL Editor로 이동**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭

3. **기존 데이터 백업 (선택사항)**
   ```sql
   -- 기존 응답이 있다면 백업
   CREATE TABLE gws_survey_responses_backup AS
   SELECT * FROM gws_survey_responses;
   ```

4. **마이그레이션 SQL 실행**
   - `scripts/alter_gws_survey_table.sql` 파일 내용을 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭

5. **실행 결과 확인**
   ```sql
   -- 테이블 구조 확인
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'gws_survey_responses'
   ORDER BY ordinal_position;
   ```

### 방법 2: 로컬에서 psql 사용

```bash
# 환경변수 설정
export PGPASSWORD="your-database-password"

# SQL 실행
psql -h db.adschpldrzwzpzxagxzdw.supabase.co \
     -U postgres \
     -d postgres \
     -f scripts/alter_gws_survey_table.sql
```

## ✅ 실행 후 확인사항

### 1. 테이블 구조 확인
Supabase 대시보드 → Table Editor → gws_survey_responses 에서 컬럼 확인

예상 컬럼 목록:
- ✅ id
- ✅ user_email
- ✅ account_type
- ✅ storage_shortage
- ✅ advanced_features
- ✅ meet_frequency
- ✅ large_files
- ✅ enterprise_necessity
- ✅ migration_concerns
- ✅ submitted_at

### 2. 애플리케이션 테스트
```bash
# 개발 서버 실행
npm start

# 테스트 계정으로 설문 제출 테스트
# http://localhost:3000/gws-survey
```

### 3. 데이터 확인
```sql
-- 최근 제출된 설문 확인
SELECT * FROM gws_survey_responses
ORDER BY submitted_at DESC
LIMIT 5;
```

## 🔙 롤백 방법

만약 문제가 발생하면 백업에서 복원:

```sql
-- 백업한 경우
DROP TABLE gws_survey_responses;
ALTER TABLE gws_survey_responses_backup
RENAME TO gws_survey_responses;

-- RLS 정책 재적용
ALTER TABLE gws_survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own GWS responses"
  ON gws_survey_responses FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can view their own GWS responses"
  ON gws_survey_responses FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);
```

## 📞 문제 발생 시

1. **에러 메시지 확인**
   - Supabase SQL Editor에서 에러 메시지 복사

2. **로그 확인**
   - 브라우저 개발자 도구 (F12) → Console 탭
   - Network 탭에서 실패한 요청 확인

3. **도움 요청**
   - 에러 메시지와 함께 개발팀에 문의

## 📅 실행 일시 기록

- **마이그레이션 스크립트 생성일**: 2025-01-13
- **실행 예정일**: _________
- **실행자**: _________
- **실행 완료일**: _________

---

**참고 파일**:
- SQL 스크립트: `scripts/alter_gws_survey_table.sql`
- 수정된 컴포넌트: `src/components/GWSSurvey.tsx`
- 수정된 데이터 레이어: `src/lib/gwsData.ts`
