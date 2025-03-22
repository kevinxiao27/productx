"use client"

import { useState, useEffect } from "react"

interface Event {
  id: string
  title: string
  timestamp: string
  status: "ON THE WAY" | "RECEIVED" | "PENDING"
  icon: "ambulance" | "backup"
  timeAgo: string
}

export default function EventsCentre() {
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Update time every second to keep "time ago" fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  // Sample events
  const events: Event[] = [
    {
      id: "1",
      title: "Extra Ambulance Sent",
      timestamp: "2025-03-25 15:32:39.393",
      status: "ON THE WAY",
      icon: "ambulance",
      timeAgo: "1 min ago"
    },
    {
      id: "2",
      title: "Backup Requested",
      timestamp: "2025-03-25 15:02:22.255",
      status: "RECEIVED",
      icon: "backup",
      timeAgo: "31 min ago"
    }
  ]
  
  return (
    <div className="border border-gray-700 p-4 rounded-sm h-[300px] overflow-auto">
      <h2 className="text-xl mb-6">EVENTS CENTRE</h2>
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id}>
            <div className="flex items-start relative">
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center border ${
                event.icon === "ambulance" 
                  ? "border-green-600 bg-green-950/30 text-green-500" 
                  : "border-red-600 bg-red-950/30 text-red-500"
              }`}>
                {event.icon === "ambulance" ? (
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 20H6a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"></path>
                    <circle cx="8.5" cy="17.5" r="1.5"></circle>
                    <circle cx="15.5" cy="17.5" r="1.5"></circle>
                    <path d="M12 8v4"></path>
                    <path d="M10 10h4"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                )}
              </div>
              
              {/* Title */}
              <div className="flex-grow ml-4">
                <h3 className="text-xl text-gray-300">{event.title}</h3>
                <p className="text-gray-500 text-sm">{event.timestamp} ({event.timeAgo})</p>
              </div>
              
              {/* Status - absolute positioned to right */}
              <span className={`absolute right-0 top-0 text-sm ${
                event.status === "ON THE WAY" 
                  ? "text-yellow-500" 
                  : event.status === "RECEIVED" 
                    ? "text-green-500" 
                    : "text-gray-500"
              }`}>
                {event.status}
              </span>
            </div>
            
            {/* Divider line */}
            {event.id !== events[events.length - 1].id && (
              <div className="border-t border-gray-800 my-4"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}