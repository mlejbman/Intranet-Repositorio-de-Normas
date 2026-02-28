
import { createClient } from '@supabase/supabase-js';
import { Document, UserRole, DocArea, User, Area } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback values for development/demo if environment variables are missing
const DEFAULT_URL = 'https://erisopvgumqjknhkjkbw.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyaXNvcHZndW1xamtuaGtqa2J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MzQ3MjYsImV4cCI6MjA4NjExMDcyNn0._YalZtQL15DV9501o9P1i5tBu-j0Fpm9AA5abshpVCg';

const finalUrl = supabaseUrl || DEFAULT_URL;
const finalKey = supabaseAnonKey || DEFAULT_KEY;

const isConfigured = () => {
  return !!finalUrl && !!finalKey && !finalKey.startsWith('your_');
};

let _supabase: any = null;
const getSupabase = () => {
  if (!_supabase) {
    if (!finalUrl || !finalKey) {
      console.error('[Supabase] Missing URL or Anon Key. Please check your environment variables.');
      throw new Error('SUPABASE_NOT_CONFIGURED');
    }
    try {
      console.log(`[Supabase] Initializing client with URL: ${finalUrl}`);
      _supabase = createClient(finalUrl, finalKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
    } catch (err) {
      console.error('[Supabase] Initialization error:', err);
      throw err;
    }
  }
  return _supabase;
};

// Helper to wrap promises with a timeout
async function withTimeout(promise: any, timeoutMs: number = 10000): Promise<any> {
  const timeoutPromise = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
}

const mapDoc = (dbDoc: any): Document => ({
  id: dbDoc.id,
  title: dbDoc.title,
  code: dbDoc.code,
  version: dbDoc.version,
  description: dbDoc.description || '',
  content: dbDoc.content || '',
  fileUrl: dbDoc.file_url || '',
  area: dbDoc.area as DocArea,
  tags: dbDoc.tags || [],
  status: dbDoc.status || 'published',
  updatedAt: dbDoc.updated_at || new Date().toISOString(),
  createdBy: dbDoc.created_by
});

const mapUser = (dbUser: any): User => ({
  id: dbUser.id,
  name: dbUser.name,
  email: dbUser.email,
  role: dbUser.role as UserRole,
  area: dbUser.area as DocArea,
  createdAt: dbUser.created_at
});

export const supabaseService = {
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!isConfigured()) return { success: false, error: 'SUPABASE_NOT_CONFIGURED' };
    try {
      const { error } = await withTimeout(getSupabase().from('profiles').select('id').limit(1));
      if (error) {
        console.error('[Supabase] Query error during connection test:', error);
        if (error.message.includes('schema cache') || error.message.includes('not found')) {
          return { success: false, error: 'TABLES_MISSING' };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.error('[Supabase] Connection test failed:', err);
      return { success: false, error: err.message || 'CONNECTION_FAILED' };
    }
  },

  async getDocuments(): Promise<Document[]> {
    if (!isConfigured()) return [];
    try {
      const { data, error } = await withTimeout(getSupabase()
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false }));
      
      if (error) throw error;
      return (data || []).map(mapDoc);
    } catch (err) {
      console.error('[Supabase] Error fetching documents:', err);
      return []; // Return empty array on error to allow demo mode fallback
    }
  },

  async createDocument(doc: any): Promise<Document> {
    const { data, error } = await getSupabase()
      .from('documents')
      .insert([doc])
      .select()
      .single();
    
    if (error) throw error;
    return mapDoc(data);
  },

  async updateDocument(id: string, updates: any): Promise<Document> {
    const { data, error } = await getSupabase()
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapDoc(data);
  },

  async deleteDocument(id: string): Promise<void> {
    const { error } = await getSupabase()
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getProfileByEmail(email: string): Promise<User | null> {
    const { data, error } = await getSupabase()
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (error) throw error;
    return data ? mapUser(data) : null;
  },

  async getUsers(): Promise<User[]> {
    if (!isConfigured()) return [];
    try {
      const { data, error } = await withTimeout(getSupabase()
        .from('profiles')
        .select('*')
        .order('name', { ascending: true }));
      
      if (error) throw error;
      return (data || []).map(mapUser);
    } catch (err) {
      console.error('[Supabase] Error fetching users:', err);
      return []; // Return empty array on error to allow demo mode fallback
    }
  },

  async createProfile(user: any): Promise<User> {
    const { data, error } = await getSupabase()
      .from('profiles')
      .insert([user])
      .select()
      .single();
    
    if (error) throw error;
    return mapUser(data);
  },

  async updateProfile(id: string, updates: any): Promise<User> {
    const { data, error } = await getSupabase()
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapUser(data);
  },

  async deleteProfile(id: string): Promise<void> {
    const { error } = await getSupabase()
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getAreas(): Promise<Area[]> {
    try {
      const { data, error } = await withTimeout(getSupabase()
        .from('areas')
        .select('*')
        .order('name', { ascending: true }));
      
      if (error) {
        if (error.message && error.message.includes('not found')) return [];
        throw error;
      }
      const sortedAreas = (data || []).map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        createdAt: a.created_at
      })).sort((a, b) => {
        if (a.name === 'General') return -1;
        if (b.name === 'General') return 1;
        return a.name.localeCompare(b.name);
      });
      
      return sortedAreas;
    } catch (err) {
      console.error('[Supabase] Error fetching areas:', err);
      if (err instanceof Error && err.message === 'TIMEOUT') return [];
      throw err;
    }
  },

  async createArea(area: any): Promise<Area> {
    const { data, error } = await getSupabase()
      .from('areas')
      .insert([area])
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: data.created_at
    };
  },

  async updateArea(id: string, updates: any): Promise<Area> {
    const { data, error } = await getSupabase()
      .from('areas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      createdAt: data.created_at
    };
  },

  async deleteArea(id: string): Promise<void> {
    const { error } = await getSupabase()
      .from('areas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
