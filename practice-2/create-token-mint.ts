import "dotenv/config";
import { Keypair, clusterApiUrl, Connection } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
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

const mint = await createMint(connection, sender, sender.publicKey, null, 6);

const link = getExplorerLink("address", mint.toString(), "devnet");

console.log(`🎉 Token mint is here: ${link}`);
