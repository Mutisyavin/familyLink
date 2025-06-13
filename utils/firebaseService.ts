import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, auth, storage } from './firebaseConfig';
import { FamilyTree, FamilyMember, UserAccount } from '@/types/FamilyMember';

export interface CloudSyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  syncInProgress: boolean;
}

export interface CollaborationInvite {
  id: string;
  treeId: string;
  treeName: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  role: 'viewer' | 'editor' | 'admin';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  expiresAt: Date;
}

class FirebaseService {
  private syncStatusCallbacks: ((status: CloudSyncStatus) => void)[] = [];
  private currentSyncStatus: CloudSyncStatus = {
    isOnline: false,
    lastSync: null,
    pendingChanges: 0,
    syncInProgress: false,
  };

  constructor() {
    // Monitor auth state changes
    onAuthStateChanged(auth, (user) => {
      this.updateSyncStatus({ isOnline: !!user });
    });
  }

  // Authentication Methods
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await this.createUserProfile(user.uid, {
        id: user.uid,
        email: email,
        displayName: displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // User Profile Methods
  async createUserProfile(userId: string, userData: UserAccount): Promise<void> {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserAccount | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        } as UserAccount;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Family Tree Cloud Sync Methods
  async syncFamilyTreeToCloud(tree: FamilyTree): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to sync to cloud');
    }

    this.updateSyncStatus({ syncInProgress: true });

    try {
      const treeRef = doc(db, 'familyTrees', tree.id);
      
      // Upload photos and voice notes to Firebase Storage first
      const updatedMembers = await Promise.all(
        tree.members.map(async (member) => {
          const updatedMember = { ...member };
          
          // Upload photo if it's a local file
          if (member.photoUri && member.photoUri.startsWith('file://')) {
            try {
              const photoUrl = await this.uploadFile(member.photoUri, `photos/${tree.id}/${member.id}`);
              updatedMember.photoUri = photoUrl;
            } catch (error) {
              console.warn('Failed to upload photo for member:', member.name, error);
            }
          }
          
          // Upload voice note if it's a local file
          if (member.voiceNoteUri && member.voiceNoteUri.startsWith('file://')) {
            try {
              const voiceUrl = await this.uploadFile(member.voiceNoteUri, `voice-notes/${tree.id}/${member.id}`);
              updatedMember.voiceNoteUri = voiceUrl;
            } catch (error) {
              console.warn('Failed to upload voice note for member:', member.name, error);
            }
          }
          
          return updatedMember;
        })
      );

      const cloudTree = {
        ...tree,
        members: updatedMembers,
        updatedAt: serverTimestamp(),
        lastSyncedAt: serverTimestamp(),
      };

      await setDoc(treeRef, cloudTree, { merge: true });
      
      this.updateSyncStatus({ 
        lastSync: new Date(),
        pendingChanges: 0,
        syncInProgress: false,
      });
    } catch (error) {
      console.error('Error syncing family tree to cloud:', error);
      this.updateSyncStatus({ syncInProgress: false });
      throw error;
    }
  }

  async getFamilyTreeFromCloud(treeId: string): Promise<FamilyTree | null> {
    try {
      const treeDoc = await getDoc(doc(db, 'familyTrees', treeId));
      if (treeDoc.exists()) {
        const data = treeDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          lastSyncedAt: data.lastSyncedAt?.toDate?.()?.toISOString() || data.lastSyncedAt,
        } as FamilyTree;
      }
      return null;
    } catch (error) {
      console.error('Error getting family tree from cloud:', error);
      throw error;
    }
  }

  async getUserFamilyTrees(userId: string): Promise<FamilyTree[]> {
    try {
      const treesQuery = query(
        collection(db, 'familyTrees'),
        where('collaborators', 'array-contains', { userId, role: 'admin' }),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(treesQuery);
      const trees: FamilyTree[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        trees.push({
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          lastSyncedAt: data.lastSyncedAt?.toDate?.()?.toISOString() || data.lastSyncedAt,
        } as FamilyTree);
      });
      
      return trees;
    } catch (error) {
      console.error('Error getting user family trees:', error);
      throw error;
    }
  }

  // Real-time Collaboration Methods
  subscribeToFamilyTree(treeId: string, callback: (tree: FamilyTree | null) => void): () => void {
    const treeRef = doc(db, 'familyTrees', treeId);
    
    return onSnapshot(treeRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const tree: FamilyTree = {
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          lastSyncedAt: data.lastSyncedAt?.toDate?.()?.toISOString() || data.lastSyncedAt,
        } as FamilyTree;
        callback(tree);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error in family tree subscription:', error);
      callback(null);
    });
  }

  // Collaboration Invite Methods
  async sendCollaborationInvite(
    treeId: string,
    treeName: string,
    inviteeEmail: string,
    role: 'viewer' | 'editor' | 'admin'
  ): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to send invites');
    }

    try {
      const inviteId = `${treeId}_${inviteeEmail}_${Date.now()}`;
      const invite: CollaborationInvite = {
        id: inviteId,
        treeId,
        treeName,
        inviterName: auth.currentUser.displayName || 'Unknown',
        inviterEmail: auth.currentUser.email || '',
        inviteeEmail,
        role,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      };

      await setDoc(doc(db, 'collaborationInvites', inviteId), {
        ...invite,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(invite.expiresAt),
      });
    } catch (error) {
      console.error('Error sending collaboration invite:', error);
      throw error;
    }
  }

  async getCollaborationInvites(userEmail: string): Promise<CollaborationInvite[]> {
    try {
      const invitesQuery = query(
        collection(db, 'collaborationInvites'),
        where('inviteeEmail', '==', userEmail),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(invitesQuery);
      const invites: CollaborationInvite[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        invites.push({
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          expiresAt: data.expiresAt?.toDate?.() || new Date(),
        } as CollaborationInvite);
      });
      
      return invites;
    } catch (error) {
      console.error('Error getting collaboration invites:', error);
      throw error;
    }
  }

  async respondToCollaborationInvite(
    inviteId: string,
    response: 'accepted' | 'declined'
  ): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to respond to invites');
    }

    try {
      const inviteRef = doc(db, 'collaborationInvites', inviteId);
      const inviteDoc = await getDoc(inviteRef);
      
      if (!inviteDoc.exists()) {
        throw new Error('Invite not found');
      }

      const invite = inviteDoc.data() as CollaborationInvite;
      
      // Update invite status
      await updateDoc(inviteRef, {
        status: response,
        respondedAt: serverTimestamp(),
      });

      // If accepted, add user to family tree collaborators
      if (response === 'accepted') {
        const treeRef = doc(db, 'familyTrees', invite.treeId);
        const treeDoc = await getDoc(treeRef);
        
        if (treeDoc.exists()) {
          const tree = treeDoc.data() as FamilyTree;
          const updatedCollaborators = [
            ...tree.collaborators,
            {
              userId: auth.currentUser.uid,
              role: invite.role,
              joinedAt: new Date().toISOString(),
            },
          ];
          
          await updateDoc(treeRef, {
            collaborators: updatedCollaborators,
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.error('Error responding to collaboration invite:', error);
      throw error;
    }
  }

  // File Upload Methods
  async uploadFile(localUri: string, cloudPath: string): Promise<string> {
    try {
      const response = await fetch(localUri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, cloudPath);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(cloudPath: string): Promise<void> {
    try {
      const storageRef = ref(storage, cloudPath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Sync Status Management
  private updateSyncStatus(updates: Partial<CloudSyncStatus>): void {
    this.currentSyncStatus = { ...this.currentSyncStatus, ...updates };
    this.syncStatusCallbacks.forEach(callback => callback(this.currentSyncStatus));
  }

  onSyncStatusChange(callback: (status: CloudSyncStatus) => void): () => void {
    this.syncStatusCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.syncStatusCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncStatusCallbacks.splice(index, 1);
      }
    };
  }

  getSyncStatus(): CloudSyncStatus {
    return { ...this.currentSyncStatus };
  }

  // Batch Operations for Performance
  async batchUpdateMembers(treeId: string, memberUpdates: Partial<FamilyMember>[]): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to update members');
    }

    try {
      const batch = writeBatch(db);
      const treeRef = doc(db, 'familyTrees', treeId);
      
      // Get current tree
      const treeDoc = await getDoc(treeRef);
      if (!treeDoc.exists()) {
        throw new Error('Family tree not found');
      }
      
      const tree = treeDoc.data() as FamilyTree;
      const updatedMembers = tree.members.map(member => {
        const update = memberUpdates.find(u => u.id === member.id);
        return update ? { ...member, ...update, updatedAt: new Date().toISOString() } : member;
      });
      
      batch.update(treeRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp(),
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error batch updating members:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService; 