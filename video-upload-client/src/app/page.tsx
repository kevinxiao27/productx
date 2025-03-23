import TabComponent from '@/components/TabComponent';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            VPD
          </h1>
          <TabComponent />
        </div>
      </div>
    </main>
  );
}