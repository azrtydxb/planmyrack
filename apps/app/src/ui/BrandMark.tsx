import { Image, StyleSheet, Text, View } from 'react-native'
import { colour, font, radius } from './theme'

// The artwork in assets/brand, derived into the app's icon set.
const MARK = require('../../assets/splash-mark.png')

/** The app icon as a rounded square, the way the design places it beside the layout name. */
export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <View
      testID="brand-mark"
      accessibilityRole="image"
      accessibilityLabel="PlanMyRack"
      style={[styles.frame, { width: size, height: size, borderRadius: size * 0.29 }]}
    >
      <Image source={MARK} style={styles.image} resizeMode="cover" />
    </View>
  )
}

/** Shown while fonts and the store are still loading, so the app never flashes an empty screen. */
export function BrandSplash({ message }: { message?: string }) {
  return (
    <View testID="brand-splash" style={styles.splash}>
      <BrandMark size={96} />
      <Text style={styles.wordmark}>PlanMyRack</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: '#0b1020',
    borderWidth: 1,
    borderColor: 'rgba(22,32,44,0.12)',
  },
  image: { width: '100%', height: '100%' },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: colour.appBg,
  },
  wordmark: { fontFamily: font.uiBold, fontSize: 22, color: colour.text, letterSpacing: -0.3 },
  message: { fontFamily: font.mono, fontSize: 9, letterSpacing: 1, color: colour.icon },
})

export { radius }
