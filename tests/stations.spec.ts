import { test, expect } from '@playwright/test';

test('create new station', async ({ page }) => {
  await page.locator('body').click();
  await page.goto('http://localhost/');
  await page.getByRole('button', { name: 'Admin' }).click();
  await page.getByRole('link', { name: 'Manage Stations View, add,' }).click();
  await page.getByRole('button', { name: 'Add Station' }).click();
  await page.getByRole('textbox', { name: 'Station Name' }).click();
  await page.getByRole('textbox', { name: 'Station Name' }).fill('Repsol');
  await page.getByRole('textbox', { name: 'Location' }).click();
  await page.getByRole('textbox', { name: 'Location' }).fill('Aveiro');
  await page.locator('div').filter({ hasText: /^\+− Leaflet$/ }).nth(1).click();
  await page.getByRole('button', { name: 'Create Station' }).click();
}); 