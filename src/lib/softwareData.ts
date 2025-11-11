import { supabase } from './supabase';
import { SoftwareAssignment, UserSoftwareAssignments, JETBRAIN_PRODUCTS } from '../types/survey';

/**
 * Get user's software assignments from Supabase
 * @param email User email address
 * @returns Promise<SoftwareAssignment[]>
 */
export const getUserSoftwareAssignments = async (email: string): Promise<SoftwareAssignment[]> => {
  const { data, error } = await supabase
    .from('software_assignments')
    .select('category, product, is_all_products_pack')
    .eq('user_email', email.toLowerCase())
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching software assignments:', error);
    return [];
  }

  return data.map(item => ({
    email: email,
    category: item.category,
    product: item.product,
    isAllProductsPack: item.is_all_products_pack || false
  }));
};

/**
 * Check if user has "All Products Pack" for a specific category
 * @param email User email
 * @param category Software category (e.g., "Jetbrain")
 */
export const hasAllProductsPack = async (email: string, category: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('software_assignments')
    .select('is_all_products_pack')
    .eq('user_email', email.toLowerCase())
    .eq('category', category)
    .eq('is_all_products_pack', true)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking All Products Pack:', error);
    return false;
  }

  return !!data;
};

/**
 * Get organized software assignments by category
 * @param email User email
 */
export const getOrganizedSoftwareAssignments = async (
  email: string
): Promise<UserSoftwareAssignments[string]> => {
  const assignments = await getUserSoftwareAssignments(email);

  const organized: UserSoftwareAssignments[string] = {
    categories: {}
  };

  assignments.forEach(assignment => {
    if (!organized.categories[assignment.category]) {
      organized.categories[assignment.category] = {
        products: [],
        hasAllProductsPack: false
      };
    }

    // If user has All Products Pack, set flag and add all products for that category
    if (assignment.isAllProductsPack) {
      organized.categories[assignment.category].hasAllProductsPack = true;

      // For Jetbrain, add all Jetbrain products
      if (assignment.category === 'Jetbrain') {
        organized.categories[assignment.category].products = JETBRAIN_PRODUCTS;
      }
    } else {
      // Regular product assignment
      if (!organized.categories[assignment.category].products.includes(assignment.product)) {
        organized.categories[assignment.category].products.push(assignment.product);
      }
    }
  });

  return organized;
};

/**
 * Submit software survey response
 * @param email User email
 * @param responses Survey responses by category
 */
export const submitSoftwareSurvey = async (
  email: string,
  responses: {
    category: string;
    products: string[];
    usageInfo?: {
      [product: string]: {
        frequency?: string;
        satisfaction?: number;
        features?: string[];
      };
    };
    comments?: string;
  }[]
) => {
  const { data, error } = await supabase
    .from('software_survey_responses')
    .insert({
      user_email: email.toLowerCase(),
      category_responses: responses,
      submitted_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error submitting software survey:', error);
    throw error;
  }

  return data;
};

/**
 * Check if user already submitted software survey
 * @param email User email
 */
export const hasSubmittedSoftwareSurvey = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('software_survey_responses')
    .select('id')
    .eq('user_email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking software survey submission:', error);
    return false;
  }

  return !!data;
};

/**
 * Get available software categories for user
 * @param email User email
 */
export const getUserSoftwareCategories = async (email: string): Promise<string[]> => {
  const assignments = await getUserSoftwareAssignments(email);
  const categories = new Set(assignments.map(a => a.category));
  return Array.from(categories);
};
