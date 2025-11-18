-- ============================================================================
-- 설문 접근 권한 이메일 추가 스크립트
-- 사용법: 아래 VALUES에 추가할 이메일 정보 입력 후 실행
-- ============================================================================

-- 방법 1: 단일 이메일 추가
INSERT INTO public.authorized_emails (email, notes, created_by)
VALUES (
  'your-email@example.com',  -- 🔸 여기에 실제 이메일 주소 입력
  '부서명 또는 직책',         -- 🔸 비고 (선택사항)
  'admin'                      -- 🔸 등록자 정보 (선택사항)
)
ON CONFLICT (email) DO UPDATE SET
  updated_at = NOW(),
  is_active = TRUE;

-- 방법 2: 여러 이메일 한번에 추가
/*
INSERT INTO public.authorized_emails (email, notes, created_by)
VALUES
  ('user1@example.com', '개발팀', 'admin'),
  ('user2@example.com', '기획팀', 'admin'),
  ('user3@example.com', '디자인팀', 'admin')
ON CONFLICT (email) DO UPDATE SET
  updated_at = NOW(),
  is_active = TRUE;
*/

-- ============================================================================
-- 확인용 쿼리
-- ============================================================================

-- 등록된 모든 활성 이메일 확인
SELECT
  email,
  notes,
  created_at,
  created_by,
  is_active
FROM public.authorized_emails
WHERE is_active = true
ORDER BY created_at DESC;

-- ============================================================================
-- 관리 쿼리 예시
-- ============================================================================

-- 특정 이메일 비활성화 (삭제 대신 비활성화 권장)
/*
UPDATE public.authorized_emails
SET is_active = false, updated_at = NOW()
WHERE email = 'user@example.com';
*/

-- 특정 이메일 다시 활성화
/*
UPDATE public.authorized_emails
SET is_active = true, updated_at = NOW()
WHERE email = 'user@example.com';
*/

-- 특정 이메일 완전 삭제 (주의!)
/*
DELETE FROM public.authorized_emails
WHERE email = 'user@example.com';
*/
