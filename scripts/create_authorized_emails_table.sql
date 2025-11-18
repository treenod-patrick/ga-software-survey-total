-- ============================================================================
-- 설문 접근 권한 관리 테이블 생성
-- 용도: /software-survey 페이지 접근 허용 이메일 관리
-- ============================================================================

-- STEP 1: authorized_emails 테이블 생성
CREATE TABLE IF NOT EXISTS public.authorized_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_by TEXT,

  -- 제약조건: 이메일 형식 검증
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- STEP 2: 인덱스 생성 (빠른 조회를 위해)
CREATE INDEX IF NOT EXISTS idx_authorized_emails_email ON public.authorized_emails(email);
CREATE INDEX IF NOT EXISTS idx_authorized_emails_is_active ON public.authorized_emails(is_active);

-- STEP 3: RLS (Row Level Security) 정책 설정
ALTER TABLE public.authorized_emails ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자가 조회 가능 (자신의 권한 확인용)
CREATE POLICY "Anyone can view authorized emails"
  ON public.authorized_emails
  FOR SELECT
  TO authenticated
  USING (true);

-- 관리자만 추가/수정/삭제 가능 (서비스 키 사용)
CREATE POLICY "Service role can manage authorized emails"
  ON public.authorized_emails
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- STEP 4: 테이블 설명 추가
COMMENT ON TABLE public.authorized_emails IS '설문 시스템 접근 권한 관리 테이블';
COMMENT ON COLUMN public.authorized_emails.email IS '접근 허용 이메일 주소';
COMMENT ON COLUMN public.authorized_emails.is_active IS '활성화 상태 (false면 접근 차단)';
COMMENT ON COLUMN public.authorized_emails.notes IS '비고 (부서, 직책 등)';
COMMENT ON COLUMN public.authorized_emails.created_by IS '등록자 정보';

-- STEP 5: 샘플 데이터 삽입 (실제 사용할 이메일로 변경 필요)
INSERT INTO public.authorized_emails (email, notes, created_by)
VALUES
  ('admin@example.com', '시스템 관리자', 'system')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 완료 메시지
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ authorized_emails 테이블 생성 완료!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '📋 다음 단계:';
  RAISE NOTICE '1. 아래 SQL로 이메일 추가:';
  RAISE NOTICE '   INSERT INTO authorized_emails (email, notes)';
  RAISE NOTICE '   VALUES (''user@example.com'', ''부서명/직책'');';
  RAISE NOTICE '';
  RAISE NOTICE '2. ProtectedRoute 컴포넌트 수정하여 이 테이블 체크하도록 변경';
  RAISE NOTICE '';
  RAISE NOTICE '3. 현재 등록된 이메일 확인:';
  RAISE NOTICE '   SELECT * FROM authorized_emails WHERE is_active = true;';
  RAISE NOTICE '';
END $$;
