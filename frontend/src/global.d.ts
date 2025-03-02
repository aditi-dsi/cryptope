// global.d.ts

// Extend the Window interface so TypeScript knows about window.solana, window.solflare, etc.
declare global {
    interface Window {
      solana?: {
        isPhantom?: boolean;
        isTrust?: boolean;
        // connect() often returns { publicKey: ... }
        connect?: () => Promise<{ publicKey?: { toString(): string } }>;
        publicKey?: { toString(): string };
        signTransaction?: (tx: any) => Promise<any>;
        signAllTransactions?: (txs: any[]) => Promise<any[]>;
        sendTransaction?: (tx: any, conn: any, options?: any) => Promise<string>;
        signAndSendTransaction?: (tx: any) => Promise<{ signature: string }>;
      };
      solflare?: {
        connect?: () => Promise<void>;
        disconnect?: () => Promise<void>;
        publicKey?: { toString(): string };
        signTransaction?: (tx: any) => Promise<any>;
        sendTransaction?: (tx: any, conn: any, options?: any) => Promise<string>;
      };
      backpack?: {
        // Some builds attach a solana object. Adjust as needed for your Backpack version:
        solana?: {
          connect?: () => Promise<{ publicKey?: { toString(): string } }>;
          disconnect?: () => Promise<void>;
          publicKey?: { toString(): string };
          signTransaction?: (tx: any) => Promise<any>;
          signAndSendTransaction?: (tx: any) => Promise<{ signature: string }>;
        };
      };
    }
  }
  
  export {};
  