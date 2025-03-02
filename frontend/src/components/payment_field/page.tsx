"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowDown } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import type { WalletName } from "@/lib/wallet-utils";
import { SenderBlock } from "./sender/sender-block";
import { MerchantSelector } from "./merchant/merchant-block";
import { WalletModal } from "../navbar/connect-wallet-sheet";
import type { Token } from "@/lib/token-utils";
import { Connection, Transaction } from "@solana/web3.js";

// Import your notification store
import { useNotificationStore } from "@/stores/notification-store";

interface Merchant {
  id: string;
  name: string;
  address: string;
}

// Example minimal type for quote data from aggregator
// Adjust fields as needed if you know the real shape.
interface QuoteData {
  inAmount?: string;
  outAmount?: string;
  routePlan?: Array<{
    swapInfo?: {
      feeAmount?: string;
    };
    // add other route properties if needed
  }>;
  // etc. if you have more fields
}

export function PaymentBlock() {
  const {
    isConnected,
    connect,
    publicKey,
    signTransaction,
    sendTransaction,
    connectedWallet,
  } = useWallet();

  const addNotification = useNotificationStore((state) => state.addNotification);

  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // MERCHANT
  const [merchantAddress, setMerchantAddress] = useState<string>("");

  // SENDER
  const [senderAmount, setSenderAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  // QUOTE UI STATES
  const [isQuoteLoading, setIsQuoteLoading] = useState<boolean>(false);
  const [merchantTokenAmount, setMerchantTokenAmount] = useState<string>("--");
  const [rate, setRate] = useState<string>("--");
  const [fee, setFee] = useState<string>("--");

  // aggregator raw data
  // Replaced `any` with `QuoteData | null`
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);

  // Polling
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Must select merchant before enabling the sender block
  const isMerchantSelected = !!merchantAddress;

  // You had a debugging useEffect. It's fine to keep or remove.
  // We'll keep it but remove the console logs to avoid spam.
  useEffect(() => {
    // For example: console.log("Wallet state: ", { isConnected, publicKey, ... })
  }, [isConnected, publicKey, connectedWallet, signTransaction, sendTransaction]);

  const handleWalletConnect = async (walletName: WalletName) => {
    try {
      await connect(walletName);
      setIsWalletModalOpen(false);
    } catch (error) {
      console.error("Failed to connect from PaymentBlock:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to connect wallet";
      addNotification({
        type: "error",
        title: "Connection Error",
        message: errorMsg,
      });
    }
  };

  const handleMerchantSelected = (merchant: Merchant) => {
    setMerchantAddress(merchant.address || "");
  };

  // Helper to stop polling
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  // Helper to reset quote UI state
  const resetQuoteState = useCallback(() => {
    setQuoteData(null);
    setMerchantTokenAmount("--");
    setRate("--");
    setFee("--");
  }, []);

  // Fetch quote from /api/get-quote
  const fetchQuote = useCallback(async () => {
    try {
      if (!selectedToken) return;
      setIsQuoteLoading(true);

      const decimals = selectedToken.decimals;
      const rawAmount = Math.floor(parseFloat(senderAmount) * 10 ** decimals);
      const outputMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

      const res = await fetch("/api/get-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputMint: selectedToken.mint,
          outputMint,
          amount: rawAmount,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch quote. Status ${res.status}`);
      }

      const data = await res.json();
      if (!data.quoteData) {
        console.warn("No quoteData returned:", data);
        resetQuoteState();
        return;
      }

      setQuoteData(data.quoteData);

      const qd = data.quoteData as QuoteData;
      if (!qd.inAmount || !qd.outAmount) {
        console.warn("Missing inAmount/outAmount in quoteData:", qd);
        resetQuoteState();
        return;
      }

      // Convert outAmount to tokens (USDC decimals=6)
      const outLamports = parseFloat(qd.outAmount);
      const outToken = outLamports / 10 ** 6;
      setMerchantTokenAmount(outToken.toFixed(6));

      // Convert inAmount
      const inLamports = parseFloat(qd.inAmount);
      const inToken = inLamports / 10 ** decimals;
      const ratio = outToken / inToken;
      setRate(`1 ${selectedToken.symbol} ~ ${ratio.toFixed(6)} USDC`);

      // If aggregator includes fee info in routePlan
      const feeAmount = qd.routePlan?.[0]?.swapInfo?.feeAmount;
      if (feeAmount) {
        const feeLamports = parseFloat(feeAmount);
        const feeToken = feeLamports / 10 ** 6;
        setFee(`${feeToken.toFixed(4)} USDC`);
      } else {
        setFee("--");
      }
    } catch (err) {
      console.error("Error fetching quote:", err);
      resetQuoteState();
    } finally {
      setIsQuoteLoading(false);
    }
  }, [selectedToken, senderAmount, resetQuoteState]);

  // Helper to fetch quote + start polling
  const fetchQuoteAndStartPolling = useCallback(() => {
    fetchQuote();
    stopPolling();
    pollRef.current = setInterval(() => {
      fetchQuote();
    }, 5000);
  }, [fetchQuote, stopPolling]);

  // Debounce + Poll effect
  useEffect(() => {
    if (!isMerchantSelected || !senderAmount || parseFloat(senderAmount) <= 0 || !selectedToken) {
      stopPolling();
      resetQuoteState();
      return;
    }
    const timer = setTimeout(() => {
      fetchQuoteAndStartPolling();
    }, 500);
    return () => clearTimeout(timer);
  }, [
    isMerchantSelected,
    senderAmount,
    selectedToken,
    resetQuoteState,
    fetchQuoteAndStartPolling,
    stopPolling,
  ]);

  // Cleanup effect for polling
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // 4) PROCEED TO PAY
  const handleProceedToPay = useCallback(async () => {
    if (!publicKey || !merchantAddress) {
      addNotification({
        type: "error",
        title: "Invalid Action",
        message: "Please connect wallet and select a merchant first!",
      });
      return;
    }
    if (!sendTransaction) {
      console.error("Wallet capabilities missing:", {
        isConnected,
        publicKey: !!publicKey,
        signTransaction: !!signTransaction,
        sendTransaction: !!sendTransaction,
        walletName: connectedWallet,
      });
      addNotification({
        type: "error",
        title: "Wallet Error",
        message: "Your wallet doesn't support sending transactions.",
      });
      return;
    }
    if (!selectedToken) {
      addNotification({
        type: "error",
        title: "Token Missing",
        message: "Please select a token to pay with.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // (1) send addresses
      const addressResponse = await fetch("/api/set-addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderPubKey: publicKey,
          merchantPubKey: merchantAddress,
        }),
      });
      if (!addressResponse.ok) {
        const addressError = await addressResponse.json();
        throw new Error(addressError.error || "Failed to set addresses");
      }

      // (2) request transaction creation
      const decimals = selectedToken.decimals;
      const rawAmount = Math.floor(parseFloat(senderAmount) * 10 ** decimals);
      const outputMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

      const txInstructionsRes = await fetch("/api/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputMint: selectedToken.mint,
          outputMint,
          amount: rawAmount,
          userPublicKey: publicKey,
          merchantPublicKey: merchantAddress,
        }),
      });

      if (!txInstructionsRes.ok) {
        const errorData = await txInstructionsRes.json();
        throw new Error(errorData.error || "Failed to create transaction.");
      }

      const txResponseData = await txInstructionsRes.json();
      if (!txResponseData.serializedTransaction) {
        throw new Error("Transaction data is missing from server response");
      }

      // (3) deserialize the transaction
      let transaction: Transaction;
      try {
        const transactionBuffer = Buffer.from(txResponseData.serializedTransaction, "base64");
        transaction = Transaction.from(transactionBuffer);
      } catch {
        throw new Error("Invalid transaction format from server");
      }

      // (4) present transaction
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
        "confirmed"
      );
      const signature = await sendTransaction(transaction, connection);

      // (5) confirm
      await fetch("/api/confirm-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });

      // success notification
      addNotification({
        type: "success",
        title: "Transaction Success",
        message: `Payment complete! Tx signature: ${signature}`,
      });
    } catch (err: unknown) {
      console.error("Error in handleProceedToPay:", err);

      let errorMsg = "Something went wrong. Check console for details.";
      if (err instanceof Error) {
        if (err.message.includes("User rejected") || err.message.includes("cancelled")) {
          addNotification({
            type: "error",
            title: "Transaction Cancelled",
            message: "Transaction was cancelled by the user.",
          });
          setIsProcessing(false);
          return;
        }
        errorMsg = err.message;
      }

      addNotification({
        type: "error",
        title: "Transaction Error",
        message: errorMsg,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    publicKey,
    merchantAddress,
    sendTransaction,
    selectedToken,
    senderAmount,
    addNotification,
    connectedWallet,
    isConnected,
    signTransaction,
  ]);

  // 5) Main Button config
  const getButtonConfig = () => {
    if (!isConnected) {
      return {
        text: "Connect Wallet",
        onClick: () => setIsWalletModalOpen(true),
        className:
          "w-full rounded-xl bg-[#ff6b47]/10 py-4 text-center text-lg font-medium text-[#ff6b47] hover:bg-[#ff6b47]/20 transition-colors",
      };
    }
    if (!senderAmount || parseFloat(senderAmount) <= 0) {
      return {
        text: "Enter an amount",
        onClick: () => {},
        className:
          "w-full rounded-xl bg-[#ff6b47]/10 py-4 text-center text-lg font-medium text-[#ff6b47] hover:bg-[#ff6b47]/20 transition-colors cursor-not-allowed",
      };
    }
    if (isProcessing) {
      return {
        text: "Processing...",
        onClick: () => {},
        className:
          "w-full rounded-xl bg-[#ff6b47]/70 py-4 text-center text-lg font-medium text-white cursor-not-allowed",
      };
    }
    return {
      text: "Proceed to Pay",
      onClick: handleProceedToPay,
      className:
        "w-full rounded-xl bg-[#ff6b47] py-4 text-center text-lg font-medium text-white hover:bg-[#ff6b47]/90 transition-colors",
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="mx-auto max-w-md rounded-xl bg-[#1A1B1F] shadow-lg">
      <div className="p-4">
        {/* Sender Block */}
        <div className="relative">
          <SenderBlock
            disabled={!isMerchantSelected}
            onAmountChange={(amt: string, token: Token | null) => {
              setSenderAmount(amt);
              setSelectedToken(token);
            }}
          />
          <div className="absolute -bottom-6 left-1/2 z-10 -translate-x-1/2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ff6b47]/20 to-[#ff6b47]/20 blur-md" />
              <button className="relative rounded-full bg-[#1E1F24] p-3 border border-zinc-800 transition-colors">
                <ArrowDown className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="h-2" />

        {/* Merchant Selector */}
        <div className="mb-4">
          <MerchantSelector
            onMerchantSelected={handleMerchantSelected}
            merchantAmount={merchantTokenAmount}
            loading={isQuoteLoading}
          />
        </div>

        {/* Main Action Button */}
        <button onClick={buttonConfig.onClick} className={buttonConfig.className}>
          {buttonConfig.text}
        </button>

        {/* Show Rate + Fee if we have a valid quoteData */}
        {quoteData && parseFloat(senderAmount) > 0 && (
          <>
            <div className="my-4 border-t border-zinc-800" />
            <div className="flex align-middle justify-between text-sm text-zinc-400">
              <div className="mb-1">Rate: {rate}</div>
              <div>Fee: {fee}</div>
            </div>
          </>
        )}
      </div>

      {/* Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />
    </div>
  );
}
