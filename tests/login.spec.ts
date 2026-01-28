import { test, expect } from './test-setup';
import { PageManager } from '../page-objects/pageManager';
import { loginData } from '../test-data/loginData';

test.describe('Login - SauceDemo', () => {
  let pm: PageManager;

  test.beforeEach(async ({ page }) => {
    pm = new PageManager(page);
    await pm.onLoginPage().goto();
  });

  test('successful login with valid credentials', async ({ page }) => {
    const loginPage = pm.onLoginPage();
    await loginPage.login(
      loginData.validUser.username,
      loginData.validUser.password
    );

    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('failed login with incorrect password', async ({ page }) => {
    const loginPage = pm.onLoginPage();
    await loginPage.login(
      loginData.wrongPassword.username,
      loginData.wrongPassword.password
    );

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(
      'Username and password do not match'
    );
  });

  test('failed login with locked-out user', async ({ page }) => {
    const loginPage = pm.onLoginPage();
    await loginPage.login(
      loginData.lockedOutUser.username,
      loginData.lockedOutUser.password
    );

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(
      'Sorry, this user has been locked out'
    );
  });

  test('validation: username is required', async ({ page }) => {
    const loginPage = pm.onLoginPage();
    await loginPage.login(
      loginData.missingUsername.username,
      loginData.missingUsername.password
    );

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Username is required');
  });

  test('validation: password is required', async ({ page }) => {
    const loginPage = pm.onLoginPage();
    await loginPage.login(
      loginData.missingPassword.username,
      loginData.missingPassword.password
    );

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Password is required');
  });
});
