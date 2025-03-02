"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title: string
}

export function CustomModal({ isOpen, onClose, children, title }: CustomModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen && !isAnimating) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center px-4",
        "transition-opacity duration-300",
        isOpen ? "opacity-100" : "opacity-0",
      )}
      onTransitionEnd={() => !isOpen && setIsAnimating(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-xl border border-zinc-800 bg-[#1A1B1F] p-6 shadow-2xl",
          "transition-all duration-300",
          isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-[#ff6b47]/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}


