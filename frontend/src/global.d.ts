// global.d.ts

// Define transaction and connection types to avoid using 'any'
import { Transaction, Connection, SendOptions } from "@solana/web3.js";

// Extend the Window interface so TypeScript knows about wallet providers
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      isTrust?: boolean;
      isFalcon?: boolean;
      connect?: () => Promise<{ publicKey?: { toString(): string } } | void>;
      disconnect?: () => Promise<void>;
      publicKey?: { toString(): string };
      signTransaction?: (transaction: Transaction) => Promise<Transaction>;
      signAllTransactions?: (transactions: Transaction[]) => Promise<Transaction[]>;
      sendTransaction?: (
        transaction: Transaction,
        connection: Connection,
        options?: SendOptions
      ) => Promise<string>;
      signAndSendTransaction?: (
        transaction: Transaction
      ) => Promise<{ signature?: string }>;
    };
    solflare?: {
      connect?: () => Promise<void>;
      disconnect?: () => Promise<void>;
      publicKey?: { toString(): string };
      signTransaction?: (transaction: Transaction) => Promise<Transaction>;
      signAllTransactions?: (transactions: Transaction[]) => Promise<Transaction[]>;
      sendTransaction?: (
        transaction: Transaction,
        connection: Connection,
        options?: SendOptions
      ) => Promise<string>;
      signAndSendTransaction?: (
        transaction: Transaction
      ) => Promise<{ signature?: string }>;
    };
    backpack?: {
      solana?: {
        connect?: () => Promise<{ publicKey?: { toString(): string } } | void>;
        disconnect?: () => Promise<void>;
        publicKey?: { toString(): string };
        signTransaction?: (transaction: Transaction) => Promise<Transaction>;
        signAllTransactions?: (transactions: Transaction[]) => Promise<Transaction[]>;
        sendTransaction?: (
          transaction: Transaction,
          connection: Connection,
          options?: SendOptions
        ) => Promise<string>;
        signAndSendTransaction?: (
          transaction: Transaction
        ) => Promise<{ signature?: string }>;
      };
      connect?: () => Promise<{ publicKey?: { toString(): string } } | void>;
      disconnect?: () => Promise<void>;
      publicKey?: { toString(): string };
      signTransaction?: (transaction: Transaction) => Promise<Transaction>;
      signAllTransactions?: (transactions: Transaction[]) => Promise<Transaction[]>;
      sendTransaction?: (
        transaction: Transaction,
        connection: Connection,
        options?: SendOptions
      ) => Promise<string>;
      signAndSendTransaction?: (
        transaction: Transaction
      ) => Promise<{ signature?: string }>;
    };
  }
}

export {};