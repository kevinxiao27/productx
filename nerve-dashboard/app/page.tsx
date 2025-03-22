"use client"

import { useState, useEffect } from "react"
import FieldUnits from "@/components/field-units"
import LiveMap from "@/components/live-map"
import LiveTranscript from "@/components/live-transcript"
import FieldUnitView from "@/components/field-unit-view"
import EventsCentre from "@/components/events-centre"
import Summary from "@/components/summary"
import type { Unit, TranscriptEntry } from "@/lib/types"

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Sample data
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

  const transcriptEntries: TranscriptEntry[] = [
    {
      id: "1",
      timestamp: "2025-03-25 15:33:00.000",
      message: "ROUND UP ON ME",
      sender: "LEE, DANIEL",
      critical: false,
    },
    {
      id: "2",
      timestamp: "2025-03-25 15:33:03.369",
      message: "GET DOWN HE'S GOT A GUN",
      sender: "LEE, DANIEL",
      critical: true,
    },
    {
      id: "3",
      timestamp: "2025-03-25 15:33:05.123",
      message: "TAKE COVER",
      sender: "CHINVANICH, BENNY",
      critical: false,
    },
    {
      id: "4",
      timestamp: "2025-03-25 15:33:06.889",
      message: "STATUS REPORT, REPORT IN",
      sender: "LEE, DANIEL",
      critical: false,
    },
    {
      id: "5",
      timestamp: "2025-03-25 15:33:09.369",
      message: "BINGO HAS BEEN HIT",
      sender: "LEE, DANIEL",
      critical: true,
    },
    {
      id: "6",
      timestamp: "2025-03-25 15:33:08.870",
      message: "OKAY; LET'S MOVE NOW",
      sender: "CHINVANICH, BENNY",
      critical: false,
    },
  ]

  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit)
  }

  const formatTime = (date: Date) => {
    return date.toTimeString().split(" ")[0] + "." + date.getMilliseconds().toString().padStart(3, "0")
  }

  return (
    <div className="min-h-screen bg-black text-gray-300 font-mono p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl text-gray-400">NERVE</h1>
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
          <LiveMap />
          <EventsCentre />
        </div>

        <div className="space-y-4">
          <LiveTranscript entries={transcriptEntries} />
          <Summary />
        </div>
      </div>
    </div>
  )
}

