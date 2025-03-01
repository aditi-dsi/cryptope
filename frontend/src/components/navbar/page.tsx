"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
// 1. Import the ChevronDown icon from lucide-react
import { Wallet, ChevronDown } from "lucide-react"

import { WalletModal } from "./connect-wallet-sheet"
import { useWallet } from "@/context/WalletContext"
import { WALLET_INFO, formatAddress } from "@/lib/wallet-utils"
import type { WalletName } from "@/lib/wallet-utils"

export default function Navbar() {
  const { isConnected, publicKey, connecting, connect, disconnect, connectedWallet } = useWallet()
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 1. Get the icon for the connected wallet
  const walletInfo = WALLET_INFO.find((w) => w.name === connectedWallet)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleWalletConnect = async (walletName: WalletName) => {
    try {
      await connect(walletName)
      setIsWalletModalOpen(false)
    } catch (error) {
      console.error("Failed to connect:", error)
    }
  }

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-zinc-800 bg-black/80 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-8 w-8">
              <Image
                src="/logo.svg"
                alt="Cryptope"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-semibold text-white">CryptoPe</span>
          </Link>

          {/* Wallet Button or Connected State */}
          {!isConnected ? (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              disabled={connecting}
              className="inline-flex items-center gap-2 rounded-lg border border-[#ff6b47]/20 bg-transparent px-4 py-2 text-sm font-medium text-[#ff6b47] transition-all duration-200 hover:border-[#ff6b47]/40 hover:bg-[#ff6b47]/10 hover:text-[#ff6b47] hover:shadow-[0_0_20px_rgba(255,107,71,0.15)] active:opacity-80 disabled:opacity-50"
            >
              <Wallet className="h-4 w-4" />
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 rounded-lg border border-[#ff6b47]/20 bg-transparent px-4 py-2 text-sm font-medium text-[#ff6b47] transition-all duration-200 hover:border-[#ff6b47]/40 hover:bg-[#ff6b47]/10"
              >
                {/* Wallet icon */}
                <div className="relative h-5 w-5 overflow-hidden rounded-full bg-[#ff6b47]/10">
                  <Image
                    src={walletInfo?.icon || "/images/wallet-default.png"}
                    alt="Wallet Icon"
                    width={20}
                    height={20}
                    className="object-cover"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span>{publicKey && formatAddress(publicKey)}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 rounded-lg border border-[#ff6b47]/20 bg-zinc-950 p-1 shadow-lg">
                  <button
                    onClick={() => {
                      disconnect()
                      setShowDropdown(false)
                    }}
                    className="flex w-full items-center rounded-md px-4 py-2 text-sm text-white transition-colors hover:bg-[#ff6b47]/10"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />
    </>
  )
}
