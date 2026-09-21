import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';

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

const users = Array.from({ length: 20 }, (_, index) => {
  const userNumber = index + 1;

  return {
    id: BigInt(userNumber),
    username: `user${userNumber}`,
    firstname: `First${userNumber}`,
    lastname: `Last${userNumber}`,
    password: `test-password-${userNumber}`,
    email: `user${userNumber}@example.com`,
    nonlocked: true,
    enabled: true,
  };
});

const phones = users.map((user, index) => ({
  user_id: user.id,
  phone_country_id: 356,
  phone: `7900${String(index + 1).padStart(4, '0')}`,
  order_index: 1,
}));

const roleAssignments = users.flatMap((user, index) => {
  const userNumber = index + 1;

  if (userNumber % 5 === 0) {
    return [
      { appuser_id: user.id, role_id: 1n },
      { appuser_id: user.id, role_id: 2n },
      { appuser_id: user.id, role_id: 3n },
    ];
  }

  if (userNumber % 2 === 0) {
    return [{ appuser_id: user.id, role_id: 2n }];
  }

  return [{ appuser_id: user.id, role_id: 3n }];
});

async function seedUsers() {
  const roleCount = await prisma.role.count({
    where: {
      id: {
        in: [1n, 2n, 3n],
      },
    },
  });

  if (roleCount !== 3) {
    throw new Error(
      'Expected the Superuser, Editor, and ReadOnly roles. Run the role seed first.',
    );
  }

  await prisma.$transaction(async (transaction) => {
    // Delete child records before their parent user records.
    await transaction.userPhone.deleteMany();
    await transaction.appUserRole.deleteMany();
    await transaction.appUser.deleteMany();

    await transaction.appUser.createMany({ data: users });
    await transaction.userPhone.createMany({ data: phones });
    await transaction.appUserRole.createMany({ data: roleAssignments });
  });

  console.log(`Seeded ${users.length} users.`);
  console.log(`Seeded ${phones.length} phone records.`);
  console.log(`Seeded ${roleAssignments.length} role assignments.`);
}

try {
  await seedUsers();
} finally {
  await prisma.$disconnect();
}
