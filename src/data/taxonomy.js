import { ARTICLE_CATEGORIES, ARTICLE_TYPES, SERIES } from "./articles.js"
import { BOOK_TYPES } from "./books.js"

export const DEFAULT_TAXONOMY = {
  articleCategories: ARTICLE_CATEGORIES.filter(item => item.id !== "all"),
  articleTypes: ARTICLE_TYPES.filter(item => item.id !== "all"),
  articleSeries: SERIES,
  bookTypes: BOOK_TYPES,
  bookSources: ["Talib Club", "สำนักพิมพ์อื่น"],
  mediaTypes: ["youtube", "spotify", "video"],
  scholarEras: [
    { id: "1", label: "ยุคแรก (Salaf)" },
    { id: "2", label: "ยุคกลาง" },
    { id: "3", label: "ยุคฟื้นฟู" },
    { id: "4", label: "ยุคปัจจุบัน" },
  ],
  scholarFields: ["อากีดะฮ์", "ฟิกฮ์", "หะดีษ", "ตัฟซีร", "ประวัติศาสตร์", "ภาษาอาหรับ"],
}
