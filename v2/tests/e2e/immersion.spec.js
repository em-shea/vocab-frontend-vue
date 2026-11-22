import { test, expect } from '@playwright/test'
import { mockBackend } from './support/backend.js'

// 中文 (immersion) mode shows each HSK word's Chinese definition in place of
// the English (src/data/cn-definitions*.json), in the reader's character set.

test('word cards show the Chinese definition in 中文 mode', async ({ page }) => {
  // The review page: the profile would switch to the account's saved language.
  await mockBackend(page)
  await page.goto('/review?lang=cn')
  const card = page.getByRole('article').filter({ hasText: '爱护' }).first()
  await expect(card).toContainText('爱护')
  await expect(card.locator('.word__definition')).not.toContainText('cherish')
  await expect(card.locator('.word__definition')).toHaveText(/[一-鿿]/)
})

test('English mode keeps the English definition', async ({ page }) => {
  await mockBackend(page)
  await page.goto('/review?lang=en')
  await expect(page.getByRole('article').filter({ hasText: '爱护' }).first().locator('.word__definition')).toContainText('cherish')
})
