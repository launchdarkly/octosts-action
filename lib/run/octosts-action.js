"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const crypto = __importStar(require("node:crypto"));
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const undici_1 = require("undici");
const inputs_1 = require("./inputs");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const agent = new undici_1.Agent({ allowH2: true });
            (0, undici_1.setGlobalDispatcher)(agent);
            const { actionsToken, actionsUrl } = (0, inputs_1.getActionsEnvVars)();
            const { domain, scope, identity, configureGit } = (0, inputs_1.getInputs)();
            const ghRep = yield (0, undici_1.fetch)(`${actionsUrl}&audience=${domain}`, {
                headers: {
                    authorization: `Bearer ${actionsToken}`,
                },
            });
            if (!ghRep.ok) {
                const errorText = yield ghRep.text();
                return core.setFailed(`Failed to get installation token: ${errorText}`);
            }
            const ghRepJson = (yield ghRep.json());
            if (ghRepJson.value !== null) {
                core.setSecret(ghRepJson.value);
            }
            core.debug(JSON.stringify(ghRepJson));
            const scopes = [scope];
            const scopesParam = scopes.join(",");
            core.debug(`Creating token for ${identity} using ${scope} against ${domain}`);
            const octoStsRep = yield (0, undici_1.fetch)(`https://${domain}/sts/exchange?scope=${scope}&scopes=${scopesParam}&identity=${identity}`, {
                headers: {
                    authorization: `Bearer ${ghRepJson.value}`,
                },
            });
            if (!octoStsRep.ok) {
                const errorText = yield octoStsRep.text();
                return core.setFailed(`Failed to fetch from OctoSTS: ${errorText}`);
            }
            const octoStsRepJson = (yield octoStsRep.json());
            if (!(octoStsRepJson === null || octoStsRepJson === void 0 ? void 0 : octoStsRepJson.token)) {
                return core.setFailed(octoStsRepJson === null || octoStsRepJson === void 0 ? void 0 : octoStsRepJson.message);
            }
            const tokHash = crypto
                .createHash("sha256")
                .update(octoStsRepJson === null || octoStsRepJson === void 0 ? void 0 : octoStsRepJson.token)
                .digest("hex");
            core.setSecret(octoStsRepJson === null || octoStsRepJson === void 0 ? void 0 : octoStsRepJson.token);
            core.setOutput("token", octoStsRepJson === null || octoStsRepJson === void 0 ? void 0 : octoStsRepJson.token);
            core.saveState("token", octoStsRepJson === null || octoStsRepJson === void 0 ? void 0 : octoStsRepJson.token);
            core.info(`Created token with hash: ${tokHash}`);
            if (configureGit) {
                const b64Token = Buffer.from(`x-access-token:${octoStsRepJson === null || octoStsRepJson === void 0 ? void 0 : octoStsRepJson.token}`).toString("base64");
                try {
                    yield exec.exec("git", [
                        "config",
                        "--global",
                        "--unset-all",
                        "http.https://github.com/.extraheader",
                        "^AUTHORIZATION: basic",
                    ]);
                }
                catch (_error) {
                    // Ignore the error if the config key doesn't exist
                    core.debug("No existing extraheader to unset");
                }
                // Set the token as a git credential
                yield exec.exec("git", [
                    "config",
                    "--global",
                    "http.https://github.com/.extraheader",
                    `AUTHORIZATION: basic ${b64Token}`,
                ]);
                yield exec.exec("git", [
                    "config",
                    "--global",
                    "url.https://github.com/.insteadOf",
                    `git@github.com`,
                ]);
            }
            return;
        }
        catch (error) {
            core.debug(JSON.stringify(error));
            return core.setFailed(error.message);
        }
    });
}
//# sourceMappingURL=octosts-action.js.map