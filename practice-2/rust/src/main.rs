use dotenv::dotenv;
pub mod send_sol;

fn main() {
    dotenv().ok();
    println!("Hello, Bootcamp!");
    send_sol::main();
}
