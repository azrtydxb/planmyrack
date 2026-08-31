import { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { DEVICE_TYPES, portCapacity, portLink, otherEnd } from '@planmyrack/core'
import { Button, Mono, Segmented } from './primitives'
import { TOUCH, colour, font, radius } from './theme'
import { MODAL_ORIENTATIONS } from './modal'
import type { CableType, Device, Layout, LinkEnd, LinkKind } from '@planmyrack/core'

const CABLE_TYPES: CableType[] = ['cat5e', 'cat6', 'cat6a', 'fibre', 'dac']

/**
 * Pick the other end of a cable. Ports already carrying one are shown as taken, naming what holds
 * them, and cannot be chosen — reconnecting is a disconnect then a connect, never a silent rewire.
 */
export function PortPicker({
  layout,
  device,
  port,
  kind,
  onConnect,
  onDisconnect,
  onClose,
}: {
  layout: Layout
  device: Device
  port: number
  kind: LinkKind
  onConnect: (
    target: LinkEnd,
    meta: { cableType: CableType; label: string },
    kind: LinkKind,
  ) => void
  onDisconnect: (linkId: string) => void
  onClose: () => void
}) {
  const [cableType, setCableType] = useState<CableType>('cat6')
  const [linkKind, setLinkKind] = useState<LinkKind>(kind)

  const existing = portLink(layout, kind, { deviceId: device.id, port })
  const peer = existing ? otherEnd(existing, { deviceId: device.id, port }) : null
  const peerName = peer ? (layout.devices.find((d) => d.id === peer.deviceId)?.name ?? '') : ''

  const capacityOf = (candidate: Device) =>
    portCapacity(
      candidate,
      linkKind,
      linkKind === 'power' && candidate.outlets > 0 ? 'supply' : 'draw',
    )

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      supportedOrientations={MODAL_ORIENTATIONS}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View testID="port-picker" style={styles.sheet}>
        <View style={styles.grab} />

        <View style={styles.head}>
          <View style={styles.headText}>
            <Text style={styles.title}>Connect port</Text>
            <Mono size={8.5}>
              {`${device.name} · PORT ${port + 1} → PICK A FREE PORT · 1 CABLE PER PORT`}
            </Mono>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            style={styles.close}
          >
            <Text style={styles.closeGlyph}>×</Text>
          </Pressable>
        </View>

        {existing && peer ? (
          <View style={styles.connected}>
            <Text style={styles.connectedText}>
              Connected to {peerName} port {peer.port + 1}
            </Text>
            <Button label="Disconnect" tone="danger" onPress={() => onDisconnect(existing.id)} />
          </View>
        ) : (
          <View style={styles.controls}>
            <Segmented
              label="Cable kind"
              value={linkKind}
              onChange={setLinkKind}
              options={[
                { value: 'network', label: 'Network' },
                { value: 'power', label: 'Power' },
              ]}
            />
            <View style={styles.chips}>
              {(linkKind === 'power' ? [] : CABLE_TYPES).map((type) => (
                <Pressable
                  key={type}
                  accessibilityRole="button"
                  accessibilityLabel={`Cable type ${type}`}
                  accessibilityState={{ selected: type === cableType }}
                  onPress={() => setCableType(type)}
                  style={[styles.chip, type === cableType && styles.chipOn]}
                >
                  <Text style={[styles.chipText, type === cableType && styles.chipTextOn]}>
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.body}>
          {layout.devices
            .filter((candidate) => capacityOf(candidate) > 0)
            .map((candidate) => {
              const capacity = capacityOf(candidate)
              const free = Array.from({ length: capacity }, (_, i) => i).filter(
                (i) => !portLink(layout, linkKind, { deviceId: candidate.id, port: i }),
              ).length
              return (
                <View key={candidate.id} style={styles.group}>
                  <View style={styles.groupHead}>
                    <Mono size={7.5} tone={colour.muted}>
                      {`${candidate.name.toUpperCase()} · ${DEVICE_TYPES[candidate.type].label.toUpperCase()}`}
                    </Mono>
                    <Mono size={7.5} tone={free > 0 ? colour.green : colour.icon}>
                      {`${free} FREE`}
                    </Mono>
                  </View>

                  <View style={styles.ports}>
                    {Array.from({ length: capacity }, (_, index) => {
                      const taken = portLink(layout, linkKind, {
                        deviceId: candidate.id,
                        port: index,
                      })
                      const self = candidate.id === device.id && index === port
                      const holder = taken
                        ? layout.devices.find(
                            (d) =>
                              d.id ===
                              otherEnd(taken, { deviceId: candidate.id, port: index }).deviceId,
                          )?.name
                        : null
                      return (
                        <Pressable
                          key={index}
                          testID={`pick-${candidate.id}-${index}`}
                          accessibilityRole="button"
                          accessibilityLabel={
                            taken
                              ? `Port ${index + 1}, taken by ${holder ?? 'another device'}`
                              : `Port ${index + 1}, free`
                          }
                          accessibilityState={{ disabled: Boolean(taken) || self }}
                          disabled={Boolean(taken) || self}
                          onPress={() =>
                            onConnect(
                              { deviceId: candidate.id, port: index },
                              { cableType, label: '' },
                              linkKind,
                            )
                          }
                          style={[styles.portTile, (taken || self) && styles.portTileTaken]}
                        >
                          <Text style={[styles.portNumber, taken && styles.portNumberTaken]}>
                            {String(index + 1).padStart(2, '0')}
                          </Text>
                          <Mono
                            size={6.5}
                            tone={taken ? colour.icon : colour.muted}
                            weight="medium"
                          >
                            {taken ? (holder ?? 'Taken') : 'Free'}
                          </Mono>
                        </Pressable>
                      )
                    })}
                  </View>
                </View>
              )
            })}
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(22,32,44,0.35)' },
  sheet: {
    maxHeight: '76%',
    backgroundColor: colour.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingBottom: 20,
  },
  grab: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colour.borderInput,
    marginTop: 8,
  },
  head: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 12 },
  headText: { flex: 1, gap: 3 },
  title: { fontFamily: font.uiBold, fontSize: 19, color: colour.text },
  close: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: TOUCH / 2,
    backgroundColor: colour.sunkenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeGlyph: { fontSize: 20, color: colour.textSecondary, lineHeight: 22 },
  connected: { paddingHorizontal: 20, paddingBottom: 12, gap: 10 },
  connectedText: { fontFamily: font.ui, fontSize: 13, color: colour.text },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  chips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: {
    minHeight: 30,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colour.borderInput,
  },
  chipOn: { borderColor: colour.accent, backgroundColor: colour.accentSoft },
  chipText: { fontFamily: font.mono, fontSize: 10, color: colour.muted },
  chipTextOn: { fontFamily: font.monoBold, color: colour.accent },
  body: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  group: { gap: 8 },
  groupHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ports: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  portTile: {
    width: 52,
    minHeight: TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colour.borderInput,
    backgroundColor: colour.surface,
  },
  portTileTaken: { backgroundColor: colour.sunkenSoft, borderColor: colour.borderSoft },
  portNumber: { fontFamily: font.uiBold, fontSize: 13, color: '#1e2a3a' },
  portNumberTaken: { color: colour.icon },
})
