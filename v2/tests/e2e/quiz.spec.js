import { test, expect } from '@playwright/test'
import { mockBackend, signedIn, watchForErrors, HSK1, HSK2, QUIZ_REVIEW } from './support/backend'

// Taking a quiz: the screen the daily email's "take the quiz" link opens. Its
// URL parameters (list_id, date_range, ques) are the old site's and must keep
// working.

const WORDS = QUIZ_REVIEW[HSK1].map((e) => e.word)
const FIELDS = ['simplified', 'traditional', 'pinyin', 'definition']
const fits = (word, text) => FIELDS.some((f) => word[f] === text)

/**
 * Answers the question on screen. Works out the right option from the prompt,
 * the way a learner would: the right option is the one whose word the prompt
 * describes.
 */
async function answer (page, { correctly = true } = {}) {
  const prompt = (await page.getByRole('heading', { level: 2 }).innerText()).trim()
  const options = page.locator('.question__options button')
  await expect(options).toHaveCount(4)
  const texts = (await options.allInnerTexts()).map((s) => s.trim())
  const isRight = (text) => WORDS.some((w) => fits(w, text) && fits(w, prompt))
  const rightIndex = texts.findIndex(isRight)
  expect(rightIndex, `no option fits "${prompt}" among ${texts.join(' | ')}`).toBeGreaterThan(-1)
  expect(texts.filter(isRight), 'more than one option fits the prompt').toHaveLength(1)
  const index = correctly ? rightIndex : texts.findIndex((t, i) => i !== rightIndex)
  await options.nth(index).click()
  return { prompt, right: texts[rightIndex], chosen: texts[index] }
}

async function finish (page) {
  await page.getByRole('button', { name: /Next question|See your score/ }).click()
}

test('a whole quiz, signed out: four options a question, a score at the end', async ({ page }) => {
  const backend = await mockBackend(page, { review: QUIZ_REVIEW })
  const problems = watchForErrors(page)
  await page.goto('/quiz?ques=5')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('HSK Level 1 quiz')
  for (let n = 1; n <= 5; n++) {
    await expect(page.getByText(`Question ${n} of 5`)).toBeVisible()
    await answer(page)
    await expect(page.getByRole('status').filter({ hasText: 'Correct.' })).toBeAttached()
    await finish(page)
  }

  await expect(page.getByRole('heading', { name: 'Quiz complete' })).toBeVisible()
  await expect(page.getByText('You got 5 of 5 right (100%).')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sign in to keep your quiz results.' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Review these words' })).toHaveAttribute('href', new RegExp(`/review\\?list_id=${HSK1}`))

  expect(backend.api.find((c) => c.path === '/review').query).toEqual({ list_id: HSK1, date_range: '30' })
  expect(backend.api.some((c) => c.path === '/quizzes'), 'signed-out results must not be sent').toBe(false)
  expect(problems).toEqual([])
})

test('a wrong answer is marked and the right one shown', async ({ page }) => {
  await mockBackend(page, { review: QUIZ_REVIEW })
  await page.goto('/quiz?ques=5')

  const { right, chosen } = await answer(page, { correctly: false })
  // Read out, not shown: the marks carry it on screen.
  await expect(page.getByRole('status').filter({ hasText: `Not quite. The answer is ${right}.` })).toBeAttached()
  for (const text of [/^Not quite/, /^Choose the/]) {
    const box = await page.locator('.question p').filter({ hasText: text }).boundingBox()
    expect(box.width * box.height, `${text} takes no space on screen`).toBeLessThanOrEqual(1)
  }
  await expect(page.getByText(/Words sent in the past/)).toHaveCount(0)
  await expect(page.locator('.option--wrong')).toContainText(chosen)
  await expect(page.locator('.option--wrong')).toContainText('✗')
  await expect(page.locator('.option--right')).toContainText('✓')
  // One try per question.
  await expect(page.locator('.question__options button').first()).toBeDisabled()
  // Keyboard users are taken straight to the way on.
  await expect(page.getByRole('button', { name: 'Next question' })).toBeFocused()
})

test('after answering, the answers can be looked at in full', async ({ page }) => {
  await mockBackend(page, { review: QUIZ_REVIEW })
  await page.goto('/quiz')
  await answer(page)
  await page.getByRole('button', { name: 'Show answers' }).click()
  await expect(page.getByRole('article')).toHaveCount(4)
  await page.getByRole('button', { name: 'Hide answers' }).click()
  await expect(page.getByRole('article')).toHaveCount(0)
})

test('signed in, results are saved in the shape the API stores', async ({ page }) => {
  await signedIn(page)
  const backend = await mockBackend(page, { review: QUIZ_REVIEW })
  await page.goto('/quiz?ques=5&date_range=14')

  await answer(page, { correctly: false })
  await finish(page)
  for (let n = 2; n <= 5; n++) { await answer(page); await finish(page) }

  await expect(page.getByText('You got 4 of 5 right (80%).')).toBeVisible()
  await expect(page.getByText('Your results are saved.')).toBeVisible()

  const call = backend.api.find((c) => c.method === 'POST' && c.path === '/quizzes')
  expect(call.headers.authorization).toBeTruthy()
  expect(call.body).toMatchObject({
    list_id: HSK1,
    character_set: 'simplified',
    date_range: 14,
    question_quantity: 5,
    correct_answers: 4
  })
  expect(call.body.quiz_data).toHaveLength(5)
  expect(call.body.quiz_data[0]).toMatchObject({ was_answer_correct: false })
  expect(call.body.quiz_data[0].correct_answer).toMatchObject({ list_id: HSK1, word: expect.any(Object) })
  // The stored record names the character field, never the app's internal 'characters'.
  for (const q of call.body.quiz_data) {
    expect(['simplified', 'pinyin', 'definition']).toContain(q.test_set.question)
    expect(['simplified', 'pinyin', 'definition']).toContain(q.test_set.answers)
  }
})

test('a failed save says so and can be retried', async ({ page }) => {
  await signedIn(page)
  const backend = await mockBackend(page, { review: QUIZ_REVIEW, saveQuizFails: true })
  await page.goto('/quiz?ques=5')
  for (let n = 1; n <= 5; n++) { await answer(page); await finish(page) }

  await expect(page.getByText('We could not save your results.')).toBeVisible()
  backend.saveQuizFails = false
  await page.getByRole('button', { name: 'Try saving again' }).click()
  await expect(page.getByText('Your results are saved.')).toBeVisible()
  expect(backend.api.filter((c) => c.path === '/quizzes')).toHaveLength(2)
})

test('another quiz starts over with the same words, without fetching again', async ({ page }) => {
  const backend = await mockBackend(page, { review: QUIZ_REVIEW })
  await page.goto('/quiz?ques=5')
  for (let n = 1; n <= 5; n++) { await answer(page); await finish(page) }
  await page.getByRole('button', { name: 'Another quiz' }).click()
  await expect(page.getByText('Question 1 of 5')).toBeVisible()
  expect(backend.api.filter((c) => c.path === '/review')).toHaveLength(1)
})

test('a link from an old email opens the quiz it describes', async ({ page }) => {
  const backend = await mockBackend(page, { review: QUIZ_REVIEW })
  await page.goto(`/quiz?list_id=${HSK1}&date_range=7&ques=20&char=simplified`)
  await expect(page.getByText('Question 1 of 20')).toBeVisible()
  expect(backend.api.filter((c) => c.path === '/review')).toHaveLength(1)
  expect(backend.api.find((c) => c.path === '/review').query).toEqual({ list_id: HSK1, date_range: '7' })
})

test('a link with nonsense in it falls back to the defaults', async ({ page }) => {
  const backend = await mockBackend(page, { review: QUIZ_REVIEW })
  await page.goto('/quiz?list_id=nope&date_range=9999&ques=3')
  await expect(page.getByText('Question 1 of 10')).toBeVisible()
  expect(backend.api.find((c) => c.path === '/review').query).toEqual({ list_id: HSK1, date_range: '30' })
  await expect(page).toHaveURL(/ques=10/)
})

test('changing the quiz fetches the new list and keeps the link shareable', async ({ page }) => {
  const backend = await mockBackend(page, { review: QUIZ_REVIEW })
  await page.goto('/quiz')
  await expect(page.getByText('Question 1 of 10')).toBeVisible()

  await page.getByRole('button', { name: 'Change quiz' }).click()
  await page.getByLabel('Vocab list').selectOption({ label: 'HSK Level 2' })
  await page.getByRole('radio', { name: 'Past 14 days' }).check()
  await page.getByRole('radio', { name: '20', exact: true }).check()
  await page.getByRole('button', { name: 'Start quiz' }).click()

  await expect(page).toHaveURL(new RegExp(`list_id=${HSK2}.*date_range=14.*ques=20|ques=20.*list_id=${HSK2}`))
  await expect.poll(() => backend.api.filter((c) => c.path === '/review').at(-1).query)
    .toEqual({ list_id: HSK2, date_range: '14' })
  // HSK 2 has one word in the stand-in data: too few to quiz on.
  await expect(page.getByText('There are not enough words in that time for a quiz.')).toBeVisible()
})

test('cancelling the settings leaves the quiz in progress alone', async ({ page }) => {
  const backend = await mockBackend(page, { review: QUIZ_REVIEW })
  await page.goto('/quiz')
  const { prompt } = await answer(page)
  await page.getByRole('button', { name: 'Change quiz' }).click()
  await page.getByRole('radio', { name: 'Past 7 days' }).check()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(prompt)
  await expect(page.getByRole('button', { name: 'Next question' })).toBeVisible()
  expect(backend.api.filter((c) => c.path === '/review')).toHaveLength(1)
})

test('traditional characters throughout when chosen', async ({ page }) => {
  await mockBackend(page, { review: QUIZ_REVIEW })
  await page.goto('/quiz?ques=20&char=traditional')
  const seen = []
  for (let n = 1; n <= 20; n++) {
    seen.push(await page.locator('.question').innerText())
    await answer(page)
    await finish(page)
  }
  const all = seen.join('\n')
  // Forms that differ between the sets: simplified must never show.
  for (const simplified of ['学习', '爱护', '帮助', '老师', '喜欢']) expect(all).not.toContain(simplified)
  expect(all).toMatch(/學習|愛護|幫助|老師|喜歡/)
})

test('a failed load offers a retry that works once the API is back', async ({ page }) => {
  const backend = await mockBackend(page, { review: QUIZ_REVIEW, reviewFails: true })
  await page.goto('/quiz')
  await expect(page.getByRole('alert')).toContainText('could not load the words')
  backend.reviewFails = false
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByText('Question 1 of 10')).toBeVisible()
})

test('reads in Chinese', async ({ page }) => {
  await mockBackend(page, { review: QUIZ_REVIEW })
  await page.goto('/quiz?lang=cn&ques=5')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('HSK Level 1 测验')
  await expect(page.getByText('第 1 题，共 5 题')).toBeVisible()
  await expect(page.getByText(/^选择(词义|拼音|汉字)$/)).toBeAttached()
})

test('the nav links here', async ({ page }) => {
  await mockBackend(page, { review: QUIZ_REVIEW })
  await page.goto('/review')
  await page.getByRole('navigation').getByRole('link', { name: 'Quiz' }).click()
  await expect(page.getByText('Question 1 of 10')).toBeVisible()
})
