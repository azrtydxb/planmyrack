import { createHttpServer } from './http.ts'
import { createSqliteStore } from './sqliteStore.ts'
import type { AddressInfo } from 'node:net'

export { createSqliteStore } from './sqliteStore.ts'
export { createHttpServer, VERSION } from './http.ts'

export interface RunningServer {
  url: string
  close(): Promise<void>
}

export async function startServer(
  opts: { port?: number; dbPath?: string; webRoot?: string } = {},
): Promise<RunningServer> {
  const store = createSqliteStore(opts.dbPath ?? './data/planmyrack.db')
  const server = createHttpServer(store, opts.webRoot)
  await new Promise<void>((resolve) => server.listen(opts.port ?? 8787, resolve))
  const { port } = server.address() as AddressInfo

  return {
    url: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((err) => {
          store.close()
          err ? reject(err) : resolve()
        }),
      ),
  }
}
