import { supabase } from './supabase';
import { GWSUser } from '../types/survey';

/**
 * Check if a user is assigned to GWS Enterprise
 * @param email User email address
 * @returns Promise<boolean>
 */
export const isUserAssignedToGWS = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('gws_assignments')
    .select('email')
    .eq('email', email.toLowerCase())
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error checking GWS assignment:', error);
    return false;
  }

  return !!data;
};

/**
 * Get all GWS assigned users
 * @returns Promise<GWSUser[]>
 */
export const getAllGWSUsers = async (): Promise<GWSUser[]> => {
  const { data, error } = await supabase
    .from('gws_assignments')
    .select('email, is_active')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching GWS users:', error);
    return [];
  }

  return data.map(item => ({
    email: item.email,
    isAssigned: item.is_active
  }));
};

/**
 * Submit GWS survey response
 * @param email User email
 * @param responses Survey responses
 */
export const submitGWSSurvey = async (
  email: string,
  responses: {
    department?: string;
    nickname?: string;
    usageFrequency?: string;
    features?: string[];
    satisfaction?: number;
    comments?: string;
  }
) => {
  const { data, error } = await supabase
    .from('gws_survey_responses')
    .insert({
      user_email: email.toLowerCase(),
      department: responses.department,
      nickname: responses.nickname,
      usage_frequency: responses.usageFrequency,
      features_used: responses.features,
      satisfaction_rating: responses.satisfaction,
      additional_comments: responses.comments,
      submitted_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error submitting GWS survey:', error);
    throw error;
  }

  return data;
};

/**
 * Check if user already submitted GWS survey
 * @param email User email
 */
export const hasSubmittedGWSSurvey = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('gws_survey_responses')
    .select('id')
    .eq('user_email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking GWS survey submission:', error);
    return false;
  }

  return !!data;
};
