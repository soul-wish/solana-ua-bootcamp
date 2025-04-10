use bs58;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    signature::{Keypair, Signer},
    system_instruction,
    transaction::Transaction,
};
use std::env;

pub fn main() {
    let private_key = env::var("PRIVATE_KEY").expect("Add private key to .env!");
    let secret_key = bs58::decode(&private_key)
        .into_vec()
        .expect("Invalid private key");
    let sender = Keypair::from_bytes(&secret_key).expect("Invalid keypair");

    let rpc_url = "https://api.devnet.solana.com";
    let connection = RpcClient::new(rpc_url);

    println!("👀 checking balance of {}", sender.pubkey());

    let balance_in_lamports = connection
        .get_balance(&sender.pubkey())
        .expect("Failed to get balance");
    let balance = balance_in_lamports as f64 / solana_sdk::native_token::LAMPORTS_PER_SOL as f64;

    println!(
        "💲balance of {} before sending is {:.6} SOL",
        sender.pubkey(),
        balance
    );

    let recipient = solana_sdk::pubkey!("GqdAk31gXguPcLpuzHBTWUzqx6vNfYJFbqT9ewWdwMtw");

    let recent_blockhash = connection
        .get_latest_blockhash()
        .expect("Failed to get recent blockhash");

    let lamports = (0.1 * solana_sdk::native_token::LAMPORTS_PER_SOL as f64) as u64;

    let transfer_instruction = system_instruction::transfer(&sender.pubkey(), &recipient, lamports);

    let transaction = Transaction::new_signed_with_payer(
        &[transfer_instruction],
        Some(&sender.pubkey()),
        &[&sender],
        recent_blockhash,
    );

    let signature = connection.send_and_confirm_transaction(&transaction);

    println!(
        "🎉 Transaction sent: https://explorer.solana.com/tx/{}?cluster=devnet",
        signature.unwrap()
    );

    let final_balance_in_lamports = connection
        .get_balance(&sender.pubkey())
        .expect("Failed to get final balance");
    let final_balance =
        final_balance_in_lamports as f64 / solana_sdk::native_token::LAMPORTS_PER_SOL as f64;

    println!(
        "💲balance of {} after sending is {:.6} SOL",
        sender.pubkey(),
        final_balance
    );
}
