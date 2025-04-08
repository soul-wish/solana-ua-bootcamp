import { Keypair } from "@solana/web3.js";

let keypair: Keypair;

while (true) {
  keypair = Keypair.generate();
  if (keypair.publicKey.toBase58().toLowerCase().startsWith("soul")) {
    break;
  }
}

console.log(
  "🔥 public key that starts with 'soul':",
  keypair.publicKey.toBase58(),
);
