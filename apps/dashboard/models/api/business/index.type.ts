/* 
Payload for add & edit bussiness
*/
export interface BussinessPld {
  logo: string;
  name: string;
  description: string;
}

/* 
Response for get business joined by user
*/
export interface BusinessDetailRes {
  id: string;
  name: string;
  description: string;
  logo: string;
  createdA?: string;
  updatedAt?: string;
  members?: Member[];
  information: BusinessInformation;
  userPosition: UserPosition;
}
export interface BusinessRes {
  id: string;
  name: string;
  description: string;
  logo?: string;
  createdA?: string;
  updatedAt?: string;
  members?: Member[];
  userPosition?: UserPosition;
}

export interface BusinessInformation {
  knowledge: {
    business: boolean;
    product: boolean;
    role: boolean;
    rss: boolean;
  };
  social: {
    linkedIn: boolean;
  };
  scheduler: {
    timeZone: boolean;
  };
}

export interface Member {
  id: string;
  status: string;
  role: MemberRole;
  profile: {
    name: string;
    email: string;
    image: string;
    id: string;
  };
}

export type MemberRole = "Owner" | "Member" | "Admin";

export interface UserPosition {
  status: string;
  role: MemberRole;
  profile: {
    name: string;
    email: string;
    image: string;
    id: string;
  };
}
