"use client"

import { useState } from "react"
import { ArrowDown } from "lucide-react"
import { useWallet } from "@/context/WalletContext"
import { SenderBlock } from "./sender-block"
import { MerchantBlock } from "./merchant-block"
import { WalletModal } from "../navbar/connect-wallet-sheet"


export function PaymentBlock() {
  const { isConnected } = useWallet()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [receivingAmount, setReceivingAmount] = useState("0.00692862")

  const handleWalletConnect = async (walletName: string) => {
    setIsWalletModalOpen(false)
  }

  const handleProceedToPay = () => {

}

  return (
    <div className="mx-auto max-w-md rounded-xl bg-[#1A1B1F] shadow-lg">
      <div className="p-4">
        <div className="relative">
          <SenderBlock />

          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-10">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ff6b47]/20 to-[#ff6b47]/20 blur-md"></div>
              <button className="relative rounded-full bg-[#1E1F24] p-3 transition-colors border border-zinc-800">
                <ArrowDown className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="h-2"></div>

        <div className="mb-4">
          <MerchantBlock receivingAmount={receivingAmount} />
        </div>

        {isConnected ? (
          <button
            onClick={handleProceedToPay}
            className="w-full rounded-xl bg-[#ff6b47] py-4 text-center text-lg font-medium text-white hover:bg-[#ff6b47]/90 transition-colors"
          >
            Proceed to Pay
          </button>
        ) : (
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="w-full rounded-xl bg-[#ff6b47]/10 py-4 text-center text-lg font-medium text-[#ff6b47] hover:bg-[#ff6b47]/20 transition-colors"
          >
            Connect Wallet
          </button>
        )}
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />
    </div>
  )
}

