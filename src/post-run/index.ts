import * as core from "@actions/core";
import { postRun } from "./post-run";

postRun().catch((error) => core.setFailed((error as Error).message));
