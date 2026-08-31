import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  COLOURS,
  DEVICE_TYPES,
  PORT_SPEEDS,
  UNIT_SIZES,
  otherEnd,
  sizeLabel,
} from '@planmyrack/core'
import { Button, Mono, StatTile } from './primitives'
import { NumberField, TextField } from './Field'
import { TOUCH, colour, font, radius } from './theme'
import type { Device, Layout } from '@planmyrack/core'

/**
 * Everything about one device, in the design's order: identity, colour, figures, connections,
 * actions. Port and outlet fields exist only for types that can carry them — offering a port
 * count on a shelf would be a lie the model then has to reject.
 */
/** One row of speed chips for a port group, with the chosen one lit. */
function SpeedRow({
  label,
  value,
  onChange,
}: {
  label: string
  value?: string
  onChange: (speed: string) => void
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.chips}>
        {PORT_SPEEDS.map((speed) => (
          <Pressable
            key={speed}
            accessibilityRole="button"
            accessibilityLabel={`${label} at ${speed}`}
            accessibilityState={{ selected: speed === value }}
            onPress={() => onChange(speed === value ? '' : speed)}
            style={[styles.chip, speed === value && styles.chipOn]}
          >
            <Text style={[styles.chipText, speed === value && styles.chipTextOn]}>{speed}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

export function Inspector({
  device,
  layout,
  onChange,
  onDuplicate,
  onDelete,
  onSaveTemplate,
  onPortPress,
}: {
  device: Device
  layout?: Layout
  onChange: (patch: Partial<Device>) => void
  onDuplicate?: () => void
  onDelete?: () => void
  onSaveTemplate?: () => void
  onPortPress?: (device: Device, port: number) => void
}) {
  const spec = DEVICE_TYPES[device.type]
  const copper = Math.max(0, device.ports - (device.sfp ?? 0))
  const rack = layout?.racks.find((r) => r.id === device.rackId)
  const cables = layout?.links.filter(
    (l) => l.a.deviceId === device.id || l.b.deviceId === device.id,
  )

  const portLinkFor = (index: number) =>
    layout?.links.find(
      (l) =>
        l.kind === 'network' &&
        ((l.a.deviceId === device.id && l.a.port === index) ||
          (l.b.deviceId === device.id && l.b.port === index)),
    )

  // A plain column, not a scroller: every host already scrolls, and a scroller inside a scroller
  // clipped the panel title and let the rack summary land on top of the ports.
  return (
    <View style={styles.body}>
      <Mono size={8}>
        {[
          sizeLabel(device.heightU),
          spec.label.toUpperCase(),
          rack?.name.toUpperCase(),
          device.face.toUpperCase(),
          `U${device.posU + 1}`,
        ].join(' · ')}
      </Mono>

      {/* Duplicate, Template and Delete sit here rather than at the end: on a phone in landscape
          the panel scrolls, and Delete was below the fold of a long inspector. */}
      <View style={styles.actions}>
        {onDuplicate ? <Button label="Duplicate" tone="soft" onPress={onDuplicate} /> : null}
        {onSaveTemplate ? <Button label="Template" onPress={onSaveTemplate} /> : null}
        {onDelete ? <Button label="Delete" tone="danger" onPress={onDelete} /> : null}
      </View>

      <TextField label="Name" value={device.name} onChange={(name) => onChange({ name })} />

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Colour</Text>
        <View style={styles.swatches}>
          {COLOURS.slice(0, 6).map((swatch) => (
            <Pressable
              key={swatch}
              accessibilityRole="button"
              accessibilityLabel={`Colour ${swatch}`}
              accessibilityState={{ selected: swatch === device.colour }}
              onPress={() => onChange({ colour: swatch })}
              style={[styles.swatchRing, swatch === device.colour && styles.swatchRingOn]}
            >
              <View style={[styles.swatch, { backgroundColor: swatch }]} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.tiles}>
        <StatTile caption="Watts" value={String(device.watts)} />
        <StatTile caption="Weight" value={`${device.weightKg} kg`} />
        {spec.maxPorts > 0 ? <StatTile caption="Ports" value={String(device.ports)} /> : null}
      </View>

      {spec.maxPorts > 0 ? (
        <>
          <Mono size={7.5} tone={colour.icon}>
            PORTS · TAP TO CONNECT
          </Mono>
          <View style={styles.ports}>
            {Array.from({ length: device.ports }, (_, index) => {
              const link = portLinkFor(index)
              return (
                <Pressable
                  key={index}
                  testID={`inspector-port-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Port ${index + 1}${link ? ', connected' : ', free'}`}
                  onPress={() => onPortPress?.(device, index)}
                  style={[styles.portTile, link && styles.portTileTaken]}
                >
                  <Text style={styles.portNumber}>{String(index + 1).padStart(2, '0')}</Text>
                  <Mono size={6.5} tone={link ? colour.icon : colour.muted} weight="medium">
                    {link ? 'Taken' : 'Free'}
                  </Mono>
                </Pressable>
              )
            })}
          </View>
        </>
      ) : null}

      <View style={styles.fields}>
        {spec.maxPorts > 0 ? (
          <NumberField
            label="Network ports"
            value={device.ports}
            onChange={(ports) => onChange({ ports: Math.min(spec.maxPorts, Math.max(0, ports)) })}
          />
        ) : null}
        {spec.maxPorts > 0 ? (
          <NumberField
            label="Of which SFP"
            value={device.sfp ?? 0}
            onChange={(sfp) => onChange({ sfp: Math.min(device.ports, Math.max(0, sfp)) })}
          />
        ) : null}
        {spec.maxOutlets > 0 ? (
          <NumberField
            label="Power outlets"
            value={device.outlets}
            onChange={(outlets) =>
              onChange({ outlets: Math.min(spec.maxOutlets, Math.max(0, outlets)) })
            }
          />
        ) : null}
        <NumberField
          label="Power (W)"
          value={device.watts}
          onChange={(watts) => onChange({ watts })}
        />
        <NumberField
          label="Weight (kg)"
          value={device.weightKg}
          onChange={(weightKg) => onChange({ weightKg })}
        />
      </View>

      {/*
       * A switch is rarely all one speed — eight 2.5G copper and two 10G cages is an ordinary
       * shape — and a port count alone cannot say that.
       */}
      {spec.maxPorts > 0 && copper > 0 ? (
        <SpeedRow
          label={`Copper (${copper})`}
          value={device.portSpeed}
          onChange={(portSpeed) => onChange({ portSpeed })}
        />
      ) : null}
      {spec.maxPorts > 0 && (device.sfp ?? 0) > 0 ? (
        <SpeedRow
          label={`SFP (${device.sfp})`}
          value={device.sfpSpeed}
          onChange={(sfpSpeed) => onChange({ sfpSpeed })}
        />
      ) : null}

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Height</Text>
        <View style={styles.chips}>
          {UNIT_SIZES.filter((size) => spec.sizes.includes(size)).map((size) => (
            <Pressable
              key={size}
              accessibilityRole="button"
              accessibilityLabel={`Height ${sizeLabel(size)}`}
              accessibilityState={{ selected: size === device.heightU }}
              onPress={() => onChange({ heightU: size })}
              style={[styles.chip, size === device.heightU && styles.chipOn]}
            >
              <Text style={[styles.chipText, size === device.heightU && styles.chipTextOn]}>
                {sizeLabel(size)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <TextField label="Notes" value={device.notes} onChange={(notes) => onChange({ notes })} />

      {cables ? (
        <View style={styles.row}>
          <Mono size={7.5} tone={colour.icon}>
            CONNECTIONS
          </Mono>
          {cables.length === 0 ? <Text style={styles.empty}>Tap a port to connect it.</Text> : null}
          {cables.map((link) => {
            const near = link.a.deviceId === device.id ? link.a : link.b
            const far = otherEnd(link, near)
            const farName = layout?.devices.find((d) => d.id === far.deviceId)?.name ?? far.deviceId
            return (
              <View key={link.id} testID={`inspector-cable-${link.id}`} style={styles.cable}>
                <View style={[styles.cableBar, { backgroundColor: link.colour }]} />
                <View style={styles.cableText}>
                  <Text style={styles.cableTitle}>
                    Port {near.port + 1} ⇄ {farName} · {far.port + 1}
                  </Text>
                  <Mono size={7} tone={colour.muted} weight="medium">
                    {link.kind === 'power' ? 'POWER' : link.cableType.toUpperCase()}
                    {link.label ? `  ${link.label}` : ''}
                  </Mono>
                </View>
              </View>
            )
          })}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  body: { gap: 14, paddingBottom: 28 },
  row: { gap: 8 },
  rowLabel: { fontFamily: font.ui, fontSize: 12, color: colour.textSecondary },
  swatches: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  swatchRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchRingOn: { borderColor: colour.accent },
  swatch: { width: 26, height: 26, borderRadius: 13 },
  tiles: { flexDirection: 'row', gap: 8 },
  ports: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  portTile: {
    minWidth: 52,
    minHeight: TOUCH,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colour.borderInput,
    backgroundColor: colour.surface,
  },
  portTileTaken: { backgroundColor: colour.sunkenSoft, borderColor: colour.borderSoft },
  portNumber: { fontFamily: font.uiBold, fontSize: 12.5, color: colour.text },
  fields: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    minHeight: 34,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colour.borderInput,
    backgroundColor: colour.surface,
  },
  chipOn: { borderColor: colour.accent, backgroundColor: colour.accentSoft },
  chipText: { fontFamily: font.ui, fontSize: 12, color: colour.textSecondary },
  chipTextOn: { fontFamily: font.uiBold, color: colour.accent },
  empty: { fontFamily: font.ui, fontSize: 12, color: colour.muted },
  cable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: radius.button,
    backgroundColor: colour.sunkenSoft,
  },
  cableBar: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  cableText: { flex: 1, gap: 2 },
  cableTitle: { fontFamily: font.ui, fontSize: 12.5, color: colour.text },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
})
