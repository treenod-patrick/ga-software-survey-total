// Excel 파일 파싱 스크립트
const XLSX = require('xlsx');
const fs = require('fs');

try {
  // Excel 파일 읽기
  const workbook = XLSX.readFile('licenses.xlsx');

  // 첫 번째 시트 이름
  const sheetName = workbook.SheetNames[0];
  console.log('Sheet name:', sheetName);

  // 시트를 JSON으로 변환
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log('\n총 행 수:', data.length);
  console.log('\n첫 5개 행:');
  console.log(JSON.stringify(data.slice(0, 5), null, 2));

  // 컬럼 이름 확인
  if (data.length > 0) {
    console.log('\n컬럼 이름:', Object.keys(data[0]));
  }

  // Jetbrain All Product 사용자 찾기
  const jetbrainUsers = data.filter(row => {
    const values = Object.values(row).join(' ').toLowerCase();
    return values.includes('jetbrain') || values.includes('all product');
  });

  console.log('\nJetbrain 관련 행:', jetbrainUsers.length);
  if (jetbrainUsers.length > 0) {
    console.log(JSON.stringify(jetbrainUsers.slice(0, 3), null, 2));
  }

} catch (error) {
  console.error('Error:', error.message);
}
