import { setFailed } from "@actions/core";
import { run } from "./octosts-action";

run().catch((error) => setFailed((error as Error).message));
