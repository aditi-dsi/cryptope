// lib/rpcConnection.ts
import { Connection, clusterApiUrl } from "@solana/web3.js"

/**
 * Create a connection to Solana mainnet-beta.
 * Adjust clusterApiUrl if you want devnet or a custom RPC.
 */
export const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed")
