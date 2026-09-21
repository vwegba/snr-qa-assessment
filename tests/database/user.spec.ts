import 'dotenv/config';
import { test, expect } from '@playwright/test';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { Prisma, PrismaClient } from '../../generated/prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

const connection = new URL(databaseUrl);

const adapter = new PrismaMariaDb({
  host: connection.hostname,
  port: Number(connection.port || 3306),
  user: decodeURIComponent(connection.username),
  password: decodeURIComponent(connection.password),
  database: connection.pathname.slice(1),
});

const prisma = new PrismaClient({ adapter });

type UserRoleRow = {
  userId: bigint;
  username: string;
  email: string;
  roleName: string;
};

test.afterAll(async () => {
  await prisma.$disconnect();
});

test('returns all seeded users and their roles through a JOIN', async () => {
  const rows = await prisma.$queryRaw<UserRoleRow[]>(Prisma.sql`
    SELECT
      user_table.id AS userId,
      user_table.username,
      user_table.email,
      role_table.name AS roleName
    FROM AppUser AS user_table
    INNER JOIN AppUserRole AS assignment
      ON assignment.appuser_id = user_table.id
    INNER JOIN Role AS role_table
      ON role_table.id = assignment.role_id
    ORDER BY user_table.id, role_table.id
  `);

  const serializableRows = rows.map((row) => ({
    ...row,
    userId: row.userId.toString(),
  }));

  await test.info().attach('users-with-roles.json', {
    body: Buffer.from(JSON.stringify(serializableRows, null, 2)),
    contentType: 'application/json',
  });

  const uniqueUserIds = new Set(rows.map((row) => row.userId.toString()));
  const actualRoleNames = new Set(rows.map((row) => row.roleName));

  expect(uniqueUserIds.size).toBe(20);
  expect(rows).toHaveLength(28);
  expect([...actualRoleNames].sort()).toEqual([
    'Editor',
    'ReadOnly',
    'Superuser',
  ]);

  for (const specialUserId of ['5', '10', '15', '20']) {
    const userRoles = rows
      .filter((row) => row.userId.toString() === specialUserId)
      .map((row) => row.roleName)
      .sort();

    expect(userRoles).toEqual(['Editor', 'ReadOnly', 'Superuser']);
  }
});
