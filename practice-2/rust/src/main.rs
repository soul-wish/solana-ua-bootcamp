use dotenv::dotenv;
pub mod create_token_account;
pub mod create_token_mint;
pub mod mint_tokens;
pub mod send_sol;

fn main() {
    dotenv().ok();
    println!("Hello, Bootcamp!");
    //send_sol::main();
    //create_token_mint::main();
    //create_token_account::main();
    mint_tokens::main();
}
