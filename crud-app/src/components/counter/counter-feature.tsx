'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCrudProgram } from './counter-data-access'
import { CrudCreate, CounterList } from './counter-ui'
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'

export default function CounterFeature() {
  const { publicKey } = useWallet()
  const { programId } = useCrudProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="Crud App - Create Journal Entries"
        subtitle={
          'Create and manage journal entries on the Solana blockchain. Use the form below to create a new entry.'
        }
      >
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <CrudCreate />
      </AppHero>
      <div className='max-w-4xl mx-auto space-y-2 text-center'>
        <h1 className='text-xl'>Journal Entries</h1>
        <span>View and manage your journal entries below.</span>
        <CounterList />
      </div>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
