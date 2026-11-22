import { useI18n } from 'vue-i18n'

// List names come from the backend in English ("HSK Level 3"). In 中文 mode
// the HSK ones read "HSK 3级" (Emily, 2026-11-22). Other names (a user's own
// list) are shown as they are.
const HSK = /^HSK Level (\d)$/

export const listLabelFor = (name, t) => {
  const match = HSK.exec(String(name ?? '').trim())
  return match ? t('hskLevelName', { n: match[1] }) : name
}

/** label(name): the list name to show in the current language. */
export function useListLabel () {
  const { t } = useI18n()
  return (name) => listLabelFor(name, t)
}
