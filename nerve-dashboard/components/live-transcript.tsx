import type { TranscriptEntry } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LiveTranscriptProps {
  entries: TranscriptEntry[]
}

export default function LiveTranscript({ entries }: LiveTranscriptProps) {
  return (
    <div className="border border-gray-700 rounded-sm h-[300px] font-mono font-light overflow-auto">
      <h2 className="text-xl text-titleBlue p-4">LIVE TRANSCRIPT</h2>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div 
            key={entry.id} 
            className={cn("border-b border-gray-800 relative", entry.critical ? "bg-highlightedRed" : "")}
          >
            <div className="p-4">
              <div className="flex justify-between">
                <div className={cn("text-lg", entry.critical ? "text-nerveRed" : "text-titleBlue")}>{entry.message}</div>
                <div className={cn("text-xs", entry.critical ? "text-nerveRed" : "text-mediumGrey")}>{entry.timestamp}</div>
              </div>
              <div className={cn("text-sm", entry.critical ? "text-nerveRed" : "text-mediumGrey")}>{entry.sender}</div>
              {entry.critical && <div className="text-lg text-right font-bold text-nerveRed">CRITICAL EVENT</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

