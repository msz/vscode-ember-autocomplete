import { readdir, readFile, statSync } from "fs";
import { dirname } from "path";
import {
  CompletionItem,
  CompletionItemKind,
  CompletionItemProvider,
  Position,
  TextDocument,
  workspace
} from "vscode";
import { getConfig, IConfig } from "./config";
import { fsf } from "./fs-functions";
import { IState } from "./i-state";
import { PackageCompletionItem } from "./package-completion-item";
import { provide } from "./provide";
import { shouldProvide } from "./should-provide";

export class NpmIntellisense implements CompletionItemProvider {
  public provideCompletionItems(
    document: TextDocument,
    position: Position
  ): Thenable<CompletionItem[]> {
    const state: IState = {
      rootPath: workspace.rootPath,
      filePath: dirname(document.fileName),
      textCurrentLine: document.lineAt(position).text,
      cursorPosition: position.character,
      cursorLine: position.line
    };

    return shouldProvide(state)
      ? provide(state, getConfig(), fsf)
      : Promise.resolve([]);
  }
}
