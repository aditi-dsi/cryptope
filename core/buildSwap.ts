import { getSenderPublicKey, getMerchantUSDCTokenAccount } from "./accountHandler.js"

/**
 * Dynamically build a Jupiter swap transaction
 * @param inputMint The mint address of the token being sent (e.g. "So1111...11112" for SOL)
 * @param outputMint The mint address of the token to receive (e.g. "EPjFWd...ZwyTDt1v" for USDC)
 * @param amount The amount of the input token in its smallest unit (e.g. lamports)
 * @returns The Jupiter swap transaction object (includes transaction in base64, etc.)
 */
export async function buildSwap(inputMint: string, outputMint: string, amount: number) {
  // 1) Fetch a quote from Jupiter
  const quoteUrl = `https://api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50&restrictIntermediateTokens=true&swapMode=ExactOut`
  const quoteResponse = await fetch(quoteUrl)
  const getSwapQuote = await quoteResponse.json()

  console.log("Jupiter Quote Response:", JSON.stringify(getSwapQuote, null, 2))

  // 2) Prepare the swap transaction
  // We'll use the dynamically set addresses from accountHandler
  const userPublicKey = getSenderPublicKey().toString()
  const destinationTokenAccount = getMerchantUSDCTokenAccount().toString()

  const swapResponse = await fetch("https://api.jup.ag/swap/v1/swap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quoteResponse: getSwapQuote,
      userPublicKey,
      destinationTokenAccount,
      dynamicComputeUnitLimit: true,
      dynamicSlippage: true,
      prioritizationFeeLamports: {
        priorityLevelWithMaxLamports: {
          maxLamports: 1000000,
          priorityLevel: "veryHigh",
        },
      },
    }),
  })

  const prepareSwap = await swapResponse.json()
  console.log("Jupiter Prepare Swap Response:", prepareSwap)

  return prepareSwap
}
