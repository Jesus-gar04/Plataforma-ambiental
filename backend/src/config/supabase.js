import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Cliente con permisos de administrador (service role)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Cliente con permisos normales (anon key)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Helper para Storage
export const storage = {
  // Subir archivo
  uploadFile: async (bucket, path, file, options = {}) => {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          ...options
        });

      if (error) throw error;
      
      // Obtener URL pública
      const { data: urlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(path);

      return {
        success: true,
        path: data.path,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { success: false, error: error.message };
    }
  },

  // Eliminar archivo
  deleteFile: async (bucket, path) => {
    try {
      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener URL pública
  getPublicUrl: (bucket, path) => {
    const { data } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }
};

export default { supabaseAdmin, supabase, storage };