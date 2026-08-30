import { useCallback, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import {
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
import { AppHeader } from '../ui/AppHeader'
import { Button, Mono } from '../ui/primitives'
import { CableSchedule } from '../ui/CableSchedule'
import { ConflictDialog } from '../ui/ConflictDialog'
import { InspectorHost } from '../ui/InspectorHost'
import { OfflineBanner } from '../ui/OfflineBanner'
import { Palette } from '../ui/Palette'
import { PortPicker } from '../ui/PortPicker'
import { RackCanvas } from '../canvas/RackCanvas'
import { RackPager } from '../ui/RackPager'
import { RackSummary } from '../ui/RackSummary'
import { TabBar } from '../ui/TabBar'
import { useBreakpoint } from '../ui/useBreakpoint'
import { useLayoutEditor } from '../state/useLayoutEditor'
import { useTemplates } from '../state/useTemplates'
import { shareText } from '../export/files'
import { exportPng } from '../export/png'
import { printLayout } from '../export/print'
import { colour, font } from '../ui/theme'
import type { CableType, Device, Face, LinkEnd, LinkKind } from '@planmyrack/core'
import type { Layout } from '@planmyrack/core'
import type { LayoutStore } from '@planmyrack/storage'
import type { PaletteChoice } from '../ui/Palette'
import type { TabKey } from '../ui/TabBar'

/** The console: canvas, library, cabling and figures over one layout. */
export function RackEditorScreen({
  store,
  initial,
  mode = 'local',
  onSwitchToLocal,
  onOpenSettings,
}: {
  store: LayoutStore | null
  initial: Layout
  mode?: string
  onSwitchToLocal?: () => void
  onOpenSettings?: () => void
}) {
  const editor = useLayoutEditor(store, initial)
  const { templates, save: saveTemplate } = useTemplates(store)
  const breakpoint = useBreakpoint()

  const [tab, setTab] = useState<TabKey>('racks')
  const [face, setFace] = useState<Face>('front')
  const [showCables, setShowCables] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeRackId, setActiveRackId] = useState<string | null>(initial.racks[0]?.id ?? null)
  const [picking, setPicking] = useState<{ device: Device; port: number; kind: LinkKind } | null>(
    null,
  )

  const layout = editor.layout
  const wide = breakpoint !== 'phone'
  // 3a: the desktop keeps the library beside the canvas; 3b: the tablet uses the icon rail alone.
  const showLibraryPanel = breakpoint === 'desktop'
  const selected = useMemo(
    () => layout.devices.find((d) => d.id === selectedId) ?? null,
    [layout.devices, selectedId],
  )
  const activeRack = layout.racks.find((r) => r.id === activeRackId) ?? layout.racks[0] ?? null

  // Phones page through one rack at a time; wider screens show them side by side.
  const visible: Layout = wide ? layout : { ...layout, racks: activeRack ? [activeRack] : [] }

  const place = useCallback(
    (choice: PaletteChoice) => {
      const target = activeRack ?? layout.racks[0]
      if (!target) return
      editor.apply((current) =>
        addDevice(
          current,
          newDevice({
            rackId: target.id,
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
      if (!wide) setTab('racks')
    },
    [activeRack, editor, face, layout.racks, wide],
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

  const exportJsonFile = () =>
    void shareText(`${layout.name}.json`, exportJson(layout), 'application/json')

  const canvas = (
    <View style={styles.canvasColumn}>
      <RackPager
        racks={layout.racks}
        activeId={activeRack?.id ?? null}
        onSelect={setActiveRackId}
        onAddRack={() =>
          editor.apply((current) =>
            addRack(current, newRack({ units: RACK_UNIT_PRESETS[2] ?? 12 })),
          )
        }
      />
      <RackCanvas
        layout={visible}
        face={face}
        selectedId={selectedId}
        showCables={showCables}
        onSelect={setSelectedId}
        onPortPress={(device, port, kind) => setPicking({ device, port, kind })}
      />
      {!wide && layout.racks.length > 1 ? (
        <Mono size={7.5} tone={colour.icon} style={styles.pagerHint}>
          {`TAP A RACK CHIP TO SWITCH · ${layout.racks.length} RACKS`}
        </Mono>
      ) : null}
    </View>
  )

  const stats = (
    <ScrollView contentContainerStyle={styles.stats}>
      <Text style={styles.screenTitle}>Stats</Text>
      <Mono size={8.5}>{`${layout.name.toUpperCase()} · ${layout.racks.length} RACKS`}</Mono>
      {layout.racks.map((rack) => (
        <RackSummary key={rack.id} layout={layout} rackId={rack.id} />
      ))}
      <Text style={styles.groupTitle}>Export layout</Text>
      <View style={styles.exportRow}>
        <Button label="Rack JSON" tone="soft" onPress={exportJsonFile} />
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
      </View>
    </ScrollView>
  )

  const body = () => {
    if (wide) return canvas
    switch (tab) {
      case 'cables':
        return (
          <CableSchedule
            layout={layout}
            onJumpToDevice={(id) => {
              setSelectedId(id)
              setTab('racks')
            }}
            onDisconnect={(linkId) => editor.apply((current) => disconnect(current, linkId))}
            onExportCsv={() =>
              void shareText('planmyrack-cables.csv', cablesCsv(layout), 'text/csv')
            }
          />
        )
      case 'library':
        return <Palette templates={templates} onPick={place} />
      case 'stats':
        return stats
      case 'settings':
        return (
          <ScrollView contentContainerStyle={styles.stats}>
            <Text style={styles.screenTitle}>Settings</Text>
            <Button label="Open settings" onPress={() => onOpenSettings?.()} />
          </ScrollView>
        )
      default:
        return canvas
    }
  }

  return (
    <View style={styles.screen}>
      <OfflineBanner
        message={editor.conflict ? null : editor.error}
        onRetry={editor.saveNow}
        onSwitchToLocal={onSwitchToLocal}
      />

      <AppHeader
        name={layout.name}
        mode={mode}
        revision={layout.revision}
        saving={editor.saving}
        face={face}
        onFaceChange={setFace}
        showCables={showCables}
        onShowCablesChange={setShowCables}
        onUndo={editor.undo}
        onRedo={editor.redo}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        onMore={onOpenSettings}
      />

      <View style={styles.main}>
        {breakpoint === 'tablet' ? <TabBar rail active={tab} onChange={setTab} /> : null}

        {showLibraryPanel || (wide && tab === 'library') ? (
          <View style={styles.libraryPanel}>
            <Palette templates={templates} onPick={place} />
          </View>
        ) : null}

        <View style={styles.content}>
          {showLibraryPanel && tab === 'library' ? (
            canvas
          ) : wide && tab === 'cables' ? (
            <CableSchedule
              layout={layout}
              onJumpToDevice={setSelectedId}
              onDisconnect={(linkId) => editor.apply((current) => disconnect(current, linkId))}
              onExportCsv={() =>
                void shareText('planmyrack-cables.csv', cablesCsv(layout), 'text/csv')
              }
            />
          ) : wide && tab === 'stats' ? (
            stats
          ) : (
            body()
          )}
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
            onPortPress={(device, port) => setPicking({ device, port, kind: 'network' })}
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

      {!wide ? <TabBar active={tab} onChange={setTab} /> : null}

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
        onExportJson={exportJsonFile}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colour.appBg },
  main: { flex: 1, flexDirection: 'row' },
  content: { flex: 1 },
  canvasColumn: { flex: 1 },
  libraryPanel: { width: 300, borderRightWidth: 1, borderRightColor: colour.borderSoft },
  pagerHint: { alignSelf: 'center', paddingVertical: 8 },
  stats: { padding: 16, gap: 12 },
  screenTitle: { fontFamily: font.uiBold, fontSize: 22, color: colour.text },
  groupTitle: { fontFamily: font.uiBold, fontSize: 15, color: colour.text, marginTop: 6 },
  exportRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
})
