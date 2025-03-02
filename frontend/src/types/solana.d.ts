interface WalletProvider {
    isPhantom?: boolean
    isTrust?: boolean
    isFalcon?: boolean
    isBackpack?: boolean
    isSolflare?: boolean
    connect(): Promise<{ publicKey: { toString(): string } }>
    disconnect(): Promise<void>
  }
  
  declare global {
    interface Window {
      solana?: WalletProvider
      solflare?: WalletProvider
      backpack?: WalletProvider
    }
  }
  
  export {}
  
  