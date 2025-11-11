// Survey Types

export interface GWSUser {
  email: string;
  isAssigned: boolean;
}

export interface SoftwareCategory {
  name: string;
  products: string[];
}

export interface SoftwareAssignment {
  email: string;
  category: string;
  product: string;
  isAllProductsPack?: boolean;
}

export interface UserSoftwareAssignments {
  [email: string]: {
    categories: {
      [category: string]: {
        products: string[];
        hasAllProductsPack: boolean;
      };
    };
  };
}

export interface SurveyResponse {
  userId: string;
  userEmail: string;
  surveyType: 'gws' | 'software';
  responses: {
    [key: string]: string | string[] | boolean;
  };
  submittedAt: string;
}

// Jetbrain products list
export const JETBRAIN_PRODUCTS = [
  'Rider - Commercial annual subscription',
  'DataGrip - Commercial annual subscription',
  'IntelliJ IDEA Ultimate - Commercial annual subscription',
  'PyCharm Professional - Commercial annual subscription',
  'WebStorm - Commercial annual subscription',
  'PhpStorm - Commercial annual subscription',
  'GoLand - Commercial annual subscription',
  'RubyMine - Commercial annual subscription',
  'CLion - Commercial annual subscription',
  'AppCode - Commercial annual subscription',
  'DataSpell - Commercial annual subscription',
  'RustRover - Commercial annual subscription'
];

// Category definitions
export const SOFTWARE_CATEGORIES = {
  Jetbrain: 'Jetbrain',
  Autodesk: 'Autodesk',
  Shutterstock: 'Shutterstock',
  spine: 'spine'
} as const;

export type SoftwareCategoryType = typeof SOFTWARE_CATEGORIES[keyof typeof SOFTWARE_CATEGORIES];
