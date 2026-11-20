<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppButton from '../AppButton.vue'
import { profileName, rubyPairs, sealCharacter } from '../../lib/profile'

// Who is signed in: their chosen name (or their email until they pick one),
// when they started, and the ways to their settings and lists.
//
// The old screen showed an emoji avatar. The site uses no emoji now, so the
// name's surname is set as a seal instead, the way the nav's 好 is.

const props = defineProps({
  user: { type: Object, required: true }
})
const emit = defineEmits(['sign-out'])
const { t, locale } = useI18n()

const name = computed(() => profileName(props.user))
const ruby = computed(() => (name.value ? rubyPairs(name.value.name, name.value.pinyin) : null))
const seal = computed(() => sealCharacter(props.user))

const since = computed(() => {
  const date = new Date(props.user.date_created ?? '')
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale.value === 'cn' ? 'zh-CN' : 'en-GB', { month: 'long', year: 'numeric' }).format(date)
})
</script>

<template>
  <section class="head">
    <div class="head__who">
      <span v-if="seal" class="hanzi head__seal" aria-hidden="true">{{ seal }}</span>

      <div class="head__names">
        <h1 v-if="name" class="head__title" lang="zh">
          <ruby v-if="ruby" class="hanzi"><template v-for="pair in ruby" :key="pair.char">{{ pair.char }}<rt class="pinyin"><span>{{ pair.pinyin }}</span></rt></template></ruby>
          <template v-else>
            <span class="hanzi">{{ name.name }}</span>
            <span v-if="name.pinyin" class="pinyin head__pinyin">{{ name.pinyin }}</span>
          </template>
        </h1>
        <h1 v-else class="head__title head__title--email">{{ user.email_address }}</h1>

        <RouterLink v-if="!name" class="head__set-name" :to="{ name: 'profile-settings' }">{{ t('profileSetName') }}</RouterLink>
      </div>
    </div>

    <dl v-if="(name && user.email_address) || since" class="head__facts">
      <div v-if="name && user.email_address">
        <dt class="label">{{ t('email') }}</dt>
        <dd>{{ user.email_address }}</dd>
      </div>
      <div v-if="since">
        <dt class="label">{{ t('profileSince') }}</dt>
        <dd>{{ since }}</dd>
      </div>
    </dl>

    <div class="head__actions">
      <AppButton as="RouterLink" :to="{ name: 'profile-settings' }" variant="primary" shape="sm">{{ t('profileSettings') }}</AppButton>
      <AppButton as="RouterLink" to="/manage-lists" variant="quiet" shape="sm">{{ t('profileManageLists') }}</AppButton>
      <AppButton variant="quiet" shape="sm" @click="emit('sign-out')">{{ t('profileSignOut') }}</AppButton>
    </div>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  flex-direction: column;
  gap: var(--s-6);
  padding: var(--s-6);
  background-color: var(--c-panel);
  border: var(--bw-heavy) solid var(--c-ink);
  box-shadow: var(--shadow-hard);
}

.head__who { display: flex; align-items: center; gap: var(--s-4); min-width: 0; }

.head__seal {
  display: grid;
  place-items: center;
  flex: none;
  width: 4rem;
  height: 4rem;
  background-color: var(--c-seal);
  color: var(--c-on-red);
  font-size: var(--t-2xl);
  line-height: 1;
}

.head__names { display: flex; flex-direction: column; align-items: flex-start; gap: var(--s-2); min-width: 0; }

.head__title { font-size: var(--t-2xl); line-height: var(--lh-tight); }
.head__title ruby { ruby-position: over; }
/* Chrome justifies a short annotation across its base and pulls ā apart into
   a and a floating macron. An inline block is never justified internally. */
.head__title rt > span { display: inline-block; }
.head__title rt { font-size: var(--t-base); font-weight: var(--w-medium); }
.head__pinyin { margin-left: var(--s-3); font-size: var(--t-body); }
.head__title--email { font-size: var(--t-lg); overflow-wrap: anywhere; }

.head__set-name { font-size: var(--t-base); }

.head__facts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-4) var(--s-8);
  margin: 0;
  padding-top: var(--s-4);
  border-top: var(--bw-hair) solid var(--c-rule);
}
.head__facts > div { display: flex; flex-direction: column; gap: var(--s-1); min-width: 0; }
.head__facts dd { margin: 0; color: var(--c-ink); overflow-wrap: anywhere; }

.head__actions { display: flex; flex-wrap: wrap; gap: var(--s-3); }
</style>
