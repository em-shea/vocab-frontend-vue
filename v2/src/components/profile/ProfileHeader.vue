<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { profileName, rubyPairs } from '../../lib/profile'

// Who is signed in: their chosen name (or their email until they pick one),
// when they started, and the ways to their settings and lists.
//
// No profile picture for now (Emily, 2026-11-20): the old emoji avatar and its
// picker are gone. Something hero-related may take its place once heroes launch.

const props = defineProps({
  user: { type: Object, required: true }
})
const { t, locale } = useI18n()

const name = computed(() => profileName(props.user))
const ruby = computed(() => (name.value ? rubyPairs(name.value.name, name.value.pinyin) : null))

// Email (when the name is the heading) and how long they have studied, on one line.
const meta = computed(() => [
  name.value && props.user.email_address,
  since.value && t('profileSinceLine', { date: since.value })
].filter(Boolean))

const since = computed(() => {
  const date = new Date(props.user.date_created ?? '')
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale.value === 'cn' ? 'zh-CN' : 'en-GB', { month: 'long', year: 'numeric' }).format(date)
})
</script>

<template>
  <section class="head">
    <h1 v-if="name" class="head__title" lang="zh">
      <ruby v-if="ruby" class="hanzi"><template v-for="pair in ruby" :key="pair.char">{{ pair.char }}<rt class="pinyin"><span>{{ pair.pinyin }}</span></rt></template></ruby>
      <template v-else>
        <span class="hanzi">{{ name.name }}</span>
        <span v-if="name.pinyin" class="pinyin head__pinyin">{{ name.pinyin }}</span>
      </template>
    </h1>
    <h1 v-else class="head__title head__title--email">{{ user.email_address }}</h1>

    <p v-if="meta.length" class="head__meta">
      <span v-for="part in meta" :key="part">{{ part }}</span>
    </p>
    <RouterLink v-if="!name" class="head__set-name" :to="{ name: 'profile-settings' }">{{ t('profileSetName') }}</RouterLink>
  </section>
</template>

<style scoped>
.head { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-2); min-width: 0; }

.head__title { font-size: var(--t-2xl); line-height: var(--lh-tight); }
.head__title ruby { ruby-position: over; }
/* Chrome justifies a short annotation across its base and pulls ā apart into
   a and a floating macron. An inline block is never justified internally. */
.head__title rt > span { display: inline-block; }
.head__title rt { font-size: var(--t-base); font-weight: var(--w-medium); }
.head__pinyin { margin-left: var(--s-3); font-size: var(--t-body); }
.head__title--email { font-size: var(--t-lg); overflow-wrap: anywhere; }

/* No separator: the two facts sit apart, and wrap onto two lines on a phone. */
.head__meta { display: flex; flex-wrap: wrap; gap: var(--s-1) var(--s-6); color: var(--c-body); font-size: var(--t-base); overflow-wrap: anywhere; }
.head__set-name { font-size: var(--t-base); }
</style>
