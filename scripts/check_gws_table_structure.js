/**
 * GWS 설문 테이블 현재 구조 확인 스크립트
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTableStructure() {
  console.log('🔍 gws_survey_responses 테이블 구조 확인 중...\n');

  // PostgreSQL information_schema를 통해 컬럼 정보 조회
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'gws_survey_responses'
      ORDER BY ordinal_position;
    `
  });

  if (error) {
    console.log('⚠️ RPC 함수가 없습니다. 직접 쿼리를 시도합니다...\n');

    // 대안: REST API를 통해 데이터 조회
    const { data: sampleData, error: sampleError } = await supabase
      .from('gws_survey_responses')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('❌ 테이블 조회 실패:', sampleError.message);
      process.exit(1);
    }

    if (sampleData && sampleData.length > 0) {
      console.log('✅ 현재 테이블 컬럼 목록 (샘플 데이터 기반):\n');
      const columns = Object.keys(sampleData[0]);
      columns.forEach((col, idx) => {
        console.log(`${idx + 1}. ${col}`);
      });
      console.log('\n샘플 데이터:');
      console.log(JSON.stringify(sampleData[0], null, 2));
    } else {
      console.log('⚠️ 테이블에 데이터가 없습니다. 테이블은 존재하지만 구조를 확인할 수 없습니다.');
    }

    return;
  }

  console.log('✅ 테이블 구조:\n');
  console.log('┌─────────────────────────┬──────────────┬─────────────┬──────────────┐');
  console.log('│ 컬럼명                   │ 데이터 타입   │ NULL 허용   │ 기본값       │');
  console.log('├─────────────────────────┼──────────────┼─────────────┼──────────────┤');

  data.forEach(col => {
    const colName = col.column_name.padEnd(23);
    const dataType = col.data_type.padEnd(12);
    const nullable = col.is_nullable.padEnd(11);
    const defaultVal = (col.column_default || 'NULL').substring(0, 12).padEnd(12);
    console.log(`│ ${colName} │ ${dataType} │ ${nullable} │ ${defaultVal} │`);
  });

  console.log('└─────────────────────────┴──────────────┴─────────────┴──────────────┘');
}

async function checkExistingData() {
  console.log('\n📊 기존 응답 데이터 확인 중...\n');

  const { count, error } = await supabase
    .from('gws_survey_responses')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('❌ 데이터 개수 조회 실패:', error.message);
    return;
  }

  console.log(`총 ${count}개의 응답이 저장되어 있습니다.`);

  if (count > 0) {
    console.log('\n⚠️ 주의: 기존 데이터가 있습니다!');
    console.log('   마이그레이션 전에 반드시 백업하세요.\n');
    console.log('   백업 SQL:');
    console.log('   CREATE TABLE gws_survey_responses_backup AS SELECT * FROM gws_survey_responses;\n');
  } else {
    console.log('✅ 데이터가 없으므로 안전하게 마이그레이션할 수 있습니다.\n');
  }
}

async function generateMigrationSQL() {
  console.log('🔧 현재 테이블 구조 기반 마이그레이션 SQL 생성 중...\n');

  const { data: sampleData } = await supabase
    .from('gws_survey_responses')
    .select('*')
    .limit(1);

  if (!sampleData || sampleData.length === 0) {
    console.log('⚠️ 샘플 데이터가 없어 정확한 컬럼을 확인할 수 없습니다.');
    console.log('하지만 기본 마이그레이션 SQL을 생성합니다.\n');
  }

  const existingColumns = sampleData && sampleData.length > 0
    ? Object.keys(sampleData[0])
    : [];

  console.log('✅ 감지된 컬럼:', existingColumns.join(', '));
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 수정된 마이그레이션 SQL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let sql = `-- ============================================================================
-- GWS Survey Table 수정: Enterprise → Starter 전환 검토 설문
-- 현재 테이블 구조 기반 안전 마이그레이션
-- ============================================================================

`;

  // 기존 컬럼 삭제 (존재하는 것만)
  const columnsToDelete = ['department', 'nickname', 'usage_frequency', 'satisfaction_rating'];
  const existingToDelete = columnsToDelete.filter(col => existingColumns.includes(col));

  if (existingToDelete.length > 0) {
    sql += '-- 1. 기존 불필요 컬럼 삭제\n';
    existingToDelete.forEach(col => {
      sql += `ALTER TABLE gws_survey_responses DROP COLUMN IF EXISTS ${col};\n`;
    });
    sql += '\n';
  }

  // 컬럼 이름 변경 (존재하는 경우에만)
  if (existingColumns.includes('features_used')) {
    sql += '-- 2. 컬럼 이름 변경\n';
    sql += 'ALTER TABLE gws_survey_responses RENAME COLUMN features_used TO advanced_features;\n';
  } else if (existingColumns.includes('advanced_features')) {
    sql += '-- 2. advanced_features 컬럼이 이미 존재합니다 (변경 불필요)\n';
  }

  if (existingColumns.includes('additional_comments')) {
    sql += 'ALTER TABLE gws_survey_responses RENAME COLUMN additional_comments TO migration_concerns;\n';
  } else if (existingColumns.includes('migration_concerns')) {
    sql += '-- migration_concerns 컬럼이 이미 존재합니다 (변경 불필요)\n';
  }

  sql += '\n';

  // 새 컬럼 추가
  const newColumns = [
    { name: 'account_type', check: "('enterprise', 'starter', 'unknown')" },
    { name: 'storage_shortage', check: "('frequent', 'sometimes', 'never', 'unknown')" },
    { name: 'meet_frequency', check: "('daily', '2-3times_weekly', 'weekly_or_less', 'rarely')" },
    { name: 'large_files', check: "('yes', 'no', 'unknown')" },
    { name: 'enterprise_necessity', check: "('essential', 'nice_to_have', 'not_needed', 'unknown')" }
  ];

  sql += '-- 3. 새 컬럼 추가 (제약조건 포함)\n';
  newColumns.forEach(col => {
    if (!existingColumns.includes(col.name)) {
      sql += `ALTER TABLE gws_survey_responses ADD COLUMN IF NOT EXISTS ${col.name} TEXT
  CHECK (${col.name} IN ${col.check});\n\n`;
    } else {
      sql += `-- ${col.name} 컬럼이 이미 존재합니다\n`;
    }
  });

  console.log(sql);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 파일로 저장
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(__dirname, 'migrate_gws_survey_SAFE.sql');

  const fullSQL = sql + `
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
`;

  fs.writeFileSync(outputPath, fullSQL, 'utf-8');
  console.log(`✅ 안전한 마이그레이션 SQL 생성 완료!`);
  console.log(`📄 파일 위치: ${outputPath}\n`);
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 GWS 설문 테이블 구조 분석');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await checkTableStructure();
  await checkExistingData();
  await generateMigrationSQL();

  console.log('✅ 분석 완료!\n');
  console.log('다음 단계:');
  console.log('1. scripts/migrate_gws_survey_SAFE.sql 파일 확인');
  console.log('2. Supabase SQL Editor에서 실행');
  console.log('3. 에러 없이 완료되면 설문 시스템 사용 가능\n');
}

main().catch(error => {
  console.error('❌ 실행 실패:', error);
  process.exit(1);
});
