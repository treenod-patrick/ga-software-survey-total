// 설문 응답 데이터 확인
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adschpldzwzpzxagxzdw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSurveyResponses() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 설문 응답 테이블 분석');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. GWS 설문 응답 확인
    console.log('1️⃣  GWS 설문 응답 (gws_survey_responses)');
    console.log('─'.repeat(50));

    const { data: gwsData, error: gwsError, count: gwsCount } = await supabase
      .from('gws_survey_responses')
      .select('*', { count: 'exact' })
      .order('submitted_at', { ascending: false })
      .limit(3);

    if (gwsError) {
      console.error('❌ 테이블 조회 실패:', gwsError.message);
    } else {
      console.log(`✅ 총 ${gwsCount}개의 응답\n`);
      if (gwsData && gwsData.length > 0) {
        console.log('최근 응답 샘플:');
        console.table(gwsData.map(row => ({
          이메일: row.user_email,
          부서: row.department,
          닉네임: row.nickname,
          만족도: row.satisfaction_rating,
          제출시간: new Date(row.submitted_at).toLocaleString('ko-KR')
        })));
      } else {
        console.log('⚠️  응답 데이터가 없습니다.\n');
      }
    }

    // 2. 소프트웨어 설문 응답 확인
    console.log('\n2️⃣  소프트웨어 설문 응답 (software_survey_responses)');
    console.log('─'.repeat(50));

    const { data: softwareData, error: softwareError, count: softwareCount } = await supabase
      .from('software_survey_responses')
      .select('*', { count: 'exact' })
      .order('submitted_at', { ascending: false })
      .limit(3);

    if (softwareError) {
      console.error('❌ 테이블 조회 실패:', softwareError.message);
    } else {
      console.log(`✅ 총 ${softwareCount}개의 응답\n`);
      if (softwareData && softwareData.length > 0) {
        console.log('최근 응답 샘플:');
        softwareData.forEach((row, idx) => {
          console.log(`\n[${idx + 1}] ${row.user_email}`);
          console.log(`   제출시간: ${new Date(row.submitted_at).toLocaleString('ko-KR')}`);
          console.log(`   응답 데이터:`);

          // category_responses는 JSONB 형식
          const responses = row.category_responses;
          if (Array.isArray(responses)) {
            responses.forEach(resp => {
              console.log(`   - ${resp.category}: ${resp.products.length}개 제품`);
              if (resp.comments) {
                console.log(`     코멘트: ${resp.comments}`);
              }
            });
          } else {
            console.log(`     ${JSON.stringify(responses, null, 2)}`);
          }
        });
      } else {
        console.log('⚠️  응답 데이터가 없습니다.\n');
      }
    }

    // 3. 테이블 구조 정보
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 테이블 구조 정보');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📌 gws_survey_responses 테이블:');
    console.log('   - user_email: 사용자 이메일');
    console.log('   - department: 부서');
    console.log('   - nickname: 닉네임');
    console.log('   - usage_frequency: 사용 빈도');
    console.log('   - features_used: 사용 기능 (배열)');
    console.log('   - satisfaction_rating: 만족도 (1-10)');
    console.log('   - additional_comments: 추가 의견');
    console.log('   - submitted_at: 제출 시간\n');

    console.log('📌 software_survey_responses 테이블:');
    console.log('   - user_email: 사용자 이메일');
    console.log('   - category_responses: 카테고리별 응답 (JSONB)');
    console.log('     * category: 소프트웨어 카테고리 (Jetbrain, Autodesk 등)');
    console.log('     * products: 선택한 제품 목록');
    console.log('     * usageInfo: 제품별 사용 정보');
    console.log('       - frequency: 사용 빈도');
    console.log('       - satisfaction: 만족도');
    console.log('       - features: 사용 기능');
    console.log('     * comments: 추가 의견');
    console.log('   - submitted_at: 제출 시간\n');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 데이터 조회 쿼리 예시');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('-- 모든 소프트웨어 설문 응답 조회');
    console.log('SELECT * FROM software_survey_responses ORDER BY submitted_at DESC;');
    console.log('');
    console.log('-- 특정 사용자의 응답 조회');
    console.log("SELECT * FROM software_survey_responses WHERE user_email = 'test.user@treenod.com';");
    console.log('');
    console.log('-- 카테고리별 응답 수 집계');
    console.log(`SELECT
  jsonb_array_elements(category_responses)->>'category' as category,
  COUNT(*) as response_count
FROM software_survey_responses
GROUP BY category
ORDER BY response_count DESC;`);

  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
  }
}

checkSurveyResponses();
