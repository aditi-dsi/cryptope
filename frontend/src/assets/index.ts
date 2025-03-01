// assets.ts
import Logo from "./logo.png";
import Phantom_Logo from "./phantomLogo.png";
import Solflare_Logo from "./solfareLogo.png";
import Trustwallet_Logo from "./trustwalletLogo.png";
import Backpack_Logo from "./backpackLogo.png";


export const assets = {
  Logo: "/logo.png",
  Phantom_Logo: "/phantomLogo.png",
  Solflare_Logo: "/solfareLogo.png",
  Backpack_Logo: "/backpackLogo.png",
  Trustwallet_Logo: "/trustwalletLogo.png",
} as const

 
 

export const WALLET_IMAGES = {
  Phantom: Phantom_Logo,
  Solflare: Solflare_Logo,
  Backpack: Backpack_Logo,
  "Trust Wallet": Trustwallet_Logo,
} as const;
