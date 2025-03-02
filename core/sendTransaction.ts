import { VersionedTransaction } from "@solana/web3.js";
import { prepareSwap } from "./buildSwap.js";
import { customerAccountAddress } from "./accountHandler.js";
import { connection } from "./rpcConnection.js";

export const sendTransaction = async () => {
    try {
        const transactionBase64 = prepareSwap.swapTransaction;
        const transactionBytes = new Uint8Array(
            Buffer.from(transactionBase64, "base64")
        );

        const transaction = VersionedTransaction.deserialize(transactionBytes);

        transaction.sign([customerAccountAddress.payer]);

        const rawTransaction = transaction.serialize();

        const signature = await connection.sendRawTransaction(rawTransaction, {
            maxRetries: 10,
            preflightCommitment: "finalized",
        });

        console.log(signature);

        const confirmation = await connection.getSignatureStatus(signature, {
            searchTransactionHistory: true,
        });

        if (confirmation.value?.err) {
            throw new Error(
                `Transaction failed: ${JSON.stringify(
                    confirmation.value.err
                )}\nhttps://solscan.io/${signature}/`
            );
        } else
            console.log(
                `Transaction successful: https://solscan.io/tx/${signature}/`
            );
    } catch (error) {
        console.error("Error signing or sending the transaction:", error);
    }
};

sendTransaction();
