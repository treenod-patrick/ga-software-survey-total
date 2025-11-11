// Supabase REST API로 직접 데이터 삽입
const fs = require('fs');

const SUPABASE_URL = 'https://adschpldrzwzpzxagxzdw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

// GWS 데이터 로드
function loadGWSData() {
  const csvContent = fs.readFileSync('GWS_Enterprise.csv', 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  const emails = lines.slice(1).map(email => email.trim()).filter(email => email);

  return emails.map(email => ({
    email: email.toLowerCase(),
    is_active: true
  }));
}

// Software 데이터 로드
function loadSoftwareData() {
  const csvContent = fs.readFileSync('licenses.csv', 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  const assignments = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    if (parts.length >= 3) {
      const category = parts[0].trim();
      const product = parts[1].trim();
      const email = parts[2].trim().toLowerCase();
      const isAllProductsPack = product.toLowerCase().includes('all products pack');

      assignments.push({
        user_email: email,
        category: category,
        product: product,
        is_all_products_pack: isAllProductsPack,
        is_active: true
      });
    }
  }

  return assignments;
}

// Fetch API를 사용한 데이터 삽입
async function insertData() {
  console.log('🚀 데이터 삽입 시작...\n');

  // GWS 데이터 삽입
  console.log('📥 GWS Enterprise 데이터 삽입 중...');
  const gwsData = loadGWSData();
  console.log(`   총 ${gwsData.length}명의 사용자`);

  try {
    const gwsResponse = await fetch(`${SUPABASE_URL}/rest/v1/gws_assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'resolution=ignore-duplicates'
      },
      body: JSON.stringify(gwsData)
    });

    if (!gwsResponse.ok) {
      const errorText = await gwsResponse.text();
      throw new Error(`GWS 데이터 삽입 실패: ${gwsResponse.status} ${errorText}`);
    }

    console.log('✅ GWS 데이터 삽입 완료\n');
  } catch (error) {
    console.error('❌ GWS 데이터 삽입 오류:', error.message);
  }

  // Software 데이터 삽입
  console.log('📥 소프트웨어 라이선스 데이터 삽입 중...');
  const softwareData = loadSoftwareData();
  console.log(`   총 ${softwareData.length}건의 할당`);

  const categories = {};
  softwareData.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + 1;
  });
  console.log('   카테고리별:');
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`     - ${cat}: ${count}건`);
  });

  const allPackCount = softwareData.filter(item => item.is_all_products_pack).length;
  console.log(`   All Products Pack: ${allPackCount}건\n`);

  try {
    const softwareResponse = await fetch(`${SUPABASE_URL}/rest/v1/software_assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      body: JSON.stringify(softwareData)
    });

    if (!softwareResponse.ok) {
      const errorText = await softwareResponse.text();
      throw new Error(`소프트웨어 데이터 삽입 실패: ${softwareResponse.status} ${errorText}`);
    }

    console.log('✅ 소프트웨어 데이터 삽입 완료\n');
  } catch (error) {
    console.error('❌ 소프트웨어 데이터 삽입 오류:', error.message);
  }

  // 최종 통계
  console.log('📊 최종 통계:');
  console.log('='.repeat(50));
  console.log(`GWS Enterprise 사용자: ${gwsData.length}명`);
  console.log(`소프트웨어 할당: ${softwareData.length}건`);
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`  - ${cat}: ${count}건`);
  });
  console.log(`All Products Pack 사용자: ${allPackCount}명`);
  console.log('='.repeat(50));
}

insertData().then(() => {
  console.log('\n🎉 모든 작업이 완료되었습니다!');
}).catch(error => {
  console.error('\n❌ 오류 발생:', error);
  process.exit(1);
});
