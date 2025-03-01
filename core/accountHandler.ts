import { PublicKey, Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Wallet } from '@coral-xyz/anchor';
import bs58 from 'bs58';
import * as dotenv from 'dotenv';

dotenv.config();

const privateKeyArray = bs58.decode(process.env.PRIVATE_KEY || '') // will be dynamic

export const customerAccountAddress = new Wallet(Keypair.fromSecretKey(new Uint8Array(privateKeyArray)));

console.log("customerAcc:",customerAccountAddress.publicKey.toBase58())


export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC mint address

export const merchantAccount = new PublicKey('6uvigyE35Tmnmcvy5sgKzU4QDZcFK3ewCC3war8sLePi'); // will be dynamic

console.log("USDC_MINT:", USDC_MINT.toBase58());
console.log("merchantAccount:", merchantAccount.toBase58());

// Get the associated token account for the merchant wallet
export const merchantUSDCTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    merchantAccount,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
);

console.log("merchantUSDCTokenAccount:", merchantUSDCTokenAccount.toBase58());