import {
  beforeEach,
  describe,
  expect,
  mock,
  test,
} from "bun:test";
import { GraphQLError } from "graphql";

type MockFolder = {
  id: number;
  name: string;
  createdAt: Date;
};

type MockBookmark = {
  id: number;
  title: string;
  url: string;
  tags: string[];
  folderId: number;
  createdAt: Date;
};

type CreateBookmarkArgs = {
  data: {
    title: string;
    url: string;
    tags: string[];
    folderId: number;
  };
};

type UpdateBookmarkArgs = {
  where: {
    id: number;
  };
  data: {
    title?: string;
    url?: string;
    tags?: string[];
    folderId?: number;
  };
};

type FindManyArgs = {
  where?: {
    folderId?: number;
    title?: {
      contains: string;
      mode: "insensitive";
    };
  };
  orderBy?: {
    id?: "asc" | "desc";
    createdAt?: "asc" | "desc";
  };
  take?: number;
  skip?: number;
  cursor?: {
    id: number;
  };
};

const mockFolderFindUnique = mock(
  async (): Promise<MockFolder | null> => ({
    id: 1,
    name: "Development",
    createdAt: new Date(),
  }),
);

const mockFolderFindMany = mock(
  async (): Promise<MockFolder[]> => [
    {
      id: 1,
      name: "Development",
      createdAt: new Date(),
    },
    {
      id: 2,
      name: "Resources",
      createdAt: new Date(),
    },
  ],
);

const mockBookmarkCreate = mock(
  async (
    args: CreateBookmarkArgs,
  ): Promise<MockBookmark> => ({
    id: 1,
    title: args.data.title,
    url: args.data.url,
    tags: args.data.tags,
    folderId: args.data.folderId,
    createdAt: new Date(),
  }),
);

const mockBookmarkFindUnique = mock(
  async (): Promise<MockBookmark | null> => ({
    id: 1,
    title: "Old Title",
    url: "https://old.example.com",
    tags: ["old"],
    folderId: 1,
    createdAt: new Date(),
  }),
);

const mockBookmarkFindMany = mock(
  async (): Promise<MockBookmark[]> => [
    {
      id: 1,
      title: "Bun Documentation",
      url: "https://bun.sh/docs",
      tags: ["bun"],
      folderId: 1,
      createdAt: new Date(),
    },
    {
      id: 2,
      title: "TypeScript Documentation",
      url: "https://typescriptlang.org",
      tags: ["typescript"],
      folderId: 1,
      createdAt: new Date(),
    },
  ],
);

const mockBookmarkUpdate = mock(
  async (
    args: UpdateBookmarkArgs,
  ): Promise<MockBookmark> => ({
    id: args.where.id,
    title: args.data.title ?? "Old Title",
    url:
      args.data.url ??
      "https://old.example.com",
    tags: args.data.tags ?? ["old"],
    folderId: args.data.folderId ?? 1,
    createdAt: new Date(),
  }),
);

const mockBookmarkDelete = mock(
  async (): Promise<MockBookmark> => ({
    id: 1,
    title: "Deleted Bookmark",
    url: "https://example.com",
    tags: ["test"],
    folderId: 1,
    createdAt: new Date(),
  }),
);

const mockPrisma = {
  folder: {
    findUnique: mockFolderFindUnique,
    findMany: mockFolderFindMany,
  },

  bookmark: {
    create: mockBookmarkCreate,
    findUnique: mockBookmarkFindUnique,
    findMany: mockBookmarkFindMany,
    update: mockBookmarkUpdate,
    delete: mockBookmarkDelete,
  },
};

beforeEach(() => {
  mockFolderFindUnique.mockClear();
  mockFolderFindMany.mockClear();

  mockBookmarkCreate.mockClear();
  mockBookmarkFindUnique.mockClear();
  mockBookmarkFindMany.mockClear();
  mockBookmarkUpdate.mockClear();
  mockBookmarkDelete.mockClear();

  mockFolderFindUnique.mockResolvedValue({
    id: 1,
    name: "Development",
    createdAt: new Date(),
  });

  mockBookmarkFindUnique.mockResolvedValue({
    id: 1,
    title: "Old Title",
    url: "https://old.example.com",
    tags: ["old"],
    folderId: 1,
    createdAt: new Date(),
  });

  mockBookmarkFindMany.mockResolvedValue([
    {
      id: 1,
      title: "Bun Documentation",
      url: "https://bun.sh/docs",
      tags: ["bun"],
      folderId: 1,
      createdAt: new Date(),
    },
    {
      id: 2,
      title: "TypeScript Documentation",
      url: "https://typescriptlang.org",
      tags: ["typescript"],
      folderId: 1,
      createdAt: new Date(),
    },
  ]);
});

mock.module("../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

const { resolvers } =
  await import("../src/graphql/resolvers");

describe("Bookmark resolvers", () => {
  // --------------------------------------------------
  // CREATE BOOKMARK
  // --------------------------------------------------

  test("creates a bookmark successfully", async () => {
    const result =
      await resolvers.Mutation.createBookmark(
        undefined,
        {
          input: {
            title: "Bun Documentation",
            url: "https://bun.sh/docs",
            tags: ["bun", "typescript"],
            folderId: 1,
          },
        },
      );

    expect(result.title).toBe(
      "Bun Documentation",
    );

    expect(result.url).toBe(
      "https://bun.sh/docs",
    );

    expect(result.tags).toEqual([
      "bun",
      "typescript",
    ]);

    expect(result.folderId).toBe(1);

    expect(
      mockFolderFindUnique,
    ).toHaveBeenCalled();

    expect(
      mockBookmarkCreate,
    ).toHaveBeenCalled();
  });

  test("rejects an empty bookmark title", async () => {
    const promise =
      resolvers.Mutation.createBookmark(
        undefined,
        {
          input: {
            title: "",
            url: "https://example.com",
            tags: [],
            folderId: 1,
          },
        },
      );

    await expect(
      promise,
    ).rejects.toBeInstanceOf(GraphQLError);

    await expect(
      promise,
    ).rejects.toMatchObject({
      extensions: {
        code: "INVALID_BOOKMARK_TITLE",
      },
    });
  });

  test(
    "rejects a whitespace-only bookmark title",
    async () => {
      const promise =
        resolvers.Mutation.createBookmark(
          undefined,
          {
            input: {
              title: "   ",
              url: "https://example.com",
              tags: [],
              folderId: 1,
            },
          },
        );

      await expect(
        promise,
      ).rejects.toMatchObject({
        extensions: {
          code: "INVALID_BOOKMARK_TITLE",
        },
      });
    },
  );

  test(
    "rejects an invalid bookmark URL",
    async () => {
      const promise =
        resolvers.Mutation.createBookmark(
          undefined,
          {
            input: {
              title: "Invalid URL Test",
              url: "not-a-valid-url",
              tags: [],
              folderId: 1,
            },
          },
        );

      await expect(
        promise,
      ).rejects.toMatchObject({
        extensions: {
          code: "INVALID_BOOKMARK_URL",
        },
      });
    },
  );

  test(
    "rejects creating a bookmark when the folder does not exist",
    async () => {
      mockFolderFindUnique.mockResolvedValueOnce(
        null,
      );

      const promise =
        resolvers.Mutation.createBookmark(
          undefined,
          {
            input: {
              title: "Test Bookmark",
              url: "https://example.com",
              tags: [],
              folderId: 999,
            },
          },
        );

      await expect(
        promise,
      ).rejects.toMatchObject({
        extensions: {
          code: "FOLDER_NOT_FOUND",
        },
      });

      expect(
        mockBookmarkCreate,
      ).not.toHaveBeenCalled();
    },
  );

  // --------------------------------------------------
  // UPDATE BOOKMARK
  // --------------------------------------------------

  test(
    "updates a bookmark successfully",
    async () => {
      const result =
        await resolvers.Mutation.updateBookmark(
          undefined,
          {
            id: 1,
            input: {
              title: "Updated Title",
              url: "https://updated.example.com",
              tags: ["updated", "bun"],
            },
          },
        );

      expect(result.title).toBe(
        "Updated Title",
      );

      expect(result.url).toBe(
        "https://updated.example.com",
      );

      expect(result.tags).toEqual([
        "updated",
        "bun",
      ]);

      expect(
        mockBookmarkFindUnique,
      ).toHaveBeenCalled();

      expect(
        mockBookmarkUpdate,
      ).toHaveBeenCalled();
    },
  );

  test(
    "rejects updating a bookmark that does not exist",
    async () => {
      mockBookmarkFindUnique.mockResolvedValueOnce(
        null,
      );

      const promise =
        resolvers.Mutation.updateBookmark(
          undefined,
          {
            id: 999,
            input: {
              title: "Updated Title",
            },
          },
        );

      await expect(
        promise,
      ).rejects.toMatchObject({
        extensions: {
          code: "BOOKMARK_NOT_FOUND",
        },
      });

      expect(
        mockBookmarkUpdate,
      ).not.toHaveBeenCalled();
    },
  );

  test(
    "rejects update when no fields are provided",
    async () => {
      const promise =
        resolvers.Mutation.updateBookmark(
          undefined,
          {
            id: 1,
            input: {},
          },
        );

      await expect(
        promise,
      ).rejects.toMatchObject({
        extensions: {
          code: "NO_UPDATE_FIELDS",
        },
      });

      expect(
        mockBookmarkUpdate,
      ).not.toHaveBeenCalled();
    },
  );

  // --------------------------------------------------
  // DELETE BOOKMARK
  // --------------------------------------------------

  test(
    "deletes a bookmark successfully",
    async () => {
      const result =
        await resolvers.Mutation.deleteBookmark(
          undefined,
          {
            id: 1,
          },
        );

      expect(result).toBe(true);

      expect(
        mockBookmarkFindUnique,
      ).toHaveBeenCalled();

      expect(
        mockBookmarkDelete,
      ).toHaveBeenCalled();
    },
  );

  test(
    "rejects deleting a bookmark that does not exist",
    async () => {
      mockBookmarkFindUnique.mockResolvedValueOnce(
        null,
      );

      const promise =
        resolvers.Mutation.deleteBookmark(
          undefined,
          {
            id: 999,
          },
        );

      await expect(
        promise,
      ).rejects.toMatchObject({
        extensions: {
          code: "BOOKMARK_NOT_FOUND",
        },
      });

      expect(
        mockBookmarkDelete,
      ).not.toHaveBeenCalled();
    },
  );

  // --------------------------------------------------
  // MOVE BOOKMARK
  // --------------------------------------------------

  test(
    "moves a bookmark successfully",
    async () => {
      mockBookmarkFindUnique.mockResolvedValueOnce({
        id: 1,
        title: "Bun Documentation",
        url: "https://bun.sh/docs",
        tags: ["bun"],
        folderId: 1,
        createdAt: new Date(),
      });

      mockFolderFindUnique.mockResolvedValueOnce({
        id: 2,
        name: "Resources",
        createdAt: new Date(),
      });

      const result =
        await resolvers.Mutation.moveBookmark(
          undefined,
          {
            id: 1,
            folderId: 2,
          },
        );

      expect(result.folderId).toBe(2);

      expect(
        mockBookmarkFindUnique,
      ).toHaveBeenCalled();

      expect(
        mockFolderFindUnique,
      ).toHaveBeenCalled();

      expect(
        mockBookmarkUpdate,
      ).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          folderId: 2,
        },
      });
    },
  );

  test(
    "rejects moving a bookmark that does not exist",
    async () => {
      mockBookmarkFindUnique.mockResolvedValueOnce(
        null,
      );

      const promise =
        resolvers.Mutation.moveBookmark(
          undefined,
          {
            id: 999,
            folderId: 2,
          },
        );

      await expect(
        promise,
      ).rejects.toMatchObject({
        extensions: {
          code: "BOOKMARK_NOT_FOUND",
        },
      });

      expect(
        mockFolderFindUnique,
      ).not.toHaveBeenCalled();

      expect(
        mockBookmarkUpdate,
      ).not.toHaveBeenCalled();
    },
  );

  test(
    "rejects moving a bookmark when the target folder does not exist",
    async () => {
      mockFolderFindUnique.mockResolvedValueOnce(
        null,
      );

      const promise =
        resolvers.Mutation.moveBookmark(
          undefined,
          {
            id: 1,
            folderId: 999,
          },
        );

      await expect(
        promise,
      ).rejects.toMatchObject({
        extensions: {
          code: "FOLDER_NOT_FOUND",
        },
      });

      expect(
        mockBookmarkUpdate,
      ).not.toHaveBeenCalled();
    },
  );

  // --------------------------------------------------
  // FOLDERS QUERY
  // --------------------------------------------------

  test(
    "fetches folders successfully",
    async () => {
      const result =
        await resolvers.Query.folders();

      expect(result).toHaveLength(2);

      const firstFolder = result[0];
      const secondFolder = result[1];

      expect(firstFolder).toBeDefined();
      expect(secondFolder).toBeDefined();

      if (!firstFolder || !secondFolder) {
        throw new Error(
          "Expected two folders",
        );
      }

      expect(firstFolder.name).toBe(
        "Development",
      );

      expect(secondFolder.name).toBe(
        "Resources",
      );

      expect(
        mockFolderFindMany,
      ).toHaveBeenCalledWith({
        orderBy: {
          createdAt: "desc",
        },
      });
    },
  );

  // --------------------------------------------------
  // FOLDER QUERY
  // --------------------------------------------------

  test(
    "fetches a folder by id",
    async () => {
      const result =
        await resolvers.Query.folder(
          undefined,
          {
            id: 1,
          },
        );

      expect(result).toBeDefined();

      if (!result) {
        throw new Error(
          "Expected folder to exist",
        );
      }

      expect(result.id).toBe(1);

      expect(result.name).toBe(
        "Development",
      );

      expect(
        mockFolderFindUnique,
      ).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
    },
  );

  // --------------------------------------------------
  // BOOKMARKS QUERY
  // --------------------------------------------------

  test(
    "fetches bookmarks successfully",
    async () => {
      const result =
        await resolvers.Query.bookmarks(
          undefined,
          {},
        );

      expect(result.items).toHaveLength(2);

      const firstBookmark = result.items[0];
      const secondBookmark = result.items[1];

      expect(firstBookmark).toBeDefined();
      expect(secondBookmark).toBeDefined();

      if (!firstBookmark || !secondBookmark) {
        throw new Error(
          "Expected two bookmarks",
        );
      }

      expect(firstBookmark.id).toBe(1);

      expect(secondBookmark.id).toBe(2);

      expect(result.hasNextPage).toBe(false);

      expect(result.nextCursor).toBe(null);

      expect(
        mockBookmarkFindMany,
      ).toHaveBeenCalled();
    },
  );

  test(
    "supports folderId filtering",
    async () => {
      const result =
        await resolvers.Query.bookmarks(
          undefined,
          {
            folderId: 1,
          },
        );

      expect(result.items).toHaveLength(2);

      expect(
        mockBookmarkFindMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            folderId: 1,
          },
        }),
      );
    },
  );

  test(
    "supports search filtering",
    async () => {
      const result =
        await resolvers.Query.bookmarks(
          undefined,
          {
            search: "Bun",
          },
        );

      expect(result.items).toHaveLength(2);

      expect(
        mockBookmarkFindMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            title: {
              contains: "Bun",
              mode: "insensitive",
            },
          },
        }),
      );
    },
  );

  test(
    "limits take to a maximum of 50",
    async () => {
      await resolvers.Query.bookmarks(
        undefined,
        {
          take: 100,
        },
      );

      expect(
        mockBookmarkFindMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 51,
        }),
      );
    },
  );

  test(
    "supports cursor pagination",
    async () => {
      await resolvers.Query.bookmarks(
        undefined,
        {
          cursor: 1,
          take: 2,
        },
      );

      expect(
        mockBookmarkFindMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 3,
          skip: 1,
          cursor: {
            id: 1,
          },
        }),
      );
    },
  );

  test(
    "returns nextCursor when more bookmarks exist",
    async () => {
      mockBookmarkFindMany.mockResolvedValueOnce([
        {
          id: 1,
          title: "Bookmark One",
          url: "https://one.example.com",
          tags: [],
          folderId: 1,
          createdAt: new Date(),
        },
        {
          id: 2,
          title: "Bookmark Two",
          url: "https://two.example.com",
          tags: [],
          folderId: 1,
          createdAt: new Date(),
        },
        {
          id: 3,
          title: "Bookmark Three",
          url: "https://three.example.com",
          tags: [],
          folderId: 1,
          createdAt: new Date(),
        },
      ]);

      const result =
        await resolvers.Query.bookmarks(
          undefined,
          {
            take: 2,
          },
        );

      expect(result.items).toHaveLength(2);

      expect(result.hasNextPage).toBe(true);

      expect(result.nextCursor).toBe(2);
    },
  );

  // --------------------------------------------------
  // FOLDER -> BOOKMARKS
  // --------------------------------------------------

  test(
    "fetches bookmarks for a folder",
    async () => {
      const result =
        await resolvers.Folder.bookmarks({
          id: 1,
        });

      expect(result).toHaveLength(2);

      const firstBookmark = result[0];
      const secondBookmark = result[1];

      expect(firstBookmark).toBeDefined();
      expect(secondBookmark).toBeDefined();

      if (!firstBookmark || !secondBookmark) {
        throw new Error(
          "Expected two folder bookmarks",
        );
      }

      expect(firstBookmark.folderId).toBe(1);

      expect(secondBookmark.folderId).toBe(1);

      expect(
        mockBookmarkFindMany,
      ).toHaveBeenCalledWith({
        where: {
          folderId: 1,
        },
        orderBy: {
          id: "asc",
        },
      });
    },
  );

  // --------------------------------------------------
  // BOOKMARK -> FOLDER
  // --------------------------------------------------

  test(
    "fetches folder for a bookmark",
    async () => {
      const result =
        await resolvers.Bookmark.folder({
          folderId: 1,
        });

      expect(result).toBeDefined();

      if (!result) {
        throw new Error(
          "Expected folder to exist",
        );
      }

      expect(result.id).toBe(1);

      expect(result.name).toBe(
        "Development",
      );

      expect(
        mockFolderFindUnique,
      ).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
    },
  );
});