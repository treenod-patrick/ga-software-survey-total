const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adschpldzwzpzxagxzdw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSoftwareAssignments() {
  console.log('\n🔍 software_assignments 테이블 확인...\n');

  // 전체 데이터 조회
  const { data: allData, error: allError } = await supabase
    .from('software_assignments')
    .select('*');

  if (allError) {
    console.error('❌ 전체 데이터 조회 실패:', allError);
    return;
  }

  console.log('📊 전체 레코드 수:', allData?.length || 0);

  if (allData && allData.length > 0) {
    console.log('📋 테이블 컬럼:', Object.keys(allData[0]));
    console.log('📄 샘플 데이터 (첫 3개):');
    allData.slice(0, 3).forEach((item, idx) => {
      console.log(`  ${idx + 1}.`, item);
    });

    // 소프트웨어 이름들 집계
    const softwareNames = {};
    allData.forEach(item => {
      const name = item.product || item.software_name || item.product_name || '알 수 없음';
      softwareNames[name] = (softwareNames[name] || 0) + 1;
    });

    console.log('\n📦 소프트웨어 항목별 할당 수:');
    Object.entries(softwareNames).forEach(([name, count]) => {
      console.log(`  ${name}: ${count}개`);
    });
  }

  // is_active = true 조건으로 조회
  const { data: activeData, error: activeError } = await supabase
    .from('software_assignments')
    .select('user_email')
    .eq('is_active', true);

  if (activeError) {
    console.error('\n❌ is_active=true 조건 조회 실패:', activeError);
    return;
  }

  console.log('\n✅ is_active=true 레코드 수:', activeData?.length || 0);

  if (activeData && activeData.length > 0) {
    console.log('📧 이메일 목록 (첫 10개):');
    activeData.slice(0, 10).forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.user_email}`);
    });
  }

  // software_survey_responses 테이블 확인
  console.log('\n🔍 software_survey_responses 테이블 확인...\n');

  const { data: softwareSurveyData, error: softwareSurveyError } = await supabase
    .from('software_survey_responses')
    .select('*');

  if (softwareSurveyError) {
    console.error('❌ software_survey_responses 조회 실패:', softwareSurveyError);
  } else {
    console.log('📊 software_survey_responses 레코드 수:', softwareSurveyData?.length || 0);

    if (softwareSurveyData && softwareSurveyData.length > 0) {
      console.log('📋 테이블 컬럼:', Object.keys(softwareSurveyData[0]));
      console.log('📄 샘플 데이터 (첫 2개):');
      softwareSurveyData.slice(0, 2).forEach((item, idx) => {
        console.log(`  ${idx + 1}.`, JSON.stringify(item, null, 2));
      });
    }
  }

  // survey_responses 테이블 확인
  console.log('\n🔍 survey_responses 테이블 확인...\n');

  const { data: surveyData, error: surveyError } = await supabase
    .from('survey_responses')
    .select('user_email, software_usage, selected_software_list');

  if (surveyError) {
    console.error('❌ survey_responses 조회 실패:', surveyError);
    return;
  }

  // software_usage나 selected_software_list가 있는 레코드만 필터링
  const softwareResponses = surveyData.filter(r => r.software_usage || r.selected_software_list);

  console.log('📊 전체 survey_responses:', surveyData?.length || 0);
  console.log('📊 소프트웨어 응답:', softwareResponses.length);

  if (softwareResponses.length > 0) {
    console.log('\n📧 소프트웨어 응답 제출자 (첫 10개):');
    softwareResponses.slice(0, 10).forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.user_email}`);
    });

    // 실제 소프트웨어 항목들 집계
    const surveySoftware = {};
    softwareResponses.forEach(r => {
      if (r.selected_software_list && Array.isArray(r.selected_software_list)) {
        r.selected_software_list.forEach(software => {
          surveySoftware[software] = (surveySoftware[software] || 0) + 1;
        });
      } else if (r.software_usage) {
        Object.keys(r.software_usage).forEach(software => {
          if (r.software_usage[software]) {
            surveySoftware[software] = (surveySoftware[software] || 0) + 1;
          }
        });
      }
    });

    console.log('\n📦 설문에서 선택된 소프트웨어 항목들:');
    Object.entries(surveySoftware)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        console.log(`  ${name}: ${count}명`);
      });
  }

  // 참여자/미참여자 계산
  const assignedEmails = new Set((activeData || []).map(a => a.user_email.toLowerCase()));
  const participatedEmails = new Set(softwareResponses.map(r => r.user_email.toLowerCase()));

  const notParticipated = [...assignedEmails].filter(email => !participatedEmails.has(email));

  console.log('\n📈 참여 현황:');
  console.log(`  대상자: ${assignedEmails.size}명`);
  console.log(`  참여자: ${participatedEmails.size}명`);
  console.log(`  미참여자: ${notParticipated.length}명`);

  if (notParticipated.length > 0) {
    console.log('\n❌ 미참여자 목록:');
    notParticipated.forEach((email, idx) => {
      console.log(`  ${idx + 1}. ${email}`);
    });
  }
}

checkSoftwareAssignments().catch(console.error);
