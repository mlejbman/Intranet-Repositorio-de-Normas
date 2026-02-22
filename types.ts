
export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  USER = 'USER'
}

export enum DocArea {
  GENERAL = 'General',
  FINANCE = 'Administración y Finanzas',
  COMMERCIAL = 'Comercial',
  OPERATIONS = 'Operaciones',
  HR = 'Capital Humano',
  IT = 'Sistemas'
}

export interface Document {
  id: string;
  title: string;
  code: string;
  version: string;
  updatedAt: string;
  area: string; // Soporta DocArea o áreas dinámicas
  tags: string[];
  description: string;
  content?: string;
  fileUrl?: string;
  status: 'published' | 'draft' | 'archived';
  createdBy?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  area: string; // Soporta DocArea o áreas dinámicas
  createdAt?: string;
}

export interface Area {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
}
