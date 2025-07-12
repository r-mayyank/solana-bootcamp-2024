'use client'

import { PublicKey } from '@solana/web3.js'
import { useState, useEffect } from 'react'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCrudProgram, useCrudProgramAccount } from './counter-data-access'
import { ellipsify } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import { SidebarOpenIcon } from 'lucide-react'

export function CrudCreate() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const { createEntry } = useCrudProgram()
  const { publicKey } = useWallet();

  const isFormValid = title.trim() !== '' && message.trim() !== '';

  const handleSumbit = () => {
    if (!isFormValid) {
      alert('Please fill in both title and message fields.');
      return;
    }
    if (!publicKey) {
      return <p> Connect Your Wallet</p>
    }
    createEntry.mutateAsync({
      title,
      message,
      owder: publicKey as PublicKey, // Ensure publicKey is not null
    }).then(() => {
      setTitle('')
      setMessage('')
    }).catch((error) => {
      console.error('Error creating entry:', error)
    })
  }
  return (
    <>
      <div className='space-y-4'>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="textarea w-full rounded-md border-2 border-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-blue-200 transition-colors p-2"
        />
        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="textarea w-full rounded-md border-2 border-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-blue-200 transition-colors p-2"
        />
        <Button
          onClick={handleSumbit}
          disabled={!isFormValid || createEntry.isPending}
          className="w-full btn btn-xs lg:btn-md btn-primary"
        >
          {createEntry.isPending ? 'Creating...' : 'Create Entry'}
        </Button>
      </div>
    </>
  )
}

export function CounterList() {
  const { accounts, getProgramAccount } = useCrudProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CounterCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CounterCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useCrudProgramAccount({
    account,
  })

  const [message, setMessage] = useState('')
  const { publicKey } = useWallet();

  // Update message state when query data changes
  useEffect(() => {
    if (accountQuery.data?.message) {
      setMessage(accountQuery.data.message)
    }
  }, [accountQuery.data?.message])

  const title = accountQuery.data?.title
  if (!title) {
    return (
      <Card className="card w-full bg-base-100 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold">No Title</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            {ellipsify(account.toString(), 10)}
            {/* <ExplorerLink address={account} className="ml-2" /> */}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const isFormValid = message.trim() !== '';

  const handleSumbit = () => {
    if (!isFormValid) {
      alert('Please fill in both title and message fields.');
      return;
    }
    if (!publicKey) {
      return <p> Connect Your Wallet</p>
    }
    updateEntry.mutateAsync({
      title,
      message,
      // owner: publicKey as PublicKey, // Ensure publicKey is not null
    }).then(() => {
      setMessage('')
    }).catch((error) => {
      toast.error(`Error updating entry: ${error.message}`)
      console.error('Error creating entry:', error)
    })
  }

  return accountQuery.isLoading ? (
    <span className='loading loading-spinner loading-lg'></span>
  ) : (
    <Card className="card w-full bg-base-100 shadow-xl mt-5">
      <CardHeader>
        <CardTitle className="text-lg font-bold"
          onClick={() => accountQuery.refetch()}
        >{title || 'No Title'}</CardTitle>
        {/* <CardDescription className='text-md text-gray-300'>
           {accountQuery.data?.message}
          </CardDescription> */}
        <CardDescription className="text-sm text-gray-500">
          {/* {ellipsify(account.toString(), 10)} */}
          <div className="flex items-center">
            <ExplorerLink path={`account/${account}`} label={account.toString()} />
            <SidebarOpenIcon className="h-4 w-4 inline-block ml-2 cursor-pointer hover:text-blue-500" />
          </div>
          {/* <ExplorerLink address={account} className="ml-2" />  */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="textarea w-full rounded-md border-2 border-gray-400 focus:border-gray-600 focus:ring-2 focus:ring-blue-200 transition-colors p-2"
              placeholder="Update message"
              />
            </div>
          <div className='flex justify-between items-center mx-5 mt-3'>
            <Button
              onClick={() => deleteEntry.mutate(title)}
              disabled={deleteEntry.isPending}
              className="btn btn-xs lg:btn-md btn-error bg-red-700"
            >
              {deleteEntry.isPending ? 'Deleting...' : 'Delete'}
            </Button>
            <Button
              onClick={handleSumbit}
              disabled={!isFormValid || updateEntry.isPending}
              className="btn btn-xs lg:btn-md btn-primary"
            >
              {updateEntry.isPending ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
