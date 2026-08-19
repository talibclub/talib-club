import { describe, it, expect } from "vitest";
import { applyPlainListTrigger, continuePlainList, PLAIN_BULLET, matchAutoformat, autoformatPlainText, matchLineTrigger, matchInlineWrap } from "../pages/reading/components/notebook/textAutoformat.js";

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

describe("plain-text bullets on a sticky note", () => {
  it('turns "- " and "* " at the start of a line into a bullet', () => {
    expect(applyPlainListTrigger("- ", 2)).toEqual({ value: PLAIN_BULLET, caret: 2 });
    expect(applyPlainListTrigger("* ", 2)).toEqual({ value: PLAIN_BULLET, caret: 2 });
  });

  it("leaves a dash in the middle of a line alone", () => {
    expect(applyPlainListTrigger("ก - ", 4)).toBeNull();
    expect(applyPlainListTrigger("รายการ- ", 8)).toBeNull();
  });

  it("triggers on the line the caret is on, not just the first line", () => {
    const v = "หนึ่ง\n- ";
    expect(applyPlainListTrigger(v, v.length)).toEqual({ value: "หนึ่ง\n" + PLAIN_BULLET, caret: v.length });
  });

  it("carries the bullet to the next line on Enter", () => {
    expect(continuePlainList("• นม", 4)).toEqual({ value: "• นม\n• ", caret: 7 });
  });

  it("ends the list when Enter is pressed on an empty bullet", () => {
    expect(continuePlainList("• ", 2)).toEqual({ value: "", caret: 0 });
    expect(continuePlainList("• นม\n• ", 7)).toEqual({ value: "• นม\n", caret: 5 });
  });

  it("does nothing on a line that is not a bullet", () => {
    expect(continuePlainList("ธรรมดา", 6)).toBeNull();
  });
});
