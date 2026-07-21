// src/tests/shapeRecognition.test.js
import { describe, it, expect } from "vitest"
import { recognizeShape, pointInPolygon } from "../pages/reading/utils/shapeRecognition.js"

// Builds a flat [x,y,...] stroke, adding jitter so the input looks like a shaky
// hand rather than a perfect mathematical figure.
const jitter = (seed) => {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return (s / 2147483648 - 0.5) * 2 // -1..1, deterministic
  }
}

const circleStroke = (cx, cy, r, noise = 0, samples = 48) => {
  const rnd = jitter(7)
  const pts = []
  for (let i = 0; i < samples; i++) {
    const a = (i / samples) * Math.PI * 2
    const rr = r + rnd() * noise
    pts.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
  }
  pts.push(pts[0], pts[1]) // close the loop
  return pts
}

const polygonStroke = (corners, noise = 0, perEdge = 14) => {
  const rnd = jitter(13)
  const pts = []
  for (let c = 0; c < corners.length; c++) {
    const [x1, y1] = corners[c]
    const [x2, y2] = corners[(c + 1) % corners.length]
    for (let i = 0; i < perEdge; i++) {
      const t = i / perEdge
      pts.push(x1 + (x2 - x1) * t + rnd() * noise, y1 + (y2 - y1) * t + rnd() * noise)
    }
  }
  pts.push(corners[0][0], corners[0][1])
  return pts
}

const lineStroke = (x1, y1, x2, y2, noise = 0, samples = 20) => {
  const rnd = jitter(3)
  const pts = []
  for (let i = 0; i <= samples; i++) {
    const t = i / samples
    pts.push(x1 + (x2 - x1) * t + rnd() * noise, y1 + (y2 - y1) * t + rnd() * noise)
  }
  return pts
}

describe("recognizeShape", () => {
  it("recognises a hand-drawn circle", () => {
    const m = recognizeShape(circleStroke(200, 200, 80, 5))
    expect(m?.type).toBe("circle")
    expect(m.r).toBeGreaterThan(70)
    expect(m.r).toBeLessThan(90)
    // Centre lands within a few px of true — the input carries ±5px of jitter.
    expect(Math.abs(m.cx - 200)).toBeLessThan(4)
    expect(Math.abs(m.cy - 200)).toBeLessThan(4)
  })

  it("recognises a hand-drawn rectangle", () => {
    const m = recognizeShape(polygonStroke(
      [[100, 100], [300, 100], [300, 220], [100, 220]], 4
    ))
    expect(m?.type).toBe("rect")
    expect(m.maxX - m.minX).toBeGreaterThan(190)
    expect(m.maxY - m.minY).toBeGreaterThan(110)
  })

  it("recognises a hand-drawn triangle", () => {
    const m = recognizeShape(polygonStroke(
      [[200, 80], [300, 260], [100, 260]], 4
    ))
    expect(m?.type).toBe("triangle")
  })

  it("recognises a roughly straight line", () => {
    const m = recognizeShape(lineStroke(50, 50, 400, 90, 3))
    expect(m?.type).toBe("line")
    expect(m.x1).toBeCloseTo(50, -1)
    expect(m.x2).toBeCloseTo(400, -1)
  })

  it("leaves handwriting alone rather than guessing", () => {
    // A scribbled 'w' shape: open, and nowhere near straight.
    const w = [
      60, 100, 75, 160, 90, 105, 105, 165, 120, 100,
      135, 158, 150, 102, 165, 160, 180, 100, 195, 155,
    ]
    expect(recognizeShape(w)).toBeNull()
  })

  it("ignores strokes too short or too small to be a shape", () => {
    expect(recognizeShape([10, 10, 12, 11, 14, 12])).toBeNull()
    expect(recognizeShape(circleStroke(10, 10, 4))).toBeNull()
  })

  it("does not turn a gentle curve into a line", () => {
    // An arc that deviates well beyond the straightness tolerance.
    const arc = []
    for (let i = 0; i <= 24; i++) {
      const t = i / 24
      arc.push(50 + t * 300, 200 - Math.sin(t * Math.PI) * 90)
    }
    expect(recognizeShape(arc)).toBeNull()
  })
})

describe("pointInPolygon", () => {
  const square = [0, 0, 100, 0, 100, 100, 0, 100]

  it("detects points inside and outside", () => {
    expect(pointInPolygon(50, 50, square)).toBe(true)
    expect(pointInPolygon(150, 50, square)).toBe(false)
    expect(pointInPolygon(-5, 50, square)).toBe(false)
  })

  it("handles a concave lasso loop", () => {
    // A 'C' shape — the notch must not count as inside.
    const c = [0, 0, 100, 0, 100, 30, 40, 30, 40, 70, 100, 70, 100, 100, 0, 100]
    expect(pointInPolygon(20, 50, c)).toBe(true)
    expect(pointInPolygon(70, 50, c)).toBe(false)
  })
})
