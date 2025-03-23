"use client"

import { useState, useEffect } from "react"
import FieldUnits from "@/components/field-units"
import LiveMap from "@/components/live-map"
import LiveTranscript from "@/components/live-transcript"
import FieldUnitView from "@/components/field-unit-view"
import EventsCentre from "@/components/events-centre"
import Summary from "@/components/summary"
import type { Unit, TranscriptEntry, Coordinates } from "@/lib/types"
import socket from "./socket"
import axios from "axios"

const MAX_TRANSCRIPT_CHAR_LEN = 20
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([])
  const [currentLocation, setCurrentLocation] = useState<Coordinates>({ latitude: 49.2606, longitude: -123.246, location: "University Endowment Lands, Vancouver, BC, Canada" })

  const [summary, setSummary] = useState<string>("")

  async function handleEntryClick(operatorName: string) {
    try {
      const res = await axios.get(`${baseUrl}/api/alerts/summary/${operatorName}`)
      const data = res.data;
      setSummary(data.summary);
    } catch (error) {
      console.error("Failed to generate summary:", error)
    }
  }

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])
  
  useEffect(() => {
    const fetchInitialTranscripts = async () => {
      try {
        console.log(baseUrl)
        const res = await axios.get(`${baseUrl}/api/alerts`)
        const alerts = res.data

        const entries: TranscriptEntry[] = alerts
          .filter((a: any) => a.transcript) // Only include entries with transcripts
          .map((a: any) => ({
            id: a.id,
            timestamp: a.created_at,
            message: a.transcript.length > MAX_TRANSCRIPT_CHAR_LEN ? a.transcript.slice(0, MAX_TRANSCRIPT_CHAR_LEN) + "..." : a.transcript,
            sender: a.operator,
            critical: a.priority === "danger",
          }))

        setTranscriptEntries(entries.slice(-30)) // Keep only the last 30
      } catch (err) {
        console.error("Failed to fetch alerts:", err)
      }
    }

    fetchInitialTranscripts()
  }, [])

  useEffect(() => {
    socket.emit("subscribeToAlerts");

    socket.on("alertSubscriptionSuccess", (msg) => {
      console.log("Subscribed:", msg);
    });

    socket.on('newAlert', (data) => {
      console.log('New alert received:', data)

      // Convert alert into TranscriptEntry
      const transcriptEntry: TranscriptEntry = {
        id: data.id,
        timestamp: data.created_at,
        message: data.transcript.length > MAX_TRANSCRIPT_CHAR_LEN ? data.transcript.slice(0, MAX_TRANSCRIPT_CHAR_LEN) + "..." : data.transcript,
        sender: data.operator,
        critical: data.priority === "danger",
      }

      setTranscriptEntries((prev) => {
        const updated = [transcriptEntry, ...prev]
        return updated.slice(0,30) // Keep only first 30
      })

      setCurrentLocation({ latitude: data.latitude, longitude: data.longitude, location: "University Endowment Lands, Vancouver, BC, Canada" })
    })

    return () => {
      socket.off('newAlert')
      socket.off("alertSubscriptionSuccess");
    }
  }, [])

  const units: Unit[] = [
    {
      id: "35798",
      name: "LEE, DANIEL",
      role: "POLICE - Sergeant",
      status: "HEALTHY",
    },
    {
      id: "90235",
      name: "CHINVANICH, BENNY",
      role: "POLICE - Private",
      status: "HEALTHY",
    },
    {
      id: "12345",
      name: "BANGO, BINGO",
      role: "AMBULANCE - CPR Specialist",
      status: "CRITICAL",
    },
  ]

  // const transcriptEntries: TranscriptEntry[] = [
  //   {
  //     id: "1",
  //     timestamp: "2025-03-25 15:33:00.000",
  //     message: "ROUND UP ON ME",
  //     sender: "LEE, DANIEL",
  //     critical: false,
  //   },
  //   {
  //     id: "2",
  //     timestamp: "2025-03-25 15:33:03.369",
  //     message: "GET DOWN HE'S GOT A GUN",
  //     sender: "LEE, DANIEL",
  //     critical: true,
  //   },
  //   {
  //     id: "3",
  //     timestamp: "2025-03-25 15:33:05.123",
  //     message: "TAKE COVER",
  //     sender: "CHINVANICH, BENNY",
  //     critical: false,
  //   },
  //   {
  //     id: "4",
  //     timestamp: "2025-03-25 15:33:06.889",
  //     message: "STATUS REPORT, REPORT IN",
  //     sender: "LEE, DANIEL",
  //     critical: false,
  //   },
  //   {
  //     id: "5",
  //     timestamp: "2025-03-25 15:33:09.369",
  //     message: "BINGO HAS BEEN HIT",
  //     sender: "LEE, DANIEL",
  //     critical: true,
  //   },
  //   {
  //     id: "6",
  //     timestamp: "2025-03-25 15:33:08.870",
  //     message: "OKAY; LET'S MOVE NOW",
  //     sender: "CHINVANICH, BENNY",
  //     critical: false,
  //   },
  // ]

  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit)
  }

  const formatTime = (date: Date) => {
    return date.toTimeString().split(" ")[0] + "." + date.getMilliseconds().toString().padStart(3, "0")
  }

  return (
    <div className="min-h-screen bg-nerveBlack text-gray-300 font-mono p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl text-titleBlue">NERVE</h1>
        <div className="flex space-x-4">
          <span className="text-xl">{formatTime(currentTime)}</span>
          <span className="text-xl">{currentTime.toISOString().split("T")[0]}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-4">
          <FieldUnits units={units} onUnitSelect={handleUnitSelect} />
          <FieldUnitView unit={selectedUnit || units[1]} />
        </div>

        <div className="space-y-4">
          <LiveMap latitude={currentLocation.latitude} longitude={currentLocation.longitude} location={currentLocation.location}/>
          <EventsCentre />
        </div>

        <div className="space-y-4">
          <LiveTranscript entries={transcriptEntries} onEntryClick={handleEntryClick} />
          <Summary summary={summary}/>
        </div>
      </div>
    </div>
  )
}
