import type { TranscriptEntry } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LiveTranscriptProps {
  entries: TranscriptEntry[]
}

export default function LiveTranscript({ entries }: LiveTranscriptProps) {
  return (
    <div className="border border-gray-700 p-4 rounded-sm h-[300px] overflow-auto">
      <h2 className="text-xl mb-4">LIVE TRANSCRIPT</h2>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="border-b border-gray-800 pb-2">
            <div className="flex justify-between">
              <div className={cn("font-bold", entry.critical ? "text-red-500" : "text-gray-300")}>{entry.message}</div>
              <div className="text-xs text-gray-500">{entry.timestamp}</div>
            </div>
            <div className="text-sm text-gray-500">{entry.sender}</div>
            {entry.critical && <div className="text-xs text-right text-red-500">CRITICAL EVENT</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

