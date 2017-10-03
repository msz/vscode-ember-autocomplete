import { commands, ExtensionContext, languages, workspace } from "vscode";
import { onImportCommand } from "./command-import";
import { NpmIntellisense } from "./npm-intellisense";

export function activate(context: ExtensionContext) {
  if (workspace.rootPath) {
    const provider = new NpmIntellisense();
    const triggers = ['"', "'", "/"];
    const selector = [
      "typescript",
      "javascript",
      "javascriptreact",
      "typescriptreact"
    ];
    context.subscriptions.push(
      languages.registerCompletionItemProvider(selector, provider, ...triggers)
    );
    context.subscriptions.push(
      commands.registerCommand("npm-intellisense.import", onImportCommand)
    );
  }
}

export const deactivate = () => undefined;
