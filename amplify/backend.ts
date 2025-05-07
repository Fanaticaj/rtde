import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { deleteDocument } from "./functions/deleteDocument/resource";
import { downloadDocument } from "./functions/downloadDocument/resource";
import { fetchDocuments } from "./functions/fetchDocuments/resource";
import { createDocument } from "./functions/createDocument/resource";

defineBackend({
  auth,
  data,
  deleteDocument,
  downloadDocument,
  fetchDocuments,
  createDocument
});