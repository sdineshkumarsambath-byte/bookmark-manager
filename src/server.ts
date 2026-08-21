import { createYoga, createSchema } from "graphql-yoga";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { resolvers } from "./graphql/resolvers";

const typeDefs = readFileSync(
  join(import.meta.dir, "graphql", "schema.graphql"),
  "utf-8",
);

const schema = createSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/graphql",
});

const port = Number(process.env.PORT ?? 4000);

Bun.serve({
  port,
  fetch: yoga,
});

console.log(`🚀 GraphQL server running at http://localhost:${port}/graphql`);