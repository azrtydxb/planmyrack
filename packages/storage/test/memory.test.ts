import { runStoreContract } from '../src/contract.ts'
import { createMemoryStore } from '../src/index.ts'

runStoreContract('memory store', async () => ({ store: createMemoryStore() }))
