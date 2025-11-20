const fetch = require('node-fetch');

const SUPABASE_URL = 'https://adschpldrzwzpzxagxzdw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

async function checkSoftwareSurveyStructure() {
  try {
    console.log('=== software_survey_responses 테이블 구조 확인 ===\n');

    const url = `${SUPABASE_URL}/rest/v1/software_survey_responses?select=*&limit=3`;
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`조회 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`총 응답 수: ${data.length}개\n`);

    if (data.length > 0) {
      console.log('=== 샘플 데이터 구조 ===');
      console.log(JSON.stringify(data[0], null, 2));

      console.log('\n=== category_responses 상세 구조 ===');
      if (data[0].category_responses && Array.isArray(data[0].category_responses)) {
        data[0].category_responses.forEach((cat, idx) => {
          console.log(`\n[카테고리 ${idx + 1}]`);
          console.log(`  카테고리명: ${cat.category_name}`);
          console.log(`  제품들:`);
          if (cat.products && Array.isArray(cat.products)) {
            cat.products.forEach((product, pidx) => {
              console.log(`    [${pidx + 1}] 제품명: ${product.product_name || product}`);
              console.log(`        빈도: ${product.frequency || 'N/A'}`);
              console.log(`        사용 여부: ${product.usage || 'N/A'}`);
            });
          }
        });
      }
    }

  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

checkSoftwareSurveyStructure();
