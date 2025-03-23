"use client";

import { useState, useEffect, useMemo } from "react";
import FieldUnits from "@/components/field-units";
import LiveMap from "@/components/live-map";
import LiveTranscript from "@/components/live-transcript";
import FieldUnitView from "@/components/field-unit-view";
import EventsCentre from "@/components/events-centre";
import Summary from "@/components/summary";
import type { Unit, TranscriptEntry, Coordinates, Event, AlertData } from "@/lib/types";
import socket from "./socket";
import axios from "axios";

const MAX_TRANSCRIPT_CHAR_LEN = 20;
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Coordinates>({
    latitude: 49.2606,
    longitude: -123.246,
    location: "University Endowment Lands, Vancouver, BC, Canada"
  });
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);

  // Sample events - in a real app these would come from the API
  const allEvents: Event[] = [
    {
      id: "1",
      title: "Extra Ambulance Sent",
      timestamp: "2025-03-25 15:32:39.393",
      status: "ON THE WAY",
      icon: "ambulance",
      timeAgo: "1 min ago",
      operator: "John Grey"
    },
    {
      id: "2",
      title: "Backup Requested",
      timestamp: "2025-03-25 15:02:22.255",
      status: "RECEIVED",
      icon: "backup",
      timeAgo: "31 min ago",
      operator: "CHINVANICH, BENNY"
    },
    {
      id: "3",
      title: "Medical Assistance",
      timestamp: "2025-03-25 15:10:45.123",
      status: "PENDING",
      icon: "ambulance",
      timeAgo: "25 min ago",
      operator: "John Grey"
    }
  ];

  // Filter events based on the selected operator
  const filteredEvents = useMemo(() => {
    if (!selectedOperator) return allEvents;
    return allEvents.filter((event) => event.operator === selectedOperator);
  }, [selectedOperator, allEvents]);

  // Add this useMemo to filter transcript entries based on selected operator
  const filteredTranscripts = useMemo(() => {
    if (!selectedOperator) return transcriptEntries;
    return transcriptEntries.filter((entry) => entry.sender === selectedOperator);
  }, [selectedOperator, transcriptEntries]);

  async function handleEntryClick(transcriptEntry: TranscriptEntry) {
    try {
      // Set the selected operator
      setSelectedOperator(transcriptEntry.sender);

      // Set the video URL from transcript entry if available
      setVideoUrl(transcriptEntry.videoUrl || null);

      // Find the unit that matches the sender and select it
      const matchingUnit = units.find((unit) => unit.name === transcriptEntry.sender);
      if (matchingUnit) {
        setSelectedUnit(matchingUnit);
      }

      // Fetch and set the summary
      const res = await axios.get(`${baseUrl}/api/alerts/summary/${transcriptEntry.sender}`);
      const data = res.data;
      setSummary(data.summary);
    } catch (error) {
      console.error("Failed to generate summary:", error);
    }
  }

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchInitialTranscripts = async () => {
      try {
        console.log(baseUrl);
        const res = await axios.get(`${baseUrl}/api/alerts`);
        const alerts: AlertData[] = res.data;

        const entries: TranscriptEntry[] = alerts
          .filter((a) => a.transcript) // Only include entries with transcripts
          .map((a) => ({
            id: a.id,
            timestamp: a.created_at,
            message: a.transcript.length > MAX_TRANSCRIPT_CHAR_LEN ? a.transcript.slice(0, MAX_TRANSCRIPT_CHAR_LEN) + "..." : a.transcript,
            sender: a.operator,
            critical: a.priority === "danger",
            videoUrl: a.video_url // Make sure to use the correct field name
          }));

        setTranscriptEntries(entries.slice(-30)); // Keep only the last 30
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      }
    };

    fetchInitialTranscripts();
  }, []);

  useEffect(() => {
    socket.emit("subscribeToAlerts");

    socket.on("alertSubscriptionSuccess", (msg) => {
      console.log("Subscribed:", msg);
    });

    socket.on("newAlert", (data: AlertData) => {
      console.log("New alert received:", data);

      // Convert alert into TranscriptEntry
      const transcriptEntry: TranscriptEntry = {
        id: data.id,
        timestamp: data.created_at,
        message:
          data.transcript.length > MAX_TRANSCRIPT_CHAR_LEN ? data.transcript.slice(0, MAX_TRANSCRIPT_CHAR_LEN) + "..." : data.transcript,
        sender: data.operator,
        critical: data.priority === "danger",
        videoUrl: data.video_url
      };

      setTranscriptEntries((prev) => {
        const updated = [transcriptEntry, ...prev];
        return updated.slice(0, 30); // Keep only first 30
      });

      // Use the longitude and latitude directly from the data
      setCurrentLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        location: "University Endowment Lands, Vancouver, BC, Canada"
      });
    });

    return () => {
      socket.off("newAlert");
      socket.off("alertSubscriptionSuccess");
    };
  }, []);

  const units: Unit[] = [
    {
      id: "35798",
      name: "John Grey",
      role: "POLICE - Sergeant",
      status: "HEALTHY"
    },
    {
      id: "90235",
      name: "Pincha Chinvanich",
      role: "POLICE - Private",
      status: "HEALTHY"
    },
    {
      id: "12345",
      name: "BANGO, BINGO",
      role: "AMBULANCE - CPR Specialist",
      status: "CRITICAL"
    }
  ];

  const handleUnitSelect = (unit: Unit) => {
    setSelectedUnit(unit);
    setSelectedOperator(unit.name);
    // Clear the video when selecting a unit directly
    setVideoUrl(null);
  };

  const formatTime = (date: Date) => {
    return date.toTimeString().split(" ")[0] + "." + date.getMilliseconds().toString().padStart(3, "0");
  };

  // When resetting filter, update handleResetFilter to reset all filters
  const handleResetFilter = () => {
    setSelectedOperator(null);
    // Optional: Clear the video and summary when filter is reset
    setVideoUrl(null);
    setSummary("");
  };

  return (
    <div className='min-h-screen bg-nerveBlack text-gray-300 font-mono p-4'>
      <header className='flex justify-between items-center mb-4'>
        <h1 className='text-3xl text-titleBlue'>NERVE</h1>
        <div className='flex space-x-4'>
          <span className='text-xl'>{formatTime(currentTime)}</span>
          <span className='text-xl'>{currentTime.toISOString().split("T")[0]}</span>
        </div>
      </header>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='space-y-4'>
          <FieldUnits units={units} onUnitSelect={handleUnitSelect} />
          <FieldUnitView unit={selectedUnit || units[1]} videoUrl={videoUrl} />
        </div>

        <div className='space-y-4'>
          <LiveMap latitude={currentLocation.latitude} longitude={currentLocation.longitude} location={currentLocation.location} />
          <EventsCentre events={filteredEvents} isFiltered={selectedOperator !== null} onResetFilter={handleResetFilter} />
        </div>

        <div className='space-y-4'>
          <LiveTranscript
            entries={filteredTranscripts}
            isFiltered={selectedOperator !== null}
            selectedOperator={selectedOperator}
            onResetFilter={handleResetFilter}
            onEntryClick={handleEntryClick}
          />
          <Summary summary={summary} />
        </div>
      </div>
    </div>
  );
}
