import { readdir, stat } from "fs";
import { extname, join, relative, sep } from "path";
import { workspace } from "vscode";

export const isDirectory = (path: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    stat(path, (error, stats) => {
      if (error) {
        reject(error);
      } else {
        resolve(stats.isDirectory());
      }
    });
  });
};

export const readFilesFromDir = (dir: string): Promise<string[]> => {
  return new Promise<string[]>((resolve, reject) => {
    readdir(dir, (_, files) => {
      Promise.all(
        files.map(file => {
          const path = join(dir, file);

          if (file === "node_modules") {
            return Promise.resolve([]);
          }

          return isDirectory(path).then(
            isDir => (isDir ? readFilesFromDir(path) : Promise.resolve([path]))
          );
        })
      )
        .then((filesPerDir: any[]) => {
          resolve([].concat(...filesPerDir));
        })
        .catch(error2 => reject(error2));
    });
  });
};

export const readFilesFromPackage = (
  packageName: string,
  rootPath: string
): Promise<string[]> => {
  return readFilesFromDir(join(rootPath, "node_modules", packageName));
};

export function getQuickPickItems(
  packages: string[],
  rootPath: string
): Promise<any> {
  const nodeRegEx = new RegExp(`^node_modules\\${sep}`);

  return Promise.all(
    [readFilesFromDir(rootPath)].concat(
      packages.map(packageName => readFilesFromPackage(packageName, rootPath))
    )
  ).then((filesPerPackage: any[]) => {
    const items: any[] = []
      .concat(...filesPerPackage)
      .map((filePath: string) => {
        const partialPath: string = filePath
          .replace(rootPath + sep, "")
          .replace(nodeRegEx, "");
        const fragments: string[] = partialPath.split(sep);
        const label: string = fragments[fragments.length - 1];
        const description: string = fragments.join("/");

        return { label, description, filePath };
      });

    return items;
  });
}

export const getImportStatementFromFilepath = (
  filePath: string,
  dirPath: string,
  rootPath: string
): string => {
  const partialPath: string = !dirPath.includes("node_modules")
    ? relative(filePath, dirPath)
    : dirPath.replace(join(rootPath, "node_modules") + sep, "");

  const fragments: string[] = dirPath
    .split(sep)
    .map((fragment: string, index: number, arr: any[]) => {
      return index === arr.length - 1
        ? fragment.replace(/\.js$/, "").replace(/^index$/, "")
        : fragment;
    })
    .filter(fragment => !!fragment);

  let moduleName: string = fragments[fragments.length - 1].replace(
    /[\-](.)/g,
    (...rest: any[]) => rest[0].toUpperCase()
  );

  moduleName = moduleName
    .replace(new RegExp(`${extname(moduleName)}$`), "")
    .replace(/^[^a-z$]/i, "");

  const packagePath: string =
    partialPath
      .split(sep)
      .filter(fragment => fragment !== "index.js")
      .join("/") || ".";

  const importES6: boolean = workspace.getConfiguration("ember-autocomplet")
    .importES6;
  const quoteType: string = workspace.getConfiguration("ember-autocomplete")
    .importQuotes;
  const linebreak: string = workspace.getConfiguration("ember-autocomplete")
    .importLinebreak;
  const declaration: string = workspace.getConfiguration("ember-autocomplete")
    .importDeclarationType;
  let statement: string;

  statement = importES6
    ? `import ${moduleName} from ${quoteType}${packagePath}${quoteType}`
    : `${declaration} ${moduleName} = require(${quoteType}${packagePath}${quoteType})`;

  statement += `${linebreak}`;

  return statement;
};

export const guessVariableName = (packageName: string): string =>
  packageName.replace(/-\w/gm, (sub: string) =>
    sub.replace("-", "").toUpperCase()
  );
