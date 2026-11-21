<script setup>
import { useI18n } from 'vue-i18n'
import SectionHead from '../SectionHead.vue'
import AudioButton from '../AudioButton.vue'

// An illustration of the daily email, not a real one: the word is
// fixed so the example is always correct.
const { t } = useI18n()

// The Polly recording of 爱护 from the word table ('Audio file key'). Until it is
// filled in, the button shows in its muted, no-recording state.
const AIHU_AUDIO = ''
</script>

<template>
  <section class="split">
    <div class="split__text">
      <SectionHead :title="t('dailyHeadline')" />
      <p>{{ t('dailyBody') }}</p>
    </div>

    <figure class="mail" :aria-label="t('emailLabel')">
      <div class="mail__bar">
        <p class="mail__subject">{{ t('emailSubject') }}</p>
      </div>
      <div class="mail__body">
        <p class="hanzi mail__word">爱护</p>
        <div class="mail__say">
          <p class="pinyin mail__pinyin">ài hù</p>
          <AudioButton :src="AIHU_AUDIO" label="爱护" show-when-missing />
        </div>
        <p class="mail__meaning">{{ t('emailMeaning') }}</p>
      </div>
    </figure>
  </section>
</template>

<style scoped>
.split { display: grid; gap: var(--s-8); align-items: start; }
.split__text { display: flex; flex-direction: column; gap: var(--s-4); min-width: 0; }

.mail {
  margin: 0;
  min-width: 0;
  max-width: 30rem;
  width: 100%;
  justify-self: center;
  background-color: var(--c-raised);
  border: var(--bw-rule) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}
.mail__bar { padding: var(--s-3) var(--s-4); background-color: var(--c-sunk); border-bottom: var(--bw-rule) solid var(--c-ink); }
.mail__subject { font-family: var(--f-ui); font-weight: var(--w-semi); color: var(--c-ink); overflow-wrap: anywhere; }
.mail__body { display: flex; flex-direction: column; gap: var(--s-2); padding: var(--s-6); }
.mail__word { font-size: var(--t-3xl); line-height: var(--lh-tight); font-weight: var(--w-bold); color: var(--c-ink); }
.mail__say { display: flex; align-items: center; gap: var(--s-3); }
.mail__pinyin { font-size: var(--t-lead); }
.mail__meaning { color: var(--c-body); }

@media (min-width: 720px) {
  .split { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr); }
}
</style>
