"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NotificationType } from "@/stores/notification-store"

interface NotificationProps {
  type?: NotificationType
  title: string
  message: string
  onClose?: () => void
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  info: "bg-[#ff6b47]",
}

export function Notification({ type = "info", title, message, onClose }: NotificationProps) {
  const [isClosing, setIsClosing] = useState(false)
  const Icon = icons[type]

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  useEffect(() => {
    return () => setIsClosing(false)
  }, [])

  return (
    <div
      className={cn(
        "relative flex w-full max-w-sm transform items-start gap-4 rounded-lg bg-zinc-900/90 p-4 shadow-lg backdrop-blur transition-all duration-300",
        isClosing ? "translate-x-[-100%] opacity-0" : "translate-x-0 opacity-100",
      )}
    >
      <div className={cn("flex-shrink-0 rounded-full p-2", styles[type])}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-white break-words">{title}</h3>
        <p className="text-sm text-zinc-400 break-all overflow-hidden">{message}</p>
      </div>
      <button
        onClick={handleClose}
        className="absolute right-2 top-2 rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white flex-shrink-0"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

