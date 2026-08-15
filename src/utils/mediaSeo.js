// Shared by src/pages/MediaDetail.jsx (the visitor-side <meta>/JSON-LD) and
// api/seo-prerender.js (the crawler-side copy). Both have to describe a clip
// the same way — when the SPA and the prerender disagree about a page's
// description, Search Console reads the two as competing versions of one URL.
//
// Media documents hold no body text: only title, channel, series, date and
// duration. Printing `series` alone as the description gave seven different
// clips the identical <meta description> "คลิปแปล", which is exactly the shape
// Google clusters as "duplicate, Google chose a different canonical".

// "20:56" / "1:02:03" -> "PT20M56S" / "PT1H2M3S". schema.org rejects the clock
// form, and without a duration a VideoObject cannot earn a duration badge.
export function isoDuration(value) {
  const parts = String(value || '').trim().split(':').map(Number)
  if (!parts.length || parts.some(n => !Number.isFinite(n))) return undefined
  const [h, m, s] = parts.length === 3 ? parts : [0, parts[0] || 0, parts[1] || 0]
  if (!h && !m && !s) return undefined
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s ? `${s}S` : ''}`
}

export function mediaThumbnail(media) {
  if (!media) return null
  if (media.thumbnailUrl || media.coverUrl) return media.thumbnailUrl || media.coverUrl
  return media.embedId ? `https://i.ytimg.com/vi/${encodeURIComponent(media.embedId)}/hqdefault.jpg` : null
}

// The title leads, so every clip's description differs even when the rest of
// the record is shared across a whole series.
export function mediaSummary(media) {
  if (!media) return ''
  const facts = [
    media.series ? `ซีรีส์ ${media.series}` : '',
    media.channel ? `เผยแพร่โดยช่อง ${media.channel}` : '',
    media.duration ? `ความยาว ${media.duration} นาที` : '',
    media.date ? `เผยแพร่เมื่อ ${media.date}` : '',
  ].filter(Boolean).join(' · ')
  return `${media.title || ''}${facts ? ` — ${facts}` : ''}. สื่อการเรียนรู้อิสลามแนวทางสะลัฟ รับชมได้ที่ Talib Club`
}
