import { test, expect } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager';
import { loginData } from '../test-data/loginData';

test.describe('Cart - SauceDemo', () => {
  let pm: PageManager;

  const PRODUCT_ONE = 'Sauce Labs Backpack';
  const PRODUCT_TWO = 'Sauce Labs Bolt T-Shirt';

  test.beforeEach(async ({ page }) => {
    pm = new PageManager(page);
    await pm.onLoginPage().goto();
    await pm
      .onLoginPage()
      .login(loginData.validUser.username, loginData.validUser.password);
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  test('shows items added from inventory', async ({ page }) => {
    const inventoryPage = pm.onInventoryPage();
    const cartPage = pm.onCartPage();

    await inventoryPage.addToCartByName(PRODUCT_ONE);
    await inventoryPage.addToCartByName(PRODUCT_TWO);

    await expect(inventoryPage.cartBadge).toHaveText('2');
    await inventoryPage.openCart();

    await expect(page).toHaveURL(/.*cart.html/);
    await expect(cartPage.items).toHaveCount(2);
    await expect(cartPage.items.filter({ hasText: PRODUCT_ONE })).toBeVisible();
    await expect(cartPage.items.filter({ hasText: PRODUCT_TWO })).toBeVisible();
  });

  test('removes an item from cart and updates the badge', async () => {
    const inventoryPage = pm.onInventoryPage();
    const cartPage = pm.onCartPage();

    await inventoryPage.addToCartByName(PRODUCT_ONE);
    await inventoryPage.addToCartByName(PRODUCT_TWO);
    await inventoryPage.openCart();

    await cartPage.removeItemByName(PRODUCT_ONE);

    await expect(cartPage.items.filter({ hasText: PRODUCT_ONE })).toHaveCount(0);
    await expect(cartPage.items).toHaveCount(1);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('continue shopping returns to inventory and keeps items', async ({ page }) => {
    const inventoryPage = pm.onInventoryPage();
    const cartPage = pm.onCartPage();

    await inventoryPage.addToCartByName(PRODUCT_ONE);
    await inventoryPage.openCart();

    await cartPage.continueShopping();

    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(inventoryPage.cartBadge).toHaveText('1');
    await expect(
      inventoryPage.items
        .filter({ hasText: PRODUCT_ONE })
        .getByRole('button', { name: /remove/i })
    ).toBeVisible();
  });

  test('checkout from cart goes to checkout step one', async ({ page }) => {
    const inventoryPage = pm.onInventoryPage();
    const cartPage = pm.onCartPage();
    const checkoutPage = pm.onCheckoutPage();

    await inventoryPage.addToCartByName(PRODUCT_ONE);
    await inventoryPage.openCart();
    await cartPage.checkout();

    await expect(page).toHaveURL(/.*checkout-step-one.html/);
    await expect(checkoutPage.firstNameInput).toBeVisible();
    await expect(checkoutPage.lastNameInput).toBeVisible();
    await expect(checkoutPage.postalCodeInput).toBeVisible();
  });

  test('empty cart has no items and no badge', async () => {
    const inventoryPage = pm.onInventoryPage();
    const cartPage = pm.onCartPage();

    await inventoryPage.openCart();

    await expect(cartPage.items).toHaveCount(0);
    await expect(inventoryPage.cartBadge).toHaveCount(0);
  });

  test('cart item price matches inventory price', async () => {
    const inventoryPage = pm.onInventoryPage();
    const cartPage = pm.onCartPage();

    const inventoryPriceLocator = inventoryPage.items
      .filter({ hasText: PRODUCT_ONE })
      .locator('.inventory_item_price');

    await inventoryPage.addToCartByName(PRODUCT_ONE);
    const inventoryPrice = (await inventoryPriceLocator.textContent())?.trim();

    expect(inventoryPrice).toBeTruthy();

    await inventoryPage.openCart();
    const cartPriceLocator = cartPage.items
      .filter({ hasText: PRODUCT_ONE })
      .locator('.inventory_item_price');

    await expect(cartPriceLocator).toHaveText(inventoryPrice as string);
  });
});
