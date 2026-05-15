import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  CinzelDecorative_400Regular,
  CinzelDecorative_700Bold,
  CinzelDecorative_900Black,
} from '@expo-google-fonts/cinzel-decorative';
import {
  CrimsonPro_300Light,
  CrimsonPro_300Light_Italic,
  CrimsonPro_400Regular,
} from '@expo-google-fonts/crimson-pro';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CinzelDecorative_400Regular,
    CinzelDecorative_700Bold,
    CinzelDecorative_900Black,
    CrimsonPro_300Light,
    CrimsonPro_300Light_Italic,
    CrimsonPro_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="map" />
    </Stack>
  );
}
