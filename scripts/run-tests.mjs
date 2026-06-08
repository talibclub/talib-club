import assert from "node:assert/strict"

const { calculateReadingStreak, getLocalDayKey } = await import("../src/utils/streak.js")

const fakeSystemTime = new Date("2026-06-05T12:00:00").getTime()
const originalNow = Date.now

function runTest(name, fn) {
  try {
    fn()
    console.log(`✓ ${name}`)
  } catch (err) {
    console.error(`✗ ${name}`)
    throw err
  }
}

try {
  Date.now = () => fakeSystemTime

  runTest("day key formatting", () => {
    const key = getLocalDayKey(fakeSystemTime)
    assert.equal(key, "2026-06-05")
  })

  runTest("consecutive daily reads", () => {
    const reads = [
      new Date("2026-06-03T10:00:00").getTime(),
      new Date("2026-06-04T15:00:00").getTime(),
      new Date("2026-06-05T09:00:00").getTime(),
    ]
    const result = calculateReadingStreak(reads, [])
    assert.equal(result.current, 3)
    assert.equal(result.best, 3)
    assert.equal(result.totalDays, 3)
    assert.equal(result.todayVerified, true)
  })

  runTest("yesterday read, today not yet read", () => {
    const reads = [
      new Date("2026-06-03T10:00:00").getTime(),
      new Date("2026-06-04T15:00:00").getTime(),
    ]
    const result = calculateReadingStreak(reads, [])
    assert.equal(result.current, 2)
    assert.equal(result.best, 2)
    assert.equal(result.todayVerified, false)
  })

  runTest("streak breaks after gap", () => {
    const reads = [
      new Date("2026-06-01T10:00:00").getTime(),
      new Date("2026-06-02T15:00:00").getTime(),
    ]
    const result = calculateReadingStreak(reads, [])
    assert.equal(result.current, 0)
    assert.equal(result.best, 2)
  })

  runTest("freeze protection", () => {
    const reads = [
      new Date("2026-06-03T10:00:00").getTime(),
      new Date("2026-06-05T09:00:00").getTime(),
    ]
    const protections = [{ date: "2026-06-04", type: "freeze" }]
    const result = calculateReadingStreak(reads, protections)
    assert.equal(result.current, 3)
    assert.equal(result.best, 3)
    assert.equal(result.protectedTotal, 1)
  })

  runTest("leave protection", () => {
    const reads = [
      new Date("2026-06-02T10:00:00").getTime(),
      new Date("2026-06-03T10:00:00").getTime(),
      new Date("2026-06-05T09:00:00").getTime(),
    ]
    const protections = [{ date: "2026-06-04", type: "leave" }]
    const result = calculateReadingStreak(reads, protections)
    assert.equal(result.current, 4)
    assert.equal(result.best, 4)
  })

  console.log("All tests passed.")
} finally {
  Date.now = originalNow
}
