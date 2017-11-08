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
import { PackageCompletionItem } from "./package-completion-item";
import { provide } from "./provide";
import { shouldProvide } from "./should-provide";

export class NpmIntellisense implements CompletionItemProvider {
  public provideCompletionItems(
    document: TextDocument,
    position: Position
  ): Thenable<CompletionItem[]> {
    const rootPath = workspace.rootPath;
    const textCurrentLine = document.lineAt(position).text;
    const filePath = dirname(document.fileName);

    return rootPath !== undefined &&
      shouldProvide(textCurrentLine, position.character)
      ? provide(textCurrentLine, rootPath, filePath, position, getConfig(), fsf)
      : Promise.resolve([]);
  }
}
