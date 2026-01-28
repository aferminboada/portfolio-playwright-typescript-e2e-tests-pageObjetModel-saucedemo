import { test, expect } from './test-setup';
import { PageManager } from '../page-objects/pageManager';
import { loginData } from '../test-data/loginData';

/**
 * Navigation tests for a real ecommerce:
 * - Menu open/close (accessibility of global navigation).
 * - Navigate to all items from another page (recovery path to catalog).
 * - Logout flow (session safety).
 * - Reset app state clears cart (state integrity for shoppers).
 */
test.describe('Navigation - SauceDemo', () => {
  let pm: PageManager;

  const PRODUCT_ONE = 'Sauce Labs Backpack';

  test.beforeEach(async ({ page }) => {
    pm = new PageManager(page);
    await pm.onLoginPage().goto();
    await pm
      .onLoginPage()
      .login(loginData.validUser.username, loginData.validUser.password);
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  test('opens and closes the navigation menu', async () => {
    const nav = pm.onNavigationMenu();

    await nav.open();
    await expect(nav.allItemsLink).toBeVisible();

    await nav.close();
    await expect(nav.allItemsLink).toBeHidden();
  });

  test('all items link returns to inventory', async ({ page }) => {
    const inventoryPage = pm.onInventoryPage();
    const nav = pm.onNavigationMenu();

    await inventoryPage.addToCartByName(PRODUCT_ONE);
    await inventoryPage.openCart();
    await expect(page).toHaveURL(/.*cart.html/);

    await nav.open();
    await nav.goToAllItems();

    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(inventoryPage.items.first()).toBeVisible();
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('logout returns to login screen', async ({ page }) => {
    const nav = pm.onNavigationMenu();

    await nav.open();
    await nav.logout();

    await expect(page).toHaveURL(/.*saucedemo.com/);
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('reset app state clears cart badge and buttons', async ({ page }) => {
    const inventoryPage = pm.onInventoryPage();
    const nav = pm.onNavigationMenu();

    await inventoryPage.addToCartByName(PRODUCT_ONE);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await nav.open();
    await nav.resetAppState();
    await nav.goToAllItems();

    await page.reload();
    await expect(inventoryPage.items.first()).toBeVisible();
    await expect(inventoryPage.cartBadge).toHaveCount(0);
    await expect(
      inventoryPage.items
        .filter({ hasText: PRODUCT_ONE })
        .getByRole('button', { name: /add to cart/i })
    ).toBeVisible();
  });
});
