use anchor_lang::prelude::*;

declare_id!("t8uNTr7uH8D283hwuuHBbA4kFU8RcLfR3QLPaDouDMV");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;

#[derive(Accounts)]
pub struct Initialize {}

#[account]
#[derive(InitSpace)]
pub struct Favorites {
    pub number: u64,

    #[max_len(50)]
    pub color: String,
}

#[derive(Accounts)]
pub struct AddFavorites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Favorites::INIT_SPACE,
        seeds = [b"favorites", user.key().as_ref()],
        bump
    )]
    pub favorites: Account<'info, Favorites>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateFavorites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"favorites", user.key().as_ref()],
        bump,
    )]
    pub favorites: Account<'info, Favorites>,
}

#[program]
pub mod favorites {
    use super::*;

    pub fn set_favorites(ctx: Context<AddFavorites>, number: u64, color: String) -> Result<()> {
        let user_public_key = ctx.accounts.user.key();
        msg!("Greeting from: {}", ctx.program_id);
        msg!("User {}'s favorite number is {} and favorite color is {}", user_public_key, number, color);
        ctx.accounts.favorites.set_inner(Favorites { number, color });
        Ok(())
    }

    pub fn update_favorites(ctx: Context<UpdateFavorites>, number: u64, color: String) -> Result<()> {
        let favorites = &mut ctx.accounts.favorites;
        favorites.number = number;
        favorites.color = color;
        Ok(())
    }
}
