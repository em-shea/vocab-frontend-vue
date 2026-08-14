import { createI18n } from 'vue-i18n'
import en from './en'
import cn from './cn'

// Interface language: which language the chrome is written in.
//
// Deliberately separate from the character set (simplified vs traditional),
// which governs how *study content* renders. The Vue 2 app had only the
// character set and mixed the two ideas; keeping them apart means a learner can
// read an English interface while studying traditional characters, or a Chinese
// interface while studying simplified.
//
// `legacy: false` selects the composition API, so components use `useI18n()`
// rather than `this.$t`.

export const SUPPORTED = ['en', 'cn']

export function normalise (value) {
  return SUPPORTED.includes(value) ? value : 'en'
}

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en, cn },
  // The design's copy contains literal { } only as punctuation, never as
  // interpolation, so a warning here means a genuine mistake.
  warnHtmlMessage: false
})
