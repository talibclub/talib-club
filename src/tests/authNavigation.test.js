import { describe, expect, it } from "vitest"
import { getNavigationState } from "../utils/url.js"

describe("sign-in navigation", () => {
  it("returns to the article including its query and anchor", () => {
    expect(getNavigationState("auth", null, { pathname: "/article/example/title", search: "?search=test", hash: "#section-2" }).from)
      .toBe("/article/example/title?search=test#section-2")
  })
  it("returns directly to the selected book when sign-in starts in the library", () => {
    expect(getNavigationState("auth", null, { pathname: "/library", search: "?page=2", hash: "" }, { returnTo: "/library-detail/book-1/title" }).from)
      .toBe("/library-detail/book-1/title")
  })
  it.each(["/", "/auth"])("avoids returning to %s after sign-in", pathname => {
    expect(getNavigationState("auth", null, { pathname, search: "", hash: "" }).from).toBe("/member")
  })
  it("keeps ordinary detail context without a sign-in destination", () => {
    const book = { id: "book-1", title: "Book" }
    expect(getNavigationState("library-detail", book, { pathname: "/library", search: "", hash: "" })).toEqual({ ctx: book })
  })
})
