import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 소프트웨어 목록
export const SOFTWARE_LIST = [
  { id: 'software1', name: 'Software 1', category: 'Category A' },
  { id: 'software2', name: 'Software 2', category: 'Category B' },
  { id: 'software3', name: 'Software 3', category: 'Category C' },
  { id: 'software4', name: 'Software 4', category: 'Category A' },
  { id: 'software5', name: 'Software 5', category: 'Category B' },
];

// 실제 사용자 통계
export const ACTUAL_USAGE_STATS = {
  'Software 1': 50,
  'Software 2': 30,
  'Software 3': 20,
  'Software 4': 15,
  'Software 5': 10
};
