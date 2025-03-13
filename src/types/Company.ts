export type CompanyStatus = 'ACTIVE' | 'INACTIVE' | 'PAID' | 'PAYMENT_PENDING' | 'INPROGRESS' | 'APPROVED' | 'REJECTED';
export type AddressPreferenceType = 'PROVIDED' | 'CUSTOM';
export type FormationStatus = 'completed' | 'in_progress' | 'pending'|'error'|'other';
export type DirectorRole = 'FOUNDER' | 'INVESTOR';
export type OfficerTitle = 'CEO' | 'CFO' | 'PRESIDENT' | 'SECRETARY';
export type ShareholderType = 'FOUNDER' | 'INVESTOR';
export type CompanyRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'SUPERADMIN';

// Ana şirket interface'i
export interface CompanyResponse {
  id: string;
  companyName: string;
  status: CompanyStatus;
  state: string; // Örneğin "Delaware"
  companyType: string; // Örneğin "C-Corp"
  createdAt: string; // ISO formatında tarih (örn. "2025-02-03T20:48:19.088Z")
  updatedAt: string|null;
  purchasedPricingPlan: string|null;
  addressPreference?: AddressPreferenceType|null;
  businessActivity?: string|null;
  customAddress?: string|null;
  monetaryValue?: number|null;
  hiringPlans?: string | null;
  optionPoolHasPool?: boolean | null;
  optionPoolShares?: number | null;
  optionPoolSize?: number | null;
  parValuePerShare?: number | null;
  formationSteps: FormationStep[];
  directors?: Director[];
  officers?: Officer[];
  optionees?: Optionee[];
  shareholders: Shareholder[];
  technologyDevelopers?: TechnologyDeveloper[];
  companyUsers: CompanyUserResponse[];
  subscriptions: any[];
}

// Formation adımları
export interface FormationStep {
  status: FormationStatus;
  updatedAt: string;
  id: string;
  title?: string | null;
  description?: string | null;
  icon?: string | null;
  order?: number | null;
}

// Director (Yönetici) bilgileri
export interface Director {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: DirectorRole;
  companyId: string;
}

// Officer (Yetkili) bilgileri
export interface Officer {
  id: string;
  name: string;
  title: OfficerTitle;
  email: string;
  phone: string;
  hasSignatureAuthority: boolean;
  companyId: string;
}

// Optionee (Opsiyon hakkı sahibi)
export interface Optionee {
  id: string;
  name: string;
  role: string;
  optionAmount: number;
  companyId: string;
}

// Shareholder (Hissedar) bilgileri
export interface Shareholder {
  id: string;
  name: string;
  type: ShareholderType;
  stockAmount: number;
  percentage: number;
  companyId: string;
}

export interface TechnologyDeveloper {
  id: string;
  name: string;
  relationship: string;
  companyId: string;
}

export interface CompanyUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  telephone?: string | null;
  profileImage?: string | null;
  role: CompanyRole;
}
