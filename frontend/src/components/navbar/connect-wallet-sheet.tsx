"use client"

import React, { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { WALLET_INFO, WALLET_URLS, type WalletInfo, type WalletName } from "@/lib/wallet-utils"



interface WalletButtonProps {
  wallet: WalletInfo
  installed: boolean
  onConnect: (walletName: WalletName, installed: boolean) => void
}

// Separate WalletButton component to handle individual wallet rendering
const WalletButton = React.memo(({ wallet, installed, onConnect }: WalletButtonProps) => {
  const [imageError, setImageError] = useState(false)

  return (
    <button
      className="flex w-full items-center rounded-lg border border-[#ff6b47]/10 bg-zinc-900 p-3 transition-all hover:border-[#ff6b47]/30 hover:bg-zinc-800/50 hover:shadow-[0_0_20px_rgba(255,107,71,0.1)]"
      onClick={() => onConnect(wallet.name, installed)}
    >
      <div className="relative mr-3 h-8 w-8">
        <Image
          src={imageError ? "/images/wallet-default.png" : wallet.icon}
          alt={`${wallet.name} icon`}
          width={32}
          height={32}
          className="object-contain"
          onError={() => setImageError(true)}
          priority
        />
      </div>
      <span className="text-white">{wallet.name}</span>
      {!installed && <span className="ml-auto text-sm text-zinc-400">Not installed</span>}
    </button>
  )
})

WalletButton.displayName = "WalletButton"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (walletName: WalletName) => void
}

export function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const [mounted, setMounted] = useState(false)
  const [installedWallets, setInstalledWallets] = useState<WalletInfo[]>([])
  const [recommendedWallets, setRecommendedWallets] = useState<WalletInfo[]>([])
  const [isClosing, setIsClosing] = useState(false)

  // Handle mounting state
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Handle modal open/close and wallet detection
  useEffect(() => {
    if (isOpen && mounted) {
      detectWallets()
      setIsClosing(false)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen, mounted])

  // Detect available wallets
  const detectWallets = useCallback(() => {
    if (typeof window === "undefined") return

    setTimeout(() => {
      const installed = WALLET_INFO.filter((wallet) => {
        try {
          return wallet.detect()
        } catch {
          return false
        }
      })

      const recommended = WALLET_INFO.filter((wallet) => !installed.some((w) => w.name === wallet.name))

      setInstalledWallets(installed)
      setRecommendedWallets(recommended)
    }, 100)
  }, [])

  // Handle modal close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 200)
  }, [onClose])

  // Handle wallet connection or installation
  const handleConnect = useCallback(
    (walletName: WalletName, installed: boolean) => {
      if (!installed) {
        window.open(WALLET_URLS[walletName], "_blank")
      } else {
        onConnect(walletName)
        handleClose()
      }
    },
    [onConnect, handleClose],
  )

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleClose()
      }
    }

    document.addEventListener("keydown", handleEscapeKey)
    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [isOpen, handleClose])

  // Don't render anything until mounted
  if (!mounted) return null

  // Don't render if not open
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-200
          ${isClosing ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
      >
        <div
          className={`w-full max-w-md transform rounded-lg border border-[#ff6b47]/20 bg-zinc-950 p-6 shadow-xl transition-all duration-200
            ${isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 id="wallet-modal-title" className="text-xl font-bold text-white">
              Connect a Wallet
            </h2>
            <button
              onClick={handleClose}
              className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Installed Wallets Section */}
          {installedWallets.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-zinc-400">Installed Wallets</h3>
              <div className="space-y-2">
                {installedWallets.map((wallet) => (
                  <WalletButton key={wallet.name} wallet={wallet} installed={true} onConnect={handleConnect} />
                ))}
              </div>
            </div>
          )}

          {/* Recommended Wallets Section */}
          {recommendedWallets.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-zinc-400">More Wallets</h3>
              <div className="space-y-2">
                {recommendedWallets.map((wallet) => (
                  <WalletButton key={wallet.name} wallet={wallet} installed={false} onConnect={handleConnect} />
                ))}
              </div>
            </div>
          )}

          {/* No Wallets Found Message */}
          {installedWallets.length === 0 && recommendedWallets.length === 0 && (
            <div className="py-8 text-center text-zinc-400">
              No wallets detected. Please refresh the page or try again.
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">New to Solana wallets?</span>
            <a
              href="https://docs.solana.com/wallet-guide"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff6b47] transition-colors hover:text-[#ff6b47]/80"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

