// SQL INSERT 문 생성 스크립트
const fs = require('fs');

// GWS Enterprise CSV 읽기
function loadGWSData() {
  const csvContent = fs.readFileSync('GWS_Enterprise.csv', 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  // 헤더 제외하고 이메일만 추출
  const emails = lines.slice(1).map(email => email.trim()).filter(email => email);

  return emails;
}

// Software Licenses CSV 읽기
function loadSoftwareData() {
  const csvContent = fs.readFileSync('licenses.csv', 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  const assignments = [];

  // 헤더 제외
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    if (parts.length >= 3) {
      const category = parts[0].trim();
      const product = parts[1].trim();
      const email = parts[2].trim().toLowerCase();

      // All Products Pack 확인
      const isAllProductsPack = product.toLowerCase().includes('all products pack');

      assignments.push({
        email,
        category,
        product,
        isAllProductsPack
      });
    }
  }

  return assignments;
}

// SQL 생성
function generateSQL() {
  const gwsEmails = loadGWSData();
  const softwareAssignments = loadSoftwareData();

  let sql = '-- GWS Enterprise 사용자 데이터 삽입\n';
  sql += '-- 총 ' + gwsEmails.length + '명\n\n';

  // GWS 데이터 INSERT
  sql += 'INSERT INTO gws_assignments (email, is_active) VALUES\n';
  const gwsValues = gwsEmails.map(email => `  ('${email}', true)`);
  sql += gwsValues.join(',\n');
  sql += '\nON CONFLICT (email) DO NOTHING;\n\n';

  sql += '-- 소프트웨어 라이선스 할당 데이터 삽입\n';
  sql += '-- 총 ' + softwareAssignments.length + '건\n\n';

  // Software 데이터 INSERT
  sql += 'INSERT INTO software_assignments (user_email, category, product, is_all_products_pack, is_active) VALUES\n';
  const softwareValues = softwareAssignments.map(item =>
    `  ('${item.email}', '${item.category}', '${item.product.replace(/'/g, "''")}', ${item.isAllProductsPack}, true)`
  );
  sql += softwareValues.join(',\n');
  sql += ';\n\n';

  // 통계 주석
  sql += '-- 통계:\n';
  sql += `-- GWS Enterprise: ${gwsEmails.length}명\n`;
  sql += `-- 소프트웨어 할당: ${softwareAssignments.length}건\n`;

  const categories = {};
  softwareAssignments.forEach(item => {
    categories[item.category] = (categories[item.category] || 0) + 1;
  });
  Object.entries(categories).forEach(([cat, count]) => {
    sql += `--   ${cat}: ${count}건\n`;
  });

  const allPackCount = softwareAssignments.filter(item => item.isAllProductsPack).length;
  sql += `-- All Products Pack: ${allPackCount}건\n`;

  return sql;
}

// 메인 실행
try {
  console.log('🚀 SQL INSERT 문 생성 중...\n');

  const sql = generateSQL();

  fs.writeFileSync('scripts/insert_data.sql', sql, 'utf-8');

  console.log('✅ SQL 파일 생성 완료: scripts/insert_data.sql');
  console.log('\n📋 다음 단계:');
  console.log('1. https://supabase.com/dashboard/project/adschpldrzwzpzxagxzdw/sql/new 로 이동');
  console.log('2. scripts/insert_data.sql 파일의 내용을 복사');
  console.log('3. SQL Editor에 붙여넣고 실행 (Run 버튼 클릭)\n');

} catch (error) {
  console.error('❌ 오류 발생:', error);
}
