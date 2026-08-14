<script setup>
import { useI18n } from 'vue-i18n'
import LanguageMenu from './LanguageMenu.vue'
import { useAuthStore } from '../stores/auth'

// Home, Quiz, Review, Sign in — replacing the old navBar. Quiz and Review are
// not ported yet, so they point at the current site rather than at dead routes.

const { t } = useI18n()
const auth = useAuthStore()
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

    <nav class="nav__links" :aria-label="t('navHome')">
      <a class="nav__link nav__link--current" href="/">{{ t('navHome') }}</a>
      <a class="nav__link" href="/quiz">{{ t('navQuiz') }}</a>
      <a class="nav__link" href="/review">{{ t('navReview') }}</a>
      <a class="nav__link nav__link--strong" href="/signin">
        {{ auth.signedIn ? auth.email : t('navSignIn') }}
      </a>
    </nav>

    <div class="nav__prefs">
      <LanguageMenu />
    </div>

  </header>
</template>

<style scoped>
.nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s-4);
  padding: var(--s-4) 0;
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

.nav__links { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s-4); }

.nav__link {
  font-family: var(--f-label);
  font-size: var(--t-base);
  font-weight: var(--w-medium);
  color: var(--c-body);
  text-decoration: none;
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
  .nav__brand { margin-right: 0; width: 100%; }
  .nav__links { order: 3; width: 100%; }
}
</style>
