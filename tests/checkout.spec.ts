import { test, expect } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager';
import { loginData } from '../test-data/loginData';

/**
 * Checkout tests for a real-world flow:
 * - End-to-end purchase with valid data (core revenue path).
 * - Required field validations (data integrity and UX feedback).
 * - Cancel path from step one (user control and state safety).
 */
test.describe('Checkout - SauceDemo', () => {
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

  /**
   * Validates end-to-end checkout completion with valid customer data.
  * Risk covered: Detects broken steps in the checkout funnel (shipping info, review step, or finish action).
  * Business value: Protects the primary revenue path by confirming successful order completion
   */
  test('completes checkout with valid data', async ({ page }) => {
    const inventoryPage = pm.onInventoryPage();
    const cartPage = pm.onCartPage();
    const checkoutPage = pm.onCheckoutPage();

    await inventoryPage.addToCartByName(PRODUCT_ONE);
    await inventoryPage.openCart();
    await cartPage.checkout();

    await expect(page).toHaveURL(/.*checkout-step-one.html/);
    await checkoutPage.fillShippingInfo('Patricia', 'Gomez', '12345');
    await checkoutPage.continue();

    await expect(page).toHaveURL(/.*checkout-step-two.html/);
    await expect(checkoutPage.summaryInfo).toBeVisible();
    await expect(page.locator('.cart_item')).toContainText(PRODUCT_ONE);

    await checkoutPage.finish();

    await expect(page).toHaveURL(/.*checkout-complete.html/);
    await expect(checkoutPage.completeHeader).toContainText('Thank you for your order');
  });

  /**
   * Validates required first name field during checkout.
  * Risk covered: Detects missing or broken validations that could allow incomplete customer data.
  * Business value: Preserves data quality and provides clear user feedback, reducing checkout errors.
   */
  test('validation: first name is required', async ({ page }) => {
    const inventoryPage = pm.onInventoryPage();
    const cartPage = pm.onCartPage();
    const checkoutPage = pm.onCheckoutPage();

    await inventoryPage.addToCartByName(PRODUCT_ONE);
    await inventoryPage.openCart();
    await cartPage.checkout();

    await checkoutPage.fillShippingInfo('', 'Gomez', '12345');
    await checkoutPage.continue();

    await expect(page.locator('[data-test="error"]')).toContainText(
      'First Name is required'
    );
  });

  /**
   * Validates required last name field during checkout.
  * Risk covered: Detects missing or broken validations that could allow incomplete customer data.
  * Business value: Preserves data quality and provides clear user feedback, reducing checkout errors.
   */
  test('validation: last name is required', async ({ page }) => {
    const inventoryPage = pm.onInventoryPage();
    const cartPage = pm.onCartPage();
    const checkoutPage = pm.onCheckoutPage();

    await inventoryPage.addToCartByName(PRODUCT_ONE);
    await inventoryPage.openCart();
    await cartPage.checkout();

    await checkoutPage.fillShippingInfo('Patricia', '', '12345');
    await checkoutPage.continue();

    await expect(page.locator('[data-test="error"]')).toContainText(
      'Last Name is required'
    );
  });
  /** 
  * Validates required postal code field during checkout.
  * Risk covered: Detects missing validation that could allow incomplete or invalid shipping data.
  * Business value: Preserves data integrity for shipping and billing processes. 
  */  
  test('validation: postal code is required', async ({ page }) => {
    const inventoryPage = pm.onInventoryPage();
    const cartPage = pm.onCartPage();
    const checkoutPage = pm.onCheckoutPage();

    await inventoryPage.addToCartByName(PRODUCT_ONE);
    await inventoryPage.openCart();
    await cartPage.checkout();

    await checkoutPage.fillShippingInfo('Patricia', 'Gomez', '');
    await checkoutPage.continue();

    await expect(page.locator('[data-test="error"]')).toContainText(
      'Postal Code is required'
    );
  });
  /**
   * Validates cancel behavior on checkout step one.
   * Risk covered: Detects loss of cart state or broken navigation when canceling checkout.
   * Business value: Preserves user control and prevents accidental loss of selected items during checkout.
   */
  test('cancel on step one returns to cart and keeps items', async ({ page }) => {
    const inventoryPage = pm.onInventoryPage();
    const cartPage = pm.onCartPage();
    const checkoutPage = pm.onCheckoutPage();

    await inventoryPage.addToCartByName(PRODUCT_ONE);
    await inventoryPage.openCart();
    await cartPage.checkout();

    await expect(page).toHaveURL(/.*checkout-step-one.html/);
    await checkoutPage.cancel();

    await expect(page).toHaveURL(/.*cart.html/);
    await expect(cartPage.items.filter({ hasText: PRODUCT_ONE })).toBeVisible();
  });
});
