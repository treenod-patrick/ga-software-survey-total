const fetch = require('node-fetch');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://adschpldrzwzpzxagxzdw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

async function checkSurveyParticipants() {
  try {
    console.log('=== 설문 참여자 확인 ===\n');

    // 1. survey_responses 테이블 확인
    console.log('1. survey_responses 테이블 조회...');
    const responsesUrl = `${SUPABASE_URL}/rest/v1/survey_responses?select=*`;
    const responsesResponse = await fetch(responsesUrl, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!responsesResponse.ok) {
      throw new Error(`survey_responses 조회 실패: ${responsesResponse.status} ${responsesResponse.statusText}`);
    }

    const responses = await responsesResponse.json();
    console.log(`   총 응답 수: ${responses.length}개`);

    if (responses.length > 0) {
      console.log('\n   최근 응답 샘플:');
      responses.slice(0, 3).forEach((response, idx) => {
        console.log(`   [${idx + 1}] user_id: ${response.user_id}, submitted_at: ${response.submitted_at}`);
        console.log(`       email: ${response.email || 'N/A'}`);
        console.log(`       name: ${response.name || 'N/A'}`);
      });
    }

    // 2. software_assignments 테이블 확인
    console.log('\n2. software_assignments 테이블 조회...');
    const assignmentsUrl = `${SUPABASE_URL}/rest/v1/software_assignments?select=*`;
    const assignmentsResponse = await fetch(assignmentsUrl, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!assignmentsResponse.ok) {
      throw new Error(`software_assignments 조회 실패: ${assignmentsResponse.status} ${assignmentsResponse.statusText}`);
    }

    const assignments = await assignmentsResponse.json();
    console.log(`   총 소프트웨어 할당 수: ${assignments.length}개`);

    if (assignments.length > 0) {
      console.log('\n   최근 할당 샘플:');
      assignments.slice(0, 3).forEach((assignment, idx) => {
        console.log(`   [${idx + 1}] user_id: ${assignment.user_id}, software_name: ${assignment.software_name}`);
        console.log(`       currently_using: ${assignment.currently_using}`);
      });
    }

    // 3. 사용자별 통계
    console.log('\n3. 사용자별 통계...');
    const uniqueUserIds = [...new Set(responses.map(r => r.user_id))];
    console.log(`   고유 사용자 수: ${uniqueUserIds.length}명`);

    // 4. 제출 완료 여부 확인
    const completedResponses = responses.filter(r => r.submitted_at !== null);
    console.log(`   제출 완료된 응답: ${completedResponses.length}개`);
    console.log(`   미제출 응답: ${responses.length - completedResponses.length}개`);

    // 5. 날짜별 통계
    if (completedResponses.length > 0) {
      console.log('\n4. 제출일별 통계:');
      const dateGroups = {};
      completedResponses.forEach(r => {
        const date = new Date(r.submitted_at).toLocaleDateString('ko-KR');
        dateGroups[date] = (dateGroups[date] || 0) + 1;
      });

      Object.entries(dateGroups).forEach(([date, count]) => {
        console.log(`   ${date}: ${count}개`);
      });
    }

    console.log('\n=== 확인 완료 ===');

  } catch (error) {
    console.error('오류 발생:', error.message);
    if (error.response) {
      console.error('응답 상세:', await error.response.text());
    }
  }
}

checkSurveyParticipants();
