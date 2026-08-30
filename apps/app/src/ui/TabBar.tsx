import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, Path, Rect } from 'react-native-svg'
import { TOUCH, colour, font } from './theme'

export type TabKey = 'racks' | 'cables' | 'library' | 'stats' | 'settings'

const ICONS: Record<TabKey, (tint: string) => React.ReactNode> = {
  racks: (tint) => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Rect x={4} y={2.5} width={12} height={15} rx={2} stroke={tint} strokeWidth={1.7} />
      <Path d="M7 6.5h6M7 10h6M7 13.5h6" stroke={tint} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  ),
  cables: (tint) => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Circle cx={5} cy={5} r={2.3} stroke={tint} strokeWidth={1.7} />
      <Circle cx={15} cy={15} r={2.3} stroke={tint} strokeWidth={1.7} />
      <Path d="M5 7.3 C 5 13.5, 15 6.5, 15 12.7" stroke={tint} strokeWidth={1.7} fill="none" />
    </Svg>
  ),
  library: (tint) => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Rect x={3} y={3} width={6} height={6} rx={1.5} stroke={tint} strokeWidth={1.7} />
      <Rect x={11} y={3} width={6} height={6} rx={1.5} stroke={tint} strokeWidth={1.7} />
      <Rect x={3} y={11} width={6} height={6} rx={1.5} stroke={tint} strokeWidth={1.7} />
      <Rect x={11} y={11} width={6} height={6} rx={1.5} stroke={tint} strokeWidth={1.7} />
    </Svg>
  ),
  stats: (tint) => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path d="M4 16V9M10 16V4M16 16v-5" stroke={tint} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  ),
  settings: (tint) => (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Circle cx={10} cy={10} r={2.6} stroke={tint} strokeWidth={1.7} />
      <Path
        d="M10 2.6v2M10 15.4v2M2.6 10h2M15.4 10h2M4.8 4.8l1.4 1.4M13.8 13.8l1.4 1.4M15.2 4.8l-1.4 1.4M6.2 13.8l-1.4 1.4"
        stroke={tint}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  ),
}

const LABELS: Record<TabKey, string> = {
  racks: 'Racks',
  cables: 'Cables',
  library: 'Library',
  stats: 'Stats',
  settings: 'Settings',
}

export const TAB_ORDER: TabKey[] = ['racks', 'cables', 'library', 'stats', 'settings']

/** Bottom tabs on phones; the same set becomes an icon rail on tablet and desktop. */
export function TabBar({
  active,
  onChange,
  rail = false,
}: {
  active: TabKey
  onChange: (tab: TabKey) => void
  rail?: boolean
}) {
  return (
    <View testID={rail ? 'icon-rail' : 'tab-bar'} style={rail ? styles.rail : styles.bar}>
      {TAB_ORDER.map((tab) => {
        const on = tab === active
        const tint = on ? colour.accent : colour.icon
        return (
          <Pressable
            key={tab}
            testID={`tab-${tab}`}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={LABELS[tab]}
            onPress={() => onChange(tab)}
            style={[rail ? styles.railItem : styles.item, rail && on && styles.railItemOn]}
          >
            {ICONS[tab](tint)}
            {rail ? null : <Text style={[styles.label, on && styles.labelOn]}>{LABELS[tab]}</Text>}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colour.surface,
    borderTopWidth: 1,
    borderTopColor: colour.borderSoft,
    paddingTop: 8,
    paddingBottom: 20,
  },
  item: { flex: 1, alignItems: 'center', gap: 3, minHeight: TOUCH },
  label: { fontFamily: font.ui, fontSize: 9.5, color: colour.icon },
  labelOn: { fontFamily: font.uiBold, color: colour.accent },
  rail: {
    width: 56,
    backgroundColor: colour.surface,
    borderRightWidth: 1,
    borderRightColor: colour.borderSoft,
    paddingVertical: 12,
    gap: 6,
    alignItems: 'center',
  },
  railItem: {
    width: TOUCH,
    height: TOUCH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  railItemOn: { backgroundColor: colour.accentSoft },
})
