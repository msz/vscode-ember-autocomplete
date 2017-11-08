import { dirname } from "path";
import {
  QuickPickItem,
  QuickPickOptions,
  TextEditor,
  window,
  workspace
} from "vscode";
import { getConfig, IConfig } from "./config";
import { fsf } from "./fs-functions";
import { getNpmPackages } from "./provide";
import { guessVariableName } from "./util";

const quickPickOptions: QuickPickOptions = {
  matchOnDescription: true
};

export function onImportCommand() {
  const config = getConfig();
  const activeEditor = window.activeTextEditor;
  if (!activeEditor) {
    throw new Error("Expected activeEditor to exist!");
  }
  const filePath = dirname(activeEditor.document.fileName);
  if (
    !workspace ||
    !workspace.workspaceFolders ||
    !workspace.workspaceFolders[0]
  ) {
    throw new Error("Expected a workspace folder to be open!");
  }
  const rootPath = workspace.workspaceFolders[0].uri.path;

  return getPackages(config, filePath, rootPath)
    .then(packages => window.showQuickPick(packages, quickPickOptions))
    .then(
      selection =>
        selection
          ? addImportStatementToCurrentFile(selection, config, activeEditor)
          : undefined
    )
    .catch(error => window.showErrorMessage(error));
}

function getPackages(config: IConfig, filePath: string, rootPath: string) {
  return getNpmPackages(filePath, rootPath, config, fsf).then(npmPackages =>
    npmPackages.map(moduleNameToQuickPickItem)
  );
}

function moduleNameToQuickPickItem(moduleName: string): QuickPickItem {
  return {
    label: moduleName,
    description: "npm module"
  };
}

function addImportStatementToCurrentFile(
  item: QuickPickItem,
  config: IConfig,
  activeEditor: TextEditor
) {
  const { importQuotes, importLinebreak, importDeclarationType } = config;
  const moduleName = `${importQuotes}${item.label}${importQuotes}`;
  const statementES6 = `import {} from ${moduleName}${importLinebreak}`;
  const variableName = guessVariableName(item.label);
  const statementRequire = `${importDeclarationType} ${variableName} = require(${moduleName})${importLinebreak}`;
  const statement = config.importES6 ? statementES6 : statementRequire;
  const insertLocation = activeEditor.selection.start;
  activeEditor.edit(edit => edit.insert(insertLocation, statement));
}
