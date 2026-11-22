<script setup>
import { useListLabel } from '../lib/listLabel'
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppButton from './AppButton.vue'
import { useVocabListsStore } from '../stores/vocabLists'
import { usePreferencesStore } from '../stores/preferences'
import { useAuthStore } from '../stores/auth'
import { signUp } from '../api/signup'

// The subscribe band. Appears twice on the page — once under the headline, once
// below the closing band — so it is a component rather than markup repeated twice.

const props = defineProps({
  variant: { type: String, default: 'light' }, // light | band
  // Keeps label/field ids unique when two forms of the same variant share a page.
  idPrefix: { type: String, default: '' },
  // Starting address, e.g. the one sign-in could not find an account for.
  initialEmail: { type: String, default: '' },
  // One column at every width, for narrow panels such as the sign-in page.
  stacked: { type: Boolean, default: false },
  // Leave out the email field when the page already shows the address
  // (sign-in), so it is not asked for twice.
  hideEmail: { type: Boolean, default: false }
})
const uid = computed(() => props.idPrefix || props.variant)

const { t } = useI18n()
const listLabel = useListLabel()
const lists = useVocabListsStore()
const prefs = usePreferencesStore()
const auth = useAuthStore()
const router = useRouter()

const email = ref(props.initialEmail)
const listId = ref('')
const status = ref('idle') // idle | sending | exists | error

// The lists arrive asynchronously, so the select starts empty. Without this it
// stays empty and the form submits with nothing chosen.
watch(
  () => lists.all,
  (all) => { if (!listId.value && all.length) listId.value = all[0].list_id },
  { immediate: true, deep: true }
)

// Load the lists here too: on the home page another section loads them, but
// the form also appears on its own (sign-in, when no account is found).
onMounted(() => { lists.load() })

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
  } catch (err) {
    // Cognito reports an existing account by name; everything else is a genuine
    // failure and should not be dressed up as one.
    status.value = err?.code === 'UsernameExistsException' ? 'exists' : 'error'
    return
  }
  // As on the old site, subscribing also emails a sign-in link, which is the
  // email /subscribed tells the reader to look for. The subscription has
  // already worked, so a failure here must not be reported as a failure to
  // subscribe; the sign-in page can always send another link.
  try {
    await auth.requestSignInLink(email.value)
  } catch {}
  router.push({ name: 'subscribed', query: prefs.language !== 'en' ? { lang: prefs.language } : {} })
}
</script>

<template>
  <form class="sub" :class="[`sub--${variant}`, { 'sub--stacked': stacked }]" @submit.prevent="submit">
    <div class="sub__field">
      <label class="label" :for="`level-${uid}`">{{ t('chooseLevel') }}</label>
      <select :id="`level-${uid}`" v-model="listId" class="sub__select" :disabled="busy">
        <option v-for="list in lists.all" :key="list.list_id" :value="list.list_id">
          {{ listLabel(list.list_name) }}
        </option>
      </select>
    </div>

    <div v-if="!hideEmail" class="sub__field">
      <label class="label" :for="`email-${uid}`">{{ t('email') }}</label>
      <input
        :id="`email-${uid}`"
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

    <!-- Outcomes say what happened and what to do next, rather than just failing. -->
    <p v-if="status === 'exists'" class="sub__msg" role="status">
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

.sub__msg { grid-column: 1 / -1; font-size: var(--t-base); }
.sub__msg--bad { color: var(--c-red); }

/* On the dark band the fields keep their light ground so they stay legible. */
.sub--band .label { color: var(--c-on-dark); opacity: 0.8; }
/* The secondary button is navy, which vanishes on the navy band. Here it takes
 * the print ochre instead, with a light edge so the hard shadow still reads. */
.sub--band :deep(.btn--primary) {
  background-color: var(--c-gold);
  color: var(--c-ink-deep);
  border-color: var(--c-on-dark);
  box-shadow: var(--shadow-hard-on-dark);
}

@media (min-width: 720px) {
  .sub:not(.sub--stacked) { grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) auto; }
}
.sub--stacked { justify-items: start; }
.sub--stacked .sub__field { align-self: stretch; }
</style>
