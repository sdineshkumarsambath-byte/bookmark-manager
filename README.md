# Bookmark Manager - GraphQL API

A backend Bookmark Manager API built with Bun, TypeScript, GraphQL Yoga, Prisma ORM, and PostgreSQL.

The API allows users to create and manage bookmarks, organize bookmarks into folders, search and filter bookmarks, paginate bookmark results using cursors, and move bookmarks between folders.

---

## Problem Statement

Build a small Bookmark Manager backend API using:

- Bun
- TypeScript with strict mode
- GraphQL
- Prisma ORM
- PostgreSQL

The API should support bookmark and folder management, nested relationships, filtering, search, and cursor-based pagination.

---

## Features

### Folder Management

- Create a folder
- List all folders
- Get a folder by ID
- Fetch bookmarks belonging to a folder

### Bookmark Management

- Create a bookmark
- Update a bookmark
- Delete a bookmark
- Move a bookmark to another folder
- Fetch the folder associated with a bookmark

### Bookmark Listing

The `bookmarks` query supports:

- Folder filtering using `folderId`
- Search by bookmark title using `search`
- Page size using `take`
- Cursor-based pagination using `cursor`

### Validation

The API validates:

- Empty bookmark titles
- Whitespace-only bookmark titles
- Invalid bookmark URLs
- Empty folder names
- Missing folders
- Missing bookmarks
- Empty bookmark update requests

### Error Handling

Application errors use GraphQL errors with specific error codes such as:

- `INVALID_FOLDER_NAME`
- `INVALID_BOOKMARK_TITLE`
- `INVALID_BOOKMARK_URL`
- `FOLDER_NOT_FOUND`
- `BOOKMARK_NOT_FOUND`
- `NO_UPDATE_FIELDS`

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Bun | JavaScript/TypeScript runtime |
| TypeScript | Type-safe development |
| GraphQL | API query language |
| GraphQL Yoga | GraphQL server |
| Prisma | ORM and database access |
| PostgreSQL | Relational database |
| Docker | Local PostgreSQL environment |
| Git | Version control |

---

## Project Structure

```text
bookmark-manager/
│
├── prisma/
│   ├── migrations/
│   │   └── <migration>
│   │       └── migration.sql
│   │
│   └── schema.prisma
│
├── src/
│   ├── graphql/
│   │   ├── errors.ts
│   │   ├── resolvers.ts
│   │   └── schema.graphql
│   │
│   ├── lib/
│   │   └── prisma.ts
│   │
│   └── server.ts
│
├── tests/
│   ├── resolvers.test.ts
│   └── schema.test.ts
│
├── .env
├── .env.example
├── .gitignore
├── bun.lock
├── docker-compose.yml
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── README.md