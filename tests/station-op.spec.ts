import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost/signup');
  await page.getByRole('link', { name: 'Sign up' }).click();
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('joao');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('joao@ua.pt');
  await page.getByRole('textbox', { name: 'First Name' }).click();
  await page.getByRole('textbox', { name: 'First Name' }).fill('Joao');
  await page.getByRole('textbox', { name: 'Last Name' }).click();
  await page.getByRole('textbox', { name: 'Last Name' }).fill('Samtos');
  await page.getByRole('combobox', { name: 'User Type' }).click();
  await page.getByText('Manage your charging stations', { exact: true }).click();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123123');
  await page.getByRole('button', { name: 'Sign Up' }).click();
  
  // Wait for navigation after signup
  await page.waitForURL('**/signin');
  
  await page.getByRole('textbox', { name: 'Username' }).click();
  await page.getByRole('textbox', { name: 'Username' }).fill('joao');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123123');
  
  // Submit form with Enter and wait for navigation
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');
  await page.waitForURL('**/operator');
  
  await page.getByRole('button', { name: 'Claim Station' }).click();
  await page.getByRole('button', { name: 'Add Charging Station' }).click();
  await page.getByRole('textbox', { name: 'Charger Type' }).click();
  await page.getByRole('textbox', { name: 'Charger Type' }).click();
  await page.getByRole('combobox').click();
  await page.getByLabel('Under Maintenance').getByText('Under Maintenance').click();
  await page.getByRole('button', { name: 'Add Charger' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
});