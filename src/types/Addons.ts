export interface Recurring {
  id: string;
  interval: string;
  interval_count: number;
}

export interface AddonPrice {
  id: string;
  name: string;
  unit_amount: number;
  currency: string;
  recurring: Recurring | null;
  stripePriceId: string;
  features: string[];
  type: string;
}

export interface Addon {
  id: string;
  productId: string;
  productName: string;
  description: string;
  features: string[];
  stripeProductId: string;
  isFeatured: boolean;
  defaultPriceId:string;
  prices: AddonPrice[];
  order: number;
}
