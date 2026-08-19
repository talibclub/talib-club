import { describe, it, expect } from "vitest";
import { matchAutoformat, autoformatPlainText } from "../pages/reading/components/notebook/textAutoformat.js";

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
