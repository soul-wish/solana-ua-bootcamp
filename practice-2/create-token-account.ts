import "dotenv/config";
import { Keypair, clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
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

const tokenMintAccount = new PublicKey(
  "AXr5UoGdKLHkoMKoT3jzSa7QA127DdmRyJnBLfJkuN9n",
);

const tokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  tokenMintAccount,
  sender.publicKey,
);

const link = getExplorerLink(
  "address",
  tokenAccount.address.toBase58(),
  "devnet",
);

console.log(`🎉 New token account is here: ${link}`);
