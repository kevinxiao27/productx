type SummaryProps = {
  summary: string;
};

export default function Summary({ summary }: { summary: string }) {
  return (
    <div className='border border-gray-700 rounded-sm h-[300px] font-mono font-light overflow-scroll'>
      <h2 className='text-xl text-titleBlue font-light p-4'>SUMMARY</h2>
      <div className='p-4 text-mediumGrey whitespace-pre-wrap'>{summary || "Click on a transcript entry to see a summary."}</div>
    </div>
  );
}
