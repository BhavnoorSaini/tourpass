import { StyleSheet } from 'react-native';

const display = 'Newsreader_400Regular';
const displayMedium = 'Newsreader_500Medium';
const sans = 'DMSans_400Regular';
const sansMedium = 'DMSans_500Medium';
const sansBold = 'DMSans_700Bold';

export const typography = StyleSheet.create({
  // ─── Display ─────────────────────────────────────────────────────────────
  displayXL: {
    fontFamily: displayMedium,
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1.5,
  },
  displayL: {
    fontFamily: display,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.0,
  },
  displayM: {
    fontFamily: display,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.6,
  },

  // ─── Headings ────────────────────────────────────────────────────────────
  headingL: {
    fontFamily: display,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  headingM: {
    fontFamily: display,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  headingS: {
    fontFamily: sansMedium,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.1,
  },

  // ─── Body ─────────────────────────────────────────────────────────────────
  bodyL: {
    fontFamily: sans,
    fontSize: 17,
    lineHeight: 26,
    letterSpacing: 0,
  },
  bodyM: {
    fontFamily: sans,
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  bodyS: {
    fontFamily: sans,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  // ─── Labels ───────────────────────────────────────────────────────────────
  labelM: {
    fontFamily: sansMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  labelS: {
    fontFamily: sansMedium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.0,
    textTransform: 'uppercase',
  },

  // ─── Interactive ──────────────────────────────────────────────────────────
  buttonL: {
    fontFamily: sansMedium,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  buttonM: {
    fontFamily: sansMedium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
});
