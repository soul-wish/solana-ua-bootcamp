import "dotenv/config";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  Connection,
  sendAndConfirmTransaction,
  TransactionInstruction,
} from "@solana/web3.js";

import bs58 from "bs58";

let privateKey = process.env.PRIVATE_KEY;
if (privateKey === undefined) {
  console.log("Add private key to .env!");
  process.exit(1);
}

const asArray = Uint8Array.from(bs58.decode(privateKey));
const sender = Keypair.fromSecretKey(asArray);

const connection = new Connection(clusterApiUrl("devnet"));

console.log("👀 checking balance of", sender.publicKey.toBase58());

const balanceInLamports = await connection.getBalance(sender.publicKey);

const balance = balanceInLamports / LAMPORTS_PER_SOL;

console.log(
  `💲balance of ${sender.publicKey.toBase58()} before sending is ${balance} SOL`,
);
const recipient = new PublicKey("GqdAk31gXguPcLpuzHBTWUzqx6vNfYJFbqT9ewWdwMtw");

const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: sender.publicKey,
    toPubkey: recipient,
    lamports: 0.1 * LAMPORTS_PER_SOL,
  }),
);

const memoProgramId = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

transaction.add(
  new TransactionInstruction({
    keys: [{ pubkey: sender.publicKey, isSigner: true, isWritable: false }],
    programId: memoProgramId,
    data: Buffer.from("Some money for you!"),
  }),
);

const signature = await sendAndConfirmTransaction(connection, transaction, [
  sender,
]);
console.log(
  `🎉 Transaction sent: https://explorer.solana.com/tx/${signature}?cluster=devnet`,
);

console.log(
  `💲balance of ${sender.publicKey.toBase58()} after sending is ${
    (await connection.getBalance(sender.publicKey)) / LAMPORTS_PER_SOL
  } SOL`,
);
