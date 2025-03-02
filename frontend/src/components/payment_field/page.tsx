"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import type { WalletName } from "@/lib/wallet-utils";
import { SenderBlock } from "./sender/sender-block";
import { MerchantSelector } from "./merchant/merchant-block";
import { WalletModal } from "../navbar/connect-wallet-sheet";
import type { Token } from "@/lib/token-utils";

export function PaymentBlock() {
  const { isConnected, connect, publicKey } = useWallet();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // MERCHANT
  const [merchantAddress, setMerchantAddress] = useState("");

  // SENDER
  const [senderAmount, setSenderAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  // QUOTE UI STATES
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [merchantTokenAmount, setMerchantTokenAmount] = useState("--");
  const [rate, setRate] = useState("--");
  const [fee, setFee] = useState("--");

  // We'll store the aggregator's raw data for debugging
  const [quoteData, setQuoteData] = useState<any>(null);

  // Polling
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Must select merchant before enabling the sender block
  const isMerchantSelected = !!merchantAddress;

  // 1) MERCHANT & WALLET
  const handleWalletConnect = async (walletName: WalletName) => {
    try {
      await connect(walletName);
      setIsWalletModalOpen(false);
    } catch (error) {
      console.error("Failed to connect from PaymentBlock:", error);
    }
  };

  const handleMerchantSelected = (merchant: { id: string; name: string; address: string }) => {
    setMerchantAddress(merchant.address || "");
  };

  // 2) DEBOUNCE + POLL
  useEffect(() => {
    // If no merchant or invalid amount or no token, reset
    if (!isMerchantSelected || !senderAmount || parseFloat(senderAmount) <= 0 || !selectedToken) {
      stopPolling();
      resetQuoteState();
      return;
    }

    const timer = setTimeout(() => {
      fetchQuoteAndStartPolling();
    }, 500);

    return () => clearTimeout(timer);
  }, [senderAmount, selectedToken, isMerchantSelected]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function resetQuoteState() {
    setQuoteData(null);
    setMerchantTokenAmount("--");
    setRate("--");
    setFee("--");
  }

  function fetchQuoteAndStartPolling() {
    fetchQuote();
    stopPolling();
    pollRef.current = setInterval(() => {
      fetchQuote();
    }, 5000);
  }

  // 3) FETCH QUOTE from /api/get-quote
  async function fetchQuote() {
    try {
      if (!selectedToken) return;

      setIsQuoteLoading(true);

      // Use the token’s decimals, not hard-coded 9
      const decimals = selectedToken.decimals;
      const rawAmount = Math.floor(parseFloat(senderAmount) * 10 ** decimals);

      // We'll assume user wants USDC out
      const outputMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

      console.log("Fetching aggregator quote with:", {
        inputMint: selectedToken.mint,
        outputMint,
        amount: rawAmount,
      });

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
      console.log("Full aggregator response from /api/get-quote:", data);

      if (!data.quoteData) {
        console.warn("No quoteData returned:", data);
        resetQuoteState();
        return;
      }
      setQuoteData(data.quoteData);

      const qd = data.quoteData;
      if (!qd.inAmount || !qd.outAmount) {
        console.warn("Missing inAmount/outAmount in quoteData:", qd);
        resetQuoteState();
        return;
      }

      // Convert outAmount to tokens (USDC decimals=6)
      const outLamports = parseFloat(qd.outAmount);
      const outToken = outLamports / 10 ** 6;
      setMerchantTokenAmount(outToken.toFixed(6));

      // Rate: "1 <selectedToken.symbol> => X USDC"
      const inLamports = parseFloat(qd.inAmount);
      const inToken = inLamports / 10 ** decimals;
      const ratio = outToken / inToken;
      setRate(`1 ${selectedToken.symbol} ~ ${ratio.toFixed(6)} USDC`);

      // Fee
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
  }

  // 4) PROCEED TO PAY
  async function handleProceedToPay() {
    if (!publicKey || !merchantAddress) {
      alert("Please connect wallet and select a merchant first!");
      return;
    }

    try {
      // 1) Send addresses to /api/set-addresses
      {
        const response = await fetch("/api/set-addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderPubKey: publicKey,
            merchantPubKey: merchantAddress,
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Failed to set addresses.");
        }
        console.log("Set addresses success:", result);
      }

      // 2) Optionally call /api/get-quote again or finalize a transaction
      alert("Successfully sent addresses and swap details to backend!");
    } catch (err) {
      console.error("Error in handleProceedToPay:", err);
      alert("Error: see console for details.");
    }
  }

  // 5) Main Button
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
            onAmountChange={(amt, token) => {
              setSenderAmount(amt);
              setSelectedToken(token);
            }}
          />
          <div className="absolute -bottom-6 left-1/2 z-10 -translate-x-1/2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ff6b47]/20 to-[#ff6b47]/20 blur-md"></div>
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
            onMerchantSelected={(m) => setMerchantAddress(m.address)}
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

      {/* Wallet Modal, etc. */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />
    </div>
  );
}
