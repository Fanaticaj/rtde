import { defineFunction } from "@aws-amplify/backend";

export const downloadDocument = defineFunction({
  name: "downloadDocument",
  entry: "./handler.ts"
});