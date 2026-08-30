// Server mode talks to a plain-HTTP address on the local network. Neither
// `android:usesCleartextTraffic` nor `android:networkSecurityConfig` is an app.json key — only a
// config plugin (or a hand-edited native project) can set them — so this plugin writes both, and
// the iOS ATS keys alongside, at prebuild time.
const { withAndroidManifest, withInfoPlist, withDangerousMod } = require('@expo/config-plugins')
const fs = require('node:fs')
const path = require('node:path')

const NETWORK_SECURITY_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <!-- Cleartext only to private ranges: a PlanMyRack server on your own network. -->
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">10.0.0.0/8</domain>
    <domain includeSubdomains="true">172.16.0.0/12</domain>
    <domain includeSubdomains="true">192.168.0.0/16</domain>
    <domain includeSubdomains="true">localhost</domain>
  </domain-config>
  <base-config cleartextTrafficPermitted="false" />
</network-security-config>
`

/** Exported so the transform can be unit-tested without running a prebuild. */
function applyAndroid(manifest) {
  const application = manifest.manifest.application[0]
  application.$['android:usesCleartextTraffic'] = 'true'
  application.$['android:networkSecurityConfig'] = '@xml/network_security_config'
  return manifest
}

function applyInfoPlist(infoPlist) {
  infoPlist.NSAppTransportSecurity = {
    ...(infoPlist.NSAppTransportSecurity ?? {}),
    NSAllowsLocalNetworking: true,
  }
  infoPlist.NSLocalNetworkUsageDescription =
    'PlanMyRack connects to a PlanMyRack server on your local network so several devices can share the same rack layouts.'
  return infoPlist
}

const withLocalNetwork = (config) => {
  let next = withAndroidManifest(config, (mod) => {
    mod.modResults = applyAndroid(mod.modResults)
    return mod
  })

  next = withInfoPlist(next, (mod) => {
    mod.modResults = applyInfoPlist(mod.modResults)
    return mod
  })

  return withDangerousMod(next, [
    'android',
    (mod) => {
      const dir = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/res/xml')
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, 'network_security_config.xml'), NETWORK_SECURITY_CONFIG)
      return mod
    },
  ])
}

module.exports = withLocalNetwork
module.exports.__applyAndroid = applyAndroid
module.exports.__applyInfoPlist = applyInfoPlist
module.exports.__networkSecurityConfig = NETWORK_SECURITY_CONFIG
