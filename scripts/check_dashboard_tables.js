const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adschpldrzwzpzxagxzdw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Nzk4MzUsImV4cCI6MjA3MDQ1NTgzNX0.SuD8W-2o5fSuhEz5pnuKEOkNvqt0AAfqxPQv6kZ_5cM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 대시보드 테이블 상태 확인 중...\n');

  try {
    // 1. survey_responses 테이블 확인
    console.log('1️⃣ survey_responses 테이블 확인:');
    const { data: surveyData, error: surveyError } = await supabase
      .from('survey_responses')
      .select('*')
      .limit(1);
    
    if (surveyError) {
      console.log('   ❌ 에러:', surveyError.message);
      console.log('   에러 코드:', surveyError.code);
    } else {
      console.log('   ✅ 정상 (데이터 수:', surveyData?.length || 0, ')');
    }

    // 2. gws_survey_responses 테이블 확인
    console.log('\n2️⃣ gws_survey_responses 테이블 확인:');
    const { data: gwsData, error: gwsError } = await supabase
      .from('gws_survey_responses')
      .select('*')
      .limit(1);
    
    if (gwsError) {
      console.log('   ❌ 에러:', gwsError.message);
      console.log('   에러 코드:', gwsError.code);
      if (gwsError.code === 'PGRST116') {
        console.log('   ℹ️  테이블이 비어있습니다 (정상)');
      }
    } else {
      console.log('   ✅ 정상 (데이터 수:', gwsData?.length || 0, ')');
    }

    // 3. 전체 카운트 확인
    console.log('\n3️⃣ 전체 데이터 카운트:');
    
    const { count: surveyCount } = await supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true });
    console.log('   survey_responses:', surveyCount || 0, '개');

    const { count: gwsCount } = await supabase
      .from('gws_survey_responses')
      .select('*', { count: 'exact', head: true });
    console.log('   gws_survey_responses:', gwsCount || 0, '개');

  } catch (error) {
    console.error('\n❌ 예상치 못한 에러:', error);
  }
}

checkTables();
