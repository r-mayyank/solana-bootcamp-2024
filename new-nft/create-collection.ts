import { createNft, fetchDigitalAsset,  mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';

import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from '@solana-developers/helpers';

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { generateSigner, keypairIdentity, percentAmount } from '@metaplex-foundation/umi';

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

const transaction = await createNft(umi, {
    mint: collectionMint,
    name: 'Mayank NFT Collection',
    symbol: 'MNFT',
    uri: 'https://example.com/collection-metadata.json',
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
});

await transaction.sendAndConfirm(umi);

const createdCollectionNft = await fetchDigitalAsset(umi, collectionMint.publicKey);
console.log('Created collection NFT:', getExplorerLink("address", createdCollectionNft.mint.publicKey, 'devnet'));