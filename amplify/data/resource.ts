import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Document: a
    .model({
      title: a.string(),
      content: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]), // or add allow.apiKey() here if needed
  });

export const data = defineData({
  schema, // ✅ This now has a value
  authorizationModes: {
    defaultAuthorizationMode: "userPool", // 🔄 Switch this from "apiKey" to "userPool"
  },
});

export type Schema = ClientSchema<typeof schema>;
