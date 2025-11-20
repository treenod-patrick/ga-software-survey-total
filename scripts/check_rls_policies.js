const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://adschpldzwzpzxagxzdw.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg3OTgzNSwiZXhwIjoyMDcwNDU1ODM1fQ.Utd7Xkx04CLORafSMGiNxIdZWZH1uhGTVUrvJkXmiiI';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkc2NocGxkend6cHp4YWd4emR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4Nzk4MzUsImV4cCI6MjA3MDQ1NTgzNX0.194t856wAwJ98C9uP09sd7e63EyRb4v33OnL4vCxaoA';

const supabaseService = createClient(supabaseUrl, serviceKey);
const supabaseAnon = createClient(supabaseUrl, anonKey);

async function checkRLS() {
  console.log('\n🔍 RLS 정책 확인\n');

  // Service key로 조회 (RLS 우회)
  const { data: serviceData, error: serviceError } = await supabaseService
    .from('software_assignments')
    .select('user_email')
    .eq('is_active', true);

  console.log('📊 Service Key로 조회 (RLS 우회):');
  console.log('  레코드 수:', serviceData?.length || 0);
  console.log('  고유 이메일 수:', new Set(serviceData?.map(d => d.user_email.toLowerCase())).size);

  // Anon key로 조회 (RLS 적용)
  const { data: anonData, error: anonError } = await supabaseAnon
    .from('software_assignments')
    .select('user_email')
    .eq('is_active', true);

  console.log('\n📊 Anon Key로 조회 (RLS 적용):');
  console.log('  레코드 수:', anonData?.length || 0);
  console.log('  고유 이메일 수:', new Set(anonData?.map(d => d.user_email.toLowerCase())).size);
  if (anonError) {
    console.log('  에러:', anonError);
  }

  console.log('\n💡 결론:');
  if ((serviceData?.length || 0) > (anonData?.length || 0)) {
    console.log('  ⚠️ RLS 정책이 데이터 접근을 제한하고 있습니다!');
    console.log('  관리자 대시보드가 모든 데이터를 볼 수 있도록 RLS 정책을 수정해야 합니다.');
  } else {
    console.log('  ✅ RLS 정책이 올바르게 설정되어 있습니다.');
  }
}

checkRLS().catch(console.error);
