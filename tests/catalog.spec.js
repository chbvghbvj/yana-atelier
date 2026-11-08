const { test, expect } = require('@playwright/test');

test('catalog category filters hide and show the correct dresses', async ({ page }) => {
  await page.goto('https://chbvghbvj.github.io/yana-atelier/', { waitUntil: 'networkidle' });

  const cards = page.locator('#dressGrid .product-card');
  const visibleCards = page.locator('#dressGrid .product-card:not(.filter-hidden)');
  const allButton = page.getByRole('button', { name: 'Всички рокли' });
  const cocktailButton = page.getByRole('button', { name: 'Коктейлни рокли' });
  const formalButton = page.getByRole('button', { name: 'Официални рокли' });

  const allCount = await cards.count();
  expect(allCount).toBeGreaterThan(0);

  await cocktailButton.click();
  await expect(cocktailButton).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => visibleCards.count()).toBeGreaterThan(0);
  for (const card of await visibleCards.all()) await expect(card).toHaveAttribute('data-category', 'short');

  await formalButton.click();
  await expect(formalButton).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => visibleCards.count()).toBeGreaterThan(0);
  for (const card of await visibleCards.all()) await expect(card).toHaveAttribute('data-category', 'prom');

  await allButton.click();
  await expect(allButton).toHaveAttribute('aria-pressed', 'true');
  await expect(visibleCards).toHaveCount(allCount);
});


test('Evelina MAXI opens its own two photos, not regular Evelina photos', async ({ page }) => {
  await page.goto('https://chbvghbvj.github.io/yana-atelier/dress.html?slug=Evelina-MAXI', { waitUntil: 'networkidle' });

  await expect(page.locator('h1')).toHaveText('Evelina MAXI');
  const photos = page.locator('#galleryTrack .gallery-slide img');
  await expect(photos).toHaveCount(2);
  await expect(photos.nth(0)).toHaveAttribute('src', /media\\/evelina\\.maxi1\\.png$/);
  await expect(photos.nth(1)).toHaveAttribute('src', /media\\/evelina-maxi2\\.png$/);
  await expect.poll(() => photos.nth(0).evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  await expect.poll(() => photos.nth(1).evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
});

test('dress photos use a horizontal carousel with working pagination dots', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
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

  await dots.nth(0).click();
  await expect.poll(() => track.evaluate(el => Math.round(el.scrollLeft / el.clientWidth))).toBe(0);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  const rect = await track.evaluate(el => {
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  });
  const y = rect.top + rect.height / 2;
  const xAt = fraction => rect.left + rect.width * fraction;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: xAt(0.85), y }] });
  for (const fraction of [0.7, 0.55, 0.4, 0.25, 0.15]) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: xAt(fraction), y }] });
    await page.waitForTimeout(30);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => track.evaluate(el => Math.round(el.scrollLeft / el.clientWidth))).toBe(1);
  await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
  await cdp.detach();
});
