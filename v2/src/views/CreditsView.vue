<script setup>
import { useI18n } from 'vue-i18n'
import PageShell from '../components/PageShell.vue'

// Credits (Emily, 2026-11-23): everything the site uses that someone else
// made, with its license. Linked from the footer, which used to carry these.
const { t } = useI18n()

const CREDITS = [
  { key: 'Prints', links: [] },
  {
    key: 'Words',
    links: [['CC-CEDICT', 'https://cc-cedict.org/wiki/'], ['CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/']]
  },
  { key: 'Ai', links: [] },
  {
    key: 'Strokes',
    links: [
      ['Make Me a Hanzi', 'https://github.com/skishore/makemeahanzi'],
      ['Arphic Public License', 'https://github.com/chanind/hanzi-writer-data/blob/master/ARPHICPL.TXT'],
      ['Hanzi Writer', 'https://hanziwriter.org']
    ]
  },
  {
    key: 'Icons',
    links: [['game-icons.net', 'https://game-icons.net'], ['CC BY 3.0', 'https://creativecommons.org/licenses/by/3.0/']]
  },
  {
    key: 'Fonts',
    links: [['SIL Open Font License', 'https://openfontlicense.org']]
  }
]
</script>

<template>
  <PageShell width="narrow">
    <h1 class="credits__title">{{ t('creditsTitle') }}</h1>
    <section v-for="item in CREDITS" :key="item.key" class="credit">
      <h2 class="credit__heading">{{ t(`credits${item.key}Heading`) }}</h2>
      <p>{{ t(`credits${item.key}Body`) }}</p>
      <p v-if="item.links.length" class="credit__links">
        <a v-for="[label, href] in item.links" :key="href" :href="href" rel="noopener">{{ label }}</a>
      </p>
    </section>
  </PageShell>
</template>

<style scoped>
.credits__title { font-size: var(--t-2xl); line-height: var(--lh-tight); }
.credit { display: flex; flex-direction: column; gap: var(--s-2); padding-top: var(--s-6); border-top: var(--bw-hair) solid var(--c-rule); }
.credit__heading { font-size: var(--t-lead); }
.credit__links { display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-4); }
</style>
