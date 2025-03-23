'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

export default function LiveMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  
  const coordinates = {
    latitude: 49.2606,
    longitude: -123.246,
    location: 'University Endowment Lands, Vancouver, BC, Canada',
  }
  
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [coordinates.longitude, coordinates.latitude],
      zoom: 13,
    })
    
    mapRef.current = map
    
    // Define markers
    const markers = [
      { lng: -123.246, lat: 49.2606, color: '#6b9fff', label: '' },
      { lng: -123.250, lat: 49.2620, color: '#6b9fff', label: '' },
      { lng: -123.240, lat: 49.2590, color: '#6b9fff', label: 'CHINVANICH, BENNY' },
    ]
    
    // Add markers to the map
    markers.forEach(({ lng, lat, color, label }) => {
      const el = document.createElement('div')
      el.style.backgroundColor = color
      el.style.width = '14px'
      el.style.height = '14px'
      el.style.borderRadius = '9999px'
      
      const marker = new mapboxgl.Marker(el).setLngLat([lng, lat])
      
      if (label) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(label)
        marker.setPopup(popup)
      }
      
      marker.addTo(map)
    })
    
    // Clean up on unmount
    return () => {
      if (map) map.remove()
    }
  }, [])
  
  return (
    <div className="border border-gray-700 p-4 rounded-sm">
      <h2 className="text-xl mb-4">LIVE MAP</h2>
      <div className="mb-2 text-sm">
        <span>LATITUDE: {coordinates.latitude}</span>
        <span className="ml-4">LONGITUDE: {coordinates.longitude}</span>
      </div>
      <div className="text-xs text-gray-500 mb-3">{coordinates.location}</div>
{(
        <div
          ref={mapContainerRef}
          className="w-full h-[400px] rounded border border-gray-800"
        />
      )}
    </div>
  )
}