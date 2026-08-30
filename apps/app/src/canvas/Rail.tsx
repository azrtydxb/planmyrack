import { StyleSheet, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { RAIL_PX, U_PX } from './metrics'
import { rack as hw } from '../ui/theme'

/** Mounting rail: a metal gradient with a screw hole per unit, as the design draws it. */
export function Rail({ units }: { units: number }) {
  return (
    <LinearGradient
      colors={[hw.railLight, hw.railDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.rail, { height: units * U_PX }]}
    >
      {Array.from({ length: units }, (_, i) => (
        <View key={i} style={styles.slot}>
          <View style={styles.screw} />
        </View>
      ))}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  rail: { width: RAIL_PX },
  slot: { height: U_PX, alignItems: 'center', justifyContent: 'center' },
  screw: { width: 4.4, height: 4.4, borderRadius: 2.2, backgroundColor: hw.screw },
})
