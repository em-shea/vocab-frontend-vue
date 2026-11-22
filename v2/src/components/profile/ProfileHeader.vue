<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { profileName, rubyPairs } from '../../lib/profile'

// Who is signed in: their chosen name (or their email until they pick one),
// the email and when they started underneath, on a navy card so it stands out
// (Emily, 2026-11-22). The account links sit in the card's slot.
//
// No profile picture for now (Emily, 2026-11-20): the old emoji avatar and its
// picker are gone. Something hero-related may take its place once heroes launch.

const props = defineProps({
  user: { type: Object, required: true }
})
const { t, locale } = useI18n()

const name = computed(() => profileName(props.user))
const ruby = computed(() => (name.value ? rubyPairs(name.value.name, name.value.pinyin) : null))

// The email (when the name is the heading), then when they started, each on
// its own line.
const since = computed(() => {
  const date = new Date(props.user.date_created ?? '')
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale.value === 'cn' ? 'zh-CN' : 'en-GB', { month: 'long', year: 'numeric' }).format(date)
})
const meta = computed(() => [
  name.value && props.user.email_address,
  since.value && t('profileSinceLine', { date: since.value })
].filter(Boolean))

</script>

<template>
  <section class="head">
    <div class="head__who">
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
    </div>
    <slot />
  </section>
</template>

<style scoped>
.head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--s-6) var(--s-8);
  padding: var(--s-8);
  color: var(--c-ground);
  background-color: var(--c-ink);
}
.head__who { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-2); min-width: 0; }

.head__title { font-size: var(--t-2xl); line-height: var(--lh-tight); color: var(--c-ground); }
.head__title ruby { ruby-position: over; }
.head__title .hanzi { color: var(--c-ground); }
/* Chrome justifies a short annotation across its base and pulls ā apart into
   a and a floating macron. An inline block is never justified internally. */
.head__title rt > span { display: inline-block; }
.head__title rt { font-size: var(--t-base); font-weight: var(--w-medium); color: var(--c-ground); }
.head__pinyin { margin-left: var(--s-3); font-size: var(--t-body); }
.head__title--email { font-size: var(--t-lg); overflow-wrap: anywhere; }

.head__meta { display: flex; flex-direction: column; gap: var(--s-1); font-size: var(--t-base); overflow-wrap: anywhere; opacity: 0.85; }
.head__set-name, .head :deep(a), .head :deep(button) { color: var(--c-ground); }
.head :deep(a:focus-visible), .head :deep(button:focus-visible) { outline-color: var(--c-ground); }
</style>
