use bs58;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    signature::{Keypair, Signer},
    system_instruction::create_account,
    transaction::Transaction,
};
use spl_token::{id as spl_token, instruction::initialize_mint};
use std::env;

pub fn main() {
    let private_key = env::var("PRIVATE_KEY").expect("Add private key to .env!");
    let secret_key = bs58::decode(&private_key)
        .into_vec()
        .expect("Invalid private key");
    let sender = Keypair::from_bytes(&secret_key).expect("Invalid keypair");

    let rpc_url = "https://api.devnet.solana.com";
    let connection = RpcClient::new(rpc_url);

    let mint = Keypair::new();
    let mint_space = 82;
    let rent = connection
        .get_minimum_balance_for_rent_exemption(mint_space)
        .unwrap();

    let create_account_instruction = create_account(
        &sender.pubkey(),
        &mint.pubkey(),
        rent,
        mint_space as u64,
        &spl_token(),
    );

    let initialize_mint_instruction = initialize_mint(
        &spl_token(),
        &mint.pubkey(),
        &sender.pubkey(),
        Some(&sender.pubkey()),
        6,
    )
    .unwrap();

    let transaction = Transaction::new_signed_with_payer(
        &[create_account_instruction, initialize_mint_instruction],
        Some(&sender.pubkey()),
        &[&sender, &mint],
        connection.get_latest_blockhash().unwrap(),
    );

    let transaction_signature = connection
        .send_and_confirm_transaction(&transaction)
        .unwrap();

    println!("Mint Address: {}", mint.pubkey());
    println!("Transaction Signature: {}", transaction_signature);
}
