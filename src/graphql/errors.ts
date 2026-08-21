import { GraphQLError } from "graphql";

export function appError(
  message: string,
  code: string,
) {
  return new GraphQLError(message, {
    extensions: {
      code,
    },
  });
}