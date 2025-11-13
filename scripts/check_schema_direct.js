/**
 * Supabase REST API로 직접 테이블 스키마 확인
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// Supabase REST API를 통한 스키마 조회
function querySupabase(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);

    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// 직접 PostgreSQL 정보 스키마 조회
async function getTableSchema() {
  const sql = `
    SELECT
      column_name,
      data_type,
      is_nullable,
      column_default,
      character_maximum_length
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'gws_survey_responses'
    ORDER BY ordinal_position;
  `;

  try {
    const result = await querySupabase(sql);
    return result;
  } catch (error) {
    // RPC 함수가 없으면 curl로 시도
    console.log('⚠️ RPC 함수를 사용할 수 없습니다. curl로 재시도합니다...\n');
    return null;
  }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Supabase 테이블 스키마 직접 조회');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const schema = await getTableSchema();

  if (schema && schema.length > 0) {
    console.log('✅ 현재 테이블 구조:\n');
    console.log('┌─────────────────────────┬──────────────┬─────────────┐');
    console.log('│ 컬럼명                   │ 데이터 타입   │ NULL 허용   │');
    console.log('├─────────────────────────┼──────────────┼─────────────┤');

    schema.forEach(col => {
      const colName = col.column_name.padEnd(23);
      const dataType = col.data_type.padEnd(12);
      const nullable = col.is_nullable.padEnd(11);
      console.log(`│ ${colName} │ ${dataType} │ ${nullable} │`);
    });

    console.log('└─────────────────────────┴──────────────┴─────────────┘\n');

    // 컬럼 목록 추출
    const columnNames = schema.map(col => col.column_name);

    console.log('📋 감지된 컬럼 목록:');
    console.log(columnNames.join(', '));
    console.log('');

    generateSafeSQL(columnNames);
  } else {
    console.log('⚠️ 스키마를 조회할 수 없습니다. 수동으로 확인이 필요합니다.\n');
    console.log('Supabase 대시보드에서 다음 SQL을 실행하세요:');
    console.log('');
    console.log('SELECT column_name, data_type, is_nullable');
    console.log('FROM information_schema.columns');
    console.log("WHERE table_name = 'gws_survey_responses'");
    console.log('ORDER BY ordinal_position;');
    console.log('');
  }
}

function generateSafeSQL(existingColumns) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 안전한 마이그레이션 SQL 생성');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let sql = `-- ============================================================================
-- GWS Survey Table 안전 마이그레이션
-- 현재 컬럼: ${existingColumns.join(', ')}
-- ============================================================================

`;

  // 1. 기존 컬럼 삭제
  const toDelete = ['department', 'nickname', 'usage_frequency', 'satisfaction_rating']
    .filter(col => existingColumns.includes(col));

  if (toDelete.length > 0) {
    sql += '-- 1. 불필요한 컬럼 삭제\n';
    toDelete.forEach(col => {
      sql += `ALTER TABLE gws_survey_responses DROP COLUMN ${col};\n`;
    });
    sql += '\n';
  }

  // 2. 컬럼 이름 변경
  if (existingColumns.includes('features_used') && !existingColumns.includes('advanced_features')) {
    sql += '-- 2. 컬럼 이름 변경\n';
    sql += 'ALTER TABLE gws_survey_responses RENAME COLUMN features_used TO advanced_features;\n';
  }

  if (existingColumns.includes('additional_comments') && !existingColumns.includes('migration_concerns')) {
    sql += 'ALTER TABLE gws_survey_responses RENAME COLUMN additional_comments TO migration_concerns;\n';
  }

  sql += '\n';

  // 3. 새 컬럼 추가
  const newCols = [
    { name: 'account_type', check: "('enterprise', 'starter', 'unknown')" },
    { name: 'storage_shortage', check: "('frequent', 'sometimes', 'never', 'unknown')" },
    { name: 'meet_frequency', check: "('daily', '2-3times_weekly', 'weekly_or_less', 'rarely')" },
    { name: 'large_files', check: "('yes', 'no', 'unknown')" },
    { name: 'enterprise_necessity', check: "('essential', 'nice_to_have', 'not_needed', 'unknown')" }
  ];

  sql += '-- 3. 새 컬럼 추가\n';
  newCols.forEach(col => {
    if (!existingColumns.includes(col.name)) {
      sql += `ALTER TABLE gws_survey_responses ADD COLUMN ${col.name} TEXT
  CHECK (${col.name} IN ${col.check});\n\n`;
    } else {
      sql += `-- ✅ ${col.name} 이미 존재 (건너뜀)\n`;
    }
  });

  console.log(sql);

  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(__dirname, 'migrate_gws_FINAL.sql');

  fs.writeFileSync(outputPath, sql, 'utf-8');

  console.log(`\n✅ 최종 마이그레이션 SQL 저장: ${outputPath}\n`);
}

main().catch(error => {
  console.error('❌ 에러:', error.message);
  process.exit(1);
});
