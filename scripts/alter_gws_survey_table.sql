-- ============================================================================
-- GWS Survey Table 수정: Enterprise → Starter 전환 검토 설문
-- LLM 분석 최적화 버전
-- ============================================================================

-- 1. 기존 컬럼 삭제 (데이터 백업 후 실행 권장)
ALTER TABLE gws_survey_responses DROP COLUMN IF EXISTS department;
ALTER TABLE gws_survey_responses DROP COLUMN IF EXISTS nickname;
ALTER TABLE gws_survey_responses DROP COLUMN IF EXISTS usage_frequency;
ALTER TABLE gws_survey_responses DROP COLUMN IF EXISTS satisfaction_rating;

-- 2. 기존 컬럼 이름 변경
ALTER TABLE gws_survey_responses RENAME COLUMN features_used TO advanced_features;
ALTER TABLE gws_survey_responses RENAME COLUMN additional_comments TO migration_concerns;

-- 3. 새 컬럼 추가 (제약조건 포함)
ALTER TABLE gws_survey_responses ADD COLUMN IF NOT EXISTS account_type TEXT
  CHECK (account_type IN ('enterprise', 'starter', 'unknown'));

ALTER TABLE gws_survey_responses ADD COLUMN IF NOT EXISTS storage_shortage TEXT
  CHECK (storage_shortage IN ('frequent', 'sometimes', 'never', 'unknown'));

ALTER TABLE gws_survey_responses ADD COLUMN IF NOT EXISTS meet_frequency TEXT
  CHECK (meet_frequency IN ('daily', '2-3times_weekly', 'weekly_or_less', 'rarely'));

ALTER TABLE gws_survey_responses ADD COLUMN IF NOT EXISTS large_files TEXT
  CHECK (large_files IN ('yes', 'no', 'unknown'));

ALTER TABLE gws_survey_responses ADD COLUMN IF NOT EXISTS enterprise_necessity TEXT
  CHECK (enterprise_necessity IN ('essential', 'nice_to_have', 'not_needed', 'unknown'));

-- 4. 인덱스 재생성 (분석 쿼리 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_gws_account_type ON gws_survey_responses(account_type);
CREATE INDEX IF NOT EXISTS idx_gws_enterprise_necessity ON gws_survey_responses(enterprise_necessity);
CREATE INDEX IF NOT EXISTS idx_gws_storage_shortage ON gws_survey_responses(storage_shortage);
CREATE INDEX IF NOT EXISTS idx_gws_meet_frequency ON gws_survey_responses(meet_frequency);
CREATE INDEX IF NOT EXISTS idx_gws_large_files ON gws_survey_responses(large_files);
CREATE INDEX IF NOT EXISTS idx_gws_submitted_at ON gws_survey_responses(submitted_at);

-- 5. 테이블 및 컬럼 메타데이터 (LLM이 참조할 정보)
COMMENT ON TABLE gws_survey_responses IS 'GWS Enterprise → Starter 전환 검토 설문 응답 테이블';

COMMENT ON COLUMN gws_survey_responses.id IS '응답 고유 ID';
COMMENT ON COLUMN gws_survey_responses.user_email IS '응답자 이메일 주소';

COMMENT ON COLUMN gws_survey_responses.account_type IS
'Q1. 현재 본인이 사용하는 구글 계정 유형을 알고 계신가요?
선택지: enterprise(Enterprise 계정-고급기능포함) | starter(Starter 계정-기본기능만) | unknown(잘 모르겠습니다)';

COMMENT ON COLUMN gws_survey_responses.storage_shortage IS
'Q2. 평소 Google Drive 저장 공간이 부족하다고 느낀 적이 있나요?
선택지: frequent(자주있다-용량경고경험) | sometimes(가끔있다) | never(없다) | unknown(잘모르겠다)';

COMMENT ON COLUMN gws_survey_responses.advanced_features IS
'Q3. 아래 기능 중 최근 3개월 내에 실제 사용한 항목을 모두 선택해주세요 (복수선택)
선택지: [5TB 이상 대용량 저장소 사용, 파일 버전 관리/기록 복원 기능, 고급 보안 설정, 구글 밋 녹화 기능, 외부 사용자와 대용량 파일 공유, 없음/잘 모르겠음]';

COMMENT ON COLUMN gws_survey_responses.meet_frequency IS
'Q4. Google Meet 사용 빈도는 어느 정도인가요?
선택지: daily(매일) | 2-3times_weekly(주2-3회) | weekly_or_less(주1회이하) | rarely(거의사용안함)';

COMMENT ON COLUMN gws_survey_responses.large_files IS
'Q5. Google Drive 내에서 1개 파일 용량이 100GB 이상인 데이터를 다루시나요?
선택지: yes(예) | no(아니요) | unknown(모르겠다)';

COMMENT ON COLUMN gws_survey_responses.enterprise_necessity IS
'Q6. 업무 수행 시 Enterprise 계정의 고급 기능이 꼭 필요하다고 생각하시나요?
선택지: essential(반드시필요-다운그레이드시업무차질) | nice_to_have(있으면좋지만없어도괜찮음) | not_needed(필요없음-Starter전환가능) | unknown(잘모르겠다)';

COMMENT ON COLUMN gws_survey_responses.migration_concerns IS
'Q7. 계정 전환 시 추가 확인이 필요하거나 우려되는 부분이 있다면 자유롭게 적어주세요 (주관식)';

COMMENT ON COLUMN gws_survey_responses.submitted_at IS '설문 제출 일시';

-- ============================================================================
-- 설문 메타데이터 테이블 생성 (LLM 분석용)
-- ============================================================================
CREATE TABLE IF NOT EXISTS gws_survey_metadata (
  id SERIAL PRIMARY KEY,
  survey_version TEXT NOT NULL DEFAULT 'v2_starter_migration',
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- single_choice, multiple_choice, text
  column_name TEXT NOT NULL,
  options JSONB, -- 선택지 목록 및 설명
  analysis_category TEXT, -- 분석 카테고리 (usage, necessity, technical, migration)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 메타데이터 삽입
INSERT INTO gws_survey_metadata (question_id, question_text, question_type, column_name, options, analysis_category) VALUES
('Q1', '현재 본인이 사용하는 구글 계정 유형을 알고 계신가요?', 'single_choice', 'account_type',
 '{"enterprise": "Enterprise 계정(고급 기능 포함)", "starter": "Starter 계정(기본 기능만 사용)", "unknown": "잘 모르겠습니다"}'::jsonb,
 'awareness'),

('Q2', '평소 Google Drive 저장 공간이 부족하다고 느낀 적이 있나요?', 'single_choice', 'storage_shortage',
 '{"frequent": "자주 있다 (용량 경고 또는 업로드 제한 경험)", "sometimes": "가끔 있다", "never": "없다", "unknown": "잘 모르겠다"}'::jsonb,
 'usage'),

('Q3', '아래 기능 중 최근 3개월 내에 실제 사용한 항목을 모두 선택해주세요', 'multiple_choice', 'advanced_features',
 '{"options": ["5TB 이상 대용량 저장소 사용", "파일 버전 관리 / 기록 복원 기능", "고급 보안 설정(2단계 인증 예외, S/MIME, Vault 등)", "구글 밋(Google Meet) 녹화 기능", "외부 사용자와 대용량 파일 공유", "없음 / 잘 모르겠음"]}'::jsonb,
 'features'),

('Q4', 'Google Meet 사용 빈도는 어느 정도인가요?', 'single_choice', 'meet_frequency',
 '{"daily": "매일", "2-3times_weekly": "주 2~3회", "weekly_or_less": "주 1회 이하", "rarely": "거의 사용하지 않음"}'::jsonb,
 'usage'),

('Q5', 'Google Drive 내에서 1개 파일 용량이 100GB 이상인 데이터를 다루시나요?', 'single_choice', 'large_files',
 '{"yes": "예", "no": "아니요", "unknown": "모르겠다"}'::jsonb,
 'technical'),

('Q6', '업무 수행 시 Enterprise 계정의 고급 기능이 꼭 필요하다고 생각하시나요?', 'single_choice', 'enterprise_necessity',
 '{"essential": "반드시 필요하다 (다운그레이드 시 업무 차질 예상)", "nice_to_have": "있으면 좋지만, 없어도 큰 문제는 없다", "not_needed": "필요하지 않다 (Starter로 전환 가능)", "unknown": "잘 모르겠다"}'::jsonb,
 'necessity'),

('Q7', '계정 전환 시 추가 확인이 필요하거나 우려되는 부분이 있다면 자유롭게 적어주세요', 'text', 'migration_concerns',
 NULL,
 'migration')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- LLM 분석을 위한 집계 뷰 생성
-- ============================================================================

-- 1. 전체 응답 통계 뷰
CREATE OR REPLACE VIEW gws_survey_summary AS
SELECT
  COUNT(*) as total_responses,
  COUNT(*) FILTER (WHERE account_type = 'enterprise') as knows_enterprise,
  COUNT(*) FILTER (WHERE account_type = 'starter') as knows_starter,
  COUNT(*) FILTER (WHERE account_type = 'unknown') as unknown_account,

  COUNT(*) FILTER (WHERE storage_shortage = 'frequent') as storage_frequent,
  COUNT(*) FILTER (WHERE storage_shortage = 'sometimes') as storage_sometimes,
  COUNT(*) FILTER (WHERE storage_shortage = 'never') as storage_never,

  COUNT(*) FILTER (WHERE meet_frequency = 'daily') as meet_daily,
  COUNT(*) FILTER (WHERE meet_frequency IN ('daily', '2-3times_weekly')) as meet_frequent,

  COUNT(*) FILTER (WHERE large_files = 'yes') as uses_large_files,

  COUNT(*) FILTER (WHERE enterprise_necessity = 'essential') as necessity_essential,
  COUNT(*) FILTER (WHERE enterprise_necessity = 'nice_to_have') as necessity_nice,
  COUNT(*) FILTER (WHERE enterprise_necessity = 'not_needed') as necessity_not_needed,
  COUNT(*) FILTER (WHERE enterprise_necessity = 'unknown') as necessity_unknown,

  -- Starter 전환 가능 후보자 수
  COUNT(*) FILTER (WHERE
    enterprise_necessity IN ('not_needed', 'nice_to_have')
    AND storage_shortage IN ('never', 'sometimes')
    AND large_files = 'no'
  ) as starter_migration_candidates,

  -- Enterprise 유지 필요자 수
  COUNT(*) FILTER (WHERE
    enterprise_necessity = 'essential'
    OR storage_shortage = 'frequent'
    OR large_files = 'yes'
  ) as enterprise_retention_needed,

  MIN(submitted_at) as first_response_at,
  MAX(submitted_at) as last_response_at
FROM gws_survey_responses;

-- 2. 고급 기능 사용 분석 뷰
CREATE OR REPLACE VIEW gws_advanced_features_analysis AS
WITH feature_counts AS (
  SELECT
    unnest(advanced_features) as feature,
    COUNT(*) as usage_count
  FROM gws_survey_responses
  WHERE advanced_features IS NOT NULL
  GROUP BY unnest(advanced_features)
)
SELECT
  feature,
  usage_count,
  ROUND(100.0 * usage_count / (SELECT COUNT(*) FROM gws_survey_responses), 2) as usage_percentage
FROM feature_counts
ORDER BY usage_count DESC;

-- 3. 전환 위험도 분석 뷰 (각 사용자별 위험도 점수)
CREATE OR REPLACE VIEW gws_migration_risk_analysis AS
SELECT
  user_email,
  account_type,
  enterprise_necessity,
  storage_shortage,
  meet_frequency,
  large_files,
  advanced_features,
  migration_concerns,
  submitted_at,

  -- 위험도 점수 계산 (0-100)
  (
    CASE enterprise_necessity
      WHEN 'essential' THEN 40
      WHEN 'nice_to_have' THEN 20
      WHEN 'not_needed' THEN 0
      WHEN 'unknown' THEN 15
    END +

    CASE storage_shortage
      WHEN 'frequent' THEN 25
      WHEN 'sometimes' THEN 10
      WHEN 'never' THEN 0
      WHEN 'unknown' THEN 5
    END +

    CASE large_files
      WHEN 'yes' THEN 20
      WHEN 'no' THEN 0
      WHEN 'unknown' THEN 10
    END +

    CASE
      WHEN array_length(advanced_features, 1) > 3 THEN 15
      WHEN array_length(advanced_features, 1) BETWEEN 1 AND 3 THEN 7
      ELSE 0
    END
  ) as risk_score,

  -- 전환 가능성 판정
  CASE
    WHEN enterprise_necessity = 'essential' THEN 'HIGH_RISK'
    WHEN storage_shortage = 'frequent' OR large_files = 'yes' THEN 'MEDIUM_RISK'
    WHEN enterprise_necessity = 'not_needed' AND storage_shortage = 'never' THEN 'SAFE_TO_MIGRATE'
    ELSE 'REVIEW_NEEDED'
  END as migration_recommendation

FROM gws_survey_responses
ORDER BY risk_score DESC;

-- 4. LLM 프롬프트용 데이터 뷰 (자연어 형태로 변환)
CREATE OR REPLACE VIEW gws_llm_analysis_input AS
SELECT
  user_email,

  -- 응답을 자연어로 변환
  format(
    E'응답자: %s\n'
    '제출일: %s\n'
    '\n[설문 응답]\n'
    'Q1. 계정 유형 인식: %s\n'
    'Q2. 저장공간 부족 경험: %s\n'
    'Q3. 고급 기능 사용: %s\n'
    'Q4. Meet 사용 빈도: %s\n'
    'Q5. 100GB+ 파일: %s\n'
    'Q6. Enterprise 필요성: %s\n'
    'Q7. 전환 우려사항: %s',

    user_email,
    to_char(submitted_at, 'YYYY-MM-DD HH24:MI'),

    CASE account_type
      WHEN 'enterprise' THEN 'Enterprise 계정임을 알고 있음'
      WHEN 'starter' THEN 'Starter 계정으로 알고 있음'
      WHEN 'unknown' THEN '계정 유형을 모름'
    END,

    CASE storage_shortage
      WHEN 'frequent' THEN '자주 부족함 (용량 경고 경험)'
      WHEN 'sometimes' THEN '가끔 부족함'
      WHEN 'never' THEN '부족한 적 없음'
      WHEN 'unknown' THEN '잘 모르겠음'
    END,

    COALESCE(array_to_string(advanced_features, ', '), '없음'),

    CASE meet_frequency
      WHEN 'daily' THEN '매일 사용'
      WHEN '2-3times_weekly' THEN '주 2-3회 사용'
      WHEN 'weekly_or_less' THEN '주 1회 이하'
      WHEN 'rarely' THEN '거의 사용 안함'
    END,

    CASE large_files
      WHEN 'yes' THEN '100GB+ 파일 사용함'
      WHEN 'no' THEN '100GB+ 파일 사용 안함'
      WHEN 'unknown' THEN '모르겠음'
    END,

    CASE enterprise_necessity
      WHEN 'essential' THEN '반드시 필요함 (전환 시 업무 차질)'
      WHEN 'nice_to_have' THEN '있으면 좋지만 없어도 괜찮음'
      WHEN 'not_needed' THEN '필요 없음 (Starter 전환 가능)'
      WHEN 'unknown' THEN '잘 모르겠음'
    END,

    COALESCE(migration_concerns, '특이사항 없음')
  ) as natural_language_response,

  submitted_at

FROM gws_survey_responses
ORDER BY submitted_at DESC;

-- ============================================================================
-- 분석 헬퍼 함수
-- ============================================================================

-- 전환 권장도 계산 함수
CREATE OR REPLACE FUNCTION calculate_migration_safety_score(
  p_enterprise_necessity TEXT,
  p_storage_shortage TEXT,
  p_large_files TEXT,
  p_advanced_features TEXT[]
) RETURNS INTEGER AS $$
DECLARE
  safety_score INTEGER := 100;
BEGIN
  -- Enterprise 필요성에 따라 점수 차감
  safety_score := safety_score -
    CASE p_enterprise_necessity
      WHEN 'essential' THEN 70
      WHEN 'nice_to_have' THEN 30
      WHEN 'not_needed' THEN 0
      WHEN 'unknown' THEN 20
      ELSE 20
    END;

  -- 저장공간 부족에 따라 점수 차감
  safety_score := safety_score -
    CASE p_storage_shortage
      WHEN 'frequent' THEN 40
      WHEN 'sometimes' THEN 15
      WHEN 'never' THEN 0
      WHEN 'unknown' THEN 10
      ELSE 10
    END;

  -- 대용량 파일 사용에 따라 점수 차감
  safety_score := safety_score -
    CASE p_large_files
      WHEN 'yes' THEN 30
      WHEN 'no' THEN 0
      WHEN 'unknown' THEN 15
      ELSE 15
    END;

  -- 고급 기능 사용 개수에 따라 점수 차감
  IF p_advanced_features IS NOT NULL THEN
    safety_score := safety_score - (array_length(p_advanced_features, 1) * 5);
  END IF;

  -- 0-100 범위로 제한
  RETURN GREATEST(0, LEAST(100, safety_score));
END;
$$ LANGUAGE plpgsql IMMUTABLE;
