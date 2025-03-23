export interface Unit {
  id: string;
  name: string;
  role: string;
  status: string;
}

export interface TranscriptEntry {
  id: string;
  timestamp: string;
  message: string;
  sender: string;
  critical: boolean;
  videoUrl?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  location: string;
}

export interface Event {
  id: string;
  title: string;
  timestamp: string;
  status: "ON THE WAY" | "RECEIVED" | "PENDING";
  icon: "ambulance" | "backup";
  timeAgo: string;
  operator: string;
}

export interface AlertData {
  id: string;
  created_at: string;
  danger_words: any[];
  location: string;
  operator: string;
  priority: string;
  transcript: string;
  video_url: string;
  longitude: number;
  latitude: number;
}

export interface SummaryResponse {
  operator: string;
  summary: string;
}
