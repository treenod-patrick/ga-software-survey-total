// DB 연결 및 기능 테스트 스크립트
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '설정됨' : '설정 안 됨');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 테스트 결과를 저장할 객체
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// 테스트 헬퍼 함수
function logTest(name, passed, message = '') {
  const status = passed ? '✅' : '❌';
  const result = { name, passed, message };
  testResults.tests.push(result);

  if (passed) {
    testResults.passed++;
    console.log(`${status} ${name}`);
  } else {
    testResults.failed++;
    console.log(`${status} ${name}: ${message}`);
  }
}

// 테스트 함수들
async function testGWSAssignments() {
  console.log('\n📋 GWS Assignments 테이블 테스트');

  try {
    // 1. 전체 데이터 조회
    const { data: allData, error: allError } = await supabase
      .from('gws_assignments')
      .select('*')
      .limit(5);

    logTest(
      'GWS Assignments - 전체 데이터 조회',
      !allError && allData.length > 0,
      allError ? allError.message : `${allData.length}개 레코드 확인`
    );

    // 2. 특정 이메일 조회
    const testEmail = 'kyoungshin@treenod.com';
    const { data: specificData, error: specificError } = await supabase
      .from('gws_assignments')
      .select('*')
      .eq('email', testEmail)
      .single();

    logTest(
      'GWS Assignments - 특정 이메일 조회',
      !specificError && specificData !== null,
      specificError ? specificError.message : `${testEmail} 사용자 확인`
    );

    // 3. 활성 사용자 수 확인
    const { count, error: countError } = await supabase
      .from('gws_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    logTest(
      'GWS Assignments - 활성 사용자 수',
      !countError && count >= 87,
      countError ? countError.message : `${count}명의 활성 사용자`
    );

  } catch (error) {
    logTest('GWS Assignments 테스트', false, error.message);
  }
}

async function testSoftwareAssignments() {
  console.log('\n📦 Software Assignments 테이블 테스트');

  try {
    // 1. 전체 데이터 조회
    const { data: allData, error: allError } = await supabase
      .from('software_assignments')
      .select('*')
      .limit(5);

    logTest(
      'Software Assignments - 전체 데이터 조회',
      !allError && allData.length > 0,
      allError ? allError.message : `${allData.length}개 레코드 확인`
    );

    // 2. 카테고리별 조회 (Jetbrain)
    const { data: jetbrainData, error: jetbrainError } = await supabase
      .from('software_assignments')
      .select('*')
      .eq('category', 'Jetbrain')
      .eq('is_active', true);

    logTest(
      'Software Assignments - Jetbrain 카테고리 조회',
      !jetbrainError && jetbrainData.length > 0,
      jetbrainError ? jetbrainError.message : `${jetbrainData.length}개 Jetbrain 라이선스`
    );

    // 3. All Products Pack 조회
    const { data: allPackData, error: allPackError } = await supabase
      .from('software_assignments')
      .select('*')
      .eq('is_all_products_pack', true)
      .eq('is_active', true);

    logTest(
      'Software Assignments - All Products Pack 조회',
      !allPackError && allPackData.length > 0,
      allPackError ? allPackError.message : `${allPackData.length}개 All Products Pack`
    );

    // 4. 카테고리별 통계
    const { data: categories, error: catError } = await supabase
      .from('software_assignments')
      .select('category')
      .eq('is_active', true);

    if (!catError && categories) {
      const categoryCount = {};
      categories.forEach(item => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });

      logTest(
        'Software Assignments - 카테고리별 통계',
        Object.keys(categoryCount).length > 0,
        `카테고리: ${Object.entries(categoryCount).map(([k, v]) => `${k}(${v})`).join(', ')}`
      );
    }

  } catch (error) {
    logTest('Software Assignments 테스트', false, error.message);
  }
}

async function testGWSSurveyResponses() {
  console.log('\n📝 GWS Survey Responses 테이블 테스트');

  try {
    // 1. 테이블 접근 가능 여부 확인
    const { data, error } = await supabase
      .from('gws_survey_responses')
      .select('*')
      .limit(1);

    logTest(
      'GWS Survey Responses - 테이블 접근',
      !error,
      error ? error.message : '테이블 접근 가능'
    );

    // 2. 응답 수 확인
    const { count, error: countError } = await supabase
      .from('gws_survey_responses')
      .select('*', { count: 'exact', head: true });

    logTest(
      'GWS Survey Responses - 응답 수',
      !countError,
      countError ? countError.message : `${count}개의 응답`
    );

  } catch (error) {
    logTest('GWS Survey Responses 테스트', false, error.message);
  }
}

async function testSoftwareSurveyResponses() {
  console.log('\n📊 Software Survey Responses 테이블 테스트');

  try {
    // 1. 테이블 접근 가능 여부 확인
    const { data, error } = await supabase
      .from('software_survey_responses')
      .select('*')
      .limit(1);

    logTest(
      'Software Survey Responses - 테이블 접근',
      !error,
      error ? error.message : '테이블 접근 가능'
    );

    // 2. 응답 수 확인
    const { count, error: countError } = await supabase
      .from('software_survey_responses')
      .select('*', { count: 'exact', head: true });

    logTest(
      'Software Survey Responses - 응답 수',
      !countError,
      countError ? countError.message : `${count}개의 응답`
    );

  } catch (error) {
    logTest('Software Survey Responses 테스트', false, error.message);
  }
}

async function testDataIntegrity() {
  console.log('\n🔍 데이터 무결성 테스트');

  try {
    // 1. 중복 이메일 체크 (gws_assignments)
    const { data: gwsEmails } = await supabase
      .from('gws_assignments')
      .select('email');

    if (gwsEmails) {
      const emailSet = new Set(gwsEmails.map(item => item.email));
      logTest(
        '데이터 무결성 - GWS 이메일 중복 없음',
        emailSet.size === gwsEmails.length,
        emailSet.size === gwsEmails.length ? '중복 없음' : '중복 발견'
      );
    }

    // 2. 활성 상태 일관성 체크
    const { data: activeAssignments } = await supabase
      .from('software_assignments')
      .select('user_email, is_active')
      .eq('is_active', false);

    logTest(
      '데이터 무결성 - 비활성 할당 체크',
      true,
      `${activeAssignments?.length || 0}개의 비활성 할당`
    );

  } catch (error) {
    logTest('데이터 무결성 테스트', false, error.message);
  }
}

async function testConnectionInfo() {
  console.log('\n🔗 연결 정보');
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Service Key: ${supabaseServiceKey ? '설정됨' : '설정 안 됨'}`);
}

// 메인 테스트 실행
async function runAllTests() {
  console.log('🚀 Supabase DB 연동 테스트 시작\n');
  console.log('='.repeat(60));

  await testConnectionInfo();
  await testGWSAssignments();
  await testSoftwareAssignments();
  await testGWSSurveyResponses();
  await testSoftwareSurveyResponses();
  await testDataIntegrity();

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 테스트 결과 요약');
  console.log(`✅ 통과: ${testResults.passed}개`);
  console.log(`❌ 실패: ${testResults.failed}개`);
  console.log(`📝 총 테스트: ${testResults.tests.length}개`);

  if (testResults.failed === 0) {
    console.log('\n🎉 모든 테스트가 통과했습니다!');
  } else {
    console.log('\n⚠️ 일부 테스트가 실패했습니다. 위의 오류 메시지를 확인하세요.');
  }

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// 테스트 실행
runAllTests().catch(error => {
  console.error('❌ 테스트 실행 중 오류 발생:', error);
  process.exit(1);
});
