import { StyleSheet, Text, View } from 'react-native'
import { SCALE_PX, U_PX } from './metrics'
import { theme } from '../ui/theme'

/** Unit numbers down both edges, counting from 1 at the bottom as a real rack does. */
export function UScale({ units }: { units: number }) {
  return (
    <View style={styles.scale}>
      {Array.from({ length: units }, (_, i) => units - i).map((u) => (
        <View key={u} style={styles.cell}>
          <Text style={styles.text}>{u}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  scale: { width: SCALE_PX },
  cell: { height: U_PX, justifyContent: 'center', alignItems: 'center' },
  text: { color: theme.dim, fontSize: 10, fontVariant: ['tabular-nums'] },
})
