const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Configuration Check\n');
console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Supabase credentials are missing!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSupabase() {
  try {
    console.log('\n📡 Testing Supabase connection...');

    // Test connection by getting current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.log('⚠️ Session check:', sessionError.message);
    } else {
      console.log('✅ Supabase connection successful');
      console.log('Session:', session ? 'Active' : 'No active session');
    }

    // Get Auth configuration
    console.log('\n🔐 Auth Settings:');
    console.log('Project URL:', supabaseUrl);
    console.log('Auth callback URL should be configured at:');
    console.log(`${supabaseUrl}/auth/v1/callback`);

    console.log('\n📋 Required Redirect URLs in Supabase Dashboard:');
    console.log('- http://localhost:3000/**');
    console.log('- http://localhost:3000/survey');
    console.log('- http://localhost:3000/gws-survey');
    console.log('- http://localhost:3000/software-survey');
    console.log('- https://ga-software-survey-total.vercel.app/**');
    console.log('- https://ga-software-survey-total.vercel.app/survey');
    console.log('- https://ga-software-survey-total.vercel.app/gws-survey');
    console.log('- https://ga-software-survey-total.vercel.app/software-survey');

    console.log('\n🌐 Configure these URLs at:');
    console.log('https://supabase.com/dashboard/project/adschpldrzwzpzxagxzdw/auth/url-configuration');

    console.log('\n✅ All checks completed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkSupabase();
