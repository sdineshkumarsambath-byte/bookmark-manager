import { createYoga, createSchema } from "graphql-yoga";

type Bookmark = {
  id: number;
  title: string;
  url: string;
  description?: string;
};

let bookmarks: Bookmark[] = [
  {
    id: 1,
    title: "Google",
    url: "https://www.google.com",
    description: "Search Engine",
  },
  {
    id: 2,
    title: "GitHub",
    url: "https://github.com",
    description: "Code Repository",
  },
];

const typeDefs = /* GraphQL */ `
  type Bookmark {
    id: ID!
    title: String!
    url: String!
    description: String
  }

  type Query {
    bookmarks: [Bookmark!]!
    bookmark(id: ID!): Bookmark
  }

  type Mutation {
    addBookmark(
      title: String!
      url: String!
      description: String
    ): Bookmark!

    updateBookmark(
      id: ID!
      title: String
      url: String
      description: String
    ): Bookmark!

    deleteBookmark(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    bookmarks: () => bookmarks,

    bookmark: (_: unknown, args: { id: string }) => {
      return bookmarks.find(
        (bookmark) => bookmark.id === Number(args.id)
      );
    },
  },

  Mutation: {
    // ADD BOOKMARK
    addBookmark: (
      _: unknown,
      args: {
        title: string;
        url: string;
        description?: string;
      }
    ) => {
      const newBookmark: Bookmark = {
        id: bookmarks.length + 1,
        title: args.title,
        url: args.url,
        description: args.description,
      };

      bookmarks.push(newBookmark);

      return newBookmark;
    },

    // UPDATE BOOKMARK
    updateBookmark: (
      _: unknown,
      args: {
        id: string;
        title?: string;
        url?: string;
        description?: string;
      }
    ) => {
      const bookmark = bookmarks.find(
        (bookmark) => bookmark.id === Number(args.id)
      );

      if (!bookmark) {
        throw new Error("Bookmark not found");
      }

      if (args.title !== undefined) {
        bookmark.title = args.title;
      }

      if (args.url !== undefined) {
        bookmark.url = args.url;
      }

      if (args.description !== undefined) {
        bookmark.description = args.description;
      }

      return bookmark;
    },

    // DELETE BOOKMARK
    deleteBookmark: (_: unknown, args: { id: string }) => {
      const index = bookmarks.findIndex(
        (bookmark) => bookmark.id === Number(args.id)
      );

      if (index === -1) {
        return false;
      }

      bookmarks.splice(index, 1);

      return true;
    },
  },
};

const yoga = createYoga({
  schema: createSchema({
    typeDefs,
    resolvers,
  }),
});

Bun.serve({
  port: 4000,
  fetch: yoga,
});

console.log(
  "GraphQL server running at http://localhost:4000/graphql"
);