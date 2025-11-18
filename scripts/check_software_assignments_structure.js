// software_assignments 테이블 구조 및 데이터 확인
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adschpldzwzpzxagxzdw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSoftwareAssignmentsTable() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 software_assignments 테이블 분석');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. 테이블 존재 및 구조 확인
    const { data: sampleData, error: sampleError, count } = await supabase
      .from('software_assignments')
      .select('*', { count: 'exact' })
      .limit(5);

    if (sampleError) {
      console.error('❌ 테이블 조회 실패:', sampleError.message);

      if (sampleError.code === '42P01') {
        console.log('\n⚠️  software_assignments 테이블이 존재하지 않습니다.');
        console.log('테이블을 생성해야 합니다.\n');
      }
      return;
    }

    console.log(`✅ software_assignments 테이블 존재 (총 ${count}개 레코드)\n`);

    // 2. 테이블 컬럼 구조 출력
    if (sampleData && sampleData.length > 0) {
      console.log('📋 테이블 컬럼 구조:');
      const columns = Object.keys(sampleData[0]);
      columns.forEach(col => console.log(`   - ${col}`));
      console.log('');

      // 3. 샘플 데이터 출력
      console.log('📝 샘플 데이터 (최대 5개):');
      console.table(sampleData);
    } else {
      console.log('⚠️  테이블이 비어있습니다.\n');
    }

    // 4. 카테고리별 통계
    const { data: categoryStats } = await supabase
      .from('software_assignments')
      .select('category')
      .eq('is_active', true);

    if (categoryStats && categoryStats.length > 0) {
      const categoryCounts = categoryStats.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📊 카테고리별 활성 할당 현황:');
      Object.entries(categoryCounts).forEach(([category, count]) => {
        console.log(`   ${category}: ${count}개`);
      });
    }

    // 5. 사용자별 통계
    const { data: userStats } = await supabase
      .from('software_assignments')
      .select('user_email')
      .eq('is_active', true);

    if (userStats && userStats.length > 0) {
      const uniqueUsers = new Set(userStats.map(item => item.user_email));
      console.log(`\n👥 총 ${uniqueUsers.size}명의 사용자에게 소프트웨어 할당됨\n`);
    }

    // 6. All Products Pack 사용자 확인
    const { data: allPackUsers } = await supabase
      .from('software_assignments')
      .select('user_email, category')
      .eq('is_all_products_pack', true)
      .eq('is_active', true);

    if (allPackUsers && allPackUsers.length > 0) {
      console.log('💎 All Products Pack 할당 사용자:');
      console.table(allPackUsers);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 설문 권한 부여 방법');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('이 테이블에 이메일과 소프트웨어를 추가하면 설문 권한이 부여됩니다.');
    console.log('');
    console.log('예시 SQL:');
    console.log(`
INSERT INTO software_assignments (user_email, category, product, is_all_products_pack, is_active)
VALUES
  ('user@example.com', 'Jetbrain', 'IntelliJ IDEA', false, true),
  ('user@example.com', 'Adobe', 'Photoshop', false, true);
    `);

  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
  }
}

checkSoftwareAssignmentsTable();
