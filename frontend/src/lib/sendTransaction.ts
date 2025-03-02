import { VersionedTransaction } from "@solana/web3.js"
import { buildSwap } from "./buildSwap"
import { connection } from "./rpcConnection"
import { serverKeypair } from "./accountHandler"

/**
 * Custodial function that builds, signs, and sends a Jupiter swap transaction.
 *
 * @param inputMint  The mint address of the token being sent
 * @param outputMint The mint address of the token to receive
 * @param amount     The amount of the input token in its smallest unit (lamports, etc.)
 * @returns          The Solana transaction signature
 */
export async function sendTransaction(inputMint: string, outputMint: string, amount: number) {
  try {
    // 1) Build or prepare the swap transaction (await the async call)
    const { swapTransaction } = await buildSwap(inputMint, outputMint, amount)
    if (!swapTransaction) {
      throw new Error("No swapTransaction returned from buildSwap.")
    }

    // 2) Decode the base64 transaction from Jupiter
    const transactionBytes = new Uint8Array(Buffer.from(swapTransaction, "base64"))
    const transaction = VersionedTransaction.deserialize(transactionBytes)

    // 3) Sign with your server's Keypair (custodial approach)
    transaction.sign([serverKeypair])
    // If you have e.g. `customerAccountAddress.payer`, do:
    // transaction.sign([customerAccountAddress.payer])

    // 4) Send the raw transaction
    const rawTransaction = transaction.serialize()
    const signature = await connection.sendRawTransaction(rawTransaction, {
      maxRetries: 10,
      preflightCommitment: "finalized",
    })

    console.log("Transaction signature:", signature)

    // 5) (Optional) Confirm or check status
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
  } catch (err) {
    console.error("Error in sendTransaction:", err)
    throw err
  }
}
