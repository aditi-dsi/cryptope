// app/api/build-swap/route.ts
import { NextResponse } from "next/server"

/**
 * POST /api/build-swap
 * Expects JSON body: { inputMint, outputMint, amount, userPublicKey }
 * Returns { swapTransaction: "base64String" } of an unsigned transaction
 */
export async function POST(request: Request) {
  try {
    const { inputMint, outputMint, amount, userPublicKey } = await request.json()

    if (!inputMint || !outputMint || !amount || !userPublicKey) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // 1) Call Jupiter or aggregator to build an *unsigned* transaction
    //    For example, you'd do a quote + swap POST with "userPublicKey" 
    //    as the feePayer, etc. Then Jupiter returns a base64 transaction.
    // Here, we’ll just pretend we got a base64 transaction:
    // In real code, you'd do something like:
    /*
      const swapRes = await fetch("https://api.jup.ag/swap/v1/swap", { ... })
      const swapData = await swapRes.json()
      if (!swapData.swapTransaction) throw new Error("No swapTransaction in aggregator response")
    */

    // For demonstration, let's pretend this is the aggregator’s base64:
    const fakeBase64 = "AQIDBAUGB...someBase64"

    return NextResponse.json({
      success: true,
      swapTransaction: fakeBase64,
    })
  } catch (err: unknown) {
    let errorMessage = "Unknown error occurred";
  
    // Narrow to Error
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    
    console.error("Error in /api/build-swap route:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
  
}