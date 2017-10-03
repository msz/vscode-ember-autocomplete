import { CompletionItem, CompletionItemKind, Position, Range, TextDocument, TextEdit } from 'vscode';
import { IState } from './i-state';

export class PackageCompletionItem extends CompletionItem {
  constructor(label: string, state: IState) {
    super(label);
    this.kind = CompletionItemKind.Module;
    this.textEdit = TextEdit.replace(this.importStringRange(state), label);
  }

  public importStringRange({ textCurrentLine, cursorLine, cursorPosition }): Range {
    const textToPosition = textCurrentLine.substring(0, cursorPosition);
    const quotationPosition = Math.max(textToPosition.lastIndexOf('\"'), textToPosition.lastIndexOf('\''));
    return new Range(cursorLine, quotationPosition + 1, cursorLine, cursorPosition);
  }
}
