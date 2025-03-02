import { index } from "@/assets"

export interface Token {
  symbol: string
  name: string
  icon: string
  decimals: number
  mint: string        
}

export const TOKENS: Token[] = [
  {
    symbol: "SOL",
    name: "Solana",
    icon: index.Solana_Logo.src,
    decimals: 9,
    mint: "So11111111111111111111111111111111111111112",
  },
  {
    symbol: "JupSOL",
    name: "JupSOL",
    icon: index.jupSol_Logo.src,
    decimals: 9,
    mint: "jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v",
  },
  {
    symbol: " Melania",
    name: "JupSOL",
    icon: index.melania_Logo.src,
    decimals: 6,
    mint: "FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P",
  },
  {
    symbol: "Trump",
    name: "Trump",
    icon: index.trump_Logo.src,
    decimals: 6,
    mint: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
  },
  {
    symbol: "USDT",
    name: "USDT",
    icon: index.Usdt_Logo.src,
    decimals: 6,
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  },
  {
    symbol: "WBTC",
    name: "Wrapped-Bitcoin",
    icon: index.Wbtc_Logo.src,
    decimals: 8,
    mint: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
  },
  {
    symbol: "WETH",
    name: "Wrapped-Eth",
    icon: index.Weth_Logo.src,
    decimals: 8,
    mint: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
  },
  {
    symbol: "WIF",
    name: "WIF",
    icon: index.WIF_Logo.src,
    decimals: 6,
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  },
];

  
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
  
  