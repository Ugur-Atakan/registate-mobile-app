export interface Recurring {
    interval: string;
    interval_count: number;
  }
  
export interface Price {
    id: string;
    productId: string;
    isDefault: boolean;
    stripePriceId: string;
    isActivePlan?: boolean;
    type: "one_time" | "recurring";
    recurringId: string | null;
    unit_amount: number;
    currency: string;
    lookup_key: string | null;
    description: string;
    features: string[];
    name: string;
    createdAt: string;
    updatedAt: string;
    active: boolean;
    recurring: Recurring | null;
  }
  
export interface Product {
    id: string;
    stripeProductId: string;
    active: boolean;
    name: string;
    isActiveProduct?: boolean;
    description: string;
    marketing_features: string[];
    metadata: any | null;
    features: string[];
    productType: string;
    isFeatured: boolean;
    defaultPriceId: string | null;
    createdAt: string;
    updatedAt: string;
    processingTime?: string;
    requirements?: string[];
    benefits?: string[];
    additionalFees?: number;
    prices: Price[];
  }
  
  

  export interface ServicePriceInput {
    name: string;
    isDefault: boolean;
    stripePriceId: string;
    type: 'one_time' | 'recurring';
    recurring?: {
      interval: 'day' | 'week' | 'month' | 'year';
      interval_count: number;
    };
    unit_amount: number;
    currency: string;
    lookup_key?: string;
    description: string;
  }
  
  export interface ServiceInput {
    stripeProductId?: string;
    name: string;
    description: string;
    features: string[];
    isFeatured: boolean;
    productType: 'PRODUCT' | 'SERVICE';
    prices: ServicePriceInput[];
  }