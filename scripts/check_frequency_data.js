const fetch = require('node-fetch');

const SUPABASE_URL = 'https://adschpldrzwzpzxagxzdw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

async function checkFrequencyData() {
  try {
    console.log('=== 소프트웨어 설문 빈도 데이터 확인 ===\n');

    const url = `${SUPABASE_URL}/rest/v1/software_survey_responses?select=*&limit=5`;
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
      console.log('=== 첫 번째 응답의 전체 구조 ===');
      console.log(JSON.stringify(data[0], null, 2));

      console.log('\n=== 빈도 정보 추출 분석 ===');
      const frequencyValues = new Set();

      data.forEach((response, responseIdx) => {
        console.log(`\n[응답자 ${responseIdx + 1}] ${response.user_email}`);

        if (response.category_responses && Array.isArray(response.category_responses)) {
          response.category_responses.forEach((cat, catIdx) => {
            console.log(`  카테고리 ${catIdx + 1}: ${cat.category_name}`);

            if (cat.products && Array.isArray(cat.products)) {
              cat.products.forEach((product, prodIdx) => {
                if (typeof product === 'string') {
                  console.log(`    [${prodIdx + 1}] 제품명: ${product} (타입: string, 빈도 정보 없음)`);
                } else if (typeof product === 'object' && product !== null) {
                  const name = product.product_name || product.name || '이름없음';
                  const frequency = product.frequency || product.usage || product.use_frequency || 'N/A';
                  frequencyValues.add(frequency);

                  console.log(`    [${prodIdx + 1}] 제품명: ${name}`);
                  console.log(`         빈도: ${frequency}`);
                  console.log(`         전체 필드:`, Object.keys(product).join(', '));
                }
              });
            }
          });
        }
      });

      console.log('\n=== 발견된 빈도 값 목록 ===');
      console.log(Array.from(frequencyValues).sort());
    }

  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

checkFrequencyData();
