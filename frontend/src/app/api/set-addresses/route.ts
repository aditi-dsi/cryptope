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

    console.log("Set addresses:", { senderPubKey, merchantPubKey })

    return NextResponse.json({ success: true })
  }catch (err: unknown) {
    console.error("Error in /api/set-addresses route:", err);
    
    let errorMessage = "An unknown error occurred";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
  
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
  
}
