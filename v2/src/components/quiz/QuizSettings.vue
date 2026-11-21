<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../AppButton.vue'
import { RANGES, LENGTHS } from '../../lib/quiz'

// List, period and length for the next quiz. Nothing changes until Start, so
// opening the panel by mistake mid-quiz loses nothing.
//
// Character set is not here: the globe menu in the nav already sets it for
// the whole site, and the quiz follows it live.

const props = defineProps({
  lists: { type: Array, required: true },
  listId: { type: String, required: true },
  range: { type: Number, required: true },
  length: { type: Number, required: true }
})
const emit = defineEmits(['start', 'cancel'])
const { t } = useI18n()

const draft = reactive({ listId: props.listId, range: props.range, length: props.length })
</script>

<template>
  <form class="settings" @submit.prevent="emit('start', { ...draft })">
    <div class="settings__field">
      <label class="label" for="quiz-list">{{ t('quizList') }}</label>
      <select id="quiz-list" v-model="draft.listId" class="settings__select">
        <option v-for="list in lists" :key="list.list_id" :value="list.list_id">{{ list.list_name }}</option>
      </select>
    </div>

    <fieldset class="settings__field">
      <legend class="label">{{ t('quizRange') }}</legend>
      <div class="segments">
        <label v-for="days in RANGES" :key="days" class="segment">
          <input v-model.number="draft.range" type="radio" name="quiz-range" :value="days">
          <span>{{ t('quizRangeDays', { days }) }}</span>
        </label>
      </div>
    </fieldset>

    <fieldset class="settings__field">
      <legend class="label">{{ t('quizLength') }}</legend>
      <div class="segments">
        <label v-for="n in LENGTHS" :key="n" class="segment">
          <input v-model.number="draft.length" type="radio" name="quiz-length" :value="n">
          <span>{{ n }}</span>
        </label>
      </div>
    </fieldset>

    <div class="settings__actions">
      <AppButton type="submit" variant="primary">{{ t('quizStart') }}</AppButton>
      <AppButton variant="quiet" @click="emit('cancel')">{{ t('quizCancel') }}</AppButton>
    </div>
  </form>
</template>

<style scoped>
.settings {
  display: flex;
  flex-direction: column;
  gap: var(--s-6);
  padding: var(--s-6);
  background-color: var(--c-panel);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}

.settings__field { display: flex; flex-direction: column; gap: var(--s-2); min-width: 0; margin: 0; padding: 0; border: 0; }
.settings__field legend { padding: 0; margin-bottom: var(--s-2); }

.settings__select {
  padding: var(--s-3);
  font-family: var(--f-ui);
  font-size: var(--t-body);
  color: var(--c-ink);
  background-color: var(--c-raised);
  border: var(--bw-rule) solid var(--c-ink);
  border-radius: var(--r-sm);
}

/* Radio buttons drawn as one joined row of squares. The input stays in the
   page (visually hidden), so arrow keys and screen readers work as normal. */
.segments { display: flex; }
.segment { flex: 1; position: relative; }
.segment + .segment { margin-left: calc(-1 * var(--bw-rule)); }
.segment input { position: absolute; opacity: 0; inset: 0; margin: 0; cursor: pointer; }
.segment span {
  display: block;
  padding: var(--s-3) var(--s-2);
  text-align: center;
  font-size: var(--t-base);
  color: var(--c-ink);
  background-color: var(--c-raised);
  border: var(--bw-rule) solid var(--c-ink);
}
.segment input:checked + span { background-color: var(--c-button); color: var(--c-on-button); font-weight: var(--w-semi); }
.segment input:focus-visible + span { outline: 2px solid var(--c-red); outline-offset: 2px; position: relative; }

.settings__actions { display: flex; flex-wrap: wrap; gap: var(--s-3); }
</style>
