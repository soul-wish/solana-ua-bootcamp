import "dotenv/config";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

import { airdropIfRequired } from "@solana-developers/helpers";

const publicKey = new PublicKey(process.env.PUBLIC_KEY as string);

console.log("👀 checking balance of", publicKey.toBase58());

const connection = new Connection(clusterApiUrl("devnet"));

console.log("🔗 Connected to devnet");

const balanceInLamports = await connection.getBalance(publicKey);

const balance = balanceInLamports / LAMPORTS_PER_SOL;

console.log(
  `😔 balance of ${publicKey.toBase58()} before airdrop is ${balance} SOL`,
);

await airdropIfRequired(
  connection,
  publicKey,
  3.51 * LAMPORTS_PER_SOL,
  10 * LAMPORTS_PER_SOL,
);

console.log("✨ airdrop completed successfully");

const balanceInLamportsNew = await connection.getBalance(publicKey);

const balanceNew = balanceInLamportsNew / LAMPORTS_PER_SOL;

console.log(
  `🤑 balance of ${publicKey.toBase58()} after airdrop is ${balanceNew} SOL`,
);
