import { Locator, Page } from '@playwright/test';

export class ProductDetailsPage {
  readonly page: Page;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backToProductsButton: Locator;
  readonly itemTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.getByRole('button', { name: /add to cart/i });
    this.removeButton = page.getByRole('button', { name: /remove/i });
    this.backToProductsButton = page.getByRole('button', { name: /back to products/i });
    this.itemTitle = page.locator('.inventory_details_name');
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
  }

  async backToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }
}
