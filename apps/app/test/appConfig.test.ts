import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PNG } from 'pngjs'
import config from '../app.json'
// The plugin exports its transforms for testing; the module is plain JS with no types.
const withLocalNetwork = require('../plugins/withLocalNetwork') as {
  __applyAndroid: (manifest: { manifest: { application: { $: Record<string, string> }[] } }) => {
    manifest: { application: { $: Record<string, string> }[] }
  }
  __applyInfoPlist: (plist: Record<string, never> | object) => {
    NSAppTransportSecurity: { NSAllowsLocalNetworking: boolean }
    NSLocalNetworkUsageDescription: string
  }
  __networkSecurityConfig: string
}

const readAsset = (name: string): PNG =>
  PNG.sync.read(readFileSync(join(__dirname, '..', 'assets', name)))

const alphaInBorder = (png: PNG, margin: number): number => {
  let found = 0
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const inBorder =
        x < margin || y < margin || x >= png.width - margin || y >= png.height - margin
      if (inBorder && png.data[(png.width * y + x) * 4 + 3]! > 8) found++
    }
  }
  return found
}

describe('TestExpoConfigDeclaresLocalNetworking', () => {
  it('registers the local-network config plugin', () => {
    expect(config.expo.plugins).toContain('./plugins/withLocalNetwork')
  })

  it('writes usesCleartextTraffic and the security config into the Android manifest', () => {
    // These are NOT app.json keys — only a config plugin can set them, so assert its output.
    const manifest = { manifest: { application: [{ $: {} as Record<string, string> }] } }
    const out = withLocalNetwork.__applyAndroid(manifest)
    const application = out.manifest.application[0]!.$
    expect(application['android:usesCleartextTraffic']).toBe('true')
    expect(application['android:networkSecurityConfig']).toBe('@xml/network_security_config')
  })

  it('permits cleartext only to private ranges, never to the whole internet', () => {
    const xml = withLocalNetwork.__networkSecurityConfig
    expect(xml).toContain('192.168.0.0/16')
    expect(xml).toContain('10.0.0.0/8')
    expect(xml).toContain('<base-config cleartextTrafficPermitted="false" />')
  })

  it('allows local networking on iOS and explains why', () => {
    const plist = withLocalNetwork.__applyInfoPlist({})
    expect(plist.NSAppTransportSecurity.NSAllowsLocalNetworking).toBe(true)
    expect(plist.NSLocalNetworkUsageDescription).toMatch(/server/i)
  })

  it('answers the export-compliance question up front', () => {
    // without this, App Store Connect asks on every single submission
    expect(config.expo.ios.infoPlist.ITSAppUsesNonExemptEncryption).toBe(false)
  })

  it('carries the identity a store submission needs', () => {
    expect(config.expo.ios.bundleIdentifier).toBe('com.azrty.planmyrack')
    expect(config.expo.android.package).toBe('com.azrty.planmyrack')
    expect(config.expo.name).toBe('PlanMyRack')
    expect(config.expo.icon).toBe('./assets/icon.png')
    expect(config.expo.splash.image).toBe('./assets/splash-icon.png')
  })
})

describe('TestDerivedIconsMeetStoreRules', () => {
  it('ships an opaque 1024x1024 iOS icon — the App Store rejects alpha', () => {
    const icon = readAsset('icon.png')
    expect([icon.width, icon.height]).toEqual([1024, 1024])
    for (let i = 3; i < icon.data.length; i += 4) {
      expect(icon.data[i]).toBe(255)
    }
  })

  it('keeps the adaptive-icon foreground inside the central safe zone', () => {
    const fg = readAsset('android-icon-foreground.png')
    // the launcher mask crops the outer ~17%; nothing may be drawn there
    expect(alphaInBorder(fg, Math.floor(fg.width * 0.17))).toBe(0)
  })

  it('ships a favicon small enough to read', () => {
    expect(readAsset('favicon.png').width).toBeLessThanOrEqual(64)
  })
})
