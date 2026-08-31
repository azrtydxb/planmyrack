import { layoutSchema } from '@planmyrack/core'
import { NotFoundError, StaleRevisionError, StoreUnavailableError } from './types.ts'
import type { Layout } from '@planmyrack/core'
import type { LayoutStore, LayoutSummary, Template } from './types.ts'

const TIMEOUT_MS = 5000

export interface ProbeResult {
  ok: boolean
  version?: string
  reason?: string
}

/**
 * A timeout built from AbortController rather than AbortSignal.timeout, which Hermes does not
 * reliably provide — this adapter runs on the phone as well as in Node.
 */
async function withTimeout<T>(
  run: (signal: AbortSignal) => Promise<T>,
  timeoutMs = TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await run(controller.signal)
  } finally {
    clearTimeout(timer)
  }
}

export function createHttpStore(baseUrl: string, fetchImpl: typeof fetch = fetch): LayoutStore {
  const root = baseUrl.replace(/\/+$/, '')

  async function call<T>(path: string, init?: RequestInit): Promise<T | undefined> {
    let res: Response
    try {
      res = await withTimeout((signal) =>
        fetchImpl(`${root}${path}`, {
          ...init,
          signal,
          headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
        }),
      )
    } catch (err) {
      throw new StoreUnavailableError(`${root} did not answer.`, { cause: err })
    }

    if (res.status === 204) return undefined
    let body: unknown
    try {
      body = await res.json()
    } catch (err) {
      throw new StoreUnavailableError(`${root} answered with something that is not JSON.`, {
        cause: err,
      })
    }

    if (res.status === 409) throw new StaleRevisionError((body as { current: Layout }).current)
    if (res.status === 404) throw new NotFoundError(path)
    if (!res.ok) {
      throw new StoreUnavailableError(`${root} answered ${res.status}.`)
    }
    return body as T
  }

  /**
   * A server that answers with something that is not a layout is a broken server, and saying so
   * here is the difference between a typed StoreUnavailableError and a crash somewhere later
   * with a field that turned out to be undefined.
   */
  function asLayout(body: Layout | undefined): Layout {
    const parsed = layoutSchema.safeParse(body)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]!
      throw new StoreUnavailableError(
        `${root} answered with something that is not a layout: ${
          issue.path.join('.') || 'the document'
        } ${issue.message.toLowerCase()}.`,
      )
    }
    return body as Layout
  }

  return {
    list: () => call<LayoutSummary[]>('/api/layouts').then((v) => v ?? []),
    get: (id) => call<Layout>(`/api/layouts/${id}`).then(asLayout),
    create: (layout) =>
      call<Layout>('/api/layouts', { method: 'POST', body: JSON.stringify(layout) }).then(asLayout),
    update: (layout) =>
      call<Layout>(`/api/layouts/${layout.id}`, {
        method: 'PUT',
        body: JSON.stringify(layout),
      }).then(asLayout),
    remove: async (id) => {
      await call(`/api/layouts/${id}`, { method: 'DELETE' })
    },
    listTemplates: () => call<Template[]>('/api/templates').then((v) => v ?? []),
    saveTemplate: (template) =>
      call<Template>('/api/templates', { method: 'POST', body: JSON.stringify(template) }).then(
        (v) => v!,
      ),
    removeTemplate: async (id) => {
      await call(`/api/templates/${id}`, { method: 'DELETE' })
    },
  }
}

/** Used by the settings screen's "test connection" button. Never throws. */
export async function probeServer(
  baseUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ProbeResult> {
  try {
    const res = await withTimeout(
      (signal) => fetchImpl(`${baseUrl.replace(/\/+$/, '')}/api/health`, { signal }),
      3000,
    )
    if (!res.ok) return { ok: false, reason: `The server answered ${res.status}.` }
    const body = (await res.json()) as { ok?: boolean; version?: string }
    return body?.ok
      ? { ok: true, version: body.version }
      : { ok: false, reason: 'That address answered, but it is not a PlanMyRack server.' }
  } catch (err) {
    return { ok: false, reason: (err as Error).message || 'No answer from that address.' }
  }
}
