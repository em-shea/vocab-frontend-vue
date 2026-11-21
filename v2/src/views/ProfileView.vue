<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { signInRoute } from '../lib/signInReturn'
import { useI18n } from 'vue-i18n'

import PageShell from '../components/PageShell.vue'
import AppButton from '../components/AppButton.vue'
import ProfileHeader from '../components/profile/ProfileHeader.vue'
import ProfileActions from '../components/profile/ProfileActions.vue'
import ProfileWords from '../components/profile/ProfileWords.vue'
import ProfileQuizzes from '../components/profile/ProfileQuizzes.vue'
import ProfileSentences from '../components/profile/ProfileSentences.vue'
import { SENTENCES_ENABLED } from '../featureFlags'
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
// Daily sentences show on the profile only while the feature is switched on.
const sentencesOn = SENTENCES_ENABLED

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
        <ProfileHeader class="profile__head" :user="user" />
        <ProfileActions class="profile__actions" @sign-out="signOut" />
        <ProfileWords class="profile__words" :words="words" :has-lists="subscriptions.length > 0" :list-name="listName" />
        <div class="profile__side">
          <ProfileQuizzes
            :today="today"
            :history="quizzes"
            :status="quizStatus"
            :quiz-link="quizLink"
            :list-name="listName"
            @retry="loadQuizzes"
          />
          <ProfileSentences v-if="sentencesOn" :activity="user?.activity" />
        </div>
      </template>
    </div>
  </PageShell>
</template>

<style scoped>
/* Phone: name, today's words, quizzes, then the account links.
   Wide: name with the account links beside it, then words and quizzes side by side. */
.profile {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'head' 'words' 'side' 'actions';
  gap: var(--s-12);
  width: 100%;
  max-width: 64rem;
  margin-inline: auto;
}
.profile__head { grid-area: head; }
.profile__actions { grid-area: actions; padding-top: var(--s-6); border-top: var(--bw-hair) solid var(--c-rule); }
.profile__words { grid-area: words; }
.profile__side { grid-area: side; display: flex; flex-direction: column; gap: var(--s-12); min-width: 0; }

@media (min-width: 860px) {
  .profile {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    grid-template-areas: 'head actions' 'words side';
    column-gap: var(--s-8);
    row-gap: var(--s-8);
  }
  .profile__actions {
    align-self: end;
    justify-content: flex-end;
    padding: 0;
    border-top: 0;
  }
}

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
