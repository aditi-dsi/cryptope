"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ChevronDown } from "lucide-react"
import { useWallet } from "@/context/WalletContext"
import { cn } from "@/lib/utils"
import { TOKENS, numberToWords } from "@/lib/token-utils"

interface SenderBlockProps {
  onAmountChange: (amount: string) => void
}

export function SenderBlock({ onAmountChange }: SenderBlockProps) {
  const { isConnected, publicKey } = useWallet()
  const [amount, setAmount] = useState("")
  const [amountInWords, setAmountInWords] = useState("")
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]) // SOL as default
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Add refs for click outside handling
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsTokenDropdownOpen(false)
      }
    }

    if (isTokenDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isTokenDropdownOpen])

  useEffect(() => {
    if (amount && !isNaN(Number.parseFloat(amount))) {
      setAmountInWords(numberToWords(Number.parseFloat(amount)))
    } else {
      setAmountInWords("")
    }
  }, [amount])

  const formatAmount = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, "")

    const parts = cleanValue.split(".")
    if (parts.length > 2) return amount

    if (parts[0].length > 12) {
      parts[0] = parts[0].slice(0, 12)
    }

    let wholeNumber = parts[0]
    wholeNumber = wholeNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    return parts.length === 2 ? `${wholeNumber}.${parts[1]}` : wholeNumber
  }

  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/,/g, "")
    if (cleanValue === "" || /^\d*\.?\d*$/.test(cleanValue)) {
      setAmount(cleanValue)
      onAmountChange(cleanValue) // Notify parent component of amount changes
    }
  }

  const formatAddress = (address: string | null) => {
    if (!address) return ""
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-[#131316] p-4 transition-all duration-300",
        isFocused && "border-[#ff6b47]/50 shadow-[0_0_10px_rgba(255,107,71,0.15)]",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-400">Sender</h2>
        {isConnected && publicKey && (
          <span className="rounded-lg bg-[#1E1F24] px-2 py-1 text-xs text-zinc-400">{formatAddress(publicKey)}</span>
        )}
      </div>

      <div className="mb-2 flex items-center justify-between">
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#1E1F24] px-3 py-2 text-left hover:bg-[#ff6b47]/10 transition-colors"
          >
            <div className="relative h-6 w-6">
              <Image
                src={selectedToken.icon || "/placeholder.svg"}
                alt={selectedToken.name}
                width={24}
                height={24}
                className="rounded-full object-contain"
              />
            </div>
            <span className="text-white">{selectedToken.symbol}</span>
            <ChevronDown
              className={cn("ml-auto h-4 w-4 text-zinc-400 transition-transform", isTokenDropdownOpen && "rotate-180")}
            />
          </button>

          {isTokenDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 z-10 mt-2 rounded-lg border border-zinc-800 bg-[#1E1F24] py-1 shadow-xl"
            >
              {TOKENS.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => {
                    setSelectedToken(token)
                    setIsTokenDropdownOpen(false)
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#ff6b47]/10 transition-colors"
                >
                  <div className="relative h-6 w-6">
                    <Image
                      src={token.icon || "/placeholder.svg"}
                      alt={token.name}
                      width={24}
                      height={24}
                      className="rounded-full object-contain"
                    />
                  </div>
                  <span className="text-white">{token.symbol}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 text-right">
          <div className="h-[48px] flex items-center justify-end">
            <input
              type="text"
              value={formatAmount(amount)}
              onChange={(e) => handleAmountChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="0.00"
              className={cn(
                "w-full bg-transparent px-4 text-right font-semibold text-white focus:outline-none transition-all duration-200",
                amount.replace(/[,.]/, "").length > 7 ? "text-2xl" : "text-3xl",
              )}
              style={{ height: "38px" }}
            />
          </div>
          <div className="mt-1 text-right text-xs text-zinc-400">$1</div>
        </div>
      </div>
    </div>
  )
}

