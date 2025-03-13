export interface OrderDetails {
  id: string;
  status: string;
  amount: number;
  currency: string;
  stripeCheckoutSessionId: string | null;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  orderItems: OrderItem[];
  company: Company;
  user: User;
}

export interface OrderItem {
  type: string;
  quantity: number;
  product: Product;
  price: Price;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  stripeProductId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  stripePriceId: string;
}

export interface Company {
  id: string;
  companyName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  purchasedPricingPlan: PurchasedPricingPlan;
  state: State;
}

export interface PurchasedPricingPlan {
  id: string;
  name: string;
  price: number;
  stripeId: string;
  description: string | null;
  stripePriceId: string;
  subtitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface State {
  id: string;
  name: string;
  abbreviation: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  customerStripeID: string;
}
