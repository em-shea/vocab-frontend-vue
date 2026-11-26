<script setup>
import { useListLabel } from '../lib/listLabel'
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
import ProfileStrokes from '../components/profile/ProfileStrokes.vue'
import ProfileLists from '../components/profile/ProfileLists.vue'
import InstallPrompt from '../components/profile/InstallPrompt.vue'
import StreakCard from '../components/profile/StreakCard.vue'
import { hasFinishedTask } from '../lib/install'
import { progressRows, proficientRule } from '../lib/progress'
import { SENTENCES_ENABLED, WRITING_ENABLED } from '../featureFlags'
import { api } from '../api/client'
import { getSession } from '../api/session'
import { useAuthStore } from '../stores/auth'
import { usePreferencesStore } from '../stores/preferences'
import { useVocabListsStore } from '../stores/vocabLists'
import { latestWords, quizHistory, wordProgress, progressCount } from '../lib/profile'

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
const listLabel = useListLabel()
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

// "Your lists": seen and proficient per list (GET /progress). Loaded on its
// own so a slow or failed answer never holds up the rest of the page.
const progressBody = ref(null)
const progressStatus = ref('loading')
async function loadProgress () {
  progressStatus.value = 'loading'
  try {
    const { data } = await api.progress()
    progressBody.value = data?.data ?? data
    progressStatus.value = 'ready'
  } catch {
    progressStatus.value = 'error'
  }
}
const progressList = computed(() => progressRows(progressBody.value, subscriptions.value))
const rule = computed(() => proficientRule(progressBody.value))

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
  loadProgress()
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
// Each word invites a quiz and a sentence; the cards tick them off and the
// side boxes count them.
const progress = computed(() => wordProgress(words.value, quizzes.value, user.value?.activity))
const quizCount = computed(() => progressCount(progress.value, 'quiz'))
const sentenceCount = computed(() => progressCount(progress.value, 'sentence'))
const strokeCount = computed(() => progressCount(progress.value, 'written'))
const strokesOn = WRITING_ENABLED

// Ask to install only once something has been finished (Emily, 2026-11-24).
const finishedSomething = computed(() => hasFinishedTask(quizzes.value, user.value?.activity))

// When someone's lists are in both character sets, each list name says which
// it is in: "HSK Level 1 简", "HSK Level 3 繁", or "简 繁" for a list taken in
// both (Emily, 2026-11-22). With only one set in use, names stay plain.
const SET_MARK = { simplified: '简', traditional: '繁' }
const setsOf = (id) => ['simplified', 'traditional']
  .filter((set) => subscriptions.value.some((s) => s.list_id === id && s.character_set === set))
const bothSets = computed(() =>
  new Set(subscriptions.value.map((s) => s.character_set).filter((set) => SET_MARK[set])).size > 1)

// A card follows its list's character set, not the globe menu (Emily,
// 2026-11-22); a list taken in both sets follows the menu.
const setFor = (id) => { const sets = setsOf(id); return sets.length === 1 ? sets[0] : '' }

function listName (id) {
  const name = listLabel(rawListName(id))
  if (!bothSets.value) return name
  const marks = setsOf(id).map((set) => SET_MARK[set]).join(' ')
  return marks ? `${name} ${marks}` : name
}

function rawListName (id) {
  return lists.byId(id)?.list_name ??
    subscriptions.value.find((s) => s.list_id === id)?.list_name ??
    t('profileListFallback')
}

</script>

<template>
  <PageShell width="wide">
    <div class="profile">
      <p v-if="status === 'loading'" class="profile__state" role="status">{{ t('profileLoading') }}</p>

      <div v-else-if="status === 'error'" class="profile__state" role="alert">
        <h1 class="profile__title">{{ t('profileTitle') }}</h1>
        <p>{{ t('profileError') }}</p>
        <AppButton variant="primary" @click="load">{{ t('profileRetry') }}</AppButton>
      </div>

      <template v-else>
        <!-- Name card, streak, then the install prompt when it shows. -->
        <div class="profile__head">
          <ProfileHeader :user="user">
            <ProfileActions @sign-out="signOut" />
          </ProfileHeader>
          <!-- The streak right under the name card (Emily, 2026-11-24). -->
          <div v-if="progressBody?.streak" class="profile__streak">
            <StreakCard :streak="progressBody.streak" />
            <RouterLink class="profile__board" :to="{ name: 'leaderboard' }">{{ t('leaderboardTitle') }}</RouterLink>
          </div>
          <InstallPrompt :ready="finishedSomething" />
        </div>
        <div class="profile__words">
          <ProfileWords :progress="progress" :has-lists="subscriptions.length > 0" :list-name="listName" :set-for="setFor" />
        </div>
        <div class="profile__side">
          <ProfileQuizzes
            :count="quizCount"
            :history="quizzes"
            :status="quizStatus"
            :progress="progress"
            :list-name="listName"
            @retry="loadQuizzes"
          />
          <ProfileSentences v-if="sentencesOn" :progress="progress" :count="sentenceCount" :activity="user?.activity" />
          <ProfileStrokes v-if="strokesOn" :progress="progress" :count="strokeCount" :activity="user?.activity" />
        </div>
        <!-- Your lists at the foot of the page, after the activities (Emily, 2026-11-23). -->
        <ProfileLists class="profile__lists" :rows="progressList" :rule="rule" :status="progressStatus" :list-name="listName" @retry="loadProgress" />
      </template>
    </div>
  </PageShell>
</template>

<style scoped>
/* The name card (with the account links) on top; then, on a phone, words and
   the side boxes in turn, and on a wide screen side by side. */
.profile {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'head' 'words' 'side' 'lists';
  gap: var(--s-12);
  width: 100%;
  max-width: 64rem;
  margin-inline: auto;
}
.profile__head { grid-area: head; display: flex; flex-direction: column; gap: var(--s-8); min-width: 0; }
.profile__streak { display: flex; flex-direction: column; gap: var(--s-2); min-width: 0; }
.profile__board { align-self: flex-end; font-size: var(--t-base); }
.profile__words { grid-area: words; display: flex; flex-direction: column; gap: var(--s-12); min-width: 0; }
.profile__lists { grid-area: lists; min-width: 0; align-self: start; }
/* Profile cards: a dark thin border and no shadow; only the streak card keeps
   the heavy border and shadow, so it stands out (Emily, 2026-11-24). */
.profile__words :deep(.word) { border: var(--bw-rule) solid var(--c-ink); border-radius: 0; box-shadow: none; }
.profile__side { grid-area: side; display: flex; flex-direction: column; gap: var(--s-12); min-width: 0; }

@media (min-width: 860px) {
  .profile {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    /* Your lists sits under today's words, beside the taller side column, so
       there's no gap under the words (Emily, 2026-11-24). */
    grid-template-areas: 'head head' 'words side' 'lists side';
    grid-template-rows: auto auto 1fr;
    column-gap: var(--s-8);
    row-gap: var(--s-8);
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
