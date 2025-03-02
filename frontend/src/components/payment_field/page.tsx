"use client"

import { useState } from "react"
import { ArrowDown } from "lucide-react"
import { useWallet } from "@/context/WalletContext"
import type { WalletName } from "@/lib/wallet-utils"
import { SenderBlock } from "./sender/sender-block"
import { MerchantSelector } from "./merchant/merchant-block"
import { WalletModal } from "../navbar/connect-wallet-sheet"

export function PaymentBlock() {
  const { isConnected, connect } = useWallet()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [senderAmount, setSenderAmount] = useState("")

  const handleWalletConnect = async (walletName: WalletName) => {
    try {
      await connect(walletName)
      setIsWalletModalOpen(false)
    } catch (error) {
      console.error("Failed to connect from PaymentBlock:", error)
    }
  }

  const handleProceedToPay = () => {
    console.log("Proceeding to pay with senderAmount:", senderAmount)
  }

  const getButtonConfig = () => {
    if (!isConnected) {
      return {
        text: "Connect Wallet",
        onClick: () => setIsWalletModalOpen(true),
        className:
          "w-full rounded-xl bg-[#ff6b47]/10 py-4 text-center text-lg font-medium text-[#ff6b47] hover:bg-[#ff6b47]/20 transition-colors",
      }
    }

    if (!senderAmount || Number.parseFloat(senderAmount) === 0) {
      return {
        text: "Enter an amount",
        onClick: () => {},
        className:
          "w-full rounded-xl bg-[#ff6b47]/10 py-4 text-center text-lg font-medium text-[#ff6b47] hover:bg-[#ff6b47]/20 transition-colors cursor-not-allowed",
      }
    }

    return {
      text: "Proceed to Pay",
      onClick: handleProceedToPay,
      className:
        "w-full rounded-xl bg-[#ff6b47] py-4 text-center text-lg font-medium text-white hover:bg-[#ff6b47]/90 transition-colors",
    }
  }

  const buttonConfig = getButtonConfig()

  return (
    <div className="mx-auto max-w-md rounded-xl bg-[#1A1B1F] shadow-lg">
      <div className="p-4">
        <div className="relative">
          <SenderBlock onAmountChange={setSenderAmount} />

          <div className="absolute -bottom-6 left-1/2 z-10 -translate-x-1/2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ff6b47]/20 to-[#ff6b47]/20 blur-md"></div>
              <button className="relative rounded-full bg-[#1E1F24] p-3 border border-zinc-800 transition-colors">
                <ArrowDown className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="h-2" />

        <div className="mb-4">
          <MerchantSelector />
        </div>

        <button onClick={buttonConfig.onClick} className={buttonConfig.className}>
          {buttonConfig.text}
        </button>
      </div>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />
    </div>
  )
}

