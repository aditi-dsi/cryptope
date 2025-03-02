"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { cn } from "@/lib/utils";
import { TOKENS, type Token } from "@/lib/token-utils";

interface SenderBlockProps {
  disabled?: boolean;
  // 1) Changed second param to Token instead of string
  onAmountChange: (amount: string, token: Token) => void;
}

/**
 * SenderBlock:
 * - Disables input and token selection if `disabled` is true
 * - Calls onAmountChange(amount, selectedToken) whenever user updates
 */
export function SenderBlock({ disabled, onAmountChange }: SenderBlockProps) {
  const { isConnected, publicKey } = useWallet();
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]); // default SOL
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsTokenDropdownOpen(false);
      }
    };
    if (isTokenDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTokenDropdownOpen]);

  // If user changes amount or token, notify parent
  useEffect(() => {
    // 2) Pass the entire selectedToken, not just selectedToken.mint
    onAmountChange(amount, selectedToken);
  }, [amount, selectedToken, onAmountChange]);

  const handleAmountChange = (value: string) => {
    // Only update if not disabled
    if (disabled) return;

    // Validate
    const cleanValue = value.replace(/,/g, "");
    if (cleanValue === "" || /^\d*\.?\d*$/.test(cleanValue)) {
      setAmount(cleanValue);
    }
  };

  // Format for display (commas)
  const formatAmount = (value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, "");
    const parts = cleanValue.split(".");
    if (parts.length > 2) return amount;

    if (parts[0].length > 12) {
      parts[0] = parts[0].slice(0, 12);
    }

    let wholeNumber = parts[0];
    wholeNumber = wholeNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.length === 2 ? `${wholeNumber}.${parts[1]}` : wholeNumber;
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-[#131316] p-4 transition-all duration-300",
        isFocused &&
          !disabled &&
          "border-[#ff6b47]/50 shadow-[0_0_10px_rgba(255,107,71,0.15)]"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-400">Sender</h2>
        {isConnected && publicKey && (
          <span className="rounded-lg bg-[#1E1F24] px-2 py-1 text-xs text-zinc-400">
            {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
          </span>
        )}
      </div>

      <div className="mb-2 flex items-center justify-between">
        {/* Token Dropdown */}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() =>
              !disabled && setIsTokenDropdownOpen(!isTokenDropdownOpen)
            }
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#1E1F24] px-3 py-2 text-left transition-colors",
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-[#ff6b47]/10"
            )}
          >
            <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              <Image
                src={selectedToken.icon || "/placeholder.svg"}
                alt={selectedToken.name}
                width={24}
                height={24}
                className=" object-cover"
              />
            </div>
            <span className="text-white">{selectedToken.symbol}</span>
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 text-zinc-400 transition-transform",
                isTokenDropdownOpen && "rotate-180"
              )}
            />
          </button>

          {isTokenDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 z-10 mt-2 rounded-lg border border-zinc-800 bg-[#1E1F24] py-1 shadow-xl"
            >
              {TOKENS.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => {
                    setSelectedToken(token);
                    setIsTokenDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#ff6b47]/10 transition-colors"
                >
                  <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    <Image
                      src={token.icon || "/placeholder.svg"}
                      alt={token.name}
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  </div>

                  <span className="text-white">{token.symbol}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div className="flex-1 text-right">
          <div className="h-[48px] flex items-center justify-end">
            <input
              type="text"
              disabled={disabled}
              value={formatAmount(amount)}
              onChange={(e) => handleAmountChange(e.target.value)}
              onFocus={() => !disabled && setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="0.00"
              className={cn(
                "w-full bg-transparent px-4 text-right font-semibold text-white focus:outline-none transition-all duration-200",
                amount.replace(/[,.]/, "").length > 7 ? "text-2xl" : "text-3xl",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              style={{ height: "38px" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
