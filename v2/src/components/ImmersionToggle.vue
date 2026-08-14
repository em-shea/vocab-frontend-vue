<script setup>
import { computed } from 'vue'
import { usePreferencesStore } from '../stores/preferences'

// Switches the interface between English and Chinese.
//
// The design keeps this control's own label in English in both languages, which
// is right: it is the way back for someone who has switched into Chinese and
// cannot read the interface any more.
//
// Separate from the character set control — this changes the interface, that
// changes how vocabulary renders.

const prefs = usePreferencesStore()
const isChinese = computed(() => prefs.language === 'cn')
</script>

<template>
  <button
    type="button"
    class="immersion"
    role="switch"
    :aria-checked="isChinese"
    aria-label="Immersion: show the interface in Chinese"
    @click="prefs.toggleLanguage()"
  >
    <span class="immersion__label">Immersion</span>
    <span class="immersion__track" :class="{ 'immersion__track--on': isChinese }" aria-hidden="true">
      <span class="immersion__knob"></span>
    </span>
    <span class="immersion__state hanzi-ui" aria-hidden="true">{{ isChinese ? '中' : 'EN' }}</span>
  </button>
</template>

<style scoped>
.immersion {
  display: inline-flex;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-2) var(--s-3);
  background: transparent;
  border: var(--bw-hair) solid var(--c-rule);
  border-radius: var(--r-pill);
  cursor: pointer;
  color: var(--c-body);
}

.immersion__label {
  font-family: var(--f-label);
  font-size: var(--t-sm);
  font-weight: var(--w-semi);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  color: var(--c-muted);
}

.immersion__track {
  position: relative;
  width: 34px;
  height: 18px;
  background-color: var(--c-sunk);
  border-radius: var(--r-pill);
  transition: background-color 140ms ease-out;
}

.immersion__track--on { background-color: var(--c-seal); }

.immersion__knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background-color: var(--c-raised);
  border-radius: var(--r-circle);
  transition: transform 140ms ease-out;
}

.immersion__track--on .immersion__knob { transform: translateX(16px); }

.immersion__state {
  min-width: 2ch;
  font-size: var(--t-sm);
  font-weight: var(--w-semi);
  color: var(--c-ink);
}
</style>
