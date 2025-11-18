-- ============================================================================
-- GWS 2025년 설문 집계 뷰
-- 설문 응답을 기반으로 에디션별 희망 좌석 수 집계
-- ============================================================================

-- 2025년 에디션 선호도 집계 뷰
CREATE OR REPLACE VIEW gws_2025_edition_aggregation AS
WITH edition_preferences AS (
  SELECT
    user_email,

    -- 응답 기반 추천 에디션 로직
    CASE
      -- Enterprise 필수: Enterprise Standard 유지
      WHEN enterprise_necessity = 'essential' THEN 'Enterprise Standard'

      -- 고급 기능 다수 사용 또는 대용량 파일: Enterprise Standard
      WHEN large_files = 'yes'
        OR storage_shortage = 'frequent'
        OR array_length(advanced_features, 1) >= 3 THEN 'Enterprise Standard'

      -- Meet 고빈도 사용자: Business Standard
      WHEN meet_frequency IN ('daily', '2-3times_weekly') THEN 'Business Standard'

      -- 기본 사용자: Business Starter
      WHEN enterprise_necessity IN ('not_needed', 'nice_to_have')
        AND storage_shortage IN ('never', 'sometimes')
        AND large_files = 'no' THEN 'Business Starter'

      -- 기타: Business Standard (중간 플랜)
      ELSE 'Business Standard'
    END as recommended_edition,

    -- 분석용 상세 정보
    enterprise_necessity,
    storage_shortage,
    large_files,
    meet_frequency,
    advanced_features,
    submitted_at

  FROM gws_survey_responses
)
SELECT
  -- 에디션별 좌석 수 집계
  COUNT(*) FILTER (WHERE recommended_edition = 'Business Starter') as starter_seats,
  COUNT(*) FILTER (WHERE recommended_edition = 'Business Standard') as standard_seats,
  COUNT(*) FILTER (WHERE recommended_edition = 'Enterprise Standard') as enterprise_seats,

  -- 전체 응답자 수
  COUNT(*) as total_respondents,

  -- 추가 통계 (LLM 프롬프트용)
  COUNT(*) FILTER (WHERE enterprise_necessity = 'essential') as essential_count,
  COUNT(*) FILTER (WHERE storage_shortage = 'frequent') as storage_shortage_count,
  COUNT(*) FILTER (WHERE large_files = 'yes') as large_files_count,
  COUNT(*) FILTER (WHERE enterprise_necessity IN ('not_needed', 'nice_to_have')) as downgrade_possible_count,
  COUNT(*) FILTER (WHERE meet_frequency IN ('daily', '2-3times_weekly')) as meet_high_frequency_count,

  -- 평균 고급 기능 사용 개수
  ROUND(AVG(array_length(advanced_features, 1))::numeric, 1) as avg_advanced_features_count,

  -- 마지막 응답 시각
  MAX(submitted_at) as last_response_at

FROM edition_preferences;

-- 메타데이터
COMMENT ON VIEW gws_2025_edition_aggregation IS '2025년 GWS 설문 기반 에디션별 희망 좌석 수 집계';

-- ============================================================================
-- 개별 사용자별 추천 에디션 뷰
-- ============================================================================
CREATE OR REPLACE VIEW gws_2025_user_recommendations AS
SELECT
  user_email,

  -- 추천 에디션
  CASE
    WHEN enterprise_necessity = 'essential' THEN 'Enterprise Standard'
    WHEN large_files = 'yes'
      OR storage_shortage = 'frequent'
      OR array_length(advanced_features, 1) >= 3 THEN 'Enterprise Standard'
    WHEN meet_frequency IN ('daily', '2-3times_weekly') THEN 'Business Standard'
    WHEN enterprise_necessity IN ('not_needed', 'nice_to_have')
      AND storage_shortage IN ('never', 'sometimes')
      AND large_files = 'no' THEN 'Business Starter'
    ELSE 'Business Standard'
  END as recommended_edition,

  -- 추천 근거
  CASE
    WHEN enterprise_necessity = 'essential' THEN 'Enterprise 기능 필수'
    WHEN large_files = 'yes' THEN '대용량 파일 사용'
    WHEN storage_shortage = 'frequent' THEN '저장공간 부족 빈번'
    WHEN array_length(advanced_features, 1) >= 3 THEN '고급 기능 다수 사용'
    WHEN meet_frequency IN ('daily', '2-3times_weekly') THEN 'Meet 고빈도 사용'
    WHEN enterprise_necessity IN ('not_needed', 'nice_to_have') THEN 'Enterprise 불필요 응답'
    ELSE '일반 사용 패턴'
  END as recommendation_reason,

  -- 원본 응답 데이터
  account_type,
  enterprise_necessity,
  storage_shortage,
  large_files,
  meet_frequency,
  advanced_features,
  migration_concerns,
  submitted_at

FROM gws_survey_responses
ORDER BY
  CASE recommended_edition
    WHEN 'Enterprise Standard' THEN 1
    WHEN 'Business Standard' THEN 2
    WHEN 'Business Starter' THEN 3
  END,
  user_email;

COMMENT ON VIEW gws_2025_user_recommendations IS '개별 사용자별 추천 에디션 및 근거';

-- ============================================================================
-- 검증 쿼리
-- ============================================================================
DO $$
DECLARE
  starter INTEGER;
  standard INTEGER;
  enterprise INTEGER;
  total INTEGER;
BEGIN
  SELECT
    starter_seats,
    standard_seats,
    enterprise_seats,
    total_respondents
  INTO starter, standard, enterprise, total
  FROM gws_2025_edition_aggregation;

  RAISE NOTICE '✅ 2025년 설문 집계 뷰 생성 완료';
  RAISE NOTICE '';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '📊 2025년 희망 좌석 수 집계';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '  Business Starter:     % 석', starter;
  RAISE NOTICE '  Business Standard:    % 석', standard;
  RAISE NOTICE '  Enterprise Standard:  % 석', enterprise;
  RAISE NOTICE '  ──────────────────────────';
  RAISE NOTICE '  전체:                 % 석', total;
  RAISE NOTICE '';

EXCEPTION
  WHEN others THEN
    RAISE NOTICE '⚠️ 아직 설문 응답이 없습니다.';
    RAISE NOTICE '   설문 제출 후 다시 확인하세요.';
END $$;
