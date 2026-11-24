<script setup>
// The daily streak (Emily, 2026-11-24): basic rules until heroes launch, worked
// out by the backend (GET /progress, streak_service). One activity a day keeps
// it; extra activities bank buffer days (up to buffer_max) that cover a missed day.
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({ streak: { type: Object, required: true } })
const { t, locale } = useI18n()
const open = ref(false)

const weekday = (iso) => new Intl.DateTimeFormat(locale.value === 'cn' ? 'zh-CN' : 'en-US', { weekday: 'narrow', timeZone: 'UTC' })
  .format(new Date(`${iso}T00:00:00Z`))
const fullDate = (iso) => new Intl.DateTimeFormat(locale.value === 'cn' ? 'zh-CN' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' })
  .format(new Date(`${iso}T00:00:00Z`))

const days = computed(() => props.streak.recent ?? [])
const spare = computed(() => Array.from({ length: props.streak.buffer_max ?? 3 }, (_, i) => i < (props.streak.buffer ?? 0)))
</script>

<template>
  <section class="streak" aria-labelledby="streak-title">
    <div class="streak__count">
      <h2 id="streak-title" class="streak__title">
        <!-- English "4 day streak"; Chinese reads 连续 4 天. -->
        <i18n-t keypath="streakTitle" tag="span" class="streak__unit" scope="global">
          <template #n><span class="streak__n">{{ streak.current }}</span></template>
        </i18n-t>
      </h2>
    </div>

    <ol class="streak__week" :aria-label="t('streakWeek')">
      <li v-for="day in days" :key="day.date" class="streak__day">
        <span class="streak__mark" :class="`streak__mark--${day.status}`" aria-hidden="true">
          <svg v-if="day.status === 'done'" viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.5" /></svg>
          <svg v-else-if="day.status === 'saved'" viewBox="0 0 16 16"><path d="M8 2.5l1.6 3.4 3.7.4-2.8 2.5.8 3.7L8 10.6l-3.3 1.9.8-3.7-2.8-2.5 3.7-.4z" /></svg>
        </span>
        <span class="streak__weekday" aria-hidden="true">{{ weekday(day.date) }}</span>
        <span class="sr-only">{{ fullDate(day.date) }}: {{ t(`streakDay_${day.status}`) }}</span>
      </li>
    </ol>

    <div class="streak__side">
      <p class="streak__spare">
        <span class="streak__label">{{ t('streakSpare') }}</span>
      </p>
      <p class="streak__pips" :aria-label="t('streakSpareOf', { n: streak.buffer ?? 0, max: streak.buffer_max ?? 3 })">
        <span v-for="(full, i) in spare" :key="i" class="streak__pip" :class="{ 'streak__pip--full': full }" aria-hidden="true" />
      </p>
      <p class="streak__best">
        {{ t('streakBest', { n: streak.best ?? 0 }, streak.best ?? 0) }}
        <!-- One explanation for streaks and buffer days (Emily, 2026-11-24). -->
        <span class="tip">
          <button type="button" class="tip__button" aria-describedby="streak-how" :aria-expanded="open"
            :aria-label="t('streakHow')" @click="open = !open" @blur="open = false">?</button>
          <span id="streak-how" role="tooltip" class="tip__text" :class="{ 'tip__text--open': open }">
            {{ t('streakRule', { max: streak.buffer_max ?? 3 }) }}
          </span>
        </span>
      </p>
    </div>

  </section>
</template>

<style scoped>
/* No print band: this card stands apart from the activity boxes. The days are
   marked like stamps. */
.streak {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--s-6);
  padding: var(--s-6);
  color: var(--c-ink);
  background-color: var(--c-panel);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}
.streak__count { display: flex; flex-direction: column; gap: var(--s-1); min-width: 0; }
.streak__title { margin: 0; }
.streak__unit { display: inline-flex; align-items: baseline; gap: 0.3em; white-space: nowrap; }
.streak__n { font-size: var(--t-3xl); line-height: 1; font-family: var(--f-display); }
.streak__unit { font-size: var(--t-md); }

.streak__week { display: flex; gap: var(--s-2); margin: 0; padding: 0; list-style: none; align-self: center; }
.streak__day { display: flex; flex-direction: column; align-items: center; gap: var(--s-1); flex: 1 1 0; max-width: 2.75rem; }
.streak__mark {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1;
  max-width: 2.5rem;
  border: var(--bw-rule) solid var(--c-ink);
  background-color: var(--c-panel);
}
.streak__mark svg { width: 70%; height: 70%; fill: none; stroke: currentColor; stroke-width: 2.2; stroke-linecap: square; }
.streak__mark--done { background-color: var(--c-seal); color: var(--c-on-red); }
.streak__mark--saved { background-color: var(--c-ink); color: var(--c-panel); }
.streak__mark--saved svg { fill: currentColor; stroke: none; }
.streak__mark--missed { background-color: transparent; border-style: dotted; opacity: 0.55; }
.streak__mark--open { background-color: transparent; border-style: dashed; }
.streak__weekday { font-size: var(--t-sm); }

/* On a phone the buffer days and best sit on one line to keep the card short. */
.streak__side { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-2) var(--s-4); }
.streak__best { margin-left: auto !important; }
.streak__spare { display: flex; align-items: center; gap: var(--s-2); margin: 0; }
.streak__label { font-family: var(--f-label); font-size: var(--t-sm); font-weight: var(--w-semi); letter-spacing: var(--ls-wide, 0.08em); text-transform: uppercase; }
.streak__pips { display: flex; gap: var(--s-2); margin: 0; }
.streak__pip { width: 1.25rem; height: 1.25rem; border: var(--bw-rule) solid var(--c-ink); background-color: transparent; }
.streak__pip--full { background-color: var(--c-ink); }
.streak__best { display: flex; align-items: center; gap: var(--s-2); margin: 0; font-size: var(--t-sm); }
.tip { display: inline-flex; }

.tip__button {
  flex: none;
  display: grid; place-items: center; width: 1.25rem; height: 1.25rem; padding: 0;
  font: inherit; font-size: 0.75rem; font-weight: 700; line-height: 1; color: var(--c-ink);
  background: none; border: var(--bw-hair) solid currentColor; border-radius: 50%; cursor: help;
}
.tip__text {
  position: absolute; z-index: 5; left: var(--s-4); right: var(--s-4); top: calc(100% - var(--s-4));
  padding: var(--s-3) var(--s-4); font-size: var(--t-sm); line-height: var(--lh-snug);
  color: var(--c-ground); background-color: var(--c-ink); box-shadow: var(--shadow-hard);
  visibility: hidden; opacity: 0; transition: opacity 120ms;
}
.tip:hover .tip__text, .tip__button:focus-visible + .tip__text, .tip__text--open { visibility: visible; opacity: 1; }

@media (min-width: 720px) {
  .streak { grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--s-8); }
  .streak__week { justify-content: center; }
  .streak__side { flex-direction: column; flex-wrap: nowrap; align-items: flex-start; gap: var(--s-2); }
  .streak__best { margin-left: 0 !important; }
}
</style>
