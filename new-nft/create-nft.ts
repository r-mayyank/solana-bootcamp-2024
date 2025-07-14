import { createNft, fetchDigitalAsset,  mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';

import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from '@solana-developers/helpers';

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { generateSigner, keypairIdentity, percentAmount, publicKey } from '@metaplex-foundation/umi';
const connection = new Connection(clusterApiUrl('devnet'))

const user = await getKeypairFromFile('~/.config/solana/id.json');

await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);
console.log('Loaded user:', user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log('Set up umi instance for user');

const collectionAddress = publicKey('BJT7THYJtPKTR1opF5MxzmBp8pQ9KfAo7GS7PBMEYVB6');

console.log('Creating NFT...');
const mint = generateSigner(umi);
const transaction = createNft(umi, {
    mint,
    name: 'My NFT',
    symbol: 'MNFT',
    uri: "https://raw.githubusercontent.com/r-mayyank/solana-bootcamp-2024/refs/heads/main/new-nft/collection-metadata.json",
    sellerFeeBasisPoints: percentAmount(0),
    collection: {
        key: collectionAddress,
        verified: false
    }
})

await transaction.sendAndConfirm(umi);

console.log('NFT created successfully!');
console.log('NFT Mint Address:', mint.publicKey.toString());
console.log('Explorer Link:', getExplorerLink("address", mint.publicKey, 'devnet'));

console.log('Waiting for transaction to be processed...');
await new Promise(resolve => setTimeout(resolve, 3000));

try {
    const createdNft = await fetchDigitalAsset(umi, mint.publicKey);
    console.log('Fetched NFT details:', createdNft.metadata.name);
} catch (error) {
    console.log('Note: NFT was created but details fetch failed. This is normal and the NFT exists on-chain.');
    console.log('You can verify it at:', getExplorerLink("address", mint.publicKey, 'devnet'));
}

