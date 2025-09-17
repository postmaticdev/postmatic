/* 
Payload for invite member
*/
export interface MembersInvitePld {
  email: string;
  role: "Member" | "Admin";
}
export interface ResendEmailPld {
  memberId: string;
}

/* 
Response for invite member
*/
export interface MembersInviteRes {
  email: string;
  rootBusinessId: string;
  businessName: string;
  role: string;
  type: string;
  memberId: string;
  profileId: string;
}

/*
Response for get members
*/
export interface MembersRes {
  status: MemberStatus;
  id: string;
  role: MemberRole;
  profile: Profile;
  isYourself: boolean;
}

export type MemberRole = "Member" | "Admin" | "Owner";
export type MemberStatus =
  | "Pending"
  | "Accepted"
  | "Rejected"
  | "Left"
  | "Kicked";

export interface Profile {
  name: string;
  email: string;
  image: string;
  id: string;
}

/*
Payload for Edit member role
*/

export interface EditRolePld {
  memberId: string;
  role: MemberRole;
}
/*
Response for delete member
*/
export interface DeleteMemberRes {
  id: string;
  status: string;
  role: string;
  answeredAt: string | null;
  rootBusinessId: string;
  profileId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
