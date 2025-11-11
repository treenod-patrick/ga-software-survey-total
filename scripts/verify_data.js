// Supabase 데이터 확인 스크립트
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyData() {
  console.log('🔍 Supabase 데이터 확인 중...\n');

  try {
    // GWS 데이터 확인
    console.log('📊 GWS Enterprise 사용자 확인...');
    const { data: gwsData, error: gwsError } = await supabase
      .from('gws_assignments')
      .select('*', { count: 'exact' });

    if (gwsError) {
      console.error('❌ GWS 데이터 조회 오류:', gwsError.message);
    } else {
      console.log(`✅ GWS 사용자: ${gwsData.length}명`);
      if (gwsData.length > 0) {
        console.log('   샘플:', gwsData.slice(0, 3).map(u => u.email).join(', '));
      }
    }
    console.log();

    // Software 데이터 확인
    console.log('📊 소프트웨어 라이선스 확인...');
    const { data: softwareData, error: softwareError } = await supabase
      .from('software_assignments')
      .select('*', { count: 'exact' });

    if (softwareError) {
      console.error('❌ 소프트웨어 데이터 조회 오류:', softwareError.message);
    } else {
      console.log(`✅ 소프트웨어 할당: ${softwareData.length}건`);

      // 카테고리별 통계
      const categories = {};
      softwareData.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + 1;
      });

      console.log('\n   📦 카테고리별 할당:');
      Object.entries(categories).forEach(([cat, count]) => {
        console.log(`      - ${cat}: ${count}건`);
      });

      // All Products Pack 확인
      const allPackUsers = softwareData.filter(item => item.is_all_products_pack);
      console.log(`\n   💎 All Products Pack: ${allPackUsers.length}건`);
      if (allPackUsers.length > 0) {
        console.log('      사용자:', allPackUsers.slice(0, 5).map(u => u.user_email).join(', '));
        if (allPackUsers.length > 5) {
          console.log(`      ... 외 ${allPackUsers.length - 5}명`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 최종 통계:');
    console.log('='.repeat(60));
    console.log(`GWS Enterprise: ${gwsData?.length || 0}명`);
    console.log(`소프트웨어 할당: ${softwareData?.length || 0}건`);
    console.log('='.repeat(60));

    // 예상 vs 실제 비교
    const expectedGWS = 87;
    const expectedSoftware = 59;

    console.log('\n🎯 데이터 완결성 검증:');
    console.log(`GWS: ${gwsData?.length || 0}/${expectedGWS} ${gwsData?.length === expectedGWS ? '✅' : '⚠️'}`);
    console.log(`Software: ${softwareData?.length || 0}/${expectedSoftware} ${softwareData?.length === expectedSoftware ? '✅' : '⚠️'}`);

    if (gwsData?.length === expectedGWS && softwareData?.length === expectedSoftware) {
      console.log('\n🎉 모든 데이터가 정상적으로 삽입되었습니다!');
    } else {
      console.log('\n⚠️ 일부 데이터가 누락되었을 수 있습니다.');
    }

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
  }
}

verifyData();
