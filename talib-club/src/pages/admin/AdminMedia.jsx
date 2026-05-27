import { DEFAULT_TAXONOMY, MEDIA } from "../../data/index.js"
import { useTaxonomySettings } from "../../lib/contentStore.js"
import AdminDraftList from "./AdminDraftList.jsx"

export default function AdminMedia() {
  const { taxonomy } = useTaxonomySettings(DEFAULT_TAXONOMY)
  return (
    <AdminDraftList
      title="มีเดีย"
      collectionName="media"
      initialItems={MEDIA}
      emptyItem={{
        type: taxonomy.mediaTypes?.[0] || "youtube",
        title: "",
        channel: "Talib Club",
        duration: "",
        embedId: "",
        spotifyUrl: "",
        series: "",
        date: new Date().toISOString().slice(0, 10),
      }}
      fields={[
        { key: "title", label: "ชื่อรายการ/ตอน" },
        { key: "type", label: "ประเภท", type: "select", options: taxonomy.mediaTypes || [] },
        { key: "channel", label: "ช่อง/รายการ" },
        { key: "duration", label: "ความยาว" },
        { key: "embedId", label: "YouTube Video ID" },
        { key: "spotifyUrl", label: "Spotify URL" },
        { key: "series", label: "ซีรีส์" },
        { key: "date", label: "วันที่", type: "date" },
      ]}
    />
  )
}
