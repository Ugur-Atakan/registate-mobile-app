  export interface UserCreate {
  fullName: string;
  email: string;
  createdAt: any; // Firebase Timestamp type
}
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserInterface {
user: User;
tokens: Tokens;
}

export interface UserCompany {
  companyId: string;
  companyName: string;
  role: string;
  createdAt: string;
  state: string;
  status: string;
}

export interface SignInResponse {
  user: User;
  tokens: Tokens;
}

interface Message {
  message: string;
  isStaff: boolean;
  createdAt: string;
}

interface Ticket {
  id: string;
  ticketNo: number;
  userId: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  isActivate: boolean;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  telephone: string | null;
  profileImage: string | null;
  notifications: boolean;
  emailConfirmed: boolean;
  telephoneConfirmed: boolean;
  createdAt: string;
  customerStripeID: string | null;
  enableToken: string;
  deletedAt: string | null;
  isActive: boolean;
  loginProvider: string;
  companies: UserCompany[];
  roles: string[];
  tickets: Ticket[];
}

export interface UsersApiResponse {
  code: number;
  message: string;
  user: User;
}
