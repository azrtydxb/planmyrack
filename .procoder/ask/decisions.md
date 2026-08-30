# Open decisions — planmyrack

## OPEN: Trigger the first EAS build, and for which platform?

State: the Expo project is linked and owned by the org (@azrtydxb/planmyrack, id
fb484982-4a6f-4409-9041-2275076ce91a), app.json carries the icons, splash and the
local-network config plugin, and eas.json defines development / preview / production
profiles. No build has ever been run.

Why it is the user's call: `eas build` runs in Expo's cloud, is billed against the
organisation's plan, and iOS additionally needs an Apple Developer account ($99/yr)
attached to the organisation — an EAS org does not inherit a personal one.

- Android preview only — builds an APK, needs no Apple account, quickest way to hold the
  app on a device.
- Both platforms preview — Android APK plus an iOS simulator build; the iOS half prompts
  for Apple credentials.
- Neither yet — leave building to the user; the configuration is already in place.
