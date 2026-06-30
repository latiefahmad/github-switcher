import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { GitHubProfile } from './types';

const execAsync = promisify(exec);

export class GitConfigManager {
  /**
   * Apply git user.name, user.email, AND credential username for the given profile.
   * The credential.username config tells Git Credential Manager (GCM) which
   * stored account to use for HTTPS push/pull — fixing the "wrong account" problem.
   */
  async applyProfile(
    profile: GitHubProfile,
    workspaceFolder?: vscode.WorkspaceFolder,
    allProfiles: GitHubProfile[] = []
  ): Promise<void> {
    const applyGlobally = vscode.workspace
      .getConfiguration('githubSwitcher')
      .get<boolean>('applyGlobally', false);

    if (applyGlobally) {
      await this.setGlobalConfig('user.name', profile.gitName);
      await this.setGlobalConfig('user.email', profile.gitEmail);
      // Also set credential username globally so GCM picks the right account
      if (profile.githubUsername) {
        await this.setGlobalConfig(
          'credential.https://github.com.username',
          profile.githubUsername
        ).catch(() => {/* non-fatal */});
      }
    } else if (workspaceFolder) {
      const cwd = workspaceFolder.uri.fsPath;

      // Check if this is actually a git repo before applying local config
      const isRepo = await this.isGitRepo(cwd);

      if (isRepo) {
        await this.setLocalConfig('user.name', profile.gitName, cwd);
        await this.setLocalConfig('user.email', profile.gitEmail, cwd);

        // ── HTTPS credential switching ───────────────────────────────────────
        // Tell GCM which GitHub account to use for this repo.
        if (profile.githubUsername) {
          await this.setLocalConfig(
            'credential.https://github.com.username',
            profile.githubUsername,
            cwd
          ).catch(() => {/* non-fatal if GCM not installed */});
        }

        // ── SSH remote detection ─────────────────────────────────────────────
        // If the profile has an SSH key, check if the remote uses HTTPS.
        // If so, offer to convert it to SSH for seamless auth.
        if (profile.sshKeyPath) {
          await this.checkAndSuggestSshRemote(cwd, profile, allProfiles);
        } else {
          const remoteType = await this.getRemoteType(cwd);
          if (remoteType === 'https') {
            vscode.window.showWarningMessage(
              `⚠️ [GitHub Switcher] This profile doesn't have an SSH key configured, but the repository uses HTTPS. We recommend setting up an SSH key to avoid permission conflicts.`,
              'Setup SSH Key'
            ).then(selection => {
              if (selection === 'Setup SSH Key') {
                vscode.commands.executeCommand('github-profile-switcher.manageProfiles');
              }
            });
          }
        }
      } else {
        // Not a git repo — fall back to global config
        await this.setGlobalConfig('user.name', profile.gitName);
        await this.setGlobalConfig('user.email', profile.gitEmail);
      }
    } else {
      await this.setGlobalConfig('user.name', profile.gitName);
      await this.setGlobalConfig('user.email', profile.gitEmail);
    }
  }

  /**
   * Detect if the remote origin uses HTTPS for github.com.
   * If so, suggest converting to SSH. Also checks if the remote owner matches
   * one of the other profiles and suggests correction.
   */
  async checkAndSuggestSshRemote(
    cwd: string,
    activeProfile: GitHubProfile,
    allProfiles: GitHubProfile[] = []
  ): Promise<void> {
    try {
      const { stdout } = await execAsync(
        `git -C "${cwd}" remote get-url origin`
      );
      const remoteUrl = stdout.trim();

      // If it's HTTPS/SSH github.com, we can check/suggest
      const githubMatch = remoteUrl.match(
        /^(?:https:\/\/github\.com\/|git@github\.com:)([^\/]+)\/(.+?)(?:\.git)?$/
      );
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

        let action: string | undefined;
        const repoName = path.basename(cwd);

        if (isOwnerMismatch) {
          action = await vscode.window.showWarningMessage(
            `⚠️ [GitHub Switcher] Owner Mismatch!\nYou switched to profile "${activeProfile.label}" (@${activeUsername}), but this repository remote owner is "${org}" (which belongs to your other profile).\n\nIf this repository should belong to your active account "@${activeUsername}", we can convert it to SSH under your username.\n\nChoose conversion target:`,
            { modal: true },
            `Convert to SSH under @${activeUsername}`,
            `Keep original owner @${org}`
          );
        } else if (remoteUrl.startsWith('https://')) {
          // Normal HTTPS -> SSH conversion
          action = await vscode.window.showWarningMessage(
            `[GitHub Switcher] Repository "${repoName}" is using an HTTPS remote URL. This will cause authentication/permission conflicts when pushing/pulling with multiple accounts.\n\nWould you like to convert the remote URL to SSH (${sshUrl}) for seamless authentication?`,
            { modal: true },
            'Convert to SSH'
          );
        }

        if (action === 'Convert to SSH' || action === `Convert to SSH under @${activeUsername}`) {
          await execAsync(
            `git -C "${cwd}" remote set-url origin "${sshUrl}"`
          );
          vscode.window.showInformationMessage(
            `✅ Remote successfully converted to SSH: ${sshUrl}`
          );
        } else if (action === `Keep original owner @${org}`) {
          await execAsync(
            `git -C "${cwd}" remote set-url origin "${originalSshUrl}"`
          );
          vscode.window.showInformationMessage(
            `✅ Remote successfully converted to SSH (Original Owner): ${originalSshUrl}`
          );
        }
      }
    } catch {
      // No remote or not a git repo — ignore
    }
  }

  /** Get current remote URL for the workspace */
  async getRemoteUrl(cwd: string): Promise<string | undefined> {
    try {
      const { stdout } = await execAsync(
        `git -C "${cwd}" remote get-url origin`
      );
      return stdout.trim();
    } catch {
      return undefined;
    }
  }

  /** Detect whether remote uses SSH or HTTPS */
  async getRemoteType(cwd: string): Promise<'ssh' | 'https' | 'none'> {
    const url = await this.getRemoteUrl(cwd);
    if (!url) return 'none';
    if (url.startsWith('git@') || url.startsWith('ssh://')) return 'ssh';
    if (url.startsWith('https://') || url.startsWith('http://')) return 'https';
    return 'none';
  }

  async getCurrentGitConfig(
    cwd?: string
  ): Promise<{ name: string; email: string }> {
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
    } catch {
      return { name: '', email: '' };
    }
  }

  private async setGlobalConfig(key: string, value: string): Promise<void> {
    const safeValue = value.replace(/"/g, '\\"');
    await execAsync(`git config --global ${key} "${safeValue}"`);
  }

  private async setLocalConfig(
    key: string,
    value: string,
    cwd: string
  ): Promise<void> {
    const safeValue = value.replace(/"/g, '\\"');
    await execAsync(`git -C "${cwd}" config ${key} "${safeValue}"`);
  }

  /** Check if the current directory is a git repo */
  async isGitRepo(cwd: string): Promise<boolean> {
    try {
      await execAsync(`git -C "${cwd}" rev-parse --git-dir`);
      return true;
    } catch {
      return false;
    }
  }
}
