-- ============================================================================
-- GWS Survey Table 안전 마이그레이션
-- 실행 전: 반드시 Supabase 대시보드에서 아래 SQL로 현재 컬럼 확인!
--
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'gws_survey_responses' ORDER BY ordinal_position;
-- ============================================================================

-- ============================================================================
-- STEP 1: 현재 상태 확인 (주석 해제 후 실행해서 확인)
-- ============================================================================
/*
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gws_survey_responses'
ORDER BY ordinal_position;
*/

-- ============================================================================
-- STEP 2: 기존 컬럼 삭제 (있는 경우에만 실행됨)
-- ============================================================================
DO $$
BEGIN
    -- department 컬럼 삭제
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'department'
    ) THEN
        ALTER TABLE gws_survey_responses DROP COLUMN department;
        RAISE NOTICE '✅ department 컬럼 삭제 완료';
    ELSE
        RAISE NOTICE '⏭️  department 컬럼 없음 (건너뜀)';
    END IF;

    -- nickname 컬럼 삭제
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'nickname'
    ) THEN
        ALTER TABLE gws_survey_responses DROP COLUMN nickname;
        RAISE NOTICE '✅ nickname 컬럼 삭제 완료';
    ELSE
        RAISE NOTICE '⏭️  nickname 컬럼 없음 (건너뜀)';
    END IF;

    -- usage_frequency 컬럼 삭제
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'usage_frequency'
    ) THEN
        ALTER TABLE gws_survey_responses DROP COLUMN usage_frequency;
        RAISE NOTICE '✅ usage_frequency 컬럼 삭제 완료';
    ELSE
        RAISE NOTICE '⏭️  usage_frequency 컬럼 없음 (건너뜀)';
    END IF;

    -- satisfaction_rating 컬럼 삭제
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'satisfaction_rating'
    ) THEN
        ALTER TABLE gws_survey_responses DROP COLUMN satisfaction_rating;
        RAISE NOTICE '✅ satisfaction_rating 컬럼 삭제 완료';
    ELSE
        RAISE NOTICE '⏭️  satisfaction_rating 컬럼 없음 (건너뜀)';
    END IF;
END $$;

-- ============================================================================
-- STEP 3: 컬럼 이름 변경
-- ============================================================================
DO $$
BEGIN
    -- features_used → advanced_features
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'features_used'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'advanced_features'
    ) THEN
        ALTER TABLE gws_survey_responses RENAME COLUMN features_used TO advanced_features;
        RAISE NOTICE '✅ features_used → advanced_features 변경 완료';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'advanced_features'
    ) THEN
        RAISE NOTICE '⏭️  advanced_features 이미 존재 (건너뜀)';
    ELSE
        RAISE NOTICE '⚠️  features_used 컬럼이 없습니다 (확인 필요)';
    END IF;

    -- additional_comments → migration_concerns
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'additional_comments'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'migration_concerns'
    ) THEN
        ALTER TABLE gws_survey_responses RENAME COLUMN additional_comments TO migration_concerns;
        RAISE NOTICE '✅ additional_comments → migration_concerns 변경 완료';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'migration_concerns'
    ) THEN
        RAISE NOTICE '⏭️  migration_concerns 이미 존재 (건너뜀)';
    ELSE
        RAISE NOTICE '⚠️  additional_comments 컬럼이 없습니다 (확인 필요)';
    END IF;
END $$;

-- ============================================================================
-- STEP 4: 새 컬럼 추가 (없는 경우에만)
-- ============================================================================

-- account_type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'account_type'
    ) THEN
        ALTER TABLE gws_survey_responses ADD COLUMN account_type TEXT
            CHECK (account_type IN ('enterprise', 'starter', 'unknown'));
        RAISE NOTICE '✅ account_type 컬럼 추가 완료';
    ELSE
        RAISE NOTICE '⏭️  account_type 이미 존재 (건너뜀)';
    END IF;
END $$;

-- storage_shortage
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'storage_shortage'
    ) THEN
        ALTER TABLE gws_survey_responses ADD COLUMN storage_shortage TEXT
            CHECK (storage_shortage IN ('frequent', 'sometimes', 'never', 'unknown'));
        RAISE NOTICE '✅ storage_shortage 컬럼 추가 완료';
    ELSE
        RAISE NOTICE '⏭️  storage_shortage 이미 존재 (건너뜀)';
    END IF;
END $$;

-- meet_frequency
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'meet_frequency'
    ) THEN
        ALTER TABLE gws_survey_responses ADD COLUMN meet_frequency TEXT
            CHECK (meet_frequency IN ('daily', '2-3times_weekly', 'weekly_or_less', 'rarely'));
        RAISE NOTICE '✅ meet_frequency 컬럼 추가 완료';
    ELSE
        RAISE NOTICE '⏭️  meet_frequency 이미 존재 (건너뜀)';
    END IF;
END $$;

-- large_files
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'large_files'
    ) THEN
        ALTER TABLE gws_survey_responses ADD COLUMN large_files TEXT
            CHECK (large_files IN ('yes', 'no', 'unknown'));
        RAISE NOTICE '✅ large_files 컬럼 추가 완료';
    ELSE
        RAISE NOTICE '⏭️  large_files 이미 존재 (건너뜀)';
    END IF;
END $$;

-- enterprise_necessity
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'enterprise_necessity'
    ) THEN
        ALTER TABLE gws_survey_responses ADD COLUMN enterprise_necessity TEXT
            CHECK (enterprise_necessity IN ('essential', 'nice_to_have', 'not_needed', 'unknown'));
        RAISE NOTICE '✅ enterprise_necessity 컬럼 추가 완료';
    ELSE
        RAISE NOTICE '⏭️  enterprise_necessity 이미 존재 (건너뜀)';
    END IF;
END $$;

-- advanced_features가 없으면 직접 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'advanced_features'
    ) THEN
        ALTER TABLE gws_survey_responses ADD COLUMN advanced_features TEXT[];
        RAISE NOTICE '✅ advanced_features 컬럼 추가 완료 (TEXT[] 타입)';
    ELSE
        RAISE NOTICE '⏭️  advanced_features 이미 존재 (건너뜀)';
    END IF;
END $$;

-- migration_concerns가 없으면 직접 생성
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gws_survey_responses' AND column_name = 'migration_concerns'
    ) THEN
        ALTER TABLE gws_survey_responses ADD COLUMN migration_concerns TEXT;
        RAISE NOTICE '✅ migration_concerns 컬럼 추가 완료';
    ELSE
        RAISE NOTICE '⏭️  migration_concerns 이미 존재 (건너뜀)';
    END IF;
END $$;

-- ============================================================================
-- STEP 5: 인덱스 생성 (분석 성능 최적화)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_gws_account_type ON gws_survey_responses(account_type);
CREATE INDEX IF NOT EXISTS idx_gws_enterprise_necessity ON gws_survey_responses(enterprise_necessity);
CREATE INDEX IF NOT EXISTS idx_gws_storage_shortage ON gws_survey_responses(storage_shortage);
CREATE INDEX IF NOT EXISTS idx_gws_meet_frequency ON gws_survey_responses(meet_frequency);
CREATE INDEX IF NOT EXISTS idx_gws_large_files ON gws_survey_responses(large_files);
CREATE INDEX IF NOT EXISTS idx_gws_submitted_at ON gws_survey_responses(submitted_at);

-- ============================================================================
-- STEP 6: 메타데이터 업데이트
-- ============================================================================
COMMENT ON TABLE gws_survey_responses IS 'GWS Enterprise → Starter 전환 검토 설문 응답 테이블';

COMMENT ON COLUMN gws_survey_responses.account_type IS
'Q1. 현재 본인이 사용하는 구글 계정 유형을 알고 계신가요?
선택지: enterprise | starter | unknown';

COMMENT ON COLUMN gws_survey_responses.storage_shortage IS
'Q2. 평소 Google Drive 저장 공간이 부족하다고 느낀 적이 있나요?
선택지: frequent | sometimes | never | unknown';

COMMENT ON COLUMN gws_survey_responses.advanced_features IS
'Q3. 최근 3개월 내에 실제 사용한 고급 기능 (복수선택)';

COMMENT ON COLUMN gws_survey_responses.meet_frequency IS
'Q4. Google Meet 사용 빈도
선택지: daily | 2-3times_weekly | weekly_or_less | rarely';

COMMENT ON COLUMN gws_survey_responses.large_files IS
'Q5. 100GB 이상 파일 사용 여부
선택지: yes | no | unknown';

COMMENT ON COLUMN gws_survey_responses.enterprise_necessity IS
'Q6. Enterprise 계정 필요성
선택지: essential | nice_to_have | not_needed | unknown';

COMMENT ON COLUMN gws_survey_responses.migration_concerns IS
'Q7. 계정 전환 시 우려사항 (주관식)';

-- ============================================================================
-- 완료 메시지
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ GWS 설문 테이블 마이그레이션 완료!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '다음 단계:';
    RAISE NOTICE '1. 아래 SQL로 최종 테이블 구조 확인';
    RAISE NOTICE '   SELECT column_name FROM information_schema.columns';
    RAISE NOTICE '   WHERE table_name = ''gws_survey_responses'' ORDER BY ordinal_position;';
    RAISE NOTICE '';
    RAISE NOTICE '2. 설문 시스템 테스트: http://localhost:3000/gws-survey';
    RAISE NOTICE '';
END $$;
