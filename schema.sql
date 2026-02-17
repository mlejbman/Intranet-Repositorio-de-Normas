
-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Limpieza de esquema previo
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS profiles;
DROP TYPE IF EXISTS user_role;
DROP TYPE IF EXISTS doc_area;

-- 3. Definición de Tipos Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'EDITOR', 'USER');
CREATE TYPE doc_area AS ENUM (
  'General', 
  'Administración y Finanzas', 
  'Comercial', 
  'Operaciones', 
  'Capital Humano', 
  'Sistemas'
);

-- 4. Creación de Tabla de Perfiles (Usuarios)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'USER',
  area doc_area DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Creación de Tabla de Documentos (Normativas)
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  version TEXT NOT NULL DEFAULT '1.0',
  description TEXT,
  content TEXT,
  file_url TEXT, -- Columna para el enlace de descarga física
  area doc_area NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('published', 'draft', 'archived')) DEFAULT 'published',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Configuración de Seguridad (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 7. Políticas de Acceso (Simplificadas para entorno Demo)
CREATE POLICY "Acceso total lectura" ON profiles FOR SELECT USING (true);
CREATE POLICY "Acceso total lectura docs" ON documents FOR SELECT USING (true);
CREATE POLICY "Gestión total docs" ON documents FOR ALL USING (true);
CREATE POLICY "Gestión perfiles" ON profiles FOR ALL USING (true);
