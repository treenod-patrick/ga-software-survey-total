-- ============================================================================
-- GWS 2024년 계약 기준 좌석 수 (고정값)
-- ============================================================================

-- 기준값 테이블 생성
CREATE TABLE IF NOT EXISTS gws_license_baseline_2024 (
  id SERIAL PRIMARY KEY,
  domain TEXT NOT NULL,
  edition TEXT NOT NULL,
  seats INTEGER NOT NULL CHECK (seats > 0),
  unit_price_krw INTEGER NOT NULL COMMENT '2024년 계약 단가 (원/석/년)',
  discount_rate DECIMAL(4,2) COMMENT '할인율 (%)',
  pdl_applied BOOLEAN DEFAULT true COMMENT 'PDL 규칙 적용 여부',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(domain, edition)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_gws_baseline_domain ON gws_license_baseline_2024(domain);
CREATE INDEX IF NOT EXISTS idx_gws_baseline_edition ON gws_license_baseline_2024(edition);

-- 메타데이터
COMMENT ON TABLE gws_license_baseline_2024 IS '2024년 GWS 계약 기준 좌석 수 및 단가 (PDL 적용)';
COMMENT ON COLUMN gws_license_baseline_2024.domain IS '도메인 (treenod.com / treetive.com)';
COMMENT ON COLUMN gws_license_baseline_2024.edition IS '에디션 (Business Starter / Business Standard / Enterprise Standard)';
COMMENT ON COLUMN gws_license_baseline_2024.seats IS '계약 좌석 수';
COMMENT ON COLUMN gws_license_baseline_2024.unit_price_krw IS '1석당 연간 단가 (원)';
COMMENT ON COLUMN gws_license_baseline_2024.discount_rate IS '할인율 (%)';
COMMENT ON COLUMN gws_license_baseline_2024.pdl_applied IS 'PDL 대량 구매 할인 적용 여부';

-- 2024년 실제 계약 데이터 삽입
INSERT INTO gws_license_baseline_2024 (domain, edition, seats, unit_price_krw, discount_rate, pdl_applied) VALUES
  ('treenod.com', 'Business Starter', 200, 92457, 10.00, true),
  ('treenod.com', 'Enterprise Standard', 100, 338665, 14.00, true),
  ('treetive.com', 'Business Standard', 19, 184913, 10.00, true)
ON CONFLICT (domain, edition) DO UPDATE SET
  seats = EXCLUDED.seats,
  unit_price_krw = EXCLUDED.unit_price_krw,
  discount_rate = EXCLUDED.discount_rate,
  pdl_applied = EXCLUDED.pdl_applied;

-- 검증 쿼리
DO $$
DECLARE
  total_seats INTEGER;
  total_amount BIGINT;
BEGIN
  SELECT
    SUM(seats),
    SUM(seats * unit_price_krw)
  INTO total_seats, total_amount
  FROM gws_license_baseline_2024;

  RAISE NOTICE '✅ 2024년 기준값 삽입 완료';
  RAISE NOTICE '   총 좌석 수: % 석', total_seats;
  RAISE NOTICE '   총 계약 금액: % 원', total_amount;
  RAISE NOTICE '';
END $$;
