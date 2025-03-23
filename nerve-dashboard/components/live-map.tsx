"use client"

import { useEffect, useRef } from "react"

export default function LiveMap() {
  const mapRef = useRef<HTMLCanvasElement>(null)

  const coordinates = {
    latitude: 49.2606,
    longitude: -123.246,
    location: "University Endowment Lands, Vancouver, BC, Canada",
  }

  useEffect(() => {
    if (!mapRef.current) return

    const ctx = mapRef.current.getContext("2d")
    if (!ctx) return

    // Draw a simple map placeholder
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, mapRef.current.width, mapRef.current.height)

    // Draw grid lines
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 1

    // Horizontal lines
    for (let i = 0; i < mapRef.current.height; i += 30) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(mapRef.current.width, i)
      ctx.stroke()
    }

    // Vertical lines
    for (let i = 0; i < mapRef.current.width; i += 30) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, mapRef.current.height)
      ctx.stroke()
    }

    // Draw some markers
    const markers = [
      { x: 150, y: 120, color: "#6b9fff", label: "" },
      { x: 250, y: 180, color: "#6b9fff", label: "" },
      { x: 350, y: 150, color: "#6b9fff", label: "CHINVANICH, BENNY" },
    ]

    markers.forEach((marker) => {
      // Draw circle
      ctx.beginPath()
      ctx.arc(marker.x, marker.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = marker.color
      ctx.fill()

      // Draw label if present
      if (marker.label) {
        ctx.fillStyle = "#000"
        ctx.fillRect(marker.x - 60, marker.y + 15, 120, 20)
        ctx.strokeStyle = "#6b9fff"
        ctx.strokeRect(marker.x - 60, marker.y + 15, 120, 20)
        ctx.fillStyle = "#fff"
        ctx.font = "10px monospace"
        ctx.textAlign = "center"
        ctx.fillText(marker.label, marker.x, marker.y + 28)
      }
    })

    // Draw crosshair in center
    ctx.strokeStyle = "#fff"
    ctx.beginPath()
    ctx.moveTo(mapRef.current.width / 2 - 10, mapRef.current.height / 2)
    ctx.lineTo(mapRef.current.width / 2 + 10, mapRef.current.height / 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(mapRef.current.width / 2, mapRef.current.height / 2 - 10)
    ctx.lineTo(mapRef.current.width / 2, mapRef.current.height / 2 + 10)
    ctx.stroke()
  }, [])

  return (
    <div className="border border-gray-700 p-4 rounded-sm">
      <h2 className="text-xl font-light text-titleBlue mb-4">LIVE MAP</h2>
      <div className="mb-2 text-sm text-mediumGrey">
        <span>LATITUDE: {coordinates.latitude}</span>
        <span className="ml-4">LONGITUDE: {coordinates.longitude}</span>
      </div>
      <div className="text-xs text-mediumGrey mb-3">{coordinates.location}</div>
      <canvas ref={mapRef} width={400} height={300} className="w-full h-auto border border-gray-800" />
    </div>
  )
}

