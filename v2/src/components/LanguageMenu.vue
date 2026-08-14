<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePreferencesStore } from '../stores/preferences'

// One globe button covering both reading settings.
//
// These were two separate controls in the nav — a simplified/traditional pair
// and an immersion switch — which is a lot of chrome for choices most people
// make once. They are also easy to confuse, since both look like they are about
// "language". Folding them into one menu means the header carries a single
// affordance, and the menu can say plainly what each choice does.

const { t } = useI18n()
const prefs = usePreferencesStore()

const open = ref(false)
const root = ref(null)
const panel = ref(null)

const summary = computed(() =>
  `${prefs.language === 'cn' ? '中文' : 'EN'} · ${prefs.isTraditional ? '繁' : '简'}`
)

async function toggle () {
  open.value = !open.value
  if (open.value) {
    await nextTick()
    panel.value?.querySelector('button')?.focus()
  }
}

function close ({ refocus = false } = {}) {
  if (!open.value) return
  open.value = false
  if (refocus) root.value?.querySelector('.globe')?.focus()
}

function onPointerDown (event) {
  if (root.value && !root.value.contains(event.target)) close()
}

function onKeydown (event) {
  if (event.key === 'Escape') close({ refocus: true })
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="root" class="lang">
    <button
      type="button"
      class="globe"
      :aria-expanded="open"
      aria-haspopup="true"
      aria-label="Reading settings"
      @click="toggle"
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <circle cx="10" cy="10" r="7.6" />
        <ellipse cx="10" cy="10" rx="3.1" ry="7.6" />
        <path d="M2.6 7.6h14.8M2.6 12.4h14.8" />
      </svg>
      <span class="globe__summary mono">{{ summary }}</span>
    </button>

    <div v-if="open" ref="panel" class="menu" role="dialog" aria-label="Reading settings">
      <fieldset class="menu__group">
        <legend class="label">Interface</legend>
        <p class="menu__hint">What the site's own words are written in.</p>
        <div class="menu__options">
          <button
            type="button"
            class="opt"
            :class="{ 'opt--on': prefs.language === 'en' }"
            :aria-pressed="prefs.language === 'en'"
            @click="prefs.setLanguage('en')"
          >English</button>
          <button
            type="button"
            class="opt"
            :class="{ 'opt--on': prefs.language === 'cn' }"
            :aria-pressed="prefs.language === 'cn'"
            @click="prefs.setLanguage('cn')"
          >中文 <span class="opt__note">immersion</span></button>
        </div>
      </fieldset>

      <fieldset class="menu__group">
        <legend class="label">Characters</legend>
        <p class="menu__hint">How vocabulary is written.</p>
        <div class="menu__options">
          <button
            type="button"
            class="opt"
            :class="{ 'opt--on': !prefs.isTraditional }"
            :aria-pressed="!prefs.isTraditional"
            @click="prefs.setCharacterSet('simplified')"
          >{{ t('simplified') }}</button>
          <button
            type="button"
            class="opt"
            :class="{ 'opt--on': prefs.isTraditional }"
            :aria-pressed="prefs.isTraditional"
            @click="prefs.setCharacterSet('traditional')"
          >{{ t('traditional') }}</button>
        </div>
      </fieldset>
    </div>
  </div>
</template>

<style scoped>
.lang { position: relative; }

.globe {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  padding: var(--s-2) var(--s-3);
  background-color: transparent;
  border: var(--bw-hair) solid var(--c-rule);
  border-radius: var(--r-pill);
  color: var(--c-ink);
  cursor: pointer;
}

.globe:hover { border-color: var(--c-ink); }
.globe[aria-expanded='true'] { background-color: var(--c-panel); border-color: var(--c-ink); }

.globe svg { width: 19px; height: 19px; }
.globe svg circle,
.globe svg ellipse,
.globe svg path {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.3;
}

.globe__summary { font-size: var(--t-sm); color: var(--c-muted); }

.menu {
  position: absolute;
  top: calc(100% + var(--s-2));
  right: 0;
  z-index: 20;
  width: max-content;
  min-width: 15rem;
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  padding: var(--s-4);
  background-color: var(--c-raised);
  border: var(--bw-rule) solid var(--c-ink);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-lift);
}

.menu__group { margin: 0; padding: 0; border: 0; }
.menu__hint {
  margin: var(--s-1) 0 var(--s-2);
  font-size: var(--t-sm);
  color: var(--c-muted);
}
.menu__options { display: flex; gap: var(--s-2); }

.opt {
  flex: 1 1 auto;
  padding: var(--s-2) var(--s-3);
  background-color: var(--c-panel);
  border: var(--bw-hair) solid var(--c-rule);
  border-radius: var(--r-sm);
  font-family: var(--f-label);
  font-size: var(--t-base);
  color: var(--c-body);
  cursor: pointer;
  text-align: left;
}

.opt--on {
  background-color: var(--c-ink);
  border-color: var(--c-ink);
  color: var(--c-on-dark);
}

.opt__note {
  display: block;
  font-size: var(--t-2xs);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  opacity: 0.75;
}

/* On narrow screens the menu would otherwise run off the right edge. */
@media (max-width: 480px) {
  .menu { right: auto; left: 0; }
}
</style>
