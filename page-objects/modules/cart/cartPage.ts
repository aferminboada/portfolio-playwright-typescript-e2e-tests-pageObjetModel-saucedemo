import { Locator, Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly items: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.items = page.locator('.cart_item');
    this.checkoutButton = page.getByRole('button', { name: /checkout/i });
    this.continueShoppingButton = page.getByRole('button', { name: /continue shopping/i });
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async removeItemByName(name: string): Promise<void> {
    await this.items
      .filter({ hasText: name })
      .getByRole('button', { name: /remove/i })
      .click();
  }
}
