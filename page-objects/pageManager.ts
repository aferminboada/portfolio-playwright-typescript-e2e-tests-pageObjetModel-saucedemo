import { Page } from '@playwright/test';
import { LoginPage } from './modules/auth/loginPage';
import { InventoryPage } from './modules/inventory/inventoryPage';
import { ProductDetailsPage } from './modules/product/productDetailsPage';
import { CartPage } from './modules/cart/cartPage';
import { CheckoutPage } from './modules/checkout/checkoutPage';
import { NavigationMenu } from './modules/navigation/navigationMenu';

export class PageManager {
  private readonly page: Page;
  private readonly loginPage: LoginPage;
  private readonly inventoryPage: InventoryPage;
  private readonly productDetailsPage: ProductDetailsPage;
  private readonly cartPage: CartPage;
  private readonly checkoutPage: CheckoutPage;
  private readonly navigationMenu: NavigationMenu;

  constructor(page: Page) {
    this.page = page;
    this.loginPage = new LoginPage(this.page);
    this.inventoryPage = new InventoryPage(this.page);
    this.productDetailsPage = new ProductDetailsPage(this.page);
    this.cartPage = new CartPage(this.page);
    this.checkoutPage = new CheckoutPage(this.page);
    this.navigationMenu = new NavigationMenu(this.page);
  }

  onLoginPage(): LoginPage {
    return this.loginPage;
  }

  onInventoryPage(): InventoryPage {
    return this.inventoryPage;
  }

  onProductDetailsPage(): ProductDetailsPage {
    return this.productDetailsPage;
  }

  onCartPage(): CartPage {
    return this.cartPage;
  }

  onCheckoutPage(): CheckoutPage {
    return this.checkoutPage;
  }

  onNavigationMenu(): NavigationMenu {
    return this.navigationMenu;
  }
}
