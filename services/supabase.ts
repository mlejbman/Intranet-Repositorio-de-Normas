
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { Document, UserRole, DocArea, User } from '../types';

const supabaseUrl = 'https://erisopvgumqjknhkjkbw.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_HmNPseYKKfH1OnKkTM57HA_Rr3wtWmi';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  async testConnection(): Promise<boolean> {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('not found')) {
        throw new Error('TABLES_MISSING');
      }
      throw error;
    }
    return true;
  },

  async getDocuments(): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(mapDoc);
  },

  async createDocument(doc: any): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert([doc])
      .select()
      .single();
    
    if (error) throw error;
    return mapDoc(data);
  },

  async updateDocument(id: string, updates: any): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return mapDoc(data);
  },

  async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getProfileByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (error) throw error;
    return data ? mapUser(data) : null;
  },

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return (data || []).map(mapUser);
  },

  async createProfile(user: any): Promise<User> {
    console.log('[SupabaseService] Creating profile with payload:', user);
    const { data, error } = await supabase
      .from('profiles')
      .insert([user])
      .select()
      .single();
    
    if (error) {
      console.error('[SupabaseService] Error creating profile:', error);
      throw error;
    }
    console.log('[SupabaseService] Profile created successfully:', data);
    return mapUser(data);
  },

  async updateProfile(id: string, updates: any): Promise<User> {
    console.log(`[SupabaseService] Updating profile ID: ${id} with updates:`, updates);
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`[SupabaseService] Error updating profile ID: ${id}:`, error);
      throw error;
    }
    console.log(`[SupabaseService] Profile ID: ${id} updated successfully:`, data);
    return mapUser(data);
  },

  async deleteProfile(id: string): Promise<void> {
    console.log(`[SupabaseService] Deleting profile ID: ${id}`);
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`[SupabaseService] Error deleting profile ID: ${id}:`, error);
      throw error;
    }
    console.log(`[SupabaseService] Profile ID: ${id} deleted successfully.`);
  }
};
