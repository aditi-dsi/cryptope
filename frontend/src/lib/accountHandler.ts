// lib/accountHandler.ts
import { PublicKey } from "@solana/web3.js"
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token"

/**
 * The mainnet USDC mint address
 */
export const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")

/**
 * Internal module-level variables to store addresses once set
 */
let _senderPublicKey: PublicKey | null = null
let _merchantPublicKey: PublicKey | null = null
let _merchantUSDCTokenAccount: PublicKey | null = null

/**
 * Dynamically sets the sender (customer) public key
 * and the merchant public key. Also computes the merchant's
 * associated USDC token account.
 *
 * Call this before building any transactions that rely on these values.
 */
export async function setDynamicAddresses(senderPubKeyStr: string, merchantPubKeyStr: string) {
  _senderPublicKey = new PublicKey(senderPubKeyStr)
  _merchantPublicKey = new PublicKey(merchantPubKeyStr)

  // Derive the associated token account for the merchant's USDC
  _merchantUSDCTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    _merchantPublicKey,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
}

/** Returns the sender's (customer) public key. Throws if not set. */
export function getSenderPublicKey(): PublicKey {
  if (!_senderPublicKey) {
    throw new Error("Sender public key not set. Call setDynamicAddresses() first.")
  }
  return _senderPublicKey
}

/** Returns the merchant's public key. Throws if not set. */
export function getMerchantPublicKey(): PublicKey {
  if (!_merchantPublicKey) {
    throw new Error("Merchant public key not set. Call setDynamicAddresses() first.")
  }
  return _merchantPublicKey
}

/** Returns the merchant's associated USDC token account. Throws if not set. */
export function getMerchantUSDCTokenAccount(): PublicKey {
  if (!_merchantUSDCTokenAccount) {
    throw new Error("Merchant USDC token account not set. Call setDynamicAddresses() first.")
  }
  return _merchantUSDCTokenAccount
}
