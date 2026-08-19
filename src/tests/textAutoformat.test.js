import { describe, it, expect } from "vitest";
import { matchAutoformat, autoformatPlainText, matchLineTrigger, matchInlineWrap } from "../pages/reading/components/notebook/textAutoformat.js";

describe("textAutoformat", () => {
  it("turns -> into an arrow", () => {
    expect(matchAutoformat("ไป->")).toEqual({ take: 2, insert: "→" });
  });

  it("prefers the longest trigger", () => {
    expect(matchAutoformat("a-->")).toEqual({ take: 3, insert: "⟶" });
    expect(matchAutoformat("x<=>")).toEqual({ take: 3, insert: "⇔" });
  });

  it("still matches the short form on its own", () => {
    expect(matchAutoformat("x<=")).toEqual({ take: 2, insert: "≤" });
    expect(matchAutoformat("x<-")).toEqual({ take: 2, insert: "←" });
  });

  it("leaves ordinary text alone", () => {
    expect(matchAutoformat("สวัสดีครับ")).toBeNull();
    expect(matchAutoformat("hello world")).toBeNull();
    expect(matchAutoformat("")).toBeNull();
    expect(matchAutoformat(undefined)).toBeNull();
  });

  it("does not touch a double dash, which shows up in ranges and code", () => {
    expect(matchAutoformat("2020--2024")).toBeNull();
  });

  it("rewrites a plain string and reports the new caret", () => {
    expect(autoformatPlainText("ก->ข", 3)).toEqual({ value: "ก→ข", caret: 2 });
  });

  it("returns null when there is nothing to rewrite", () => {
    expect(autoformatPlainText("กขค", 3)).toBeNull();
  });

  it("only looks behind the caret", () => {
    expect(autoformatPlainText("ก->ข", 1)).toBeNull();
  });
});

describe("markdown line triggers", () => {
  it("turns a leading dash into a bullet", () => {
    expect(matchLineTrigger("- ")).toEqual({ take: 2, action: { type: "list", value: "bullet" } });
  });

  it("turns 1. into a numbered list", () => {
    expect(matchLineTrigger("1. ")).toEqual({ take: 3, action: { type: "list", value: "number" } });
  });

  it("prefers ## over #", () => {
    expect(matchLineTrigger("## ")).toEqual({ take: 3, action: { type: "heading", value: 2 } });
  });

  it("only fires when the shorthand is the whole line so far", () => {
    expect(matchLineTrigger("ก - ")).toBeNull();
    expect(matchLineTrigger("รายการ- ")).toBeNull();
  });
});

describe("markdown inline wraps", () => {
  it("detects a closed bold pair", () => {
    expect(matchInlineWrap("คำ**หนา**")).toEqual({ start: 2, end: 9, inner: "หนา", flag: "bold" });
  });

  it("prefers ** over *", () => {
    expect(matchInlineWrap("**x**").flag).toBe("bold");
    expect(matchInlineWrap("*x*").flag).toBe("italic");
  });

  it("ignores an empty pair", () => {
    expect(matchInlineWrap("****")).toBeNull();
  });

  it("ignores an unclosed marker", () => {
    expect(matchInlineWrap("**หนา")).toBeNull();
  });
});
