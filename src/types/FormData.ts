import { Addon } from "./Addons";

export type CompanyType = "LLC" | "C-CORP" | null;
export type StateType = "Wyoming" | "Delaware" | null;
export type CompanyDesignator =
  | "LLC"
  | "L.L.C"
  | "Limited Liability Company"
  | "Corp."
  | "Corporation"
  | "Co."
  | "Inc."
  | "Incorporated"
  | null;

export interface FormationFormData {
  companyType: CompanyType;
  registrationState: StateType;
  companyName: string;
  companyDesignator: CompanyDesignator;
  selectedPlan: any |null;
  upsellProducts: any[];
}


export interface AddonsProps {
  addonData: Addon;
  prevStep: () => void;
  nextStep: () => void;
}
