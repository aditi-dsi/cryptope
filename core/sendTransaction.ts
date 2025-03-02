import { VersionedTransaction } from "@solana/web3.js"
import { buildSwap } from "./buildSwap.js"
import { connection } from "./rpcConnection.js"
import { serverKeypair } from "./accountHandler.js" 
// ^ Replace with whatever you actually export, e.g. `customerAccountAddress.payer`

/**
 * Custodial function that builds, signs, and sends a Jupiter swap transaction.
 * 
 * @param inputMint  The mint address of the token being sent
 * @param outputMint The mint address of the token to receive
 * @param amount     The amount of the input token in its smallest unit (lamports, etc.)
 */
export async function sendTransaction(inputMint: string, outputMint: string, amount: number) {
  try {
    // Build swap transaction (await the async call)
    const { swapTransaction } = await buildSwap(inputMint, outputMint, amount)
    if (!swapTransaction) {
      throw new Error("No swapTransaction returned from buildSwap.")
    }

    // Decode base64 transaction from Jupiter
    const transactionBytes = new Uint8Array(Buffer.from(swapTransaction, "base64"))
    const transaction = VersionedTransaction.deserialize(transactionBytes)

    // Sign in with server's Keypair (custodial approach)
    transaction.sign([serverKeypair])

    // Send raw transaction
    const rawTransaction = transaction.serialize()
    const signature = await connection.sendRawTransaction(rawTransaction, {
      maxRetries: 10,
      preflightCommitment: "finalized",
    })

    console.log("Transaction signature:", signature)

    // Confirm status
    const { value: status } = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    })
    if (status?.err) {
      throw new Error(
        `Transaction failed: ${JSON.stringify(status.err)}\n` +
        `https://solscan.io/tx/${signature}`
      )
    }

    console.log(`Transaction successful: https://solscan.io/tx/${signature}`)
    return signature
  } catch (error) {
    console.error("Error signing or sending the transaction:", error)
    throw error
  }
}