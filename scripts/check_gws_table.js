const fetch = require('node-fetch');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://adschpldrzwzpzxagxzdw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

async function checkGwsTable() {
  try {
    console.log('=== GWS 관련 테이블 확인 ===\n');

    const tables = [
      'gws_assignments',
      'gws_migration_survey',
      'software_survey_responses'
    ];

    for (const tableName of tables) {
      console.log(`📋 ${tableName}:`);

      try {
        const url = `${SUPABASE_URL}/rest/v1/${tableName}?limit=2`;
        const response = await fetch(url, {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'count=exact'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const countHeader = response.headers.get('content-range');
          let totalCount = 0;
          if (countHeader) {
            const match = countHeader.match(/\/(\d+)/);
            if (match) totalCount = parseInt(match[1]);
          }

          console.log(`   ✅ 존재 (${totalCount}개 레코드)`);

          if (data.length > 0) {
            console.log(`   컬럼: ${Object.keys(data[0]).join(', ')}`);
            console.log('\n   샘플 데이터:');
            console.log(JSON.stringify(data[0], null, 2));

            // Adobe 관련 키워드 확인
            const jsonStr = JSON.stringify(data, null, 2);
            if (jsonStr.toLowerCase().includes('adobe') ||
                jsonStr.toLowerCase().includes('photoshop') ||
                jsonStr.toLowerCase().includes('illustrator') ||
                jsonStr.toLowerCase().includes('creative cloud')) {
              console.log('\n   ⚠️  Adobe 관련 데이터 포함!');
            } else {
              console.log('\n   ✅ Adobe와 무관');
            }
          } else {
            console.log('   (빈 테이블)');
          }
        } else {
          console.log(`   ❌ 존재하지 않음 (${response.status})`);
        }
      } catch (err) {
        console.log(`   ❌ 오류: ${err.message}`);
      }

      console.log('');
    }

    console.log('=== 확인 완료 ===');

  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

checkGwsTable();
