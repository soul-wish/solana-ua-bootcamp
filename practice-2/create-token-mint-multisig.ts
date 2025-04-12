import "dotenv/config";
import { Keypair, clusterApiUrl, Connection } from "@solana/web3.js";
import { createMint, createMultisig } from "@solana/spl-token";
import { getExplorerLink } from "@solana-developers/helpers";

import bs58 from "bs58";

let privateKey = process.env.PRIVATE_KEY;
if (privateKey === undefined) {
  console.log("Add private key to .env!");
  process.exit(1);
}

const asArray = Uint8Array.from(bs58.decode(privateKey));
const sender = Keypair.fromSecretKey(asArray);

const sender2 = Keypair.generate();

const connection = new Connection(clusterApiUrl("devnet"));

const multiSigKey = await createMultisig(
  connection,
  sender,
  [sender2.publicKey, sender.publicKey],
  2,
);

const mint = await createMint(connection, sender, multiSigKey, multiSigKey, 6);

const link = getExplorerLink("address", mint.toString(), "devnet");

console.log(`🎉 Multisig Token mint is here: ${link}`);
