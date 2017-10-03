import { IState } from './i-state';

export function shouldProvide(state: IState) {
    return isImportOrRequire(state.textCurrentLine, state.cursorPosition)
        && !startsWithADot(state.textCurrentLine, state.cursorPosition);
}

function isImportOrRequire(textCurrentLine: string, position: number): boolean  {
    const isImport = textCurrentLine.substring(0, 6) === 'import';
    const isRequire = textCurrentLine.indexOf('require(') !== -1;
    return (isImport && (
            isAfterFrom(textCurrentLine, position)
            || isImportWithoutFrom(textCurrentLine, position)
        )) || isRequire;
}

function isAfterFrom(textCurrentLine: string, position: number) {
    const fromPosition = stringMatches(textCurrentLine, [
        ' from \'', ' from "',
        '}from \'', '}from "',
    ]);

    return fromPosition !== -1 && fromPosition < position;
}

function isImportWithoutFrom(textCurrentLine: string, postition: number) {
    const modulePosition = stringMatches(textCurrentLine, [
        ' \'', // spec calls for a space, e.g. `import 'module-name';`
        '\'', // tested with babel, it doesn't care if there is a space, so `import'module-name';` is valid too,
        '"',
        ' "',
    ], true);
    return modulePosition !== -1 && modulePosition < postition;
}

function stringMatches(textCurrentLine: string, strings: string[], searchFromStart = false): number {
    return strings.reduce((position, str) => {
        const textPosition = searchFromStart
            ? textCurrentLine.indexOf(str)
            : textCurrentLine.lastIndexOf(str);

        return Math.max(position, textPosition);
    }, -1);
}

function startsWithADot(textCurrentLine: string, position: number) {
    const textWithinString = getTextWithinString(textCurrentLine, position);
    return textWithinString
        && textWithinString.length > 0
        && textWithinString[0] === '.';
}

function getTextWithinString(text: string, position: number): string {
    const textToPosition = text.substring(0, position);
    const quoatationPosition = Math.max(textToPosition.lastIndexOf('\"'), textToPosition.lastIndexOf('\''));
    const substring = textToPosition.substring(quoatationPosition + 1, textToPosition.length);
    return quoatationPosition !== -1 ? substring : undefined;
}
