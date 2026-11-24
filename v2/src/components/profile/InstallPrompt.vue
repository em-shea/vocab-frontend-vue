<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import AppButton from '../AppButton.vue'
import { installMode, dismissedRecently, dismiss, promptInstall } from '../../lib/install'

const props = defineProps({ ready: { type: Boolean, default: false } })
const { t } = useI18n()

const closed = ref(dismissedRecently())
const mode = computed(() => installMode())
const shown = computed(() => props.ready && !closed.value && mode.value !== 'none')

function notNow () {
  dismiss()
  closed.value = true
}

async function install () {
  if (!(await promptInstall())) notNow()
}
</script>

<template>
  <section v-if="shown" class="install" aria-labelledby="install-title">
    <div class="install__text">
      <h2 id="install-title" class="install__title">{{ t('installTitle') }}</h2>
      <p>{{ mode === 'ios' ? t('installIos') : t('installBody') }}</p>
    </div>
    <div class="install__actions">
      <AppButton v-if="mode === 'prompt'" class="install__go" variant="quiet" shape="sm" @click="install">{{ t('installButton') }}</AppButton>
      <button type="button" class="install__later" @click="notNow">{{ t('installNotNow') }}</button>
    </div>
  </section>
</template>

<style scoped>
.install {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-4) var(--s-6);
  padding: var(--s-6);
  /* The one red box on the profile (Emily, 2026-11-24); its buttons are light. */
  background-color: var(--c-seal);
  color: var(--c-on-red);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}
.install__go { background-color: var(--c-panel); }
.install__later {
  padding: var(--s-3) var(--s-2);
  font: inherit;
  font-size: var(--t-base);
  color: inherit;
  background: none;
  border: 0;
  text-decoration: underline;
  text-underline-offset: 0.2em;
  cursor: pointer;
}
.install__later:focus-visible { outline: 2px solid var(--c-on-red); outline-offset: 2px; }
.install__text { flex: 1 1 18rem; display: flex; flex-direction: column; gap: var(--s-2); min-width: 0; }
.install__title { margin: 0; font-size: var(--t-lg); color: inherit; }
.install__text p { margin: 0; color: inherit; }
.install__actions { display: flex; gap: var(--s-3); flex-wrap: wrap; }
</style>
