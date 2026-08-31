## The EAS free plan is out of iOS builds — how should the next one be made?

The pinch fix is built and installable. The tap-to-select fix, the SFP split, the port
speeds and the board-needs-a-tray rule are committed and green but not in any build.
EAS reports the free plan's iOS builds exhausted, resetting in ~14 hours (1 Sep).

- Wait for the quota to reset, then build on EAS as usual.
- Build locally with `eas build --local`, which uses this Mac's Xcode and no cloud
  quota. It writes several GB into DerivedData on a volume with ~12 GB free, and the
  .ipa has to reach the iPad over a cable rather than a link.
- Upgrade the EAS plan, which lifts the limit immediately.
