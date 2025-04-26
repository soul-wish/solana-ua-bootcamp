import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { Favorites } from "../target/types/favorites";
import {
  airdropIfRequired,
  getCustomErrorMessage,
} from "@solana-developers/helpers";
import { expect, describe, test } from "@jest/globals";
import { systemProgramErrors } from "./system-program-errors";

describe("favorites", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  it("Writes our favotites to the blockchain", async () => {
    const user = web3.Keypair.generate();
    const program = anchor.workspace.Favorites as Program<Favorites>;

    console.log("Our user address: ", user.publicKey.toBase58());

    await airdropIfRequired(
      anchor.getProvider().connection,
      user.publicKey,
      0.5 * web3.LAMPORTS_PER_SOL,
      1 * web3.LAMPORTS_PER_SOL,
    );

    const favoriteNumber = new anchor.BN(42);
    const favoriteColor = "Orange";

    let tx: string | null = null;
    try {
      tx = await program.methods
        .setFavorites(favoriteNumber, favoriteColor)
        .accounts({
          user: user.publicKey,
        })
        .signers([user])
        .rpc();
    } catch (e) {
      const rawError = e as Error;
      throw new Error(
        getCustomErrorMessage(systemProgramErrors, rawError.message),
      );
    }

    console.log("Transaction hash: ", tx);

    const [favoritesPDA, _bump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("favorites"), user.publicKey.toBuffer()],
      program.programId,
    );

    const dataFromPDA = await program.account.favorites.fetch(favoritesPDA);

    expect(dataFromPDA.number.toNumber()).toEqual(favoriteNumber.toNumber());
    expect(dataFromPDA.color).toEqual(favoriteColor);
  });

  it("Updates existing favorites data on the blockchain", async () => {
    const user = web3.Keypair.generate();
    const program = anchor.workspace.Favorites as Program<Favorites>;

    await airdropIfRequired(
      anchor.getProvider().connection,
      user.publicKey,
      0.5 * web3.LAMPORTS_PER_SOL,
      1 * web3.LAMPORTS_PER_SOL,
    );

    // First, add initial favorites
    const initialNumber = new anchor.BN(7);
    const initialColor = "Blue";
    await program.methods
      .setFavorites(initialNumber, initialColor)
      .accounts({ user: user.publicKey })
      .signers([user])
      .rpc();

    const [favoritesPDA, _bump] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("favorites"), user.publicKey.toBuffer()],
      program.programId,
    );

    // Now update favorites
    const updatedNumber = new anchor.BN(99);
    const updatedColor = "Green";
    await program.methods
      .updateFavorites(updatedNumber, updatedColor)
      .accounts({ user: user.publicKey })
      .signers([user])
      .rpc();

    const dataFromPDA = await program.account.favorites.fetch(favoritesPDA);
    expect(dataFromPDA.number.toNumber()).toEqual(updatedNumber.toNumber());
    expect(dataFromPDA.color).toEqual(updatedColor);
  });
});
