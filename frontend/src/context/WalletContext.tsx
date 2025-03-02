"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Connection, Transaction, SendOptions } from "@solana/web3.js";
import type { WalletName } from "@/lib/wallet-utils";
import { useNotificationStore } from "@/stores/notification-store";



interface WalletState {
  publicKey: string | null;
  wallet: WalletName | null;
}

interface WalletContextType {
  publicKey: string | null;
  isConnected: boolean;
  connecting: boolean;
  connectedWallet: WalletName | null;
  connect: (walletName: WalletName) => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: ((transaction: Transaction) => Promise<Transaction>) | null;
  sendTransaction:
    | ((
        transaction: Transaction,
        connection?: Connection,
        options?: SendOptions
      ) => Promise<string>)
    | null;
}

// Define WalletProvider type
interface WalletProvider {
  connect?: () => Promise<{ publicKey?: { toString(): string } } | void>;
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
  disconnect?: () => Promise<void>;
  isPhantom?: boolean;
  isTrust?: boolean;
}

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

const WALLET_STATE_KEY = "wallet_state";

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connectedWallet, setConnectedWallet] = useState<WalletName | null>(
    null
  );
  const [signTransaction, setSignTransaction] = useState<
    ((tx: Transaction) => Promise<Transaction>) | null
  >(null);
  const [sendTransaction, setSendTransaction] = useState<
    | ((
        tx: Transaction,
        connection?: Connection,
        options?: SendOptions
      ) => Promise<string>)
    | null
  >(null);

  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(WALLET_STATE_KEY);
      if (savedState) {
        const { publicKey, wallet } = JSON.parse(savedState) as WalletState;
        if (publicKey && wallet) {
          setPublicKey(publicKey);
          setConnectedWallet(wallet);
        }
      }
    } catch (error) {
      console.error("Failed to load wallet state:", error);
    }
  }, []);

  const clearWalletState = useCallback(() => {
    try {
      localStorage.removeItem(WALLET_STATE_KEY);
    } catch (error) {
      console.error("Failed to clear wallet state:", error);
    }
  }, []);

  const saveWalletState = useCallback((state: WalletState) => {
    try {
      localStorage.setItem(WALLET_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save wallet state:", error);
    }
  }, []);

  const getWalletProvider = useCallback((walletName: WalletName): WalletProvider | null => {
    if (typeof window === "undefined") return null;

    switch (walletName) {
      case "Phantom":
        return window.solana && window.solana.isPhantom ? window.solana : null;
      case "Solflare":
        return window.solflare || null;
      case "Backpack":
        return (window.backpack?.solana || window.backpack) || null;
      case "Trust Wallet":
        return window.solana && window.solana.isTrust ? window.solana : null;
      default:
        return null;
    }
  }, []);

  const connect = useCallback(async (walletName: WalletName) => {
    try {
      setConnecting(true);
      const provider = getWalletProvider(walletName);

      console.log(`Attempting to connect to ${walletName}`, provider);
      if (!provider) {
        throw new Error(
          `${walletName} wallet not found. Please install the extension or app.`
        );
      }

      let newPublicKey: string | undefined;

      if (walletName === "Solflare") {
        if (provider.connect) {
          await provider.connect();
        }
        if (!provider.publicKey) {
          throw new Error("No public key found after connecting to Solflare");
        }
        newPublicKey = provider.publicKey.toString();
      } else {
        let response: { publicKey?: { toString(): string } } | void = {};
        if (provider.connect) {
          response = await provider.connect();
        }
        
        if (response && 'publicKey' in response && response.publicKey) {
          newPublicKey = response.publicKey.toString();
        } else if (provider.publicKey) {
          newPublicKey = provider.publicKey.toString();
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

      const signTransactionFn = async (
        transaction: Transaction
      ): Promise<Transaction> => {
        if (!provider) {
          throw new Error("No wallet provider found");
        }
        if (typeof provider.signTransaction === "function") {
          return provider.signTransaction(transaction);
        }

        if (typeof provider.signAllTransactions === "function") {
          const [signedTx] = await provider.signAllTransactions([transaction]);
          return signedTx;
        }
        throw new Error(`${walletName} does not support signTransaction`);
      };

      const sendTransactionFn = async (
        transaction: Transaction,
        connection?: Connection,
        options?: SendOptions
      ): Promise<string> => {
        if (!provider) {
          throw new Error("No wallet provider found");
        }

        const conn =
          connection ||
          new Connection(
            process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
              "https://api.mainnet-beta.solana.com",
            "confirmed"
          );

        if (typeof provider.sendTransaction === "function") {
          return provider.sendTransaction(transaction, conn, options);
        }

        if (typeof provider.signAndSendTransaction === "function") {
          const result = await provider.signAndSendTransaction(transaction);
          if (!result || !result.signature) {
            throw new Error("Wallet did not return a signature");
          }
          return result.signature;
        }

        throw new Error(`${walletName} does not support sending transactions`);
      };

      setPublicKey(newPublicKey);
      setIsConnected(true);
      setConnectedWallet(walletName);
      setSignTransaction(() => signTransactionFn);
      setSendTransaction(() => sendTransactionFn);

      saveWalletState({
        publicKey: newPublicKey,
        wallet: walletName,
      });

      addNotification({
        type: "success",
        title: "Wallet Connected",
        message: `You have connected ${walletName} wallet.`,
      });
    } catch (err) {
      console.error(`Failed to connect ${walletName}:`, err);

      setPublicKey(null);
      setIsConnected(false);
      setConnectedWallet(null);
      setSignTransaction(null);
      setSendTransaction(null);
      clearWalletState();

      addNotification({
        type: "error",
        title: "Connection Error",
        message:
          err instanceof Error
            ? err.message
            : `Failed to connect to ${walletName}.`,
      });

      throw err;
    } finally {
      setConnecting(false);
    }
  }, [addNotification, clearWalletState, getWalletProvider, saveWalletState]);

  useEffect(() => {
    if (connectedWallet && !isConnected) {
      connect(connectedWallet).catch((error) => {
        console.error("Failed to reconnect to wallet:", error);
        setPublicKey(null);
        setConnectedWallet(null);
        setIsConnected(false);
        clearWalletState();
      });
    }
  }, [connectedWallet, isConnected, clearWalletState, connect]);

  const disconnect = useCallback(async () => {
    try {
      const provider = getWalletProvider(connectedWallet as WalletName);
      if (provider?.disconnect) {
        await provider.disconnect();
      }

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
        message:
          error instanceof Error
            ? error.message
            : "Failed to disconnect wallet.",
      });
    }
  }, [addNotification, clearWalletState, connectedWallet, getWalletProvider]);

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

export function useWallet() {
  return useContext(WalletContext);
}