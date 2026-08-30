import { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { DEVICE_TYPES, portCapacity, portLink, otherEnd } from '@planmyrack/core'
import { Button } from './Button'
import { theme } from './theme'
import type { CableType, Device, Layout, LinkEnd, LinkKind } from '@planmyrack/core'

const CABLE_TYPES: CableType[] = ['cat5e', 'cat6', 'cat6a', 'fibre', 'dac']

/**
 * Pick the other end of a cable. Ports already carrying one are shown as taken, naming what holds
 * them, and cannot be chosen — reconnecting is a disconnect followed by a connect, never a silent
 * rewire.
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
  onConnect: (target: LinkEnd, meta: { cableType: CableType; label: string }) => void
  onDisconnect: (linkId: string) => void
  onClose: () => void
}) {
  const [cableType, setCableType] = useState<CableType>('cat6')
  const existing = portLink(layout, kind, { deviceId: device.id, port })
  const peer = existing ? otherEnd(existing, { deviceId: device.id, port }) : null
  const peerName = peer ? (layout.devices.find((d) => d.id === peer.deviceId)?.name ?? '') : ''

  const capacityOf = (candidate: Device) =>
    portCapacity(candidate, kind, kind === 'power' && candidate.outlets > 0 ? 'supply' : 'draw')

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View testID="port-picker" style={styles.sheet}>
        <Text style={styles.title}>
          {device.name} · port {port + 1}
        </Text>

        {existing && peer ? (
          <View style={styles.connected}>
            <Text style={styles.text}>
              Connected to {peerName} port {peer.port + 1}
            </Text>
            <Button label="Disconnect" tone="danger" onPress={() => onDisconnect(existing.id)} />
          </View>
        ) : (
          <>
            <Text style={styles.dim}>Pick the port at the other end of the cable.</Text>
            <View style={styles.chips}>
              {CABLE_TYPES.map((type) => (
                <Pressable
                  key={type}
                  accessibilityRole="button"
                  accessibilityLabel={`Cable type ${type}`}
                  accessibilityState={{ selected: type === cableType }}
                  onPress={() => setCableType(type)}
                  style={[styles.chip, type === cableType && styles.chipOn]}
                >
                  <Text style={styles.text}>{type}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <ScrollView contentContainerStyle={styles.body}>
          {layout.devices
            .filter((candidate) => capacityOf(candidate) > 0)
            .map((candidate) => (
              <View key={candidate.id} style={styles.group}>
                <Text style={styles.groupName}>
                  {candidate.name} · {DEVICE_TYPES[candidate.type].label}
                </Text>
                <View style={styles.ports}>
                  {Array.from({ length: capacityOf(candidate) }, (_, index) => {
                    const taken = portLink(layout, kind, { deviceId: candidate.id, port: index })
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
                          )
                        }
                        style={[styles.port, (taken || self) && styles.portTaken]}
                      >
                        <Text style={styles.portText}>{index + 1}</Text>
                      </Pressable>
                    )
                  })}
                </View>
                {layout.links.some(
                  (l) =>
                    l.kind === kind &&
                    (l.a.deviceId === candidate.id || l.b.deviceId === candidate.id),
                ) ? (
                  <Text style={styles.dim}>
                    Taken by{' '}
                    {layout.links
                      .filter(
                        (l) =>
                          l.kind === kind &&
                          (l.a.deviceId === candidate.id || l.b.deviceId === candidate.id),
                      )
                      .map((l) => {
                        const near = l.a.deviceId === candidate.id ? l.a : l.b
                        const far = otherEnd(l, near)
                        return layout.devices.find((d) => d.id === far.deviceId)?.name ?? ''
                      })
                      .join(', ')}
                  </Text>
                ) : null}
              </View>
            ))}
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    maxHeight: '75%',
    backgroundColor: theme.panel,
    borderTopColor: theme.panelEdge,
    borderTopWidth: 1,
    padding: 16,
    gap: theme.gap,
  },
  title: { color: theme.text, fontSize: 17, fontWeight: '700' },
  connected: { gap: theme.gap },
  body: { gap: theme.gap, paddingBottom: 24 },
  group: { gap: 6 },
  groupName: { color: theme.dim, fontSize: 12, fontWeight: '700' },
  ports: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  port: {
    minWidth: theme.touch,
    minHeight: theme.touch,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.panelEdge,
    backgroundColor: theme.bg,
  },
  portTaken: { opacity: 0.4 },
  portText: { color: theme.text, fontSize: 13 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: theme.touch,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.panelEdge,
  },
  chipOn: { borderColor: theme.accent, backgroundColor: 'rgba(59,130,246,0.15)' },
  text: { color: theme.text, fontSize: 13 },
  dim: { color: theme.dim, fontSize: 12 },
})
