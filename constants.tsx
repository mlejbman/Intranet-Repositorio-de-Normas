
import { UserRole, DocArea, User } from './types';

export const THEME = {
  primary: '#003366', // Deep Blue
  secondary: '#D92121', // Vibrant Red
  accent: '#FFFFFF', // White
};

export const MOCK_USERS: User[] = [
  {
    id: 'demo-admin',
    name: 'Administrador Demo',
    email: 'admin@retail.com.ar',
    role: UserRole.ADMIN,
    area: DocArea.GENERAL
  },
  {
    id: 'demo-editor',
    name: 'Editor de Contenidos',
    email: 'editor@retail.com.ar',
    role: UserRole.EDITOR,
    area: DocArea.IT
  },
  {
    id: 'demo-user',
    name: 'Colaborador Tienda',
    email: 'user@retail.com.ar',
    role: UserRole.USER,
    area: DocArea.OPERATIONS
  }
];

export const MOCK_DOCS = [
  {
    id: '1',
    title: 'Manual de Identidad Corporativa',
    code: 'POL-MKT-001',
    version: '2.3',
    updatedAt: '2024-05-15',
    area: DocArea.COMMERCIAL,
    tags: ['Branding', 'Visual'],
    description: 'Guía oficial para el uso de marca y comunicación visual en locales.',
    status: 'published' as any,
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    id: '2',
    title: 'Política de Control de Inventario',
    code: 'NOR-OPS-012',
    version: '1.0',
    updatedAt: '2024-06-01',
    area: DocArea.OPERATIONS,
    tags: ['Stock', 'Logística'],
    description: 'Procedimiento para el conteo cíclico y auditoría de mercadería.',
    status: 'published' as any,
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  }
];

// Claves para localStorage en modo demo
export const DEMO_USERS_KEY = 'retail_hub_demo_users';
export const DEMO_DOCS_KEY = 'retail_hub_demo_docs';
export const DEMO_AREAS_KEY = 'retail_hub_demo_areas';

export const MOCK_AREAS = Object.values(DocArea).map((name, index) => ({
  id: `area-${index}`,
  name,
  description: `Departamento de ${name}`
}));
