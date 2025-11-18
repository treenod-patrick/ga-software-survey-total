// Supabase 권한 관리 테이블 구조 확인 스크립트
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adschpldzwzpzxagxzdw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthTables() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Supabase 테이블 구조 분석 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // 1. 모든 public 스키마의 테이블 목록 조회
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    console.log('🔍 Step 1: Public 스키마 테이블 목록 조회 시도...\n');

    // 대체 방법: 알려진 테이블들을 직접 확인
    const knownTables = [
      'survey_responses',
      'gws_survey_responses',
      'authorized_emails',
      'user_permissions',
      'access_control',
      'whitelist',
      'allowed_users'
    ];

    console.log('📋 Step 2: 알려진 테이블들 존재 여부 확인...\n');

    for (const tableName of knownTables) {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ ${tableName} - 존재함 (레코드 수: ${count || 0})`);

        // 테이블 구조 샘플 데이터 조회
        const { data: sample } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (sample && sample.length > 0) {
          console.log(`   컬럼 목록: ${Object.keys(sample[0]).join(', ')}\n`);
        } else {
          // 빈 테이블인 경우 INSERT 시도로 컬럼 구조 확인
          console.log(`   (빈 테이블 - 컬럼 구조 확인 필요)\n`);
        }
      } else if (error.code === '42P01') {
        console.log(`❌ ${tableName} - 존재하지 않음`);
      } else {
        console.log(`⚠️  ${tableName} - 오류: ${error.message}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Step 3: 기존 설문 응답 테이블 구조 확인');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // survey_responses 테이블 구조 확인
    const { data: surveyData } = await supabase
      .from('survey_responses')
      .select('*')
      .limit(1);

    if (surveyData && surveyData.length > 0) {
      console.log('📊 survey_responses 테이블 컬럼:');
      console.log(Object.keys(surveyData[0]).join('\n'));
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 권한 관리 추천 방법');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('만약 권한 관리 테이블이 없다면, 다음 중 하나를 생성해야 합니다:');
    console.log('');
    console.log('옵션 1: authorized_emails 테이블 (간단한 화이트리스트)');
    console.log('  - email (TEXT PRIMARY KEY)');
    console.log('  - created_at (TIMESTAMPTZ)');
    console.log('  - is_active (BOOLEAN)');
    console.log('');
    console.log('옵션 2: Supabase Auth 사용');
    console.log('  - auth.users 테이블 활용');
    console.log('  - Row Level Security (RLS) 정책 설정');
    console.log('');

  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
  }
}

checkAuthTables();
