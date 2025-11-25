const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://adschpldrzwzpzxagxzdw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI'
);

async function checkLatestSurvey() {
  try {
    console.log('=== 최근 제출된 소프트웨어 설문 데이터 확인 ===\n');

    const { data, error } = await supabase
      .from('software_survey_responses')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Supabase 오류:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('❌ 제출된 설문이 없습니다.');
      return;
    }

    const latestSurvey = data[0];
    console.log('📧 사용자 이메일:', latestSurvey.user_email);
    console.log('📅 제출 시간:', latestSurvey.submitted_at);
    console.log('\n=== 카테고리별 응답 상세 ===\n');

    if (latestSurvey.category_responses && Array.isArray(latestSurvey.category_responses)) {
      latestSurvey.category_responses.forEach((catResponse, idx) => {
        console.log(`\n📂 카테고리 ${idx + 1}: ${catResponse.category}`);
        console.log(`선택된 제품: ${catResponse.products.join(', ')}`);

        console.log('\n제품별 상세 정보:');
        if (catResponse.usageInfo) {
          Object.entries(catResponse.usageInfo).forEach(([productName, info]) => {
            console.log(`\n  🔹 ${productName}`);
            console.log(`    - 사용 빈도: ${info.frequency || 'N/A'}`);
            console.log(`    - 만족도: ${info.satisfaction || 'N/A'}`);
            console.log(`    - 반납 의사: ${
              info.returnIntention === true ? '✅ 반납 예정' :
              info.returnIntention === false ? '❌ 유지' :
              '➖ 미응답'
            }`);
            if (info.returnIntention !== undefined) {
              console.log(`    ✨ returnIntention 필드 확인: ${JSON.stringify(info.returnIntention)}`);
            }
          });
        }
      });
    }

    console.log('\n\n=== 전체 JSON 데이터 ===\n');
    console.log(JSON.stringify(latestSurvey, null, 2));

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

checkLatestSurvey();
