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

  // Load saved wallet state from localStorage
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

  // Save wallet state to localStorage
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

  /**
   * Connect to a chosen wallet by name.
   * Phantom, Backpack, and Trust return publicKey from `connect()`,
   * Solflare does NOT, so we must read `provider.publicKey` after connect().
   */
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
          // Solflare connect does not return a `publicKey` in the response
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

      // If successful, update state
      setPublicKey(newPublicKey)
      setIsConnected(true)
      setConnectedWallet(walletName)

      // Persist in localStorage
      saveWalletState({
        publicKey: newPublicKey,
        wallet: walletName,
      })
    } catch (error) {
      console.error(`Failed to connect ${walletName}:`, error)
      setPublicKey(null)
      setIsConnected(false)
      setConnectedWallet(null)
      clearWalletState()
      throw error
    } finally {
      setConnecting(false)
    }
  }

  /**
   * Disconnect from the currently connected wallet.
   */
  const disconnect = async () => {
    try {
      // We try all known providers
      const provider = window.solana || window.solflare || window.backpack
      if (provider?.disconnect) {
        await provider.disconnect()
      }
      setPublicKey(null)
      setIsConnected(false)
      setConnectedWallet(null)
      clearWalletState()
    } catch (error) {
      console.error("Failed to disconnect wallet:", error)
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

// Export a convenient hook
export const useWallet = () => useContext(WalletContext)
