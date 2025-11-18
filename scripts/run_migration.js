/**
 * GWS 설문 테이블 자동 마이그레이션 스크립트
 * PostgreSQL 직접 연결을 통한 마이그레이션 실행
 */

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Supabase 연결 정보
const PROJECT_REF = 'adschpldrzwzpzxagxzdw';
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!DB_PASSWORD) {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ SUPABASE_DB_PASSWORD 환경 변수가 필요합니다');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.error('Supabase 데이터베이스 비밀번호를 .env.local에 추가하거나,');
  console.error('다음 방법으로 수동 마이그레이션을 진행하세요:\n');
  console.error('1️⃣ Supabase SQL Editor 접속:');
  console.error('   https://supabase.com/dashboard/project/adschpldrzwzpzxagxzdw/sql/new\n');
  console.error('2️⃣ scripts/migrate_gws_SAFE_FINAL.sql 파일 내용 복사 후 실행\n');

  // SQL Editor 페이지 자동으로 열기
  try {
    execSync('start https://supabase.com/dashboard/project/adschpldrzwzpzxagxzdw/sql/new', { stdio: 'ignore' });
    console.log('✅ SQL Editor 페이지를 브라우저에서 열었습니다.\n');
  } catch (err) {
    console.error('⚠️  브라우저를 자동으로 열 수 없습니다. 위 링크를 복사하여 접속하세요.\n');
  }

  process.exit(1);
}

const connectionString = `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`;

async function runMigration() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 GWS 설문 테이블 자동 마이그레이션');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // 1. PostgreSQL 연결
    console.log('📡 Supabase PostgreSQL 연결 중...');
    await client.connect();
    console.log('✅ 연결 성공\n');

    // 2. 마이그레이션 SQL 읽기
    console.log('📄 마이그레이션 SQL 파일 읽기...');
    const sqlPath = path.join(__dirname, 'migrate_gws_SAFE_FINAL.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    console.log('✅ SQL 파일 로드 완료\n');

    // 3. 마이그레이션 실행
    console.log('⚙️  마이그레이션 실행 중...\n');
    await client.query(sql);
    console.log('✅ 마이그레이션 성공!\n');

    // 4. 결과 확인
    console.log('🔍 마이그레이션 결과 확인...');
    const result = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'gws_survey_responses'
      ORDER BY ordinal_position
    `);

    console.log('\n현재 테이블 컬럼:');
    result.rows.forEach((row, idx) => {
      console.log(`  ${idx + 1}. ${row.column_name}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 마이그레이션 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ 마이그레이션 실패');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.error('에러:', error.message);
    console.error('\n수동 마이그레이션을 시도하세요:');
    console.error('https://supabase.com/dashboard/project/adschpldrzwzpzxagxzdw/sql/new\n');

    // SQL Editor 페이지 열기
    try {
      execSync('start https://supabase.com/dashboard/project/adschpldrzwzpzxagxzdw/sql/new', { stdio: 'ignore' });
    } catch (err) {}

    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
