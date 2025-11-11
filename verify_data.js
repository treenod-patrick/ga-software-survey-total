// 정확한 데이터 검증
const fs = require('fs');
const XLSX = require('xlsx');

console.log('='.repeat(70));
console.log('📊 GWS_Enterprise.csv 검증');
console.log('='.repeat(70));

// CSV 파일 읽기
const csvContent = fs.readFileSync('GWS_Enterprise.csv', 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

console.log('총 라인 수:', lines.length);
console.log('헤더:', lines[0]);
console.log('실제 데이터 행 수:', lines.length - 1);
console.log('\n처음 5개 이메일:');
lines.slice(1, 6).forEach((email, idx) => {
  console.log(`  ${idx + 1}. ${email.trim()}`);
});
console.log('\n마지막 5개 이메일:');
lines.slice(-5).forEach((email, idx) => {
  console.log(`  ${lines.length - 5 + idx}. ${email.trim()}`);
});

console.log('\n' + '='.repeat(70));
console.log('📊 licenses.xlsx 검증');
console.log('='.repeat(70));

// Excel 파일 읽기
const workbook = XLSX.readFile('licenses.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('총 행 수 (헤더 포함):', data.length);

// 유효한 데이터만 (Email이 있는 것)
const validData = data.filter(row => row.Email);
console.log('유효한 할당 데이터 (Email 존재):', validData.length);

// 고유 사용자 수
const uniqueUsers = new Set(validData.map(row => row.Email));
console.log('고유 사용자 수:', uniqueUsers.size);

// 카테고리별 통계
const byCategory = {};
validData.forEach(row => {
  const cat = row.Category || 'Unknown';
  if (!byCategory[cat]) byCategory[cat] = 0;
  byCategory[cat]++;
});

console.log('\n카테고리별 할당 건수:');
Object.entries(byCategory).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}건`);
});

// All Products Pack 사용자
const allProductUsers = validData.filter(row =>
  row.Product && row.Product.toLowerCase().includes('all products pack')
);

console.log('\n🎯 All Products Pack 사용자:', allProductUsers.length, '명');
allProductUsers.forEach(row => {
  console.log(`  - ${row.Email}`);
});

// 제품별 통계
const byProduct = {};
validData.forEach(row => {
  const prod = row.Product || 'Unknown';
  if (!byProduct[prod]) byProduct[prod] = 0;
  byProduct[prod]++;
});

console.log('\n제품별 할당 건수:');
Object.entries(byProduct).sort((a, b) => b[1] - a[1]).forEach(([prod, count]) => {
  console.log(`  ${prod}: ${count}명`);
});

console.log('\n' + '='.repeat(70));
console.log('✅ 최종 요약');
console.log('='.repeat(70));
console.log('GWS Enterprise 사용자:', lines.length - 1, '명');
console.log('소프트웨어 라이선스 할당된 사용자:', uniqueUsers.size, '명');
console.log('총 소프트웨어 할당 건수:', validData.length, '건');
console.log('All Products Pack 사용자:', allProductUsers.length, '명 (다중 선택 UI)');
