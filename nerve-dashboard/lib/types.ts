export interface Unit {
  id: string
  name: string
  role: string
  status: "HEALTHY" | "CRITICAL"
}

export interface TranscriptEntry {
  id: string
  timestamp: string
  message: string
  sender: string
  critical: boolean
}

export interface Coordinates {
  latitude: number
  longitude: number
  location: string
}

