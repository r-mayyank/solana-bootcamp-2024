use anchor_lang::prelude::*;
use anchor_spl::{token_interface::{TokenAccount, TokenInterface, Mint, TransferChecked, transfer_checked}};

pub fn transfer_tokens<'info> (
    from: &InterfaceAccount<'info, TokenAccount>,
    to: &InterfaceAccount<'info, TokenAccount>,
    amount: &u64,
    mint: &InterfaceAccount<'info, Mint>,
    authoricty: &Signer<'info>,
    token_program: &Interface<'info, TokenInterface>,
  ) -> Result<()> {
    let transfer_account_options = TransferChecked {
        from: from.to_account_info(),
        to: to.to_account_info(),
        authority: authoricty.to_account_info(),
        mint: mint.to_account_info(),
    };

    let cpi_context = CpiContext::new(
        token_program.to_account_info(),  transfer_account_options);

    transfer_checked(cpi_context, *amount, 0)?;
    Ok(())
} 