import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import { CompanyResponse, CompanyStatus } from '../../types/Company';
import { UserCompany } from '../../types/User';
import { setActiveCompanyId } from '../../utils/storage';

interface CompanyState {
  selectedCompany: CompanyResponse;
  companies?: UserCompany[];
  activeCompanyId: string;
}

const initialState: CompanyState = {
   companies: [],
   activeCompanyId: "",
    selectedCompany: {
      id: "",
      companyName: "",
      status: "PAYMENT_PENDING" as CompanyStatus, // Varsayılan status değeri
      state: "", // Örneğin "Delaware", ama başlangıçta boş bırakıyoruz
      companyType: "", // Örneğin "C-Corp"
      createdAt: "", // ISO string; örneğin new Date().toISOString() kullanabilirsin
      updatedAt: null,
      purchasedPricingPlan: null,
      addressPreference: null, // veya "PROVIDED" gibi bir varsayılan değeri de atayabilirsin: "PROVIDED" as AddressPreferenceType
      businessActivity: null,
      customAddress: null,
      monetaryValue: null,
      hiringPlans: null,
      optionPoolHasPool: null,
      optionPoolShares: null,
      optionPoolSize: null,
      parValuePerShare: null,
      formationSteps: [],
      directors: [],
      officers: [],
      optionees: [],
      shareholders: [],
      technologyDevelopers: [],
      companyUsers: [],
      subscriptions:[]
    },
};

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanies: (state, action: PayloadAction<UserCompany[]>) => {
      state.companies = action.payload;
    },
    setActiveCompany: (state, action: PayloadAction<CompanyResponse>) => {
      state.selectedCompany = action.payload
          },
  changeActiveCompany: (state, action: PayloadAction<string>) => {
    console.log('Active company changed:', action.payload);
    state.activeCompanyId = action.payload;
    setActiveCompanyId(action.payload);
  },
  },
});
export const {setActiveCompany,setCompanies,changeActiveCompany} = companySlice.actions;
export const workspaceActions = companySlice.actions;
export default companySlice.reducer;