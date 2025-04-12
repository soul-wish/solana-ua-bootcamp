use bs58;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    transaction::Transaction,
};
use spl_token::instruction::mint_to;
use std::env;

pub fn main() {
    let private_key = env::var("PRIVATE_KEY").expect("Add private key to .env!");
    let secret_key = bs58::decode(&private_key)
        .into_vec()
        .expect("Invalid private key");
    let sender = Keypair::from_bytes(&secret_key).expect("Invalid keypair");

    let rpc_url = "https://api.devnet.solana.com";
    let connection = RpcClient::new(rpc_url);

    let mint = Pubkey::from_str_const("4WjYXkkrBqL1sAqVQRgUU7HycZE4cHuycMSv6AR6SWKj");
    let token_account = Pubkey::from_str_const("9APSC6JKSCYyqh3z3PtatfRonLAgfp1o7S58gDVzCAL4");
    let amount = 100 * 10u64.pow(6);

    let mint_to_instruction = mint_to(
        &spl_token::id(),
        &mint,
        &token_account,
        &sender.pubkey(),
        &[&sender.pubkey()],
        amount,
    )
    .unwrap();

    // Create transaction for minting tokens
    let transaction = Transaction::new_signed_with_payer(
        &[mint_to_instruction],
        Some(&sender.pubkey()),
        &[&sender],
        connection.get_latest_blockhash().unwrap(),
    );

    // Send and confirm transaction
    let transaction_signature = connection
        .send_and_confirm_transaction(&transaction)
        .unwrap();

    println!(
        "Successfully minted {} tokens to the associated token account",
        amount / 10u64.pow(6)
    );
    println!("Transaction Signature: {}", transaction_signature);
}

