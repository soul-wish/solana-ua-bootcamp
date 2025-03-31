import "dotenv/config";
import { Keypair } from "@solana/web3.js";

const privateKey = process.env.PRIVATE_KEY as string;

if (!privateKey) {
  console.log("Missing private key");
  throw new Error("Missing private key");
}

const keyAsArray = Uint8Array.from(JSON.parse(privateKey));
const keypair = Keypair.fromSecretKey(keyAsArray);

console.log("🔑 public key:", keypair.publicKey.toBase58());

console.log("Oh look, we have a key and it is the same as before!");
