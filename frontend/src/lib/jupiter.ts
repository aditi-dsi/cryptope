import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

interface JupiterTransactionParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  userPublicKey: PublicKey;
  destinationWallet: PublicKey;
  connection: Connection;
}

// Define a more specific type for Jupiter routes
interface JupiterRoute {
  marketInfos: {
    id: string;
    label: string;
    inputMint: string;
    outputMint: string;
    notEnoughLiquidity: boolean;
    inAmount: string;
    outAmount: string;
    priceImpactPct: number;
    lpFee: {
      amount: string;
      mint: string;
      pct: number;
    };
    platformFee: {
      amount: string;
      mint: string;
      pct: number;
    };
  }[];
  amount: string;
  otherAmountThreshold: string;
  swapMode: string;
  priceImpactPct: number;
  slippageBps: number;
}

interface JupiterTransactionResult {
  transaction: Transaction;
  swapResult?: {
    inAmount: number;
    outAmount: number;
    fee: number;
    routes?: JupiterRoute[];
  };
}

/**
 * Example function that:
 *  1) Fetches a quote from Jupiter aggregator
 *  2) Builds a placeholder transaction
 *  3) Returns swap info for debugging
 */
export async function getJupiterTransaction({
  inputMint,
  outputMint,
  amount,
  userPublicKey,
  destinationWallet,
  connection,
}: JupiterTransactionParams): Promise<JupiterTransactionResult> {
  try {
    // 1) Directly call Jupiter aggregator for a quote
    const jupiterUrl = new URL("/swap/v1/quote", "https://api.jup.ag");
    jupiterUrl.searchParams.set("inputMint", inputMint);
    jupiterUrl.searchParams.set("outputMint", outputMint);
    jupiterUrl.searchParams.set("amount", String(amount));
    jupiterUrl.searchParams.set("slippageBps", "50"); // or your choice

    console.log("Fetching Jupiter quote with:", jupiterUrl.toString());
    const quoteRes = await fetch(jupiterUrl.toString());
    if (!quoteRes.ok) {
      throw new Error(
        `Jupiter quote request failed: ${quoteRes.status} => ${await quoteRes.text()}`
      );
    }

    const quoteData = await quoteRes.json();
    console.log("quoteData from aggregator:", quoteData);

    // Pull in/out amounts from the aggregator response if available
    // These fields may differ in Jupiter's newer versions
    const inAmount = parseFloat(quoteData?.inAmount ?? amount) || 0;
    const outAmount = parseFloat(quoteData?.outAmount ?? "0") || 0;
    const feeAmount = 0; // Could be derived from routePlan or swap info

    // 2) Build your transaction
    // For demonstration, we do a simple SOL transfer
    // In production, you'd attach Jupiter swap instructions instead
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");

    const transaction = new Transaction({
      feePayer: userPublicKey,
      blockhash,
      lastValidBlockHeight,
    });

    // Add placeholder instructions (just a small transfer)
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: userPublicKey,
        toPubkey: destinationWallet,
        lamports: 1000, // minimal for example
      })
    );

    return {
      transaction,
      swapResult: {
        inAmount,
        outAmount,
        fee: feeAmount,
        routes: quoteData?.routes,
      },
    };
  } catch (error) {
    console.error("Error in getJupiterTransaction:", error);
    throw error;
  }
}