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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitConfigManager = void 0;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class GitConfigManager {
    /**
     * Apply git user.name, user.email, AND credential username for the given profile.
     * The credential.username config tells Git Credential Manager (GCM) which
     * stored account to use for HTTPS push/pull — fixing the "wrong account" problem.
     */
    async applyProfile(profile, workspaceFolder, allProfiles = []) {
        const applyGlobally = vscode.workspace
            .getConfiguration('githubSwitcher')
            .get('applyGlobally', false);
        if (applyGlobally) {
            await this.setGlobalConfig('user.name', profile.gitName);
            await this.setGlobalConfig('user.email', profile.gitEmail);
            // Also set credential username globally so GCM picks the right account
            if (profile.githubUsername) {
                await this.setGlobalConfig('credential.https://github.com.username', profile.githubUsername).catch(() => { });
            }
        }
        else if (workspaceFolder) {
            const cwd = workspaceFolder.uri.fsPath;
            // Check if this is actually a git repo before applying local config
            const isRepo = await this.isGitRepo(cwd);
            if (isRepo) {
                await this.setLocalConfig('user.name', profile.gitName, cwd);
                await this.setLocalConfig('user.email', profile.gitEmail, cwd);
                // ── HTTPS credential switching ───────────────────────────────────────
                // Tell GCM which GitHub account to use for this repo.
                if (profile.githubUsername) {
                    await this.setLocalConfig('credential.https://github.com.username', profile.githubUsername, cwd).catch(() => { });
                }
                // ── SSH remote detection ─────────────────────────────────────────────
                // If the profile has an SSH key, check if the remote uses HTTPS.
                // If so, offer to convert it to SSH for seamless auth.
                if (profile.sshKeyPath) {
                    await this.checkAndSuggestSshRemote(cwd, profile, allProfiles);
                }
                else {
                    const remoteType = await this.getRemoteType(cwd);
                    if (remoteType === 'https') {
                        vscode.window.showWarningMessage(`⚠️ [GitHub Switcher] This profile doesn't have an SSH key configured, but the repository uses HTTPS. We recommend setting up an SSH key to avoid permission conflicts.`, 'Setup SSH Key').then(selection => {
                            if (selection === 'Setup SSH Key') {
                                vscode.commands.executeCommand('github-profile-switcher.manageProfiles');
                            }
                        });
                    }
                }
            }
            else {
                // Not a git repo — fall back to global config
                await this.setGlobalConfig('user.name', profile.gitName);
                await this.setGlobalConfig('user.email', profile.gitEmail);
            }
        }
        else {
            await this.setGlobalConfig('user.name', profile.gitName);
            await this.setGlobalConfig('user.email', profile.gitEmail);
        }
    }
    /**
     * Detect if the remote origin uses HTTPS for github.com.
     * If so, suggest converting to SSH. Also checks if the remote owner matches
     * one of the other profiles and suggests correction.
     */
    async checkAndSuggestSshRemote(cwd, activeProfile, allProfiles = []) {
        try {
            const { stdout } = await execAsync(`git -C "${cwd}" remote get-url origin`);
            const remoteUrl = stdout.trim();
            // If it's HTTPS/SSH github.com, we can check/suggest
            const githubMatch = remoteUrl.match(/^(?:https:\/\/github\.com\/|git@github\.com:)([^\/]+)\/(.+?)(?:\.git)?$/);
            if (githubMatch) {
                const [, org, repo] = githubMatch;
                const activeUsername = activeProfile.githubUsername;
                // Find other stored profile usernames to detect mismatches
                const otherUsernames = allProfiles
                    .map(p => p.githubUsername)
                    .filter(uname => uname && uname.toLowerCase() !== activeUsername.toLowerCase());
                let targetOrg = org;
                let isOwnerMismatch = false;
                // If the repository owner belongs to one of our other profiles, warning is triggered
                if (org.toLowerCase() !== activeUsername.toLowerCase() &&
                    otherUsernames.some(uname => uname.toLowerCase() === org.toLowerCase())) {
                    isOwnerMismatch = true;
                    targetOrg = activeUsername;
                }
                const sshUrl = `git@github.com:${targetOrg}/${repo}.git`;
                const originalSshUrl = `git@github.com:${org}/${repo}.git`;
                let action;
                const repoName = path.basename(cwd);
                if (isOwnerMismatch) {
                    action = await vscode.window.showWarningMessage(`⚠️ [GitHub Switcher] Owner Mismatch!\nYou switched to profile "${activeProfile.label}" (@${activeUsername}), but this repository remote owner is "${org}" (which belongs to your other profile).\n\nIf this repository should belong to your active account "@${activeUsername}", we can convert it to SSH under your username.\n\nChoose conversion target:`, { modal: true }, `Convert to SSH under @${activeUsername}`, `Keep original owner @${org}`);
                }
                else if (remoteUrl.startsWith('https://')) {
                    // Normal HTTPS -> SSH conversion
                    action = await vscode.window.showWarningMessage(`[GitHub Switcher] Repository "${repoName}" is using an HTTPS remote URL. This will cause authentication/permission conflicts when pushing/pulling with multiple accounts.\n\nWould you like to convert the remote URL to SSH (${sshUrl}) for seamless authentication?`, { modal: true }, 'Convert to SSH');
                }
                if (action === 'Convert to SSH' || action === `Convert to SSH under @${activeUsername}`) {
                    await execAsync(`git -C "${cwd}" remote set-url origin "${sshUrl}"`);
                    vscode.window.showInformationMessage(`✅ Remote successfully converted to SSH: ${sshUrl}`);
                }
                else if (action === `Keep original owner @${org}`) {
                    await execAsync(`git -C "${cwd}" remote set-url origin "${originalSshUrl}"`);
                    vscode.window.showInformationMessage(`✅ Remote successfully converted to SSH (Original Owner): ${originalSshUrl}`);
                }
            }
        }
        catch {
            // No remote or not a git repo — ignore
        }
    }
    /** Get current remote URL for the workspace */
    async getRemoteUrl(cwd) {
        try {
            const { stdout } = await execAsync(`git -C "${cwd}" remote get-url origin`);
            return stdout.trim();
        }
        catch {
            return undefined;
        }
    }
    /** Detect whether remote uses SSH or HTTPS */
    async getRemoteType(cwd) {
        const url = await this.getRemoteUrl(cwd);
        if (!url)
            return 'none';
        if (url.startsWith('git@') || url.startsWith('ssh://'))
            return 'ssh';
        if (url.startsWith('https://') || url.startsWith('http://'))
            return 'https';
        return 'none';
    }
    async getCurrentGitConfig(cwd) {
        try {
            const nameCmd = cwd
                ? `git -C "${cwd}" config user.name`
                : 'git config --global user.name';
            const emailCmd = cwd
                ? `git -C "${cwd}" config user.email`
                : 'git config --global user.email';
            const [nameResult, emailResult] = await Promise.all([
                execAsync(nameCmd).catch(() => ({ stdout: '' })),
                execAsync(emailCmd).catch(() => ({ stdout: '' })),
            ]);
            return {
                name: nameResult.stdout.trim(),
                email: emailResult.stdout.trim(),
            };
        }
        catch {
            return { name: '', email: '' };
        }
    }
    async setGlobalConfig(key, value) {
        const safeValue = value.replace(/"/g, '\\"');
        await execAsync(`git config --global ${key} "${safeValue}"`);
    }
    async setLocalConfig(key, value, cwd) {
        const safeValue = value.replace(/"/g, '\\"');
        await execAsync(`git -C "${cwd}" config ${key} "${safeValue}"`);
    }
    /** Check if the current directory is a git repo */
    async isGitRepo(cwd) {
        try {
            await execAsync(`git -C "${cwd}" rev-parse --git-dir`);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.GitConfigManager = GitConfigManager;
//# sourceMappingURL=gitConfigManager.js.map