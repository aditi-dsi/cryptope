import { Connection, PublicKey} from "@solana/web3.js";
import { getJupiterTransaction } from "@/lib/jupiter"; // Updated below

interface RequestBody {
  inputMint: string;
  outputMint: string;
  amount: number;
  userPublicKey: string;
  merchantPublicKey: string;
}

export async function POST(req: Request) {
  try {
    const {
      inputMint,
      outputMint,
      amount,
      userPublicKey,
      merchantPublicKey,
    } = (await req.json()) as RequestBody;

    // Validate all required inputs
    if (
      !inputMint ||
      !outputMint ||
      !amount ||
      !userPublicKey ||
      !merchantPublicKey
    ) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
      });
    }

    console.log("Transaction creation inputs:", {
      inputMint,
      outputMint,
      amount,
      userPublicKey,
      merchantPublicKey,
    });

    // Connect to Solana network
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      "confirmed"
    );

    // Parse public keys
    const userPubkey = new PublicKey(userPublicKey);
    const merchantPubkey = new PublicKey(merchantPublicKey);

    // Create a transaction (including a direct Jupiter aggregator quote call)
    const { transaction, swapResult } = await getJupiterTransaction({
      inputMint,
      outputMint,
      amount,
      userPublicKey: userPubkey,
      destinationWallet: merchantPubkey,
      connection,
    });

    // Serialize the transaction so the client can deserialize & sign
    const serializedTransaction = transaction
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64");

    // Build response data
    const responseData = {
      serializedTransaction,
      message: "Transaction created successfully",
      swapInfo: {
        inputAmount: amount,
        expectedOutputAmount: swapResult?.outAmount || 0,
        fee: swapResult?.fee || 0,
      },
    };

    console.log("Response data:", {
      serializedTransaction: `${serializedTransaction.substring(0, 20)}... (truncated)`,
      swapInfo: responseData.swapInfo,
    });

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in create-transaction API:", error);
  
    let errorMessage = "Failed to create transaction";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
  
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500 }
    );
  }
  
}
