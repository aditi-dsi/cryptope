// app/api/set-addresses/route.ts
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { senderPubKey, merchantPubKey } = await request.json()

    if (!senderPubKey || !merchantPubKey) {
      return NextResponse.json({ error: "Missing senderPubKey or merchantPubKey" }, { status: 400 })
    }

    // Here, do something with those addresses (e.g., call setDynamicAddresses or store in DB)
    console.log("Received addresses from client:", { senderPubKey, merchantPubKey })

    // Return success
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Error in set-addresses route:", err)
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 })
  }
}
