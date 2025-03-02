import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { senderPubKey, merchantPubKey } = await request.json()

    if (!senderPubKey || !merchantPubKey) {
      return NextResponse.json(
        { error: "Missing senderPubKey or merchantPubKey" },
        { status: 400 }
      )
    }

    // For now, just log or store them
    console.log("Set addresses:", { senderPubKey, merchantPubKey })

    // Return success
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Error in /api/set-addresses route:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
