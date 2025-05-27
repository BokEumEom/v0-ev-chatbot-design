import { ChargingStationMap } from "@/components/charging-station-map"

export default function StationsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="z-10 w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-center mb-8">충전소 현황</h1>
        <ChargingStationMap />
      </div>
    </main>
  )
}
