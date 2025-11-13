-- ============================================================================
-- GWS Survey Table 수정: Enterprise → Starter 전환 검토 설문
-- 현재 테이블 구조 기반 안전 마이그레이션
-- ============================================================================


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


-- 4. 인덱스 생성 (분석 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_gws_account_type ON gws_survey_responses(account_type);
CREATE INDEX IF NOT EXISTS idx_gws_enterprise_necessity ON gws_survey_responses(enterprise_necessity);
CREATE INDEX IF NOT EXISTS idx_gws_storage_shortage ON gws_survey_responses(storage_shortage);
CREATE INDEX IF NOT EXISTS idx_gws_meet_frequency ON gws_survey_responses(meet_frequency);
CREATE INDEX IF NOT EXISTS idx_gws_large_files ON gws_survey_responses(large_files);
CREATE INDEX IF NOT EXISTS idx_gws_submitted_at ON gws_survey_responses(submitted_at);

-- 5. 테이블 및 컬럼 메타데이터 업데이트
COMMENT ON TABLE gws_survey_responses IS 'GWS Enterprise → Starter 전환 검토 설문 응답 테이블';

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
