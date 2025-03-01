
import phantomLogo from "@/assets/phantomLogo.png"
import solflareLogo from "@/assets/solfareLogo.png"
import backpackLogo from "@/assets/backpackLogo.png"
import trustwalletLogo from "@/assets/trustwalletLogo.png"
import walletDefault from "@/assets/default.jpg"

export const assets = {
  Phantom_Logo: phantomLogo,
  Solflare_Logo: solflareLogo,
  Backpack_Logo: backpackLogo,
  Trustwallet_Logo: trustwalletLogo,
  Default_Wallet_Icon: walletDefault
} as const

export const WALLET_URLS = {
  Phantom: "https://phantom.app/download",
  Solflare: "https://solflare.com/download",
  Backpack: "https://www.backpack.app/download",
  "Trust Wallet": "https://trustwallet.com/download",
} as const

export type WalletName = keyof typeof WALLET_URLS

export interface WalletInfo {
  name: WalletName
  icon: string
  detect: () => boolean
}

export const formatAddress = (address: string | null) => {
  if (!address) return ""
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

// Default fallback image
const DEFAULT_WALLET_ICON = assets.Default_Wallet_Icon

export const WALLET_INFO: WalletInfo[] = [
  {
    name: "Phantom",
    icon:assets.Phantom_Logo.src,  
    detect: () => {
      try {
        return (
          typeof window !== "undefined" &&
          !!window.solana &&
          !!window.solana.isPhantom &&
          !window.solana.isTrust &&
          !window.solana.isFalcon
        )
      } catch {
        return false
      }
    },
  },
  {
    name: "Solflare",
    icon: assets.Solflare_Logo.src,
    detect: () => {
      try {
        return typeof window !== "undefined" && !!window.solflare
      } catch {
        return false
      }
    },
  },
  {
    name: "Backpack",
    icon: assets.Backpack_Logo.src,
    detect: () => {
      try {
        return typeof window !== "undefined" && !!window.backpack
      } catch {
        return false
      }
    },
  },
  {
    name: "Trust Wallet",
    icon: assets.Trustwallet_Logo.src,
    detect: () => {
      try {
        return typeof window !== "undefined" && !!window.solana?.isTrust
      } catch {
        return false
      }
    },
  },
]

