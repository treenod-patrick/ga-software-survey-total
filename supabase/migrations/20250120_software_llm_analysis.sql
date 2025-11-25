-- 소프트웨어 설문 LLM 분석 결과 저장 테이블
CREATE TABLE IF NOT EXISTS software_llm_analysis_history (
  id BIGSERIAL PRIMARY KEY,
  analysis_type TEXT NOT NULL DEFAULT 'comprehensive',

  -- 분석 대상 데이터
  survey_stats JSONB NOT NULL,

  -- LLM 분석 결과
  llm_raw_markdown TEXT NOT NULL,
  summary_one_liner TEXT,

  -- 요약 통계
  total_respondents INTEGER,
  total_software_types INTEGER,
  avg_software_per_user DECIMAL(10, 2),

  -- LLM 메타데이터
  token_usage INTEGER,
  model TEXT DEFAULT 'gpt-4o',

  -- 생성 정보
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- 인덱스 생성
CREATE INDEX idx_software_llm_analysis_created_at ON software_llm_analysis_history(created_at DESC);
CREATE INDEX idx_software_llm_analysis_type ON software_llm_analysis_history(analysis_type);

-- RLS 정책 (관리자만 조회 가능)
ALTER TABLE software_llm_analysis_history ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자만 조회 가능
CREATE POLICY "인증된 사용자만 조회 가능" ON software_llm_analysis_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Service Role은 모든 권한
CREATE POLICY "Service Role 전체 권한" ON software_llm_analysis_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 코멘트 추가
COMMENT ON TABLE software_llm_analysis_history IS '소프트웨어 설문 LLM 분석 결과 히스토리';
COMMENT ON COLUMN software_llm_analysis_history.survey_stats IS '설문 통계 데이터 (JSON)';
COMMENT ON COLUMN software_llm_analysis_history.llm_raw_markdown IS 'LLM이 생성한 원본 마크다운 분석 결과';
COMMENT ON COLUMN software_llm_analysis_history.summary_one_liner IS '한 줄 요약';
