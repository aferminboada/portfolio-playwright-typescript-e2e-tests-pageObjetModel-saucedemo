import { Locator, Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly items: Locator;
  readonly sortSelect: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.items = page.locator('.inventory_item');
    this.sortSelect = page.locator('[data-test="product_sort_container"]');
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async openItemByName(name: string): Promise<void> {
    await this.items.filter({ hasText: name }).getByRole('link', { name }).click();
  }

  async addToCartByName(name: string): Promise<void> {
    await this.items
      .filter({ hasText: name })
      .getByRole('button', { name: /add to cart/i })
      .click();
  }

  async removeFromCartByName(name: string): Promise<void> {
    await this.items
      .filter({ hasText: name })
      .getByRole('button', { name: /remove/i })
      .click();
  }
}
