const fetch = require('node-fetch');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://adschpldrzwzpzxagxzdw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

async function checkDetailedData() {
  try {
    console.log('=== 상세 데이터 확인 ===\n');

    // 1. software_assignments 테이블의 실제 데이터 확인
    console.log('1. software_assignments 상세 데이터:');
    const assignmentsUrl = `${SUPABASE_URL}/rest/v1/software_assignments?select=*&limit=5`;
    const assignmentsResponse = await fetch(assignmentsUrl, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const assignments = await assignmentsResponse.json();
    console.log('\n   샘플 데이터 (원본):');
    console.log(JSON.stringify(assignments.slice(0, 2), null, 2));

    // 2. survey_responses 테이블의 실제 데이터 확인
    console.log('\n2. survey_responses 상세 데이터:');
    const responsesUrl = `${SUPABASE_URL}/rest/v1/survey_responses?select=*&limit=5`;
    const responsesResponse = await fetch(responsesUrl, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const responses = await responsesResponse.json();
    console.log('\n   샘플 데이터 (원본):');
    console.log(JSON.stringify(responses.slice(0, 2), null, 2));

    // 3. 소프트웨어별 통계
    console.log('\n3. 소프트웨어별 사용 현황:');
    const allAssignments = await fetch(`${SUPABASE_URL}/rest/v1/software_assignments?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    }).then(r => r.json());

    // 필드명을 동적으로 확인
    if (allAssignments.length > 0) {
      const firstItem = allAssignments[0];
      console.log('\n   사용 가능한 필드:', Object.keys(firstItem));

      // 소프트웨어 이름 필드 찾기
      const softwareField = Object.keys(firstItem).find(k =>
        k.toLowerCase().includes('software') || k.toLowerCase().includes('name')
      );

      if (softwareField) {
        const softwareGroups = {};
        allAssignments.forEach(item => {
          const name = item[softwareField];
          if (name) {
            softwareGroups[name] = (softwareGroups[name] || 0) + 1;
          }
        });

        console.log('\n   소프트웨어별 할당 수:');
        Object.entries(softwareGroups)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .forEach(([name, count]) => {
            console.log(`   - ${name}: ${count}개`);
          });
      }
    }

    console.log('\n=== 확인 완료 ===');

  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

checkDetailedData();
