interface JupiterSwapResponse {
  swapTransaction: string
}

export async function buildSwap(inputMint: string, outputMint: string, amount: number) {
  try {
    const swapRes = await fetch("https://api.jup.ag/swap/v1/swap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inputMint,
        outputMint,
        amount,
      }),
    })

    if (!swapRes.ok) {
      throw new Error(`Swap request failed. Status ${swapRes.status}`)
    }

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
