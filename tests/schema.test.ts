import {
  describe,
  expect,
  test,
} from "bun:test";

import {
  buildSchema,
  GraphQLSchema,
} from "graphql";

const schemaPath =
  `${import.meta.dir}/../src/graphql/schema.graphql`;

const schemaSource =
  await Bun.file(schemaPath).text();

const schema: GraphQLSchema =
  buildSchema(schemaSource);

describe("GraphQL schema", () => {
  // --------------------------------------------------
  // BASIC SCHEMA
  // --------------------------------------------------

  test("schema builds successfully", () => {
    expect(schema).toBeDefined();
  });

  test("has Query type", () => {
    const queryType =
      schema.getQueryType();

    expect(queryType).toBeDefined();

    if (!queryType) {
      throw new Error(
        "Query type not found",
      );
    }

    expect(queryType.name).toBe("Query");
  });

  test("has Mutation type", () => {
    const mutationType =
      schema.getMutationType();

    expect(mutationType).toBeDefined();

    if (!mutationType) {
      throw new Error(
        "Mutation type not found",
      );
    }

    expect(mutationType.name).toBe(
      "Mutation",
    );
  });

  // --------------------------------------------------
  // QUERY FIELDS
  // --------------------------------------------------

  test("Query has folders field", () => {
    const queryType =
      schema.getQueryType();

    expect(queryType).toBeDefined();

    if (!queryType) {
      throw new Error(
        "Query type not found",
      );
    }

    const field =
      queryType.getFields().folders;

    expect(field).toBeDefined();
  });

  test("Query has folder field", () => {
    const queryType =
      schema.getQueryType();

    expect(queryType).toBeDefined();

    if (!queryType) {
      throw new Error(
        "Query type not found",
      );
    }

    const field =
      queryType.getFields().folder;

    expect(field).toBeDefined();
  });

  test("Query has bookmarks field", () => {
    const queryType =
      schema.getQueryType();

    expect(queryType).toBeDefined();

    if (!queryType) {
      throw new Error(
        "Query type not found",
      );
    }

    const field =
      queryType.getFields().bookmarks;

    expect(field).toBeDefined();
  });

  // --------------------------------------------------
  // MUTATION FIELDS
  // --------------------------------------------------

  test(
    "Mutation has createFolder field",
    () => {
      const mutationType =
        schema.getMutationType();

      expect(mutationType).toBeDefined();

      if (!mutationType) {
        throw new Error(
          "Mutation type not found",
        );
      }

      const field =
        mutationType.getFields()
          .createFolder;

      expect(field).toBeDefined();
    },
  );

  test(
    "Mutation has createBookmark field",
    () => {
      const mutationType =
        schema.getMutationType();

      expect(mutationType).toBeDefined();

      if (!mutationType) {
        throw new Error(
          "Mutation type not found",
        );
      }

      const field =
        mutationType.getFields()
          .createBookmark;

      expect(field).toBeDefined();
    },
  );

  test(
    "Mutation has updateBookmark field",
    () => {
      const mutationType =
        schema.getMutationType();

      expect(mutationType).toBeDefined();

      if (!mutationType) {
        throw new Error(
          "Mutation type not found",
        );
      }

      const field =
        mutationType.getFields()
          .updateBookmark;

      expect(field).toBeDefined();
    },
  );

  test(
    "Mutation has deleteBookmark field",
    () => {
      const mutationType =
        schema.getMutationType();

      expect(mutationType).toBeDefined();

      if (!mutationType) {
        throw new Error(
          "Mutation type not found",
        );
      }

      const field =
        mutationType.getFields()
          .deleteBookmark;

      expect(field).toBeDefined();
    },
  );

  test(
    "Mutation has moveBookmark field",
    () => {
      const mutationType =
        schema.getMutationType();

      expect(mutationType).toBeDefined();

      if (!mutationType) {
        throw new Error(
          "Mutation type not found",
        );
      }

      const field =
        mutationType.getFields()
          .moveBookmark;

      expect(field).toBeDefined();
    },
  );

  // --------------------------------------------------
  // BOOKMARK TYPE
  // --------------------------------------------------

  test(
    "Bookmark type has required fields",
    () => {
      const bookmarkType =
        schema.getType("Bookmark");

      expect(bookmarkType).toBeDefined();

      if (
        !bookmarkType ||
        !("getFields" in bookmarkType)
      ) {
        throw new Error(
          "Bookmark type not found",
        );
      }

      const fields =
        bookmarkType.getFields();

      expect(fields.id).toBeDefined();
      expect(fields.title).toBeDefined();
      expect(fields.url).toBeDefined();
      expect(fields.tags).toBeDefined();
      expect(fields.folderId).toBeDefined();
      expect(fields.createdAt).toBeDefined();
      expect(fields.folder).toBeDefined();
    },
  );

  // --------------------------------------------------
  // FOLDER TYPE
  // --------------------------------------------------

  test(
    "Folder type has required fields",
    () => {
      const folderType =
        schema.getType("Folder");

      expect(folderType).toBeDefined();

      if (
        !folderType ||
        !("getFields" in folderType)
      ) {
        throw new Error(
          "Folder type not found",
        );
      }

      const fields =
        folderType.getFields();

      expect(fields.id).toBeDefined();
      expect(fields.name).toBeDefined();
      expect(fields.createdAt).toBeDefined();
      expect(fields.bookmarks).toBeDefined();
    },
  );

  // --------------------------------------------------
  // CREATE BOOKMARK INPUT
  // --------------------------------------------------

  test(
    "CreateBookmarkInput has required fields",
    () => {
      const inputType =
        schema.getType(
          "CreateBookmarkInput",
        );

      expect(inputType).toBeDefined();

      if (
        !inputType ||
        !("getFields" in inputType)
      ) {
        throw new Error(
          "CreateBookmarkInput not found",
        );
      }

      const fields =
        inputType.getFields();

      expect(fields.title).toBeDefined();
      expect(fields.url).toBeDefined();
      expect(fields.tags).toBeDefined();
      expect(fields.folderId).toBeDefined();
    },
  );

  // --------------------------------------------------
  // UPDATE BOOKMARK INPUT
  // --------------------------------------------------

  test(
    "UpdateBookmarkInput exists",
    () => {
      const inputType =
        schema.getType(
          "UpdateBookmarkInput",
        );

      expect(inputType).toBeDefined();
    },
  );

  // --------------------------------------------------
  // EXPECTED TYPES
  // --------------------------------------------------

  test(
    "schema contains expected types",
    () => {
      const expectedTypes = [
        "Query",
        "Mutation",
        "Folder",
        "Bookmark",
        "CreateFolderInput",
        "CreateBookmarkInput",
        "UpdateBookmarkInput",
      ];

      for (const typeName of expectedTypes) {
        const type =
          schema.getType(typeName);

        expect(type).toBeDefined();
      }
    },
  );

  // --------------------------------------------------
  // QUERY DEFINITION
  // --------------------------------------------------

  test(
    "schema contains Query definition",
    () => {
      const queryType =
        schema.getQueryType();

      expect(queryType).toBeDefined();

      if (!queryType) {
        throw new Error(
          "Query type not found",
        );
      }

      expect(queryType.name).toBe(
        "Query",
      );
    },
  );

  // --------------------------------------------------
  // MUTATION DEFINITION
  // --------------------------------------------------

  test(
    "schema contains Mutation definition",
    () => {
      const mutationType =
        schema.getMutationType();

      expect(mutationType).toBeDefined();

      if (!mutationType) {
        throw new Error(
          "Mutation type not found",
        );
      }

      expect(mutationType.name).toBe(
        "Mutation",
      );
    },
  );

  // --------------------------------------------------
  // SCHEMA SOURCE VALIDATION
  // --------------------------------------------------

  test(
    "schema source contains GraphQL Query",
    () => {
      expect(
        schemaSource,
      ).toContain("type Query");
    },
  );

  test(
    "schema source contains GraphQL Mutation",
    () => {
      expect(
        schemaSource,
      ).toContain("type Mutation");
    },
  );

  test(
    "schema source contains Bookmark type",
    () => {
      expect(
        schemaSource,
      ).toContain("type Bookmark");
    },
  );

  test(
    "schema source contains Folder type",
    () => {
      expect(
        schemaSource,
      ).toContain("type Folder");
    },
  );

  // --------------------------------------------------
  // PAGINATION SCHEMA
  // --------------------------------------------------

  test(
    "bookmarks query exposes pagination arguments",
    () => {
      const queryType =
        schema.getQueryType();

      expect(queryType).toBeDefined();

      if (!queryType) {
        throw new Error(
          "Query type not found",
        );
      }

      const bookmarksField =
        queryType.getFields()
          .bookmarks;

      expect(bookmarksField).toBeDefined();

      if (!bookmarksField) {
        throw new Error(
          "bookmarks field not found",
        );
      }

      const argumentNames =
        bookmarksField.args.map(
          (arg) => arg.name,
        );

      expect(argumentNames).toContain(
        "folderId",
      );

      expect(argumentNames).toContain(
        "search",
      );

      expect(argumentNames).toContain(
        "take",
      );

      expect(argumentNames).toContain(
        "cursor",
      );
    },
  );

  // --------------------------------------------------
  // MUTATION INPUT ARGUMENTS
  // --------------------------------------------------

  test(
    "createBookmark accepts input argument",
    () => {
      const mutationType =
        schema.getMutationType();

      expect(mutationType).toBeDefined();

      if (!mutationType) {
        throw new Error(
          "Mutation type not found",
        );
      }

      const field =
        mutationType.getFields()
          .createBookmark;

      expect(field).toBeDefined();

      if (!field) {
        throw new Error(
          "createBookmark field not found",
        );
      }

      const argumentNames =
        field.args.map(
          (arg) => arg.name,
        );

      expect(argumentNames).toContain(
        "input",
      );
    },
  );

  test(
    "updateBookmark accepts id and input arguments",
    () => {
      const mutationType =
        schema.getMutationType();

      expect(mutationType).toBeDefined();

      if (!mutationType) {
        throw new Error(
          "Mutation type not found",
        );
      }

      const field =
        mutationType.getFields()
          .updateBookmark;

      expect(field).toBeDefined();

      if (!field) {
        throw new Error(
          "updateBookmark field not found",
        );
      }

      const argumentNames =
        field.args.map(
          (arg) => arg.name,
        );

      expect(argumentNames).toContain(
        "id",
      );

      expect(argumentNames).toContain(
        "input",
      );
    },
  );

  test(
    "deleteBookmark accepts id argument",
    () => {
      const mutationType =
        schema.getMutationType();

      expect(mutationType).toBeDefined();

      if (!mutationType) {
        throw new Error(
          "Mutation type not found",
        );
      }

      const field =
        mutationType.getFields()
          .deleteBookmark;

      expect(field).toBeDefined();

      if (!field) {
        throw new Error(
          "deleteBookmark field not found",
        );
      }

      const argumentNames =
        field.args.map(
          (arg) => arg.name,
        );

      expect(argumentNames).toContain(
        "id",
      );
    },
  );

  test(
    "moveBookmark accepts id and folderId arguments",
    () => {
      const mutationType =
        schema.getMutationType();

      expect(mutationType).toBeDefined();

      if (!mutationType) {
        throw new Error(
          "Mutation type not found",
        );
      }

      const field =
        mutationType.getFields()
          .moveBookmark;

      expect(field).toBeDefined();

      if (!field) {
        throw new Error(
          "moveBookmark field not found",
        );
      }

      const argumentNames =
        field.args.map(
          (arg) => arg.name,
        );

      expect(argumentNames).toContain(
        "id",
      );

      expect(argumentNames).toContain(
        "folderId",
      );
    },
  );
});