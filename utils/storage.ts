import AsyncStorage from '@react-native-async-storage/async-storage';
import { FamilyMember, UserAccount, FamilyTree } from '@/types/FamilyMember';

const STORAGE_KEYS = {
  FAMILY_MEMBERS: 'legacylink_family_members',
  APP_SETTINGS: 'legacylink_settings',
  USER_DATA: 'legacylink_user_data',
  FAMILY_TREES: 'legacylink_family_trees',
  CURRENT_TREE: 'legacylink_current_tree',
};

export const StorageService = {
  async saveFamilyMembers(members: FamilyMember[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAMILY_MEMBERS, JSON.stringify(members));
    } catch (error) {
      console.error('Error saving family members:', error);
      throw error;
    }
  },

  async loadFamilyMembers(): Promise<FamilyMember[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAMILY_MEMBERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading family members:', error);
      return [];
    }
  },

  async addFamilyMember(member: FamilyMember): Promise<void> {
    try {
      const members = await this.loadFamilyMembers();
      const updatedMembers = [...members, member];
      await this.saveFamilyMembers(updatedMembers);
    } catch (error) {
      console.error('Error adding family member:', error);
      throw error;
    }
  },

  async updateFamilyMember(memberId: string, updates: Partial<FamilyMember>): Promise<void> {
    try {
      const members = await this.loadFamilyMembers();
      const updatedMembers = members.map(member =>
        member.id === memberId
          ? { ...member, ...updates, updatedAt: new Date().toISOString() }
          : member
      );
      await this.saveFamilyMembers(updatedMembers);
    } catch (error) {
      console.error('Error updating family member:', error);
      throw error;
    }
  },

  async deleteFamilyMember(memberId: string): Promise<void> {
    try {
      const members = await this.loadFamilyMembers();
      const updatedMembers = members.filter(member => member.id !== memberId);
      await this.saveFamilyMembers(updatedMembers);
    } catch (error) {
      console.error('Error deleting family member:', error);
      throw error;
    }
  },
};

// User Authentication Functions
export const storeUserData = async (userData: UserAccount): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
    throw error;
  }
};

export const getUserData = async (): Promise<UserAccount | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TREE);
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
};

// Family Tree Functions
export const storeFamilyTree = async (tree: FamilyTree): Promise<void> => {
  try {
    const trees = await getFamilyTrees();
    const existingIndex = trees.findIndex(t => t.id === tree.id);
    
    if (existingIndex >= 0) {
      trees[existingIndex] = tree;
    } else {
      trees.push(tree);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.FAMILY_TREES, JSON.stringify(trees));
  } catch (error) {
    console.error('Error storing family tree:', error);
    throw error;
  }
};

export const getFamilyTrees = async (): Promise<FamilyTree[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FAMILY_TREES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting family trees:', error);
    return [];
  }
};

export const getCurrentTree = async (): Promise<FamilyTree | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TREE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting current tree:', error);
    return null;
  }
};

export const setCurrentTree = async (tree: FamilyTree): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TREE, JSON.stringify(tree));
  } catch (error) {
    console.error('Error setting current tree:', error);
    throw error;
  }
};