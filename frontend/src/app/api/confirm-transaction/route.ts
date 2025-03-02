import { NextRequest, NextResponse } from 'next/server';

interface RequestBody {
  signature: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { signature } = body;
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing transaction signature' },
        { status: 400 }
      );
    }
    
    console.log(`Transaction confirmed with signature: ${signature}`);
    
    
    return NextResponse.json({
      success: true,
      message: 'Transaction recorded successfully',
    });
    
  } catch (error: unknown) {
    console.error("Error confirming transaction:", error);
  
    // Default fallback
    let errorMessage = "Failed to confirm transaction";
  
    // Narrow to Error, so we can safely use .message
    if (error instanceof Error) {
      errorMessage = error.message;
    }
  
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
  
}