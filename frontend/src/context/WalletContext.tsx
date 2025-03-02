"use client";

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import {
  Connection,
  PublicKey,
  Transaction,
  SendOptions,
  // TransactionSignature,
} from "@solana/web3.js";
import type { WalletName } from "@/lib/wallet-utils";
import { useNotificationStore } from "@/stores/notification-store";

// Wallet state type for persistence
interface WalletState {
  publicKey: string | null;
  wallet: WalletName | null;
}

// Define the context type
interface WalletContextType {
  publicKey: string | null;
  isConnected: boolean;
  connecting: boolean;
  connectedWallet: WalletName | null;
  connect: (walletName: WalletName) => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: ((transaction: Transaction) => Promise<Transaction>) | null;
  sendTransaction: (
    (transaction: Transaction, connection?: Connection, options?: SendOptions) => Promise<string>
  ) | null;
}

// Create the context with a default value
const WalletContext = createContext<WalletContextType>({
  publicKey: null,
  isConnected: false,
  connecting: false,
  connectedWallet: null,
  connect: async () => {},
  disconnect: async () => {},
  signTransaction: null,
  sendTransaction: null,
});

// Local storage key for persistence
const WALLET_STATE_KEY = "wallet_state";

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connectedWallet, setConnectedWallet] = useState<WalletName | null>(null);
  const [signTransaction, setSignTransaction] = useState<((tx: Transaction) => Promise<Transaction>) | null>(null);
  const [sendTransaction, setSendTransaction] = useState<(
    (tx: Transaction, connection?: Connection, options?: SendOptions) => Promise<string>
  ) | null>(null);

  // Get notification function from store
  const addNotification = useNotificationStore((state) => state.addNotification);

  // Load saved wallet state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(WALLET_STATE_KEY);
      if (savedState) {
        const { publicKey, wallet } = JSON.parse(savedState) as WalletState;
        if (publicKey && wallet) {
          setPublicKey(publicKey);
          setConnectedWallet(wallet);
          // We'll attempt reconnection below
        }
      }
    } catch (error) {
      console.error("Failed to load wallet state:", error);
    }
  }, []);

  // Attempt reconnect if we have a saved wallet but are not currently connected
  useEffect(() => {
    if (connectedWallet && !isConnected) {
      connect(connectedWallet).catch((error) => {
        console.error("Failed to reconnect to wallet:", error);
        // Clear wallet state if reconnection fails
        setPublicKey(null);
        setConnectedWallet(null);
        setIsConnected(false);
        clearWalletState();
      });
    }
  }, [connectedWallet, isConnected]);

  // Save wallet state to localStorage
  const saveWalletState = useCallback((state: WalletState) => {
    try {
      localStorage.setItem(WALLET_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save wallet state:", error);
    }
  }, []);

  // Clear wallet state from localStorage
  const clearWalletState = useCallback(() => {
    try {
      localStorage.removeItem(WALLET_STATE_KEY);
    } catch (error) {
      console.error("Failed to clear wallet state:", error);
    }
  }, []);

  /**
   * Returns the window object for each wallet, if installed.
   */
  const getWalletProvider = (walletName: WalletName): any => {
    if (typeof window === "undefined") return null;

    switch (walletName) {
      case "Phantom":
        return window.solana?.isPhantom ? window.solana : null;
      case "Solflare":
        return window.solflare;
      case "Backpack":
        // Backpack often attaches to `window.backpack.solana`
        // But your code references `window.backpack` so let's try that first
        return window.backpack?.solana || window.backpack || null;
      case "Trust Wallet":
        return window.solana?.isTrust ? window.solana : null;
      default:
        return null;
    }
  };

  /**
   * Connect to the chosen wallet, retrieve the public key,
   * and set up signTransaction/sendTransaction accordingly.
   */
  const connect = async (walletName: WalletName) => {
    try {
      setConnecting(true);
      const provider = getWalletProvider(walletName);

      console.log(`Attempting to connect to ${walletName}`, provider);
      if (!provider) {
        throw new Error(`${walletName} wallet not found. Please install the extension or app.`);
      }

      // Some wallets (Phantom, Backpack, Trust) respond to `provider.connect()`
      // Others (like Solflare) need a different approach
      let newPublicKey: string;

      if (walletName === "Solflare") {
        // Some versions of Solflare: provider.connect() returns void,
        // and provider.publicKey is updated
        await provider.connect();
        if (!provider.publicKey) {
          throw new Error("No public key found after connecting to Solflare");
        }
        newPublicKey = provider.publicKey.toString();
      } else {
        // For Phantom, Backpack, Trust, etc.
        // provider.connect() typically returns { publicKey: ... }
        const response = await provider.connect();
        newPublicKey = response.publicKey?.toString();
        if (!newPublicKey) {
          // Some providers attach pubkey after the fact. If not present:
          newPublicKey = provider.publicKey?.toString();
        }
      }

      if (!newPublicKey) {
        throw new Error("No public key found after attempting connection.");
      }

      console.log("Connected wallet:", walletName, "Public key:", newPublicKey);
      console.log("Provider capabilities:", {
        signTransaction: !!provider.signTransaction,
        sendTransaction: !!provider.sendTransaction,
        signAndSendTransaction: !!provider.signAndSendTransaction,
      });

      // Define signTransaction function (if available)
      const signTransactionFn = async (transaction: Transaction): Promise<Transaction> => {
        if (!provider) {
          throw new Error("No wallet provider found");
        }
        if (typeof provider.signTransaction === "function") {
          return provider.signTransaction(transaction);
        }
        // Fallback: If a wallet only offers signAllTransactions or signAndSendTransaction,
        // we can do a partial approach. E.g., signAllTransactions([transaction])[0].
        if (typeof provider.signAllTransactions === "function") {
          const [signedTx] = await provider.signAllTransactions([transaction]);
          return signedTx;
        }
        // If a wallet simply can't sign, throw
        throw new Error(`${walletName} does not support signTransaction`);
      };

      // Define sendTransaction function (try provider.sendTransaction, else fallback)
      const sendTransactionFn = async (
        transaction: Transaction,
        connection?: Connection,
        options?: SendOptions
      ): Promise<string> => {
        if (!provider) {
          throw new Error("No wallet provider found");
        }

        // Use a default connection if none provided
        const conn =
          connection ||
          new Connection(
            process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
            "confirmed"
          );

        if (typeof provider.sendTransaction === "function") {
          // Use the standard method
          return provider.sendTransaction(transaction, conn, options);
        }

        // Fallback: some wallets only have signAndSendTransaction (like older Backpack or Glow)
        if (typeof provider.signAndSendTransaction === "function") {
          // signAndSendTransaction typically returns { signature: string }
          const result = await provider.signAndSendTransaction(transaction);
          if (!result || !result.signature) {
            throw new Error("Wallet did not return a signature");
          }
          // Optionally confirm the transaction on the client, or rely on the wallet
          return result.signature;
        }

        throw new Error(`${walletName} does not support sending transactions`);
      };

      // Update context state
      setPublicKey(newPublicKey);
      setIsConnected(true);
      setConnectedWallet(walletName);
      setSignTransaction(() => signTransactionFn);
      setSendTransaction(() => sendTransactionFn);

      // Persist in localStorage so we can attempt auto-reconnect
      saveWalletState({
        publicKey: newPublicKey,
        wallet: walletName,
      });

      // Show success notification
      addNotification({
        type: "success",
        title: "Wallet Connected",
        message: `You have connected ${walletName} wallet.`,
      });
    } catch (err) {
      console.error(`Failed to connect ${walletName}:`, err);

      // Reset wallet state
      setPublicKey(null);
      setIsConnected(false);
      setConnectedWallet(null);
      setSignTransaction(null);
      setSendTransaction(null);
      clearWalletState();

      // Show error notification
      addNotification({
        type: "error",
        title: "Connection Error",
        message: err instanceof Error ? err.message : `Failed to connect to ${walletName}.`,
      });

      throw err;
    } finally {
      setConnecting(false);
    }
  };

  /**
   * Disconnect from the current wallet
   */
  const disconnect = async () => {
    try {
      const provider = getWalletProvider(connectedWallet as WalletName);
      if (provider?.disconnect) {
        await provider.disconnect();
      }

      // Reset wallet state
      setPublicKey(null);
      setIsConnected(false);
      setConnectedWallet(null);
      setSignTransaction(null);
      setSendTransaction(null);
      clearWalletState();

      addNotification({
        type: "info",
        title: "Wallet Disconnected",
        message: "You have disconnected your wallet.",
      });
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);

      addNotification({
        type: "error",
        title: "Disconnect Error",
        message: error instanceof Error ? error.message : "Failed to disconnect wallet.",
      });
    }
  };

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        isConnected,
        connecting,
        connectedWallet,
        connect,
        disconnect,
        signTransaction,
        sendTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// Create a hook to consume the wallet context
export function useWallet() {
  return useContext(WalletContext);
}
