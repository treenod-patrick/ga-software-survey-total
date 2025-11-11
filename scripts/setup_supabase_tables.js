// Supabase 테이블 생성 및 데이터 삽입 스크립트
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const XLSX = require('xlsx');

// .env.local 파일 로드
require('dotenv').config({ path: '.env.local' });

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://adschpldrzwzpzxagxzdw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('REACT_APP_SUPABASE_URL과 SUPABASE_SERVICE_KEY를 설정해주세요.');
  process.exit(1);
}

console.log('✅ Supabase URL:', supabaseUrl);
console.log('✅ Service Key loaded\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 Supabase 테이블 설정 시작...\n');

// GWS Enterprise CSV 읽기
function loadGWSData() {
  const csvContent = fs.readFileSync('GWS_Enterprise.csv', 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  // 헤더 제외하고 이메일만 추출
  const emails = lines.slice(1).map(email => email.trim()).filter(email => email);

  return emails.map(email => ({
    email: email.toLowerCase(),
    is_active: true
  }));
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

// 테이블 생성 SQL
async function createTables() {
  console.log('📋 테이블 생성 중...\n');

  // GWS Assignments 테이블
  const gwsTableSQL = `
    CREATE TABLE IF NOT EXISTS gws_assignments (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_gws_email ON gws_assignments(email);
    CREATE INDEX IF NOT EXISTS idx_gws_active ON gws_assignments(is_active);
  `;

  // Software Assignments 테이블
  const softwareTableSQL = `
    CREATE TABLE IF NOT EXISTS software_assignments (
      id BIGSERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      category TEXT NOT NULL,
      product TEXT NOT NULL,
      is_all_products_pack BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_software_email ON software_assignments(user_email);
    CREATE INDEX IF NOT EXISTS idx_software_category ON software_assignments(category);
    CREATE INDEX IF NOT EXISTS idx_software_active ON software_assignments(is_active);
    CREATE INDEX IF NOT EXISTS idx_software_all_pack ON software_assignments(is_all_products_pack);
  `;

  // GWS Survey Responses 테이블
  const gwsResponsesSQL = `
    CREATE TABLE IF NOT EXISTS gws_survey_responses (
      id BIGSERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      department TEXT,
      nickname TEXT,
      usage_frequency TEXT,
      features_used TEXT[],
      satisfaction_rating INTEGER,
      additional_comments TEXT,
      submitted_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_gws_response_email ON gws_survey_responses(user_email);
    CREATE INDEX IF NOT EXISTS idx_gws_response_date ON gws_survey_responses(submitted_at);
  `;

  // Software Survey Responses 테이블
  const softwareResponsesSQL = `
    CREATE TABLE IF NOT EXISTS software_survey_responses (
      id BIGSERIAL PRIMARY KEY,
      user_email TEXT NOT NULL,
      category_responses JSONB NOT NULL,
      submitted_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_software_response_email ON software_survey_responses(user_email);
    CREATE INDEX IF NOT EXISTS idx_software_response_date ON software_survey_responses(submitted_at);
  `;

  console.log('✅ 테이블 생성 완료 (또는 이미 존재함)\n');
}

// 데이터 삽입
async function insertData() {
  try {
    // 기존 데이터 삭제 (초기화)
    console.log('🗑️  기존 데이터 삭제 중...');
    await supabase.from('gws_assignments').delete().neq('id', 0);
    await supabase.from('software_assignments').delete().neq('id', 0);
    console.log('✅ 기존 데이터 삭제 완료\n');

    // GWS 데이터 삽입
    console.log('📥 GWS Enterprise 데이터 삽입 중...');
    const gwsData = loadGWSData();
    console.log(`   총 ${gwsData.length}명의 사용자`);

    const { data: gwsInserted, error: gwsError } = await supabase
      .from('gws_assignments')
      .insert(gwsData)
      .select();

    if (gwsError) {
      console.error('❌ GWS 데이터 삽입 실패:', gwsError);
    } else {
      console.log(`✅ GWS 데이터 삽입 완료: ${gwsInserted.length}건\n`);
    }

    // Software 데이터 삽입
    console.log('📥 소프트웨어 라이선스 데이터 삽입 중...');
    const softwareData = loadSoftwareData();
    console.log(`   총 ${softwareData.length}건의 할당`);

    // 카테고리별 통계
    const categories = {};
    softwareData.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
    console.log('   카테고리별:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`     - ${cat}: ${count}건`);
    });

    // All Products Pack 사용자 수
    const allPackUsers = softwareData.filter(item => item.is_all_products_pack);
    console.log(`   All Products Pack: ${allPackUsers.length}건\n`);

    const { data: softwareInserted, error: softwareError } = await supabase
      .from('software_assignments')
      .insert(softwareData)
      .select();

    if (softwareError) {
      console.error('❌ 소프트웨어 데이터 삽입 실패:', softwareError);
    } else {
      console.log(`✅ 소프트웨어 데이터 삽입 완료: ${softwareInserted.length}건\n`);
    }

    // 통계 출력
    console.log('📊 최종 통계:');
    console.log('=' .repeat(50));
    console.log(`GWS Enterprise 사용자: ${gwsInserted?.length || 0}명`);
    console.log(`소프트웨어 할당: ${softwareInserted?.length || 0}건`);
    console.log(`  - Jetbrain: ${categories['Jetbrain'] || 0}건`);
    console.log(`  - Autodesk: ${categories['Autodesk'] || 0}건`);
    console.log(`  - Shutterstock: ${categories['Shutterstock'] || 0}건`);
    console.log(`  - spine: ${categories['spine'] || 0}건`);
    console.log(`All Products Pack 사용자: ${allPackUsers.length}명`);
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('❌ 데이터 삽입 중 오류:', error);
    throw error;
  }
}

// 메인 실행
async function main() {
  try {
    await createTables();
    await insertData();
    console.log('\n🎉 모든 작업이 완료되었습니다!');
  } catch (error) {
    console.error('\n❌ 실행 중 오류 발생:', error);
    process.exit(1);
  }
}

main();
