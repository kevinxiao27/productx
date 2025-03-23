import type { Unit } from "@/lib/types"
import { cn } from "@/lib/utils"

interface FieldUnitViewProps {
  unit: Unit
}

export default function FieldUnitView({ unit }: FieldUnitViewProps) {
  return (
    <div className="border border-gray-700 p-4 rounded-sm h-[400px]">
      <h2 className="text-xl mb-6 text-titleBlue font-light">FIELD UNIT VIEW</h2>
      <div className="mt-16 flex flex-col items-center">
        <h3 className="text-xl mb-2">{unit.name}</h3>
        <div className={cn("text-sm mb-1", unit.status === "HEALTHY" ? "text-green-500" : "text-red-500")}>
          {unit.status}
        </div>
        <div className="text-gray-500 text-sm">
          {unit.role} ({unit.id})
        </div>
      </div>
    </div>
  )
}

