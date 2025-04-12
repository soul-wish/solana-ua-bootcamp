use bs58;
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    program_pack::Pack,
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    system_instruction::create_account,
    transaction::Transaction,
};
use spl_token::instruction::initialize_account;
use std::env;

pub fn main() {
    let private_key = env::var("PRIVATE_KEY").expect("Add private key to .env!");
    let secret_key = bs58::decode(&private_key)
        .into_vec()
        .expect("Invalid private key");
    let sender = Keypair::from_bytes(&secret_key).expect("Invalid keypair");

    let rpc_url = "https://api.devnet.solana.com";
    let connection = RpcClient::new(rpc_url);

    let token_account = Keypair::new();
    let mint = Pubkey::from_str_const("4WjYXkkrBqL1sAqVQRgUU7HycZE4cHuycMSv6AR6SWKj");
    let space = spl_token::state::Account::LEN;
    let rent = connection
        .get_minimum_balance_for_rent_exemption(space)
        .unwrap();

    let create_token_account_instruction = create_account(
        &sender.pubkey(),
        &token_account.pubkey(),
        rent,
        space as u64,
        &spl_token::id(),
    );

    let initialize_token_account_instruction = initialize_account(
        &spl_token::id(),
        &token_account.pubkey(),
        &mint,
        &sender.pubkey(),
    )
    .unwrap();

    let transaction = Transaction::new_signed_with_payer(
        &[
            create_token_account_instruction,
            initialize_token_account_instruction,
        ],
        Some(&sender.pubkey()),
        &[&sender, &token_account],
        connection.get_latest_blockhash().unwrap(),
    );

    let transaction_signature = connection
        .send_and_confirm_transaction(&transaction)
        .unwrap();

    println!("Token Account Address: {}", token_account.pubkey());
    println!("Transaction Signature: {}", transaction_signature);
}
