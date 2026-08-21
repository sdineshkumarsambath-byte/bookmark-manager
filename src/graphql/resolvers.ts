import { prisma } from "../lib/prisma";
import { appError } from "./errors";

type CreateFolderInput = {
  name: string;
};

type CreateBookmarkInput = {
  title: string;
  url: string;
  tags: string[];
  folderId: number;
};

type UpdateBookmarkInput = {
  title?: string | null;
  url?: string | null;
  tags?: string[] | null;
};

type BookmarksArgs = {
  folderId?: number | null;
  search?: string | null;
  take?: number | null;
  cursor?: number | null;
};

function validateTitle(title: string): string {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    throw appError(
      "Bookmark title cannot be empty",
      "INVALID_BOOKMARK_TITLE",
    );
  }

  return trimmedTitle;
}

function validateUrl(url: string): string {
  const trimmedUrl = url.trim();

  try {
    new URL(trimmedUrl);
  } catch {
    throw appError(
      "Invalid bookmark URL",
      "INVALID_BOOKMARK_URL",
    );
  }

  return trimmedUrl;
}

export const resolvers = {
  Query: {
    folders: async () => {
      return prisma.folder.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
    },

    folder: async (
      _parent: unknown,
      args: { id: number },
    ) => {
      return prisma.folder.findUnique({
        where: {
          id: args.id,
        },
      });
    },

    bookmarks: async (
      _parent: unknown,
      args: BookmarksArgs,
    ) => {
      const take = Math.min(
        Math.max(args.take ?? 10, 1),
        50,
      );

      const bookmarks = await prisma.bookmark.findMany({
        where: {
          ...(args.folderId !== null &&
          args.folderId !== undefined
            ? {
                folderId: args.folderId,
              }
            : {}),

          ...(args.search?.trim()
            ? {
                title: {
                  contains: args.search.trim(),
                  mode: "insensitive",
                },
              }
            : {}),
        },

        orderBy: {
          id: "asc",
        },

        take: take + 1,

        ...(args.cursor
          ? {
              skip: 1,
              cursor: {
                id: args.cursor,
              },
            }
          : {}),
      });

      const hasNextPage = bookmarks.length > take;

      const items = hasNextPage
        ? bookmarks.slice(0, take)
        : bookmarks;

      const lastItem = items[items.length - 1];

      const nextCursor =
        hasNextPage && lastItem
          ? lastItem.id
          : null;

      return {
        items,
        nextCursor,
        hasNextPage,
      };
    },
  },

  Folder: {
    bookmarks: async (
      parent: { id: number },
    ) => {
      return prisma.bookmark.findMany({
        where: {
          folderId: parent.id,
        },
        orderBy: {
          id: "asc",
        },
      });
    },
  },

  Bookmark: {
    folder: async (
      parent: { folderId: number },
    ) => {
      return prisma.folder.findUnique({
        where: {
          id: parent.folderId,
        },
      });
    },
  },

  Mutation: {
    createFolder: async (
      _parent: unknown,
      args: { input: CreateFolderInput },
    ) => {
      const name = args.input.name.trim();

      if (!name) {
        throw appError(
          "Folder name cannot be empty",
          "INVALID_FOLDER_NAME",
        );
      }

      return prisma.folder.create({
        data: {
          name,
        },
      });
    },

    createBookmark: async (
      _parent: unknown,
      args: { input: CreateBookmarkInput },
    ) => {
      const title = validateTitle(args.input.title);
      const url = validateUrl(args.input.url);

      const folder = await prisma.folder.findUnique({
        where: {
          id: args.input.folderId,
        },
      });

      if (!folder) {
        throw appError(
          "Folder not found",
          "FOLDER_NOT_FOUND",
        );
      }

      return prisma.bookmark.create({
        data: {
          title,
          url,
          tags: args.input.tags,
          folderId: args.input.folderId,
        },
      });
    },

    updateBookmark: async (
      _parent: unknown,
      args: {
        id: number;
        input: UpdateBookmarkInput;
      },
    ) => {
      const existingBookmark =
        await prisma.bookmark.findUnique({
          where: {
            id: args.id,
          },
        });

      if (!existingBookmark) {
        throw appError(
          "Bookmark not found",
          "BOOKMARK_NOT_FOUND",
        );
      }

      const data: {
        title?: string;
        url?: string;
        tags?: string[];
      } = {};

      if (
        args.input.title !== undefined &&
        args.input.title !== null
      ) {
        data.title = validateTitle(
          args.input.title,
        );
      }

      if (
        args.input.url !== undefined &&
        args.input.url !== null
      ) {
        data.url = validateUrl(
          args.input.url,
        );
      }

      if (
        args.input.tags !== undefined &&
        args.input.tags !== null
      ) {
        data.tags = args.input.tags;
      }

      if (Object.keys(data).length === 0) {
        throw appError(
          "At least one field must be provided for update",
          "NO_UPDATE_FIELDS",
        );
      }

      return prisma.bookmark.update({
        where: {
          id: args.id,
        },
        data,
      });
    },

    deleteBookmark: async (
      _parent: unknown,
      args: { id: number },
    ) => {
      const bookmark =
        await prisma.bookmark.findUnique({
          where: {
            id: args.id,
          },
        });

      if (!bookmark) {
        throw appError(
          "Bookmark not found",
          "BOOKMARK_NOT_FOUND",
        );
      }

      await prisma.bookmark.delete({
        where: {
          id: args.id,
        },
      });

      return true;
    },

    moveBookmark: async (
      _parent: unknown,
      args: {
        id: number;
        folderId: number;
      },
    ) => {
      const bookmark =
        await prisma.bookmark.findUnique({
          where: {
            id: args.id,
          },
        });

      if (!bookmark) {
        throw appError(
          "Bookmark not found",
          "BOOKMARK_NOT_FOUND",
        );
      }

      const folder =
        await prisma.folder.findUnique({
          where: {
            id: args.folderId,
          },
        });

      if (!folder) {
        throw appError(
          "Folder not found",
          "FOLDER_NOT_FOUND",
        );
      }

      return prisma.bookmark.update({
        where: {
          id: args.id,
        },
        data: {
          folderId: args.folderId,
        },
      });
    },
  },
};