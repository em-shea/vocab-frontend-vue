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
    await expect(heading.locator('rt')).toHaveText(['xiǎo', 'ān'])
    await expect(page.locator('.head__seal')).toHaveCount(0)
    // No "Studying since" (Emily, 2026-11-20).
    await expect(page.getByText('June 2021')).toHaveCount(0)
    await expect(page.getByRole('main').getByText(EMAIL)).toBeVisible()

    // The newest word from each list, linked to its quiz and review.
    await expect(page.getByRole('heading', { name: 'Today\'s words' })).toBeVisible()
    const cards = page.getByRole('article')
    await expect(cards).toHaveCount(2)
    await expect(cards.nth(0)).toContainText('爱护')
    await expect(cards.nth(0)).toContainText('HSK Level 1')
    await expect(cards.nth(1)).toContainText('帮助')
    await expect(cards.nth(0).getByRole('link', { name: 'Quiz' }))
      .toHaveAttribute('href', `/quiz?list_id=${HSK1}&date_range=14&ques=10`)
    await expect(cards.nth(0).getByRole('link', { name: 'Review' }))
      .toHaveAttribute('href', `/review?list_id=${HSK1}&date_range=30`)

    // Not yet done today, so the way to today's quiz; then the week, newest first.
    await expect(page.getByRole('link', { name: 'Take today\'s quiz' })).toHaveAttribute('href', `/quiz?list_id=${HSK1}`)
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

  test('today\'s quiz, once done, shows its score', async ({ page }) => {
    await signedIn(page)
    await mockBackend(page, { userActivity: userActivity({ quizToday: true }) })
    await page.goto('/profile')
    await expect(page.getByText('Today\'s quiz is done: 8 of 10 right.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Take today\'s quiz' })).toHaveCount(0)
    await expect(page.getByText('No quizzes in the past week.')).toBeVisible()
  })

  test('with no name set, the email stands in and a name can be chosen', async ({ page }) => {
    await signedIn(page)
    await mockBackend(page, { userActivity: userActivity({ alias: 'Not set', aliasPinyin: 'Not set' }) })
    await page.goto('/profile')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(EMAIL)
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
    await page.getByRole('link', { name: 'Profile', exact: true }).click()
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
  test('choosing a name saves it at once, in the shape the API stores', async ({ page }) => {
    await signedIn(page)
    const backend = await mockBackend(page, { user: { ...USER, user_alias: '小安', user_alias_pinyin: 'xiǎo ān' } })
    const problems = watchForErrors(page)
    await page.goto('/profile-settings')

    await expect(page.getByRole('heading', { name: 'Profile settings' })).toBeVisible()
    await expect(page.getByRole('main').getByText(EMAIL)).toBeVisible()
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
    await mock(page, { activity: ACTIVITY })
    await page.goto('/profile')
    const box = page.locator('section', { has: page.getByRole('heading', { name: 'Sentences' }) })
    await expect(box).toContainText('请爱护你的书。')
    await expect(box.getByRole('link', { name: 'Write a sentence' })).toHaveAttribute('href', '/sentences')
    await expect(box.getByRole('link', { name: 'Your sentences' })).toHaveAttribute('href', '/sentences')
  })
})
