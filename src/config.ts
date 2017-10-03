import { workspace } from 'vscode';

export interface IConfig {
    scanDevDependencies?: boolean;
    recursivePackageJsonLookup?: boolean;
    packageSubfoldersIntellisense?: boolean;
    showBuildInLibs?: boolean;
    importES6?: boolean;
    importQuotes?: string;
    importLinebreak?: string;
    importDeclarationType?: string;
}

export function getConfig(): IConfig {
    const configuration = workspace.getConfiguration('npm-intellisense');

    return {
        importES6: configuration.importES6,
        importQuotes: configuration.importQuotes,
        importLinebreak: configuration.importLinebreak,
        importDeclarationType: configuration.importDeclarationType,
        packageSubfoldersIntellisense: configuration.packageSubfoldersIntellisense,
        recursivePackageJsonLookup: configuration.recursivePackageJsonLookup,
        scanDevDependencies: configuration.scanDevDependencies,
        showBuildInLibs: configuration.showBuildInLibs,
    };
}
