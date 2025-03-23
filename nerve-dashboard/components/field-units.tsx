"use client"

import type { Unit } from "@/lib/types"

interface FieldUnitsProps {
  units: Unit[]
  onUnitSelect: (unit: Unit) => void
}

export default function FieldUnits({ units, onUnitSelect }: FieldUnitsProps) {
  return (
    <div className="border border-gray-700 p-4 rounded-sm h-[300px] font-light overflow-auto">
      <h2 className="text-xl mb-6 text-titleBlue">FIELD UNITS</h2>
      <ul className="space-y-6">
        {units.map((unit, index) => (
          <li key={unit.id} className="cursor-pointer" onClick={() => onUnitSelect(unit)}>
            <div className="relative w-full pl-8">
              {/* Square indicator */}
              <span className="absolute left-0 top-1 text-blue-400">■</span>
              
              {/* Name */}
              <div className="text-white text-lg">{unit.name}</div>
              
              {/* Status - absolutely positioned to right */}
              <p className={`absolute right-0 top-0 font-bold ${unit.status === "HEALTHY" ? "text-nerveGreen" : "text-nerveRed"}`}>
                {unit.status}
              </p>
              
              {/* Role and ID */}
              <div className="text-gray-500">
                {unit.role} ({unit.id})
              </div>
            </div>
            
            {/* Add divider between items */}
            {index < units.length - 1 && (
              <div className="border-t border-gray-800 mt-3"></div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}