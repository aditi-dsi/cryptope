import Navbar from "@/components/navbar/page";
import { PaymentBlock } from "@/components/payment_field/page";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 pt-16">
      <main className="relative flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Navbar />
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 transform bg-[#ff6b47]/10 blur-[160px]" />
        <div className="absolute bottom-0 left-0 h-96 w-96 bg-purple-500/10 blur-[160px]" />
      </div>

      {/* Content */}
      <div className="relative">
        <PaymentBlock />
      </div>
    </main>
    </main>
  )
}

