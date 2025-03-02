// buildSwap.ts (example)

interface JupiterSwapResponse {
    swapTransaction: string
    // Add more fields if needed
  }
  
  export async function buildSwap(inputMint: string, outputMint: string, amount: number) {
    try {
      // ... your fetch logic for the swap
      const swapRes = await fetch("https://api.jup.ag/swap/v1/swap", { /* ... */ })
  
      if (!swapRes.ok) {
        throw new Error(`Swap request failed. Status ${swapRes.status}`)
      }
  
      // Cast the JSON to JupiterSwapResponse
      const swapData = (await swapRes.json()) as JupiterSwapResponse
  
      if (!swapData.swapTransaction) {
        throw new Error("No swapTransaction found in swap response.")
      }
  
      return { swapTransaction: swapData.swapTransaction }
    } catch (err) {
      console.error("Error in buildSwap:", err)
      throw err
    }
  }
  