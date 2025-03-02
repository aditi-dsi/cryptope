import { PublicKey, Keypair } from "@solana/web3.js"
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token"
import bs58 from "bs58"
import * as dotenv from "dotenv"

dotenv.config()

const privateKeyArray = bs58.decode(process.env.PRIVATE_KEY || "")
export const serverKeypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray))

// USDC Mint remains constant (mainnet)
export const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")

// We'll store these addresses in module-level variables:
let _senderPublicKey: PublicKey | null = null
let _merchantPublicKey: PublicKey | null = null
let _merchantUSDCTokenAccount: PublicKey | null = null

/**
 * Dynamically sets the sender (customer) public key and the merchant public key.
 * Also computes the merchant's associated USDC token account.
 *
 * Call this before building any transactions that rely on these values.
 */
export async function setDynamicAddresses(senderPubKeyStr: string, merchantPubKeyStr: string) {
  _senderPublicKey = new PublicKey(senderPubKeyStr)
  _merchantPublicKey = new PublicKey(merchantPubKeyStr)

  // Compute the associated USDC token account for the merchant
  _merchantUSDCTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    _merchantPublicKey,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
}

/** Returns the sender's (customer) public key (throws if not set). */
export function getSenderPublicKey(): PublicKey {
  if (!_senderPublicKey) {
    throw new Error("Sender public key not set. Call setDynamicAddresses() first.")
  }
  return _senderPublicKey
}

/** Returns the merchant's public key (throws if not set). */
export function getMerchantPublicKey(): PublicKey {
  if (!_merchantPublicKey) {
    throw new Error("Merchant public key not set. Call setDynamicAddresses() first.")
  }
  return _merchantPublicKey
}

/** Returns the merchant's associated USDC token account (throws if not set). */
export function getMerchantUSDCTokenAccount(): PublicKey {
  if (!_merchantUSDCTokenAccount) {
    throw new Error("Merchant USDC token account not set. Call setDynamicAddresses() first.")
  }
  return _merchantUSDCTokenAccount
}
