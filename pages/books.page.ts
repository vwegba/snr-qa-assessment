import { expect, type Locator, type Page } from '@playwright/test';
import { booksPageData } from '../data/books.data';

export class BooksPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly loginButton: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly booksTable: Locator;
  readonly columnHeaders: Locator;
  readonly bookRows: Locator;
  readonly sidebar: Locator;
  readonly bookStoreSection: Locator;
  readonly bookStoreSectionHeader: Locator;
  readonly bookStoreMenu: Locator;
  readonly bookStoreMenuItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('#searchBox');
    this.loginButton = page.locator('#login');
    this.previousButton = page.locator('.books-wrapper').getByRole('button', {
      name: 'Previous',
      exact: true,
    });
    this.nextButton = page.locator('.books-wrapper').getByRole('button', {
      name: 'Next',
      exact: true,
    });
    this.booksTable = page.locator('.books-wrapper').getByRole('table');
    this.columnHeaders = this.booksTable.getByRole('columnheader');
    this.bookRows = this.booksTable.getByRole('row').filter({
      has: page.locator('a[href^="/books?search="]'),
    });

    this.sidebar = page.locator('.left-pannel');
    this.bookStoreSection = this.sidebar.locator('.element-group').filter({
      has: page.locator('.header-text').filter({
        hasText: /^\s*Book Store Application\s*$/,
      }),
    });
    this.bookStoreSectionHeader =
      this.bookStoreSection.locator('.group-header');
    this.bookStoreMenu = this.bookStoreSection.locator('.element-list');
    this.bookStoreMenuItems = this.bookStoreMenu.getByRole('link');
  }

  async goto(): Promise<void> {
    // Playwright resolves this path against baseURL in playwright.config.ts.
    await this.page.goto(booksPageData.path);
  }

  async searchBooks(term: string): Promise<void> {
    await this.searchInput.fill(term);
  }

  async openSidebarIfNeeded(): Promise<void> {
    const menuToggle = this.page
      .locator('nav.left-menu-nav-bar')
      .getByRole('button');

    if (await menuToggle.isVisible()) {
      await expect(this.sidebar).toBeHidden();
      await menuToggle.click();
    }

    await expect(this.sidebar).toBeVisible();
  }

  async collapseBookStoreSection(): Promise<void> {
    // During animation the site uses "collapsing" instead of "collapse".
    await expect(this.bookStoreMenu).toHaveClass(/\bcollapse\b/);
    if (await this.bookStoreMenu.isVisible()) {
      await this.bookStoreSectionHeader.click();
    }
    await expect(this.bookStoreMenu).toHaveClass(/\bcollapse\b/);
    await expect(this.bookStoreMenu).toBeHidden();
  }

  async expandBookStoreSection(): Promise<void> {
    await expect(this.bookStoreMenu).toHaveClass(/\bcollapse\b/);
    if (!(await this.bookStoreMenu.isVisible())) {
      await this.bookStoreSectionHeader.click();
    }
    await expect(this.bookStoreMenu).toHaveClass(/\bcollapse\b/);
    await expect(this.bookStoreMenu).toBeVisible();
  }
}
