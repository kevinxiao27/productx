import { supabase } from "../clients/supabase.js";
import { GET_ALL } from "../utils/rpcFunctions.js";
import { emitNewAlert, emitUpdatedAlert, emitDeletedAlert } from "../utils/socket.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import os from "os";
import { analyzeDangerFromFile } from "../utils/sentiment.js";

// Function to convert WKT to GeoJSON
const convertWKTToGeoJSON = (wkt) => {
  const coordinates = wkt
    // .replace(/POINT\(([^)]+)\)/, "$1")
    .trim()
    .split(" ");
  return {
    type: "Point",
    coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
  };
};

// Get all alert events
export const getAllAlertEvents = async (req, res) => {
  try {
    // Fetch the data using the PostgreSQL function
    const { data, error } = await supabase.rpc(GET_ALL);

    if (error) throw error;

    // Convert the location to GeoJSON format for each alert event
    const alertEvents = data.map((event) => ({
      id: event.id,
      created_at: event.created_at,
      danger_words: event.danger_words,
      operator: event.operator,
      priority: event.priority,
      transcript: event.transcript,
      video_url: event.video_url,
      location:
        event.longitude !== null && event.latitude !== null
          ? {
              type: "Point",
              coordinates: [event.longitude, event.latitude]
            }
          : null
    }));

    res.json(alertEvents);
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

    // Convert location from WKT to GeoJSON
    if (data.location) {
      data.location = convertWKTToGeoJSON(data.location);
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching alert event:", error);
    res.status(500).json({ error: error.message });
  }
};

// Function to validate the location format
const validateLocation = (location) => {
  console.log(location);
  console.log(location.coordinates);
  if (!location || !location.coordinates || location.coordinates.length !== 2) {
    throw new Error("Invalid location format. Must include coordinates as an array of two numbers.");
  }

  const [longitude, latitude] = location.coordinates;
};

// Create a new alert event
export const createAlertEvent = async (req, res) => {
  try {
    const { location, operator } = req.body;
    let video_url = null;
    let transcript = null;

    validateLocation(location);
    let priority = "no issue";
    let danger_words = {};
    // Handle video upload and audio analysis if a file was provided

    const file = req.file;
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    // First, create a temporary file for audio analysis
    // const tempDir = path.join(os.tmpdir(), 'audio_analysis');
    // fs.mkdirSync(tempDir, { recursive: true });
    // const tempFilePath = path.join(tempDir, fileName);

    // Write the buffer to the temporary file
    // fs.writeFileSync(tempFilePath, file.buffer);

    if (!req.file) {
      return res.status(409).json({ error: "no file included" });
    }

    try {
      // Analyze the audio from the video file
      // console.log(`Analyzing audio from uploaded file: ${tempFilePath}`);
      const { transcript: transcriptVal, dangerLevel, topDangerEvents } = await analyzeDangerFromFile(file.buffer);

      transcript = transcriptVal;
      priority = dangerLevel;
      danger_words = topDangerEvents;

      // @TODO pass transcript through LLM

      console.log("Analysis results:", { dangerLevel, transcript });
    } catch (analysisError) {
      console.error("Error analyzing audio:", analysisError);
      // Continue with upload even if analysis fails
    } finally {
      // Clean up the temporary file
      // try {
      //   fs.unlinkSync(tempFilePath);
      // } catch (cleanupError) {
      //   console.error('Error cleaning up temporary file:', cleanupError);
      // }

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage.from("videos").upload(filePath, file.buffer, {
        contentType: file.mimetype
      });

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage.from("videos").getPublicUrl(filePath);
      video_url = urlData.publicUrl;
    }

    // Convert location to WKT format
    const wktLocation = `POINT(${location.coordinates[0]} ${location.coordinates[1]})`;

    // Insert data into the database
    const { data, error } = await supabase
      .from("AlertEventLogs")
      .insert([
        {
          location: wktLocation,
          operator,
          priority, // Use analysis result if priority not provided
          transcript,
          video_url,
          danger_words // Add the danger level from sentiment analysis
        }
      ])
      .select();

    if (error) throw error;

    // Emit socket event for new alert
    const io = req.app.get("io");
    if (io) {
      emitNewAlert(io, data[0]);
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error creating alert event:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete an alert event
export const deleteAlertEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("AlertEventLogs").delete().eq("id", id);

    if (error) throw error;

    // Emit socket event for deleted alert
    const io = req.app.get("io");
    if (io) {
      emitDeletedAlert(io, id);
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting alert event:", error);
    res.status(500).json({ error: error.message });
  }
};
