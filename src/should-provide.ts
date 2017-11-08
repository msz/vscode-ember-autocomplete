export function shouldProvide(textCurrentLine: string, cursorPosition: number) {
  return (
    isImport(textCurrentLine, cursorPosition) &&
    !startsWithADot(textCurrentLine, cursorPosition)
  );
}

function isImport(textCurrentLine: string, position: number): boolean {
  const startsWithImport = textCurrentLine.substring(0, 6) === "import";
  return (
    startsWithImport &&
    (isAfterFrom(textCurrentLine, position) ||
      isImportWithoutFrom(textCurrentLine, position))
  );
}

function isAfterFrom(textCurrentLine: string, position: number) {
  const fromPosition = stringMatches(textCurrentLine, [
    " from '",
    ' from "',
    "}from '",
    '}from "'
  ]);

  return fromPosition !== -1 && fromPosition < position;
}

function isImportWithoutFrom(textCurrentLine: string, postition: number) {
  const modulePosition = stringMatches(
    textCurrentLine,
    [
      " '", // spec calls for a space, e.g. `import 'module-name';`
      "'", // tested with babel, it doesn't care if there is a space, so `import'module-name';` is valid too,
      '"',
      ' "'
    ],
    true
  );
  return modulePosition !== -1 && modulePosition < postition;
}

function stringMatches(
  textCurrentLine: string,
  strings: string[],
  searchFromStart = false
): number {
  return strings.reduce((position, str) => {
    const textPosition = searchFromStart
      ? textCurrentLine.indexOf(str)
      : textCurrentLine.lastIndexOf(str);

    return Math.max(position, textPosition);
  }, -1);
}

function startsWithADot(textCurrentLine: string, position: number) {
  const textWithinString = getTextWithinString(textCurrentLine, position);
  return (
    textWithinString &&
    textWithinString.length > 0 &&
    textWithinString[0] === "."
  );
}

function getTextWithinString(
  text: string,
  position: number
): string | undefined {
  const textToPosition = text.substring(0, position);
  const quoatationPosition = Math.max(
    textToPosition.lastIndexOf('"'),
    textToPosition.lastIndexOf("'")
  );
  const substring = textToPosition.substring(
    quoatationPosition + 1,
    textToPosition.length
  );
  return quoatationPosition !== -1 ? substring : undefined;
}
