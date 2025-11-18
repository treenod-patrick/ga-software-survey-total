-- ============================================================================
-- GWS LLM 분석 히스토리 테이블
-- OpenAI GPT 분석 결과 저장 및 캐싱
-- ============================================================================

-- 분석 히스토리 테이블 생성
CREATE TABLE IF NOT EXISTS gws_llm_analysis_history (
  id SERIAL PRIMARY KEY,

  -- 분석 유형
  analysis_type TEXT DEFAULT 'comprehensive' CHECK (analysis_type IN ('comprehensive', 'migration-focus', 'risk-focus', 'cost-focus')),

  -- 원본 데이터 스냅샷
  baseline_2024 JSONB NOT NULL COMMENT '2024년 기준값 (계약 데이터)',
  survey_2025 JSONB NOT NULL COMMENT '2025년 설문 집계 결과',

  -- LLM 응답
  llm_raw_markdown TEXT NOT NULL COMMENT 'LLM 생성 원본 Markdown',
  llm_structured JSONB COMMENT '섹션별 파싱된 구조화 데이터',

  -- 분석 요약 (빠른 조회용)
  summary_one_liner TEXT COMMENT '한 줄 핵심 요약',
  total_seats_2024 INTEGER,
  total_seats_2025 INTEGER,
  total_amount_2024 BIGINT COMMENT '2024년 총 금액 (원)',
  total_amount_2025 BIGINT COMMENT '2025년 총 금액 (원)',
  cost_difference BIGINT COMMENT '비용 차이 (원)',
  cost_difference_percent DECIMAL(5,2) COMMENT '비용 차이율 (%)',

  -- 메타데이터
  created_by TEXT COMMENT '분석 요청자 이메일',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  token_usage INTEGER COMMENT 'OpenAI API 토큰 사용량',
  model TEXT DEFAULT 'gpt-4o' COMMENT '사용된 LLM 모델',
  execution_time_ms INTEGER COMMENT '분석 소요 시간 (밀리초)'
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_gws_llm_created_at ON gws_llm_analysis_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gws_llm_created_by ON gws_llm_analysis_history(created_by);
CREATE INDEX IF NOT EXISTS idx_gws_llm_analysis_type ON gws_llm_analysis_history(analysis_type);

-- 메타데이터
COMMENT ON TABLE gws_llm_analysis_history IS 'GWS 구매 전략 LLM 분석 히스토리 및 캐시';
COMMENT ON COLUMN gws_llm_analysis_history.analysis_type IS '분석 유형 (comprehensive, migration-focus, risk-focus, cost-focus)';
COMMENT ON COLUMN gws_llm_analysis_history.baseline_2024 IS '2024년 계약 기준 데이터 스냅샷';
COMMENT ON COLUMN gws_llm_analysis_history.survey_2025 IS '2025년 설문 집계 결과 스냅샷';
COMMENT ON COLUMN gws_llm_analysis_history.llm_raw_markdown IS 'LLM이 생성한 원본 Markdown 분석 보고서';
COMMENT ON COLUMN gws_llm_analysis_history.llm_structured IS '파싱된 구조화 데이터 (sections, tables, strategies)';
COMMENT ON COLUMN gws_llm_analysis_history.summary_one_liner IS '한 줄 핵심 요약 (대시보드 표시용)';

-- ============================================================================
-- 최신 분석 결과 조회 함수
-- ============================================================================
CREATE OR REPLACE FUNCTION get_latest_gws_analysis(
  p_analysis_type TEXT DEFAULT 'comprehensive'
)
RETURNS TABLE (
  id INTEGER,
  analysis_type TEXT,
  summary_one_liner TEXT,
  llm_raw_markdown TEXT,
  llm_structured JSONB,
  baseline_2024 JSONB,
  survey_2025 JSONB,
  total_seats_2024 INTEGER,
  total_seats_2025 INTEGER,
  total_amount_2024 BIGINT,
  total_amount_2025 BIGINT,
  cost_difference BIGINT,
  cost_difference_percent DECIMAL(5,2),
  created_by TEXT,
  created_at TIMESTAMPTZ,
  token_usage INTEGER,
  model TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    h.id,
    h.analysis_type,
    h.summary_one_liner,
    h.llm_raw_markdown,
    h.llm_structured,
    h.baseline_2024,
    h.survey_2025,
    h.total_seats_2024,
    h.total_seats_2025,
    h.total_amount_2024,
    h.total_amount_2025,
    h.cost_difference,
    h.cost_difference_percent,
    h.created_by,
    h.created_at,
    h.token_usage,
    h.model
  FROM gws_llm_analysis_history h
  WHERE h.analysis_type = p_analysis_type
  ORDER BY h.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_latest_gws_analysis IS '최신 GWS 분석 결과 조회 (분석 유형별)';

-- ============================================================================
-- 분석 히스토리 정리 함수 (30일 이상 된 데이터 삭제)
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_old_gws_analysis(
  p_retention_days INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM gws_llm_analysis_history
    WHERE created_at < NOW() - INTERVAL '1 day' * p_retention_days
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_gws_analysis IS '오래된 분석 히스토리 정리 (기본 30일)';

-- ============================================================================
-- Row Level Security (RLS) 설정
-- ============================================================================

-- RLS 활성화
ALTER TABLE gws_llm_analysis_history ENABLE ROW LEVEL SECURITY;

-- 관리자만 조회 가능한 정책 (AdminRoute.tsx와 동일한 이메일)
CREATE POLICY gws_llm_analysis_admin_read ON gws_llm_analysis_history
  FOR SELECT
  USING (
    auth.email() IN (
      'jonghyun@treenod.com',
      'seungam@treenod.com',
      'minho03@treenod.com'
    )
  );

-- 관리자만 삽입 가능한 정책
CREATE POLICY gws_llm_analysis_admin_insert ON gws_llm_analysis_history
  FOR INSERT
  WITH CHECK (
    auth.email() IN (
      'jonghyun@treenod.com',
      'seungam@treenod.com',
      'minho03@treenod.com'
    )
  );

-- ============================================================================
-- 테스트 및 검증
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ GWS LLM 분석 히스토리 테이블 생성 완료';
  RAISE NOTICE '';
  RAISE NOTICE '사용 가능한 함수:';
  RAISE NOTICE '  - get_latest_gws_analysis(): 최신 분석 결과 조회';
  RAISE NOTICE '  - cleanup_old_gws_analysis(30): 30일 이상 된 분석 삭제';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS 정책: 관리자만 조회/삽입 가능';
  RAISE NOTICE '';
END $$;
