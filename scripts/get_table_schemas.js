// 권한 관련 테이블들의 정확한 스키마 확인
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adschpldzwzpzxagxzdw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getTableSchema(tableName) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📋 ${tableName} 테이블 스키마`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // SQL 쿼리로 컬럼 정보 조회
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: `
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = '${tableName}'
      ORDER BY ordinal_position;
    `
  });

  if (error) {
    // RPC가 없을 경우 대체 방법
    console.log('⚠️  RPC 사용 불가, 대체 방법 시도...\n');

    // 빈 INSERT 시도로 컬럼 구조 파악
    const { error: insertError } = await supabase
      .from(tableName)
      .insert({});

    if (insertError) {
      console.log('오류 메시지:', insertError.message);

      // 에러 메시지에서 컬럼 정보 추출
      if (insertError.message.includes('null value')) {
        const match = insertError.message.match(/column "([^"]+)"/);
        if (match) {
          console.log(`\n필수 컬럼: ${match[1]}`);
        }
      }
    }

    // 테이블 메타데이터 조회 시도
    const { data: metadata } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);

    console.log('(정확한 스키마는 Supabase Dashboard에서 확인 필요)');

  } else {
    console.table(data);
  }
}

async function checkAllSchemas() {
  const authTables = [
    'authorized_emails',
    'user_permissions',
    'access_control',
    'whitelist',
    'allowed_users'
  ];

  console.log('🔍 권한 관리 테이블 스키마 분석 시작\n');

  for (const table of authTables) {
    await getTableSchema(table);
  }

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 분석 결과 요약');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('각 테이블의 용도를 파악하기 위해 Supabase Dashboard에서');
  console.log('Table Editor를 확인하거나, 테이블 생성 SQL을 검토해야 합니다.\n');

  console.log('🌐 Supabase Dashboard:');
  console.log('https://supabase.com/dashboard/project/adschpldzwzpzxagxzdw/editor\n');
}

checkAllSchemas();
