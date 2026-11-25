<script setup>
import { useI18n } from 'vue-i18n'
import AppPanel from '../AppPanel.vue'
import SubscribeForm from '../SubscribeForm.vue'
import SectionHead from '../SectionHead.vue'
import SoonNote from './SoonNote.vue'
import printSingle from '../../assets/prints/hero-collect.jpg'

// The dark band at the foot of the page, with the second subscribe form below
// it on the paper ground. In the
// heroes version it is the quests band ("Complete quests. Unite all 108.", with
// a launching-soon note). In the launch version it is the heroes preview: its
// headline already says the heroes are coming, so it has no note.
defineProps({ heroes: { type: Boolean, default: false } })
const { t } = useI18n()
</script>

<template>
  <section class="stack">
    <!-- Like the profile name card: the print fills the whole band, faint under
         a navy wash (Emily, 2026-11-24). -->
    <AppPanel band class="oath">
      <img class="oath__print" :src="printSingle" alt="" aria-hidden="true" />
      <h2 v-if="heroes" class="oath__headline">
        {{ t('closeHeadlineA') }}<br />{{ t('closeHeadlineB') }}
      </h2>
      <h2 v-else class="oath__headline">{{ t('previewHeadline') }}</h2>
      <SoonNote v-if="heroes" band />
      <p v-if="heroes" class="oath__body">{{ t('closeBody') }}</p>
    </AppPanel>
    <div class="signup">
      <SectionHead :title="t('closingSubscribeHeadline')" />
      <SubscribeForm variant="light" id-prefix="closing" />
    </div>
  </section>
</template>

<style scoped>
.stack { display: flex; flex-direction: column; gap: var(--s-12); }
.oath {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  gap: var(--s-6);
  min-height: 16rem;
  justify-content: center;
}
.oath__print {
  position: absolute;
  inset: 0;
  z-index: -2;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 60% 22%;
}
/* Darker where the headline sits, more of the print on the right. */
.oath::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, rgb(27 33 64 / 0.94) 0%, rgb(27 33 64 / 0.82) 50%, rgb(27 33 64 / 0.55) 100%);
}
.oath > :not(.oath__print) { max-width: 36rem; }
.oath__headline { font-size: var(--t-2xl); color: var(--c-on-dark); }
.oath__body { color: var(--c-on-dark); opacity: 0.85; }
.signup { display: flex; flex-direction: column; gap: var(--s-6); }

/* On a phone the text runs across the band, so the wash is even and the print
   is zoomed in on the hero. */
@media (max-width: 719px) {
  .oath::before { background: rgb(27 33 64 / 0.86); }
  .oath__print { transform: scale(1.6); transform-origin: 60% 25%; }
}
@media (min-width: 720px) {
  .oath { min-height: 20rem; }
}
</style>
