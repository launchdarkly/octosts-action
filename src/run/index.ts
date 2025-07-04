import * as core from "@actions/core";
import { run } from "./octosts-action";

run().catch((error) => core.setFailed((error as Error).message));
