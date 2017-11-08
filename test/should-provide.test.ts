import * as assert from "assert";
import { Position } from "vscode";
import { shouldProvide } from "../src/should-provide";

suite("shouldProvide Tests", () => {
  test("Should provide when is import", () => {
    const { textCurrentLine, cursorPosition } = createState(
      "import {  } from '‸'"
    );
    assert.equal(true, shouldProvide(textCurrentLine, cursorPosition));
  });

  test("Should not provide when not import or require", () => {
    const { textCurrentLine, cursorPosition } = createState("anything '‸'");
    assert.equal(false, shouldProvide(textCurrentLine, cursorPosition));
  });

  test("Should not provide when import starts with a dot", () => {
    const { textCurrentLine, cursorPosition } = createState(
      "import {  } from '.‸'"
    );
    assert.equal(false, shouldProvide(textCurrentLine, cursorPosition));
  });

  test("Should not provide when import starts with a dot", () => {
    const { textCurrentLine, cursorPosition } = createState("import '.‸'");
    assert.equal(false, shouldProvide(textCurrentLine, cursorPosition));
  });

  test("Should provide when import is followed by a single quoted module name", () => {
    const { textCurrentLine, cursorPosition } = createState("import '‸'");
    assert.equal(true, shouldProvide(textCurrentLine, cursorPosition));
  });

  test("Should provide when import is followed by a single quoted module name with bad spacing", () => {
    const { textCurrentLine, cursorPosition } = createState("import'‸'");
    assert.equal(true, shouldProvide(textCurrentLine, cursorPosition));
  });

  test("Should provide when import is followed by a double quoted module name", () => {
    const { textCurrentLine, cursorPosition } = createState('import "‸"');
    assert.equal(true, shouldProvide(textCurrentLine, cursorPosition));
  });

  test("Should provide when import is followed by a double quoted module name with bad spacing", () => {
    const { textCurrentLine, cursorPosition } = createState('import"‸"');
    assert.equal(true, shouldProvide(textCurrentLine, cursorPosition));
  });
});

function createState(line: string) {
  return {
    textCurrentLine: line.split("‸").join(),
    cursorPosition: line.indexOf("‸")
  };
}
