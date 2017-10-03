import { dirname } from 'path';
import { QuickPickItem, QuickPickOptions, TextEditorEdit, window, workspace } from 'vscode';
import { getConfig, IConfig } from './config';
import { fsf } from './fs-functions';
import { IState } from './i-state';
import { getNpmPackages } from './provide';
import { getImportStatementFromFilepath, getQuickPickItems, guessVariableName } from './util';

const quickPickOptions: QuickPickOptions = {
    matchOnDescription: true,
};

export function onImportCommand() {
    const config = getConfig();
    return getPackages(config)
    .then((packages) => window.showQuickPick(packages, quickPickOptions))
    .then((selection) => addImportStatementToCurrentFile(selection, config))
    .catch((error) => window.showErrorMessage(error));
}

function getPackages(config: IConfig) {
    const state: IState = {
        filePath: dirname(window.activeTextEditor.document.fileName),
        rootPath: workspace.rootPath,
        cursorLine: undefined,
        cursorPosition: undefined,
        textCurrentLine: undefined,
    };

    return getNpmPackages(state, config, fsf)
        .then((npmPackages) => npmPackages.map(moduleNameToQuickPickItem));
}

function moduleNameToQuickPickItem(moduleName: string): QuickPickItem {
    return {
        label: moduleName,
        description: 'npm module',
    };
}

function addImportStatementToCurrentFile(item: QuickPickItem, config: IConfig) {
    const {
        importQuotes,
        importLinebreak,
        importDeclarationType,
    } = config;
    const moduleName = `${importQuotes}${item.label}${importQuotes}`;
    const statementES6 = `import {} from ${moduleName}${importLinebreak}`;
    const variableName = guessVariableName(item.label);
    const statementRequire = `${importDeclarationType} ${variableName} = require(${moduleName})${importLinebreak}`;
    const statement = config.importES6 ? statementES6 : statementRequire;
    const insertLocation = window.activeTextEditor.selection.start;
    window.activeTextEditor.edit((edit) => edit.insert(insertLocation, statement));
}
