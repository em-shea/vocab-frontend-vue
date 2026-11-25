<script setup>
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { signInRoute } from '../lib/signInReturn'
import { SENTENCES_ENABLED, WRITING_ENABLED } from '../featureFlags'
import LanguageMenu from './LanguageMenu.vue'
import { useAuthStore } from '../stores/auth'

// The site's header, fixed to the top of the screen (Emily, 2026-11-23).
// One row at every width: the logo, then the links and the language menu. On a
// phone the page links live in the tab bar along the bottom, so the row holds
// only the logo, Sign in (when signed out) and the globe (Emily, 2026-11-24).

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()
</script>

<template>
  <header class="nav">
    <a class="nav__brand" href="/">
      <span class="brush nav__mark">好</span>
      <span class="nav__wordmark">
        <span class="nav__name">Haohaotiantian</span>
        <span class="label nav__tagline">{{ t('tagline') }}</span>
      </span>
    </a>

    <div class="nav__bar">
    <nav class="nav__links" :aria-label="t('navHome')">
      <!-- The title is the way to the home page. Signed in, "Home" is the
           profile, the reader's own starting point (Emily, 2026-11-22). -->
      <RouterLink v-if="auth.signedIn" class="nav__link nav__link--tabbed" active-class="nav__link--current" :to="{ name: 'profile' }">{{ t('navHome') }}</RouterLink>
      <RouterLink class="nav__link nav__link--tabbed" active-class="nav__link--current" :to="{ name: 'quiz' }">{{ t('navQuiz') }}</RouterLink>
      <RouterLink v-if="SENTENCES_ENABLED" class="nav__link nav__link--tabbed" active-class="nav__link--current" :to="{ name: 'sentences' }">{{ t('navSentences') }}</RouterLink>
      <RouterLink v-if="WRITING_ENABLED" class="nav__link nav__link--tabbed" active-class="nav__link--current" :to="{ name: 'write' }">{{ t('navWriting') }}</RouterLink>
      <RouterLink v-if="!auth.signedIn" class="nav__link nav__link--strong" :to="signInRoute(route.fullPath)">
        {{ t('navSignIn') }}
      </RouterLink>
    </nav>

    <div class="nav__prefs">
      <LanguageMenu />
    </div>
    </div>

  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-4);
  margin: 0 calc(-1 * var(--s-4));
  padding: var(--s-4);
  background-color: var(--c-ground);
  border-bottom: var(--bw-hair) solid var(--c-rule);
}

.nav__brand {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  text-decoration: none;
  color: inherit;
  margin-right: auto;
}

.nav__mark {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  background-color: var(--c-seal);
  color: var(--c-on-red);
  border-radius: var(--r-sm);
  font-size: var(--t-lg);
}

.nav__wordmark { display: flex; flex-direction: column; }
.nav__name {
  font-family: var(--f-display);
  font-weight: var(--w-heavy);
  color: var(--c-ink);
  line-height: 1.1;
}
.nav__tagline { font-size: var(--t-2xs); }

.nav__bar { display: flex; align-items: center; gap: var(--s-4); min-width: 0; }

.nav__links { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-4); }

.nav__link {
  font-family: var(--f-label);
  font-size: var(--t-base);
  font-weight: var(--w-medium);
  color: var(--c-body);
  text-decoration: none;
  white-space: nowrap;
}

.nav__link:hover { color: var(--c-seal); }
.nav__link--current { color: var(--c-ink); font-weight: var(--w-semi); }
.nav__link--strong {
  padding: var(--s-2) var(--s-4);
  border: var(--bw-hair) solid var(--c-ink);
  border-radius: var(--r-pill);
  color: var(--c-ink);
}

.nav__prefs { display: flex; align-items: center; }

@media (max-width: 719px) {
  .nav { padding-top: var(--s-3); padding-bottom: var(--s-3); }
  /* One row: the logo, then sign in and the language menu on the right
     (Emily, 2026-11-24). The page links are in the tab bar along the bottom. */
  .nav { flex-wrap: nowrap; gap: var(--s-3); }
  .nav__brand { margin-right: 0; flex: none; }
  .nav__bar { flex: 1; justify-content: flex-end; gap: var(--s-3); }
  /* The links scroll sideways in one line rather than wrapping. */
  .nav__links {
    flex: 1;
    flex-wrap: nowrap;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
    padding: var(--s-1) 0;
    /* Fade the last link, so it's clear the row scrolls. */
    mask-image: linear-gradient(to right, #000 calc(100% - 1.5rem), transparent);
  }
  .nav__links::-webkit-scrollbar { display: none; }
  .nav__prefs { flex: none; }
  /* These are in the tab bar along the bottom on a phone. */
  .nav__link--tabbed { display: none; }
  .nav__link--strong { padding: var(--s-1) var(--s-3); }
  .nav__links { justify-content: flex-end; mask-image: none; }
}


</style>
