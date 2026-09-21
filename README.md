# Senior QA Automation Assessment

This project tests three parts of a small quality-assurance system: the public DemoQA Books page, a local MySQL database, and a mocked recommendations API. It uses Playwright with TypeScript for all three test layers. Docker Compose runs MySQL, applies the database structure with Flyway, and starts WireMock for predictable API responses.

## Prerequisites

Install these tools before starting:

- Node.js 24 (the required version is also recorded in `.nvmrc`)
- npm
- Docker Desktop with Docker Compose
- Git

## Set up the project

Run these commands from the project root.

1. Install the exact dependency versions from `package-lock.json`:

   ```bash
   npm ci
   ```

2. Create your local environment file from the example:

   ```bash
   cp .env.example .env
   ```

   The example contains local test values only. The real `.env` file is ignored by Git.

3. Install the Playwright browsers:

   ```bash
   npx playwright install
   ```

4. Generate the Prisma Client from the existing Prisma schema:

   ```bash
   npx prisma generate --config prisma7.config.ts
   ```

5. Start MySQL, apply the Flyway migration, and start WireMock:

   ```bash
   docker compose up -d --wait --wait-timeout 120
   ```

6. Add the three roles, 20 users, phone records, and role assignments to the database:

   ```bash
   npm run db:seed
   ```

The seed commands are repeatable. Running them again updates or recreates the same test data instead of adding unwanted duplicates.

## Run the tests

Run every suite in the required order:

```bash
npm run test:e2e
```

This command runs the UI suite first, the database suite second, and the API suite last. It stops if a suite fails.

Run one suite on its own with:

```bash
npm run test:ui
npm run test:database
npm run test:api
```

The UI suite runs in Chromium, Firefox, WebKit, and an iPhone 12 Mobile Safari profile. The database and API suites each run once because they do not need different browsers.

## Code-quality commands

```bash
npm run format
npm run format:check
npm run lint
npm run typecheck
```

- `format` fixes supported files with Prettier.
- `format:check` checks formatting without changing files.
- `lint` checks the code with ESLint.
- `typecheck` checks TypeScript without creating JavaScript files.

Husky installs a Git pre-commit hook during `npm ci`. The hook runs `npm run lint`, so a commit is stopped if ESLint finds an error.

## Test reports

The suites keep separate HTML reports so that a later suite does not replace evidence from an earlier suite:

```text
playwright-report/
├── ui/
├── database/
└── api/
```

Open a report with one of these commands:

```bash
npx playwright show-report playwright-report/ui
npx playwright show-report playwright-report/database
npx playwright show-report playwright-report/api
```

The database report includes a `users-with-roles.json` attachment containing the rows returned by the JOIN query. The UI report includes screenshots of the Books page and the expanded sidebar.

## Architecture and reasons for the design

The UI layer separates test data, page actions, and assertions. Values used by the Books tests live in `data/`, while `pages/` contains the `BooksPage` page object with reusable locators and actions. Test files stay in `tests/` and describe the expected behaviour. This keeps the tests readable and makes a page change easier to fix in one place. The browser configuration also gives every UI project the required Nairobi location.

Flyway owns the database structure because migrations give the schema a clear, repeatable history. Prisma reads that existing structure through introspection and provides a typed client; it does not create or migrate these tables. Role data has its own repeatable SQL seed, while the TypeScript seed uses Prisma and a transaction to create 20 users, their phones, and their role assignments. Keeping structure and test data separate makes each responsibility easier to understand and rerun.

UI, database, and API tests are separate Playwright projects because only the UI tests need browser profiles. `npm run test:e2e` still connects them as one sequential test workflow. Docker Compose starts MySQL first and waits until it is healthy, then Flyway applies the migration, and WireMock starts only after Flyway succeeds. This order makes sure the database and mock API are ready before their tests begin.

## Project structure

```text
.
├── data/                 # UI test data
├── database/seeds/       # Repeatable role and user test data
├── flyway/sql/           # Database migration
├── pages/                # Playwright page objects
├── prisma/               # Introspected Prisma schema
├── tests/
│   ├── api/              # WireMock API tests
│   ├── database/         # Prisma database test
│   └── ui/               # DemoQA browser tests
├── wiremock/mappings/    # Mock API requests and responses
├── docker-compose.yml
├── playwright.config.ts
└── prisma7.config.ts
```

## Specification corrections and assumptions

The supplied database definition needed a few small corrections before MySQL could use it:

- The `AppUserRole` foreign key referred to `Role.role_id`, but the role primary key is `Role.id`. The migration uses `Role.id`.
- The `UserPhone` foreign key referred to `appuser_id`, which is not a column in that table. The migration uses `user_id`.
- A constraint name was repeated. The migration gives each foreign-key constraint a unique, clear name.
- A trailing comma in the supplied `UserPhone` definition was removed.
- The supplied date-time default included a timezone form that does not work with MySQL `DATETIME`. The migration uses the MySQL-compatible value `1970-01-01 00:00:00`.

The following choices were made where the required behaviour was not fully defined:

- The WireMock endpoint and response body were not specified. This project uses a fixed recommendation endpoint with a successful `200` response for a known user and a `404` response for an unknown user.
- The public DemoQA website is not connected to the local MySQL database or WireMock. “Interact with each other” is treated as coordinated UI, database, and API suites in one Playwright framework, run in order by one command.
- “Visual check” is treated as checking the required visible page elements and saving screenshots as evidence. It is not a pixel-by-pixel screenshot comparison.
- “Using a JOIN via Prisma” could mean a Prisma relationship query or raw SQL. The database test uses an explicit SQL `INNER JOIN` through Prisma so the JOIN is clear.
- The required database assertions were not listed. The test checks for 20 unique users, 28 user-role rows, the three expected role names, and all three roles for users 5, 10, 15, and 20.

## Known limitations

- The UI tests use the public `demoqa.com` website. Site downtime, adverts, or changes made by the site owner can affect the results.
- DemoQA currently crashes when its mobile navigation is opened in the Mobile Safari project with `findDOMNode is not a function`. The sidebar test is intentionally skipped only for that project; the key-elements test still runs there.
- The Mobile Safari project is Playwright WebKit with an iPhone 12 device profile. It is not the Safari application on a physical iPhone.
- MySQL uses local port `3306`, and WireMock uses local port `8080`. Both ports must be free before Docker starts.
- The usernames and passwords in `.env.example` are sample local values. They must not be used for a real system.

## Stop the local services

Stop the containers but keep the MySQL data volume:

```bash
docker compose down
```

Stop the containers and also delete the local MySQL data volume:

```bash
docker compose down --volumes
```

The second command removes the local database data. The next clean setup will recreate the database through Flyway and the seed command.
