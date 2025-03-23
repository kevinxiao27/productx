import { supabase } from "../clients/supabase.js";
import { GET_ALL, GET_ONE, GET_ONE_DETAILS } from "../utils/rpcFunctions.js";
import { fileTypeFromBuffer } from "file-type";
import { extractAudioFromVideo } from "../utils/extract_audio.js";

import { emitNewAlert, emitUpdatedAlert, emitDeletedAlert } from "../utils/socket.js";
import { v4 as uuidv4 } from "uuid";
import fs, { read } from "fs";
import path from "path";
import os from "os";
import { analyzeDangerFromFile } from "../utils/sentiment.js";
import { generateCompletion } from "../utils/openai.js";

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

    const io = req.app.get("io");
    if (io) {
      io.emit("all", alertEvents);
    }

    return res.json(alertEvents);
  } catch (error) {
    console.error("Error fetching alert events:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single alert event by ID
export const getAlertEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.rpc(GET_ONE, {
      event_id: id
    });

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

    return res.json(data);
  } catch (error) {
    console.error("Error fetching alert event:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getOperatorSummary = async (req, res) => {
  try {
    const { id: operator } = req.params;
    if (!operator) {
      return res.status(400).json({ error: "Operator name is required" });
    }

    // Fetch the operator's alert events using the RPC function
    const { data, error } = await supabase.rpc(GET_ONE_DETAILS, {
      operator_name: operator
    });

    console.log(data)

    if (error) {
      console.error("Supabase RPC error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No events found for this operator" });
    }

    // Concatenate all transcripts
    const transcripts = data
      .filter((event) => event.transcript) // Filter out events with no transcript
      .map((event) => event.transcript)
      .join("\n\n");

    if (!transcripts) {
      return res.status(404).json({ message: "No transcripts found for this operator" });
    }

    // Generate summary using OpenAI
    const summary = await generateCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a safety analyst reviewing emergency operator communications. Provide a concise summary of key events, potential dangers, and operator actions based on the transcripts. Do not make these summaries longer than 50 words."
        },
        {
          role: "user",
          content: `Please summarize the following operator transcripts for ${operator}:\n\n${transcripts}`
        }
      ],
      max_tokens: 250
    });

    const summaryData = {
      operator,
      summary
    };

    // Emit the summary via Socket.IO if available
    const io = req.app.get("io");
    if (io) {
      io.emit("operatorSummary", summaryData);
      console.log(`Emitted operator summary for ${operator}`);
    }

    // Return the summary along with the event data
    res.json(summaryData);
  } catch (error) {
    console.error("Error generating operator summary:", error);
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
    const location = JSON.parse(req.body.location);
    const operator = req.body.operator;
    let priority = req.body.priority;
    let video_url = null;
    let transcript = null;

    if (!priority) priority = "no issue";

    validateLocation(location);
    // let priority = "no issue";
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
      const tempWavPath = path.join(os.tmpdir(), `${uuidv4()}.wav`);
      await extractAudioFromVideo(file.buffer, tempWavPath);

      let transcriptVal = null;
      let dangerLevel = "no issue";
      let topDangerEvents = [];

      try {
        const result = await analyzeDangerFromFile(tempWavPath);
        transcriptVal = result.transcript;
        dangerLevel = result.dangerLevel;
        topDangerEvents = result.topDangerEvents;
      } finally {
        // Clean up the temp .wav file
        try {
          fs.unlinkSync(tempWavPath);
        } catch (cleanupError) {
          console.error("Error cleaning up temporary audio file:", cleanupError);
        }
      }

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

      if (priority !== "no issue") {
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage.from("videos").upload(filePath, file.buffer, {
          contentType: file.mimetype
        });

        if (uploadError) throw uploadError;

        // Get the public URL for the uploaded file
        const { data: urlData } = supabase.storage.from("videos").getPublicUrl(filePath);
        video_url = urlData.publicUrl;
      }
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

    const { data: response, error: readErr } = await supabase.rpc(GET_ONE, {
      event_id: data[0].id
    });

    if (readErr) throw readErr;

    console.log(response);

    // Emit socket event for new alert
    const io = req.app.get("io");
    if (io) {
      emitNewAlert(io, response[0]);
    }
    console.log("Emitted new alert event");
    return res.status(201).json(response[0]);
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
