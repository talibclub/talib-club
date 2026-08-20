// Fails on identifiers that do not exist.
//
// Two of these shipped to production inside a week: an icon used in JSX but
// never imported, and a setter whose state was deleted while six call sites
// stayed behind. Neither breaks the build — an undefined identifier is a
// ReferenceError at runtime, not a compile error — so both were only found by
// running eslint on a hunch, after users had already been served the crash.
//
// Deliberately just these two rules. The project carries ~50 other lint errors,
// mostly React Compiler advice, and gating the build on all of them would mean
// the gate gets turned off. This gate only catches code that cannot possibly
// run, so it should never need to be argued with.
import { ESLint } from "eslint"

const eslint = new ESLint({
  overrideConfig: { rules: { "no-undef": "error", "react/jsx-no-undef": "error" } },
})
const results = await eslint.lintFiles(["src/**/*.{js,jsx}"])

const bad = results.flatMap((r) =>
  r.messages
    .filter((m) => m.ruleId === "no-undef" || m.ruleId === "react/jsx-no-undef")
    .map((m) => `  ${r.filePath.replace(process.cwd(), ".")}:${m.line}  ${m.message}`)
)

if (bad.length) {
  console.error(`\n✖ ${bad.length} undefined identifier${bad.length > 1 ? "s" : ""} — this code throws at runtime:\n`)
  console.error(bad.join("\n"))
  console.error("")
  process.exit(1)
}
console.log(`✓ no undefined identifiers (${results.length} files)`)
