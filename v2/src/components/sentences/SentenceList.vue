<script setup>
import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../AppButton.vue'
import { usePreferencesStore } from '../../stores/preferences'
import { PAGE_SIZE } from '../../lib/sentences'

// The sentences written so far, newest first, a page at a time. The word each
// was written for is only known for the last 10 days (see lib/sentences.js),
// so older ones show the sentence and its date alone.

const props = defineProps({
  sentences: { type: Array, required: true },
  words: { type: Object, default: () => ({}) }
})
const { t, locale } = useI18n()
const prefs = usePreferencesStore()

const shown = ref(PAGE_SIZE)
const items = ref(null)
const visible = computed(() => props.sentences.slice(0, shown.value))

async function more () {
  const first = shown.value
  shown.value += PAGE_SIZE
  // Take keyboard users to the first newly shown sentence, not back to the top.
  await nextTick()
  items.value?.children?.[first]?.focus()
}

const dateFormat = computed(() =>
  new Intl.DateTimeFormat(locale.value === 'cn' ? 'zh-CN' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
)
function longDate (iso) {
  const date = new Date(`${iso}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? iso : dateFormat.value.format(date)
}

const wordText = (word) => (prefs.isTraditional ? word.traditional : word.simplified) || word.simplified
</script>

<template>
  <p v-if="!sentences.length" class="list__empty">{{ t('sentencesNone') }}</p>

  <template v-else>
    <ol ref="items" class="list">
      <li v-for="item in visible" :key="item.sentence_id" class="list__item" tabindex="-1">
        <p class="hanzi list__sentence" lang="zh">{{ item.sentence }}</p>
        <p class="list__meta">
          <time class="mono" :datetime="item.date_created">{{ longDate(item.date_created) }}</time>
          <template v-if="words[item.sentence_id]">
            <span aria-hidden="true">·</span>
            <span class="hanzi">{{ wordText(words[item.sentence_id]) }}</span>
            <span class="pinyin">{{ words[item.sentence_id].pinyin }}</span>
          </template>
        </p>
      </li>
    </ol>
    <AppButton v-if="shown < sentences.length" class="list__more" variant="quiet" @click="more">
      {{ t('sentencesMore') }}
    </AppButton>
  </template>
</template>

<style scoped>
.list { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; border-top: var(--bw-heavy) solid var(--c-ink); }

.list__item {
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
  padding: var(--s-4) 0;
  border-bottom: var(--bw-hair) solid var(--c-rule);
}

.list__sentence { font-size: var(--t-md); line-height: var(--lh-snug); overflow-wrap: anywhere; }

.list__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--s-2);
  font-size: var(--t-sm);
  color: var(--c-muted);
}
.list__meta .hanzi { font-size: var(--t-base); }

.list__more { align-self: flex-start; }
.list__empty { color: var(--c-body); }
</style>
