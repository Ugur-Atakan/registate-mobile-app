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
