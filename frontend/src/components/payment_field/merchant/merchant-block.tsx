"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Plus } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { AddMerchantModal } from "./add-merchant-sheet"
import { index } from "@/assets"

interface Merchant {
  id: string
  name: string
  address: string
}

const DEFAULT_MERCHANTS: Merchant[] = [
  {
    id: "1",
    name: "Merchant 1",
    address: "8m4JS8gdXzw7xhG1ExKxoKL2MZ9EyKXwWqNqRJsYxmXb",
  },
  {
    id: "2",
    name: "Merchant 2",
    address: "3KLB9Tqsj1x4yvJkwxVUhRucYEvKGRxvgqkGHsVPshCq",
  },
]

export function MerchantSelector() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [merchants, setMerchants] = useState<Merchant[]>(DEFAULT_MERCHANTS)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both the dropdown and the button
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isDropdownOpen])

  // Fixed USDC token
  const fixedToken = {
    symbol: "USDC",
    name: "USD Coin",
    icon: index.Usdc_Logo.src,
    decimals: 6,
  }

  useEffect(() => {
    const storedMerchants = localStorage.getItem("merchants")
    if (storedMerchants) {
      setMerchants([...DEFAULT_MERCHANTS, ...JSON.parse(storedMerchants)])
    }
  }, [])

  const handleAddMerchant = (merchant: Omit<Merchant, "id">) => {
    // Check for duplicate name in both default and stored merchants
    const isDuplicateName = merchants.some(
      (existingMerchant) => existingMerchant.name.toLowerCase() === merchant.name.toLowerCase(),
    )

    if (isDuplicateName) {
      throw new Error("A merchant with this name already exists")
    }

    const newMerchant = {
      ...merchant,
      id: Date.now().toString(),
    }

    const storedMerchants = JSON.parse(localStorage.getItem("merchants") || "[]")
    const updatedMerchants = [...storedMerchants, newMerchant]

    localStorage.setItem("merchants", JSON.stringify(updatedMerchants))
    setMerchants([...DEFAULT_MERCHANTS, ...updatedMerchants])
    setSelectedMerchant(newMerchant)
    setIsModalOpen(false)
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (!selectedMerchant) {
    return (
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={cn(
            "flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-[#131316] p-4 text-left transition-all duration-300",
            isDropdownOpen && "border-[#ff6b47]/50 shadow-[0_0_10px_rgba(255,107,71,0.15)]",
          )}
        >
          <span className="text-zinc-400">Select a merchant</span>
          <ChevronDown
            className={cn("h-5 w-5 text-zinc-400 transition-transform duration-200", isDropdownOpen && "rotate-180")}
          />
        </button>

        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 z-10 mt-2 rounded-lg border border-zinc-800 bg-[#1E1F24] py-1 shadow-xl"
          >
            <div className="custom-scrollbar max-h-[240px] overflow-y-auto">
              {merchants.map((merchant) => (
                <button
                  key={merchant.id}
                  onClick={() => {
                    setSelectedMerchant(merchant)
                    setIsDropdownOpen(false)
                  }}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#ff6b47]/10 transition-colors"
                >
                  <span className="text-white">{merchant.name}</span>
                  <span className="text-sm text-zinc-400">{formatAddress(merchant.address)}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setIsModalOpen(true)
                setIsDropdownOpen(false)
              }}
              className="flex w-full items-center gap-2 border-t border-zinc-800 px-4 py-3 text-left text-[#ff6b47] hover:bg-[#ff6b47]/10 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Merchant</span>
            </button>
          </div>
        )}

        <AddMerchantModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddMerchant} />
      </div>
    )
  }

  // Show merchant box UI when merchant is selected
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#131316] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-400">{selectedMerchant.name}</h2>
        <span className="rounded-lg bg-[#1E1F24] px-2 py-1 text-xs text-zinc-400">
          {formatAddress(selectedMerchant.address)}
        </span>
      </div>

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
          <div className="h-[48px] flex items-center justify-end">
            <div className="w-full px-4 text-right text-3xl font-semibold text-zinc-600">--</div>
          </div>
          <div className="mt-1 text-right text-xs text-zinc-400">$1</div>
        </div>
      </div>

      <button
        onClick={() => setSelectedMerchant(null)}
        className="mt-2 w-full rounded-lg border border-zinc-800 bg-[#1E1F24] px-3 py-2 text-center text-sm text-zinc-400 hover:bg-[#ff6b47]/10 transition-colors"
      >
        Change Merchant
      </button>
    </div>
  )
}

