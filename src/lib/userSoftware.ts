// 간단한 권한 체크 유틸리티

const ADMIN_EMAILS = [
  'admin@example.com',
  // 추가 관리자 이메일
];

export const isAdmin = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email);
};

export const getUserAssignedSoftware = async (email: string): Promise<string[]> => {
  // Supabase에서 사용자 할당 소프트웨어 조회 (향후 구현)
  return [];
};

export const hasUserSubmittedSurvey = async (email: string): Promise<boolean> => {
  // Supabase에서 설문 제출 여부 확인 (향후 구현)
  return false;
};

export const getUserSurveyResponse = async (email: string) => {
  // Supabase에서 설문 응답 조회 (향후 구현)
  return null;
};
