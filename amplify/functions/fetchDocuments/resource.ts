import { defineFunction } from "@aws-amplify/backend";

export const fetchDocuments = defineFunction({
  name: "fetchDocuments",
  entry: "./handler.ts"
});