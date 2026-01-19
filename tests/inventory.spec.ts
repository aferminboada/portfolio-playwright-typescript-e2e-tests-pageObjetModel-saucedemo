import { test, expect } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager';
import { loginData } from '../test-data/loginData';

/**
 * Inventory tests for a real ecommerce:
 * - Product list renders (catalog availability).
 * - Add/remove from listing (core conversion actions).
 * - Cart badge reflects quantity (state visibility).
 * - Sorting by name and price (browse usability).
 * - Open product details from listing (navigation to PDP).
 */
test.describe('Inventory - SauceDemo', () => {
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

  /**
   * Validates that the inventory product list is rendered correctly.
   * Risk covered: Detects failures where product cards are not displayed or the inventory list loads incompletely.
   * Business value: Ensures users can view all available products with essential information, enabling informed purchase decisions and 
   * maintaining trust in the shopping experience.
   */
  test('renders product list', async ({ page }) => {
    const inventoryPage = pm.onInventoryPage();

    await expect(page.locator('.inventory_list')).toBeVisible();
    await expect(inventoryPage.items).toHaveCount(6);
  });

  /**
   * Validates adding and removing items from the inventory listing.
   * Risk covered: Detects issues where cart state becomes inconsistent when products are added or removed from the listing page.
   * Business value: Ensures accurate cart updates and user control over selected items, reducing the risk of incorrect orders and checkout friction.
   */
  test('adds and removes items from the listing', async () => {
    const inventoryPage = pm.onInventoryPage();

    await inventoryPage.addToCartByName(PRODUCT_ONE);
    await inventoryPage.addToCartByName(PRODUCT_TWO);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.removeFromCartByName(PRODUCT_ONE);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.removeFromCartByName(PRODUCT_TWO);
    await expect(inventoryPage.cartBadge).toHaveCount(0);
  });

  /**
   * Validates that the cart badge accurately reflects the number of selected items.
   * Risk covered: Detects mismatches between the cart contents and the visual item count indicator.
  Business value: Provides users with immediate and reliable feedback about their cart state, reducing confusion and preventing unintended purchases.
   */
  test('cart badge reflects quantity', async () => {
    const inventoryPage = pm.onInventoryPage();

    await inventoryPage.addToCartByName(PRODUCT_ONE);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.addToCartByName(PRODUCT_TWO);
    await expect(inventoryPage.cartBadge).toHaveText('2');
  });

  /**
   * Validates product sorting by name (A-Z, Z-A)
   * Risk covered: Detects broken or incorrect sorting functionality that could hinder product discovery.
   * Business value: Enhances user experience by allowing efficient browsing and comparison of products, increasing the likelihood of purchase.
  */  
 
  test('sorts products by name A-Z and Z-A', async () => {
    const inventoryPage = pm.onInventoryPage();

    await inventoryPage.sortSelect.selectOption('az');
    const namesAz = await inventoryPage.items
      .locator('.inventory_item_name')
      .allTextContents();
    const sortedAz = [...namesAz].sort((a, b) => a.localeCompare(b));
    expect(namesAz).toEqual(sortedAz);

    await inventoryPage.sortSelect.selectOption('za');
    const namesZa = await inventoryPage.items
      .locator('.inventory_item_name')
      .allTextContents();
    const sortedZa = [...namesZa].sort((a, b) => b.localeCompare(a));
    expect(namesZa).toEqual(sortedZa);
  });

  /**
  * Validates product sorting by price (low-high, high-low)
  * Risk covered: Detects issues in sorting logic that could mislead users about product pricing.
  * Business value: Facilitates informed purchasing decisions by enabling users to easily find products within their budget, improving conversion rates.
  */
  test('sorts products by price low-high and high-low', async () => {
    const inventoryPage = pm.onInventoryPage();

    await inventoryPage.sortSelect.selectOption('lohi');
    const pricesLoHi = await inventoryPage.items
      .locator('.inventory_item_price')
      .allTextContents();
    const valuesLoHi = pricesLoHi.map((value) => Number(value.replace('$', '')));
    const sortedLoHi = [...valuesLoHi].sort((a, b) => a - b);
    expect(valuesLoHi).toEqual(sortedLoHi);

    await inventoryPage.sortSelect.selectOption('hilo');
    const pricesHiLo = await inventoryPage.items
      .locator('.inventory_item_price')
      .allTextContents();
    const valuesHiLo = pricesHiLo.map((value) => Number(value.replace('$', '')));
    const sortedHiLo = [...valuesHiLo].sort((a, b) => b - a);
    expect(valuesHiLo).toEqual(sortedHiLo);
  });

  /**
   * Validates opening product details from the inventory listing.
   * Risk covered: Detects navigation issues that prevent users from accessing detailed product information.
   * Business value: Ensures users can easily view product details, enhancing their understanding and confidence in making purchase decisions.  
   */
  test('opens product details from inventory', async ({ page }) => {
    const inventoryPage = pm.onInventoryPage();
    const productDetailsPage = pm.onProductDetailsPage();

    await inventoryPage.openItemByName(PRODUCT_ONE);

    await expect(page).toHaveURL(/.*inventory-item.html/);
    await expect(productDetailsPage.itemTitle).toHaveText(PRODUCT_ONE);
  });
});

// await page.locator('[data-test="item-4-title-link"]').click();