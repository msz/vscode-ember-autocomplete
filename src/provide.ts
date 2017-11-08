import { join, resolve } from "path";
import * as repl from "repl";
import { CompletionItem } from "vscode";
import { IConfig } from "./config";
import { IFsFunctions } from "./fs-functions";
import { IState } from "./i-state";
import { PackageCompletionItem } from "./package-completion-item";

export function provide(
  state: IState,
  config: IConfig,
  fsf: IFsFunctions
): Promise<CompletionItem[]> {
  return getNpmPackages(state, config, fsf)
    .then(dependencies => {
      return config.packageSubfoldersIntellisense
        ? readModuleSubFolders(dependencies, state, fsf)
        : dependencies;
    })
    .then(dependencies => dependencies.map(d => toCompletionItem(d, state)));
}

export function getNpmPackages(
  state: IState,
  config: IConfig,
  fsf: IFsFunctions
) {
  return fsf
    .readJson(getPackageJson(state, config, fsf))
    .then(packageJson => [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(
        config.scanDevDependencies ? packageJson.devDependencies || {} : {}
      ),
      ...(config.showBuildInLibs ? getBuildInModules() : [])
    ]);
}

function getBuildInModules(): string[] {
  return (repl as any)._builtinLibs;
}

function toCompletionItem(dependency: string, state: IState) {
  return new PackageCompletionItem(dependency, state);
}

function getPackageJson(
  state: IState,
  config: IConfig,
  fsf: IFsFunctions
): string {
  return config.recursivePackageJsonLookup
    ? nearestPackageJson(state.rootPath, state.filePath, fsf)
    : join(state.rootPath, "package.json");
}

function nearestPackageJson(
  rootPath: string,
  currentPath: string,
  fsf: IFsFunctions
): string {
  const packageJsonFullPath = join(currentPath, "package.json");

  if (currentPath === rootPath || fsf.isFile(packageJsonFullPath)) {
    return packageJsonFullPath;
  }

  return nearestPackageJson(rootPath, resolve(currentPath, ".."), fsf);
}

function readModuleSubFolders(
  dependencies: string[],
  state: IState,
  fsf: IFsFunctions
) {
  const fragments: string[] = state.textCurrentLine.split("from ");
  const pkgFragment: string = fragments[fragments.length - 1].split(/['"]/)[1];
  const pkgFragmentSplit = pkgFragment.split("/");
  const packageName: string = pkgFragmentSplit[0];

  if (dependencies.filter(dep => dep === packageName).length) {
    const path = join(state.rootPath, "node_modules", ...pkgFragmentSplit);
    // Todo: make the replace function work with other filetypes as well
    return fsf
      .readDir(path)
      .then(files => files.map(file => pkgFragment + file.replace(/\.js$/, "")))
      .catch(err => [""]);
  }

  return Promise.resolve(dependencies);
}
