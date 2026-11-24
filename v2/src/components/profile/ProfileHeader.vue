<script setup>
import AvatarSlot from './AvatarSlot.vue'
import headerPrint from '../../assets/prints/heroes-board.jpg'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { profileName } from '../../lib/profile'

// Who is signed in: a picture slot (hero heads later), their chosen name in
// characters only, and when they started, on a navy card (Emily, 2026-11-22/23).
// The email and the name's pinyin are on the settings page. The account links
// sit in the card's slot.

const props = defineProps({
  user: { type: Object, required: true }
})
const { t, locale } = useI18n()

const name = computed(() => profileName(props.user))

// When they started. The email is only on the settings page (Emily, 2026-11-22).
const since = computed(() => {
  const date = new Date(props.user.date_created ?? '')
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale.value === 'cn' ? 'zh-CN' : 'en-GB', { month: 'long', year: 'numeric' }).format(date)
})
const meta = computed(() => [
  since.value && t('profileSinceLine', { date: since.value })
].filter(Boolean))

</script>

<template>
  <section class="head">
    <!-- A print behind the card, under a navy wash (Emily's idea 1, 2026-11-24). -->
    <img class="head__print" :src="headerPrint" alt="" aria-hidden="true" />
    <div class="head__id">
    <AvatarSlot />
    <div class="head__who">
    <!-- Characters only: the pinyin is on the settings page (Emily, 2026-11-23). -->
    <h1 v-if="name" class="head__title" lang="zh">
      <span class="hanzi">{{ name.name }}</span>
    </h1>
    <h1 v-else class="head__title">{{ t('profileUntitled') }}</h1>

    <p v-if="meta.length" class="head__meta">
      <span v-for="part in meta" :key="part">{{ part }}</span>
    </p>
    <RouterLink v-if="!name" class="head__set-name" :to="{ name: 'profile-settings' }">{{ t('profileSetName') }}</RouterLink>
    </div>
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
  position: relative;
  isolation: isolate;
  overflow: hidden;
}
.head__print {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 28%;
}
/* Darker where the name sits, letting more of the print through on the right. */
.head::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, rgb(27 33 64 / 0.94) 0%, rgb(27 33 64 / 0.82) 50%, rgb(27 33 64 / 0.55) 100%);
}
/* On a phone the links run across the whole card, so the wash is even, and the
   print is zoomed in on the hero rather than showing the whole sheet. */
@media (max-width: 719px) {
  .head::before { background: rgb(27 33 64 / 0.86); }
  .head__print { transform: scale(2); transform-origin: 30% 22%; }
}
.head__id { display: flex; align-items: center; gap: var(--s-6); min-width: 0; }
.head__who { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-2); min-width: 0; }

.head__title { font-size: var(--t-2xl); line-height: var(--lh-tight); color: var(--c-ground); }
.head__title .hanzi { color: var(--c-ground); }

.head__meta { display: flex; flex-direction: column; gap: var(--s-1); font-size: var(--t-base); overflow-wrap: anywhere; opacity: 0.85; }
.head__set-name, .head :deep(a), .head :deep(button) { color: var(--c-ground); }
.head :deep(a:focus-visible), .head :deep(button:focus-visible) { outline-color: var(--c-ground); }
</style>
