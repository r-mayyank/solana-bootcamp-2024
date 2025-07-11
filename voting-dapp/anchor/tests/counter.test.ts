import { BankrunProvider, startAnchor } from "anchor-bankrun";
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
// import { Counter } from '../target/types/counter'
import { Voting } from '../target/types/voting'

const IDL = require('../target/idl/voting.json')

const votingAddress = new PublicKey('FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS');

describe('Voting', () => {

  let context;
  let provider;
  let votingProgram: Program<Voting>;

  beforeAll(async () => {
    context = await startAnchor("", [{ name: "voting", programId: votingAddress }], []);
    provider = new BankrunProvider(context);
    votingProgram = new Program<Voting>(
      IDL,
      provider,
    );
  });


  it('Initialize Poll', async () => {
    await votingProgram.methods.initializeVoting(
      new anchor.BN(1),
      "Test Poll",
      "This is a test poll",
      new anchor.BN(0),
      new anchor.BN(1821246479),
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log(poll);

    expect(poll.pollId.toNumber()).toBe(1);
    expect(poll.title).toBe("Test Poll");
    expect(poll.description).toBe("This is a test poll");
    expect(poll.pollStartTime.toNumber()).toBeLessThan(poll.pollEndTime.toNumber());

  });

  it('Initialize Candidate', async () => {
    await votingProgram.methods.initializeCandidate(
      new anchor.BN(1),
      "Candidate 1",
    ).rpc();

    await votingProgram.methods.initializeCandidate(
      new anchor.BN(1),
      "Candidate 2",
    ).rpc();

    const [candidate1] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Candidate 1")],
      votingAddress,
    );

    const candidate1Data = await votingProgram.account.candidate.fetch(candidate1);
    console.log(candidate1Data);
    expect(candidate1Data.voteCount.toNumber()).toBe(0);

    const [candidate2] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Candidate 2")],
      votingAddress,
    );

    const candidate2Data = await votingProgram.account.candidate.fetch(candidate2);
    console.log(candidate2Data);
    expect(candidate2Data.voteCount.toNumber()).toBe(0);
  });

  it('Vote', async () => {
    await votingProgram.methods.vote(
      new anchor.BN(1),
      "Candidate 1",
    ).rpc();

    const [candidate1Data] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Candidate 1")],
      votingAddress,
    );

    const candidate1 = await votingProgram.account.candidate.fetch(candidate1Data);
    console.log(candidate1);
    expect(candidate1.voteCount.toNumber()).toBe(1);

    
  });
})
