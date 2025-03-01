import { PublicKey, Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';


export const customerAccountAddress = "" // will be dynamic

export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC mint address

export const merchantAccount = new PublicKey('ExdRLrQNBEGkJfX3r1cmP2pW8iWsYzrV1ZPytiYoVNkW'); // will be dynamic

console.log("USDC_MINT:", USDC_MINT.toBase58());
console.log("merchantAccount:", merchantAccount.toBase58());

// Get the associated token account for the merchant wallet
const merchantUSDCTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    merchantAccount,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
);

console.log("merchantUSDCTokenAccount:", merchantUSDCTokenAccount.toBase58());