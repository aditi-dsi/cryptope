import { index } from "@/assets"

// Token type definition
export interface Token {
    symbol: string
    name: string
    icon: string
    decimals: number
  }
  
  // Token data
  export const TOKENS: Token[] = [
    {
      symbol: "SOL",
      name: "Solana",
      icon: index.Solana_Logo.src,
      decimals: 9,
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      icon: index.Usdc_Logo.src,
      decimals: 6,
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      icon: index.Eth_Logo.src,
      decimals: 18,
    },
    {
      symbol: "BTC",
      name: "Bitcoin",
      icon: index.Bitcoin_Logo.src,
      decimals: 8,
    },
  ]
  
  // Function to convert number to words
  export function numberToWords(num: number): string {
    const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
    const teens = [
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ]
  
    if (num === 0) return "zero"
  
    function convert(n: number): string {
      if (n < 10) return ones[n]
      if (n < 20) return teens[n - 10]
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? "-" + ones[n % 10] : "")
      if (n < 1000) return ones[Math.floor(n / 100)] + " hundred" + (n % 100 ? " and " + convert(n % 100) : "")
      return convert(Math.floor(n / 1000)) + " thousand" + (n % 1000 ? " " + convert(n % 1000) : "")
    }
  
    const parts = num.toString().split(".")
    let result = convert(Number.parseInt(parts[0]))
  
    if (parts[1]) {
      result +=
        " point " +
        parts[1]
          .split("")
          .map((digit) => ones[Number.parseInt(digit)])
          .join(" ")
    }
  
    return result
  }
  
  