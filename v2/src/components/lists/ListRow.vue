<script setup>
import { useListLabel } from '../../lib/listLabel'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../AppButton.vue'

// One list in one character set, with the single thing that can be done to it.
// The 简 / 繁 stamp is decoration; the character set is also written out, so
// the stamp is never the only way to tell the two apart.

const props = defineProps({
  list: { type: Object, required: true },
  action: { type: String, required: true }, // subscribe | unsubscribe
  busy: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})
defineEmits(['act'])
const { t } = useI18n()
const listLabel = useListLabel()

const traditional = computed(() => props.list.character_set === 'traditional')
const setName = computed(() => t(traditional.value ? 'listsTraditional' : 'listsSimplified'))
const name = computed(() => listLabel(props.list.list_name) || t('listsUnnamed'))
</script>

<template>
  <li class="row" :data-list="list.unique_list_id">
    <span class="row__stamp" aria-hidden="true">{{ traditional ? '繁' : '简' }}</span>
    <span class="row__name">
      <span class="row__list">{{ name }}</span>
      <span class="row__set">{{ setName }}</span>
    </span>
    <AppButton
      :variant="action === 'subscribe' ? 'primary' : 'quiet'"
      shape="sm"
      :disabled="disabled || busy"
      :aria-label="t(action === 'subscribe' ? 'listsSubscribeTo' : 'listsUnsubscribeFrom', { list: name, set: setName })"
      @click="$emit('act', list)"
    >
      {{ busy ? '…' : t(action === 'subscribe' ? 'listsSubscribe' : 'listsUnsubscribe') }}
    </AppButton>
  </li>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  padding: var(--s-3) var(--s-4);
  background-color: var(--c-panel);
  border: var(--bw-rule) solid var(--c-ink);
}

.row__stamp {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.25rem;
  height: 2.25rem;
  font-family: var(--f-hanzi);
  font-size: var(--t-md);
  line-height: 1;
  color: var(--c-on-red);
  background-color: var(--c-seal);
}

.row__name { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.row__list { font-weight: var(--w-semi); color: var(--c-ink); }
.row__set { font-size: var(--t-base); color: var(--c-muted); }
</style>
