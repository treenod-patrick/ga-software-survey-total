const fetch = require('node-fetch');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://adschpldrzwzpzxagxzdw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

async function checkAllTables() {
  try {
    console.log('=== Supabase 전체 테이블 구조 확인 ===\n');

    // PostgreSQL 시스템 테이블을 통해 모든 테이블 조회
    const query = `
      SELECT
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      // RPC가 없으면 직접 REST API로 테이블 목록 확인
      console.log('1. 알려진 테이블 확인 방식 사용\n');

      const tables = [
        'survey_responses',
        'software_assignments',
        'users',
        'gws_migration_survey',
        'user_software_usage'
      ];

      for (const tableName of tables) {
        try {
          const tableUrl = `${SUPABASE_URL}/rest/v1/${tableName}?limit=1`;
          const tableResponse = await fetch(tableUrl, {
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'count=exact'
            }
          });

          if (tableResponse.ok) {
            const data = await tableResponse.json();
            const countHeader = tableResponse.headers.get('content-range');
            let totalCount = 0;
            if (countHeader) {
              const match = countHeader.match(/\/(\d+)/);
              if (match) totalCount = parseInt(match[1]);
            }

            console.log(`✅ ${tableName}`);
            console.log(`   레코드 수: ${totalCount}개`);

            if (data.length > 0) {
              const firstRecord = data[0];
              console.log(`   컬럼: ${Object.keys(firstRecord).join(', ')}`);

              // 샘플 데이터로 Adobe 관련 여부 확인
              const jsonStr = JSON.stringify(firstRecord, null, 2);
              if (jsonStr.toLowerCase().includes('adobe') ||
                  jsonStr.toLowerCase().includes('photoshop') ||
                  jsonStr.toLowerCase().includes('illustrator')) {
                console.log('   ⚠️  Adobe 관련 데이터 포함!');
              }
            }
            console.log('');
          }
        } catch (err) {
          console.log(`❌ ${tableName} - 테이블이 존재하지 않거나 접근 불가\n`);
        }
      }
    } else {
      const result = await response.json();
      console.log('테이블 목록:', result);
    }

    // 각 테이블의 샘플 데이터 확인
    console.log('\n=== 각 테이블 샘플 데이터 확인 ===\n');

    const knownTables = ['survey_responses', 'software_assignments'];

    for (const tableName of knownTables) {
      console.log(`📋 ${tableName}:`);
      const sampleUrl = `${SUPABASE_URL}/rest/v1/${tableName}?limit=1`;
      const sampleResponse = await fetch(sampleUrl, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (sampleResponse.ok) {
        const sample = await sampleResponse.json();
        if (sample.length > 0) {
          console.log(JSON.stringify(sample[0], null, 2));
        }
      }
      console.log('');
    }

    console.log('\n=== 확인 완료 ===');

  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

checkAllTables();
