import { supabase } from './supabaseClient';

// Upload file to storage
export const uploadFile = async (bucketName, filePath, file) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
      
    if (error) {
      console.error('Upload error:', error.message);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Upload error:', error.message);
    throw error;
  }
};

// Get public URL for a file
export const getFileUrl = (bucketName, filePath) => {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
};
