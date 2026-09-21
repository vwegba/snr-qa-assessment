import { test, expect } from '@playwright/test';
import { BooksPage } from '../../pages/books.page';

test('Books page shows its key elements', async ({ page }, testInfo) => {
  const booksPage = new BooksPage(page);

  await booksPage.goto();

  await expect(booksPage.booksTable).toBeVisible();
  await expect(booksPage.columnHeaders).toHaveText([
    'Image',
    'Title',
    'Author',
    'Publisher',
  ]);
  await expect(booksPage.bookRows.first()).toBeVisible();
  await expect(booksPage.searchInput).toBeVisible();
  await expect(booksPage.loginButton).toBeVisible();
  await expect(booksPage.previousButton).toBeVisible();
  await expect(booksPage.nextButton).toBeVisible();

  await testInfo.attach('books-page', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
});

test('Books sidebar supports collapse and expansion', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'Mobile Safari',
    'The public site crashes when opening mobile navigation: findDOMNode is not a function.',
  );

  const booksPage = new BooksPage(page);
  await booksPage.goto();

  await booksPage.openSidebarIfNeeded();
  await expect(booksPage.sidebar).toBeVisible();
  await expect(booksPage.bookStoreSectionHeader).toBeVisible();
  await expect(booksPage.bookStoreMenu).toBeVisible();
  await expect(booksPage.bookStoreMenuItems).toHaveText([
    'Login',
    'Book Store',
    'Profile',
    'Book Store API',
  ]);

  await booksPage.collapseBookStoreSection();
  await expect(booksPage.bookStoreSectionHeader).toBeVisible();
  await expect(booksPage.bookStoreMenu).toBeHidden();
  // Role locators exclude links hidden by the collapsed menu.
  await expect(booksPage.bookStoreMenuItems).toHaveCount(0);

  await booksPage.expandBookStoreSection();
  await expect(booksPage.bookStoreMenuItems).toHaveCount(4);
  for (const menuItem of await booksPage.bookStoreMenuItems.all()) {
    await expect(menuItem).toBeVisible();
  }

  await testInfo.attach('books-sidebar-expanded', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
});
