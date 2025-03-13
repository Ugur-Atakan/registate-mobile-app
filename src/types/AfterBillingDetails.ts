export interface Officer {
    id: string;
    name: string;
    title: 'CEO' | 'CFO' | 'President' | 'Secretary';
    email: string;
    phone: string;
    hasSignatureAuthority: boolean;
  }
  
  export interface Shareholder {
    id: string;
    name: string;
    type: 'Founder' | 'Investor';
    stockAmount: number;
    percentage: number;
  }
  
  export interface Optionee {
    id: string;
    name: string;
    role: string;
    optionAmount: number;
  }
  
  export interface TechnologyDeveloper {
    id: string;
    name: string;
    relationship: string;
  }
  

  export interface Director {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: 'Founder' | 'Investor';
  }
  
  export interface AfterBillingFormData {
    totalShares: number;
    parValuePerShare: number;
    directors: Director[];
  }
  

  export interface AfterBillingDetailsFormData {
    companyAddressPreference: {
      type: 'provided' | 'custom';
      customAddress?: string;
    };
    businessActivity: string;
    officers: Officer[];
    shareholders: Shareholder[];
    optionPool: {
      hasPool: boolean;
      poolSize?: number;
    };
    optionees: Optionee[];
    vestingSchedule: string;
    compensationMethod: 'payroll' | 'consultant';
    technologyDevelopers: TechnologyDeveloper[];
    hiringPlans?: string;
  }
