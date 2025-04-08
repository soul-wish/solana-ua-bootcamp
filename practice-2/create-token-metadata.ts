import "dotenv/config";
import {
  Keypair,
  clusterApiUrl,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { getExplorerLink } from "@solana-developers/helpers";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

import bs58 from "bs58";

let privateKey = process.env.PRIVATE_KEY;
if (privateKey === undefined) {
  console.log("Add private key to .env!");
  process.exit(1);
}

const asArray = Uint8Array.from(bs58.decode(privateKey));
const sender = Keypair.fromSecretKey(asArray);

const connection = new Connection(clusterApiUrl("devnet"));

const tokenMetadataProgramId = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);

const tokenMintAccount = new PublicKey(
  "AXr5UoGdKLHkoMKoT3jzSa7QA127DdmRyJnBLfJkuN9n",
);

const metadata = {
  name: "Money Printer",
  symbol: "MPR",
  uri: "",
  sellerFeeBasisPoints: 0,
  creators: null,
  collection: null,
  uses: null,
};

const [metadataPDA, _bump] = PublicKey.findProgramAddressSync(
  [
    Buffer.from("metadata"),
    tokenMetadataProgramId.toBuffer(),
    tokenMintAccount.toBuffer(),
  ],
  tokenMetadataProgramId,
);

const transaction = new Transaction();

transaction.add(
  createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: tokenMintAccount,
      mintAuthority: sender.publicKey,
      payer: sender.publicKey,
      updateAuthority: sender.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        collectionDetails: null,
        data: metadata,
        isMutable: true,
      },
    },
  ),
);

const signature = await sendAndConfirmTransaction(connection, transaction, [
  sender,
]);

const link = getExplorerLink("tx", signature, "devnet");
console.log(`🎉 Metadata was set: ${link}`);
