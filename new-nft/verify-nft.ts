import { findMetadataPda,  mplTokenMetadata, verifyCollectionV1 } from '@metaplex-foundation/mpl-token-metadata';

import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from '@solana-developers/helpers';

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {  keypairIdentity, publicKey } from '@metaplex-foundation/umi';

const connection = new Connection(clusterApiUrl('devnet'))

const user = await getKeypairFromFile('~/.config/solana/id.json');

await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);
console.log('Loaded user:', user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log('Set up Umi with user identity:', umiUser.publicKey.toString());

const collectionAddress = publicKey('BJT7THYJtPKTR1opF5MxzmBp8pQ9KfAo7GS7PBMEYVB6');
const nftAddress = publicKey('9HtW5aC2PEK4WouXBX78bYo5SwZzhSuf2estaCT9M4Pf');

const transaction = verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, { mint: nftAddress}),
    collectionMint: collectionAddress,
    authority: umi.identity,
})

await transaction.sendAndConfirm(umi);

console.log('Collection verified successfully!');
console.log('Explorer Link:', getExplorerLink("address", nftAddress, 'devnet'));
