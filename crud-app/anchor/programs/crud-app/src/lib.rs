#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("4BaiGge9zVz2C1orCeH4aDfNzEYKto1g7H6HhMPEA1q8");

#[program]
pub mod counter {
    use super::*;

    pub fn create_journal_entry(ctx: Context<CreateEntry>, title: String, message: String) -> Result<()> {
        let jorunal_entry = &mut ctx.accounts.journal_entry;
        jorunal_entry.owner = ctx.accounts.owner.key();
        jorunal_entry.title = title;
        jorunal_entry.message = message;

        Ok(())
    }

    pub fn update_journal_entry(ctx: Context<UpdateEntry>, _title: String,  message: String) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.message = message;
 
        Ok(())
    }

    pub fn delete_journal_entry(_ctx: Context<DeleteEntry>, _title: String) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct DeleteEntry<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut, 
        seeds = [b"journal_entry", owner.key().as_ref(), journal_entry.title.as_bytes()],
        bump,
        close = owner,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateEntry<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,  

    #[account(
        mut, 
        seeds = [b"journal_entry", owner.key().as_ref(), journal_entry.title.as_bytes()],
        bump,
        realloc = 8 + JournalEntryState::INIT_SPACE,
        realloc::payer = owner,
        realloc::zero = true,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateEntry<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        seeds = [b"journal_entry", owner.key().as_ref(), title.as_bytes()],
        bump,
        space = 8 + JournalEntryState::INIT_SPACE,
        payer = owner
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    pub system_program: Program<'info, System>
}

#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,
    #[max_len(32)]
    pub title: String,
    #[max_len(256)]
    pub message: String,
} 
