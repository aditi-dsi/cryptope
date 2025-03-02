import { NextResponse } from "next/server";

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

    const jupiterBaseUrl = "https://api.jup.ag";
    const urlObj = new URL("/swap/v1/quote", jupiterBaseUrl);

    urlObj.searchParams.set("inputMint", inputMint);
    urlObj.searchParams.set("outputMint", outputMint);
    urlObj.searchParams.set("amount", String(amount));
    urlObj.searchParams.set("slippageBps", "50"); 

    console.log("Calling Jupiter aggregator with URL:", urlObj.toString());

    const response = await fetch(urlObj.toString());
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Jupiter quote request failed with status ${response.status}: ${errorText}`
      );
    }

    const quoteData = await response.json();
    console.log("Got aggregator quoteData:", quoteData);

    return NextResponse.json({
      success: true,
      quoteData,
    });
  } catch (err: unknown) {
    console.error("Error in /api/get-quote route:", err);
  
    let errorMessage = "Unknown error";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
  
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
  
}
