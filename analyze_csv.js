// CSV 파일들 분석
const fs = require('fs');

console.log('='.repeat(70));
console.log('📊 GWS_Enterprise.csv 분석');
console.log('='.repeat(70));

const gwsContent = fs.readFileSync('GWS_Enterprise.csv', 'utf-8');
const gwsLines = gwsContent.split('\n').filter(line => line.trim());

console.log('총 라인:', gwsLines.length);
console.log('헤더:', gwsLines[0]);
console.log('실제 사용자:', gwsLines.length - 1, '명');

console.log('\n' + '='.repeat(70));
console.log('📊 licenses.csv 분석');
console.log('='.repeat(70));

const licensesContent = fs.readFileSync('licenses.csv', 'utf-8');
const licensesLines = licensesContent.split('\n').filter(line => line.trim());

console.log('총 라인:', licensesLines.length);
console.log('헤더:', licensesLines[0]);

// CSV 파싱 (간단한 방식)
const headers = licensesLines[0].split(',').map(h => h.trim());
console.log('컬럼:', headers);

const data = [];
for (let i = 1; i < licensesLines.length; i++) {
  const values = licensesLines[i].split(',').map(v => v.trim());
  if (values.length === headers.length) {
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx];
    });
    data.push(row);
  }
}

console.log('실제 데이터 행:', data.length);
console.log('\n처음 10개 데이터:');
data.slice(0, 10).forEach((row, idx) => {
  console.log(`${idx + 1}.`, JSON.stringify(row));
});

// Email 컬럼 찾기
const emailColumn = headers.find(h => h.toLowerCase().includes('email'));
const categoryColumn = headers.find(h => h.toLowerCase().includes('category'));
const productColumn = headers.find(h => h.toLowerCase().includes('product'));

console.log('\n감지된 컬럼:');
console.log('  Email:', emailColumn);
console.log('  Category:', categoryColumn);
console.log('  Product:', productColumn);

// 유효한 데이터 필터링
const validData = data.filter(row => row[emailColumn] && row[emailColumn].includes('@'));

console.log('\n유효한 할당 데이터:', validData.length, '건');

// 고유 사용자
const uniqueUsers = new Set(validData.map(row => row[emailColumn]));
console.log('고유 사용자 수:', uniqueUsers.size, '명');

// 카테고리별
const byCategory = {};
validData.forEach(row => {
  const cat = row[categoryColumn] || 'Unknown';
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(row);
});

console.log('\n카테고리별 할당:');
Object.entries(byCategory).forEach(([cat, rows]) => {
  console.log(`  ${cat}: ${rows.length}건`);
  // 해당 카테고리의 제품 목록
  const products = new Set(rows.map(r => r[productColumn]));
  console.log(`    제품:`, Array.from(products).join(', '));
});

// All Products Pack 찾기
const allProductUsers = validData.filter(row =>
  row[productColumn] && (
    row[productColumn].toLowerCase().includes('all') &&
    row[productColumn].toLowerCase().includes('product')
  )
);

console.log('\n🎯 All Products Pack 사용자:', allProductUsers.length, '명');
allProductUsers.forEach(row => {
  console.log(`  - ${row[emailColumn]}: ${row[productColumn]}`);
});

console.log('\n' + '='.repeat(70));
console.log('✅ 최종 요약 (CSV 기준)');
console.log('='.repeat(70));
console.log('GWS Enterprise 사용자:', gwsLines.length - 1, '명');
console.log('소프트웨어 할당된 사용자:', uniqueUsers.size, '명');
console.log('총 소프트웨어 할당 건수:', validData.length, '건');
console.log('All Products Pack 사용자:', allProductUsers.length, '명');
