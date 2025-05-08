import { Amplify } from "aws-amplify";
import config from "../amplify/amplify_outputs.json";

Amplify.configure(config, { ssr: true });