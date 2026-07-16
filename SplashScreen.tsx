import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';
import Logo from '../components/Logo';
import TransEatWordmark from '../components/TransEatWordmark';
import BurgerSVG from '../components/BurgerSVG'; // Your burger SVG component

const SplashScreen = ({ onGetStarted, onPartner }: { onGetStarted: () => void; onPartner: () => void }) => {
  const { width, height } = useWindowDimensions();
  const isSmall = width < 375;
  const isLarge = width > 768;

  const logoSize = isSmall ? 90 : isLarge ? 150 : 120;
  const wordmarkWidth = isSmall ? 160 : isLarge ? 280 : 200;
  const wordmarkHeight = isSmall ? 52 : isLarge ? 90 : 65;
  const taglineSize = isSmall ? 11 : isLarge ? 14 : 12;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const wordSlideAnim = useRef(new Animated.Value(-30)).current;
  const wordOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      // Burger logo pops in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
      ]),
      // Wordmark slides in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]),
      // Moving words animation for tagline
      Animated.parallel([
        Animated.timing(wordSlideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(wordOpacityAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous floating animation for burger
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(floatAnim, {
          toValue: 8,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
  }, []);

  // Moving words data - words that animate in sequentially
  const words = ["Order", "before", "you", "arrive.", "Eat", "when", "you", "get", "there."];
  const wordAnims = useRef(words.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Staggered word-by-word animation
    const animations = wordAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 150 + 1200, // Start after logo animations
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      })
    );
    Animated.stagger(100, animations).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background ember glow orbs */}
      <View style={[styles.orbTopRight, isLarge && { width: 300, height: 300 }]} />
      <View style={[styles.orbBottomLeft, isLarge && { width: 220, height: 220 }]} />

      {/* Center glass card */}
      <View style={styles.center}>
        <View style={[styles.glassCard, isLarge && { maxWidth: 380, paddingVertical: 52 }]}>
          {/* Burger logo container with floating animation */}
          <Animated.View 
            style={[
              styles.logoWrap, 
              { 
                width: logoSize * 1.1, 
                height: logoSize * 1.1, 
                borderRadius: logoSize * 0.22,
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: floatAnim },
                ],
              }
            ]}
          >
            <BurgerSVG width={logoSize * 1.12} height={logoSize * 1.12} />
          </Animated.View>

          {/* TransEat Wordmark SVG with slide animation */}
          <Animated.View 
            style={[
              styles.wordmarkWrap,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <TransEatWordmark width={wordmarkWidth} height={wordmarkHeight} />
          </Animated.View>

          {/* Moving words tagline */}
          <View style={styles.taglineContainer}>
            <View style={styles.wordsRow}>
              {words.slice(0, 4).map((word, index) => (
                <Animated.Text
                  key={`word1-${index}`}
                  style={[
                    styles.movingWord,
                    { 
                      fontSize: taglineSize,
                      opacity: wordAnims[index],
                      transform: [{
                        translateY: wordAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      }],
                    },
                  ]}
                >
                  {word}
                </Animated.Text>
              ))}
            </View>
            <View style={styles.wordsRow}>
              {words.slice(4).map((word, index) => (
                <Animated.Text
                  key={`word2-${index}`}
                  style={[
                    styles.movingWord,
                    { 
                      fontSize: taglineSize,
                      opacity: wordAnims[index + 4],
                      transform: [{
                        translateY: wordAnims[index + 4].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      }],
                    },
                  ]}
                >
                  {word}
                </Animated.Text>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Bottom buttons */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.button, isLarge && { maxWidth: 400 }]}
          onPress={onGetStarted}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, isLarge && { fontSize: 17 }]}>Get Started</Text>
        </TouchableOpacity>

        {/* Partner link */}
        <TouchableOpacity onPress={onPartner} style={styles.partnerLink}>
          <Text style={styles.partnerText}>Restaurant Partner?</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>TransEat Zambia Ltd</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12%',
    paddingBottom: 0,
    overflow: 'hidden',
  },
  orbTopRight: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(203,38,2,0.18)',
    shadowColor: '#CB2602',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 60,
    elevation: 0,
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: '22%',
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(249,128,21,0.12)',
    shadowColor: '#f98015',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 50,
    elevation: 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 2,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 40,
    paddingHorizontal: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 48,
    elevation: 20,
  },
  logoWrap: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
    overflow: 'hidden',
    padding: 0,
  },
  wordmarkWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  taglineContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  wordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 2,
  },
  movingWord: {
    color: 'rgba(255,255,255,0.42)',
    fontWeight: '400',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  bottom: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 32,
    zIndex: 2,
  },
  button: {
    backgroundColor: 'rgba(203,38,2,0.85)',
    width: '100%',
    maxWidth: 340,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#CB2602',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  partnerLink: {
    marginTop: 14,
    padding: 8,
  },
  partnerText: {
    color: '#f98015',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  footer: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
    marginTop: 14,
    letterSpacing: 1,
  },
});

export default SplashScreen;