// File: app/api/confirm-transaction/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Connection } from '@solana/web3.js';

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
    
    // Log the transaction, update a database, etc.
    console.log(`Transaction confirmed with signature: ${signature}`);
    
    // You could also confirm the transaction status on-chain if needed
    const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
    
    // Optional: wait for confirmation
    // const confirmation = await connection.confirmTransaction(signature);
    
    return NextResponse.json({
      success: true,
      message: 'Transaction recorded successfully',
    });
    
  } catch (error: any) {
    console.error('Error confirming transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm transaction' },
      { status: 500 }
    );
  }
}