import { Circle, G, Line, Path, Rect } from 'react-native-svg'
import type { DeviceType } from '@planmyrack/core'

/**
 * Schematic faceplates. The point is telling gear apart at a glance in a rack elevation —
 * hooks must not look like a brush, and neither like a blank panel.
 */
export function DeviceArt({
  type,
  width,
  height,
}: {
  type: DeviceType
  width: number
  height: number
}) {
  const mid = height / 2
  const inset = 6

  switch (type) {
    case 'hooks': {
      const count = Math.max(3, Math.floor(width / 60))
      const step = (width - inset * 2) / count
      return (
        <G opacity={0.9}>
          {Array.from({ length: count }, (_, i) => {
            const x = inset + step * (i + 0.5)
            return (
              <Path
                key={i}
                d={`M ${x - step * 0.28} ${mid - height * 0.22} L ${x - step * 0.28} ${mid + height * 0.1} A ${step * 0.28} ${step * 0.28} 0 0 0 ${x + step * 0.28} ${mid + height * 0.1} L ${x + step * 0.28} ${mid - height * 0.22}`}
                stroke="#e6ecff"
                strokeWidth={2}
                fill="none"
              />
            )
          })}
        </G>
      )
    }
    case 'brush': {
      const bristles = Math.max(12, Math.floor(width / 6))
      const step = (width - inset * 2) / bristles
      return (
        <G opacity={0.85}>
          <Rect
            x={inset}
            y={mid - height * 0.2}
            width={width - inset * 2}
            height={height * 0.4}
            fill="#0f172a"
          />
          {Array.from({ length: bristles }, (_, i) => (
            <Line
              key={i}
              x1={inset + i * step}
              y1={mid - height * 0.18}
              x2={inset + i * step}
              y2={mid + height * 0.18}
              stroke="#e6ecff"
              strokeWidth={1}
            />
          ))}
        </G>
      )
    }
    case 'shelf':
      return (
        <G opacity={0.8}>
          <Line x1={inset} y1={mid} x2={width - inset} y2={mid} stroke="#e6ecff" strokeWidth={2} />
          <Line
            x1={inset}
            y1={mid + 5}
            x2={width - inset}
            y2={mid + 5}
            stroke="#e6ecff"
            strokeWidth={1}
            strokeDasharray="6 4"
          />
        </G>
      )
    case 'blank':
      return (
        <G opacity={0.5}>
          <Line
            x1={inset}
            y1={mid}
            x2={width - inset}
            y2={mid}
            stroke="#93a0c0"
            strokeWidth={1}
            strokeDasharray="2 6"
          />
        </G>
      )
    case 'pdu': {
      const outlets = Math.max(4, Math.floor(width / 48))
      const step = (width - inset * 2) / outlets
      return (
        <G>
          {Array.from({ length: outlets }, (_, i) => (
            <Circle
              key={i}
              cx={inset + step * (i + 0.5)}
              cy={mid}
              r={Math.min(6, height / 3)}
              stroke="#e6ecff"
              strokeWidth={1.5}
              fill="none"
            />
          ))}
        </G>
      )
    }
    case 'ups':
      return (
        <G>
          <Path
            d={`M ${inset + 6} ${mid - 8} l 10 0 l -6 8 l 8 0 l -12 12 l 3 -10 l -7 0 Z`}
            fill="#e6ecff"
            opacity={0.9}
          />
        </G>
      )
    default:
      return null
  }
}
