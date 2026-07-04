export const JUZ_STARTS = [
  { juz: 1, sura: 1, ayah: 1, label: "ยุซอ์ที่ 1 (ซูเราะฮ์ 1:1)" },
  { juz: 2, sura: 2, ayah: 142, label: "ยุซอ์ที่ 2 (ซูเราะฮ์ 2:142)" },
  { juz: 3, sura: 2, ayah: 253, label: "ยุซอ์ที่ 3 (ซูเราะฮ์ 2:253)" },
  { juz: 4, sura: 3, ayah: 93, label: "ยุซอ์ที่ 4 (ซูเราะฮ์ 3:93)" },
  { juz: 5, sura: 4, ayah: 24, label: "ยุซอ์ที่ 5 (ซูเราะฮ์ 4:24)" },
  { juz: 6, sura: 4, ayah: 148, label: "ยุซอ์ที่ 6 (ซูเราะฮ์ 4:148)" },
  { juz: 7, sura: 5, ayah: 82, label: "ยุซอ์ที่ 7 (ซูเราะฮ์ 5:82)" },
  { juz: 8, sura: 6, ayah: 111, label: "ยุซอ์ที่ 8 (ซูเราะฮ์ 6:111)" },
  { juz: 9, sura: 7, ayah: 88, label: "ยุซอ์ที่ 9 (ซูเราะฮ์ 7:88)" },
  { juz: 10, sura: 8, ayah: 41, label: "ยุซอ์ที่ 10 (ซูเราะฮ์ 8:41)" },
  { juz: 11, sura: 9, ayah: 93, label: "ยุซอ์ที่ 11 (ซูเราะฮ์ 9:93)" },
  { juz: 12, sura: 11, ayah: 6, label: "ยุซอ์ที่ 12 (ซูเราะฮ์ 11:6)" },
  { juz: 13, sura: 12, ayah: 53, label: "ยุซอ์ที่ 13 (ซูเราะฮ์ 12:53)" },
  { juz: 14, sura: 15, ayah: 1, label: "ยุซอ์ที่ 14 (ซูเราะฮ์ 15:1)" },
  { juz: 15, sura: 17, ayah: 1, label: "ยุซอ์ที่ 15 (ซูเราะฮ์ 17:1)" },
  { juz: 16, sura: 18, ayah: 75, label: "ยุซอ์ที่ 16 (ซูเราะฮ์ 18:75)" },
  { juz: 17, sura: 21, ayah: 1, label: "ยุซอ์ที่ 17 (ซูเราะฮ์ 21:1)" },
  { juz: 18, sura: 23, ayah: 1, label: "ยุซอ์ที่ 18 (ซูเราะฮ์ 23:1)" },
  { juz: 19, sura: 25, ayah: 21, label: "ยุซอ์ที่ 19 (ซูเราะฮ์ 25:21)" },
  { juz: 20, sura: 27, ayah: 56, label: "ยุซอ์ที่ 20 (ซูเราะฮ์ 27:56)" },
  { juz: 21, sura: 29, ayah: 46, label: "ยุซอ์ที่ 21 (ซูเราะฮ์ 29:46)" },
  { juz: 22, sura: 33, ayah: 31, label: "ยุซอ์ที่ 22 (ซูเราะฮ์ 33:31)" },
  { juz: 23, sura: 36, ayah: 28, label: "ยุซอ์ที่ 23 (ซูเราะฮ์ 36:28)" },
  { juz: 24, sura: 39, ayah: 32, label: "ยุซอ์ที่ 24 (ซูเราะฮ์ 39:32)" },
  { juz: 25, sura: 41, ayah: 47, label: "ยุซอ์ที่ 25 (ซูเราะฮ์ 41:47)" },
  { juz: 26, sura: 46, ayah: 1, label: "ยุซอ์ที่ 26 (ซูเราะฮ์ 46:1)" },
  { juz: 27, sura: 51, ayah: 31, label: "ยุซอ์ที่ 27 (ซูเราะฮ์ 51:31)" },
  { juz: 28, sura: 58, ayah: 1, label: "ยุซอ์ที่ 28 (ซูเราะฮ์ 58:1)" },
  { juz: 29, sura: 67, ayah: 1, label: "ยุซอ์ที่ 29 (ซูเราะฮ์ 67:1)" },
  { juz: 30, sura: 78, ayah: 1, label: "ยุซอ์ที่ 30 (ซูเราะฮ์ 78:1)" }
]

export const normalizeSuraNumber = (value) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 114 ? parsed : 1
}

export const normalizeAyahNumber = (value) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export const stripTajweedTags = (html) => {
  if (!html) return ""
  let cleaned = html.replace(/<\/?tajweed[^>]*>/g, "")
  cleaned = cleaned.replace(/<span\/>/gi, "")
  cleaned = cleaned.replace(/\u25cc/g, "")
  cleaned = cleaned.replace(/\u0672/g, "\u0670")
  return cleaned.trim()
}

export const stripAllTags = (html) => {
  if (!html) return ""
  let cleaned = html.replace(/<\/?tajweed[^>]*>/g, "")
  cleaned = cleaned.replace(/<span[^>]*class=["']?end["']?[^>]*>.*?<\/span>/gi, "")
  cleaned = cleaned.replace(/<span\/>/gi, "")
  cleaned = cleaned.replace(/\u25cc/g, "")
  cleaned = cleaned.replace(/\u0672/g, "\u0670")
  return cleaned.trim()
}

export const cleanTajweedTags = (html) => {
  if (!html) return ""
  let cleaned = html.replace(/\u25cc/g, "")
  cleaned = cleaned.replace(/\u0672/g, "\u0670")
  cleaned = cleaned.replace(/<tajweed[^>]*>([\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06dc\u06df-\u06e8\u06ea-\u06ed].*?)<\/tajweed>/g, "$1")
  return cleaned
}
