"use client"

import type React from "react"
import { useState } from "react"
import { CustomModal } from "./custom-modal"
import { useNotificationStore } from "@/stores/notification-store"

interface AddMerchantModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (merchant: { name: string; address: string }) => void
}

export function AddMerchantModal({ isOpen, onClose, onAdd }: AddMerchantModalProps) {
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [error, setError] = useState<string | null>(null)

  const addNotification = useNotificationStore((state) => state.addNotification)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Merchant name is required")
      return
    }

    if (!address.trim()) {
      setError("USDC account address is required")
      return
    }

    if (address.length !== 44) {
      setError("Invalid Solana address")
      return
    }

    const storedMerchants = JSON.parse(localStorage.getItem("merchants") || "[]")
    const defaultMerchants = [
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

    const allMerchants = [...defaultMerchants, ...storedMerchants]
    const duplicateAddress = allMerchants.find(
      (merchant) => merchant.address.toLowerCase() === address.trim().toLowerCase(),
    )

    if (duplicateAddress) {
      const errorMessage = `This address is already registered with merchant "${duplicateAddress.name}"`
      setError(errorMessage)
    
      return
    }

    try {
      // Call parent's onAdd
      onAdd({ name: name.trim(), address: address.trim() })

      // Reset form
      setName("")
      setAddress("")

      // Fire a success notification
      addNotification({
        type: "success",
        title: "Merchant Added",
        message: `Merchant "${name.trim()}" has been successfully added.`,
      })
    } catch (err) {
      // If onAdd threw an error, show a form error
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An error occurred while adding the merchant")
      }

      // Show an error notification
      addNotification({
        type: "error",
        title: "Add Merchant Error",
        message: err instanceof Error ? err.message : "An unexpected error occurred while adding the merchant.",
      })
    }
  }

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Add New Merchant">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm text-zinc-400">
            Merchant Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-[#131316] px-3 py-2 text-white placeholder-zinc-600 
                       focus:border-[#ff6b47]/50 focus:outline-none focus:ring-2 focus:ring-[#ff6b47]/20"
            placeholder="Enter merchant name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="block text-sm text-zinc-400">
            Merchant Account Address
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-[#131316] px-3 py-2 text-white placeholder-zinc-600 
                       focus:border-[#ff6b47]/50 focus:outline-none focus:ring-2 focus:ring-[#ff6b47]/20"
            placeholder="Enter USDC token account address"
          />
          <p className="text-xs text-zinc-500">
            Enter the merchant's SPL account address where they will receive payments
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-xl bg-[#ff6b47] py-3 text-center text-base font-medium text-white 
                     transition-colors hover:bg-[#ff6b47]/90"
        >
          Add Merchant
        </button>
      </form>
    </CustomModal>
  )
}

