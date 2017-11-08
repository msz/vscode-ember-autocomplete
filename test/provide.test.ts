import * as assert from "assert";
import { Position } from "vscode";
import { IConfig } from "../src/config";
import { IFsFunctions } from "../src/fs-functions";
import { provide } from "../src/provide";

suite("provide Tests", () => {
  test("Should read dependencies", done => {
    const { textCurrentLine, rootPath, filePath, position } = createState();
    const config: IConfig = {};
    const fsf = createFsf();

    provide(textCurrentLine, rootPath, filePath, position, config, fsf)
      .then(dependencies => {
        assert.equal(2, dependencies.length);
        assert.equal("donald", dependencies[0].insertText);
        assert.equal("daisy", dependencies[1].insertText);
      })
      .then(() => done())
      .catch(err => done(err));
  });

  test("Should read dev dependencies", done => {
    const { textCurrentLine, rootPath, filePath, position } = createState();
    const config: IConfig = {
      scanDevDependencies: true
    };
    const fsf = createFsf();

    provide(textCurrentLine, rootPath, filePath, position, config, fsf)
      .then(dependencies => {
        assert.equal(3, dependencies.length);
        assert.equal("donald", dependencies[0].insertText);
        assert.equal("daisy", dependencies[1].insertText);
        assert.equal("daniel", dependencies[2].insertText);
      })
      .then(() => done())
      .catch(err => done(err));
  });

  test("Should show build in node modules when enabled", done => {
    const { textCurrentLine, rootPath, filePath, position } = createState();
    const config: IConfig = {
      showBuildInLibs: true
    };
    const fsf = createFsf();

    provide(textCurrentLine, rootPath, filePath, position, config, fsf)
      .then(dependencies => {
        assert.equal(30, dependencies.length);
        assert.equal(true, dependencies.some(d => d.insertText === "fs"));
        assert.equal(true, dependencies.some(d => d.insertText === "path"));
      })
      .then(() => done())
      .catch(err => done(err));
  });

  test("Should get nearest package json", done => {
    const { textCurrentLine, rootPath, filePath, position } = createState();
    const config: IConfig = {
      recursivePackageJsonLookup: true
    };
    const fsf = createFsf();

    provide(textCurrentLine, rootPath, filePath, position, config, fsf)
      .then(dependencies => {
        assert.equal(1, dependencies.length);
        assert.equal("goofy", dependencies[0].insertText);
      })
      .then(() => done())
      .catch(err => done(err));
  });
});

function createState() {
  return {
    rootPath: "/User/dummy/project",
    filePath: "/User/dummy/project/src",
    textCurrentLine: "import {} from ''",
    position: new Position(16, 0)
  };
}

function createFsf(): IFsFunctions {
  return {
    readJson: readJsonMock,
    isFile: isFileMock,
    readDir: readDirMock
  };
}

function readJsonMock(path: string): Promise<any> {
  switch (path) {
    case "/User/dummy/project/src/package.json":
      return Promise.resolve({
        dependencies: {
          goofy: "1.0.0"
        }
      });
    default:
      return Promise.resolve({
        dependencies: {
          donald: "1.0.0",
          daisy: "1.0.0"
        },
        devDependencies: {
          daniel: "1.0.0"
        }
      });
  }
}

function isFileMock(path: string) {
  return (
    [
      "/User/dummy/project/src/package.json",
      "/User/dummy/project/package.json"
    ].indexOf(path) !== -1
  );
}

function readDirMock(path: any) {
  return Promise.resolve([]);
}
