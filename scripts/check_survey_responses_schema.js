const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adschpldrzwzpzxagxzdw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('🔍 survey_responses 테이블 스키마 확인 중...\n');

  try {
    // 실제 데이터 1개 가져와서 컬럼 확인
    const { data, error } = await supabase
      .from('survey_responses')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ 에러:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ 테이블 컬럼 목록:');
      console.log(Object.keys(data[0]));
      console.log('\n📊 샘플 데이터:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('⚠️  테이블이 비어있습니다.');
      
      // RPC로 컬럼 정보 확인
      const { data: columns } = await supabase.rpc('get_table_columns', {
        table_name: 'survey_responses'
      }).catch(() => ({ data: null }));
      
      if (columns) {
        console.log('컬럼 정보:', columns);
      }
    }
  } catch (error) {
    console.error('❌ 예상치 못한 에러:', error);
  }
}

checkSchema();
