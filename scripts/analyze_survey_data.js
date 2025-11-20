const fetch = require('node-fetch');

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://adschpldrzwzpzxagxzdw.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

async function analyzeSurveyData() {
  try {
    console.log('=== 설문 데이터 분석 ===\n');

    // survey_responses 전체 데이터 가져오기
    const responsesUrl = `${SUPABASE_URL}/rest/v1/survey_responses?select=*`;
    const responsesResponse = await fetch(responsesUrl, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const responses = await responsesResponse.json();

    // 1. 부서별 통계
    console.log('1. 부서별 응답 현황:');
    const deptGroups = {};
    responses.forEach(r => {
      const dept = r.department || '미지정';
      deptGroups[dept] = (deptGroups[dept] || 0) + 1;
    });
    Object.entries(deptGroups)
      .sort((a, b) => b[1] - a[1])
      .forEach(([dept, count]) => {
        console.log(`   ${dept}: ${count}명`);
      });

    // 2. 소프트웨어별 사용 통계
    console.log('\n2. 소프트웨어별 사용 현황:');
    const softwareStats = {};
    responses.forEach(r => {
      if (r.software_usage && Array.isArray(r.software_usage)) {
        r.software_usage.forEach(sw => {
          const name = sw.softwareName;
          if (!softwareStats[name]) {
            softwareStats[name] = {
              total: 0,
              daily: 0,
              weekly: 0,
              monthly: 0,
              rarely: 0,
              continue: 0,
              upgrade: 0,
              downgrade: 0,
              stop: 0
            };
          }

          softwareStats[name].total++;

          // 사용 빈도
          const freq = sw.usageFrequency;
          if (freq === 'daily') softwareStats[name].daily++;
          else if (freq === 'weekly') softwareStats[name].weekly++;
          else if (freq === 'monthly') softwareStats[name].monthly++;
          else if (freq === 'rarely') softwareStats[name].rarely++;

          // 계속 사용 의향
          const willContinue = sw.willContinueUsing;
          if (willContinue === 'continue') softwareStats[name].continue++;
          else if (willContinue === 'upgrade') softwareStats[name].upgrade++;
          else if (willContinue === 'downgrade') softwareStats[name].downgrade++;
          else if (willContinue === 'stop') softwareStats[name].stop++;
        });
      }
    });

    console.log('\n   [상위 10개 소프트웨어]');
    Object.entries(softwareStats)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 10)
      .forEach(([name, stats]) => {
        console.log(`\n   ${name}:`);
        console.log(`     총 사용자: ${stats.total}명`);
        console.log(`     사용 빈도: 매일 ${stats.daily}명, 주간 ${stats.weekly}명, 월간 ${stats.monthly}명, 드물게 ${stats.rarely}명`);
        console.log(`     계속 사용: ${stats.continue}명, 업그레이드 ${stats.upgrade}명, 다운그레이드 ${stats.downgrade}명, 중단 ${stats.stop}명`);
      });

    // 3. 사용 빈도별 통계
    console.log('\n3. 전체 소프트웨어 사용 빈도 분포:');
    let totalDaily = 0, totalWeekly = 0, totalMonthly = 0, totalRarely = 0;
    Object.values(softwareStats).forEach(stats => {
      totalDaily += stats.daily;
      totalWeekly += stats.weekly;
      totalMonthly += stats.monthly;
      totalRarely += stats.rarely;
    });
    const totalUsage = totalDaily + totalWeekly + totalMonthly + totalRarely;
    console.log(`   매일 사용: ${totalDaily}건 (${(totalDaily/totalUsage*100).toFixed(1)}%)`);
    console.log(`   주간 사용: ${totalWeekly}건 (${(totalWeekly/totalUsage*100).toFixed(1)}%)`);
    console.log(`   월간 사용: ${totalMonthly}건 (${(totalMonthly/totalUsage*100).toFixed(1)}%)`);
    console.log(`   드물게 사용: ${totalRarely}건 (${(totalRarely/totalUsage*100).toFixed(1)}%)`);

    // 4. 계속 사용 의향 통계
    console.log('\n4. 전체 계속 사용 의향 분포:');
    let totalContinue = 0, totalUpgrade = 0, totalDowngrade = 0, totalStop = 0;
    Object.values(softwareStats).forEach(stats => {
      totalContinue += stats.continue;
      totalUpgrade += stats.upgrade;
      totalDowngrade += stats.downgrade;
      totalStop += stats.stop;
    });
    const totalIntention = totalContinue + totalUpgrade + totalDowngrade + totalStop;
    console.log(`   현행 유지: ${totalContinue}건 (${(totalContinue/totalIntention*100).toFixed(1)}%)`);
    console.log(`   업그레이드: ${totalUpgrade}건 (${(totalUpgrade/totalIntention*100).toFixed(1)}%)`);
    console.log(`   다운그레이드: ${totalDowngrade}건 (${(totalDowngrade/totalIntention*100).toFixed(1)}%)`);
    console.log(`   사용 중단: ${totalStop}건 (${(totalStop/totalIntention*100).toFixed(1)}%)`);

    console.log('\n=== 분석 완료 ===');

  } catch (error) {
    console.error('오류 발생:', error.message);
  }
}

analyzeSurveyData();
