import fs from 'fs';
import path from 'path';
import { GitRepoReader } from './input-readers/git-repo';
import { GithubCliReader } from './input-readers/github-cli';
import Platform from './platform';

const core = require('@actions/core');

/**
 * Input variables specified in workflows using "with" prop.
 *
 * Note that input is always passed as a string, even booleans.
 */
class Input {
  public static cliOptions;
  public static githubInputEnabled: boolean = true;

  // also enabled debug logging for cloud runner
  static get cloudRunnerTests(): boolean {
    return Input.getInput(`cloudRunnerTests`) || Input.getInput(`CloudRunnerTests`) || false;
  }
  private static getInput(query) {
    const coreInput = core.getInput(query);
    if (Input.githubInputEnabled && coreInput && coreInput !== '') {
      return coreInput;
    }

    return Input.cliOptions !== undefined && Input.cliOptions[query] !== undefined
      ? Input.cliOptions[query]
      : process.env[query] !== undefined
      ? process.env[query]
      : process.env[Input.ToEnvVarFormat(query)]
      ? process.env[Input.ToEnvVarFormat(query)]
      : '';
  }
  static get region(): string {
    return Input.getInput('region') || 'eu-west-2';
  }
  static async githubRepo() {
    return (
      Input.getInput('GITHUB_REPOSITORY') ||
      Input.getInput('GITHUB_REPO') ||
      (await GitRepoReader.GetRemote()) ||
      'game-ci/unity-builder'
    );
  }
  static async branch() {
    if (await GitRepoReader.GetBranch()) {
      return await GitRepoReader.GetBranch();
    } else if (Input.getInput(`GITHUB_REF`)) {
      return Input.getInput(`GITHUB_REF`).replace('refs/', '').replace(`head/`, '');
    } else if (Input.getInput('branch')) {
      return Input.getInput('branch');
    } else {
      return 'main';
    }
  }

  static get gitSha() {
    if (Input.getInput(`GITHUB_SHA`)) {
      return Input.getInput(`GITHUB_SHA`);
    } else if (Input.getInput(`GitSHA`)) {
      return Input.getInput(`GitSHA`);
    } else if (GitRepoReader.GetSha()) {
      return GitRepoReader.GetSha();
    }
  }
  static get runNumber() {
    return Input.getInput('GITHUB_RUN_NUMBER') || '0';
  }

  static get targetPlatform() {
    return Input.getInput('targetPlatform') || Platform.default;
  }

  static get unityVersion() {
    return Input.getInput('unityVersion') || 'auto';
  }

  static get customImage() {
    return Input.getInput('customImage');
  }

  static get projectPath() {
    const input = Input.getInput('projectPath');
    const rawProjectPath = input
      ? input
      : fs.existsSync(path.join('test-project', 'ProjectSettings', 'ProjectVersion.txt')) &&
        !fs.existsSync(path.join('ProjectSettings', 'ProjectVersion.txt'))
      ? 'test-project'
      : '.';
    return rawProjectPath.replace(/\/$/, '');
  }

  static get buildName() {
    return Input.getInput('buildName') || this.targetPlatform;
  }

  static get buildsPath() {
    return Input.getInput('buildsPath') || 'build';
  }

  static get buildMethod() {
    return Input.getInput('buildMethod') || ''; // processed in docker file
  }

  static get customParameters() {
    return Input.getInput('customParameters') || '';
  }

  static get versioningStrategy() {
    return Input.getInput('versioning') || 'Semantic';
  }

  static get specifiedVersion() {
    return Input.getInput('version') || '';
  }

  static get androidVersionCode() {
    return Input.getInput('androidVersionCode');
  }

  static get androidAppBundle() {
    const input = Input.getInput('androidAppBundle') || false;

    return input === 'true';
  }

  static get androidKeystoreName() {
    return Input.getInput('androidKeystoreName') || '';
  }

  static get androidKeystoreBase64() {
    return Input.getInput('androidKeystoreBase64') || '';
  }

  static get androidKeystorePass() {
    return Input.getInput('androidKeystorePass') || '';
  }

  static get androidKeyaliasName() {
    return Input.getInput('androidKeyaliasName') || '';
  }

  static get androidKeyaliasPass() {
    return Input.getInput('androidKeyaliasPass') || '';
  }

  static get androidTargetSdkVersion() {
    return Input.getInput('androidTargetSdkVersion') || '';
  }

  static get sshAgent() {
    return Input.getInput('sshAgent') || '';
  }

  static async gitPrivateToken() {
    return Input.getInput('gitPrivateToken') || (await Input.githubToken());
  }

  static get chownFilesTo() {
    return Input.getInput('chownFilesTo') || '';
  }

  static get allowDirtyBuild() {
    const input = Input.getInput('allowDirtyBuild') || false;

    return input === 'true';
  }

  static get postBuildSteps() {
    return Input.getInput('postBuildSteps') || '';
  }

  static get preBuildSteps() {
    return Input.getInput('preBuildSteps') || '';
  }

  static get customJob() {
    return Input.getInput('customJob') || '';
  }

  static get awsBaseStackName() {
    return Input.getInput('awsBaseStackName') || 'game-ci';
  }

  static get cloudRunnerCluster() {
    return Input.getInput('cloudRunnerCluster') || 'local';
  }

  static get cloudRunnerCpu() {
    return Input.getInput('cloudRunnerCpu') || '1.0';
  }

  static get cloudRunnerMemory() {
    return Input.getInput('cloudRunnerMemory') || '750M';
  }

  static async githubToken() {
    return Input.getInput('githubToken') || (await GithubCliReader.GetGitHubAuthToken()) || '';
  }

  static get kubeConfig() {
    return Input.getInput('kubeConfig') || '';
  }

  static get kubeVolume() {
    return Input.getInput('kubeVolume') || '';
  }

  static get kubeVolumeSize() {
    return Input.getInput('kubeVolumeSize') || '5Gi';
  }

  public static ToEnvVarFormat(input: string) {
    return input
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toUpperCase()
      .replace(/ /g, '_');
  }
}

export default Input;
