import type { TranscriptEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LiveTranscriptProps {
  entries: TranscriptEntry[];
  isFiltered?: boolean;
  onResetFilter?: () => void;
  onEntryClick?: (transcriptEntry: TranscriptEntry) => void;
  selectedOperator?: string | null;
}

export default function LiveTranscript({ entries, isFiltered, onResetFilter, onEntryClick, selectedOperator }: LiveTranscriptProps) {
  return (
    <div className='border border-gray-700 rounded-sm h-[500px] font-mono font-light overflow-auto'>
      <div className='flex justify-between items-center p-4'>
        <div>
          <h2 className='text-xl text-titleBlue'>LIVE TRANSCRIPT</h2>
          {selectedOperator && (
            <p className='text-xs text-gray-400 mt-1'>
              Showing entries from: <span className='text-titleBlue'>{selectedOperator}</span>
            </p>
          )}
        </div>
        {isFiltered && (
          <button
            onClick={onResetFilter}
            className='text-xs text-gray-400 hover:text-white border border-gray-700 px-2 py-1 rounded transition-colors'
          >
            Reset Filter
          </button>
        )}
      </div>
      <div className='space-y-4'>
        {entries.length === 0 ? (
          <div className='text-mediumGrey text-center py-6'>No transcript entries to display</div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "border-b border-gray-800 relative cursor-pointer transition-colors duration-200",
                entry.critical ? "bg-highlightedRed hover:bg-nerveRed/20" : "hover:bg-white/5"
              )}
              onClick={() => onEntryClick?.(entry)}
            >
              <div className='p-4'>
                <div className='flex justify-between'>
                  <div className={cn("text-lg", entry.critical ? "text-nerveRed" : "text-titleBlue")}>{entry.message}</div>
                  <div className={cn("text-xs", entry.critical ? "text-nerveRed" : "text-mediumGrey")}>{entry.timestamp}</div>
                </div>
                <div className={cn("text-sm", entry.critical ? "text-nerveRed" : "text-mediumGrey")}>{entry.sender}</div>
                {entry.critical && <div className='text-lg text-right font-bold text-nerveRed'>CRITICAL EVENT</div>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
