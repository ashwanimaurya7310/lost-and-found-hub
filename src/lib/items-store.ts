'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Item, Claim, User, StudentRecord } from './types';

const ITEMS_STORAGE_KEY = 'lost_and_found_hub_items_v3';
const CLAIMS_STORAGE_KEY = 'lost_and_found_hub_claims_v3';
const USER_STORAGE_KEY = 'lost_and_found_user_session_v3';
const ADMIN_STORAGE_KEY = 'lost_and_found_admin_session_v3';
const STUDENTS_STORAGE_KEY = 'lost_and_found_hub_students_v3';
const SYNC_EVENT = 'lost-and-found-store-updated';
const AUTH_EVENT = 'lost-and-found-auth-updated';

const initialEmptyItems: Item[] = [];
const initialEmptyClaims: Claim[] = [];
const initialDefaultStudents: StudentRecord[] = [
  {
    id: 'student-demo-1',
    name: 'Aarav Sharma',
    email: 'student@ashoka.com',
    phone: '+91 98765 43210',
    studentId: 'ASHOKA-2024-001',
    password: 'Admin',
    registeredAt: '2024-09-01T00:00:00.000Z',
  },
];

// Helper to safely read from localStorage
function getStoredItems(): Item[] {
  if (typeof window === 'undefined') return initialEmptyItems;
  try {
    const raw = localStorage.getItem(ITEMS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialEmptyItems;
  } catch (error) {
    console.error('Failed to read items from localStorage:', error);
    return initialEmptyItems;
  }
}

function saveStoredItems(items: Item[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch (error) {
    console.error('Failed to save items to localStorage:', error);
  }
}

function getStoredClaims(): Claim[] {
  if (typeof window === 'undefined') return initialEmptyClaims;
  try {
    const raw = localStorage.getItem(CLAIMS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialEmptyClaims;
  } catch (error) {
    console.error('Failed to read claims from localStorage:', error);
    return initialEmptyClaims;
  }
}

function saveStoredClaims(claims: Claim[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(claims));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch (error) {
    console.error('Failed to save claims to localStorage:', error);
  }
}

function getStoredStudents(): StudentRecord[] {
  if (typeof window === 'undefined') return initialDefaultStudents;
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (!raw) return initialDefaultStudents;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialDefaultStudents;
  } catch (error) {
    console.error('Failed to read students from localStorage:', error);
    return initialDefaultStudents;
  }
}

function saveStoredStudents(students: StudentRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
    window.dispatchEvent(new CustomEvent(AUTH_EVENT));
  } catch (error) {
    console.error('Failed to save students to localStorage:', error);
  }
}

// Global async sync helpers
export async function fetchServerData() {
  if (typeof window === 'undefined') return;
  try {
    // 1. Fetch Items
    const itemsRes = await fetch('/api/items', { cache: 'no-store' });
    if (itemsRes.ok) {
      const data = await itemsRes.json();
      if (data.success && Array.isArray(data.items)) {
        saveStoredItems(data.items);
      }
    }

    // 2. Fetch Claims
    const claimsRes = await fetch('/api/claims', { cache: 'no-store' });
    if (claimsRes.ok) {
      const data = await claimsRes.json();
      if (data.success && Array.isArray(data.claims)) {
        saveStoredClaims(data.claims);
      }
    }

    // 3. Fetch Students
    const studentsRes = await fetch('/api/students', { cache: 'no-store' });
    if (studentsRes.ok) {
      const data = await studentsRes.json();
      if (data.success && Array.isArray(data.students)) {
        saveStoredStudents(data.students);
      }
    }
  } catch (err) {
    console.warn('Network sync notice:', err);
  }
}

// Student Store
export const registeredStudentsStore = {
  getAll(): StudentRecord[] {
    return getStoredStudents();
  },

  findByIdentifier(identifier: string): StudentRecord | undefined {
    const clean = identifier.trim().toLowerCase();
    const students = getStoredStudents();
    return students.find(
      (s) =>
        s.email.toLowerCase() === clean ||
        s.studentId.toLowerCase() === clean ||
        s.phone.replace(/[^0-9]/g, '') === clean.replace(/[^0-9]/g, '')
    );
  },

  generateStudentId(): string {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `ASH-${year}-${randomNum}`;
  },

  register(data: {
    name: string;
    email: string;
    phone: string;
    studentId?: string;
    password: string;
  }): { success: boolean; error?: string; student?: StudentRecord } {
    const all = getStoredStudents();
    const emailClean = data.email.trim().toLowerCase();
    const studentIdClean =
      (data.studentId && data.studentId.trim().toUpperCase()) || this.generateStudentId();

    if (all.some((s) => s.email.toLowerCase() === emailClean)) {
      return { success: false, error: 'A student with this Gmail address is already registered.' };
    }

    if (all.some((s) => s.studentId.toUpperCase() === studentIdClean)) {
      return { success: false, error: 'This Student ID is already registered.' };
    }

    const newStudent: StudentRecord = {
      id: `student_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      email: emailClean,
      phone: data.phone.trim(),
      studentId: studentIdClean,
      password: data.password,
      registeredAt: new Date().toISOString(),
    };

    const updated = [newStudent, ...all];
    saveStoredStudents(updated);

    // Sync to server asynchronously
    if (typeof window !== 'undefined') {
      fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      }).catch(console.error);
    }

    return { success: true, student: newStudent };
  },

  authenticate(
    identifier: string,
    passwordAttempt: string
  ): { success: boolean; error?: string; student?: StudentRecord } {
    const cleanId = identifier.trim().toLowerCase();
    const student = this.findByIdentifier(cleanId);

    if (!student) {
      if (cleanId === 'student@ashoka.com' || cleanId === 'ashoka-2024-001' || cleanId === 'admin') {
        if (passwordAttempt.trim().toLowerCase() === 'admin') {
          return {
            success: true,
            student: initialDefaultStudents[0],
          };
        }
      }
      return {
        success: false,
        error: 'No registered student found with this Gmail or Student ID. Please register first.',
      };
    }

    if (student.password && student.password !== passwordAttempt) {
      if (student.email === 'student@ashoka.com' && passwordAttempt.trim().toLowerCase() === 'admin') {
        return { success: true, student };
      }
      return { success: false, error: 'Incorrect password. Please check and try again.' };
    }

    return { success: true, student };
  },

  updateStudentPassword(email: string, newPassword: string): boolean {
    const all = getStoredStudents();
    const idx = all.findIndex((s) => s.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return false;
    all[idx] = { ...all[idx], password: newPassword, resetPasswordToken: undefined, resetPasswordExpiry: undefined };
    saveStoredStudents(all);
    return true;
  },
};

// Session Store
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  studentId?: string;
  role: 'user' | 'admin';
}

export const authStore = {
  getCurrentUser(): SessionUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser(user: SessionUser): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user session to localStorage:', e);
    }
    window.dispatchEvent(new CustomEvent(AUTH_EVENT));
  },

  logoutUser(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to remove user session from localStorage:', e);
    }
    window.dispatchEvent(new CustomEvent(AUTH_EVENT));
  },

  getAdminUser(): SessionUser | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setAdmin(admin: SessionUser): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
    } catch (e) {
      console.warn('Failed to save admin session to localStorage:', e);
    }
    window.dispatchEvent(new CustomEvent(AUTH_EVENT));
  },

  logoutAdmin(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to remove admin session from localStorage:', e);
    }
    window.dispatchEvent(new CustomEvent(AUTH_EVENT));
  },

  isAdminAuthenticated(): boolean {
    const admin = this.getAdminUser();
    return Boolean(admin && admin.role === 'admin');
  },
};

// Items & Claims Store
export const itemsStore = {
  getAll(): Item[] {
    return getStoredItems();
  },

  getPublic(): Item[] {
    return getStoredItems().filter(
      (item) => item.isPublic !== false && item.moderationStatus === 'approved'
    );
  },

  getPending(): Item[] {
    return getStoredItems().filter(
      (item) => item.moderationStatus === 'pending' || item.isPublic === false
    );
  },

  getByUserId(userId: string): Item[] {
    return getStoredItems().filter((item) => item.userId === userId);
  },

  getById(id: string): Item | undefined {
    const all = getStoredItems();
    return all.find((item) => String(item.id) === String(id));
  },

  add(newItem: Omit<Item, 'id'> & { id?: string }): Item {
    const all = getStoredItems();
    const currentUser = authStore.getCurrentUser();
    
    // IMPORTANT: Reports start with isPublic: false and moderationStatus: 'pending'
    // so they FIRST appear only on Admin ID for moderation!
    const created: Item = {
      ...newItem,
      id: newItem.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: newItem.createdAt || Date.now(),
      isPublic: false,
      moderationStatus: 'pending',
      userId: newItem.userId || currentUser?.email || 'user-current',
      reporterName: newItem.reporterName || currentUser?.name || 'Student Reporter',
      reporterContact:
        newItem.reporterContact ||
        currentUser?.phone ||
        (currentUser?.studentId ? `ID: ${currentUser.studentId}` : currentUser?.email) ||
        '',
    };

    const updated = [created, ...all];
    saveStoredItems(updated);

    // Sync to server database immediately
    if (typeof window !== 'undefined') {
      fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.item) {
            // Updated item confirmed by server
          }
        })
        .catch(console.error);
    }

    return created;
  },

  update(id: string, updates: Partial<Item>): Item | null {
    const all = getStoredItems();
    const index = all.findIndex((i) => String(i.id) === String(id));
    if (index === -1) return null;

    const updatedItem = { ...all[index], ...updates };
    all[index] = updatedItem;
    saveStoredItems(all);

    // Sync update to server
    if (typeof window !== 'undefined') {
      fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).catch(console.error);
    }

    return updatedItem;
  },

  setModerationStatus(
    id: string,
    status: 'approved' | 'rejected' | 'pending',
    makePublic?: boolean
  ): Item | null {
    const isPublic = makePublic !== undefined ? makePublic : status === 'approved';
    return this.update(id, {
      moderationStatus: status,
      isPublic,
    });
  },

  remove(id: string): boolean {
    const all = getStoredItems();
    const filtered = all.filter((i) => String(i.id) !== String(id));
    if (filtered.length === all.length) return false;
    saveStoredItems(filtered);

    // Delete on server
    if (typeof window !== 'undefined') {
      fetch(`/api/items/${id}`, {
        method: 'DELETE',
      }).catch(console.error);
    }

    return true;
  },

  getClaims(): Claim[] {
    return getStoredClaims();
  },

  getClaimsByUserId(userId: string): Claim[] {
    return getStoredClaims().filter((c) => c.userId === userId);
  },

  addClaim(claim: Omit<Claim, 'id' | 'date'>): Claim {
    const all = getStoredClaims();
    const currentUser = authStore.getCurrentUser();
    const created: Claim = {
      ...claim,
      id: `claim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: claim.userId || currentUser?.email || 'user-current',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    saveStoredClaims([created, ...all]);

    if (typeof window !== 'undefined') {
      fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      }).catch(console.error);
    }

    return created;
  },

  updateClaimStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Claim | null {
    const all = getStoredClaims();
    const index = all.findIndex((c) => String(c.id) === String(id));
    if (index === -1) return null;
    all[index] = { ...all[index], status };
    saveStoredClaims(all);

    if (typeof window !== 'undefined') {
      fetch(`/api/claims/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).catch(console.error);
    }

    return all[index];
  },
};

// React Hook for live reactive state
export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [adminUser, setAdminUser] = useState<SessionUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setItems(getStoredItems());
    setClaims(getStoredClaims());
    setCurrentUser(authStore.getCurrentUser());
    setAdminUser(authStore.getAdminUser());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refresh();

    // Fetch live data from server on mount
    fetchServerData().then(() => {
      refresh();
    });

    // Auto-poll server periodically (only when window/tab is active)
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchServerData().then(() => {
          refresh();
        });
      }
    }, 6000);

    const handleSync = () => {
      refresh();
    };

    window.addEventListener(SYNC_EVENT, handleSync);
    window.addEventListener(AUTH_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener(SYNC_EVENT, handleSync);
      window.removeEventListener(AUTH_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [refresh]);

  const publicItems = items.filter(
    (item) => item.isPublic !== false && item.moderationStatus === 'approved'
  );

  const pendingItems = items.filter(
    (item) => item.moderationStatus === 'pending' || item.isPublic === false
  );

  const userIdentifier = currentUser?.email || currentUser?.id || '';
  const myItems = currentUser
    ? items.filter(
        (item) =>
          (userIdentifier && item.userId === userIdentifier) ||
          (currentUser.email && item.userId === currentUser.email) ||
          (currentUser.studentId && item.userId === currentUser.studentId)
      )
    : [];


  const myLostCount = myItems.filter((i) => i.status === 'lost').length;
  const myFoundCount = myItems.filter((i) => i.status === 'found').length;
  const myClaims = currentUser
    ? claims.filter(
        (c) =>
          (userIdentifier && c.userId === userIdentifier) ||
          (currentUser.email && c.userId === currentUser.email)
      )
    : [];


  const addItem = useCallback((item: Omit<Item, 'id'> & { id?: string }) => {
    const created = itemsStore.add(item);
    refresh();
    return created;
  }, [refresh]);

  const updateItem = useCallback((id: string, updates: Partial<Item>) => {
    const updated = itemsStore.update(id, updates);
    refresh();
    return updated;
  }, [refresh]);

  const setModerationStatus = useCallback(
    (id: string, status: 'approved' | 'rejected' | 'pending', makePublic?: boolean) => {
      const res = itemsStore.setModerationStatus(id, status, makePublic);
      refresh();
      return res;
    },
    [refresh]
  );

  const deleteItem = useCallback((id: string) => {
    const res = itemsStore.remove(id);
    refresh();
    return res;
  }, [refresh]);

  const addClaim = useCallback(
    (claim: Omit<Claim, 'id' | 'date'>) => {
      const res = itemsStore.addClaim(claim);
      refresh();
      return res;
    },
    [refresh]
  );

  const updateClaimStatus = useCallback(
    (id: string, status: 'pending' | 'approved' | 'rejected') => {
      const res = itemsStore.updateClaimStatus(id, status);
      refresh();
      return res;
    },
    [refresh]
  );

  return {
    items,
    publicItems,
    pendingItems,
    myItems,
    myLostCount,
    myFoundCount,
    myClaims,
    claims,
    currentUser,
    adminUser,
    isAdmin: Boolean(adminUser && adminUser.role === 'admin'),
    isLoaded,
    refresh,
    addItem,
    updateItem,
    setModerationStatus,
    deleteItem,
    addClaim,
    updateClaimStatus,
  };
}
