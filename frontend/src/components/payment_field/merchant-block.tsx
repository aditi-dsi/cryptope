"use client"
import Image from "next/image"
import { useWallet } from "@/context/WalletContext"
import { index } from "@/assets"

interface MerchantBlockProps {
  receivingAmount: string
}

export function MerchantBlock({ receivingAmount }: MerchantBlockProps) {
  const { isConnected, publicKey } = useWallet()

  // Fixed USDC token
  const fixedToken = {
    symbol: "USDC",
    name: "USD Coin",
    icon: index.Usdc_Logo.src,
    decimals: 6,
  }

  const formatAddress = (address: string | null) => {
    if (!address) return ""
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#131316] p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-400">Merchant</h2>
        {isConnected && publicKey && (
          <span className="rounded-lg bg-[#1E1F24] px-2 py-1 text-xs text-zinc-400">{formatAddress(publicKey)}</span>
        )}
      </div>

      {/* Amount Display */}
      <div className="mb-2 flex items-center justify-between">
        <div className="relative">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#1E1F24] px-3 py-2">
            <div className="relative h-6 w-6">
              <Image
                src={fixedToken.icon || "/placeholder.svg"}
                alt={fixedToken.name}
                width={24}
                height={24}
                className="rounded-full object-contain"
              />
            </div>
            <span className="text-white">{fixedToken.symbol}</span>
          </div>
        </div>

        <div className="flex-1 text-right">
          <div className="w-full px-4 py-1 text-right text-3xl font-semibold text-white">
            {receivingAmount || "0.00692862"}
          </div>
          <div className="mt-1 text-right text-xs text-zinc-400">$1</div>
        </div>
      </div>
    </div>
  )
}

