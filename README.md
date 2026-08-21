#Bookmark Manager - GraphQL API

A backend Bookmark Manager API built using *Bun, TypeScript, GraphQL Yoga, Prisma ORM, and PostgreSQL*.

This project allows users to create and manage bookmarks, organize them into folders, search bookmarks, paginate through bookmark lists, and move bookmarks between folders.

---

## Features

- Create folders
- List all folders
- Get a single folder
- Create bookmarks
- List bookmarks
- Filter bookmarks by folder
- Search bookmarks by title
- Cursor-based pagination
- Update bookmarks
- Delete bookmarks
- Move bookmarks between folders
- Bookmark and folder relationships
- Input validation
- GraphQL error handling
- Prisma ORM for database operations
- PostgreSQL database
- TypeScript type safety
- Bun runtime

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Bun | JavaScript/TypeScript runtime |
| TypeScript | Type-safe development |
| GraphQL | API query language |
| GraphQL Yoga | GraphQL server |
| Prisma | ORM |Docker
| PostgreSQL | Database |
| Git | Version control |

---

## Project Structure

```text
bookmark-manager/
│
├── prisma/
│   ├── migrations/
│   │   └── 20260820174258_init/
│   │       └── migration.sql
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
├── generated/
│   └── prisma/          # Generated automatically, not committed
│
├── .env                 # Local environment variables, not committed
├── .env.example         # Environment variable template
├── .gitignore
├── bun.lock
├── docker-compose.yml
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── README.md


## Setup

### Prerequisites

* Bun
* Docker Desktop
* Git

### Clone the repository

```bash
git clone <your-repository-url>
cd bookmark-manager
```

### Install dependencies

```bash
bun install
```

### Start PostgreSQL

```bash
docker compose up -d
```

### Configure the database

Create a `.env` file in the project root:

```env
DATABASE_URL="your-postgresql-database-url"
```

Generate Prisma Client and run migrations:

```bash
bun run gendb
```

### Start the development server

```bash
bun run dev
```

The GraphQL API will be available at:

```text
http://localhost:4000/graphql
```

## Environment Variables

| Variable       | Description                        |
| -------------- | ---------------------------------- |
| `DATABASE_URL` | PostgreSQL database connection URL |

## Database

PostgreSQL runs locally through Docker Compose.

Prisma is used for database access and migrations.

Generate Prisma Client:

```bash
bun run gendb
```

Create and apply migrations during development:

```bash
bunx prisma migrate dev
```

The database contains two main models:

* **Folder** — stores bookmark folders.
* **Bookmark** — stores bookmark details and belongs to a folder.

## Running Tests

Run the complete test suite:

```bash
bun test
```

The tests cover:

* GraphQL resolver behavior
* Input validation
* Error handling
* Bookmark operations
* PostgreSQL integration

The integration test runs against the PostgreSQL database provided through Docker.

## API

GraphQL endpoint:

```text
http://localhost:4000/graphql
```

### Queries

#### Get all folders

```graphql
query {
  folders {
    id
    name
    createdAt
  }
}
```

#### Get a folder with bookmarks

```graphql
query {
  folder(id: 1) {
    id
    name
    bookmarks {
      id
      title
      url
      tags
    }
  }
}
```

#### Get bookmarks

```graphql
query {
  bookmarks {
    id
    title
    url
    tags
    folderId
    createdAt
  }
}
```

Bookmarks support optional:

* `folderId` filtering
* `search` by title
* `take` for page size
* `cursor` for cursor-based pagination

### Mutations

The API provides:

```text
createFolder
createBookmark
updateBookmark
deleteBookmark
moveBookmark
```

### Pagination

The `bookmarks` query uses **cursor-based pagination** with `take` and `cursor`.

The cursor represents the position of the last returned bookmark. The next request uses that cursor to retrieve the following set of records, allowing pagination across multiple requests.

## How I'd Extend This

If this project were developed into a larger production system, I would consider:

* **Authentication & Authorization** — user-specific bookmarks and access control.
* **Caching** — reduce repeated database queries for frequently accessed bookmarks.
* **Search Improvements** — full-text search and better filtering for large datasets.
* **Observability** — structured logging, metrics, and error monitoring.
* **Scaling** — database optimization, connection pooling, and horizontal API scaling.

The current implementation intentionally stays within the assignment scope and avoids unnecessary complexity.
