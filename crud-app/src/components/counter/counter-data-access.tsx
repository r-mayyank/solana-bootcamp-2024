'use client'

import { getCounterProgram, getCounterProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'

export interface CreateEntryArgs {
  title: string
  message: string
  owder: PublicKey 
}

export function useCrudProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCounterProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getCounterProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['counter', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: [`jounal-entry`, 'create', { cluster }],
    mutationFn: async ({ title, message }) => {
      return program.methods.createJournalEntry(title, message).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      toast.success('Journal Entry Created')
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error creating journal entry: ${error.message}`)
    }
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry
  }
}

export function useCrudProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCrudProgram()
  const provider = useAnchorProvider()

  const accountQuery = useQuery({
    queryKey: ['counter', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  })

  const updateEntry = useMutation<string, Error, { title: string; message: string }>({
    mutationKey: [`jounal-entry`, 'update', { cluster, account }],
    mutationFn: async ({ title, message }) => {
      return program.methods.updateJournalEntry(title, message)
        .accountsPartial({
          journalEntry: account, 
          owner: provider.wallet.publicKey
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      toast.success('Journal Entry Updated')
      accounts.refetch();
      accountQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Error updating journal entry: ${error.message}`)
    }
  });

  const deleteEntry = useMutation({
    mutationKey: [`jounal-entry`, 'delete', { cluster, account }],
    mutationFn: async (title: string) => {
      return program.methods.deleteJournalEntry(title)
        .accountsPartial({
          journalEntry: account,
          owner: provider.wallet.publicKey,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      toast.success('Journal Entry Deleted')
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error deleting journal entry: ${error.message}`)
    }
  });

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  }
}
