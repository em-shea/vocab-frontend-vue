<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signInRoute } from '../lib/signInReturn'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import AppButton from '../components/AppButton.vue'
import ProfileHeader from '../components/profile/ProfileHeader.vue'
import ProfileWords from '../components/profile/ProfileWords.vue'
import ProfileQuizzes from '../components/profile/ProfileQuizzes.vue'
import { api } from '../api/client'
import { getSession } from '../api/session'
import { useAuthStore } from '../stores/auth'
import { usePreferencesStore } from '../stores/preferences'
import { useVocabListsStore } from '../stores/vocabLists'
import { latestWords, todaysQuiz, quizHistory } from '../lib/profile'

// The signed-in learner's page: who they are, today's word from each list
// they take, and their quizzes. Where sign-in lands.
//
// Two requests, so a failure in one does not blank the other:
//   GET /user_activity  the user record, subscriptions, and ten days of words
//                       and quizzes (vocab: get_user_activity/app.py)
//   GET /quizzes        every quiz saved in the past week (get_quiz_results)
//
// The rules are in lib/profile.js; this file only loads and lays out.

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const prefs = usePreferencesStore()
const lists = useVocabListsStore()

const user = ref(null)
const status = ref('loading') // loading | ready | error
const quizzes = ref([])
const quizStatus = ref('loading') // loading | ready | error

async function load () {
  status.value = 'loading'
  try {
    const { data } = await api.userActivity()
    user.value = data?.data ?? data
    status.value = 'ready'
  } catch {
    status.value = 'error'
  }
}

async function loadQuizzes () {
  quizStatus.value = 'loading'
  try {
    // The handler reads date_range from a request body, which a GET cannot
    // carry, so it always answers with the past seven days.
    const { data } = await api.quizzes(7)
    quizzes.value = quizHistory(data?.data ?? [])
    quizStatus.value = 'ready'
  } catch {
    quizStatus.value = 'error'
  }
}

onMounted(async () => {
  // As the old screen did, a signed-out visitor is sent to sign in, which
  // brings them back here once the emailed link is followed.
  if (!(await getSession())) {
    router.replace(signInRoute(route.fullPath))
    return
  }
  lists.load()
  await Promise.all([load(), loadQuizzes()])
})

function signOut () {
  auth.signOut()
  // Preference changes stay on this device from now on.
  prefs.signedIn = false
  router.push({ name: 'home' })
}

const subscriptions = computed(() => user.value?.subscriptions ?? [])
const words = computed(() => latestWords(user.value?.activity, subscriptions.value))
const today = computed(() => todaysQuiz(user.value?.activity))

function listName (id) {
  return lists.byId(id)?.list_name ??
    subscriptions.value.find((s) => s.list_id === id)?.list_name ??
    t('profileListFallback')
}

const quizLink = computed(() =>
  subscriptions.value.length ? { name: 'quiz', query: { list_id: subscriptions.value[0].list_id } } : { name: 'quiz' }
)
</script>

<template>
  <PageShell width="wide">
    <div class="profile">
      <p v-if="status === 'loading'" class="profile__state" role="status">{{ t('profileLoading') }}</p>

      <div v-else-if="status === 'error'" class="profile__state" role="alert">
        <h1 class="profile__title">{{ t('profileTitle') }}</h1>
        <p>{{ t('profileError') }}</p>
        <AppButton variant="seal" @click="load">{{ t('profileRetry') }}</AppButton>
      </div>

      <template v-else>
        <ProfileHeader :user="user" @sign-out="signOut" />
        <ProfileWords :words="words" :has-lists="subscriptions.length > 0" :list-name="listName" />
        <ProfileQuizzes
          :today="today"
          :history="quizzes"
          :status="quizStatus"
          :quiz-link="quizLink"
          :list-name="listName"
          @retry="loadQuizzes"
        />
      </template>
    </div>
  </PageShell>
</template>

<style scoped>
.profile { display: flex; flex-direction: column; gap: var(--s-12); width: 100%; max-width: 52rem; margin-inline: auto; }

.profile__state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--s-4);
  padding: var(--s-8) 0;
  color: var(--c-body);
}
.profile__title { font-size: var(--t-xl); }
</style>
