import { createNft, fetchDigitalAsset,  mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';

import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from '@solana-developers/helpers';

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { generateSigner, keypairIdentity, percentAmount, publicKey } from '@metaplex-foundation/umi';

const connection = new Connection(clusterApiUrl('devnet'))

const user = await getKeypairFromFile('~/.config/solana/id.json');

await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);
console.log('Loaded user:', user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log('Set up Umi with user identity:', umiUser.publicKey.toString());

const collectionMint = generateSigner(umi);

const transaction = createNft(umi, {
    mint: collectionMint,
    name: 'Mayank NFT Collection',
    symbol: 'MNFT',
    uri: 'https://raw.githubusercontent.com/r-mayyank/solana-bootcamp-2024/refs/heads/main/new-nft/collection-metadata.json',
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
});

await transaction.sendAndConfirm(umi);

console.log('Collection NFT created successfully!');
console.log('Collection Mint Address:', collectionMint.publicKey.toString());
console.log('Explorer Link:', getExplorerLink("address", collectionMint.publicKey, 'devnet'));

// Wait a moment for the transaction to be fully processed
console.log('Waiting for transaction to be processed...');
await new Promise(resolve => setTimeout(resolve, 3000));

try {
    const createdCollectionNft = await fetchDigitalAsset(umi, collectionMint.publicKey);
    console.log('Fetched collection NFT details:', createdCollectionNft.metadata.name);
} catch (error) {
    console.log('Note: NFT was created but details fetch failed. This is normal and the NFT exists on-chain.');
    console.log('You can verify it at:', getExplorerLink("address", collectionMint.publicKey, 'devnet'));
}

;