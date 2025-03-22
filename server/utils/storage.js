import { supabase } from "../clients/supabase";

// Upload video to Supabase Storage (backed by S3)
export const uploadVideo = async (file, fileName, userId) => {
  const filePath = `videos/${userId}/${fileName}`;

  const { data, error } = await supabase.storage.from("videos").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) throw error;

  // Get the public URL
  const { data: urlData } = supabase.storage.from("videos").getPublicUrl(filePath);

  return {
    path: filePath,
    url: urlData.publicUrl
  };
};

export const getVideoUrl = (filePath) => {
  const { data } = supabase.storage.from("videos").getPublicUrl(filePath);

  return data.publicUrl;
};

export const deleteVideo = async (filePath) => {
  const { error } = await supabase.storage.from("videos").remove([filePath]);

  if (error) throw error;
  return true;
};
