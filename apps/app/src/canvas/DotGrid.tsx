import Svg, { Circle } from 'react-native-svg'
import { StyleSheet } from 'react-native'
import { colour } from '../ui/theme'

const STEP = 16

/** The dotted workspace behind the racks. */
export function DotGrid({ width, height }: { width: number; height: number }) {
  const dots = []
  for (let y = STEP; y < height; y += STEP) {
    for (let x = STEP; x < width; x += STEP) {
      dots.push(
        <Circle key={`${x}-${y}`} cx={x} cy={y} r={0.8} fill={colour.icon} opacity={0.45} />,
      )
    }
  }
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots}
    </Svg>
  )
}
