-- software_survey_responses 테이블에 대한 RLS 정책 추가
-- 이 정책은 모든 인증된 사용자가 데이터를 읽을 수 있도록 허용합니다

-- 기존 정책 삭제 (있는 경우)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.software_survey_responses;

-- 새 정책 생성: 인증된 사용자는 모든 데이터 읽기 가능
CREATE POLICY "Enable read access for authenticated users"
ON public.software_survey_responses
FOR SELECT
TO authenticated
USING (true);

-- 또는 더 안전하게: 관리자만 읽기 가능
-- CREATE POLICY "Enable read access for admins only"
-- ON public.software_survey_responses
-- FOR SELECT
-- TO authenticated
-- USING (
--   auth.jwt() ->> 'email' IN (
--     'jonghyun@treenod.com',
--     'admin@treenod.com'
--     -- 관리자 이메일 추가
--   )
-- );
