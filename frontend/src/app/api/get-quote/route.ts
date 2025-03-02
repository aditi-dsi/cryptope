import { NextResponse } from "next/server"

/**
 * POST /api/get-quote
 * Expects JSON body: { inputMint, outputMint, amount }
 * Calls Jupiter aggregator at https://api.jup.ag/swap/v1/quote
 * Returns { success: true, quoteData: { ... } }
 */
export async function POST(request: Request) {
  try {
    const { inputMint, outputMint, amount } = await request.json()
    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { error: "Missing inputMint, outputMint, or amount" },
        { status: 400 }
      )
    }

    // 1) Build the EXACT same Jupiter URL you used before
    //    This might be mainnet only and might be deprecated if Jupiter changed domains.
    const quoteUrl = `https://api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`

    console.log("Calling Jupiter aggregator with:", quoteUrl)

    // 2) Fetch from Jupiter
    const response = await fetch(quoteUrl)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Jupiter quote request failed with status ${response.status}: ${errorText}`)
    }

    // 3) This 'quoteData' will have shape like:
    //    {
    //      "inputMint": "...",
    //      "outputMint": "...",
    //      "inAmount": "...",
    //      "outAmount": "...",
    //      ...
    //    }
    const quoteData = await response.json()
    console.log("Got aggregator quoteData:", quoteData)

    // 4) Return the same shape you used to have
    return NextResponse.json({
      success: true,
      quoteData
    })
  } catch (err: any) {
    console.error("Error in /api/get-quote route:", err)
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 })
  }
}
