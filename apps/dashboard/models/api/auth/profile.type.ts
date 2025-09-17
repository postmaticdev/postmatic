export interface UpdatePasswordPld {
  oldPassword: string;
  newPassword: string;
}
/* 
Payload for update profile
*/
export interface ProfilePld {
  countryCode: string;
  phone: string;
  image: string | null;
  email: string;
  name: string;
  description: string | null;
}

/* 
Response for get profile
*/
export interface ProfileRes {
  id: string;
  email: string;
  name: string;
  countryCode: string | null;
  phone: string | null;
  description: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  users: User[];
  sessions: Session[];
  discountCodes: DiscountCode[];
}

export interface User {
  id: string;
  email: string;
  provider: string;
}

export interface Session {
  id: string;
  refreshToken: string;
  browser: string;
  platform: string;
  profileId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  expiredAt: string | null;
  type: string;
  discount: number;
  maxDiscount: number;
  maxUses: number;
  isReusable: boolean;
  _count: Count;
}

export interface Count {
  discountUsages: number;
}

/* 
Response for get session
*/
export interface SessionRes {
  id: string;
  email: string;
  name: string;
  photo: string;
  iat: number;
  exp: number;
}
