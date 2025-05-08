import { defineFunction } from "@aws-amplify/backend";

export const createDocument = defineFunction({
  name: "createDocument",
  entry: "./handler.ts"
});