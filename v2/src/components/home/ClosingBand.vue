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
    <AppPanel band class="oath">
      <h2 v-if="heroes" class="oath__headline">
        {{ t('closeHeadlineA') }}<br />{{ t('closeHeadlineB') }}
      </h2>
      <h2 v-else class="oath__headline">{{ t('previewHeadline') }}</h2>
      <SoonNote v-if="heroes" band />
      <p v-if="heroes" class="oath__body">{{ t('closeBody') }}</p>
      <!-- One print, not the double spread (Emily, 2026-11-22). -->
      <figure class="oath__board">
        <img :src="printSingle" alt="An outlaw of the Water Margin, woodblock print" />
      </figure>
    </AppPanel>
    <div class="signup">
      <SectionHead :title="t('closingSubscribeHeadline')" />
      <SubscribeForm variant="light" id-prefix="closing" />
    </div>
  </section>
</template>

<style scoped>
.stack { display: flex; flex-direction: column; gap: var(--s-12); }
.oath { gap: var(--s-6); }
.signup { display: flex; flex-direction: column; gap: var(--s-6); }
.oath__headline { font-size: var(--t-2xl); color: var(--c-on-dark); }
.oath__body { color: var(--c-on-dark); opacity: 0.85; }
.oath__board {
  position: relative;
  margin: 0;
  /* Same square ink frame as the prints, lightened for the dark band. The
     print fills it, cropped like the top-of-page print (Emily, 2026-11-22):
     a 3:2 crop on a phone, as tall as the band on a wide screen. */
  border: var(--bw-frame) solid var(--c-on-dark);
  border-radius: 0;
  overflow: hidden;
}
.oath__board img {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  object-position: 60% 18%;
  filter: sepia(0.2) saturate(0.9);
}
@media (min-width: 720px) {
  .oath {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    align-items: stretch;
    column-gap: var(--s-12);
  }
  .oath > :not(.oath__board) { grid-column: 1; }
  .oath__headline:only-of-type { grid-row: 1 / span 3; align-self: center; }
  .oath__board { grid-column: 2; grid-row: 1 / span 3; min-height: 18rem; }
  .oath__board img { position: absolute; inset: 0; height: 100%; aspect-ratio: auto; }
}
</style>
