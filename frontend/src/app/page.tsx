import Navbar from "@/components/navbar/page";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 pt-16">
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="bg-gradient-to-r from-[#ff6b47] to-[#e84142] bg-clip-text text-4xl font-bold text-transparent">
          Crypto Payment Gateway
        </h1>
        <p className="mt-4 text-zinc-400">Accept any token, settle in USDC with Jupiter swap integration</p>
      </div>
    </main>
  )
}

