import { useCallback, useEffect, useState } from 'react'
import { templateFromDevice } from '@planmyrack/core'
import type { Device } from '@planmyrack/core'
import type { LayoutStore, Template } from '@planmyrack/storage'

/** The user's own saved gear, stored wherever the active mode stores everything else. */
export function useTemplates(store: LayoutStore | null) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!store) return
    try {
      setTemplates(await store.listTemplates())
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [store])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const save = useCallback(
    async (device: Device) => {
      if (!store) return
      await store.saveTemplate(templateFromDevice(device) as Template)
      await refresh()
    },
    [refresh, store],
  )

  const remove = useCallback(
    async (id: string) => {
      if (!store) return
      await store.removeTemplate(id)
      await refresh()
    },
    [refresh, store],
  )

  return { templates, save, remove, error, refresh }
}
