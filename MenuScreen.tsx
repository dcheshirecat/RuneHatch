import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { RUNE_SYMBOLS, SPRITES } from '../data/gameData';

const { width, height } = Dimensions.get('window');

interface FloatingRune {
  id: number;
  symbol: string;
  x: number;
  y: number;
  size: number;
  anim: Animated.Value;
}

export default function MenuScreen() {
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(20)).current;
  const eyebrowOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const eggAnim = useRef(new Animated.Value(0)).current;

  const [runes, setRunes] = useState<FloatingRune[]>([]);

  useEffect(() => {
    // Generate floating runes
    const generated: FloatingRune[] = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      symbol: RUNE_SYMBOLS[Math.floor(Math.random() * RUNE_SYMBOLS.length)],
      x: Math.random() * width,
      y: Math.random() * height,
      size: 12 + Math.random() * 20,
      anim: new Animated.Value(0),
    }));
    setRunes(generated);

    // Animate runes
    generated.forEach((r) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(r.anim, {
            toValue: 1,
            duration: 4000 + Math.random() * 4000,
            useNativeDriver: true,
          }),
          Animated.timing(r.anim, {
            toValue: 0,
            duration: 4000 + Math.random() * 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Egg float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(eggAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(eggAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Staggered entrance animations
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(eyebrowOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(titleY, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(buttonsOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const eggTranslateY = eggAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0710" />
      <LinearGradient
        colors={['#1a0a2e', '#0a0710', '#0d1a2e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating runes */}
      {runes.map((r) => (
        <Animated.Text
          key={r.id}
          style={[
            styles.floatingRune,
            {
              left: r.x,
              top: r.y,
              fontSize: r.size,
              opacity: r.anim.interpolate({ inputRange: [0, 1], outputRange: [0.04, 0.14] }),
              transform: [
                {
                  translateY: r.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -16] }),
                },
              ],
            },
          ]}
        >
          {r.symbol}
        </Animated.Text>
      ))}

      {/* Main content */}
      <View style={styles.content}>
        <Animated.Image
          source={SPRITES['egg_void']}
          style={[styles.egg, { transform: [{ translateY: eggTranslateY }] }]}
          resizeMode="contain"
        />

        <Animated.Text style={[styles.eyebrow, { opacity: eyebrowOpacity }]}>
          AN ANCIENT WORLD AWAITS
        </Animated.Text>

        <Animated.Text
          style={[styles.title, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}
        >
          Runehatch
        </Animated.Text>

        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Breed the Legend. Battle the World.
        </Animated.Text>

        <Animated.View style={[styles.buttons, { opacity: buttonsOpacity }]}>
          <TouchableOpacity onPress={() => router.push('/map')} activeOpacity={0.8}>
            <LinearGradient
              colors={['#6a0dad', '#9b5de5']}
              style={styles.btnPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.btnPrimaryText}>BEGIN JOURNEY</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.7}>
            <Text style={styles.btnSecondaryText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.7}>
            <Text style={styles.btnSecondaryText}>Codex</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Text style={styles.footer}>ᚠ RUNEHATCH ᚠ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0710',
  },
  floatingRune: {
    position: 'absolute',
    color: '#c9b4ff',
    fontFamily: 'CinzelDecorative_400Regular',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 0,
  },
  egg: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  eyebrow: {
    color: '#9b7de8',
    fontSize: 10,
    letterSpacing: 5,
    fontFamily: 'CinzelDecorative_400Regular',
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 52,
    fontFamily: 'CinzelDecorative_900Black',
    color: '#e8d97a',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 60,
  },
  tagline: {
    fontFamily: 'CrimsonPro_300Light_Italic',
    fontSize: 15,
    color: '#a898c8',
    letterSpacing: 1.5,
    marginBottom: 48,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  btnPrimary: {
    paddingVertical: 16,
    paddingHorizontal: 52,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#c9a0ff44',
  },
  btnPrimaryText: {
    color: '#f0e8ff',
    fontFamily: 'CinzelDecorative_400Regular',
    fontSize: 12,
    letterSpacing: 3,
    textAlign: 'center',
  },
  btnSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: '#ffffff22',
    borderRadius: 2,
  },
  btnSecondaryText: {
    color: '#a898c8',
    fontFamily: 'CrimsonPro_400Regular',
    fontSize: 15,
    letterSpacing: 2,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    color: '#ffffff22',
    fontSize: 10,
    letterSpacing: 4,
    fontFamily: 'CinzelDecorative_400Regular',
  },
});
