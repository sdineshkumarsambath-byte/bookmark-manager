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

/* =====================================================
   VALIDATION FUNCTIONS
===================================================== */

function validateFolderName(name: string): string {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw appError(
      "Folder name cannot be empty",
      "INVALID_FOLDER_NAME",
    );
  }

  return trimmedName;
}

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

/* =====================================================
   COLLECT ALL ERROR SCENARIOS
===================================================== */

async function collectValidationErrors() {
  const errors: {
    code: string;
    message: string;
  }[] = [];

  /* ===================================================
     1. INVALID_FOLDER_NAME
  =================================================== */

  try {
    validateFolderName("");
  } catch (error: any) {
    errors.push({
      code:
        error.extensions?.code ??
        "INVALID_FOLDER_NAME",
      message: error.message,
    });
  }

  /* ===================================================
     2. INVALID_BOOKMARK_TITLE
  =================================================== */

  try {
    validateTitle("");
  } catch (error: any) {
    errors.push({
      code:
        error.extensions?.code ??
        "INVALID_BOOKMARK_TITLE",
      message: error.message,
    });
  }

  /* ===================================================
     3. INVALID_BOOKMARK_URL
  =================================================== */

  try {
    validateUrl("invalid-url");
  } catch (error: any) {
    errors.push({
      code:
        error.extensions?.code ??
        "INVALID_BOOKMARK_URL",
      message: error.message,
    });
  }

  /* ===================================================
     4. NO_UPDATE_FIELDS
  =================================================== */

  try {
    const data: {
      title?: string;
      url?: string;
      tags?: string[];
    } = {};

    if (Object.keys(data).length === 0) {
      throw appError(
        "At least one field must be provided for update",
        "NO_UPDATE_FIELDS",
      );
    }
  } catch (error: any) {
    errors.push({
      code:
        error.extensions?.code ??
        "NO_UPDATE_FIELDS",
      message: error.message,
    });
  }

  /* ===================================================
     5. FOLDER_NOT_FOUND
     DB-DEPENDENT VALIDATION
  =================================================== */

  try {
    /*
      Find the highest folder ID currently in the database.
      Then use the next ID as a guaranteed non-existing ID.
    */

    const lastFolder =
      await prisma.folder.findFirst({
        orderBy: {
          id: "desc",
        },
        select: {
          id: true,
        },
      });

    const invalidFolderId =
      (lastFolder?.id ?? 0) + 1;

    const folder =
      await prisma.folder.findUnique({
        where: {
          id: invalidFolderId,
        },
      });

    if (!folder) {
      throw appError(
        "Folder not found",
        "FOLDER_NOT_FOUND",
      );
    }
  } catch (error: any) {
    errors.push({
      code:
        error.extensions?.code ??
        "FOLDER_NOT_FOUND",
      message: error.message,
    });
  }

  /* ===================================================
     6. BOOKMARK_NOT_FOUND
     DB-DEPENDENT VALIDATION
  =================================================== */

  try {
    /*
      Find the highest bookmark ID currently in the database.
      Then use the next ID as a guaranteed non-existing ID.
    */

    const lastBookmark =
      await prisma.bookmark.findFirst({
        orderBy: {
          id: "desc",
        },
        select: {
          id: true,
        },
      });

    const invalidBookmarkId =
      (lastBookmark?.id ?? 0) + 1;

    const bookmark =
      await prisma.bookmark.findUnique({
        where: {
          id: invalidBookmarkId,
        },
      });

    if (!bookmark) {
      throw appError(
        "Bookmark not found",
        "BOOKMARK_NOT_FOUND",
      );
    }
  } catch (error: any) {
    errors.push({
      code:
        error.extensions?.code ??
        "BOOKMARK_NOT_FOUND",
      message: error.message,
    });
  }

  return errors;
}

/* =====================================================
   GRAPHQL RESOLVERS
===================================================== */

export const resolvers = {
  /* ===================================================
     QUERY
  =================================================== */

  Query: {
    /* -------------------------------------------------
       GET ALL FOLDERS
    ------------------------------------------------- */

    folders: async () => {
      return prisma.folder.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
    },

    /* -------------------------------------------------
       GET SINGLE FOLDER
    ------------------------------------------------- */

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

    /* -------------------------------------------------
       GET BOOKMARKS
       FILTER + SEARCH + CURSOR PAGINATION
    ------------------------------------------------- */

    bookmarks: async (
      _parent: unknown,
      args: BookmarksArgs,
    ) => {
      const take = Math.min(
        Math.max(args.take ?? 10, 1),
        50,
      );

      const bookmarks =
        await prisma.bookmark.findMany({
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
                    contains:
                      args.search.trim(),
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

      const hasNextPage =
        bookmarks.length > take;

      const items = hasNextPage
        ? bookmarks.slice(0, take)
        : bookmarks;

      const lastItem =
        items[items.length - 1];

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

    /* -------------------------------------------------
       TEST ALL ERROR HANDLING
    ------------------------------------------------- */

    testErrorHandling: async () => {
      return collectValidationErrors();
    },
  },

  /* ===================================================
     FOLDER FIELD RESOLVER
  =================================================== */

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

  /* ===================================================
     BOOKMARK FIELD RESOLVER
  =================================================== */

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

  /* ===================================================
     MUTATIONS
  =================================================== */

  Mutation: {
    /* -------------------------------------------------
       CREATE FOLDER
    ------------------------------------------------- */

    createFolder: async (
      _parent: unknown,
      args: {
        input: CreateFolderInput;
      },
    ) => {
      const name = validateFolderName(
        args.input.name,
      );

      return prisma.folder.create({
        data: {
          name,
        },
      });
    },

    /* -------------------------------------------------
       CREATE BOOKMARK
    ------------------------------------------------- */

    createBookmark: async (
      _parent: unknown,
      args: {
        input: CreateBookmarkInput;
      },
    ) => {
      const title = validateTitle(
        args.input.title,
      );

      const url = validateUrl(
        args.input.url,
      );

      const folder =
        await prisma.folder.findUnique({
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

    /* -------------------------------------------------
       UPDATE BOOKMARK
    ------------------------------------------------- */

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

      if (
        Object.keys(data).length === 0
      ) {
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

    /* -------------------------------------------------
       DELETE BOOKMARK
    ------------------------------------------------- */

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

    /* -------------------------------------------------
       MOVE BOOKMARK
    ------------------------------------------------- */

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