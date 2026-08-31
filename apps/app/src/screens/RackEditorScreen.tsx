import { useCallback, useMemo, useRef, useState } from 'react'
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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
  removeRack,
  updateDevice,
  updateRack,
} from '@planmyrack/core'
import { AppHeader } from '../ui/AppHeader'
import { Button, Mono } from '../ui/primitives'
import { CableSchedule } from '../ui/CableSchedule'
import { ConflictDialog } from '../ui/ConflictDialog'
import { InspectorHost, panelWidth } from '../ui/InspectorHost'
import { OfflineBanner } from '../ui/OfflineBanner'
import { Palette } from '../ui/Palette'
import { PortPicker } from '../ui/PortPicker'
import { RackCanvas } from '../canvas/RackCanvas'
import { useDragPlacement } from '../canvas/useDragPlacement'
import { RackPager } from '../ui/RackPager'
import { RackSettings } from '../ui/RackSettings'
import { RackSummary } from '../ui/RackSummary'
import { TabBar } from '../ui/TabBar'
import { useBreakpoint } from '../ui/useBreakpoint'
import { useLayoutEditor } from '../state/useLayoutEditor'
import { useTemplates } from '../state/useTemplates'
import { shareText } from '../export/files'
import { exportPng } from '../export/png'
import { printLayout } from '../export/print'
import { CABLE_COLOURS, colour, font } from '../ui/theme'
import type { CableType, Device, Face, LinkEnd, LinkKind } from '@planmyrack/core'
import type { Layout } from '@planmyrack/core'
import type { LayoutStore } from '@planmyrack/storage'
import type { CanvasGeometry } from '../canvas/RackCanvas'
import type { PaletteChoice } from '../ui/Palette'
import type { TabKey } from '../ui/TabBar'

const RACK_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/** Rack A, Rack B, … — a second "19\" rack" chip is indistinguishable from the first. */
export function nextRackName(racks: { name: string }[]): string {
  for (const letter of RACK_LETTERS) {
    const candidate = `Rack ${letter}`
    if (!racks.some((rack) => rack.name === candidate)) return candidate
  }
  return `Rack ${racks.length + 1}`
}

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
  const { width: screenWidth } = useWindowDimensions()
  /**
   * This screen hides the navigation header, so nothing else pads for the status bar and the
   * Dynamic Island. In landscape — the only orientation this app runs in — the island is down
   * the LEFT edge, right where the icon rail is: on an iPhone it covered the rail's second
   * button and swallowed every tap aimed at it.
   */
  const insets = useSafeAreaInsets()

  const [tab, setTab] = useState<TabKey>('racks')
  const [face, setFace] = useState<Face>('front')
  const [showCables, setShowCables] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeRackId, setActiveRackId] = useState<string | null>(initial.racks[0]?.id ?? null)
  const [picking, setPicking] = useState<{ device: Device; port: number; kind: LinkKind } | null>(
    null,
  )
  const geometry = useRef<CanvasGeometry | null>(null)
  const [editingRack, setEditingRack] = useState(false)
  const [rackError, setRackError] = useState<string | null>(null)

  const layout = editor.layout
  const wide = breakpoint !== 'phone'
  // 3a keeps the library open beside the canvas. Below that width the canvas would be crushed
  // between two panels — an iPad in portrait left it 130px wide — so the library only opens on
  // its own tab, and a side panel closes it.
  const roomForBothPanels = breakpoint === 'desktop'
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

  /**
   * Dragging is the way the spec asks for equipment to be placed: pick a row up, drop it on a
   * rack face. The same gesture moves a placed device, including to another face or rack.
   */
  const placement = useDragPlacement({
    layout,
    resolve: (point) => geometry.current?.resolve(point) ?? null,
    onCommit: (next) => editor.apply(() => next),
  })

  const toLocal = (screen: { x: number; y: number }) => geometry.current?.toLocal(screen) ?? screen

  const dragFromLibrary = useMemo(
    () => ({
      onStart: (choice: PaletteChoice, screen: { x: number; y: number }) => {
        if (!wide) setTab('racks')
        placement.startNew(choice.type, choice.heightU, toLocal(screen), {
          ...(choice.name ? { name: choice.name } : {}),
          ...(choice.ports === undefined ? {} : { ports: choice.ports }),
          ...(choice.outlets === undefined ? {} : { outlets: choice.outlets }),
          ...(choice.watts === undefined ? {} : { watts: choice.watts }),
          ...(choice.colour ? { colour: choice.colour } : {}),
        })
      },
      onMove: (screen: { x: number; y: number }) => placement.moveTo(toLocal(screen)),
      onEnd: () => placement.drop(),
      onCancel: () => placement.cancel(),
    }),
    // placement's callbacks are stable; the tab reset depends on the breakpoint
    [placement, wide],
  )

  const dragPlaced = useMemo(
    () => ({
      onStart: (device: Device, screen: { x: number; y: number }) =>
        placement.startMove(device, toLocal(screen)),
      onMove: (screen: { x: number; y: number }) => placement.moveTo(toLocal(screen)),
      onEnd: () => placement.drop(),
      onCancel: () => placement.cancel(),
    }),
    [placement],
  )

  const connectTo = (
    target: LinkEnd,
    meta: { cableType: CableType; label: string },
    kind: LinkKind,
  ) => {
    if (!picking) return
    // A power cable leaves the device's inlet, not whichever network port was tapped to open
    // the sheet; cables cycle through the palette so neighbouring runs stay tellable apart.
    const from =
      kind === 'power'
        ? { deviceId: picking.device.id, port: 0 }
        : { deviceId: picking.device.id, port: picking.port }
    const colour = CABLE_COLOURS[layout.links.length % CABLE_COLOURS.length]
    // A power run has no Ethernet category; recording one would put "CAT6" against it in the
    // schedule and the CSV.
    const cableType = kind === 'power' ? 'power' : meta.cableType
    editor.apply((current) => connect(current, kind, from, target, { ...meta, cableType, colour }))
    setPicking(null)
  }

  const exportJsonFile = () =>
    void shareText(`${layout.name}.json`, exportJson(layout), 'application/json')

  const canvas = (
    <View style={styles.canvasColumn}>
      <RackPager
        racks={layout.racks}
        activeId={activeRack?.id ?? null}
        onSelect={(rackId) => {
          // Tapping the rack you are already on opens its settings — the only route to a rack's
          // name, standard and height.
          if (rackId === activeRack?.id) {
            setRackError(null)
            setEditingRack(true)
            setSelectedId(null)
          }
          setActiveRackId(rackId)
        }}
        onEditRack={(rackId) => {
          setRackError(null)
          setActiveRackId(rackId)
          setSelectedId(null)
          setEditingRack(true)
        }}
        onAddRack={() =>
          editor.apply((current) =>
            addRack(
              current,
              newRack({ name: nextRackName(layout.racks), units: RACK_UNIT_PRESETS[2] ?? 12 }),
            ),
          )
        }
      />
      <RackCanvas
        layout={visible}
        face={face}
        selectedId={selectedId}
        showCables={showCables}
        dropHint={placement.drag?.target ?? null}
        drag={dragPlaced}
        onGeometry={(next) => {
          geometry.current = next
        }}
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

  const cableSchedule = (
    <CableSchedule
      layout={layout}
      onJumpToDevice={(id) => {
        setSelectedId(id)
        setTab('racks')
      }}
      onDisconnect={(linkId) => editor.apply((current) => disconnect(current, linkId))}
      onExportCsv={() => void shareText('planmyrack-cables.csv', cablesCsv(layout), 'text/csv')}
    />
  )

  const editRack = (patch: Partial<typeof activeRack & object>) => {
    if (!activeRack) return
    // updateRack refuses a resize that would strand a device. The editor turns that refusal into
    // its own error banner, so run the pure op once first to put the reason beside the control
    // that caused it.
    try {
      updateRack(layout, activeRack.id, patch)
    } catch (err) {
      setRackError((err as Error).message)
      return
    }
    setRackError(null)
    editor.apply((current) => updateRack(current, activeRack.id, patch))
  }

  /** The right-hand panel of 3a/3b: whatever is being edited, with the rack's figures beneath. */
  const sidePanel =
    editingRack && activeRack ? (
      <View testID="rack-panel" style={[styles.sidePanel, { width: panelWidth(screenWidth) }]}>
        <View style={styles.panelHead}>
          <Text style={styles.panelTitle} numberOfLines={1}>
            {activeRack.name}
          </Text>
          <Button small label="Close" onPress={() => setEditingRack(false)} />
        </View>
        <RackSettings
          rack={activeRack}
          error={rackError}
          onChange={editRack}
          onRemove={
            layout.racks.length > 1
              ? () => {
                  const id = activeRack.id
                  editor.apply((current) => removeRack(current, id))
                  setEditingRack(false)
                  setActiveRackId(layout.racks.find((r) => r.id !== id)?.id ?? null)
                }
              : undefined
          }
        />
      </View>
    ) : null

  const settingsPane = (
    <ScrollView contentContainerStyle={styles.stats}>
      <Text style={styles.screenTitle}>Settings</Text>
      <Button label="Open settings" onPress={() => onOpenSettings?.()} />
    </ScrollView>
  )

  const body = () => {
    if (wide) return canvas
    switch (tab) {
      case 'cables':
        return cableSchedule
      case 'library':
        return <Palette templates={templates} onPick={place} drag={dragFromLibrary} />
      case 'stats':
        return stats
      case 'settings':
        return settingsPane
      default:
        return canvas
    }
  }

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right },
      ]}
    >
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
        onExport={wide ? () => setTab('stats') : undefined}
      />

      <View style={styles.main}>
        {/* 3a hides the rail; without it the cable schedule, the figures and the exports have no
            door on a desktop, so it stays at every width above a phone. */}
        {wide ? <TabBar rail active={tab} onChange={setTab} /> : null}

        {wide && (roomForBothPanels || tab === 'library') && !(sidePanel && !roomForBothPanels) ? (
          <View testID="library-panel" style={styles.libraryPanel}>
            <Palette templates={templates} onPick={place} drag={dragFromLibrary} />
          </View>
        ) : null}

        <View style={styles.content}>
          {wide && tab === 'cables'
            ? cableSchedule
            : wide && tab === 'stats'
              ? stats
              : wide && tab === 'settings'
                ? settingsPane
                : body()}
        </View>

        {sidePanel}

        {!sidePanel && selected ? (
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
            footer={
              roomForBothPanels && activeRack ? (
                <RackSummary layout={layout} rackId={activeRack.id} />
              ) : null
            }
          />
        ) : null}

        {roomForBothPanels && !sidePanel && !selected && activeRack ? (
          <View
            testID="summary-panel"
            style={[styles.sidePanel, { width: panelWidth(screenWidth) }]}
          >
            <View style={styles.panelHead}>
              <Text style={styles.panelTitle} numberOfLines={1}>
                {activeRack.name}
              </Text>
            </View>
            <RackSummary layout={layout} rackId={activeRack.id} />
          </View>
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
  sidePanel: {
    padding: 18,
    gap: 12,
    backgroundColor: colour.surface,
    borderLeftColor: colour.borderSoft,
    borderLeftWidth: 1,
  },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  panelTitle: { flex: 1, fontFamily: font.uiBold, fontSize: 19, color: colour.text },
  pagerHint: { alignSelf: 'center', paddingVertical: 8 },
  stats: { padding: 16, gap: 12 },
  screenTitle: { fontFamily: font.uiBold, fontSize: 22, color: colour.text },
  groupTitle: { fontFamily: font.uiBold, fontSize: 15, color: colour.text, marginTop: 6 },
  exportRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
})
