const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adschpldrzwzpzxagxzdw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Nzk4MzUsImV4cCI6MjA3MDQ1NTgzNX0.SuD8W-2o5fSuhEz5pnuKEOkNvqt0AAfqxPQv6kZ_5cM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLLMSetup() {
  console.log('🔍 GWS LLM 분석 시스템 확인 중...\n');

  try {
    // 1. gws_llm_analysis 테이블 존재 확인
    console.log('1️⃣ gws_llm_analysis 테이블 확인:');
    const { data: analysisData, error: analysisError } = await supabase
      .from('gws_llm_analysis')
      .select('*')
      .limit(1);
    
    if (analysisError) {
      console.log('   ❌ 에러:', analysisError.message);
      console.log('   → 테이블이 존재하지 않거나 권한이 없습니다.');
    } else {
      console.log('   ✅ 테이블 존재 (' + (analysisData?.length || 0) + '개 레코드)');
      if (analysisData && analysisData.length > 0) {
        console.log('   샘플 컬럼:', Object.keys(analysisData[0]));
      }
    }

    // 2. gws_2025_edition_aggregation 뷰 확인
    console.log('\n2️⃣ gws_2025_edition_aggregation 뷰 확인:');
    const { data: aggData, error: aggError } = await supabase
      .from('gws_2025_edition_aggregation')
      .select('*')
      .limit(1);
    
    if (aggError) {
      console.log('   ❌ 에러:', aggError.message);
      console.log('   → 뷰가 존재하지 않거나 권한이 없습니다.');
    } else {
      console.log('   ✅ 뷰 존재');
      if (aggData && aggData.length > 0) {
        console.log('   데이터:', JSON.stringify(aggData[0], null, 2));
      }
    }

    // 3. gws_license_baseline_2024 테이블 확인
    console.log('\n3️⃣ gws_license_baseline_2024 테이블 확인:');
    const { data: baselineData, error: baselineError } = await supabase
      .from('gws_license_baseline_2024')
      .select('*');
    
    if (baselineError) {
      console.log('   ❌ 에러:', baselineError.message);
    } else {
      console.log('   ✅ 기준 데이터 (' + (baselineData?.length || 0) + '개)');
      if (baselineData) {
        baselineData.forEach(item => {
          console.log(`   - ${item.edition}: ${item.seats}석, ₩${item.unit_price_krw}/석`);
        });
      }
    }

    // 4. Edge Function 호출 테스트 (실제 분석은 안 함)
    console.log('\n4️⃣ Edge Function 엔드포인트 확인:');
    const functionUrl = `${supabaseUrl}/functions/v1/gws-analyze`;
    console.log('   URL:', functionUrl);
    console.log('   ℹ️  실제 호출은 프론트엔드에서 테스트하세요.');

  } catch (error) {
    console.error('\n❌ 예상치 못한 에러:', error);
  }
}

checkLLMSetup();
