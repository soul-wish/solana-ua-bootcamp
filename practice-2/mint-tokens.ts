import "dotenv/config";
import { Keypair, clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { mintTo } from "@solana/spl-token";
import { getExplorerLink } from "@solana-developers/helpers";

import bs58 from "bs58";

let privateKey = process.env.PRIVATE_KEY;
if (privateKey === undefined) {
  console.log("Add private key to .env!");
  process.exit(1);
}

const asArray = Uint8Array.from(bs58.decode(privateKey));
const sender = Keypair.fromSecretKey(asArray);

const connection = new Connection(clusterApiUrl("devnet"));

const DECIMALS = Math.pow(10, 6);

const tokenMintAccount = new PublicKey(
  "AXr5UoGdKLHkoMKoT3jzSa7QA127DdmRyJnBLfJkuN9n",
);

const associatedTokenAccount = new PublicKey(
  "AJfZKxu5kHTx5AyupVydqrzvcRzeS133UKhv7WPxqbCf",
);

const mint = await mintTo(
  connection,
  sender,
  tokenMintAccount,
  associatedTokenAccount,
  sender.publicKey,
  1 * DECIMALS,
);

const link = getExplorerLink("transaction", mint, "devnet");

console.log(`🎉 Token minted: ${link}`);
