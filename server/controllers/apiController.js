import { supabase } from "../clients/supabase.js";

// Get all alert events
export const getAllAlertEvents = async (req, res) => {
  try {
    const { data, error } = await supabase.from("AlertEventLogs").select("*").order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error fetching alert events:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single alert event by ID
export const getAlertEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from("AlertEventLogs").select("*").eq("id", id).single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ error: "Alert event not found" });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching alert event:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new alert event
export const createAlertEvent = async (req, res) => {
  try {
    const { location, operator, priority, transcript, video_url } = req.body;

    const { data, error } = await supabase
      .from("AlertEventLogs")
      .insert([{ location, operator, priority, transcript, video_url }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error creating alert event:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update an alert event
export const updateAlertEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { location, operator, priority, transcript, video_url } = req.body;

    const { data, error } = await supabase
      .from("AlertEventLogs")
      .update({ location, operator, priority, transcript, video_url })
      .eq("id", id)
      .select();

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).json({ error: "Alert event not found" });
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error updating alert event:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete an alert event
export const deleteAlertEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("AlertEventLogs").delete().eq("id", id);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting alert event:", error);
    res.status(500).json({ error: error.message });
  }
};
