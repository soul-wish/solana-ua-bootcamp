import "dotenv/config";
import {
  Keypair,
  clusterApiUrl,
  Connection,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  NonceAccount,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
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

const connection = new Connection(clusterApiUrl("devnet"));

const nonceAccount = Keypair.generate();

const createNonceAccountTx = new Transaction().add(
  SystemProgram.createAccount({
    fromPubkey: sender.publicKey,
    newAccountPubkey: nonceAccount.publicKey,
    lamports: await connection.getMinimumBalanceForRentExemption(80),
    space: 80,
    programId: SystemProgram.programId,
  }),
  SystemProgram.nonceInitialize({
    noncePubkey: nonceAccount.publicKey,
    authorizedPubkey: sender.publicKey,
  }),
);

const nonceSignature = await sendAndConfirmTransaction(
  connection,
  createNonceAccountTx,
  [sender, nonceAccount],
);

console.log("Nonce Account created. Signature:", nonceSignature);

const nonceAccountInfo = await connection.getAccountInfo(
  nonceAccount.publicKey,
);

if (nonceAccountInfo === null) {
  throw new Error("Nonce account does not exist");
}

const nonce = NonceAccount.fromAccountData(nonceAccountInfo.data).nonce;

const mintKeypair = Keypair.generate();

const mintRentExemption = await getMinimumBalanceForRentExemptMint(connection);

const createMintTx = new Transaction();

createMintTx.add(
  SystemProgram.nonceAdvance({
    noncePubkey: nonceAccount.publicKey,
    authorizedPubkey: sender.publicKey,
  }),
  SystemProgram.createAccount({
    fromPubkey: sender.publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    lamports: mintRentExemption,
    space: 82,
    programId: TOKEN_PROGRAM_ID,
  }),
  createInitializeMintInstruction(
    mintKeypair.publicKey,
    6,
    sender.publicKey,
    null,
  ),
);

createMintTx.recentBlockhash = nonce;

console.log("Waiting 4 minutes before signing and sending...");
await new Promise((resolve) => setTimeout(resolve, 4 * 60 * 1000));

createMintTx.sign(sender, mintKeypair);

const signature = await sendAndConfirmTransaction(connection, createMintTx, [
  sender,
  mintKeypair,
]);

const link = getExplorerLink("transaction", signature.toString(), "devnet");
console.log("Explorer Link: ", link);
