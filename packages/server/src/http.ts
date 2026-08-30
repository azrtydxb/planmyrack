import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { NotFoundError, StaleRevisionError } from '@planmyrack/storage'
import type { IncomingMessage, Server, ServerResponse } from 'node:http'
import type { Layout } from '@planmyrack/core'
import type { LayoutStore, Template } from '@planmyrack/storage'

export const VERSION = '0.1.0'
const MAX_BODY = 5_000_000

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
}

// expo-sqlite's web build stores through OPFS, which needs the page cross-origin isolated.
// Without these two headers local mode silently has nowhere to persist. `credentialless` is what
// the Expo SDK 57 docs specify; `require-corp` also isolates but demands every cross-origin
// resource opt in, which buys nothing for a self-hosted single-origin build.
const ISOLATION = {
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-embedder-policy': 'credentialless',
}

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': 'content-type',
}

function send(res: ServerResponse, status: number, body?: unknown): void {
  if (status === 204 || body === undefined) {
    res.writeHead(204, CORS)
    res.end()
    return
  }
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...CORS })
  res.end(JSON.stringify(body))
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    size += (chunk as Buffer).length
    if (size > MAX_BODY) throw new Error('payload too large')
    chunks.push(chunk as Buffer)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

async function serveStatic(req: IncomingMessage, res: ServerResponse, webRoot: string) {
  if (!existsSync(webRoot)) {
    return send(res, 404, { error: 'no web build here — run `npm run build:web`' })
  }
  const url = new URL(req.url ?? '/', 'http://x')
  const candidate = normalize(join(webRoot, decodeURIComponent(url.pathname)))
  const file =
    candidate.startsWith(webRoot) && existsSync(candidate) && extname(candidate)
      ? candidate
      : join(webRoot, 'index.html')
  if (!existsSync(file)) return send(res, 404, { error: 'not found' })
  res.writeHead(200, {
    'content-type': MIME[extname(file)] ?? 'application/octet-stream',
    ...ISOLATION,
  })
  res.end(await readFile(file))
}

export function createHttpServer(store: LayoutStore, webRoot?: string): Server {
  return createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, CORS)
        return res.end()
      }

      const { pathname } = new URL(req.url ?? '/', 'http://x')
      if (pathname === '/api/health') return send(res, 200, { ok: true, version: VERSION })

      const layouts = /^\/api\/layouts(?:\/([\w-]+))?$/.exec(pathname)
      const templates = /^\/api\/templates(?:\/([\w-]+))?$/.exec(pathname)

      if (layouts) {
        const id = layouts[1]
        if (req.method === 'GET' && !id) return send(res, 200, await store.list())
        if (req.method === 'GET' && id) return send(res, 200, await store.get(id))
        if (req.method === 'POST' && !id) {
          return send(res, 201, await store.create((await readJson(req)) as Layout))
        }
        if (req.method === 'PUT' && id) {
          const body = (await readJson(req)) as Layout
          return send(res, 200, await store.update({ ...body, id }))
        }
        if (req.method === 'DELETE' && id) {
          await store.remove(id)
          return send(res, 204)
        }
      }

      if (templates) {
        const id = templates[1]
        if (req.method === 'GET' && !id) return send(res, 200, await store.listTemplates())
        if (req.method === 'POST' && !id) {
          return send(res, 201, await store.saveTemplate((await readJson(req)) as Template))
        }
        if (req.method === 'PUT' && id) {
          const body = (await readJson(req)) as Template
          return send(res, 200, await store.saveTemplate({ ...body, id }))
        }
        if (req.method === 'DELETE' && id) {
          await store.removeTemplate(id)
          return send(res, 204)
        }
      }

      if (req.method === 'GET' && webRoot) return serveStatic(req, res, webRoot)
      send(res, 404, { error: `no route for ${req.method} ${pathname}` })
    } catch (err) {
      if (err instanceof StaleRevisionError) {
        return send(res, 409, { error: err.message, current: err.current })
      }
      if (err instanceof NotFoundError) return send(res, 404, { error: err.message })
      send(res, 400, { error: (err as Error).message })
    }
  })
}
