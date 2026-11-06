const { test, expect } = require('@playwright/test');

test('catalog category filters hide and show the correct dresses', async ({ page }) => {
  await page.goto('https://chbvghbvj.github.io/yana-atelier/', { waitUntil: 'networkidle' });

  const cards = page.locator('#dressGrid .product-card');
  const allButton = page.getByRole('button', { name: 'Всички рокли' });
  const cocktailButton = page.getByRole('button', { name: 'Коктейлни рокли' });
  const formalButton = page.getByRole('button', { name: 'Официални рокли' });

  await expect(cards).toHaveCount(3, { timeout: 15000 });
  await expect(cards).toHaveCount(3);

  await cocktailButton.click();
  await expect(cocktailButton).toHaveAttribute('aria-pressed', 'true');
  await expect(cards).toHaveCount(3);
  for (const card of await cards.all()) await expect(card).toBeVisible();

  await formalButton.click();
  await expect(formalButton).toHaveAttribute('aria-pressed', 'true');
  for (const card of await cards.all()) await expect(card).toBeHidden();

  await allButton.click();
  await expect(allButton).toHaveAttribute('aria-pressed', 'true');
  for (const card of await cards.all()) await expect(card).toBeVisible();
});


test('dress photos use a horizontal carousel with working pagination dots', async ({ page }) => {
  await page.goto('https://chbvghbvj.github.io/yana-atelier/dress.html?slug=siyana', { waitUntil: 'networkidle' });
  const track = page.locator('#galleryTrack');
  const dots = page.locator('.gallery-dot');
  await expect(track.locator('.gallery-slide')).toHaveCount(3, { timeout: 15000 });
  await expect(dots).toHaveCount(3);
  await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true');
  await dots.nth(1).click();
  await expect.poll(() => track.evaluate(el => Math.round(el.scrollLeft / el.clientWidth))).toBe(1);
  await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
  await dots.nth(2).click();
  await expect.poll(() => track.evaluate(el => Math.round(el.scrollLeft / el.clientWidth))).toBe(2);
  await expect(dots.nth(2)).toHaveAttribute('aria-current', 'true');
});
