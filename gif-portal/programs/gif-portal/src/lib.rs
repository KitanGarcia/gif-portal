use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod gif_portal {
    use super::*;
    pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> Result<()> {
        // Get a mutable reference to the account to allow changing it
        let base_account = &mut ctx.accounts.base_account;

        // Initialize total number of gifs
        base_account.total_gifs = 0;
        Ok(())
    }

    pub fn add_gif(ctx: Context<AddGif>) -> Result<()> {
        // Get a reference to the account and increment total_gifs
        let base_account = &mut ctx.accounts.base_account;
        base_account.total_gifs += 1;
        Ok(())
    }
}

// Attach variables to the StartStuffOff context
#[derive(Accounts)]
pub struct StartStuffOff<'info> {
    // init: create a new account owned by our current program
    // payer = user: tells program user who calls the function is they payer
    // space = 9000: allocates 9000 bytes to the account
    #[account(init, payer = user, space = 9000)]
    pub base_account: Account<'info, BaseAccount>,

    #[account(mut)]
    // user calling this program owns the account
    pub user: Signer<'info>,

    // System program - runs Solana and can create accounts on Solana among other things
    pub system_program: Program<'info, System>,
}

// Specify what data goes in the AddGif context
#[derive(Accounts)]
pub struct AddGif<'info> {
    // Allows changing of base_account
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>
}

// Specify what we want to store in this account
#[account]
pub struct BaseAccount {
    pub total_gifs: u64,
}
