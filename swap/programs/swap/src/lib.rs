pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("4P4F5U7AwDaWzXpRX79svFeh4WwqbojoGGEiiqanVmhQ");

#[program]
pub mod swap {
    use super::*;

    pub fn make_offer(
        context: Context<MakeOffer>, 
        id:u64, 
        token_a_offered_amount: u64, 
        token_b_wanted_amount: u64
    ) -> Result<()> {
        make_offer::send_offered_tokens_to_vault(&context, token_a_offered_amount)?;
        make_offer::save_offer(context, id, token_b_wanted_amount)
    }

    pub fn take_offer(context: Context<TakeOffer>) -> Result<()> {
        take_offer::send_wanted_tokens_to_maker(&context)?;
        instructions::take_offer::withdraw_and_close_vault(&context)?;
        Ok(())
    }
}
