import { setFailed } from "@actions/core";
import { postRun } from "./post-run";

postRun().catch((error) => setFailed((error as Error).message));
