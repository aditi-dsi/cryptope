// app/api/send-transaction/route.ts
import { NextResponse } from "next/server"
import { sendTransaction } from "@/lib/sendTransaction"

export async function POST(request: Request) {
  try {
    const { inputMint, outputMint, amount } = await request.json()

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      )
    }

    // Actually do your Jupiter swap
    const signature = await sendTransaction(inputMint, outputMint, Number(amount))

    return NextResponse.json({ success: true, signature })
  } catch (err: any) {
    console.error("Error in /api/send-transaction route:", err)
    // Return JSON, not HTML
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
