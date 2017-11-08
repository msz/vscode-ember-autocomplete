import { join, resolve } from "path";
import * as repl from "repl";
import { CompletionItem, Position } from "vscode";
import { IConfig } from "./config";
import { IFsFunctions } from "./fs-functions";
import { PackageCompletionItem } from "./package-completion-item";

export function provide(
  textCurrentLine: string,
  rootPath: string,
  dirPath: string,
  position: Position,
  config: IConfig,
  fsf: IFsFunctions
): Promise<CompletionItem[]> {
  return getNpmPackages(dirPath, rootPath, config, fsf)
    .then(dependencies => {
      return config.packageSubfoldersIntellisense
        ? readModuleSubFolders(dependencies, textCurrentLine, rootPath, fsf)
        : dependencies;
    })
    .then(dependencies =>
      dependencies.map(
        d => new PackageCompletionItem(d, textCurrentLine, position)
      )
    );
}

export function getNpmPackages(
  dirPath: string,
  rootPath: string,
  config: IConfig,
  fsf: IFsFunctions
) {
  return fsf
    .readJson(getPackageJson(dirPath, rootPath, config, fsf))
    .then(packageJson => [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(
        config.scanDevDependencies ? packageJson.devDependencies || {} : {}
      )
    ]);
}

function getBuildInModules(): string[] {
  return (repl as any)._builtinLibs;
}

function getPackageJson(
  dirPath: string,
  rootPath: string,
  config: IConfig,
  fsf: IFsFunctions
): string {
  return config.recursivePackageJsonLookup
    ? nearestPackageJson(rootPath, dirPath, fsf)
    : join(rootPath, "package.json");
}

function nearestPackageJson(
  rootPath: string,
  currentDirPath: string,
  fsf: IFsFunctions
): string {
  const packageJsonFullPath = join(currentDirPath, "package.json");

  if (currentDirPath === rootPath || fsf.isFile(packageJsonFullPath)) {
    return packageJsonFullPath;
  }

  return nearestPackageJson(rootPath, resolve(currentDirPath, ".."), fsf);
}

function readModuleSubFolders(
  dependencies: string[],
  textCurrentLine: string,
  rootPath: string,
  fsf: IFsFunctions
): Promise<string[]> {
  const fragments: string[] = textCurrentLine.split("from ");
  const pkgFragment: string = fragments[fragments.length - 1].split(/['"]/)[1];
  const pkgFragmentSplit = pkgFragment.split("/");
  const packageName: string = pkgFragmentSplit[0];

  if (dependencies.filter(dep => dep === packageName).length) {
    const path = join(rootPath, "node_modules", ...pkgFragmentSplit);
    // Todo: make the replace function work with other filetypes as well
    return fsf
      .readDir(path)
      .then(files => files.map(file => pkgFragment + file.replace(/\.js$/, "")))
      .catch(err => [""]);
  }

  return Promise.resolve(dependencies);
}
