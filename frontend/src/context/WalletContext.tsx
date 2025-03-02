"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import type { WalletName } from "@/lib/wallet-utils"
import { useNotificationStore } from "@/stores/notification-store" // <-- Import your store

interface WalletContextType {
  publicKey: string | null
  isConnected: boolean
  connecting: boolean
  connectedWallet: WalletName | null
  connect: (walletName: WalletName) => Promise<void>
  disconnect: () => Promise<void>
}

const WalletContext = createContext<WalletContextType>({
  publicKey: null,
  isConnected: false,
  connecting: false,
  connectedWallet: null,
  connect: async () => {},
  disconnect: async () => {},
})

const WALLET_STATE_KEY = "wallet_state"

interface WalletState {
  publicKey: string | null
  wallet: WalletName | null
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<WalletName | null>(null)

  const addNotification = useNotificationStore((state) => state.addNotification)

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(WALLET_STATE_KEY)
      if (savedState) {
        const { publicKey, wallet } = JSON.parse(savedState) as WalletState
        if (publicKey && wallet) {
          setPublicKey(publicKey)
          setConnectedWallet(wallet)
          setIsConnected(true)
        }
      }
    } catch (error) {
      console.error("Failed to load wallet state:", error)
    }
  }, [])

  const saveWalletState = useCallback((state: WalletState) => {
    try {
      localStorage.setItem(WALLET_STATE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error("Failed to save wallet state:", error)
    }
  }, [])

  const clearWalletState = useCallback(() => {
    try {
      localStorage.removeItem(WALLET_STATE_KEY)
    } catch (error) {
      console.error("Failed to clear wallet state:", error)
    }
  }, [])

  const connect = async (walletName: WalletName) => {
    try {
      setConnecting(true)
      let provider: any
      let newPublicKey = ""

      switch (walletName) {
        case "Phantom": {
          if (!window.solana?.isPhantom) {
            throw new Error("Phantom wallet not found")
          }
          provider = window.solana
          const response = await provider.connect()
          newPublicKey = response.publicKey.toString()
          break
        }

        case "Solflare": {
          if (!window.solflare) {
            throw new Error("Solflare wallet not found")
          }
          provider = window.solflare
          await provider.connect()
          if (!provider.publicKey) {
            throw new Error("No public key found in Solflare provider after connect()")
          }
          newPublicKey = provider.publicKey.toString()
          break
        }

        case "Backpack": {
          if (!window.backpack) {
            throw new Error("Backpack wallet not found")
          }
          provider = window.backpack
          const response = await provider.connect()
          newPublicKey = response.publicKey.toString()
          break
        }

        case "Trust Wallet": {
          if (!window.solana?.isTrust) {
            throw new Error("Trust Wallet not found")
          }
          provider = window.solana
          const response = await provider.connect()
          newPublicKey = response.publicKey.toString()
          break
        }

        default: {
          throw new Error("Unsupported wallet")
        }
      }

      setPublicKey(newPublicKey)
      setIsConnected(true)
      setConnectedWallet(walletName)

      saveWalletState({
        publicKey: newPublicKey,
        wallet: walletName,
      })

      addNotification({
        type: "success",
        title: "Wallet Connected",
        message: `You have connected ${walletName}.`,
      })
    } catch (error) {
      console.error(`Failed to connect ${walletName}:`, error)
      setPublicKey(null)
      setIsConnected(false)
      setConnectedWallet(null)
      clearWalletState()

      addNotification({
        type: "error",
        title: "Connection Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect to wallet.",
      })

      throw error
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      const provider = window.solana || window.solflare || window.backpack
      if (provider?.disconnect) {
        await provider.disconnect()
      }
      setPublicKey(null)
      setIsConnected(false)
      setConnectedWallet(null)
      clearWalletState()

      addNotification({
        type: "info",
        title: "Wallet Disconnected",
        message: "You have disconnected your wallet.",
      })
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)

      addNotification({
        type: "error",
        title: "Disconnect Error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to disconnect from wallet.",
      })
    }
  }

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        isConnected,
        connecting,
        connectedWallet,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
