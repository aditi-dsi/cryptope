import { NextResponse } from "next/server";

/**
 * POST /api/get-quote
 * Expects JSON body: { inputMint, outputMint, amount }
 * Calls Jupiter aggregator at https://api.jup.ag/swap/v1/quote
 * Returns { success: true, quoteData: { ... } }
 */
export async function POST(request: Request) {
  try {
    const { inputMint, outputMint, amount } = await request.json();

    // Validate inputs
    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { error: "Missing inputMint, outputMint, or amount" },
        { status: 400 }
      );
    }

    // Construct the Jupiter quote URL safely using the WHATWG URL API
    const jupiterBaseUrl = "https://api.jup.ag";
    const urlObj = new URL("/swap/v1/quote", jupiterBaseUrl);

    urlObj.searchParams.set("inputMint", inputMint);
    urlObj.searchParams.set("outputMint", outputMint);
    urlObj.searchParams.set("amount", String(amount));
    urlObj.searchParams.set("slippageBps", "50"); // or your preferred slippage

    console.log("Calling Jupiter aggregator with URL:", urlObj.toString());

    // Fetch from Jupiter aggregator
    const response = await fetch(urlObj.toString());
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Jupiter quote request failed with status ${response.status}: ${errorText}`
      );
    }

    // Parse the aggregator quote data
    const quoteData = await response.json();
    console.log("Got aggregator quoteData:", quoteData);

    // Return the quote data so the client can show estimated amounts, etc.
    return NextResponse.json({
      success: true,
      quoteData,
    });
  } catch (err: any) {
    console.error("Error in /api/get-quote route:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
