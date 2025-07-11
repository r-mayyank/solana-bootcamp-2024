#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS");

#[program]
pub mod voting {
    use super::*;

    pub fn initialize_voting(ctx: Context<InitializeVoting>, 
                            poll_id: u64,
                            title: String,
                            description: String,
                            poll_start_time: i64,
                            poll_endtime: i64 )-> Result<()> {
        let poll = &mut ctx.accounts.poll;
        poll.poll_id = poll_id;
        poll.title = title;
        poll.description = description;
        poll.poll_start_time = poll_start_time;
        poll.poll_end_time = poll_endtime;
        poll.candidate_amount = 0; // Initialize candidate amount to 0
        Ok(())
    } 

    pub fn initialize_candidate(ctx: Context<InitializeCandidate>, 
                            _poll_id: u64,
                            candidate_name: String) -> Result<()> {
        let candidate = &mut ctx.accounts.candidate;
        let poll = &mut ctx.accounts.poll;
        poll.candidate_amount += 1; // Increment candidate amount in the poll
        candidate.candidate_name = candidate_name;
        candidate.vote_count = 0; // Initialize vote count to 0
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, 
                _poll_id: u64, 
                _candidate_name: String) -> Result<()> {
        // let poll = &mut ctx.accounts.poll;
        let candidate = &mut ctx.accounts.candidate;

        // Ensure the poll is active
        // if poll.poll_start_time > Clock::get()?.unix_timestamp || 
        //    poll.poll_end_time < Clock::get()?.unix_timestamp {
        //     return Err(ErrorCode::PollNotActive.into());
        // }

        // Increment the vote count for the candidate
        candidate.vote_count += 1;
        msg!("Vote cast for candidate: {}", candidate.candidate_name);
        msg!("Total votes for candidate {}: {}", candidate.candidate_name, candidate.vote_count);
        Ok(())
    }
}


// Struct to pass the poll and candidate information to vote
#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_name: String)]
pub struct Vote<'info> {
    pub signer: Signer<'info>,

    #[account(
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
        bump
    )]
    pub candidate: Account<'info, Candidate>,
}


// InitializeCandidate struct to handle the creation of a new candidate
#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_name: String)]
pub struct InitializeCandidate<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        init,
        payer = signer,
        space = 8 + Candidate::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
        bump
    )]
    pub candidate: Account<'info, Candidate>,

    pub system_program: Program<'info, System>,
}
#[account]
#[derive(InitSpace)]
pub struct Candidate {
    #[max_len(32)]
    pub candidate_name: String,
    pub vote_count: u64,
}

// InitializeVoting struct to handle the creation of a new poll
#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct InitializeVoting<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
   #[account(
        init,
        payer = signer,
        space = 8 + Poll::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,

    pub system_program: Program<'info, System>,
}
#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub poll_id: u64,
    #[max_len(32)]
    pub title: String,
    #[max_len(280)]
    pub description: String,
    pub poll_start_time: i64,
    pub poll_end_time: i64,
    pub candidate_amount: u64,
}