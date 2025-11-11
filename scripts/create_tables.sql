-- GWS Enterprise 사용자 할당 테이블
CREATE TABLE IF NOT EXISTS gws_assignments (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gws_email ON gws_assignments(email);
CREATE INDEX IF NOT EXISTS idx_gws_active ON gws_assignments(is_active);

-- 소프트웨어 라이선스 할당 테이블
CREATE TABLE IF NOT EXISTS software_assignments (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  category TEXT NOT NULL,
  product TEXT NOT NULL,
  is_all_products_pack BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_software_email ON software_assignments(user_email);
CREATE INDEX IF NOT EXISTS idx_software_category ON software_assignments(category);
CREATE INDEX IF NOT EXISTS idx_software_active ON software_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_software_all_pack ON software_assignments(is_all_products_pack);

-- GWS 설문 응답 테이블
CREATE TABLE IF NOT EXISTS gws_survey_responses (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  department TEXT,
  nickname TEXT,
  usage_frequency TEXT,
  features_used TEXT[],
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 10),
  additional_comments TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gws_response_email ON gws_survey_responses(user_email);
CREATE INDEX IF NOT EXISTS idx_gws_response_date ON gws_survey_responses(submitted_at);

-- 소프트웨어 설문 응답 테이블
CREATE TABLE IF NOT EXISTS software_survey_responses (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  category_responses JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_software_response_email ON software_survey_responses(user_email);
CREATE INDEX IF NOT EXISTS idx_software_response_date ON software_survey_responses(submitted_at);

-- Row Level Security (RLS) 활성화
ALTER TABLE gws_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gws_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_survey_responses ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 할당 정보만 조회 가능
CREATE POLICY "Users can view their own GWS assignments"
  ON gws_assignments FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can view their own software assignments"
  ON software_assignments FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

-- RLS 정책: 사용자는 자신의 응답 삽입 가능
CREATE POLICY "Users can insert their own GWS responses"
  ON gws_survey_responses FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can view their own GWS responses"
  ON gws_survey_responses FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert their own software responses"
  ON software_survey_responses FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can view their own software responses"
  ON software_survey_responses FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

-- 서비스 역할은 모든 데이터에 접근 가능 (관리자용)
CREATE POLICY "Service role can manage all GWS assignments"
  ON gws_assignments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all software assignments"
  ON software_assignments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
