## How should the app get onto a real iPad?

`react-native-view-shot` is not bundled in Expo Go, so the scan-a-QR route is out: the
app needs a build that contains its own native modules. EAS reports no Apple team on
the azrty account, so nothing is registered yet.

- Apple Developer Program ($99/yr), then EAS internal distribution: register the iPad
  with `eas device:create`, build `--profile device`, install from the link EAS returns.
  Over the air, no cable, the build keeps working.
- Apple Developer Program, then TestFlight: same membership, an App Store Connect
  record, and installs through the TestFlight app. The route a real release takes.
- Free Apple ID and Xcode over a cable: no membership, but the build stops working
  after 7 days and has to be reinstalled from this Mac each time.
- Skip the install for now and open the web build on the iPad in Safari, which is
  already being served on the LAN.
