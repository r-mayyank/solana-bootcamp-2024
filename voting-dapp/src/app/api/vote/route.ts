import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from '@solana/actions'
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Voting } from "@/../anchor/target/types/voting";
import { BN, Program } from '@coral-xyz/anchor';

const IDL = require('@/../anchor/target/idl/voting.json'); 

export const OPTIONS = GET;

export async function GET(request: Request) {
    const actionMetaaData: ActionGetResponse = {
        icon: 'https://as2.ftcdn.net/jpg/05/34/15/93/1000_F_534159328_hWPnzXuXhg0zKUQiGa1FSRIbcmEYiEil.jpg',
        title: 'Vote for your favorite operating system!',
        description: 'Vote for your favorite operating system and see the results in real-time.',
        label: 'Vote',
        links: {
            actions: [
                {
                    label: 'Windows',
                    href: '/api/vote?os=windows',
                },
                {
                    label: 'Linux',
                    href: '/api/vote?os=linux',
                },
                {
                    label: 'macOS',
                    href: '/api/vote?os=macos',
                }
            ]
        },
    };
    return Response.json(actionMetaaData, {
        status: 200,
        headers: ACTIONS_CORS_HEADERS
    });
};


export async function POST(request: Request) {
    const url = new URL(request.url);
    const os = url.searchParams.get('os');

    // Validate the operating system parameter
    if (!os) {
        return Response.json({ error: 'Operating system not specified' }, { status: 400 });
    }
    if (!['windows', 'linux', 'macos'].includes(os)) {
        return Response.json({ error: 'Invalid operating system' }, { status: 400 });
    }

    // Here you would typically handle the vote logic, e.g., saving to a database
    // For this example, we will just return a success message  
    const connection = new Connection('http://localhost:8899', 'confirmed');
    const program: Program<Voting> = new Program<Voting>(
        IDL,
        {connection}
    );
    const body: ActionPostRequest = await request.json();
    let voter

    // err handing for invalid account address
    try {
        voter = new PublicKey(body.account); 
    } catch (error) {
        return new Response("Invalid account address", {
            status: 400,
            headers: ACTIONS_CORS_HEADERS
        });
    }

    const instructions = await program.methods.vote(new BN(1), os).accounts({ signer: voter }).instruction();

    const blockhash = await connection.getLatestBlockhash();
    const transaction = new Transaction({
        feePayer: voter,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
        })
        .add(instructions);

    const response = await createPostResponse({
        fields: {
            transaction: transaction
        }
    });
    return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
} 