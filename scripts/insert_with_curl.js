// Generate JSON payloads and save to files for curl
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

// JSON 파일 생성
console.log('📝 JSON 파일 생성 중...\n');

const gwsData = loadGWSData();
const softwareData = loadSoftwareData();

console.log(`GWS Enterprise: ${gwsData.length}명`);
console.log(`Software 할당: ${softwareData.length}건\n`);

// JSON 파일 저장
fs.writeFileSync('scripts/gws_data.json', JSON.stringify(gwsData, null, 2));
fs.writeFileSync('scripts/software_data.json', JSON.stringify(softwareData, null, 2));

console.log('✅ JSON 파일 생성 완료:');
console.log('   - scripts/gws_data.json');
console.log('   - scripts/software_data.json\n');

// curl 명령어 생성
const gwsCurl = `curl -X POST "${SUPABASE_URL}/rest/v1/gws_assignments" ^
  -H "Content-Type: application/json" ^
  -H "apikey: ${SERVICE_KEY}" ^
  -H "Authorization: Bearer ${SERVICE_KEY}" ^
  -H "Prefer: resolution=ignore-duplicates" ^
  -d @scripts/gws_data.json`;

const softwareCurl = `curl -X POST "${SUPABASE_URL}/rest/v1/software_assignments" ^
  -H "Content-Type: application/json" ^
  -H "apikey: ${SERVICE_KEY}" ^
  -H "Authorization: Bearer ${SERVICE_KEY}" ^
  -d @scripts/software_data.json`;

// 배치 파일 생성
const batchContent = `@echo off
echo 🚀 Supabase 데이터 삽입 시작...
echo.

echo 📥 GWS Enterprise 데이터 삽입 중...
${gwsCurl}
echo.
echo ✅ GWS 데이터 삽입 완료
echo.

echo 📥 소프트웨어 라이선스 데이터 삽입 중...
${softwareCurl}
echo.
echo ✅ 소프트웨어 데이터 삽입 완료
echo.

echo 🎉 모든 작업이 완료되었습니다!
pause
`;

fs.writeFileSync('scripts/insert_data.bat', batchContent);

console.log('✅ 배치 파일 생성 완료: scripts/insert_data.bat\n');
console.log('📋 다음 단계:');
console.log('실행: scripts\\insert_data.bat\n');
