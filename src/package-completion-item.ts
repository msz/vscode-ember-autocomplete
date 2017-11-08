import {
  CompletionItem,
  CompletionItemKind,
  Position,
  Range,
  TextEdit
} from "vscode";

export class PackageCompletionItem extends CompletionItem {
  constructor(label: string, textCurrentLine: string, position: Position) {
    super(label);
    this.kind = CompletionItemKind.Module;
    this.textEdit = TextEdit.replace(
      this.importStringRange(textCurrentLine, position),
      label
    );
  }

  public importStringRange(textCurrentLine: string, position: Position): Range {
    const textToPosition = textCurrentLine.substring(0, position.character);
    const quotationPosition = Math.max(
      textToPosition.lastIndexOf('"'),
      textToPosition.lastIndexOf("'")
    );
    return new Range(
      position.line,
      quotationPosition + 1,
      position.line,
      position.character
    );
  }
}
