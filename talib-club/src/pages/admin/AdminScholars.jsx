import { DEFAULT_TAXONOMY, SCHOLARS } from "../../data/index.js"
import { useTaxonomySettings } from "../../lib/contentStore.js"
import AdminDraftList from "./AdminDraftList.jsx"

export default function AdminScholars() {
  const { taxonomy } = useTaxonomySettings(DEFAULT_TAXONOMY)
  return (
    <AdminDraftList
      title="รายชื่ออุลามาอฺ"
      collectionName="scholars"
      initialItems={SCHOLARS}
      emptyItem={{
        name: "",
        hijri: "",
        ad: "",
        era: taxonomy.scholarEras?.[0]?.id || "1",
        field: taxonomy.scholarFields?.[0] || "",
        note: "",
        refs: "",
      }}
      fields={[
        { key: "name", label: "ชื่ออุลามาอฺ" },
        { key: "hijri", label: "ปีฮิจเราะห์" },
        { key: "ad", label: "ปีคริสต์ศักราช" },
        { key: "era", label: "ยุค", type: "select", options: (taxonomy.scholarEras || []).map(item => ({ value: item.id, label: item.label })) },
        { key: "field", label: "สาขาความรู้", type: "select", options: taxonomy.scholarFields || [] },
        { key: "note", label: "ประวัติ/หมายเหตุ", type: "textarea", rows: 5 },
        { key: "refs", label: "ลิงก์อ้างอิง" },
      ]}
    />
  )
}
