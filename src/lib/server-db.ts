import fs from 'fs';
import path from 'path';
import type { Item, Claim, StudentRecord } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const ITEMS_FILE = path.join(DATA_DIR, 'items.json');
const CLAIMS_FILE = path.join(DATA_DIR, 'claims.json');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');

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

function ensureDirectoryAndFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(ITEMS_FILE)) {
    fs.writeFileSync(ITEMS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }

  if (!fs.existsSync(CLAIMS_FILE)) {
    fs.writeFileSync(CLAIMS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }

  if (!fs.existsSync(STUDENTS_FILE)) {
    fs.writeFileSync(STUDENTS_FILE, JSON.stringify(initialDefaultStudents, null, 2), 'utf-8');
  }
}

// Server Database Helpers
export const serverDb = {
  getItems(): Item[] {
    try {
      ensureDirectoryAndFiles();
      const raw = fs.readFileSync(ITEMS_FILE, 'utf-8');
      return JSON.parse(raw) as Item[];
    } catch (err) {
      console.error('Error reading items from server DB:', err);
      return [];
    }
  },

  saveItems(items: Item[]): void {
    try {
      ensureDirectoryAndFiles();
      fs.writeFileSync(ITEMS_FILE, JSON.stringify(items, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving items to server DB:', err);
    }
  },

  addItem(newItem: Item): Item {
    const items = this.getItems();
    const updated = [newItem, ...items];
    this.saveItems(updated);
    return newItem;
  },

  updateItem(id: string, updates: Partial<Item>): Item | null {
    const items = this.getItems();
    const idx = items.findIndex((i) => String(i.id) === String(id));
    if (idx === -1) return null;
    const updated = { ...items[idx], ...updates };
    items[idx] = updated;
    this.saveItems(items);
    return updated;
  },

  deleteItem(id: string): boolean {
    const items = this.getItems();
    const filtered = items.filter((i) => String(i.id) !== String(id));
    if (filtered.length === items.length) return false;
    this.saveItems(filtered);
    return true;
  },

  getClaims(): Claim[] {
    try {
      ensureDirectoryAndFiles();
      const raw = fs.readFileSync(CLAIMS_FILE, 'utf-8');
      return JSON.parse(raw) as Claim[];
    } catch (err) {
      console.error('Error reading claims from server DB:', err);
      return [];
    }
  },

  saveClaims(claims: Claim[]): void {
    try {
      ensureDirectoryAndFiles();
      fs.writeFileSync(CLAIMS_FILE, JSON.stringify(claims, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving claims to server DB:', err);
    }
  },

  addClaim(newClaim: Claim): Claim {
    const claims = this.getClaims();
    const updated = [newClaim, ...claims];
    this.saveClaims(updated);
    return newClaim;
  },

  updateClaim(id: string, updates: Partial<Claim>): Claim | null {
    const claims = this.getClaims();
    const idx = claims.findIndex((c) => String(c.id) === String(id));
    if (idx === -1) return null;
    const updated = { ...claims[idx], ...updates };
    claims[idx] = updated;
    this.saveClaims(claims);
    return updated;
  },

  getStudents(): StudentRecord[] {
    try {
      ensureDirectoryAndFiles();
      const raw = fs.readFileSync(STUDENTS_FILE, 'utf-8');
      return JSON.parse(raw) as StudentRecord[];
    } catch (err) {
      console.error('Error reading students from server DB:', err);
      return initialDefaultStudents;
    }
  },

  saveStudents(students: StudentRecord[]): void {
    try {
      ensureDirectoryAndFiles();
      fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving students to server DB:', err);
    }
  },

  addStudent(student: StudentRecord): StudentRecord {
    const students = this.getStudents();
    const updated = [student, ...students];
    this.saveStudents(updated);
    return student;
  },

  updateStudent(email: string, updates: Partial<StudentRecord>): StudentRecord | null {
    const students = this.getStudents();
    const idx = students.findIndex(
      (s) => s.email.toLowerCase() === email.toLowerCase()
    );
    if (idx === -1) return null;
    const updated = { ...students[idx], ...updates };
    students[idx] = updated;
    this.saveStudents(students);
    return updated;
  },
};
