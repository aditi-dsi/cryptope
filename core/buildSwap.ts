import {
  customerAccountAddress,
  merchantUSDCTokenAccount,
} from "./accountHandler.js";

  const inputMint = "So11111111111111111111111111111111111111112"; // will be dynamic
  const outputMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC Mint Address
  const amount = 1 * 1e6; // will be dynamic
  
  /* Fetch Quote */
  
  const getSwapQuote = await (
    await fetch(
      `https://api.jup.ag/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50&restrictIntermediateTokens=true&swapMode=ExactOut`
    )
  ).json();

  
  console.log(JSON.stringify(getSwapQuote, null, 2));

  
  
  /* Prepare Swap on latest quote */
  
  export const prepareSwap = await (
    await fetch("https://api.jup.ag/swap/v1/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quoteResponse: getSwapQuote,
        userPublicKey: customerAccountAddress.publicKey.toString(), //will be dynamic
        destinationTokenAccount: merchantUSDCTokenAccount.toString(),
        dynamicComputeUnitLimit: true,
        dynamicSlippage: true,
        prioritizationFeeLamports: {
          priorityLevelWithMaxLamports: {
            maxLamports: 1000000,
            priorityLevel: "veryHigh",
          },
        },
      }),
    })
  ).json();
  
  console.log(prepareSwap);
