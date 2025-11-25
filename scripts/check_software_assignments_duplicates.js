const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || 'https://adschpldrzwzpzxagxzdw.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI'
);

async function analyzeSoftwareAssignments() {
  console.log('=== Software Assignments 중복 분석 ===\n');

  const { data, error } = await supabase
    .from('software_assignments')
    .select('user_email, category, product, is_active');

  if (error) {
    console.error('❌ 오류:', error);
    return;
  }

  console.log('📊 전체 레코드 수:', data.length);

  // 고유한 이메일 수 계산
  const uniqueEmails = new Set(data.map(item => item.user_email));
  console.log('👤 고유한 사용자 수 (중복 제거):', uniqueEmails.size);
  console.log('🔄 중복 할당:', data.length - uniqueEmails.size, '건\n');

  // 중복된 이메일 찾기
  const emailCounts = {};
  data.forEach(item => {
    if (!emailCounts[item.user_email]) {
      emailCounts[item.user_email] = [];
    }
    emailCounts[item.user_email].push({
      category: item.category,
      product: item.product,
      is_active: item.is_active
    });
  });

  const duplicates = Object.entries(emailCounts)
    .filter(([email, items]) => items.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

  if (duplicates.length > 0) {
    console.log('=== 중복 할당된 사용자 (' + duplicates.length + '명) ===\n');
    duplicates.slice(0, 10).forEach(([email, items]) => {
      console.log(`📧 ${email}: ${items.length}개 라이센스`);
      items.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.category} - ${item.product} (활성: ${item.is_active})`);
      });
      console.log('');
    });

    if (duplicates.length > 10) {
      console.log(`... 외 ${duplicates.length - 10}명 더 있음\n`);
    }
  }

  // 활성 라이센스만 확인
  const activeData = data.filter(item => item.is_active);
  const activeUniqueEmails = new Set(activeData.map(item => item.user_email));

  console.log('\n=== 활성 라이센스만 확인 ===');
  console.log('📊 활성 레코드 수:', activeData.length);
  console.log('👤 활성 사용자 수 (중복 제거):', activeUniqueEmails.size);
}

analyzeSoftwareAssignments().catch(console.error);
