import Navbar from "@/components/navbar/page"
import { PaymentBlock } from "@/components/payment_field/page"

export default function Home() {
  return (
    <>
      {/* Navbar at the top */}
      <Navbar />

      {/* Single <main> instead of nested <main> */}
      <main className="relative min-h-screen bg-zinc-950 pt-16 flex items-center justify-center p-4 overflow-x-hidden">
        {/* Background gradient effects */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 transform bg-[#ff6b47]/10 blur-[160px]" />
          <div className="absolute bottom-0 left-0 h-96 w-96 bg-purple-500/10 blur-[160px]" />
        </div>

        {/* Page Content */}
        <div className="relative">
          <PaymentBlock />
        </div>
      </main>
    </>
  )
}
