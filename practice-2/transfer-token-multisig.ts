import "dotenv/config";
import {
  PublicKey,
  Keypair,
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createMultisig,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { getExplorerLink } from "@solana-developers/helpers";

import bs58 from "bs58";

let privateKey = process.env.PRIVATE_KEY;
if (privateKey === undefined) {
  console.log("Add private key to .env!");
  process.exit(1);
}

const asArray = Uint8Array.from(bs58.decode(privateKey));
const sender = Keypair.fromSecretKey(asArray);

const receiver = Keypair.generate();

console.log("Receiver address:", receiver.publicKey.toBase58());

const connection = new Connection(clusterApiUrl("devnet"));

const tx = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: sender.publicKey,
    toPubkey: receiver.publicKey,
    lamports: 0.01 * LAMPORTS_PER_SOL,
  }),
);

await sendAndConfirmTransaction(connection, tx, [sender]);

const tokenMintAccount = new PublicKey(
  "AXr5UoGdKLHkoMKoT3jzSa7QA127DdmRyJnBLfJkuN9n",
);

const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  tokenMintAccount,
  sender.publicKey,
);

const toTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  tokenMintAccount,
  receiver.publicKey,
);

const transactionInstruction = createTransferInstruction(
  fromTokenAccount.address,
  toTokenAccount.address,
  sender.publicKey,
  1 * Math.pow(10, 6),
  [],
);

const blockhash = await connection.getLatestBlockhash();

let transferTransaction = new Transaction({
  feePayer: receiver.publicKey,
  blockhash: blockhash.blockhash,
  lastValidBlockHeight: blockhash.lastValidBlockHeight,
}).add(transactionInstruction);

const transferSignature = await sendAndConfirmTransaction(
  connection,
  transferTransaction,
  [sender, receiver],
);

const link = getExplorerLink(
  "transaction",
  transferSignature.toString(),
  "devnet",
);

console.log(`🎉 Transaction, where receiver is paying is here: ${link}`);
