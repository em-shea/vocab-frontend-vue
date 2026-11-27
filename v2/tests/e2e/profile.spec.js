import { test, expect } from '@playwright/test'
import {
  mockBackend, signedIn, watchForErrors, userActivity, profileQuiz, daysAgo, EMAIL, USER, HSK1, HSK2
} from './support/backend'

// The signed-in learner's own pages: the profile, where sign-in lands, and
// its settings. Both are for signed-in visitors only.

test.describe('profile', () => {
  test('shows who is signed in, today\'s words and recent quizzes', async ({ page }) => {
    await signedIn(page)
    const backend = await mockBackend(page, {
      userActivity: userActivity({
        subscriptions: [...USER.subscriptions, { list_id: HSK2, list_name: 'HSK Level 2', character_set: 'traditional', status: 'subscribed' }]
      }),
      quizzes: [
        profileQuiz('q1', daysAgo(3), 6, 10, HSK2),
        profileQuiz('q2', daysAgo(1), 9, 10)
      ]
    })
    const problems = watchForErrors(page)
    await page.goto('/profile')

    // The name, read with its pinyin. No profile picture for now.
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toContainText('小')
    await expect(heading).toContainText('安')
    // No pinyin on the profile; it is on the settings page (Emily, 2026-11-23).
    await expect(heading.locator('rt')).toHaveCount(0)
    await expect(page.getByText('xiǎo')).toHaveCount(0)
    await expect(page.locator('.head__seal')).toHaveCount(0)
    // When they started; the email is only on the settings page (Emily, 2026-11-22).
    await expect(page.getByText('Studying since June 2021')).toBeVisible()
    await expect(page.getByRole('main').getByText(EMAIL)).toHaveCount(0)

    // The newest word from each list, inviting a quiz and a sentence (no review).
    await expect(page.getByRole('heading', { name: 'Today\'s words' })).toBeVisible()
    const cards = page.getByRole('article')
    await expect(cards).toHaveCount(2)
    await expect(cards.nth(0)).toContainText('爱护')
    await expect(cards.nth(0)).toContainText('HSK Level 1')
    await expect(cards.nth(1)).toContainText('幫助') // HSK 2 is taken in traditional
    // Not done yet: each task is a button (Emily, 2026-11-22).
    await expect(cards.nth(0).getByRole('link', { name: /^Take the HSK Level 1( 简)? quiz$/ }))
      .toHaveAttribute('href', `/quiz?list_id=${HSK1}&date_range=14&ques=10`)
    await expect(cards.nth(0).getByRole('link', { name: 'Write a sentence' })).toHaveAttribute('href', '/sentences')
    await expect(cards.nth(0).locator('.taskbox')).toHaveCount(0)
    await expect(cards.nth(0).getByRole('link', { name: 'Review' })).toHaveCount(0)
    // Yesterday's quiz doesn't count for today's word.
    await expect(cards.nth(0).getByText('done', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: /Quizzes/ })).toContainText('0/2')

    // Not yet done today, so the way to today's quiz; then the week, newest first.
    // One quiz slot per list, each a button until that list's quiz is done.
    await expect(page.locator('.slot').getByRole('link', { name: /^Take the HSK Level 1( 简)? quiz$/ }))
      .toHaveAttribute('href', `/quiz?list_id=${HSK1}&date_range=14&ques=10`)
    await expect(page.locator('.slot').getByRole('link', { name: /^Take the HSK Level 2( 繁)? quiz$/ })).toBeVisible()
    const rows = page.getByRole('table').locator('tbody tr')
    await expect(rows).toHaveCount(2)
    await expect(rows.nth(0)).toContainText('HSK Level 1')
    await expect(rows.nth(0)).toContainText('9 of 10 (90%)')
    await expect(rows.nth(1)).toContainText('HSK Level 2')
    await expect(rows.nth(1)).toContainText('6 of 10 (60%)')

    for (const path of ['/user_activity', '/quizzes']) {
      const call = backend.api.find((c) => c.path === path)
      expect(call, `${path} was not called`).toBeTruthy()
      expect(call.method).toBe('GET')
      expect(call.headers.authorization).toMatch(/^eyJ/)
    }
    expect(problems).toEqual([])
    expect(backend.unexpected).toEqual([])
  })

  test('the daily notification link, /profile#today, opens at today\'s words', async ({ page }) => {
    // A phone, so the name card and streak push today's words below the fold.
    await page.setViewportSize({ width: 390, height: 600 })
    await signedIn(page)
    await mockBackend(page, { userActivity: userActivity(), quizzes: [] })
    await page.goto('/profile#today')

    await expect(page.getByRole('heading', { name: /^Today's words?$/ })).toBeVisible()
    // Scrolled so the section sits just under the sticky nav, not at the page top.
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
    const top = await page.locator('#today').evaluate((el) => el.getBoundingClientRect().top)
    expect(top).toBeGreaterThanOrEqual(0)
    expect(top).toBeLessThan(150)
  })

  test('a quiz taken today ticks off its word and counts towards the total', async ({ page }) => {
    await signedIn(page)
    await mockBackend(page, { userActivity: userActivity(), quizzes: [profileQuiz('q-today', daysAgo(0), 8, 10)] })
    await page.goto('/profile')
    const card = page.getByRole('article').first()
    await expect(card.getByText('done', { exact: true })).toHaveCount(1)
    await expect(card.locator('.taskbox--done')).toHaveCount(1)
    await expect(page.getByRole('heading', { name: /Quizzes/ })).toContainText('1/1')
    // The slot swaps its button for the score and a tick.
    const slot = page.locator('.slot').first()
    await expect(slot).toContainText('8 of 10')
    await expect(slot.locator('.taskbox--done')).toHaveCount(1)
    await expect(page.getByRole('link', { name: /^Take the .* quiz$/ })).toHaveCount(0)
  })

  test('each word card follows its list\'s character set, and names say which', async ({ page }) => {
    await signedIn(page)
    const ua = userActivity({ subscriptions: [...USER.subscriptions, { list_id: HSK2, list_name: 'HSK Level 2', character_set: 'traditional', status: 'subscribed' }] })
    await mockBackend(page, { userActivity: ua })
    await page.goto('/profile?char=simplified')
    const cards = page.getByRole('article')
    await expect(cards.nth(0)).toContainText('HSK LEVEL 1 简', { ignoreCase: true })
    await expect(cards.nth(1)).toContainText('HSK LEVEL 2 繁', { ignoreCase: true })
    await expect(cards.nth(1).locator('.hanzi').first()).toHaveText('幫助')
    await expect(cards.nth(0).locator('.hanzi').first()).toHaveText('爱护')
  })

  test('the stroke order box counts today\'s words practised and lists earlier ones', async ({ page }) => {
    await signedIn(page)
    const ua = userActivity()
    const days = Object.keys(ua.activity).sort()
    ua.activity[days.at(-1)].review_words[0].written = true
    if (days.length > 1) ua.activity[days.at(-2)].review_words.forEach((e) => { e.written = true })
    await mockBackend(page, { userActivity: ua })
    await page.goto('/profile')
    const box = page.locator('section', { has: page.getByRole('heading', { name: /^Stroke order/ }) })
    await expect(box).toContainText('1/1')
    await expect(box.locator('.strokes__list .taskbox--done')).toHaveCount(1)
    await expect(box.getByRole('link', { name: /^Practice the stroke order/ })).toHaveCount(0)
  })

  test('your lists shows the share of each list seen and proficient', async ({ page }) => {
    await signedIn(page)
    await mockBackend(page, { userActivity: userActivity() })
    await page.goto('/profile')
    const section = page.locator('section', { has: page.getByRole('heading', { name: 'Your lists' }) })
    await expect(section.getByRole('heading', { name: 'HSK Level 1' })).toBeVisible()
    await expect(section).toContainText('32% · 48 of 150 words')
    await expect(section).toContainText('4% · 6 of 150 words')
    await expect(section.getByRole('progressbar', { name: 'Seen' })).toHaveAttribute('aria-valuenow', '32')
    // How proficient is worked out: a tooltip on the Proficient label.
    const tip = section.getByRole('tooltip').first()
    await expect(tip).toBeHidden()
    await section.getByRole('button', { name: 'How is proficient worked out?' }).first().click()
    await expect(tip).toBeVisible()
    await expect(tip).toContainText('at least 2 times with at least 80% right')
    await expect(tip).toContainText('Words last sent before Nov 23, 2026 count on quizzes alone.')
  })

  test('your lists failing to load can be retried without breaking the page', async ({ page }) => {
    await signedIn(page)
    await mockBackend(page, { userActivity: userActivity(), progressFails: true })
    await page.goto('/profile')
    await expect(page.getByText("Couldn't load your progress.")).toBeVisible()
    await expect(page.getByRole('article').first()).toBeVisible()
  })

  test('with no name set, a plain heading stands in (not the email) and a name can be chosen', async ({ page }) => {
    await signedIn(page)
    await mockBackend(page, { userActivity: userActivity({ alias: 'Not set', aliasPinyin: 'Not set' }) })
    await page.goto('/profile')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your profile')
    await expect(page.getByRole('main').getByText(EMAIL)).toHaveCount(0)
    await expect(page.locator('.head__seal')).toHaveCount(0)
    await page.getByRole('link', { name: 'Choose a profile name' }).click()
    await expect(page).toHaveURL(/\/profile-settings/)
  })

  test('with no lists, says so and points to managing them', async ({ page }) => {
    await signedIn(page)
    await mockBackend(page, { userActivity: userActivity({ subscriptions: [] }) })
    await page.goto('/profile')
    await expect(page.getByRole('heading', { name: 'Today\'s word' })).toBeVisible()
    await expect(page.getByText('You are not subscribed to any lists.')).toBeVisible()
    await expect(page.getByRole('article')).toHaveCount(0)
    await expect(page.getByRole('main').getByRole('link', { name: 'Manage lists' }).last()).toHaveAttribute('href', '/manage-lists')
  })

  test('a failed load says so and can be retried', async ({ page }) => {
    await signedIn(page)
    const backend = await mockBackend(page, { userActivityFails: true })
    await page.goto('/profile')
    await expect(page.getByRole('alert')).toContainText('We could not load your profile.')
    backend.userActivityFails = false
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('安')
  })

  test('if only the quiz history fails, the rest still shows', async ({ page }) => {
    await signedIn(page)
    const backend = await mockBackend(page, { quizzesFails: true, quizzes: [profileQuiz('q1', daysAgo(2), 5, 5)] })
    await page.goto('/profile')
    await expect(page.getByRole('article')).toHaveCount(1)
    await expect(page.getByRole('alert')).toContainText('We could not load your past quizzes.')
    backend.quizzesFails = false
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(1)
  })

  test('signed out, it sends the visitor to sign in without asking the API', async ({ page }) => {
    const backend = await mockBackend(page)
    await page.goto('/profile')
    await expect(page).toHaveURL(/\/signin/)
    expect(backend.api.some((c) => c.path === '/user_activity')).toBe(false)
  })

  test('the nav leads to the profile once signed in', async ({ page }) => {
    await mockBackend(page)
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/signin')

    await signedIn(page)
    await page.goto('/review')
    await page.getByRole('link', { name: 'Home', exact: true }).click()
    await expect(page).toHaveURL(/\/profile$/)
  })

  test('signing out goes home and the nav offers sign-in again', async ({ page }) => {
    await signedIn(page)
    await mockBackend(page)
    await page.goto('/profile')
    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page).toHaveURL((url) => url.pathname === '/')
    await expect(page.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/signin')
    // The session is gone, not just hidden: the profile now asks for sign-in.
    // (addInitScript re-seeds the session on every load, so check storage now.)
    expect(await page.evaluate(() => Object.keys(localStorage).some((k) => k.endsWith('.idToken')))).toBe(false)
  })

  test('the old /my-quizzes link opens the profile\'s quizzes, keeping its parameters', async ({ page }) => {
    await signedIn(page)
    await mockBackend(page, { quizzes: [profileQuiz('q1', daysAgo(1), 7, 10)] })
    await page.goto('/my-quizzes?char=traditional')
    await expect(page).toHaveURL((url) => url.pathname === '/profile' && url.searchParams.get('char') === 'traditional')
    await expect(page.getByRole('heading', { name: 'Quizzes' })).toBeVisible()
    await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(1)
  })
})

test.describe('profile settings', () => {
  test('names show their pinyin here, except in 中文 mode', async ({ page }) => {
    await signedIn(page)
    await mockBackend(page, { user: { ...USER, user_alias: '小安', user_alias_pinyin: 'xiǎo ān', 'Language preference': undefined } })
    await page.goto('/profile-settings')
    await expect(page.getByLabel('Profile name').locator('option', { hasText: '小安' })).toHaveText(/小安 xiǎo ān/)
  })

  test('choosing a name saves it at once, in the shape the API stores', async ({ page }) => {
    await signedIn(page)
    const backend = await mockBackend(page, { user: { ...USER, user_alias: '小安', user_alias_pinyin: 'xiǎo ān' } })
    const problems = watchForErrors(page)
    await page.goto('/profile-settings')

    await expect(page.getByRole('heading', { name: 'Profile settings' })).toBeVisible()
    await expect(page.getByRole('main').getByText(EMAIL)).toBeVisible() // settings keeps the email
    const select = page.getByLabel('Profile name')
    await expect(select).toHaveValue('小安')

    await select.selectOption('小陈')
    await expect(page.getByRole('status')).toHaveText('Saved.')
    const call = backend.api.find((c) => c.method === 'POST' && c.path === '/update_user')
    expect(call.headers.authorization).toMatch(/^eyJ/)
    // Only the name: the stored emoji and preferences are left alone.
    expect(call.body).toEqual({ user_alias: '小陈', user_alias_pinyin: 'xiǎo chén' })
    expect(problems).toEqual([])
  })

  test('"No name" clears it the way the old screen did', async ({ page }) => {
    await signedIn(page)
    const backend = await mockBackend(page, { user: { ...USER, user_alias: '小安', user_alias_pinyin: 'xiǎo ān' } })
    await page.goto('/profile-settings')
    await page.getByLabel('Profile name').selectOption({ label: 'No name' })
    await expect(page.getByRole('status')).toHaveText('Saved.')
    expect(backend.api.find((c) => c.path === '/update_user').body).toEqual({ user_alias: 'Not set', user_alias_pinyin: 'Not set' })
  })

  test('a name not on the list is kept rather than shown blank', async ({ page }) => {
    await signedIn(page)
    await mockBackend(page, { user: { ...USER, user_alias: '宋江', user_alias_pinyin: 'sòng jiāng' } })
    await page.goto('/profile-settings')
    await expect(page.getByLabel('Profile name')).toHaveValue('宋江')
  })

  test('a failed save says so and can be retried', async ({ page }) => {
    await signedIn(page)
    const backend = await mockBackend(page, { updateUserFails: true })
    await page.goto('/profile-settings')
    await expect(page.getByLabel('Profile name')).toHaveValue('Not set')
    await page.getByLabel('Profile name').selectOption('小安')
    await expect(page.getByRole('status')).toHaveText('We could not save your profile name.')
    backend.updateUserFails = false
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByRole('status')).toHaveText('Saved.')
    expect(backend.api.filter((c) => c.path === '/update_user').map((c) => c.body.user_alias)).toEqual(['小安', '小安'])
  })

  test('a failed load says so and can be retried', async ({ page }) => {
    await signedIn(page)
    const backend = await mockBackend(page, { userFails: true })
    await page.goto('/profile-settings')
    await expect(page.getByRole('alert')).toContainText('We could not load your profile.')
    backend.userFails = false
    await page.getByRole('button', { name: 'Try again' }).click()
    await expect(page.getByLabel('Profile name')).toBeVisible()
  })

  test('signed out, it sends the visitor to sign in', async ({ page }) => {
    const backend = await mockBackend(page)
    await page.goto('/profile-settings')
    await expect(page).toHaveURL(/\/signin/)
    expect(backend.api.some((c) => c.method === 'POST')).toBe(false)
  })

  test('leads back to the profile', async ({ page }) => {
    await signedIn(page)
    await mockBackend(page)
    await page.goto('/profile-settings')
    await page.getByRole('link', { name: 'Back to your profile' }).click()
    await expect(page).toHaveURL(/\/profile$/)
  })
})

test.describe('daily sentences on the profile', () => {
  test('hidden while practice sentences is switched off', async ({ page }) => {
    const { signedIn: signIn, mockBackend: mock, sentencesSwitchedOff } = await import('./support/backend')
    await signIn(page)
    await sentencesSwitchedOff(page)
    await mock(page)
    await page.goto('/profile')
    await expect(page.getByRole('heading', { name: 'Quizzes' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Sentences' })).toHaveCount(0)
  })

  test('switched on, lists today\'s words with their sentences', async ({ page }) => {
    const { signedIn: signIn, mockBackend: mock, sentencesSwitchedOn, ACTIVITY } = await import('./support/backend')
    await signIn(page)
    await sentencesSwitchedOn(page)
    // A list sends one word a day; keep only the word that has a sentence.
    const day = ACTIVITY['2026-11-20']
    await mock(page, { activity: { ...ACTIVITY, '2026-11-20': { ...day, review_words: day.review_words.filter((e) => e.sentence) } } })
    await page.goto('/profile')
    const box = page.locator('section', { has: page.getByRole('heading', { name: /Sentences/ }) })
    await expect(box).toContainText('请爱护你的书。')
    await expect(box).toContainText('1/1')
    await expect(page.getByRole('article').first().getByText('done', { exact: true })).toHaveCount(1)
    await expect(box.getByRole('link', { name: /^Write a sentence/ })).toHaveCount(0)
    await expect(box.getByRole('link', { name: 'Edit your sentence for 爱护' })).toHaveAttribute('href', '/sentences')
  })

  test('switched on, a word without a sentence invites one', async ({ page }) => {
    const { signedIn: signIn, mockBackend: mock, sentencesSwitchedOn, ACTIVITY } = await import('./support/backend')
    await signIn(page)
    await sentencesSwitchedOn(page)
    await mock(page, { activity: ACTIVITY })
    await page.goto('/profile')
    const box = page.locator('section', { has: page.getByRole('heading', { name: /Sentences/ }) })
    await expect(box).toContainText('0/1')
    await expect(box.getByRole('link', { name: 'Write a sentence for 朋友' })).toHaveAttribute('href', '/sentences')
    await expect(box.getByRole('link', { name: 'Your sentences' })).toHaveAttribute('href', '/sentences')
  })
})
