import { useCallback, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  MAX_RACK_UNITS,
  RACK_UNIT_PRESETS,
  addDevice,
  addRack,
  cablesCsv,
  connect,
  disconnect,
  exportJson,
  newDevice,
  newRack,
  partsCsv,
  removeDevice,
  updateDevice,
} from '@planmyrack/core'
import { CableSchedule } from '../ui/CableSchedule'
import { ConflictDialog } from '../ui/ConflictDialog'
import { InspectorHost } from '../ui/InspectorHost'
import { OfflineBanner } from '../ui/OfflineBanner'
import { Palette } from '../ui/Palette'
import { PortPicker } from '../ui/PortPicker'
import { RackCanvas } from '../canvas/RackCanvas'
import { RackSummary } from '../ui/RackSummary'
import { Button } from '../ui/Button'
import { useBreakpoint } from '../ui/useBreakpoint'
import { useLayoutEditor } from '../state/useLayoutEditor'
import { useTemplates } from '../state/useTemplates'
import { shareText } from '../export/files'
import { exportPng } from '../export/png'
import { printLayout } from '../export/print'
import { theme } from '../ui/theme'
import type { CableType, Device, Face, Layout, LinkEnd, LinkKind } from '@planmyrack/core'
import type { LayoutStore } from '@planmyrack/storage'
import type { PaletteChoice } from '../ui/Palette'

/** The editor: canvas, palette, inspector, cabling and exports over one layout. */
export function RackEditorScreen({
  store,
  initial,
  onSwitchToLocal,
}: {
  store: LayoutStore | null
  initial: Layout
  onSwitchToLocal?: () => void
}) {
  const editor = useLayoutEditor(store, initial)
  const { templates, save: saveTemplate } = useTemplates(store)
  const breakpoint = useBreakpoint()

  const [face, setFace] = useState<Face>('front')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [picking, setPicking] = useState<{ device: Device; port: number; kind: LinkKind } | null>(
    null,
  )

  const layout = editor.layout
  const selected = useMemo(
    () => layout.devices.find((d) => d.id === selectedId) ?? null,
    [layout.devices, selectedId],
  )

  const place = useCallback(
    (choice: PaletteChoice) => {
      const rack = layout.racks[0]
      if (!rack) return
      editor.apply((current) =>
        addDevice(
          current,
          newDevice({
            rackId: rack.id,
            face,
            posU: 0,
            heightU: choice.heightU,
            type: choice.type,
            ...(choice.name ? { name: choice.name } : {}),
            ...(choice.ports === undefined ? {} : { ports: choice.ports }),
            ...(choice.outlets === undefined ? {} : { outlets: choice.outlets }),
            ...(choice.watts === undefined ? {} : { watts: choice.watts }),
            ...(choice.colour ? { colour: choice.colour } : {}),
          }),
        ),
      )
    },
    [editor, face, layout.racks],
  )

  const connectTo = (target: LinkEnd, meta: { cableType: CableType; label: string }) => {
    if (!picking) return
    editor.apply((current) =>
      connect(
        current,
        picking.kind,
        { deviceId: picking.device.id, port: picking.port },
        target,
        meta,
      ),
    )
    setPicking(null)
  }

  return (
    <View style={styles.screen}>
      <OfflineBanner
        message={editor.conflict ? null : editor.error}
        onRetry={editor.saveNow}
        onSwitchToLocal={onSwitchToLocal}
      />

      <View style={styles.toolbar}>
        <Button
          label={face === 'front' ? 'Front' : 'Rear'}
          onPress={() => setFace(face === 'front' ? 'rear' : 'front')}
        />
        <Button label="Undo" onPress={editor.undo} disabled={!editor.canUndo} />
        <Button label="Redo" onPress={editor.redo} disabled={!editor.canRedo} />
        <Button
          label="Add rack"
          onPress={() =>
            editor.apply((current) =>
              addRack(current, newRack({ units: RACK_UNIT_PRESETS[2] ?? MAX_RACK_UNITS })),
            )
          }
        />
        <Button
          label="Export JSON"
          onPress={() =>
            void shareText(`${layout.name}.json`, exportJson(layout), 'application/json')
          }
        />
        <Button
          label="Parts CSV"
          onPress={() => void shareText('planmyrack-parts.csv', partsCsv(layout), 'text/csv')}
        />
        <Button
          label="Cable CSV"
          onPress={() => void shareText('planmyrack-cables.csv', cablesCsv(layout), 'text/csv')}
        />
        <Button
          label="PNG"
          onPress={() => void exportPng(layout, face, 'planmyrack.png').catch(() => undefined)}
        />
        <Button label="Print" onPress={() => void printLayout(layout, [face])} />
        <Text style={styles.state}>{editor.saving === 'saving' ? 'Saving…' : ''}</Text>
      </View>

      <View style={[styles.main, breakpoint === 'wide' && styles.mainWide]}>
        <View style={styles.canvasColumn}>
          <RackCanvas
            layout={layout}
            face={face}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onPortPress={(device, port, kind) => setPicking({ device, port, kind })}
          />
          <ScrollView horizontal contentContainerStyle={styles.summaries}>
            {layout.racks.map((rack) => (
              <RackSummary key={rack.id} layout={layout} rackId={rack.id} />
            ))}
          </ScrollView>
          <Palette templates={templates} onPick={place} />
          <CableSchedule
            layout={layout}
            onJumpToDevice={setSelectedId}
            onDisconnect={(linkId) => editor.apply((current) => disconnect(current, linkId))}
          />
        </View>

        {selected ? (
          <InspectorHost
            visible
            device={selected}
            layout={layout}
            onClose={() => setSelectedId(null)}
            onChange={(patch) =>
              editor.apply((current) => updateDevice(current, selected.id, patch))
            }
            onDuplicate={() =>
              editor.apply((current) =>
                addDevice(current, newDevice({ ...selected, id: undefined, posU: selected.posU })),
              )
            }
            onDelete={() => {
              editor.apply((current) => removeDevice(current, selected.id))
              setSelectedId(null)
            }}
            onSaveTemplate={() => void saveTemplate(selected)}
          />
        ) : null}
      </View>

      {picking ? (
        <PortPicker
          layout={layout}
          device={picking.device}
          port={picking.port}
          kind={picking.kind}
          onConnect={connectTo}
          onDisconnect={(linkId) => {
            editor.apply((current) => disconnect(current, linkId))
            setPicking(null)
          }}
          onClose={() => setPicking(null)}
        />
      ) : null}

      <ConflictDialog
        current={editor.conflict}
        onReload={editor.reload}
        onExportJson={() =>
          void shareText(`${layout.name}.json`, exportJson(layout), 'application/json')
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: theme.panel,
  },
  state: { color: theme.dim, fontSize: 12 },
  main: { flex: 1 },
  mainWide: { flexDirection: 'row' },
  canvasColumn: { flex: 1 },
  summaries: { padding: 12, gap: 12 },
})
