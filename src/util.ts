import { readdir, stat } from 'fs';
import { extname, join, relative, sep } from 'path';
import { window, workspace } from 'vscode';

export const isDirectory = ( path ): Promise<boolean> => {
  return new Promise(( resolve, reject ) => {
    stat(path, ( error, stats ) => {
      if (error) {
        reject(error);
      } else {
        resolve(stats.isDirectory());
      }
    });
  });
};

export const readFilesFromDir = ( dir: string ): Promise<string[]> => {

  return new Promise<string[]>(( resolve, reject ) => {
    const paths: string[] = [];
    readdir(dir, ( error, files ) => {

      Promise.all(
        files.map((file) => {
          const path = join(dir, file);

          if (file === 'node_modules') {
            return Promise.resolve([]);
          }

          return isDirectory(path)
            .then((isDir) => isDir ? readFilesFromDir(path) : Promise.resolve( [ path ]));

        }),
      )
        .then(( filesPerDir: any[] ) => {
          resolve([].concat(...filesPerDir));
        })
        .catch((error2) => reject(error2));

    });
  });

};

export const readFilesFromPackage = ( packageName: string ): Promise<string[]> => {
  return readFilesFromDir(
    join(workspace.rootPath, 'node_modules', packageName),
  );
};

export const getQuickPickItems = ( packages: string[] ): Promise<any> => {

  const root = workspace.rootPath;
  const nodeRegEx = new RegExp(`^node_modules\\${sep}`);

  return Promise.all(
    [ readFilesFromDir(root) ].concat(packages.map(readFilesFromPackage)),
  )
    .then(( filesPerPackage: any[] ) => {
      const items: any[] =
        [].concat(...filesPerPackage)
          .map( ( filePath: string ) => {
            const partialPath: string = filePath.replace(root + sep, '').replace(nodeRegEx, '');
            const fragments: string[] = partialPath.split(sep);
            const label: string = fragments[fragments.length - 1];
            const description: string = fragments.join('/');

            return { label, description, filePath };
          });

      return items;
    });
};

export const getImportStatementFromFilepath = ( filePath: string ): string => {
  const partialPath: string = !filePath.includes('node_modules') ?
      relative(window.activeTextEditor.document.fileName, filePath)
      : filePath.replace(join(workspace.rootPath, 'node_modules') + sep, '');

  const fragments: string[] =
      filePath.split(sep)
        .map( ( fragment: string, index: number, arr: any[] ) => {
          return index === arr.length - 1 ?
            fragment.replace(/\.js$/, '')
              .replace(/^index$/, '')
            : fragment;
        })
        .filter((fragment) => !!fragment);

  let moduleName: string = fragments[fragments.length - 1]
      .replace(/[\-](.)/g, ( substring: string, ...rest: any[] ) => rest[0].toUpperCase());

  moduleName = moduleName.replace(new RegExp(`${extname(moduleName)}$`), '')
      .replace(/^[^a-z$]/i, '');

  const packagePath: string = partialPath.split(sep).filter((fragment) => fragment !== 'index.js').join('/') || '.';

  const importES6: boolean = workspace.getConfiguration('npm-intellisense').importES6;
  const quoteType: string = workspace.getConfiguration('npm-intellisense').importQuotes;
  const linebreak: string = workspace.getConfiguration('npm-intellisense').importLinebreak;
  const declaration: string = workspace.getConfiguration('npm-intellisense').importDeclarationType;
  let statement: string;

  if (importES6) {
      statement = `import ${moduleName} from ${quoteType}${packagePath}${quoteType}`;
    } else {
      statement = `${declaration} ${moduleName} = require(${quoteType}${packagePath}${quoteType})`;
    }

  statement += `${linebreak}`;

  return statement;
};

export const guessVariableName = (packageName: string ): string =>
  packageName.replace(/-\w/gm, (sub: string, args: any[]) => sub.replace('-', '').toUpperCase());
