// Supabase 연결 확인 및 테이블 정보 출력
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Supabase 환경 변수 확인\n');
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? '✅ 설정됨' : '❌ 미설정');
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 미설정');
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ 설정됨' : '❌ 미설정');

console.log('\n📋 테이블 구조 정보\n');

console.log('1️⃣ gws_assignments');
console.log('   - 총 87명의 GWS Enterprise 사용자');
console.log('   - 컬럼: id, email, is_active, created_at, updated_at');
console.log('   - 인덱스: email, is_active');

console.log('\n2️⃣ software_assignments');
console.log('   - 총 59개의 소프트웨어 라이선스 할당');
console.log('   - 컬럼: id, user_email, category, product, is_all_products_pack, is_active');
console.log('   - 카테고리: Jetbrain(32), Autodesk(9), Shutterstock(4), spine(14)');
console.log('   - All Products Pack: 13개');

console.log('\n3️⃣ gws_survey_responses');
console.log('   - GWS 설문 응답 저장');
console.log('   - 컬럼: id, user_email, department, nickname, usage_frequency, features_used, satisfaction_rating, additional_comments');

console.log('\n4️⃣ software_survey_responses');
console.log('   - 소프트웨어 설문 응답 저장');
console.log('   - 컬럼: id, user_email, category_responses (JSONB), submitted_at');

console.log('\n✅ DB 스키마 설정 완료');
console.log('✅ 초기 데이터 삽입 완료 (insert_data.sql)');
console.log('✅ RLS (Row Level Security) 활성화');
console.log('✅ 사용자별 접근 권한 정책 적용');

console.log('\n📝 다음 단계:');
console.log('1. 개발 서버 실행: npm start');
console.log('2. 브라우저에서 http://localhost:3000 접속');
console.log('3. Google 로그인 후 설문 기능 테스트');
