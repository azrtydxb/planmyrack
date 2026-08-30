import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar'
import { BrandSplash } from '../src/ui/BrandMark'
import { StoreProvider } from '../src/storage/StoreProvider'
import { useAppFonts } from '../src/ui/fonts'
import { colour, font } from '../src/ui/theme'

export default function RootLayout() {
  const fontsLoaded = useAppFonts()

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colour.appBg }}>
      <StoreProvider>
        <StatusBar style="dark" />
        {fontsLoaded ? (
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colour.surface },
              headerTintColor: colour.text,
              headerTitleStyle: { fontFamily: font.uiBold, fontSize: 16 },
              contentStyle: { backgroundColor: colour.appBg },
            }}
          >
            {/* Both screens draw their own branded header; a navigator title would repeat it. */}
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ title: 'Settings' }} />
            <Stack.Screen name="rack/[id]" options={{ headerShown: false }} />
          </Stack>
        ) : (
          <BrandSplash message="LOADING" />
        )}
      </StoreProvider>
    </GestureHandlerRootView>
  )
}
