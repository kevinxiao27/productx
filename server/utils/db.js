import { supabase } from "../config/supabase.js";

// User operations
export const getUser = async (userId) => {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();

  if (error) throw error;
  return data;
};

export const createUser = async (userData) => {
  const { data, error } = await supabase.from("users").insert(userData).select();

  if (error) throw error;
  return data;
};

// Video operations - will integrate with S3
export const getVideos = async (filters = {}) => {
  let query = supabase.from("videos").select("*");

  // Apply any filters
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getVideoById = async (videoId) => {
  const { data, error } = await supabase.from("videos").select("*").eq("id", videoId).single();

  if (error) throw error;
  return data;
};

// Add more database operations as needed
