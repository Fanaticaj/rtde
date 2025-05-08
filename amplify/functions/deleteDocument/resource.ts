import { defineFunction } from "@aws-amplify/backend";

export const deleteDocument = defineFunction({
  name: "deleteDocument",
  entry: "./handler.ts"
});