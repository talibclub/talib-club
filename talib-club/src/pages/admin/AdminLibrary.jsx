import { BOOKS, DEFAULT_TAXONOMY } from "../../data/index.js"
import { useTaxonomySettings } from "../../lib/contentStore.js"
import AdminDraftList from "./AdminDraftList.jsx"

export default function AdminLibrary() {
  const { taxonomy } = useTaxonomySettings(DEFAULT_TAXONOMY)
  return (
    <AdminDraftList
      title="หนังสือและ PDF"
      collectionName="books"
      initialItems={BOOKS}
      emptyItem={{
        title: "",
        author: "Talib Club",
        source: "Talib Club",
        type: taxonomy.bookTypes?.[0] || "",
        category: "",
        year: new Date().getFullYear() + 543,
        fileUrl: "",
        coverUrl: "",
        desc: "",
      }}
      fields={[
        { key: "title", label: "ชื่อหนังสือ" },
        { key: "author", label: "ผู้เขียน/ผู้จัดทำ" },
        { key: "source", label: "แหล่งที่มา", type: "select", options: taxonomy.bookSources || [] },
        { key: "type", label: "ประเภท", type: "select", options: taxonomy.bookTypes || [] },
        { key: "category", label: "หมวดหมู่" },
        { key: "year", label: "ปี", type: "number" },
        { key: "fileUrl", label: "ลิงก์ไฟล์ PDF/Drive" },
        { key: "coverUrl", label: "ลิงก์รูปปก" },
        { key: "desc", label: "คำอธิบาย", type: "textarea", rows: 4 },
      ]}
    />
  )
}
