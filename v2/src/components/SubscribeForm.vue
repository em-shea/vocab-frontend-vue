<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from './AppButton.vue'
import { useVocabListsStore } from '../stores/vocabLists'
import { usePreferencesStore } from '../stores/preferences'
import { signUp } from '../api/signup'

// The subscribe band. Appears twice on the page — once under the quest, once in
// the closing oath — so it is a component rather than markup repeated twice.

defineProps({
  variant: { type: String, default: 'light' } // light | band
})

const { t } = useI18n()
const lists = useVocabListsStore()
const prefs = usePreferencesStore()

const email = ref('')
const listId = ref('')
const status = ref('idle') // idle | sending | done | exists | error

// The lists arrive asynchronously, so the select starts empty. Without this it
// stays empty and the form submits with nothing chosen.
watch(
  () => lists.all,
  (all) => { if (!listId.value && all.length) listId.value = all[0].list_id },
  { immediate: true, deep: true }
)

const busy = computed(() => status.value === 'sending')
const chosen = computed(() => lists.byId(listId.value))

async function submit () {
  if (busy.value) return
  status.value = 'sending'
  try {
    await signUp({
      email: email.value,
      list: chosen.value ?? lists.all[0],
      characterSet: prefs.characterSet
    })
    status.value = 'done'
  } catch (err) {
    // Cognito reports an existing account by name; everything else is a genuine
    // failure and should not be dressed up as one.
    status.value = err?.code === 'UsernameExistsException' ? 'exists' : 'error'
  }
}
</script>

<template>
  <form class="sub" :class="`sub--${variant}`" @submit.prevent="submit">
    <div class="sub__field">
      <label class="label" :for="`level-${variant}`">{{ t('chooseLevel') }}</label>
      <select :id="`level-${variant}`" v-model="listId" class="sub__select" :disabled="busy">
        <option v-for="list in lists.all" :key="list.list_id" :value="list.list_id">
          {{ list.list_name }}
        </option>
      </select>
    </div>

    <div class="sub__field">
      <label class="label" :for="`email-${variant}`">{{ t('email') }}</label>
      <input
        :id="`email-${variant}`"
        v-model="email"
        class="sub__input"
        type="email"
        required
        autocomplete="email"
        :disabled="busy"
        placeholder="you@example.com"
      />
    </div>

    <AppButton
      :variant="variant === 'band' ? 'primary' : 'seal'"
      type="submit"
      as="button"
      :disabled="busy"
    >
      {{ busy ? '…' : t('subscribe') }}
    </AppButton>

    <p class="sub__note">{{ t('subNote') }}</p>

    <!-- Outcomes say what happened and what to do next, rather than just failing. -->
    <p v-if="status === 'done'" class="sub__msg sub__msg--ok" role="status">
      {{ t('questNote') }} Check your inbox to confirm.
    </p>
    <p v-else-if="status === 'exists'" class="sub__msg" role="status">
      That address is already subscribed. <a href="/signin">Sign in</a> to change your lists.
    </p>
    <p v-else-if="status === 'error'" class="sub__msg sub__msg--bad" role="alert">
      Could not subscribe just now. Please try again.
    </p>
  </form>
</template>

<style scoped>
.sub {
  display: grid;
  gap: var(--s-3);
  align-items: end;
  grid-template-columns: 1fr;
}

.sub__field { display: flex; flex-direction: column; gap: var(--s-2); min-width: 0; }

.sub__select,
.sub__input {
  padding: var(--s-3);
  font-family: var(--f-ui);
  font-size: var(--t-body);
  color: var(--c-ink);
  background-color: var(--c-raised);
  border: var(--bw-rule) solid var(--c-ink);
  border-radius: var(--r-sm);
  min-width: 0;
}

.sub__note {
  grid-column: 1 / -1;
  font-size: var(--t-sm);
  color: var(--c-muted);
}

.sub__msg { grid-column: 1 / -1; font-size: var(--t-base); }
.sub__msg--ok { color: var(--c-seal); font-weight: var(--w-semi); }
.sub__msg--bad { color: var(--c-red); }

/* On the dark band the fields keep their light ground so they stay legible. */
.sub--band .label,
.sub--band .sub__note { color: var(--c-on-dark); opacity: 0.8; }
.sub--band .sub__msg--ok { color: var(--c-gold); }

@media (min-width: 720px) {
  .sub { grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) auto; }
  .sub__note { grid-column: 1 / -1; }
}
</style>
