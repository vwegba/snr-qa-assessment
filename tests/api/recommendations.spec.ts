import { test, expect } from '@playwright/test';

test.describe('Book recommendations API', () => {
  test('returns a recommendation for a known user', async ({ request }) => {
    const response = await request.get('/api/recommendations', {
      params: {
        userId: '1',
      },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    expect(response.headers()['matched-stub-id']).toMatch(/.+/);

    expect(await response.json()).toEqual({
      userId: 1,
      book: {
        isbn: '9781492053743',
        title: 'Learning TypeScript',
      },
    });
  });

  test('returns not found for an unknown user', async ({ request }) => {
    const response = await request.get('/api/recommendations', {
      params: {
        userId: '999',
      },
    });

    expect(response.status()).toBe(404);
    expect(response.headers()['content-type']).toContain('application/json');

    expect(response.headers()['matched-stub-id']).toMatch(/.+/);

    expect(await response.json()).toEqual({
      userId: 999,
      error: 'No recommendations found',
    });
  });
});
