// licenses.xlsx 상세 분석
const XLSX = require('xlsx');

try {
  const workbook = XLSX.readFile('licenses.xlsx');
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  // 유효한 데이터만 필터링 (Email이 있는 것)
  const validData = data.filter(row => row.Email);

  console.log('='.repeat(60));
  console.log('총 할당 데이터:', validData.length, '개');
  console.log('='.repeat(60));

  // 카테고리별 그룹화
  const categories = {};
  validData.forEach(row => {
    const category = row.Category || 'Unknown';
    if (!categories[category]) {
      categories[category] = new Set();
    }
    categories[category].add(row.Product);
  });

  console.log('\n📊 카테고리별 제품 목록:');
  Object.keys(categories).forEach(category => {
    console.log(`\n[${category}]`);
    Array.from(categories[category]).forEach(product => {
      console.log(`  - ${product}`);
    });
  });

  // Jetbrain All Product 확인
  console.log('\n' + '='.repeat(60));
  console.log('🔍 Jetbrain All Product 사용자 검색');
  console.log('='.repeat(60));

  const jetbrainAll = validData.filter(row =>
    row.Product && (
      row.Product.toLowerCase().includes('all') ||
      row.Product.toLowerCase().includes('전체') ||
      row.Product.toLowerCase().includes('package')
    )
  );

  if (jetbrainAll.length > 0) {
    console.log('✅ All Product 사용자 발견:', jetbrainAll.length, '명');
    jetbrainAll.forEach(row => {
      console.log(`  - ${row.Email}: ${row.Product}`);
    });
  } else {
    console.log('❌ All Product 사용자 없음');
  }

  // 사용자별 그룹화
  console.log('\n' + '='.repeat(60));
  console.log('👤 사용자별 할당 소프트웨어 (샘플 10명)');
  console.log('='.repeat(60));

  const userSoftware = {};
  validData.forEach(row => {
    if (!userSoftware[row.Email]) {
      userSoftware[row.Email] = [];
    }
    userSoftware[row.Email].push({
      category: row.Category,
      product: row.Product
    });
  });

  Object.entries(userSoftware).slice(0, 10).forEach(([email, products]) => {
    console.log(`\n${email}:`);
    products.forEach(p => {
      console.log(`  [${p.category}] ${p.product}`);
    });
  });

  console.log(`\n... 외 ${Object.keys(userSoftware).length - 10}명`);

  // 통계
  console.log('\n' + '='.repeat(60));
  console.log('📈 통계');
  console.log('='.repeat(60));
  console.log('총 사용자 수:', Object.keys(userSoftware).length);
  console.log('총 할당 건수:', validData.length);
  console.log('카테고리 수:', Object.keys(categories).length);

} catch (error) {
  console.error('Error:', error.message);
}
