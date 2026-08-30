import { startServer } from './index.ts'

const dbPath = process.env.PMR_DB ?? './data/planmyrack.db'
const port = Number(process.env.PORT ?? 8787)

const { url } = await startServer({ port, dbPath, webRoot: process.env.PMR_WEB })
console.log(`planmyrack server  ${url}  (database: ${dbPath})`)
console.log('This server has no authentication — run it on a trusted network only.')
