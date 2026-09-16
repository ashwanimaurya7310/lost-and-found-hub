export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  studentId?: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentId: string;
  password?: string;
  registeredAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category: Category;
  status: 'lost' | 'found';
  location: string;
  date: string;
  imageUrl: string;
  imageHint: string;
  userId: string;
  isPublic?: boolean;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  createdAt?: number | string;
  reporterName?: string;
  reporterContact?: string;
}

export interface Claim {
  id: string;
  itemId: string;
  userId: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
}
