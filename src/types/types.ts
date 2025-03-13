// Add these new types to the existing types.ts file

export interface Task {
    id: string;
    title: string;
    description: string;
    Icon: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    type: 'GENERAL' | 'LEGAL' | 'ADMINISTRATIVE';
    companyId: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CompanyDetail {
    id: string;
    companyName: string;
    status: string;
    state: string;
    companyType: string;
    createdAt: string;
    updatedAt: string;
    purchasedPricingPlan: string | null;
    addressPreference: string;
    businessActivity: string;
    customAddress: string;
    monetaryValue: number;
    hiringPlans: string;
    optionPoolHasPool: boolean | null;
    optionPoolShares: number | null;
    optionPoolSize: number | null;
    parValuePerShare: number;
    directors: any[];
    officers: any[];
    optionees: any[];
    shareholders: any[];
    technologyDevelopers: any[];
    formationSteps: FormationStep[];
    companyUsers: CompanyUser[];
  }
  
  export interface FormationStep {
    id: string;
    title: string;
    description: string;
    icon: string;
    order: number;
    status: 'pending' | 'completed' | 'failed';
    updatedAt: string;
  }
  
  export interface CompanyUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    telephone: string | null;
    profileImage: string | null;
    role: string;
  }