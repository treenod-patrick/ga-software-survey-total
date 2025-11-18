const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adschpldrzwzpzxagxzdw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSoftwareSurveyData() {
  console.log('📊 소프트웨어 설문 데이터 확인 중...\n');

  // 소프트웨어 설문 응답 조회
  const { data: responses, error } = await supabase
    .from('software_survey_responses')
    .select('*')
    .order('submitted_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ 에러:', error);
    return;
  }

  console.log(`✅ 총 ${responses.length}개의 응답 확인\n`);

  responses.forEach((response, idx) => {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`응답 #${idx + 1}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`사용자: ${response.user_email}`);
    console.log(`제출 시간: ${response.submitted_at}`);
    console.log(`\n카테고리 응답:`);

    if (response.category_responses && Array.isArray(response.category_responses)) {
      response.category_responses.forEach((catResponse, catIdx) => {
        console.log(`\n  [카테고리 ${catIdx + 1}] ${catResponse.category || '(카테고리 없음)'}`);
        console.log(`  선택된 제품: ${catResponse.products?.length || 0}개`);

        if (catResponse.products && catResponse.products.length > 0) {
          console.log(`  제품 목록: ${catResponse.products.join(', ')}`);
        } else {
          console.log(`  ⚠️ 선택된 제품 없음!`);
        }

        if (catResponse.usageInfo) {
          const productsWithUsage = Object.keys(catResponse.usageInfo);
          console.log(`  사용 정보가 있는 제품: ${productsWithUsage.length}개`);

          productsWithUsage.forEach(product => {
            const usage = catResponse.usageInfo[product];
            console.log(`    - ${product}:`);
            console.log(`      빈도: ${usage.frequency || '(없음)'}`);
            console.log(`      만족도: ${usage.satisfaction || '(없음)'}`);
          });
        } else {
          console.log(`  ⚠️ 사용 정보 없음!`);
        }

        if (catResponse.comments) {
          console.log(`  코멘트: ${catResponse.comments}`);
        }
      });
    } else {
      console.log(`  ⚠️ category_responses가 비어있거나 배열이 아닙니다!`);
      console.log(`  실제 값:`, JSON.stringify(response.category_responses, null, 2));
    }
  });

  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('검증 요약');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let emptyResponses = 0;
  let validResponses = 0;

  responses.forEach(response => {
    if (!response.category_responses || !Array.isArray(response.category_responses)) {
      emptyResponses++;
      return;
    }

    let hasAnyProduct = false;
    response.category_responses.forEach(catResponse => {
      if (catResponse.products && catResponse.products.length > 0) {
        hasAnyProduct = true;
      }
    });

    if (hasAnyProduct) {
      validResponses++;
    } else {
      emptyResponses++;
    }
  });

  console.log(`✅ 유효한 응답: ${validResponses}개`);
  console.log(`⚠️ 빈 응답: ${emptyResponses}개`);
}

checkSoftwareSurveyData().catch(console.error);
