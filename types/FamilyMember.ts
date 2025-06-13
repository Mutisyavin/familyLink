export interface SocialMediaProfiles {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  tiktok?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  gender: "male" | "female" | "other";
  photoUri?: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  birthPlace?: string;
  occupation?: string;
  biography?: string;
  socialMedia: SocialMediaProfiles;
  relationships: {
    parents: string[];
    siblings: string[];
    spouses: string[];
    children: string[];
  };
  voiceNoteUri?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreeNode {
  id: string;
  member: FamilyMember;
  x: number;
  y: number;
  generation: number;
}

export interface TreeConnection {
  from: string;
  to: string;
  type: 'parent' | 'spouse' | 'sibling';
}

export interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  avatarUri?: string;
  trees: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FamilyTree {
  id: string;
  ownerId: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  members: FamilyMember[];
  invitedEmails: string[];
  collaborators: {
    userId: string;
    role: 'admin' | 'editor' | 'viewer';
    joinedAt: string;
  }[];
}